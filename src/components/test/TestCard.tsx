"use client";

import { TestDetails } from "@/types/test";
import { FaClock, FaListAlt, FaClipboardList, FaExclamationCircle, FaInfoCircle, FaChevronRight } from "react-icons/fa";

interface TestCardProps {
    test: TestDetails;
    userAge: number | null;
    onTakeTest: (testSlug: string) => void;
}

export default function TestCard({ test, onTakeTest, userAge }: TestCardProps) {
    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };
    const isValidAge: boolean = !userAge ? true :
        test.details.maximumAge && test.details.minimumAge ? userAge <= test.details.maximumAge && userAge >= test.details.minimumAge :
            test.details.maximumAge ? userAge <= test.details.maximumAge :
                test.details.minimumAge ? userAge >= test.details.minimumAge :
                    true;

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all hover:translate-y-[-4px]">
            {test.imageUrl ? (
                <div className="h-48 overflow-hidden">
                    <img
                        src={test.imageUrl}
                        alt={test.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="h-48 bg-gradient-to-br from-[#642494]/5 to-[#642494]/20 flex items-center justify-center">
                    <FaClipboardList className="text-5xl text-[#642494]/70" />
                </div>
            )}

            <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">{test.name}</h2>
                    <div className="flex items-center justify-center bg-[#642494]/10 text-[#642494] rounded-full w-8 h-8">
                        <FaInfoCircle />
                    </div>
                </div>
                
                <p className="text-gray-600 mb-4 h-12 overflow-hidden">
                    {truncateText(test.shortDescription, 80)}
                </p>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-sm">
                        <FaClock className="mr-1.5 text-[#642494]" />
                        <span>{test.details.durationMinutes} min</span>
                    </div>
                    <div className="flex items-center text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-sm">
                        <FaListAlt className="mr-1.5 text-[#642494]" />
                        <span>{test.details.totalQuestions} Q</span>
                    </div>
                </div>

                <div className="flex-grow">
                    {test.benefits.length !== 0 &&
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Benefits:</h3>
                            <div className="flex flex-wrap gap-2">
                                {test.benefits.slice(0, 2).map((benefit, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-[#642494]/10 text-[#642494] rounded-full text-xs font-medium"
                                    >
                                        {truncateText(benefit, 30)}
                                    </span>
                                ))}
                                {test.benefits.length > 2 && (
                                    <span className="text-[#642494] text-xs flex items-center font-medium">
                                        +{test.benefits.length - 2} more
                                    </span>
                                )}
                            </div>
                        </div>
                    }
                </div>
                {!isValidAge && userAge !== null && (
                    <div className="flex items-center text-orange-500 text-sm mb-3 bg-orange-50 p-2 rounded-lg">
                        <FaExclamationCircle className="mr-1.5" />
                        <span>Age not eligible for this test</span>
                    </div>
                )}

                <div className="border-t pt-4 mt-2 flex justify-between items-center">
                    <div>
                        <span className="text-gray-500 text-sm">Price:</span>
                        <div className="flex items-center">
                            {test.pricing.discount ? (
                                <>
                                    <span className="font-bold text-[#642494] text-lg">
                                        {test.pricing.currency} {test.pricing.amount}
                                    </span>
                                    <span className="text-gray-500 line-through text-sm ml-1">
                                        {test.pricing.originalPrice}
                                    </span>
                                </>
                            ) : (
                                <span className="font-bold text-[#642494] text-lg">
                                    {test.pricing.currency} {test.pricing.amount}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={isValidAge ? () => onTakeTest(test.slug) : () => { }}
                        disabled={!isValidAge}
                        className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                            isValidAge 
                                ? 'cursor-pointer bg-gradient-to-r from-[#642494] to-[#7a2db5] text-white shadow-sm hover:shadow-md' 
                                : 'cursor-not-allowed bg-gray-300 text-gray-500'
                        }`}
                    >
                        Take Test {isValidAge && <FaChevronRight className="ml-1.5" size={12} />}
                    </button>
                </div>
            </div>
        </div>
    );
} 