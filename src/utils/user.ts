import axios from "axios";
import { CallSession, ChatSession, HistoryItem, OfflineSession, VideoSession } from "./userTypes";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


/**
 * Generic fetch function to reduce code duplication
 */
async function fetchData<T>(endpoint: string, userId: string): Promise<T[]> {
  try {
    const response = await axios.get(`${BASE_URL}/${endpoint}? ${endpoint.includes('appointments')?'user_id':'userId'}=${userId}`);
    return (endpoint.includes('appointments') ? response.data.appointments : response.data.sessions) || [];
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
}

/**
 * Get user call sessions
 */
export const getUserCallSessions = async (userId: string): Promise<CallSession[]> => {
  return fetchData<CallSession>('user/get_call_sessions.php', userId);
};

/**
 * Get user chat sessions
 */
export const getUserChatSessions = async (userId: string): Promise<ChatSession[]> => {
  return fetchData<ChatSession>('user/get_chat_sessions.php', userId);
};

/**
 * Get user video sessions
 */
export const getUserVideoSessions = async (userId: string): Promise<VideoSession[]> => {
  return fetchData<VideoSession>('user/get_counselling_sessions.php', userId);
};

/**
 * Get user offline (in-person) sessions
 */
export const getUserOfflineSessions = async (userId: string): Promise<OfflineSession[]> => {
  return fetchData<OfflineSession>('user/get_user_appointments.php', userId);
};

/**
 * Extract user session history from all session types
 * @param userId User ID to fetch sessions for
 * @returns Array of session history items
 */
export const extractUserSessionHistory = async (userId: string): Promise<HistoryItem[]> => {
  try {
    // Fetch all session types in parallel
    const [callSessions, chatSessions, videoSessions, offlineSessions] = await Promise.all([
      getUserCallSessions(userId),
      getUserChatSessions(userId),
      getUserVideoSessions(userId),
      getUserOfflineSessions(userId)
    ]);

    // Process call sessions
    const callHistory: HistoryItem[] = callSessions.map(session => ({
      date: session.scheduledAt,
      mode: 'call',
      counsellorName: session.counsellor.name
    }));

    // Process chat sessions
    const chatHistory: HistoryItem[] = chatSessions.map(session => ({
      date: session.scheduledAt,
      mode: 'chat',
      counsellorName: session.counsellor.name
    }));

    // Process video sessions
    const videoHistory: HistoryItem[] = videoSessions.map(session => ({
      date: session.scheduledAt,
      mode: 'video',
      counsellorName: session.counsellor.name
    }));

    // Process offline sessions
    const offlineHistory: HistoryItem[] = offlineSessions.map(session => ({
      date: session.scheduled_at,
      mode: 'in_person',
      counsellorName: session.counsellor ? session.counsellor.name : 'N/A'
    }));

    // Combine all histories and sort by date (most recent first)
    const combinedHistory = [...callHistory, ...chatHistory, ...videoHistory, ...offlineHistory];
    return combinedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error extracting user session history:", error);
    return [];
  }
};
