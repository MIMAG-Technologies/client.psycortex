"use client";

import { useAuth } from "@/context/AuthContext";
import { useTests } from "@/context/TestContext";
import { ActiveTest, HistoryTest, ReferredTest } from "@/types/test";
import { getAllUserTestData } from "@/utils/test";
import { useEffect, useState } from "react";
import { FaExclamationTriangle, FaCalendarAlt, FaCheckCircle, FaArrowRight, FaUserMd, FaFileAlt, FaHourglassHalf, FaClock } from "react-icons/fa";
import Link from "next/link";
import { FaClipboardCheck } from "react-icons/fa6";

export default function TestsPage() {
  const { user } = useAuth();
  const { testsData, isLoading: testsLoading } = useTests();
  const [activeTests, setActiveTests] = useState<ActiveTest[]>([]);
  const [testHistory, setTestHistory] = useState<HistoryTest[]>([]);
  const [referredTests, setReferredTests] = useState<ReferredTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'active' | 'referred' | 'history'>('active');

  // If user not available (handled by layout)
  if (!user) {
    return null;
  }

  const fetchTestData = async () => {
    try {
      const data = await getAllUserTestData(user.uid);
      setActiveTests(data.activeTests);
      setReferredTests(data.referredTests);
      setTestHistory(data.historyTests);
    } catch (error) {
      console.error("Error fetching test data:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchTestData();
      setLoading(false);
    };
    
    loadData();
  }, [user.uid]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTestName = (slug: string): string => {
    return testsData[slug]?.name || slug.replace(/-/g, ' ');
  };

  if (loading || testsLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#642494]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-[#642494]/90 to-[#642494] p-4 text-white">
        <h2 className="text-xl font-semibold">My Tests</h2>
      </div>
      
      {/* Section Selection Bar */}
      <div className="flex border-b bg-gradient-to-r from-[#642494]/5 to-[#642494]/10">
        <button 
          className={`px-6 py-4 font-medium flex items-center gap-2 transition-all ${
            activeSection === 'active' 
              ? 'border-b-2 border-[#642494] text-[#642494] font-semibold bg-white' 
              : 'text-gray-600 hover:text-[#642494] hover:bg-white/50'
          }`}
          onClick={() => setActiveSection('active')}
        >
          <FaClipboardCheck />
          Active Tests
        </button>
        <button 
          className={`px-6 py-4 font-medium flex items-center gap-2 transition-all ${
            activeSection === 'referred' 
              ? 'border-b-2 border-[#642494] text-[#642494] font-semibold bg-white' 
              : 'text-gray-600 hover:text-[#642494] hover:bg-white/50'
          }`}
          onClick={() => setActiveSection('referred')}
        >
          <FaUserMd />
          Referred Tests
        </button>
        <button 
          className={`px-6 py-4 font-medium flex items-center gap-2 transition-all ${
            activeSection === 'history' 
              ? 'border-b-2 border-[#642494] text-[#642494] font-semibold bg-white' 
              : 'text-gray-600 hover:text-[#642494] hover:bg-white/50'
          }`}
          onClick={() => setActiveSection('history')}
        >
          <FaCalendarAlt />
          Test History
        </button>
      </div>

      <div className="p-6">
        {/* Active Tests Section */}
        {activeSection === 'active' && (
          <div>
            {activeTests.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-500 py-10">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FaClipboardCheck className="text-gray-300 text-2xl" />
                </div>
                <p>No active tests found.</p>
                <Link 
                  href="/tests" 
                  className="mt-4 text-[#642494] hover:underline font-medium flex items-center"
                >
                  Browse available tests <FaArrowRight className="ml-1.5 text-xs" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTests.map((test) => (
                  <div key={test.bookingId} className="border rounded-lg p-5 hover:bg-gray-50 transition-colors shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-lg capitalize text-gray-800">{getTestName(test.testSlug)}</h3>
                        <div className="flex items-center text-sm text-gray-600 mt-2 bg-[#642494]/5 px-3 py-1 rounded-full">
                          <FaHourglassHalf className="mr-1.5 text-[#642494]" />
                          <span>
                            {test.daysRemaining !== null 
                              ? `${test.daysRemaining} days remaining` 
                              : 'No expiration'} 
                            {test.expiryDate && ` • Expires on ${formatDate(test.expiryDate)}`}
                          </span>
                        </div>
                      </div>
                      <Link 
                        href={`/test-preparation?slug=${test.testSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-[#642494] to-[#7a2db5] text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center"
                      >
                        Start Test <FaArrowRight className="ml-2" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Referred Tests Section */}
        {activeSection === 'referred' && (
          <div>
            {referredTests.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-500 py-10">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FaUserMd className="text-gray-300 text-2xl" />
                </div>
                <p>No referred tests found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {referredTests.map((test) => (
                  <div key={test.bookingId} className="border rounded-lg p-5 hover:bg-gray-50 transition-colors shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg capitalize text-gray-800">{test.test?.name || getTestName(test.testSlug)}</h3>
                        <div className="flex flex-wrap gap-y-2 mt-2">
                          <div className="flex items-center text-sm text-gray-600 bg-[#642494]/5 px-3 py-1 rounded-full mr-2">
                            <FaUserMd className="mr-1.5 text-[#642494]" />
                            <span>Referred by: {test.referredBy.name}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 bg-[#642494]/5 px-3 py-1 rounded-full">
                            <FaFileAlt className="mr-1.5 text-[#642494]" />
                            <span>Status: {test.status}</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Link 
                            href={`/tests?opentest=${test.testSlug}`}
                            className="text-[#642494] hover:underline font-medium flex items-center"
                          >
                            Make Payment <FaArrowRight className="ml-1.5 text-xs" />
                          </Link>
                        </div>
                      </div>
                      {test.test?.imageUrl && (
                        <div className="ml-4">
                          <img 
                            src={test.test.imageUrl} 
                            alt={test.test.name} 
                            className="w-20 h-20 object-cover rounded-lg shadow-sm border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Test History Section */}
        {activeSection === 'history' && (
          <div>
            {testHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-500 py-10">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FaClock className="text-gray-300 text-2xl" />
                </div>
                <p>No test history found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {testHistory.map((test) => (
                  <div key={test.bookingId} className="border rounded-lg p-5 hover:bg-gray-50 transition-colors shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-lg capitalize text-gray-800">{getTestName(test.testSlug)}</h3>
                        {test.status === 'completed' ? (
                          <div className="flex items-center text-sm text-green-700 mt-2 bg-green-50 px-3 py-1 rounded-full">
                            <FaCheckCircle className="mr-1.5" />
                            <span>Completed {test.completedAt ? `on ${formatDate(test.completedAt)}` : ''}</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-sm text-orange-700 mt-2 bg-orange-50 px-3 py-1 rounded-full">
                            <FaExclamationTriangle className="mr-1.5" />
                            <span>Expired on {formatDate(test.expiryDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 