"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaGraduationCap,
  FaCommentDots,
  FaGem,
  FaCheckCircle,
} from "react-icons/fa";
import { CounsellorDetails, getOneCounsellor } from "@/utils/experts";
import OneExpertBookingCompoent from "@/components/experts/OneExpertBookingCompoent";

const OneExpertPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = params;
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
  return (
    <div className="max-w-[1200px] mx-auto my-[5vh] flex flex-wrap justify-between px-4">
      <div className="w-full grid grid-cols-1 lg:grid-cols-[6.5fr_3fr] gap-5">
        <div>
          <div className="flex p-4 gap-5 border-2 border-gray-300 rounded-lg flex-wrap">
            <img
              src={
                counsellor?.personalInfo.profileImage ||
                "/assets/Images/user-dummy-img.png"
              }
              alt="Counsellor"
              className="aspect-square h-[150px] object-cover rounded-md"
            />
            <div>
              <h1 className="text-2xl font-bold mb-1">
                {counsellor?.personalInfo.name}
              </h1>
              <h3 className="text-lg mb-1">
                {counsellor?.professionalInfo.title}
              </h3>
              <h3 className="text-lg mb-1">
                {counsellor?.professionalInfo.yearsOfExperience}+ years of
                experience
              </h3>
              <p className="text-base mb-1 flex gap-2 items-center">
                <FaGraduationCap className="text-gray-400" />
                {counsellor?.professionalInfo.education[0].degree} (
                {counsellor?.professionalInfo.education[0].field})
              </p>
              <p className="text-base mb-1 flex gap-2 items-center flex-wrap">
                <FaCommentDots className="text-gray-400" />
                {counsellor?.practiceInfo.languages.map((lang, index) => (
                  <span key={lang.language}>
                    {lang.language}
                    {index <
                      counsellor?.practiceInfo.languages.length - 1 && ", "}
                  </span>
                ))}
              </p>
            </div>
          </div>

          <OneExpertBookingCompoent
            id={id as string}
            rates={counsellor.sessionInfo.pricing.rates}
            className="lg:hidden flex flex-col items-center p-6 bg-white border-2 border-gray-300 rounded-lg mt-5"
          />

          <div className="flex flex-col mt-5 gap-5">
            <h1 className="text-3xl font-semibold">
              About {counsellor?.personalInfo.name}
            </h1>
            <p>{counsellor?.personalInfo.biography}</p>
            <div className="w-full border border-gray-300 rounded-md" />
            <h2 className="text-2xl flex items-center gap-2">
              <FaGem /> Speciality
            </h2>
            <div className="flex flex-wrap gap-3">
              {counsellor?.practiceInfo.specialties.map((specialty) => (
                <div
                  key={specialty}
                  className="bg-[#f8f3fa] px-3 py-1 rounded-md border border-purple-300"
                >
                  {specialty}
                </div>
              ))}
            </div>
            <div className="w-full border border-gray-300 rounded-md" />
            <h2 className="text-2xl flex items-center gap-2">
              <FaGraduationCap /> Education
            </h2>
            <div className="flex flex-col gap-2">
              {counsellor?.professionalInfo.education.map((edu) => (
                <div key={edu.degree}>
                  ○ {edu.degree} - {edu.field} ({edu.institution}, {edu.year})
                </div>
              ))}
            </div>
            <div className="w-full border border-gray-300 rounded-md" />
            <h2 className="text-2xl flex items-center gap-2">
              <FaCheckCircle /> Licenses
            </h2>
            <div className="flex flex-col gap-2">
              {counsellor?.professionalInfo.licenses.map((license) => (
                <div key={license.type}>
                  ○ {license.type} - {license.licenseNumber} (
                  {license.issuingAuthority})
                </div>
              ))}
            </div>
          </div>
        </div>

        <OneExpertBookingCompoent
          id={id as string}
          rates={counsellor.sessionInfo.pricing.rates}
          className="hidden lg:flex flex-col items-center p-6 bg-white border-2 border-gray-300 rounded-lg  h-fit"
        />
      </div>
    </div>
  );
};

export default OneExpertPage;