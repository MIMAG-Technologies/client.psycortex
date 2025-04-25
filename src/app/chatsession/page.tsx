"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatMessage, getChatMessages, sendChatMessage } from "@/utils/chatsession";
import { FaPaperPlane, FaArrowLeft, FaTimes, FaUserFriends } from "react-icons/fa";
import axios from "axios";

type Counsellor = {
  id: string;
  name: string;
  profileImage: string;
  title: string;
};

export default function ChatSessionPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get("id");
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [counsellor, setCounsellor] = useState<Counsellor | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isCouple, setIsCouple] = useState<boolean>(false);
  const [sessionData, setSessionData] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Function to fetch session details
  const fetchSessionDetails = async () => {
    if (!chatId) return;
    
    try {
      const response = await axios.get(
        `${baseUrl}/sessions/get_chat_session.php?id=${chatId}`
      );
      const data = response.data.data;
      setSessionData(data);
      setIsCouple(data.is_couple_session === true);
      
      if (data.counsellor) {
        setCounsellor({
          id: data.counsellor.id,
          name: data.counsellor.name,
          profileImage: data.counsellor.image,
          title: data.counsellor.title
        });
      }
    } catch (err) {
      console.error("Error fetching session details:", err);
    }
  };
  
  // Function to fetch counsellor details
  const fetchCounsellorDetails = async (counsellorId: string) => {
    try {
      const response = await axios.get(
        `${baseUrl}/counsellor/get_counsellor_details.php?counsellorId=${counsellorId}`
      );
      const data = response.data.data;
      setCounsellor({
        id: data.id,
        name: data.personalInfo.name,
        profileImage: data.personalInfo.profileImage,
        title: data.professionalInfo.title
      });
    } catch (err) {
      console.error("Error fetching counsellor details:", err);
    }
  };
  
  // Function to fetch messages
  const fetchMessages = async () => {
    if (!chatId) return;
    
    try {
      const fetchedMessages = await getChatMessages(chatId);
      
      // Check if there are new messages by comparing lengths
      if (fetchedMessages.length > messages.length) {
        // Vibrate device if supported
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(100); // Vibrate for 100ms
        }
      }
      setMessages(fetchedMessages);
      
      // Extract counsellor ID from the first message from counsellor
      const counsellorMessage = fetchedMessages.find(msg => msg.is_counsellor);
      if (counsellorMessage && !counsellor) {
        fetchCounsellorDetails(counsellorMessage.sender_id);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages. Please try again later.");
    }
  };
  
  // Function to calculate time remaining based on session duration
  const calculateTimeRemaining = () => {
    if (!sessionData) return;
    
    const now = new Date().getTime();
    const startTime = sessionData.startedAt 
      ? new Date(sessionData.startedAt).getTime() 
      : new Date(sessionData.scheduledAt).getTime();
    
    // Duration in milliseconds - 45 minutes for individual, 90 minutes for couple
    const sessionDuration = isCouple ? 90 * 60 * 1000 : 45 * 60 * 1000;
    const endTime = startTime + sessionDuration;
    
    // If the session has ended
    if (now >= endTime) {
      setTimeRemaining("00:00");
      return;
    }
    
    const remainingMs = endTime - now;
    const minutes = Math.floor(remainingMs / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
    
    setTimeRemaining(
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    );
  };
  
  // Initial data fetch
  useEffect(() => {
    if (chatId) {
      fetchSessionDetails();
    }
  }, [chatId]);
  
  // Update timer every second
  useEffect(() => {
    if (!sessionData) return;
    
    calculateTimeRemaining();
    const timerInterval = setInterval(() => {
      calculateTimeRemaining();
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [sessionData, isCouple]);
  
  // Fetch messages on initial load and every 3 seconds
  useEffect(() => {
    if (!chatId || !user) return;
    
    fetchMessages();
    
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [chatId, user]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !chatId || !user) return;
    
    setLoading(true);
    try {
      const success = await sendChatMessage(
        chatId,
        user.uid, 
        messageInput.trim()
      );
      
      if (success) {
        setMessageInput("");
        // Fetch messages immediately after sending to show the new message
        await fetchMessages();
      } else {
        setError("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    router.back();
  };
  
  if (!chatId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">No Chat Session Found</h2>
          <p className="text-gray-700">Please provide a valid chat session ID.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col fixed inset-0 bg-gray-100">
      {/* Chat header */}
      <div className="bg-[#642494] text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="mr-3 p-2 hover:bg-[#4e1c73] rounded-full transition-colors"
          >
            <FaArrowLeft />
          </button>
          
          {counsellor ? (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white mr-3">
                <img 
                  src={counsellor.profileImage ? `${counsellor.profileImage}` : "/user-dummy-img.png"} 
                  alt={counsellor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  {counsellor.name}
                  {isCouple && (
                    <div className="bg-pink-100 text-pink-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                      <FaUserFriends className="mr-1" size={12} />
                      <span>Couple</span>
                    </div>
                  )}
                </h1>
                <p className="text-xs opacity-90">{counsellor.title || "Counsellor"}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#f5edfb] animate-pulse mr-3"></div>
              <div>
                <div className="h-5 w-32 bg-[#f5edfb] animate-pulse rounded"></div>
                <div className="h-3 w-24 bg-[#f5edfb] animate-pulse rounded mt-1"></div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          <div className="bg-white text-[#642494] px-3 py-1 rounded-full font-medium text-sm mr-3">
            Time Remaining: {timeRemaining}
          </div>
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-[#4e1c73] rounded-full transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      </div>
      
      {/* Messages container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto bg-[#f5f5f5]"
      >
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 mb-2">No messages yet.</p>
              <p className="text-[#642494] font-medium">Start the conversation with your counsellor!</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.is_counsellor ? "justify-start" : "justify-end"
                }`}
              >
                <div className={`flex max-w-[80%] ${!msg.is_counsellor && "flex-row-reverse"}`}>
                  {msg.is_counsellor && (
                    <div className="self-end mb-2 mr-2">
                      <div className="w-8 h-8 rounded-full bg-[#f5edfb] text-[#642494] flex items-center justify-center font-bold">
                        {msg.sender_name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.is_counsellor
                        ? "bg-white text-gray-800 rounded-tl-none shadow-sm"
                        : "bg-[#642494] text-white rounded-tr-none shadow-sm"
                    }`}
                  >
                    {msg.message_type === "text" ? (
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    ) : (
                      <div>
                        <div className="rounded-lg overflow-hidden mb-2 border border-gray-200 bg-white">
                          <img 
                            src={msg.media_url ? `${baseUrl}/${msg.media_url}` : ""} 
                            alt="Media attachment" 
                            className="w-full max-h-60 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/image-placeholder.png";
                            }}
                          />
                        </div>
                        {msg.message && <p className="text-sm whitespace-pre-wrap">{msg.message}</p>}
                      </div>
                    )}
                    
                    <span className="text-xs opacity-75 block mt-1 text-right">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  
                  {!msg.is_counsellor && (
                    <div className="self-end mb-2 ml-2">
                      <div className="w-8 h-8 rounded-full bg-[#f5edfb] text-[#642494] flex items-center justify-center font-bold">
                        {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message input */}
      <div className="bg-white shadow-md p-4 border-t border-gray-200">
        <form 
          onSubmit={handleSendMessage}
          className="flex items-center max-w-3xl mx-auto"
        >
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 p-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#642494] focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !messageInput.trim()}
            className={`bg-[#642494] text-white p-3 rounded-r-lg flex items-center justify-center ${
              loading || !messageInput.trim()
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#4e1c73] transition-colors"
            }`}
          >
            <FaPaperPlane className="text-lg" />
          </button>
        </form>
        
        {/* Error display */}
        {error && (
          <div className="max-w-3xl mx-auto mt-2 bg-red-50 text-red-600 p-2 rounded-md text-center text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 