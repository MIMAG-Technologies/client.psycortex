"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import {
  FaGraduationCap,
  FaCommentDots,
  FaGem,
  FaCheckCircle,
  FaVideo,
  FaUserFriends,
  FaDollarSign,
} from "react-icons/fa";
import { CounsellorDetails, getOneCounsellor } from "@/utils/experts";
import OneExpertBookingCompoent from "@/components/experts/OneExpertBookingCompoent";
import { BiChat, BiPhone, BiUser, BiVideo } from "react-icons/bi";

const OneExpertPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [counsellor, setCounsellor] = useState<CounsellorDetails | null>(null);

  useEffect(() => {
    const fetchCounsellor = async () => {
      if (!id || typeof id !== "string") return;
      try {
        const res = await getOneCounsellor(id);
        setCounsellor(res);
      } catch (error) {
        console.error("Error fetching counsellor details:", error);
      }
    };
    fetchCounsellor();
  }, [id]);

  if (!counsellor) return <div className="text-center mt-10">Loading...</div>;

  // Safe access with fallbacks for potentially missing data
  const name = counsellor?.personalInfo?.name || "Counsellor";
  const title = counsellor?.professionalInfo?.title || "Mental Health Professional";
  const yearsOfExperience = counsellor?.professionalInfo?.yearsOfExperience || 0;
  const profileImage = counsellor?.personalInfo?.profileImage || "/user-dummy-img.png";
  const biography = counsellor?.personalInfo?.biography || "No biography available";
  const education = counsellor?.professionalInfo?.education || [];
  const licenses = counsellor?.professionalInfo?.licenses || [];
  const specialties = counsellor?.practiceInfo?.specialties || [];
  const languages = counsellor?.practiceInfo?.languages || [];
  const rates = counsellor?.sessionInfo?.pricing?.rates || [];
  const communicationModes = counsellor?.sessionInfo?.availability?.communicationModes || [];

  return (
    <div className="max-w-[1200px] mx-auto my-[5vh] flex flex-wrap justify-between px-4">
      <div className="w-full grid grid-cols-1 lg:grid-cols-[6.5fr_3fr] gap-5">
        <div>
          <div className="flex p-4 gap-5 border-2 border-gray-300 rounded-lg flex-wrap">
            <img
              src={profileImage || "/user-dummy-img.png"}
              alt={name}
              className="aspect-square h-[150px] object-cover rounded-md"
            />
            <div>
              <h1 className="text-2xl font-bold mb-1">
                {name}
              </h1>
              <h3 className="text-lg mb-1">
                {title}
              </h3>
              <h3 className="text-lg mb-1">
                {yearsOfExperience}+ years of experience
              </h3>
              {education.length > 0 && (
                <p className="text-base mb-1 flex gap-2 items-center">
                  <FaGraduationCap className="text-gray-400" />
                  {education[0].degree || "Degree"} (
                  {education[0].field || "Field"})
                </p>
              )}
              {languages.length > 0 && (
                <p className="text-base mb-1 flex gap-2 items-center flex-wrap">
                  <FaCommentDots className="text-gray-400" />
                  {languages.map((lang, index) => (
                    <span key={lang.language || `lang-${index}`}>
                      {lang.language || "Language"}
                      {index < languages.length - 1 && ", "}
                    </span>
                  ))}
                </p>
              )}
            </div>
          </div>

          <OneExpertBookingCompoent
            id={id}
            rates={rates}
            className="lg:hidden flex flex-col items-center p-6 bg-white border-2 border-gray-300 rounded-lg mt-5"
            counsellorName={name}
          />

          <div className="flex flex-col mt-5 gap-5">
            <h1 className="text-3xl font-semibold">
              About {name}
            </h1>
            <p>{biography}</p>

            <div className="w-full border border-gray-300 rounded-md" />

            <h2 className="text-2xl flex items-center gap-2">
              <FaUserFriends /> Session Modes
            </h2>
            <div className="flex flex-wrap gap-3">
              {communicationModes.length > 0 ? (
                communicationModes.map((mode) => (
                  <div
                    key={mode}
                    className="bg-[#edf8f3] px-3 py-1 rounded-md border border-green-300 flex items-center gap-2"
                  >
                    {mode === 'chat' && <>
                      <BiChat className="text-green-600" />
                      Chat
                    </>}
                    {mode === 'call' && <>
                      <BiPhone className="text-green-600" />
                      Call
                    </>}
                    {mode === 'video' && <>
                      <BiVideo className="text-green-600" />
                      Video
                    </>}
                    {mode === 'in_person' && <>
                      <BiUser className="text-green-600" />
                      Offline
                    </>}
                  </div>
                ))
              ) : (
                <p>No session modes specified</p>
              )}
            </div>

            <div className="w-full border border-gray-300 rounded-md" />

            <h2 className="text-2xl flex items-center gap-2">
              <FaDollarSign /> Session Pricing
            </h2>
            <div className="flex flex-col gap-2">
              {rates.length > 0 ? (
                rates.map((rate, index) => (
                  <div key={`rate-${index}`} className="bg-[#f9f9f9] p-3 rounded-md border border-gray-200">
                    <h3 className="font-semibold">{rate.sessionTitle || `Session Type ${index + 1}`}</h3>
                    <p className="text-green-600 font-bold">{rate.currency || "$"}{rate.price || "Price not specified"}</p>
                    <p className="text-sm text-gray-500">
                      {rate.sessionType || "No session type specified"}
                    </p>
                  </div>
                ))
              ) : (
                <p>Pricing information not available</p>
              )}
            </div>

            <div className="w-full border border-gray-300 rounded-md" />

            <h2 className="text-2xl flex items-center gap-2">
              <FaGem /> Speciality
            </h2>
            <div className="flex flex-wrap gap-3">
              {specialties.length > 0 ? (
                specialties.map((specialty, index) => (
                  <div
                    key={specialty || `specialty-${index}`}
                    className="bg-[#f8f3fa] px-3 py-1 rounded-md border border-purple-300"
                  >
                    {specialty}
                  </div>
                ))
              ) : (
                <p>No specialties listed</p>
              )}
            </div>

            <div className="w-full border border-gray-300 rounded-md" />

            <h2 className="text-2xl flex items-center gap-2">
              <FaGraduationCap /> Education
            </h2>
            <div className="flex flex-col gap-2">
              {education.length > 0 ? (
                education.map((edu, index) => (
                  <div key={edu.degree || `edu-${index}`}>
                    ○ {edu.degree || "Degree"} - {edu.field || "Field"} (
                    {edu.institution || "Institution"}, {edu.year || "Year not specified"})
                  </div>
                ))
              ) : (
                <p>No education information available</p>
              )}
            </div>
            {
              counsellor?.professionalInfo?.licenses.length !== 0  &&

              <><div className="w-full border border-gray-300 rounded-md" /><h2 className="text-2xl flex items-center gap-2">
                <FaCheckCircle /> Licenses
              </h2><div className="flex flex-col gap-2">
                  {licenses.length > 0 ? (
                    licenses.map((license, index) => (
                      <div key={license.type || `license-${index}`}>
                        ○ {license.type || "License"} - {license.licenseNumber || "Number not provided"} (
                        {license.issuingAuthority || "Authority not specified"})
                      </div>
                    ))
                  ) : (
                    <p>No license information available</p>
                  )}
                </div></>

            }
          </div>
        </div>
        <OneExpertBookingCompoent
          id={id}
          rates={rates}
          className="hidden lg:flex flex-col items-center p-6 bg-white border-2 border-gray-300 rounded-lg h-fit"
          counsellorName={name}
        />
      </div>
    </div>
  );
};

export default OneExpertPage;