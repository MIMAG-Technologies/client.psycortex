"use client";

import { TestDetails } from "@/types/test";
import { FaClock, FaListAlt, FaClipboardList, FaExclamationCircle, FaInfoCircle } from "react-icons/fa";

interface TestCardProps {
    test: TestDetails;
    userAge: number | null;
    onTakeTest: () => void;
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {test.imageUrl ? (
                <div className="h-48 overflow-hidden">
                    <img
                        src={test.imageUrl}
                        alt={test.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="h-48 bg-indigo-100 flex items-center justify-center">
                    <FaClipboardList className="text-5xl text-indigo-300" />
                </div>
            )}

            <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{test.name}</h2>
                <p className="text-gray-600 mb-4 h-12 overflow-hidden">
                    {truncateText(test.shortDescription, 80)}
                </p>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center text-gray-600">
                        <FaClock className="mr-1" />
                        <span>{test.details.durationMinutes} min</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <FaListAlt className="mr-1" />
                        <span>{test.details.totalQuestions} questions</span>
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
                                        className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs"
                                    >
                                        {truncateText(benefit, 30)}
                                    </span>
                                ))}
                                {test.benefits.length > 2 && (
                                    <span className="text-indigo-600 text-xs flex items-center">
                                        +{test.benefits.length - 2} more
                                    </span>
                                )}
                            </div>
                        </div>
                    }
                </div>
                {!isValidAge && userAge !== undefined && (
                    <div className="flex items-center text-orange-500 text-sm mr-2">
                        <FaExclamationCircle className="mr-1" />
                        <span>Age not eligible for the test</span>
                    </div>
                )}

                <div className="flex justify-between items-center mt-auto">
                    <div>
                        <span className="text-gray-500 text-sm">Price:</span>
                        <div className="flex items-center">
                            {test.pricing.discount ? (
                                <>
                                    <span className="font-bold text-indigo-700">
                                        {test.pricing.currency} {test.pricing.amount}
                                    </span>
                                    <span className="text-gray-500 line-through text-sm ml-1">
                                        {test.pricing.originalPrice}
                                    </span>
                                </>
                            ) : (
                                <span className="font-bold text-indigo-700">
                                    {test.pricing.currency} {test.pricing.amount}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={isValidAge ? onTakeTest : () => { }}
                        disabled={!isValidAge}
                        className={`text-white px-4 py-2 rounded-md transition-colors ${isValidAge ? 'cursor-pointer bg-indigo-600' : 'cursor-not-allowed bg-gray-400'}`}
                    >
                        Take Test
                    </button>
                </div>
            </div>
        </div>
    );
} 