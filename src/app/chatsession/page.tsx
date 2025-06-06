"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatMessage, getChatMessages, sendChatMessage } from "@/utils/chatsession";
import { FaPaperPlane, FaArrowLeft, FaUserFriends, FaChevronDown } from "react-icons/fa";
import { useCounsellorContext } from "@/context/CounsellorContext";
import { RiCheckDoubleFill } from "react-icons/ri";

type Counsellor = {
  id: string;
  name: string;
  profileImage: string;
  title: string;
};

interface ChatSessionDetails {
  has_more: boolean;
  counsellor?: {
    id: string;
    name: string;
    image: string;
    title: string;
  };
}

export default function ChatSessionPage() {
  const { user } = useAuth();
  const { counsellors } = useCounsellorContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionIdParam = searchParams.get("id");
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Extract info from session ID: [actual chatId][startTime (2 digits)][isCouple (1 digit)]
  const [chatId, setActualChatId] = useState<string>("");
  const [startHour, setStartHour] = useState<number>(0);
  const [isCouple, setIsCouple] = useState<boolean>(false);

  // Messages and pagination
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageLimit, setMessageLimit] = useState<number>(40);
  const [sessionDetails, setSessionDetails] = useState<ChatSessionDetails | null>(null);
  const [isSessionEnded, setIsSessionEnded] = useState<boolean>(false);

  // UI state
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [counsellor, setCounsellor] = useState<Counsellor | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessionIdParam) {
      const sessionIdString = sessionIdParam.toString();
      // Extract the last digit (isCouple flag)
      const isCoupleFlag = sessionIdString.substring(sessionIdString.length - 1);
      // Extract the 2nd and 3rd last digits (start hour)
      const startTimeStr = sessionIdString.substring(sessionIdString.length - 3, sessionIdString.length - 1);
      // Extract the actual chat ID (everything except the last 3 digits)
      const actualChatId = sessionIdString.substring(0, sessionIdString.length - 3);

      setIsCouple(isCoupleFlag === "1");
      setStartHour(parseInt(startTimeStr, 10));
      setActualChatId(actualChatId);
    }
  }, [sessionIdParam]);

  // Function to fetch messages
  const fetchMessages = async () => {
    if (!chatId || isSessionEnded) return;

    try {
      const response = await getChatMessages(chatId, messageLimit);
      const { messages: fetchedMessages, details } = response;

      // Check if there are new messages by comparing lengths
      if (fetchedMessages.length > messages.length) {
        // Vibrate device if supported
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(100); // Vibrate for 100ms
        }
      }

      setMessages(fetchedMessages);
      setSessionDetails(details);

      // Auto-increase limit if there are more messages
      if (details.has_more) {
        setMessageLimit(prevLimit => prevLimit + 10);
      }

      // Try to find counsellor from messages if not already set
      if (!counsellor && fetchedMessages.length > 0 && counsellors.length > 0) {
        const counsellorMessage = fetchedMessages.find(msg => msg.is_counsellor);
        if (counsellorMessage) {
          const foundCounsellor = counsellors.find(c => c.id === counsellorMessage.sender_id);
          if (foundCounsellor) {
            setCounsellor({
              id: foundCounsellor.id,
              name: foundCounsellor.personalInfo.name,
              profileImage: foundCounsellor.personalInfo.profileImage || "/user-dummy-img.png",
              title: foundCounsellor.professionalInfo.title || "Counsellor"
            });
          }
        }
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages. Please try again later.");
    }
  };

  // Add an effect to set counsellor when counsellors are loaded
  useEffect(() => {
    if (!counsellor && counsellors.length > 0 && messages.length > 0) {
      const counsellorMessage = messages.find(msg => msg.is_counsellor);
      if (counsellorMessage) {
        const foundCounsellor = counsellors.find(c => c.id === counsellorMessage.sender_id);
        if (foundCounsellor) {
          setCounsellor({
            id: foundCounsellor.id,
            name: foundCounsellor.personalInfo.name,
            profileImage: foundCounsellor.personalInfo.profileImage || "/user-dummy-img.png",
            title: foundCounsellor.professionalInfo.title || "Counsellor"
          });
        }
      }
    }
  }, [counsellors, messages]);

  // Function to calculate time remaining based on session duration
  const calculateTimeRemaining = () => {
    if (startHour === undefined) return;

    const now = new Date();
    const today = new Date();

    // Set the start time based on the startHour parameter
    const startTime = new Date(today.setHours(startHour, 0, 0, 0));

    // If today's start time is in the future, it might be from yesterday
    if (startTime > now) {
      startTime.setDate(startTime.getDate() - 1);
    }

    // Session duration: 45 minutes for regular, 90 minutes for couple
    const sessionDurationMinutes = isCouple ? 90 : 45;
    const endTime = new Date(startTime.getTime() + sessionDurationMinutes * 60 * 1000);

    // Calculate remaining time
    const remainingMs = endTime.getTime() - now.getTime();

    if (remainingMs <= 0) {
      setTimeRemaining("00:00");
      setIsSessionEnded(true); // Mark session as ended
    } else {
      const minutes = Math.floor(remainingMs / (1000 * 60));
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
      setIsSessionEnded(false); // Mark session as ongoing
    }
  };

  // Update timer every second
  useEffect(() => {
    calculateTimeRemaining();
    const timerInterval = setInterval(() => {
      calculateTimeRemaining();
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [startHour, isCouple]);

  // Fetch messages on initial load and every 3 seconds if session is not ended
  useEffect(() => {
    if (!chatId || !user) return;

    fetchMessages();

    // Only set up the polling interval if the session is not ended
    if (!isSessionEnded) {
      const interval = setInterval(() => {
        fetchMessages();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [chatId, user, counsellors, messageLimit, isSessionEnded]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      // Maintain focus on input after scrolling
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages]);

  // Auto-focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
        // Ensure focus is maintained after state updates
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      } else {
        setError("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
      // Also ensure focus after loading state changes
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (!sessionIdParam) {
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
              <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse mr-3"></div>
              <div>
                <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                <div className="h-3 bg-gray-300 rounded w-16 mt-1 animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center">
          <div className="text-sm bg-white text-purple-700 px-3 py-1 rounded-full font-mono font-medium mr-2">
            {timeRemaining}
          </div>
          <span className="text-xs font-medium mr-1 hidden md:inline">
            {isCouple ? "(90 min session)" : "(45 min session)"}
          </span>
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
                className={`flex ${msg.is_counsellor ? "justify-start" : "justify-end"
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
                    className={`rounded-2xl px-4 py-3 ${msg.is_counsellor
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

                    <div className="flex justify-between items-center mt-1 text-xs opacity-75">
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {!msg.is_counsellor && (
                        <span className="ml-2 flex items-center">
                          {msg.is_read === true ? (
                            <RiCheckDoubleFill className="text-blue-500" size={12} />
                          ) : (
                            <RiCheckDoubleFill className="text-gray-300" size={12} />
                          )}
                        </span>
                      )}
                    </div>
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
            ref={inputRef}
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 p-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#642494] focus:border-transparent"
            disabled={loading || isSessionEnded}
          />
          <button
            type="submit"
            disabled={loading || !messageInput.trim() || isSessionEnded}
            className={`bg-[#642494] text-white p-3 rounded-r-lg flex items-center justify-center ${loading || !messageInput.trim() || isSessionEnded
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-[#4e1c73] transition-colors"
              }`}
          >
            <FaPaperPlane className="text-lg" />
          </button>
        </form>

        {/* Session ended message */}
        {isSessionEnded && (
          <div className="max-w-3xl mx-auto mt-2 bg-gray-100 text-gray-700 p-2 rounded-md text-center text-sm">
            This session has ended. You cannot send more messages.
          </div>
        )}

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