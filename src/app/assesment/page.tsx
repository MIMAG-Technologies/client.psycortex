'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getQuestions, submitAssesment } from '@/utils/assesments';
import { assesmentData, question } from '@/types/assesments';
import { useAuth } from '@/context/AuthContext';
import { useTests } from '@/context/TestContext';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { FaSignInAlt, FaExclamationCircle } from 'react-icons/fa';
import { getAllUserTestData } from '@/utils/test';

export default function AssessmentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get('slug');
  const fromPrep = searchParams.get('fromPrep');
  
  const [assessmentData, setAssessmentData] = useState<assesmentData | null>({
    pages: 0,
    questions: []
  });
  
  const [userResponses, setUserResponses] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isValidTest, setIsValidTest] = useState<boolean>(false);
  
  const { me, isLoading: authLoading } = useAuth();
  const { testsData, isLoading: testsLoading } = useTests();

  // Validate test access and fetch test data
  useEffect(() => {
    const validateAndFetchTest = async () => {
      if (!slug) {
        setError('Test not specified');
        setIsLoading(false);
        return;
      }
      
      if (!fromPrep) {
        setError('You must access this test through the preparation page');
        setIsLoading(false);
        return;
      }

      if (!me) {
        setError('You need to be logged in to take this test');
        setIsLoading(false);
        return;
      }

      try {
        // First check if the user has access to this test
        const userData = await getAllUserTestData(me.id);
        const isTestActive = userData.activeTests.some(test => test.testSlug === slug);
        
        if (!isTestActive) {
          setError('This test is not in your active tests list');
          setIsLoading(false);
          return;
        }

        setIsValidTest(true);
        
        try {
          // Fetch test questions
          const data = await getQuestions(slug, me);
          if (!data || !data.questions || data.questions.length === 0) {
            setError('No questions available for this test');
          } else {
            setAssessmentData(data);
          }
        } catch (questionsError: any) {
          console.error("Error fetching test questions:", questionsError);
          setError(`Failed to load test questions: ${questionsError.message || 'Unknown error'}`);
        }
        
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error in validateAndFetchTest:", error);
        setError(`Failed to load test data: ${error.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    if (!authLoading && !testsLoading) {
      validateAndFetchTest();
    }
  }, [slug, fromPrep, me, authLoading, testsLoading]);

  const handleOptionSelect = (questionNumber: string, optionValue: string) => {
    setUserResponses(prev => ({
      ...prev,
      [questionNumber]: optionValue
    }));
  };

  const calculateProgress = () => {
    if (!assessmentData?.questions.length) return 0;
    return (Object.keys(userResponses).length / assessmentData.questions.length) * 100;
  };

  const isAllQuestionsAnswered = () => {
    if (!assessmentData?.questions.length) return false;
    return assessmentData.questions.length === Object.keys(userResponses).length;
  };

  const handleSubmit = async () => {
    if(!me?.id || !slug){
        toast.error("Please Login Before Submitting the test!");
        return;
    }
    
    if (!isAllQuestionsAnswered()) {
      toast.error("You must answer all questions before submitting.");
      
      // Find first unanswered question and scroll to it
      const firstUnansweredIndex = assessmentData?.questions.findIndex(
        q => !userResponses[q.question_number]
      );
      
      if (firstUnansweredIndex !== undefined && firstUnansweredIndex >= 0) {
        const questionElement = document.getElementById(`question-${firstUnansweredIndex}`);
        if (questionElement) {
          questionElement.scrollIntoView({ behavior: 'smooth' });
          // Focus on the unanswered question without animation
          questionElement.style.border = '2px solid #ef4444';
          setTimeout(() => {
            questionElement.style.border = '';
          }, 2000);
        }
      }
      
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await submitAssesment({
        user_id: me.id,
        test_slug: slug,
        answers: userResponses
      });

      if(res){
        router.replace('/assessment-complete');
      }
      else{
        toast.error("Error in submitting your response");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Error in submitting your response");
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    router.push('/test-preparation?slug=' + slug);
  };

  const getTestName = (): string => {
    if (!slug) return 'ASSESSMENT';
    return testsData[slug]?.name || slug.toUpperCase().replace(/-/g, ' ');
  };

  // Loading state
  if (authLoading || testsLoading || (isLoading && !error)) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#642494]"></div>
      </div>
    );
  }

  // Not logged in
  if (!me) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <FaSignInAlt className="text-6xl text-[#642494] mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to take this test. Please login to continue.
          </p>
          <Link
            href={`/login?redirect=/assesment?slug=${slug}`}
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

  if (!assessmentData || !assessmentData.questions.length) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Assessment Not Found</h2>
          <p className="text-gray-700">The requested assessment could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header with Back Button and Test Name */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-[#642494] text-white py-4 px-4">
        <div className="container mx-auto flex items-center">
          <button 
            onClick={goBack}
            className="mr-4 text-white"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-medium text-center flex-grow truncate">{getTestName()}</h1>
        </div>
              <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mt-4">
                  <div className="w-full md:w-2/3">
                      <div className="w-full bg-white rounded-full h-2">
                          <div
                              className="bg-[#0b7960] h-2 rounded-full transition-all duration-300 ease-in-out"
                              style={{ width: `${calculateProgress()}%` }}
                          ></div>
                      </div>
                      <p className="text-sm mt-1">{calculateProgress().toFixed(0)}% Complete</p>
                  </div>
                  <button
                      onClick={handleSubmit}
                      disabled={!isAllQuestionsAnswered() || isSubmitting}
                      className={`hidden md:block mt-4 md:mt-0 px-6 py-2 ${isAllQuestionsAnswered() ? 'bg-[#0b7960] hover:bg-teal-700' : 'bg-gray-400 cursor-not-allowed'} ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''} text-white rounded-full font-medium transition-colors`}
                  >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : 'Submit'}
                  </button>
              </div>
      </div>

      {/* Questions List */}
      <div className="container mx-auto px-4 pt-24 pb-20 max-w-5xl">
        <div className="space-y-4">
          {assessmentData.questions.map((question, qIndex) => (
            <div 
              key={qIndex} 
              id={`question-${qIndex}`}
              className={`bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm transition-all duration-300 ${
                !userResponses[question.question_number] ? 'relative' : ''
              }`}
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-full w-12 h-12 flex items-center justify-center mr-4 ${
                  userResponses[question.question_number] ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                }`}>
                  <span className="font-medium text-lg">{qIndex + 1}</span>
                </div>
                <p className="text-gray-800 font-medium text-xl">
                  {question.question_text}
                </p>
              </div>
              
              <div className={`mt-6 grid ${question.options.length === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                {question.options.map((option, oIndex) => (
                  <button 
                    key={oIndex}
                    onClick={() => handleOptionSelect(question.question_number, option.value)}
                    className={`py-2 px-4 rounded-full border-2 text-center transition-colors text-lg ${
                      userResponses[question.question_number] === option.value
                        ? 'bg-purple-100 border-purple-600 text-purple-800 font-medium'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Submit Button - Fixed at Bottom */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white md:hidden">
        <button
          onClick={handleSubmit}
          disabled={!isAllQuestionsAnswered() || isSubmitting}
          className={`w-full py-3 text-white font-medium rounded-full ${isAllQuestionsAnswered() ? 'bg-[#0b7960] hover:bg-teal-700' : 'bg-red-500 hover:bg-red-600'} ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : isAllQuestionsAnswered() ? 'Submit' : 'Answer All Questions to Submit'}
        </button>
      </div>
    </div>
  );
}
