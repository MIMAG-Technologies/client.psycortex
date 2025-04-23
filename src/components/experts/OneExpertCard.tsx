"use client";

import { useState, useEffect, useRef } from "react";
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
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotate slides every 3 seconds
  useEffect(() => {
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 3000);

    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, []);

  // Handle dot indicator click
  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
    // Reset the interval
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
      slideIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 3000);
    }
  };

  return (
    <div className="w-full rounded-2xl pb-4 overflow-hidden border border-purple-200 bg-white">
      {/* Top section with image, name, title, and rating */}
      <div className="p-4">
        <div className="flex gap-4">
          {/* Profile Image */}
          <img
            src={profileImage || "/user-dummy-img.png"}
            alt={`${name}'s profile`}
            className="w-20 h-20 rounded-xl object-cover"
          />
          
          {/* Name, Title and Rating */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[18px] font-semibold text-gray-800 flex items-center gap-2">
                  {name} | <FaStar className="text-yellow-400 text-[14px]" />
                  <span className="font-normal">
                     {rating.average.toFixed(1)}
                    </span>
                </h3>
                <p className="text-gray-500 text-[14px]">{title.length > 35 ? `${title.slice(0,32)}...` : title}</p>
              </div>
            </div>
            
            {/* Experience and sessions */}
            <div className="flex items-center gap-6 mt-2 text-gray-600">
              <div className="flex items-center gap-1 text-[14px]">
                <IoMdBriefcase className="text-gray-500" />
                <span>{yearsOfExperience}+ yrs</span>
              </div>
              <div className="flex items-center gap-1">
                <IoMdPerson className="text-gray-500" />
                <span>0+ sessions</span>
              </div>
            </div>
            
            {/* Communication modes */}
            <div className="flex  gap-2 mt-3 overflow-hidden">
              {communicationModes.includes('chat') && (
                <div className="rounded-full text-gray-700 flex items-center gap-1 text-[12px]">
                  <BiChat /> CHAT
                </div>
              )}
              {communicationModes.includes('call') && (
                <div className="rounded-full text-gray-700 flex items-center gap-1 text-[12px]">
                  <BiPhone /> CALL
                </div>
              )}
              {communicationModes.includes('video') && (
                <div className="rounded-full text-gray-700 flex items-center gap-1 text-[12px]">
                  <BiVideo /> VIDEO
                </div>
              )}
              {communicationModes.includes('in_person') && (
                <div className="rounded-full text-gray-700 flex items-center gap-1 text-[12px]">
                  <BiUser /> IN-PERSON
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sliding sections */}
      <div className="relative bg-gray-50 p-4 mx-4 rounded-xl mb-1" style={{ height: '180px' }}>
        {/* Pricing Section */}
        <div 
          className={`absolute top-0 left-0 w-full p-4 transition-opacity duration-500 ${
            currentSlide === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <h3 className="text-[16px] font-semibold mb-3">{slideTitles[0]}</h3>
          <div className="space-y-2">
            {rates.map((rate, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-green-600 text-[14px]">
                  {rate.sessionType === 'chat' && <BiChat className="text-green-600" />}
                  {rate.sessionType === 'call' && <BiPhone className="text-green-600" />}
                  {rate.sessionType === 'video' && <BiVideo className="text-green-600" />}
                  {rate.sessionType === 'offline' && <BiUser className="text-green-600" />}
                  <span >{rate.sessionType}</span>
                </div>
                <span className="text-purple-700 font-semibold text-[14px]">{rate.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Languages Section */}
        <div 
          className={`absolute top-0 left-0 w-full p-4 transition-opacity duration-500 ${
            currentSlide === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <h3 className="text-[16px] font-semibold mb-3">{slideTitles[1]}</h3>
          <div className="space-y-2">
            {languages.map((lang, index) => (
              <div key={index} className="flex items-center gap-2">
                <BsGlobe2 className="text-gray-600" />
                <span className="text-[14px]">{lang.language}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Specialties Section */}
        <div 
          className={`absolute top-0 left-0 w-full p-4 transition-opacity duration-500 ${
            currentSlide === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <h3 className="text-[16px] font-semibold mb-3">{slideTitles[2]}</h3>
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-gray-800 text-[14px]">
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
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

      {/* View Profile Button */}
      <Link 
        href={`/experts/${id}`}
        className="block py-4 bg-purple-800 text-white text-center font-semibold hover:bg-purple-900 transition-colors mx-4 mt-3 rounded-xl"
      >
        View Profile
      </Link>
    </div>
  );
}
