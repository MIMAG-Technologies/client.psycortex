"use client";

import { useState, useEffect } from "react";
import { FaCalendarAlt, FaClipboardCheck, FaExclamationCircle, FaChevronLeft, FaChevronRight, FaUserMd, FaClock, FaAngleRight } from "react-icons/fa";
import { HistoryItem } from "@/utils/userTypes";
import { getAllUserTestData } from "@/utils/test";
import { ReferredTest } from "@/types/test";
import Link from "next/link";

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
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#642494] to-[#8a35c9] rounded-2xl shadow-lg">
        <div className="absolute right-0 top-0 w-48 h-48 opacity-10">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M42.7,-62.9C55.9,-54.8,67.4,-42.5,73.5,-27.9C79.6,-13.3,80.3,3.6,75.2,18.3C70.1,33,59.1,45.7,45.9,54.9C32.6,64.1,16.3,69.9,0.1,69.8C-16.2,69.6,-32.3,63.5,-45,53.4C-57.7,43.2,-66.9,28.9,-71.2,12.7C-75.5,-3.5,-74.9,-21.7,-67.1,-35.9C-59.3,-50.1,-44.3,-60.2,-29.4,-67.6C-14.5,-75,-7.3,-79.6,4,-83.5C15.2,-87.5,30.5,-90.8,42.7,-62.9Z" transform="translate(100 100)" />
          </svg>
        </div>
        <div className="relative p-4 sm:p-6 md:p-8 text-white z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
          <p className="opacity-80 mb-4">Stay up to date with your mental health journey</p>
          
          <div className="flex flex-wrap gap-3 sm:gap-4 mt-4">
            <div className="px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <div className="font-bold text-xl sm:text-2xl">{stats.counselling.total + stats.chat.total + stats.call.total + stats.offline.total}</div>
              <div className="text-xs sm:text-sm text-white/80">Total Sessions</div>
            </div>
            <div className="px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <div className="font-bold text-xl sm:text-2xl">{stats.tests.completed}</div>
              <div className="text-xs sm:text-sm text-white/80">Tests Completed</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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
          className="sm:col-span-2 md:col-span-1"
        />
      </div>
      
      {/* Calendar and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#642494]/90 to-[#642494] p-3 sm:p-4 text-white">
              <h3 className="text-base sm:text-lg font-semibold">Your Calendar</h3>
            </div>
            
            {/* Calendar */}
            <div className="rounded-lg border-0">
              {/* Calendar Header */}
              <div className="flex justify-between items-center p-3 sm:p-4 border-b">
                <button 
                  onClick={prevMonth} 
                  className="p-1 sm:p-2 rounded-full hover:bg-[#642494]/10 text-[#642494] transition-colors"
                >
                  <FaChevronLeft />
                </button>
                <h4 className="font-medium text-sm sm:text-base text-gray-800">{formatMonth(currentMonth)}</h4>
                <button 
                  onClick={nextMonth} 
                  className="p-1 sm:p-2 rounded-full hover:bg-[#642494]/10 text-[#642494] transition-colors"
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
              <div className="grid grid-cols-7 gap-px p-2">
                {calendarDays.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      aspect-square p-1 sm:p-2 flex flex-col items-center justify-center text-xs sm:text-sm rounded-full mx-auto
                      ${!isCurrentMonth(date) ? 'text-gray-400' : 'text-gray-800'}
                      ${isSelected(date) ? 'bg-[#642494] text-white' : ''}
                      ${isToday(date) && !isSelected(date) ? 'border border-[#642494] text-[#642494]' : ''}
                      ${hasEvent(date) && !isSelected(date) ? 'font-semibold' : ''}
                      hover:bg-[#642494]/10 transition-colors
                    `}
                  >
                    <span className="text-center">{date.getDate()}</span>
                    {hasEvent(date) && !isSelected(date) && (
                      <div className={`h-1 w-1 rounded-full mt-0.5 ${isSelected(date) ? 'bg-white' : 'bg-[#642494]'}`}></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Events for Selected Date */}
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
      
      {/* Referred Tests Section */}
      {referredTests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Referred Tests</h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {referredTests.map((test, index) => (
              <ReferredTestCard key={index} test={test} />
            ))}
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
  textColor,
  className = ''
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  description: string;
  color: string;
  textColor: string;
  className?: string;
}) {
  return (
    <div className={`${color} ${textColor} rounded-xl shadow-md p-4 sm:p-6 ${className}`}>
      <div className="flex items-start">
        <div className="rounded-full bg-white/20 p-2 sm:p-3 mr-3">
          {icon}
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold">{title}</h3>
          <p className="text-sm opacity-80 mb-2">{description}</p>
          <div className="text-2xl sm:text-3xl font-bold mt-1">{value}</div>
        </div>
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
            {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
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
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-purple-100">
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-3 text-white">
        <h3 className="font-semibold text-base sm:text-lg truncate">{test.test.name}</h3>
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
          {test.test.shortDescription}
        </p>
        <div className="flex justify-between items-center">
          <div className="text-xs sm:text-sm">
            <span className="font-semibold text-purple-700">
              {test.test.pricing.currency}{test.test.pricing.amount}
            </span>
          </div>
          <Link
            href={`/tests?opentest=${test.test.slug}`}
            className="px-3 py-1.5 bg-gradient-to-r from-[#642494] to-[#8a35c9] text-white rounded-md text-xs sm:text-sm flex items-center">
            Pay Now <FaAngleRight className="ml-1" />
          </Link>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
          <div className="bg-gray-100 p-1 rounded-full">
            <FaUserMd className="text-gray-400" size={12} />
          </div>
          <span>Referred by: {test.referredBy.name}</span>
        </div>
      </div>
    </div>
  );
} 