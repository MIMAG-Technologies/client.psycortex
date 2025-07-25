import React, { useRef } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface QuestionNavigationTabProps {
    questions: any[];
    userResponses: Record<string, string | number>;
    scrollToQuestion: (index: number) => void;
}

const QuestionNavigationTab: React.FC<QuestionNavigationTabProps> = ({
    questions,
    userResponses,
    scrollToQuestion,
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            if (direction === 'left') {
                scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="relative flex items-center bg-gray-100 p-2 rounded-lg shadow-inner mt-4">
            <button
                onClick={() => scroll('left')}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-200 focus:outline-none transition-colors duration-200 absolute left-2 z-10"
                aria-label="Scroll left"
            >
                <FaArrowLeft className="text-gray-600" />
            </button>
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto no-scrollbar py-2 px-10 space-x-3 w-full"
            >
                {questions.map((question, index) => (
                    <div
                        key={question.question_number}
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer transition-colors duration-200
              ${userResponses[question.question_number] ? 'bg-green-500' : 'bg-gray-400'}`}
                        onClick={() => scrollToQuestion(index)}
                        title={`Question ${index + 1}: ${userResponses[question.question_number] ? 'Answered' : 'Unanswered'}`}
                    >
                        {index + 1}
                    </div>
                ))}
            </div>
            <button
                onClick={() => scroll('right')}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-200 focus:outline-none transition-colors duration-200 absolute right-2 z-10"
                aria-label="Scroll right"
            >
                <FaArrowRight className="text-gray-600" />
            </button>
        </div>
    );
};

export default QuestionNavigationTab; 