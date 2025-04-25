"use client";

import { useState, useRef, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { IoMdBriefcase, IoMdPerson } from "react-icons/io";
import { BiChat, BiPhone, BiVideo, BiUser } from "react-icons/bi";
import { BsGlobe2 } from "react-icons/bs";
import { BaseCounsellor } from "@/utils/experts";
import Link from "next/link";

export default function OneExpertCard({
  id,
  personalInfo,
  professionalInfo,
  practiceInfo,
  sessionInfo,
  rating,
}: BaseCounsellor) {
  const { name, profileImage } = personalInfo;
  const { title, yearsOfExperience } = professionalInfo;
  const { specialties, languages } = practiceInfo;
  const { communicationModes } = sessionInfo.availability;
  const { rates } = sessionInfo.pricing;

  // For sliding sections
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;
  const slideTitles = ["Sessions (INR)", "Languages", "Specialties"];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Handle dot indicator click
  const handleDotClick = (index: number) => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: containerWidth * index,
        behavior: 'smooth'
      });
    }
  };
  
  // Monitor scroll position to update current slide indicator
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollPosition = scrollContainerRef.current.scrollLeft;
      const newSlide = Math.round(scrollPosition / containerWidth);
      
      if (newSlide !== currentSlide && newSlide < totalSlides) {
        setCurrentSlide(newSlide);
      }
    }
  };
  
  // Duplicate content for seemless infinite scrolling
  const slideContents = [
    // Pricing section
    <div key="pricing" className="min-w-full p-4 shrink-0">
      <h3 className="text-[16px] font-semibold mb-3">{slideTitles[0]}</h3>
      <div className="space-y-2">
        {rates.map((rate, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-green-600 text-[14px]">
              {rate.sessionType === 'chat' && <BiChat className="text-green-600" />}
              {rate.sessionType === 'call' && <BiPhone className="text-green-600" />}
              {rate.sessionType === 'video' && <BiVideo className="text-green-600" />}
              {rate.sessionType === 'offline' && <BiUser className="text-green-600" />}
              <span>{rate.sessionType}</span>
            </div>
            <span className="text-purple-700 font-semibold text-[14px]">{rate.price}</span>
          </div>
        ))}
      </div>
    </div>,
    
    // Languages section
    <div key="languages" className="min-w-full p-4 shrink-0">
      <h3 className="text-[16px] font-semibold mb-3">{slideTitles[1]}</h3>
      <div className="space-y-2">
        {languages.map((lang, index) => (
          <div key={index} className="flex items-center gap-2">
            <BsGlobe2 className="text-gray-600" />
            <span className="text-[14px]">{lang.language}</span>
          </div>
        ))}
      </div>
    </div>,
    
    // Specialties section
    <div key="specialties" className="min-w-full p-4 shrink-0">
      <h3 className="text-[16px] font-semibold mb-3">{slideTitles[2]}</h3>
      <div className="flex flex-wrap gap-2 overflow-auto">
        {specialties.map((specialty, index) => (
          <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-gray-800 text-[12px] whitespace-normal break-words">
            {specialty}
          </span>
        ))}
      </div>
    </div>
  ];

  return (
    <div className="w-full rounded-2xl flex flex-col h-full border border-purple-200 bg-white">
      {/* Top section with image, name, title, and rating */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Profile Image */}
          <img
            src={profileImage || "/user-dummy-img.png"}
            alt={`${name}'s profile`}
            className="w-20 h-20 rounded-xl object-cover mx-auto sm:mx-0"
          />
          
          {/* Name, Title and Rating */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:justify-between items-center sm:items-start">
              <div className="text-center sm:text-left">
                <h3 className="text-[18px] font-semibold text-gray-800 flex items-center gap-2 justify-center sm:justify-start">
                  {name} | <FaStar className="text-yellow-400 text-[14px]" />
                  <span className="font-normal">
                     {rating.average.toFixed(1)}
                    </span>
                </h3>
                <p className="text-gray-500 text-[14px]">{title.length > 35 ? `${title.slice(0,32)}...` : title}</p>
              </div>
            </div>
            
            {/* Experience and sessions */}
            <div className="flex items-center justify-center sm:justify-start gap-6 mt-2 text-gray-600">
              <div className="flex items-center gap-1 text-[14px]">
                <IoMdBriefcase className="text-gray-500" />
                <span>{yearsOfExperience}+ yrs</span>
              </div>
              <div className="flex items-center gap-1">
                <IoMdPerson className="text-gray-500" />
                <span>0+ sessions</span>
              </div>
            </div>
            
            {/* Communication modes with colored circles */}
            <div className="flex justify-center sm:justify-start gap-2 mt-3">
              {communicationModes.includes('chat') && (
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <BiChat size={14} className="text-blue-500" />
                </div>
              )}
              {communicationModes.includes('call') && (
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <BiPhone size={14} className="text-green-500" />
                </div>
              )}
              {communicationModes.includes('video') && (
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <BiVideo size={14} className="text-purple-500" />
                </div>
              )}
              {communicationModes.includes('in_person') && (
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <BiUser size={14} className="text-orange-500" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sliding sections - with horizontal scroll */}
      <div className="mx-4 mb-1 overflow-hidden bg-gray-50 rounded-xl flex-grow">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory select-none" 
          style={{ 
            height: '180px', 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
          onScroll={handleScroll}
        >
          {slideContents.map((content, index) => (
            <div key={index} className="snap-center min-w-full shrink-0">
              {content}
            </div>
          ))}
        </div>
        
        {/* Slide indicators */}
        <div className="flex justify-center gap-2 py-2">
          {[...Array(totalSlides)].map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                currentSlide === index ? 'bg-purple-700' : 'bg-gray-300'
              }`}
              onClick={() => handleDotClick(index)}
              aria-label={`View ${slideTitles[index]}`}
            />
          ))}
        </div>
      </div>

      {/* View Profile Button - always at bottom */}
      <div className="mt-6 px-4 pb-4">
        <Link 
          href={`/expert/profile?id=${id}`}
          className="block py-4 bg-[#642494] text-white text-center font-semibold hover:bg-[#4e1c72] transition-colors rounded-xl"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
