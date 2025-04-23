'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getQuestions, submitAssesment } from '@/utils/assesments';
import { assesmentData, question } from '@/types/assesments';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

export default function AssessmentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get('slug');
  
  const [assessmentData, setAssessmentData] = useState<assesmentData | null>({
    pages: 0,
    questions: []
  });
  
  const [userResponses, setUserResponses] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTestData = async () => {
    if (!slug) return;
    setIsLoading(true);
    try {
      const data = await getQuestions(slug);
      setAssessmentData(data);
    } catch (error) {
      console.error("Error fetching assessment data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchTestData();
    }
  }, [slug]);

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
const {user} = useAuth();
  const handleSubmit = async () => {
    if(!user?.uid || !slug){
        toast.error("Please Login Before Submittin the test!");
        return;
    }
    const res = await submitAssesment({
        user_id:user?.uid,
        test_slug:slug,
        answers:userResponses
    })

    if(res){
        router.replace('/assessment-complete');
    }
    else{
        toast.error("Error in submitting your responce")
    }
  };

  const goBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#642494]"></div>
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

  const formattedTestName = slug
    ? slug.toUpperCase().replace(/-/g, ' ')
    : 'ASSESSMENT';

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
          <h1 className="text-xl font-medium text-center flex-grow truncate">{formattedTestName}</h1>
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
                      className="hidden md:block mt-4 md:mt-0 px-6 py-2 bg-[#0b7960] text-white rounded-full font-medium hover:bg-teal-700 transition-colors"
                  >
                      Submit
                  </button>
              </div>
      </div>

      {/* Progress Tracker
      <div className="fixed top-16 left-0 right-0 z-10 bg-[#642494] text-white px-4 pb-4">
      
      </div> */}

      {/* Questions List */}
      <div className="container mx-auto px-4 pt-24 pb-20 max-w-5xl">
        <div className="space-y-4">
          {assessmentData.questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <span className="text-gray-600 font-medium text-lg">{qIndex + 1}</span>
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
          disabled={!isAllQuestionsAnswered()}
                  className="w-full py-3 text-white bg-[#0b7960] font-medium rounded-full"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
