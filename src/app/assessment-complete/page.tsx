'use client';
import React from 'react';
import Link from 'next/link';
import { BsClock } from 'react-icons/bs';

export default function ThankYouPage() {

    return (
        <div className=" min-h-[91vh] bg-violet-100 py-20 px-4 flex flex-col items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Top Image */}
                <div className="relative h-52 w-full bg-[#f6f5fa]">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-[#642494] text-[160px]">
                            <BsClock size={64} />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-[#642494] mb-2">Thank You!</h1>
                    <p className="text-gray-600 mb-6">
                        Your assessment has been successfully completed and submitted.
                        The interpretation will be sent to you within 2 hours.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <Link href="/tests" className="w-full bg-[#642494] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#7e3db0] transition-colors">
                            Explore More Tests
                        </Link>
                        <Link href="/profile" className="w-full border-2 border-[#642494] text-[#642494] py-3 px-4 rounded-lg font-medium hover:bg-[#f5edfb] transition-colors">
                            My Profile
                        </Link>
                    </div>
                </div>
            </div>

            {/* Floating elements */}
            <div className="absolute top-1/4 left-10 opacity-30 hidden md:block">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 60C46.5685 60 60 46.5685 60 30C60 13.4315 46.5685 0 30 0C13.4315 0 0 13.4315 0 30C0 46.5685 13.4315 60 30 60Z" fill="#ffffff" />
                    <path d="M30 50C41.0457 50 50 41.0457 50 30C50 18.9543 41.0457 10 30 10C18.9543 10 10 18.9543 10 30C10 41.0457 18.9543 50 30 50Z" fill="#f5edfb" />
                    <path d="M42 25C42 27.7614 37.5228 35 30 35C22.4772 35 18 27.7614 18 25C18 22.2386 23.4772 20 30 20C36.5228 20 42 22.2386 42 25Z" fill="#642494" />
                    <path d="M25 22C26.6569 22 28 20.6569 28 19C28 17.3431 26.6569 16 25 16C23.3431 16 22 17.3431 22 19C22 20.6569 23.3431 22 25 22Z" fill="#642494" />
                    <path d="M35 22C36.6569 22 38 20.6569 38 19C38 17.3431 36.6569 16 35 16C33.3431 16 32 17.3431 32 19C32 20.6569 33.3431 22 35 22Z" fill="#642494" />
                </svg>
            </div>

            <div className="absolute bottom-1/4 right-10 opacity-30 hidden md:block">
                <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M35 70C54.33 70 70 54.33 70 35C70 15.67 54.33 0 35 0C15.67 0 0 15.67 0 35C0 54.33 15.67 70 35 70Z" fill="#ffffff" />
                    <path d="M35 55C46.0457 55 55 46.0457 55 35C55 23.9543 46.0457 15 35 15C23.9543 15 15 23.9543 15 35C15 46.0457 23.9543 55 35 55Z" fill="#f5edfb" />
                    <path d="M35 45C38.866 45 42 41.866 42 38C42 34.134 38.866 31 35 31C31.134 31 28 34.134 28 38C28 41.866 31.134 45 35 45Z" fill="#642494" />
                    <path d="M22 29C23.6569 29 25 27.6569 25 26C25 24.3431 23.6569 23 22 23C20.3431 23 19 24.3431 19 26C19 27.6569 20.3431 29 22 29Z" fill="#642494" />
                    <path d="M48 29C49.6569 29 51 27.6569 51 26C51 24.3431 49.6569 23 48 23C46.3431 23 45 24.3431 45 26C45 27.6569 46.3431 29 48 29Z" fill="#642494" />
                </svg>
            </div>
        </div>
    );
} 