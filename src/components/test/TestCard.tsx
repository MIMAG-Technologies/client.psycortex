"use client";

import { TestDetails } from "@/types/test";
import { FaClock, FaListAlt, FaClipboardList, FaExclamationCircle, FaChevronRight } from "react-icons/fa";

interface TestCardProps {
    test: TestDetails;
    userAge: number | null;
    onTakeTest: (testSlug: string) => void;
}

export default function TestCard({ test, onTakeTest, userAge }: TestCardProps) {
    const truncateText = (text: string | null | undefined, maxLength: number) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };
    const isValidAge: boolean = !userAge ? true :
        test.details.maximumAge && test.details.minimumAge ? userAge <= test.details.maximumAge && userAge >= test.details.minimumAge :
            test.details.maximumAge ? userAge <= test.details.maximumAge :
                test.details.minimumAge ? userAge >= test.details.minimumAge :
                    true;

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px] border border-gray-100">
            {test.imageUrl ? (
                <div className="h-52 overflow-hidden relative">
                    <img
                        src={test.imageUrl}
                        alt={test.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
            ) : (
                <div className="h-52 bg-gradient-to-br from-[#642494]/5 to-[#642494]/20 flex items-center justify-center">
                    <FaClipboardList className="text-6xl text-[#642494]/70" />
                </div>
            )}

            <div className="p-6 flex flex-col h-[calc(100%-13rem)] relative">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">{test.name}</h2>
                </div>

                <p className="text-gray-600 mb-4 h-12 overflow-hidden">
                    {truncateText(test.shortDescription, 80)}
                </p>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                        <FaClock className="mr-1.5 text-[#642494]" />
                        <span>{test.details.durationMinutes} min</span>
                    </div>
                    <div className="flex items-center text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
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
                                        className="px-3 py-1.5 bg-[#642494]/10 text-[#642494] rounded-full text-xs font-medium shadow-sm"
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
                    <div className="flex items-center text-orange-500 text-sm mb-3 bg-orange-50 p-3 rounded-lg shadow-sm">
                        <FaExclamationCircle className="mr-1.5" />
                        <span>Age not eligible for this test</span>
                    </div>
                )}

                <div className="border-t pt-4 mt-2 flex justify-between items-center">
                    <div>
                        <span className="text-gray-500 text-sm font-medium">Price:</span>
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
                        className={`flex items-center px-5 py-2.5 rounded-lg transition-all ${isValidAge
                            ? 'cursor-pointer bg-gradient-to-r from-[#642494] to-[#7a2db5] text-white shadow-md hover:shadow-lg'
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