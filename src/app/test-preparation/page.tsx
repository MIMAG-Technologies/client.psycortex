'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTests } from '@/context/TestContext';
import { getAllUserTestData } from '@/utils/test';
import { getQuestions } from '@/utils/assesments';
import { FaClipboardList, FaClock, FaExclamationCircle, FaListAlt, FaSignInAlt } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function TestPreparationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { testsData, isLoading: testsLoading } = useTests();
  const testSlug = searchParams.get('slug');

  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [testData, setTestData] = useState<any>(null);
  const [testInfo, setTestInfo] = useState<any>(null);
  const [userTests, setUserTests] = useState<any[]>([]);

  useEffect(() => {
    const checkTestAvailability = async () => {
      if (!testSlug) {
        setError('Test not specified');
        setChecking(false);
        return;
      }

      if (!user) {
        setError('You need to be logged in to take this test');
        setChecking(false);
        return;
      }

      try {
        // Fetch user's tests to check if this test is in their active list
        const userData = await getAllUserTestData(user.uid);
        setUserTests(userData.activeTests);
        
        const isTestActive = userData.activeTests.some(test => test.testSlug === testSlug);
        
        if (!isTestActive) {
          setError('This test is not in your active tests list.');
          setChecking(false);
          return;
        }

        // Fetch test information
        const testData = await getQuestions(testSlug);
        setTestData(testData);
        
        setChecking(false);
      } catch (error) {
        console.error('Error checking test availability:', error);
        setError('Failed to load test data. Please try again later.');
        setChecking(false);
      }
    };

    if (!authLoading && !testsLoading) {
      checkTestAvailability();
    }
  }, [authLoading, testsLoading, testSlug, user]);

  const startTest = () => {
    if (!testSlug || !user) return;
    router.push(`/assesment?slug=${testSlug}`);
  };

  const getTestName = (): string => {
    if (!testSlug) return 'Test';
    return testsData[testSlug]?.name || testSlug.toUpperCase().replace(/-/g, ' ');
  };

  const getTestDescription = (): string => {
    if (!testSlug) return '';
    return testsData[testSlug]?.shortDescription || '';
  };

  if (authLoading || testsLoading || checking) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#642494] mb-4"></div>
        <h2 className="text-xl font-medium text-gray-700">Preparing your test...</h2>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <FaSignInAlt className="text-6xl text-[#642494] mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to take this test. Please login to continue.
          </p>
          <Link
            href={`/login?redirect=/test-preparation?slug=${testSlug}`}
            className="inline-block bg-[#642494] text-white px-6 py-2 rounded-md hover:bg-[#4e1c72] transition-colors"
          >
            Login to Proceed
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <FaExclamationCircle className="text-6xl text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Oops! There's an issue</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/profile/tests"
              className="inline-block bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Go to My Tests
            </Link>
            <Link
              href="/tests"
              className="inline-block bg-[#642494] text-white px-6 py-2 rounded-md hover:bg-[#4e1c72] transition-colors"
            >
              Explore Tests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Ready to start the test
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#642494] p-6 text-white">
          <h1 className="text-2xl font-bold">Ready to Start Your Test</h1>
          <p className="mt-2 opacity-90">
            {getTestName()}
          </p>
        </div>

        <div className="p-6">
          {getTestDescription() && (
            <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
              <p className="text-gray-700">{getTestDescription()}</p>
            </div>
          )}
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Important Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                <div className="flex items-center mb-2">
                  <FaClock className="text-[#642494] mr-2" />
                  <h3 className="font-medium">Duration</h3>
                </div>
                <p className="text-gray-700">
                  {testData?.testInfo?.estimated_time || 
                   testsData[testSlug!]?.details.durationMinutes + " minutes" || 
                   "Please complete the test in one sitting. Your answers are saved as you go."}
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                <div className="flex items-center mb-2">
                  <FaListAlt className="text-[#642494] mr-2" />
                  <h3 className="font-medium">Questions</h3>
                </div>
                <p className="text-gray-700">
                  {testData?.testInfo?.total_questions 
                    ? `This test has ${testData.testInfo.total_questions} questions.` 
                    : testsData[testSlug!]?.details.totalQuestions
                      ? `This test has ${testsData[testSlug!].details.totalQuestions} questions.`
                      : `This test has ${testData?.questions.length || 0} questions.`}
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-md border border-blue-200 mb-6">
              <h3 className="font-medium text-blue-800 mb-2">Instructions</h3>
              {testData?.testInfo?.instructions ? (
                <div className="text-gray-700">{testData.testInfo.instructions}</div>
              ) : (
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Read each question carefully before answering.</li>
                  <li>Choose the answer that best represents your feelings or experiences.</li>
                  <li>Try to answer honestly - there are no right or wrong answers.</li>
                  <li>Complete all questions to get accurate results.</li>
                  <li>Once you submit, you cannot retake the test.</li>
                </ul>
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Click the button below when you're ready to begin the test.
            </p>
            <button
              onClick={startTest}
              className="bg-[#0b7960] text-white px-8 py-3 rounded-md font-medium hover:bg-[#096b54] transition-colors"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 