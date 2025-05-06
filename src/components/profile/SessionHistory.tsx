"use client";

import React, { useState, useEffect } from 'react';
import { FaCircle, FaVideo, FaPhoneAlt, FaComments, FaUserFriends, FaExternalLinkAlt } from 'react-icons/fa';
import { CallSession, ChatSession as ImportedChatSession, VideoSession, OfflineSession } from "@/utils/userTypes";
import { getUserCallSessions, getUserChatSessions, getUserVideoSessions, getUserOfflineSessions } from "@/utils/user";
import { useRouter } from 'next/navigation';

interface SessionHistoryProps {
  userId: string;
}

// Define the types for each session mode
interface BaseSession {
  id: string;
  status: string;
  counsellor?: {
    id: string;
    name: string;
    image: string;
  };
}

interface SessionWithScheduledAt extends BaseSession {
  scheduledAt: string;
}


const SessionHistory: React.FC<SessionHistoryProps> = ({ userId }) => {
  const [callSessions, setCallSessions] = useState<CallSession[]>([]);
  const [chatSessions, setChatSessions] = useState<ImportedChatSession[]>([]);
  const [videoSessions, setVideoSessions] = useState<VideoSession[]>([]);
  const [offlineSessions, setOfflineSessions] = useState<OfflineSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<'call' | 'chat' | 'video' | 'in_person'>('chat');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<{[key: string]: string}>({});
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const [calls, chats, videos, offline] = await Promise.all([
          getUserCallSessions(userId),
          getUserChatSessions(userId),
          getUserVideoSessions(userId),
          getUserOfflineSessions(userId)
        ]);
        setCallSessions(calls.map(session => ({
          ...session,
          mode: 'call' as const,
          counsellorId: session.counsellor.id,
          counsellor: {
            ...session.counsellor,
            avatar: session.counsellor.image,
            specialization: session.counsellor.title
          },
        })));
        setChatSessions(chats.map(session => ({
          ...session,
          mode: 'chat' as const,
          counsellorId: session.counsellor.id,
          counsellor: {
            ...session.counsellor,
            avatar: session.counsellor.image,
            specialization: session.counsellor.title
          },
          review: session.review ? { rating: session.review.rating, feedback: session.review.feedback } : null
        })));
        setVideoSessions(videos.map(session => ({
          ...session,
          mode: 'video',
          counsellorId: session.counsellor.id,
          counsellor: {
            ...session.counsellor,
            avatar: session.counsellor.image,
            specialization: session.counsellor.title
          },
          review: session.review ? { rating: session.review.rating, comment: session.review.comment } : null
        })));
        setOfflineSessions(offline.map(session => ({
          ...session,
          mode: 'in_person',
          counsellorId: session.counsellor ? session.counsellor.id : '',
          counsellor: session.counsellor ? {
            ...session.counsellor,
            avatar: session.counsellor.image,
            specialization: session.counsellor.title
          } : undefined,
          scheduledAt: session.scheduled_at || '',
          duration: session.duration_minutes || 0
        })));

        console.log(chats);
        
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load sessions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [userId]);

  useEffect(() => {
    // Create countdown timers for upcoming sessions
    const interval = setInterval(() => {
      const now = new Date().getTime();
      
      const allSessions = [...callSessions, ...chatSessions, ...videoSessions, ...offlineSessions];
      const updatedCountdowns: {[key: string]: string} = {};
      
      let readySessionIds: string[] = [];
      
      allSessions.forEach(session => {
        const scheduledAt = 'scheduledAt' in session ? session.scheduledAt : session.scheduled_at;
        const scheduledTime = new Date(scheduledAt).getTime();
        const timeRemaining = scheduledTime - now;
        
        // Reload if session is starting within 5 seconds
        if (timeRemaining > 0 && timeRemaining <= 1000) {
            window.location.reload();
            return;
        }
        
        if (timeRemaining > 0) {
          const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
          
          // More than 24 hours
          if (days > 0) {
            updatedCountdowns[session.id] = `Join in ${days} day${days !== 1 ? 's' : ''}`;
          } 
          // Between 1 and 24 hours
          else if (hours > 0 && minutes >= 0) {
            updatedCountdowns[session.id] = `Join in ${hours} hour${hours !== 1 ? 's' : ''}`;
          } 
          // Between 10 minutes and 1 hour
          else if (minutes >= 10) {
            updatedCountdowns[session.id] = `Join in ${minutes} min`;
          } 
          // Less than 10 minutes
          else {
            updatedCountdowns[session.id] = `Join in ${minutes}m ${seconds}s`;
          }
        } else {
          // If time has expired but we haven't reloaded yet, show it's ready
          updatedCountdowns[session.id] = 'Session Ready';
        }
      });
      
      setCountdown(updatedCountdowns);
      
      // Only reload once when sessions become ready
      if (readySessionIds.length > 0) {
        // Full page reload is simpler and ensures everything is in sync
        window.location.reload();
        return; // Stop execution after triggering reload
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [callSessions, chatSessions, videoSessions, offlineSessions]);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'video':
        return <FaVideo className="text-purple-600" />;
      case 'call':
        return <FaPhoneAlt className="text-green-600" />;
      case 'chat':
        return <FaComments className="text-blue-600" />;
      case 'in_person':
        return <FaUserFriends className="text-orange-600" />;
      default:
        return <FaCircle className="text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleJoinVideoSession = (session: VideoSession) => {
    if (session.meetLink) {
      window.open(session.meetLink, '_blank');
    } else {
      setError("Meeting link is not available");
    }
  };

  const handleJoinChatSession = (sessionId: string) => {
    // For the chat session that exists in the state, find its scheduled time and isCouple status
    const chatSession = chatSessions.find(s => s.id === sessionId);
    
    if (chatSession) {
      // Extract the hour from scheduled time
      const scheduledTime = chatSession.scheduledAt;
      const scheduledHour = new Date(scheduledTime).getHours();
      
      // Format hour as 2 digits (00-23)
      const formattedHour = scheduledHour.toString().padStart(2, '0');
      
      // Add isCouple flag (1 for true, 0 for false)
      const isCouple = Boolean(chatSession.is_couple_session);
      const isCoupleFlag = isCouple ? '1' : '0';
      
      // Create the encoded session ID with the format: [actual chatId][startTime (2 digits)][isCouple (1 digit)]
      const encodedSessionId = `${sessionId}${formattedHour}${isCoupleFlag}`;
      
      router.push(`/chatsession?id=${encodedSessionId}`);
    } else {
      // Fallback to the original behavior if session not found
      router.push(`/chatsession?id=${sessionId}`);
    }
  };

  const renderSessionCard = (session: CallSession | ImportedChatSession | VideoSession | OfflineSession) => {
    const scheduledDate = 'scheduledAt' in session ? session.scheduledAt : session.scheduled_at;
    const now = new Date().getTime();
    const sessionTime = new Date(scheduledDate).getTime();
    const timeRemaining = sessionTime - now;
    
    const isUpcoming = timeRemaining > 0;
    const isJoinable = 'actions' in session && session.actions.canJoin;
    const isExpired = session.status === 'expired';
    const isCouple = 'is_couple_session' in session && session.is_couple_session;

    return (
      <div className="border rounded-lg p-4 sm:p-5 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex items-start">
            {session.counsellor && (
              <img 
                src={session.counsellor.image} 
                alt={session.counsellor.name} 
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mr-3 object-cover border-2 border-[#642494]/20 flex-shrink-0" 
              />
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-sm sm:text-base text-gray-800">{session.counsellor?.name}</h3>
                {isCouple && (
                  <div className="bg-pink-100 text-pink-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                    <FaUserFriends className="mr-1" size={12} />
                    <span>Couple ({isCouple ? '90min' : '45min'})</span>
                  </div>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{formatDate(scheduledDate)} at {formatTime(scheduledDate)}</p>
              <div className="text-xs sm:text-sm mt-1.5 flex items-center">
                <span className={`w-2.5 h-2.5 rounded-full mr-1.5 ${
                  session.status === 'scheduled' ? 'bg-green-500' : 
                  session.status === 'expired' ? 'bg-red-500' : 
                  session.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                }`}></span>
                <span className={`font-medium ${
                  session.status === 'scheduled' ? 'text-green-700' : 
                  session.status === 'expired' ? 'text-red-700' : 
                  session.status === 'completed' ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          <div className="sm:text-right mt-2 sm:mt-0 w-full sm:w-auto self-end sm:self-center">
            {activeMode === 'call' && (
              <button className="w-full sm:w-auto bg-gray-200 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md shadow-sm hover:bg-gray-300 transition-colors flex items-center justify-center text-xs sm:text-sm" disabled>
                <FaPhoneAlt className="mr-1.5" /> Download app to access
              </button>
            )}
            {activeMode === 'video' && (
              isJoinable ? (
                <button 
                  onClick={() => 'meetLink' in session ? handleJoinVideoSession(session as VideoSession) : null}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md shadow-sm hover:from-purple-700 hover:to-purple-800 transition-colors flex items-center justify-center text-xs sm:text-sm"
                >
                  <FaExternalLinkAlt className="mr-1.5" /> Join Meeting
                </button>
              ) : isExpired ? (
                <button className="w-full sm:w-auto bg-gray-200 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md shadow-sm flex items-center justify-center text-xs sm:text-sm" disabled>
                  <FaVideo className="mr-1.5" /> Session Expired
                </button>
              ) : timeRemaining <= 0 ? (
                <button 
                  onClick={() => handleJoinVideoSession(session as VideoSession)} 
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md shadow-sm hover:from-purple-700 hover:to-purple-800 transition-colors flex items-center justify-center text-xs sm:text-sm"
                >
                  <FaExternalLinkAlt className="mr-1.5" /> Join Meeting
                </button>
              ) : (
                <button className="w-full sm:w-auto bg-gray-200 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md shadow-sm flex items-center justify-center text-xs sm:text-sm" disabled>
                  <FaVideo className="mr-1.5" /> {countdown[session.id] || 'Upcoming'}
                </button>
              )
            )}
            {activeMode === 'chat' && (
              isJoinable ? (
                <button 
                  onClick={() => handleJoinChatSession(session.id)} 
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md shadow-sm hover:from-blue-700 hover:to-blue-800 transition-colors flex items-center justify-center text-xs sm:text-sm"
                >
                  <FaComments className="mr-1.5" /> Join Chat
                </button>
              ) : isExpired ? (
                <button className="w-full sm:w-auto bg-gray-200 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md shadow-sm flex items-center justify-center text-xs sm:text-sm" disabled>
                  <FaComments className="mr-1.5" /> Session Expired
                </button>
              ) : timeRemaining <= 0 ? (
                <button 
                  onClick={() => handleJoinChatSession(session.id)} 
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md shadow-sm hover:from-blue-700 hover:to-blue-800 transition-colors flex items-center justify-center text-xs sm:text-sm"
                >
                  <FaComments className="mr-1.5" /> Join Chat
                </button>
              ) : (
                <button className="w-full sm:w-auto bg-gray-200 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md shadow-sm flex items-center justify-center text-xs sm:text-sm" disabled>
                  <FaComments className="mr-1.5" /> {countdown[session.id] || 'Upcoming'}
                </button>
              )
            )}
            {activeMode === 'in_person' && (
              isExpired ? (
                <button className="w-full sm:w-auto bg-gray-200 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md shadow-sm flex items-center justify-center text-xs sm:text-sm" disabled>
                  <FaUserFriends className="mr-1.5" /> Session Expired
                </button>
              ) : (
                <button className="w-full sm:w-auto bg-gray-200 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md shadow-sm flex items-center justify-center text-xs sm:text-sm" disabled>
                  <FaUserFriends className="mr-1.5" /> {countdown[session.id] || 'Upcoming'}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#642494]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg border border-red-200 shadow-sm">
        <p>{error}</p>
      </div>
    );
  }

  const sessions = activeMode === 'call' ? callSessions : activeMode === 'chat' ? chatSessions : activeMode === 'video' ? videoSessions : offlineSessions;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-[#642494]/90 to-[#642494] p-4 sm:p-5 text-white">
        <h2 className="text-xl font-semibold">Session History</h2>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap justify-around w-full mb-6 gap-2">
          <button 
            onClick={() => setActiveMode('chat')} 
            className={`px-3 sm:px-4 py-1.5 sm:py-2 flex justify-center gap-1.5 items-center flex-1 ${
              activeMode === 'chat' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } rounded-md transition-all text-xs sm:text-sm md:text-base`}
          >
            <FaComments className="text-xs sm:text-sm md:text-base"/> Chat
          </button>
          <button 
            onClick={() => setActiveMode('video')} 
            className={`px-3 sm:px-4 py-1.5 sm:py-2 flex justify-center gap-1.5 items-center flex-1 ${
              activeMode === 'video' 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } rounded-md transition-all text-xs sm:text-sm md:text-base`}
          >
            <FaVideo className="text-xs sm:text-sm md:text-base"/> Video
          </button>
          <button 
            onClick={() => setActiveMode('in_person')} 
            className={`px-3 sm:px-4 py-1.5 sm:py-2 flex justify-center gap-1.5 items-center flex-1 ${
              activeMode === 'in_person' 
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } rounded-md transition-all text-xs sm:text-sm md:text-base`}
          >
            <FaUserFriends className="text-xs sm:text-sm md:text-base"/> In-Person
          </button>
          <button 
            onClick={() => setActiveMode('call')} 
            className={`px-3 sm:px-4 py-1.5 sm:py-2 flex justify-center gap-1.5 items-center flex-1 ${
              activeMode === 'call' 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } rounded-md transition-all text-xs sm:text-sm md:text-base`}
          >
            <FaPhoneAlt className="text-xs sm:text-sm md:text-base"/> Call
          </button>
        </div>
        
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 py-10 my-2 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl">
              {getModeIcon(activeMode)}
            </div>
            <p className="text-gray-600">No {activeMode.replace('_', ' ')} sessions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <div key={index}>
                {renderSessionCard(session)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionHistory;