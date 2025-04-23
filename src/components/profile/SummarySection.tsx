"use client";

import { useState, useEffect } from "react";
import { FaCalendarAlt, FaClipboardCheck, FaExclamationCircle, FaChevronLeft, FaChevronRight, FaUserMd } from "react-icons/fa";
import { HistoryItem, ReferredTest } from "@/utils/userTypes";

interface SummarySectionProps {
  userId: string;
  stats: any;
  extractUserSessionHistory: (userId: string) => Promise<HistoryItem[]>;
  getReferredTests: (userId: string) => Promise<ReferredTest[]>;
}

export default function SummarySection({ 
  userId, 
  stats, 
  extractUserSessionHistory,
  getReferredTests 
}: SummarySectionProps) {
  const [sessionHistory, setSessionHistory] = useState<HistoryItem[]>([]);
  const [referredTests, setReferredTests] = useState<ReferredTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateEvents, setDateEvents] = useState<HistoryItem[]>([]);

  // Fetch session history and referred tests
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [history, tests] = await Promise.all([
          extractUserSessionHistory(userId),
          getReferredTests(userId)
        ]);
        
        setSessionHistory(history);
        setReferredTests(tests.filter(test => test.payment.status === "pending"));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId, extractUserSessionHistory, getReferredTests]);

  // Update date events when selected date changes
  useEffect(() => {
    const eventsOnDate = sessionHistory.filter(item => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getDate() === selectedDate.getDate() &&
        itemDate.getMonth() === selectedDate.getMonth() &&
        itemDate.getFullYear() === selectedDate.getFullYear()
      );
    });
    
    setDateEvents(eventsOnDate);
  }, [selectedDate, sessionHistory]);

  // Generate calendar days for current month
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week of the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    const days: Date[] = [];
    
    // Add days from previous month
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add days from next month to complete the grid (6 rows x 7 columns = 42 days)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    setCalendarDays(days);
  }, [currentMonth]);

  // Check if a date has events
  const hasEvent = (date: Date) => {
    return sessionHistory.some(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Go to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Go to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Format date for display
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Determine if a date is in the current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  // Determine if a date is selected
  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Determine if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#642494]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard 
          title="Total Sessions" 
          value={stats.counselling.total + stats.chat.total + stats.call.total + stats.offline.total}
          icon={<FaCalendarAlt className="text-[#642494]" />}
          description="Total sessions across all types"
        />
        <SummaryCard 
          title="Completed Tests" 
          value={stats.tests.completed} 
          icon={<FaClipboardCheck className="text-green-500" />}
          description="Tests you have completed"
        />
        <SummaryCard 
          title="Pending Referrals" 
          value={referredTests.length} 
          icon={<FaExclamationCircle className="text-yellow-500" />}
          description="Tests referred to you that need payment"
        />
      </div>
      
      {/* Calendar and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Your Calendar</h3>
            
            {/* Calendar */}
            <div className="rounded-lg border border-gray-200">
              {/* Calendar Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <button 
                  onClick={prevMonth} 
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <FaChevronLeft className="text-gray-500" />
                </button>
                <h4 className="font-medium">{formatMonth(currentMonth)}</h4>
                <button 
                  onClick={nextMonth} 
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <FaChevronRight className="text-gray-500" />
                </button>
              </div>
              
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 text-center py-2 border-b">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <div key={index} className="text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 text-center">
                {calendarDays.map((date, index) => (
                  <button 
                    key={index} 
                    onClick={() => setSelectedDate(date)}
                    className={`
                      p-2 h-10 relative
                      ${!isCurrentMonth(date) ? 'text-gray-400' : 'text-gray-800'} 
                      ${isToday(date) ? 'font-bold' : ''} 
                      ${isSelected(date) ? 'bg-[#642494]/10' : 'hover:bg-gray-100'}
                    `}
                  >
                    {date.getDate()}
                    {hasEvent(date) && (
                      <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[#642494] rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow p-4 h-full">
            <h3 className="text-lg font-semibold mb-4">
              Events on {selectedDate.toLocaleDateString()}
            </h3>
            
            {dateEvents.length > 0 ? (
              <div className="space-y-3">
                {dateEvents.map((event, index) => (
                  <EventCard key={index} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-10">
                No events scheduled for this date
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Referred Tests */}
      {referredTests.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Referred Tests Requiring Payment</h3>
          <div className="space-y-4">
            {referredTests.map((test) => (
              <ReferredTestCard key={test.bookingId} test={test} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Summary Card Component
function SummaryCard({ 
  title, 
  value, 
  icon, 
  description 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  description: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-[#642494]/10 mr-4">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
      </div>
      <div className="text-3xl font-bold text-[#642494] mt-2">{value}</div>
    </div>
  );
}

// Event Card Component
function EventCard({ event }: { event: HistoryItem }) {
  const getEventColor = () => {
    switch (event.mode) {
      case 'call': return 'bg-green-100 text-green-800';
      case 'chat': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'in_person': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getEventTitle = () => {
    switch (event.mode) {
      case 'call': return 'Call Session';
      case 'chat': return 'Chat Session';
      case 'video': return 'Video Session';
      case 'in_person': return 'In-Person Session';
      default: return 'Session';
    }
  };

  const eventTime = new Date(event.date).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="p-3 rounded-lg border border-gray-200 hover:shadow transition-shadow">
      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getEventColor()}`}>
          {getEventTitle()} 
        </span>
          <FaUserMd/> {event.counsellorName}
        <span className="text-sm text-gray-500">{eventTime}</span>
      </div>
    </div>
  );
}

// Referred Test Card Component
function ReferredTestCard({ test }: { test: ReferredTest }) {
  return (
    <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
      <div className="flex justify-between">
        <div>
          <h4 className="font-medium text-gray-800">{test.test.title}</h4>
          <p className="text-sm text-gray-600 mt-1">
            Referred by: {test.referredBy.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Expires: {new Date(test.expiryDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-bold text-lg">
            {test.payment.currency} {test.payment.amount}
          </span>
          <button 
            className="mt-2 px-4 py-1 bg-[#642494] text-white rounded hover:bg-[#4e1c72] transition-colors text-sm"
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
} 