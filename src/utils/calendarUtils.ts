import { HistoryItem } from './userTypes';

/**
 * Format sessions into calendar events
 * @param sessions Array of session history items
 * @returns Formatted calendar events
 */
export const formatSessionsToCalendarEvents = (sessions: HistoryItem[]): CalendarEvent[] => {
  return sessions.map(session => {
    const sessionDate = new Date(session.date);
    
    // Create title based on session mode
    const modeTitle = {
      'call': 'Call Session',
      'chat': 'Chat Session',
      'video': 'Video Session',
      'in_person': 'In-Person Session'
    }[session.mode];
    
    // Set color based on session mode
    const modeColor = {
      'call': '#4CAF50', // green
      'chat': '#2196F3', // blue
      'video': '#9C27B0', // purple
      'in_person': '#FF9800' // orange
    }[session.mode];
    
    return {
      id: `${session.mode}-${sessionDate.getTime()}`,
      title: modeTitle,
      start: sessionDate,
      end: new Date(sessionDate.getTime() + 60 * 60 * 1000), // Assume 1 hour
      allDay: false,
      backgroundColor: modeColor,
      borderColor: modeColor,
      mode: session.mode
    };
  });
};

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  mode: string;
} 