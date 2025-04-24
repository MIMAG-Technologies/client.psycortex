"use client";

import { TestDetails } from "@/types/test";
import Link from "next/link";
import { FaClock, FaListAlt, FaCheck, FaStar, FaShoppingCart, FaArrowRight } from "react-icons/fa";
import { useState } from "react";

interface TestDetailsModalProps {
    isLoggedIn: boolean;
    booktest: (testSlug: string, amount: number) => Promise<void>;
    test: TestDetails;
    onClose: () => void;
}

export default function TestDetailsModal({ booktest, isLoggedIn, test, onClose }: TestDetailsModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleBookTest = async () => {
        setIsLoading(true);
        try {
            await booktest(test.slug, test.pricing.amount);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar">
                <div className="p-0">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#642494] to-[#8a35c9] p-6 text-white rounded-t-xl relative">
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors"
                            aria-label="Close"
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
                        <h2 className="text-2xl font-bold mb-2">{test.name}</h2>
                        <p className="text-white/80">{test.shortDescription}</p>
                        
                        <div className="flex flex-wrap gap-3 mt-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center">
                                <FaClock className="mr-2" />
                                <span>{test.details.durationMinutes} minutes</span>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center">
                                <FaListAlt className="mr-2" />
                                <span>{test.details.totalQuestions} questions</span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="mb-6">
                            <p className="text-gray-700">{test.description}</p>
                        </div>

                        {test.benefits.length !== 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3 text-lg">Benefits</h3>
                                <div className="space-y-2">
                                    {test.benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-start">
                                            <div className="bg-[#642494]/10 p-1 rounded-full mr-2 mt-0.5">
                                                <FaCheck className="text-[#642494] text-xs" />
                                            </div>
                                            <span className="text-gray-700">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-800 mb-3 text-lg">
                                Terms and Conditions
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start">
                                        <span className="text-[#642494] mr-2">•</span>
                                        The test will be available for 30 days from the purchase date.
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-[#642494] mr-2">•</span>
                                        By purchasing, you agree to our
                                        <a href="https://psycortex.in/psycortex/returnpolicy" target="_blank" className="text-[#642494] hover:text-[#4e1c72] ml-1 font-medium">
                                            refund policy
                                        </a>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-[#642494] mr-2">•</span>
                                        An additional {test.pricing.taxPercent}% tax will be applied at checkout.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-[#642494]/5 to-[#642494]/10 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 border border-[#642494]/20">
                            <div>
                                <p className="text-gray-800 font-semibold">Price</p>
                                <div className="flex items-center">
                                    {test.pricing.discount ? (
                                        <>
                                            <span className="text-2xl font-bold text-[#642494]">
                                                {test.pricing.currency} {test.pricing.amount}
                                            </span>
                                            <span className="text-gray-500 line-through ml-2">
                                                {test.pricing.currency} {test.pricing.originalPrice}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-2xl font-bold text-[#642494]">
                                            {test.pricing.currency} {test.pricing.amount}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {isLoggedIn ? (
                                <button 
                                    disabled={isLoading}
                                    className={`bg-gradient-to-r from-[#642494] to-[#7a2db5] text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`} 
                                    onClick={handleBookTest}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <FaShoppingCart className="mr-2" /> Purchase Now
                                        </>
                                    )}
                                </button>
                            ) : (
                                <Link 
                                    href={'/login'} 
                                    className="bg-gradient-to-r from-[#642494] to-[#7a2db5] text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center"
                                >
                                    <FaArrowRight className="mr-2" /> Login to Proceed
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Add global styles for custom scrollbar */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: none;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(100, 36, 148, 0.3);
                    border-radius: 20px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(100, 36, 148, 0.5);
                }
                
                /* For Firefox */
                .custom-scrollbar {
                    scrollbar-width: none;
                    scrollbar-color: rgba(100, 36, 148, 0.3) transparent;
                }
            `}</style>
        </div>
    );
} 