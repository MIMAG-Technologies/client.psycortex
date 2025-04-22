"use client";

import React, { useState, useEffect } from 'react';
import { FaCircle, FaVideo, FaPhoneAlt, FaComments, FaUserFriends } from 'react-icons/fa';
import { CallSession, ChatSession, VideoSession, OfflineSession } from "@/utils/userTypes";
import { getUserCallSessions, getUserChatSessions, getUserVideoSessions, getUserOfflineSessions } from "@/utils/user";

interface SessionHistoryProps {
  userId: string;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ userId }) => {
  const [callSessions, setCallSessions] = useState<CallSession[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [videoSessions, setVideoSessions] = useState<VideoSession[]>([]);
  const [offlineSessions, setOfflineSessions] = useState<OfflineSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<'call' | 'chat' | 'video' | 'in_person'>('call');
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load sessions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [userId]);

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

  const renderSessionCard = (session: CallSession | ChatSession | VideoSession | OfflineSession) => {
    const scheduledDate = 'scheduledAt' in session ? session.scheduledAt : session.scheduled_at;
    const isUpcoming = new Date(scheduledDate) > new Date();
    const isJoinable = 'actions' in session && session.actions.canJoin;
    const isExpired = session.status === 'expired';

    return (
      <div className="border rounded-lg p-4 hover:bg-gray-50">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {session.counsellor && <img src={session.counsellor.image} alt={session.counsellor.name} className="w-12 h-12 rounded-full mr-3" />}
            <div>
              <h3 className="font-medium">{session.counsellor?.name}</h3>
              <p className="text-sm text-gray-600">{formatDate(scheduledDate)} at {formatTime(scheduledDate)}</p>
              <p className="text-sm text-gray-500">Status: {session.status}</p>
            </div>
          </div>
          <div className="text-right">
            {activeMode === 'call' && (
              <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded" disabled>Download our app to access this feature</button>
            )}
            {activeMode === 'video' && (
              isJoinable ? (
                <button className="bg-indigo-600 text-white px-4 py-2 rounded">Join Now</button>
              ) : isExpired ? (
                <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded" disabled>Session Expired</button>
              ) : (
                <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded" disabled>Join in {Math.ceil((new Date(scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days</button>
              )
            )}
            {activeMode === 'chat' && (
              isJoinable ? (
                <button className="bg-indigo-600 text-white px-4 py-2 rounded">Join Now</button>
              ) : isExpired ? (
                <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded" disabled>Session Expired</button>
              ) : (
                <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded" disabled>Join in {Math.ceil((new Date(scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days</button>
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
    <div className="bg-white">
      <h2 className="text-2xl font-semibold mb-6">Session History</h2>
      <div className="flex justify-around w-full mb-6">
        <button onClick={() => setActiveMode('call')} className={`px-4 py-2 mx-1 flex justify-center gap-1 items-center w-1/4 ${activeMode === 'call' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} rounded`}> <FaPhoneAlt/> Call</button>
        <button onClick={() => setActiveMode('chat')} className={`px-4 py-2 mx-1 flex justify-center gap-1 items-center w-1/4 ${activeMode === 'chat' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} rounded`}> <FaComments/> Chat</button>
        <button onClick={() => setActiveMode('video')} className={`px-4 py-2 mx-1 flex justify-center gap-1 items-center w-1/4 ${activeMode === 'video' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} rounded`}> <FaVideo/> Video</button>
        <button onClick={() => setActiveMode('in_person')} className={`px-4 py-2 mx-1 flex justify-center gap-1 items-center w-1/4 ${activeMode === 'in_person' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} rounded`}> <FaUserFriends/> In-Person</button>
      </div>
      {sessions.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>No sessions found</p>
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
  );
};

export default SessionHistory;