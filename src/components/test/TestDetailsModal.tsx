"use client";

import { TestDetails } from "@/types/test";
import Link from "next/link";
import { FaClock, FaListAlt } from "react-icons/fa";

interface TestDetailsModalProps {
    isLoggedIn: boolean;
    booktest: (testSlug: string, amount: number) => Promise<void>;
    test: TestDetails;
    onClose: () => void;
}

export default function TestDetailsModal({ booktest, isLoggedIn, test, onClose }: TestDetailsModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold text-indigo-800">{test.name}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                ></path>
                            </svg>
                        </button>
                    </div>
                    {
                        test.shortDescription && <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center mt-2">
                            <p className="text-gray-800">
                                {test.shortDescription}
                            </p>

                        </div>
                    }

                    <div className="mt-4">
                        <p className="text-gray-700 mb-4">{test.description}</p>

                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-800 mb-2">Test Details</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center">
                                    <FaClock className="mr-2 text-indigo-600" />
                                    <span>{test.details.durationMinutes} minutes</span>
                                </div>
                                <div className="flex items-center">
                                    <FaListAlt className="mr-2 text-indigo-600" />
                                    <span>{test.details.totalQuestions} questions</span>
                                </div>
                            </div>
                        </div>
                        {
                            test.benefits.length !== 0 &&
                            <div className="mb-4">
                                <h3 className="font-semibold text-gray-800 mb-2">Benefits</h3>
                                <div className="flex flex-wrap gap-2">
                                    {test.benefits.map((benefit, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm"
                                        >
                                            {benefit}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        }

                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-800 mb-2">
                                Terms and Conditions
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                                <li>
                                    The test will be available for 30 days from the purchase date.
                                </li>
                                <li>
                                    By purchasing, you agree to our
                                    <a href="https://psycortex.in/psycortex/returnpolicy" target="_blank" className="text-indigo-600 hover:text-indigo-800 ml-1">
                                        refund policy
                                    </a>
                                </li>
                                <li>An additional {test.pricing.taxPercent}% tax will be applied at checkout.</li>
                            </ul>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="text-gray-800 font-semibold">Price</p>
                                <div className="flex items-center">
                                    {test.pricing.discount ? (
                                        <>
                                            <span className="text-2xl font-bold text-indigo-700">
                                                {test.pricing.currency} {test.pricing.amount}
                                            </span>
                                            <span className="text-gray-500 line-through ml-2">
                                                {test.pricing.currency} {test.pricing.originalPrice}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-2xl font-bold text-indigo-700">
                                            {test.pricing.currency} {test.pricing.amount}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {
                                isLoggedIn ? <button className="bg-indigo-600 cursor-pointer text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors" onClick={()=>{
                                    booktest(test.slug,test.pricing.amount)
                                }}>
                                    Pay Now
                                </button> : <Link href={'/login'} className="bg-indigo-600 cursor-pointer text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">Login to proceed</Link>
                            }

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 