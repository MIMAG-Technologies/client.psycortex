"use client";

import { useAuth } from "@/context/AuthContext";
import { useTests } from "@/context/TestContext";
import { ActiveTest, HistoryTest, ReferredTest } from "@/types/test";
import { getAllUserTestData } from "@/utils/test";
import { useEffect, useState } from "react";
import { FaExclamationTriangle, FaCalendarAlt, FaCheckCircle, FaArrowRight, FaUserMd, FaFileAlt } from "react-icons/fa";
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-800"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">My Tests</h2>
      
      {/* Section Selection Bar */}
      <div className="flex mb-6 border-b">
        <button 
          className={`px-4 py-2 font-medium flex items-center gap-2 ${activeSection === 'active' ? 'border-b-2 border-purple-800 text-purple-800' : 'text-gray-600'}`}
          onClick={() => setActiveSection('active')}
        >
          <FaClipboardCheck />
          Active Tests
        </button>
        <button 
          className={`px-4 py-2 font-medium flex items-center gap-2 ${activeSection === 'referred' ? 'border-b-2 border-purple-800 text-purple-800' : 'text-gray-600'}`}
          onClick={() => setActiveSection('referred')}
        >
          <FaUserMd />
          Referred Tests
        </button>
        <button 
          className={`px-4 py-2 font-medium flex items-center gap-2 ${activeSection === 'history' ? 'border-b-2 border-purple-800 text-purple-800' : 'text-gray-600'}`}
          onClick={() => setActiveSection('history')}
        >
          <FaCalendarAlt />
          Test History
        </button>
      </div>

      {/* Active Tests Section */}
      {activeSection === 'active' && (
        <div>
          {activeTests.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No active tests found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTests.map((test) => (
                <div key={test.bookingId} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium capitalize">{getTestName(test.testSlug)}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <FaCalendarAlt className="mr-1" />
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
                      className="bg-purple-800 text-white px-4 py-2 rounded flex items-center"
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
            <div className="text-center py-10 text-gray-500">
              <p>No referred tests found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referredTests.map((test) => (
                <div key={test.bookingId} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium capitalize">{test.test?.name || getTestName(test.testSlug)}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <FaUserMd className="mr-1" />
                        <span>Referred by: {test.referredBy.name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <FaFileAlt className="mr-1" />
                        <span>Status: {test.status}</span>
                      </div>
                    </div>
                    {test.test?.imageUrl && (
                      <img 
                        src={test.test.imageUrl} 
                        alt={test.test.name} 
                        className="w-16 h-16 object-cover rounded"
                      />
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
            <div className="text-center py-10 text-gray-500">
              <p>No test history found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testHistory.map((test) => (
                <div key={test.bookingId} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium capitalize">{getTestName(test.testSlug)}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        {test.status === 'completed' ? (
                          <>
                            <FaCheckCircle className="mr-1 text-green-500" />
                            <span>Completed {test.completedAt ? `on ${formatDate(test.completedAt)}` : ''}</span>
                          </>
                        ) : (
                          <>
                            <FaExclamationTriangle className="mr-1 text-yellow-500" />
                            <span>Expired on {formatDate(test.expiryDate)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 