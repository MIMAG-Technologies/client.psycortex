"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FaGraduationCap,
  FaStar,
  FaBriefcase,
  FaCalendarCheck,
  FaCheckSquare,
} from "react-icons/fa";
import { CounsellorDetails, getOneCounsellor } from "@/utils/experts";
import OneExpertBookingCompoent from "@/components/experts/OneExpertBookingCompoent";
import { BiChat, BiPhone, BiUser, BiVideo } from "react-icons/bi";
import { toast } from "react-toastify";

const TruncatedText = ({ text, limit = 160 }: { text: string; limit?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text.length > limit;
  const displayText = isExpanded ? text : text.slice(0, limit);

  return (
    <div>
      <p className="whitespace-pre-line text-gray-700 leading-relaxed">
        {displayText}
        {!isExpanded && shouldTruncate && "..."}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#642494] font-medium mt-2 hover:underline"
        >
          {isExpanded ? "View Less" : "View More"}
        </button>
      )}
    </div>
  );
};

const SuccessModal = ({
  isOpen,
  appointmentDetails,
}: {
  isOpen: boolean;
  onClose: () => void;
  appointmentDetails: any;
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  const { mode, date, name } = appointmentDetails;

  const goToSessions = () => {
    router.replace("/profile/sessions");
  };

  const goToExperts = () => {
    router.replace("/experts");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-[#642494] to-[#8a35c9] p-6">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-white rounded-full p-3">
              <FaCalendarCheck className="text-3xl text-purple-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-white">
            Booking Confirmed!
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Appointment Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <FaCheckSquare className="text-green-500 mr-2" />
                <span className="text-gray-700">
                  <span className="font-medium">Counsellor:</span>{" "}
                  {name}
                </span>
              </div>
              <div className="flex items-center">
                <FaCheckSquare className="text-green-500 mr-2" />
                <span className="text-gray-700">
                  <span className="font-medium">Session Type:</span>{" "}
                  {mode?.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center">
                <FaCheckSquare className="text-green-500 mr-2" />
                <span className="text-gray-700">
                  <span className="font-medium">Date & Time:</span> {date}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={goToSessions}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              Go to All Sessions
            </button>
            <button
              onClick={goToExperts}
              className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Back to Experts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExpertProfilePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const pay = searchParams.get("pay");
  const mode = searchParams.get("mode");
  const dateParam = searchParams.get("date");
  const datepart = dateParam?.match(/^\d{4}-\d{2}-\d{2}/)?.[0]?.split('-').reverse().join('/');
  const timepart = dateParam?.match(/\d{6}$/)
    ? new Date(`2000-01-01T${dateParam.slice(-6).replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2:$3')}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    : null;
  const date = datepart && timepart ? `${datepart} ${timepart}` : dateParam;
  const [counsellor, setCounsellor] = useState<CounsellorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (pay && !notifiedRef.current) {
      if (pay === "failed") {
        toast.error("Payment failed. Please try again.");
        // Remove the pay param but keep other params
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("pay");
        router.replace(newUrl.pathname + newUrl.search);
      } else {
        toast.success(`Payment successful for ${mode} session on ${date}.`);
        setShowSuccessModal(true);
      }
      notifiedRef.current = true;
    }
  }, [pay, mode, date, router]);

  useEffect(() => {
    const fetchCounsellor = async () => {
      if (!id) {
        setError("Expert ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await getOneCounsellor(id);
        setCounsellor(res);
      } catch (error) {
        console.error("Error fetching counsellor details:", error);
        setError("Failed to load expert information");
      } finally {
        setLoading(false);
      }
    };

    fetchCounsellor();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#642494]"></div>
      </div>
    );
  }

  if (error || !id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg max-w-md shadow-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || "Expert ID is required"}</p>
        </div>
      </div>
    );
  }

  if (!counsellor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg max-w-md shadow-md">
          <h2 className="text-xl font-bold mb-2">Not Found</h2>
          <p>Expert information not available</p>
        </div>
      </div>
    );
  }

  // Safe access with fallbacks for potentially missing data
  const name = counsellor?.personalInfo?.name || "Counsellor";
  const title =
    counsellor?.professionalInfo?.title || "Mental Health Professional";
  const yearsOfExperience =
    counsellor?.professionalInfo?.yearsOfExperience || 0;
  const profileImage =
    counsellor?.personalInfo?.profileImage || "/user-dummy-img.png";
  const biography =
    counsellor?.personalInfo?.biography || "No biography available";
  const education = counsellor?.professionalInfo?.education || [];
  const licenses = counsellor?.professionalInfo?.licenses || [];
  const specialties = counsellor?.practiceInfo?.specialties || [];
  const languages = counsellor?.practiceInfo?.languages || [];
  const rates = counsellor?.sessionInfo?.pricing?.rates || [];
  const communicationModes =
    counsellor?.sessionInfo?.availability?.communicationModes || [];
  const rating = counsellor?.metrics?.averageRating || 0;

  // Helper function for session mode icons
  const getSessionModeIcon = (mode: string) => {
    switch (mode) {
      case "chat":
        return {
          icon: <BiChat className="text-xl" />,
          color: "bg-blue-100 text-blue-600 border-blue-200",
        };
      case "call":
        return {
          icon: <BiPhone className="text-xl" />,
          color: "bg-green-100 text-green-600 border-green-200",
        };
      case "video":
        return {
          icon: <BiVideo className="text-xl" />,
          color: "bg-purple-100 text-purple-600 border-purple-200",
        };
      case "in_person":
        return {
          icon: <BiUser className="text-xl" />,
          color: "bg-orange-100 text-orange-600 border-orange-200",
        };
      default:
        return {
          icon: <BiUser className="text-xl" />,
          color: "bg-gray-100 text-gray-600 border-gray-200",
        };
    }
  };

  return (
    <div className="max-w-[1300px] mx-auto py-12 px-4 sm:px-6">
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        appointmentDetails={{ mode, date, name }}
      />

      {/* Top section with expert info */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-[6.5fr_3fr] gap-8">
        <div className="space-y-8">
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-100 to-indigo-50 h-32"></div>
            <div className="p-6 relative">
              <div className="flex flex-col sm:flex-row gap-6">
                <img
                  src={profileImage || "/user-dummy-img.png"}
                  alt={name}
                  className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-md -mt-20"
                />
                <div className="pt-2 sm:pt-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold text-gray-800">{name}</h1>
                    <div className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-sm">
                      <FaStar className="mr-1" />
                      <span>{rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <h3 className="text-xl text-gray-600 mb-3">{title}</h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm">
                      <FaBriefcase className="text-[#642494]" />
                      <span>{yearsOfExperience}+ years experience</span>
                    </div>
                    {education.length > 0 && (
                      <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
                        <FaGraduationCap />
                        <span>{education[0].degree}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Languages */}
              {languages.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="text-gray-500 font-medium">Languages:</span>
                  {languages.map((lang, index) => (
                    <span
                      key={lang.language || `lang-${index}`}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {lang.language}
                    </span>
                  ))}
                </div>
              )}

              {/* Session Modes Pills */}
              <div className="mt-5 flex flex-wrap gap-3">
                {communicationModes.map((mode) => {
                  const { icon, color } = getSessionModeIcon(mode);
                  return (
                    <div
                      key={mode}
                      className={`px-4 py-2 rounded-full ${color} flex items-center gap-2 shadow-sm font-medium`}
                    >
                      {icon}
                      <span className="capitalize">
                        {mode.replace("_", " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Booking Component */}
          <OneExpertBookingCompoent
            id={id}
            rates={rates}
            className="lg:hidden flex flex-col items-center p-6 bg-white shadow-md rounded-2xl"
            counsellorName={name}
          />

          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              About {name}
            </h2>
            <TruncatedText text={biography} />
          </div>

          {/* Specialties Section */}
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              Specialties
            </h2>
            <div className="flex flex-wrap gap-3">
              {specialties.length > 0 ? (
                specialties.map((specialty, index) => (
                  <div
                    key={specialty || `specialty-${index}`}
                    className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2 rounded-lg border border-purple-200 shadow-sm"
                  >
                    {specialty}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No specialties listed</p>
              )}
            </div>
          </div>

          {/* Session Pricing Section */}
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              Session Pricing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rates.length > 0 ? (
                rates.map((rate, index) => {
                  const { icon, color } = getSessionModeIcon(rate.sessionType);
                  return (
                    <div
                      key={`rate-${index}`}
                      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-10 h-10 rounded-full ${color.split(" ")[0]
                            } flex items-center justify-center`}
                        >
                          {icon}
                        </div>
                        <h3 className="font-semibold text-lg">
                          {rate.sessionTitle || `${rate.sessionType} Session`}
                        </h3>
                      </div>
                      <p className="text-green-600 font-bold text-xl">
                        {rate.currency || "$"}
                        {rate.price || "Price not specified"}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {rate.sessionType?.replace("_", " ") ||
                          "No session type specified"}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 col-span-2">
                  Pricing information not available
                </p>
              )}
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              Education
            </h2>
            <div className="space-y-4">
              {education.length > 0 ? (
                education.map((edu, index) => (
                  <div
                    key={edu.degree || `edu-${index}`}
                    className="bg-blue-50 p-4 rounded-lg"
                  >
                    <h3 className="font-semibold text-lg">
                      {edu.degree || "Degree"}
                    </h3>
                    <p className="text-gray-700">{edu.field || "Field"}</p>
                    <p className="text-gray-600 text-sm">
                      {edu.institution || "Institution"} •{" "}
                      {edu.year || "Year not specified"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No education information available
                </p>
              )}
            </div>
          </div>

          {/* Licenses Section */}
          {counsellor?.professionalInfo?.licenses.length !== 0 && (
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-5">
                Licenses & Certifications
              </h2>
              <div className="space-y-4">
                {licenses.length > 0 ? (
                  licenses.map((license, index) => (
                    <div
                      key={license.type || `license-${index}`}
                      className="bg-green-50 p-4 rounded-lg"
                    >
                      <h3 className="font-semibold text-lg">
                        {license.type || "License"}
                      </h3>
                      <p className="text-gray-700">
                        Number: {license.licenseNumber || "Not provided"}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Issued by:{" "}
                        {license.issuingAuthority || "Authority not specified"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    No license information available
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Booking Component - Desktop */}
        <OneExpertBookingCompoent
          id={id}
          rates={rates}
          className="hidden lg:flex flex-col p-8 bg-white shadow-md rounded-2xl h-fit sticky top-24"
          counsellorName={name}
        />
      </div>
    </div>
  );
};

export default ExpertProfilePage;
