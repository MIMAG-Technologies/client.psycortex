"use client";

import React, { useState, useEffect } from 'react';
import { FaCircle, FaVideo, FaPhoneAlt, FaComments, FaUserFriends, FaExternalLinkAlt } from 'react-icons/fa';
import { CallSession, ChatSession, VideoSession, OfflineSession } from "@/utils/userTypes";
import { getUserCallSessions, getUserChatSessions, getUserVideoSessions, getUserOfflineSessions } from "@/utils/user";
import { useRouter } from 'next/navigation';
interface SessionHistoryProps {
  userId: string;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ userId }) => {
  const [callSessions, setCallSessions] = useState<CallSession[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
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
        
        // Check if the session just became ready (within last 5 seconds)
        if (timeRemaining <= 0 && timeRemaining > -5000 && 
            ('actions' in session && !session.actions?.canJoin)) {
          readySessionIds.push(session.id);
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
    router.push(`/chatsession?id=${sessionId}`);
  };

  const renderSessionCard = (session: CallSession | ChatSession | VideoSession | OfflineSession) => {
    const scheduledDate = 'scheduledAt' in session ? session.scheduledAt : session.scheduled_at;
    const now = new Date().getTime();
    const sessionTime = new Date(scheduledDate).getTime();
    const timeRemaining = sessionTime - now;
    
    const isUpcoming = timeRemaining > 0;
    const isJoinable = 'actions' in session && session.actions.canJoin;
    const isExpired = session.status === 'expired';
    const isCouple = 'is_couple_session' in session && session.is_couple_session;

    return (
      <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors shadow-sm">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {session.counsellor && <img src={session.counsellor.image} alt={session.counsellor.name} className="w-12 h-12 rounded-full mr-3 object-cover border-2 border-[#642494]/20" />}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{session.counsellor?.name}</h3>
                {isCouple && (
                  <div className="bg-pink-100 text-pink-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                    <FaUserFriends className="mr-1" size={12} />
                    <span>Couple ({isCouple ? '90min' : '45min'})</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">{formatDate(scheduledDate)} at {formatTime(scheduledDate)}</p>
              <div className="text-sm text-gray-500 mt-1 flex items-center">
                <span className={`w-2 h-2 rounded-full mr-1.5 ${
                  session.status === 'scheduled' ? 'bg-green-500' : 
                  session.status === 'expired' ? 'bg-red-500' : 
                  session.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                }`}></span>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </div>
            </div>
          </div>
          <div className="text-right">
            {activeMode === 'call' && (
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-300 transition-colors flex items-center justify-center" disabled>
                Download our app to access this feature
              </button>
            )}
            {activeMode === 'video' && (
              isJoinable ? (
                <button 
                  onClick={() => 'meetLink' in session ? handleJoinVideoSession(session as VideoSession) : null}
                  className="bg-[#642494] text-white px-4 py-2 rounded-md shadow-sm hover:bg-[#4e1c72] transition-colors flex items-center justify-center"
                >
                  <FaExternalLinkAlt className="mr-2" /> Join Meeting
                </button>
              ) : isExpired ? (
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md shadow-sm flex items-center justify-center" disabled>
                  Session Expired
                </button>
              ) : timeRemaining <= 0 ? (
                <button 
                  onClick={() => handleJoinVideoSession(session as VideoSession)} 
                  className="bg-[#642494] text-white px-4 py-2 rounded-md shadow-sm hover:bg-[#4e1c72] transition-colors flex items-center justify-center"
                >
                  <FaExternalLinkAlt className="mr-2" /> Join Meeting
                </button>
              ) : (
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md shadow-sm flex items-center justify-center" disabled>
                  {countdown[session.id] || 'Upcoming'}
                </button>
              )
            )}
            {activeMode === 'chat' && (
              isJoinable ? (
                <button 
                  onClick={() => handleJoinChatSession(session.id)} 
                  className="bg-[#642494] text-white px-4 py-2 rounded-md shadow-sm hover:bg-[#4e1c72] transition-colors flex items-center justify-center"
                >
                  <FaComments className="mr-2" /> Join Chat
                </button>
              ) : isExpired ? (
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md shadow-sm flex items-center justify-center" disabled>
                  Session Expired
                </button>
              ) : timeRemaining <= 0 ? (
                <button 
                  onClick={() => handleJoinChatSession(session.id)} 
                  className="bg-[#642494] text-white px-4 py-2 rounded-md shadow-sm hover:bg-[#4e1c72] transition-colors flex items-center justify-center"
                >
                  <FaComments className="mr-2" /> Join Chat
                </button>
              ) : (
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md shadow-sm flex items-center justify-center" disabled>
                  {countdown[session.id] || 'Upcoming'}
                </button>
              )
            )}
            {activeMode === 'in_person' && (
              isExpired ? (
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md shadow-sm flex items-center justify-center" disabled>
                  Session Expired
                </button>
              ) : (
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md shadow-sm flex items-center justify-center" disabled>
                  {countdown[session.id] || 'Upcoming'}
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
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    );
  }

  const sessions = activeMode === 'call' ? callSessions : activeMode === 'chat' ? chatSessions : activeMode === 'video' ? videoSessions : offlineSessions;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-[#642494]/90 to-[#642494] p-4 text-white">
        <h2 className="text-xl font-semibold">Session History</h2>
      </div>
      
      <div className="p-6">
        <div className="flex flex-wrap justify-around w-full mb-6 gap-2">
          <button 
            onClick={() => setActiveMode('chat')} 
            className={`px-4 py-2 flex justify-center gap-1 items-center flex-1 ${
              activeMode === 'chat' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } rounded-md transition-colors`}
          >
            <FaComments/> Chat
          </button>
          <button 
            onClick={() => setActiveMode('video')} 
            className={`px-4 py-2 flex justify-center gap-1 items-center flex-1 ${
              activeMode === 'video' 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } rounded-md transition-colors`}
          >
            <FaVideo/> Video
          </button>
          <button 
            onClick={() => setActiveMode('in_person')} 
            className={`px-4 py-2 flex justify-center gap-1 items-center flex-1 ${
              activeMode === 'in_person' 
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } rounded-md transition-colors`}
          >
            <FaUserFriends/> In-Person
          </button>
          <button 
            onClick={() => setActiveMode('call')} 
            className={`px-4 py-2 flex justify-center gap-1 items-center flex-1 ${
              activeMode === 'call' 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } rounded-md transition-colors`}
          >
            <FaPhoneAlt/> Call
          </button>
        </div>
        
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 py-10">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {getModeIcon(activeMode)}
            </div>
            <p>No {activeMode.replace('_', ' ')} sessions found</p>
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