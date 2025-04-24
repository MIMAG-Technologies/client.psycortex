"use client";

import { useState, useEffect } from "react";
import { FaCalendarAlt, FaClipboardCheck, FaExclamationCircle, FaChevronLeft, FaChevronRight, FaUserMd, FaClock, FaAngleRight } from "react-icons/fa";
import { HistoryItem } from "@/utils/userTypes";
import { getAllUserTestData } from "@/utils/test";
import { ReferredTest } from "@/types/test";

interface SummarySectionProps {
  userId: string;
  stats: any;
  extractUserSessionHistory: (userId: string) => Promise<HistoryItem[]>;
}

export default function SummarySection({ 
  userId, 
  stats, 
  extractUserSessionHistory, 
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
          getAllUserTestData(userId)
        ]);
        
        setSessionHistory(history);
        setReferredTests(tests.referredTests.filter(test => test.payment.status === "pending"));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId, extractUserSessionHistory]);

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
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#642494] to-[#8a35c9] rounded-2xl shadow-lg">
        <div className="absolute right-0 top-0 w-48 h-48 opacity-10">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M42.7,-62.9C55.9,-54.8,67.4,-42.5,73.5,-27.9C79.6,-13.3,80.3,3.6,75.2,18.3C70.1,33,59.1,45.7,45.9,54.9C32.6,64.1,16.3,69.9,0.1,69.8C-16.2,69.6,-32.3,63.5,-45,53.4C-57.7,43.2,-66.9,28.9,-71.2,12.7C-75.5,-3.5,-74.9,-21.7,-67.1,-35.9C-59.3,-50.1,-44.3,-60.2,-29.4,-67.6C-14.5,-75,-7.3,-79.6,4,-83.5C15.2,-87.5,30.5,-90.8,42.7,-62.9Z" transform="translate(100 100)" />
          </svg>
        </div>
        <div className="relative p-6 md:p-8 text-white z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
          <p className="opacity-80 mb-4">Stay up to date with your mental health journey</p>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <div className="font-bold text-2xl">{stats.counselling.total + stats.chat.total + stats.call.total + stats.offline.total}</div>
              <div className="text-sm text-white/80">Total Sessions</div>
            </div>
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <div className="font-bold text-2xl">{stats.tests.completed}</div>
              <div className="text-sm text-white/80">Tests Completed</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Total Sessions" 
          value={stats.counselling.total + stats.chat.total + stats.call.total + stats.offline.total}
          icon={<FaCalendarAlt className="text-white" />}
          description="Total sessions across all types"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          textColor="text-white"
        />
        <SummaryCard 
          title="Completed Tests" 
          value={stats.tests.completed} 
          icon={<FaClipboardCheck className="text-white" />}
          description="Tests you have completed"
          color="bg-gradient-to-br from-green-500 to-green-600"
          textColor="text-white"
        />
        <SummaryCard 
          title="Pending Referrals" 
          value={referredTests.length} 
          icon={<FaExclamationCircle className="text-white" />}
          description="Tests referred to you that need payment"
          color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          textColor="text-white"
        />
      </div>
      
      {/* Calendar and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#642494]/90 to-[#642494] p-4 text-white">
              <h3 className="text-lg font-semibold">Your Calendar</h3>
            </div>
            
            {/* Calendar */}
            <div className="rounded-lg border-0">
              {/* Calendar Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <button 
                  onClick={prevMonth} 
                  className="p-2 rounded-full hover:bg-[#642494]/10 text-[#642494] transition-colors"
                >
                  <FaChevronLeft />
                </button>
                <h4 className="font-medium text-gray-800">{formatMonth(currentMonth)}</h4>
                <button 
                  onClick={nextMonth} 
                  className="p-2 rounded-full hover:bg-[#642494]/10 text-[#642494] transition-colors"
                >
                  <FaChevronRight />
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
                      p-2 h-11 relative
                      ${!isCurrentMonth(date) ? 'text-gray-400' : 'text-gray-800'} 
                      ${isToday(date) ? 'font-bold' : ''} 
                      ${isSelected(date) 
                        ? 'bg-[#642494] text-white rounded-full mx-1.5 my-0.5' 
                        : (hasEvent(date) && isCurrentMonth(date))
                          ? 'hover:bg-[#642494]/10 text-[#642494] font-semibold'
                          : 'hover:bg-gray-100'
                      }
                      transition-colors
                    `}
                  >
                    {date.getDate()}
                    {hasEvent(date) && !isSelected(date) && (
                      <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[#642494] rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
            <div className="bg-gradient-to-r from-[#642494]/90 to-[#642494] p-4 text-white">
              <h3 className="text-lg font-semibold">
                Events on {selectedDate.toLocaleDateString()}
              </h3>
            </div>
            
            <div className="p-4">
              {dateEvents.length > 0 ? (
                <div className="space-y-3">
                  {dateEvents.map((event, index) => (
                    <EventCard key={index} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaClock className="mx-auto text-3xl text-gray-300 mb-3" />
                  <p>No events scheduled for this day</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Referred Tests */}
      {referredTests.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-[#642494]/90 to-[#642494] p-4 text-white">
            <h3 className="text-lg font-semibold">Tests Referred to You</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {referredTests.map((test, index) => (
                <ReferredTestCard key={index} test={test} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ 
  title, 
  value, 
  icon, 
  description,
  color,
  textColor
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  description: string;
  color: string;
  textColor: string;
}) {
  return (
    <div className={`rounded-xl shadow-md overflow-hidden ${color}`}>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`text-lg font-semibold ${textColor}`}>{title}</h3>
            <p className={`text-sm mt-1 ${textColor} opacity-80`}>{description}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/20">
            {icon}
          </div>
        </div>
        <div className={`text-3xl font-bold mt-4 ${textColor}`}>{value}</div>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: HistoryItem }) {
  const getEventColor = () => {
    switch (event.mode) {
      case 'call':
        return 'border-blue-500 bg-blue-50';
      case 'chat':
        return 'border-green-500 bg-green-50';
      case 'video':
        return 'border-purple-500 bg-purple-50';
      case 'in_person':
        return 'border-orange-500 bg-orange-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getEventTitle = () => {
    switch (event.mode) {
      case 'call':
        return 'Phone Session';
      case 'chat':
        return 'Chat Session';
      case 'video':
        return 'Video Session';
      case 'in_person':
        return 'In-person Session';
      default:
        return 'Session';
    }
  };

  return (
    <div className={`border-l-4 rounded-r-lg p-3 ${getEventColor()} transition-transform hover:scale-[1.02]`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{getEventTitle()}</h4>
          <p className="text-sm text-gray-600">
            {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="text-xs px-2 py-1 bg-white/70 rounded text-gray-700 backdrop-blur-sm">
          Scheduled
        </div>
      </div>
      <div className="mt-2 flex items-center text-sm text-gray-600">
        <FaUserMd className="mr-1" /> {event.counsellorName}
      </div>
    </div>
  );
}

function ReferredTestCard({ test }: { test: ReferredTest }) {
  return (
    <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 flex justify-between items-center transition-colors hover:bg-yellow-100">
      <div>
        <h4 className="font-medium text-gray-800">{test.test.name}</h4>
        <p className="text-sm text-gray-600">Referred by: {test.referredBy?.name || 'Unknown Expert'}</p>
      </div>
      <a 
        href={`/tests?opentest=${test.test.slug}`}
        className="flex items-center text-[#642494] hover:underline font-medium text-sm"
      >
        Make Payment <FaAngleRight className="ml-1" />
      </a>
    </div>
  );
} 