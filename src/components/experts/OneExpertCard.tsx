"use client";

import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
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
  const { yearsOfExperience } = professionalInfo;
  const { specialties, languages } = practiceInfo;

  const startingRate = sessionInfo.pricing.rates?.[0]?.price || "N/A";
  const roundedRating = Math.round((rating?.average || 0) * 2) / 2;
  const fullStars = Math.floor(roundedRating);
  const halfStar = roundedRating % 1 !== 0;

  return (
    <div className="w-[330px] h-[330px] p-2 border border-primary-purple rounded-[10px] bg-white flex flex-col gap-2 transition-all duration-200 ease-in-out hover:scale-[1.015] hover:shadow-[0_0_10px_#0000002d] sm:w-full sm:h-fit sm:z-0">
      <div className="flex items-center gap-2 mb-2">
        <img
          src={profileImage || "/assets/Images/user-dummy-img.png"}
          alt={`${name}'s profile`}
          className="aspect-square h-20 object-cover rounded-[10px]"
        />
        <div>
          <h3 className="font-bold text-[20px]">{name}</h3>
          <p>{yearsOfExperience}+ years of experience</p>
          <p>Starts @ ₹{startingRate} for 50 minutes</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {specialties.slice(0, 3).map((specialty, index) => (
          <span
            className="border-[1.5px] border-primary-purple bg-[#f8f3fa] px-2 py-1 rounded-[7px]"
            key={index}
          >
            {specialty}
          </span>
        ))}
      </div>

      <div className="text-sm">
        <strong>Languages: </strong>
        {languages.map((lang, index) => (
          <span key={lang.language}>
            {lang.language}
            {index < languages.length - 1 && ", "}
          </span>
        ))}
      </div>

      <div className="flex gap-1 items-center">
        <strong>Rating: </strong>
        <div className="flex items-center">
          {[...Array(fullStars)].map((_, index) => (
            <FaStar key={`full-${index}`} className="text-yellow-500" />
          ))}
          {halfStar && <FaStarHalfAlt className="text-yellow-500" />}
          {[...Array(5 - fullStars - (halfStar ? 1 : 0))].map((_, index) => (
            <FaRegStar key={`empty-${index}`} className="text-gray-300" />
          ))}
        </div>
      </div>

      <Link
        href={`/experts/${id}`}
        className="w-full py-2 bg-indigo-500 text-white border-none rounded-[10px] cursor-pointer text-center mt-auto sm:mt-5"
      >
        Book Appointment
      </Link>
    </div>
  );
}
