"use client";

import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaVenusMars, FaSignOutAlt, FaEdit } from "react-icons/fa";

interface ProfileHeaderProps {
  user: any;
  logout: () => Promise<void>;
}

export default function ProfileHeader({ user, logout }: ProfileHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleEditProfile = () => {
    router.push('/complete-profile?mode=edit');
  };

  if (!user) return null;

  return (
    <div className="bg-gradient-to-r from-[#642494]/5 to-[#642494]/10 rounded-xl shadow-md p-4 sm:p-6 mb-6 backdrop-blur-sm border border-[#642494]/20">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {/* Profile Avatar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#642494] to-[#8a35c9] flex items-center justify-center mx-auto md:mx-0 md:mr-6 overflow-hidden shadow-lg border-4 border-white">
          {user.personalInfo.profileImage ? (
            <img
              src={user.personalInfo.profileImage}
              alt={user.personalInfo.name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <FaUser className="text-white text-4xl sm:text-5xl" />
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {user.personalInfo.name}
          </h1>
          <div className="text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm sm:text-base">
            <div className="flex items-center justify-center md:justify-start">
              <div className="bg-[#642494]/10 p-1.5 rounded-full mr-2 shrink-0">
                <FaEnvelope className="text-[#642494] text-xs sm:text-sm" />
              </div>
              <span className="truncate">{user.personalInfo.email}</span>
            </div>
            
            <div className="flex items-center justify-center md:justify-start">
              <div className="bg-[#642494]/10 p-1.5 rounded-full mr-2 shrink-0">
                <FaPhone className="text-[#642494] text-xs sm:text-sm" />
              </div>
              <span>{user.personalInfo.phone}</span>
            </div>
            
            <div className="flex items-center justify-center md:justify-start">
              <div className="bg-[#642494]/10 p-1.5 rounded-full mr-2 shrink-0">
                <FaBirthdayCake className="text-[#642494] text-xs sm:text-sm" />
              </div>
                <span>{new Date(user.personalInfo.dateOfBirth).toLocaleDateString('en-GB')}</span>
            </div>
            
            <div className="flex items-center justify-center md:justify-start">
              <div className="bg-[#642494]/10 p-1.5 rounded-full mr-2 shrink-0">
                <FaVenusMars className="text-[#642494] text-xs sm:text-sm" />
              </div>
              <span className="capitalize">{user.personalInfo.gender}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 lg:my-auto md:mt-0 flex flex-col gap-2 w-full md:w-auto">
          <button
            onClick={handleEditProfile}
            className="flex-1 md:flex-none flex items-center justify-center px-6 py-2 bg-gradient-to-r from-[#642494] to-[#8a35c9] text-white rounded-md hover:from-[#8a35c9] hover:to-[#642494] transition-all shadow-md whitespace-nowrap"
          >
            <FaEdit className="mr-2" /> Edit Profile
          </button>
          
          <button
            onClick={handleLogout}
            className="flex-1 md:flex-none flex items-center justify-center px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 transition-all shadow-md whitespace-nowrap"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
