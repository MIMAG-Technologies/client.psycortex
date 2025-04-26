"use client";

import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaVenusMars, FaSignOutAlt } from "react-icons/fa";

interface ProfileHeaderProps {
  user: any;
  logout: () => Promise<void>;
}

export default function ProfileHeader({ user, logout }: ProfileHeaderProps) {
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
              <span>{user.personalInfo.dateOfBirth}</span>
            </div>
            
            <div className="flex items-center justify-center md:justify-start">
              <div className="bg-[#642494]/10 p-1.5 rounded-full mr-2 shrink-0">
                <FaVenusMars className="text-[#642494] text-xs sm:text-sm" />
              </div>
              <span className="capitalize">{user.personalInfo.gender}</span>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="mt-4 md:mt-0 flex flex-wrap justify-center md:justify-end gap-2 sm:gap-3 w-full md:w-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full">
            <StatBadge 
              label="Sessions" 
              value={
                user.stats.counselling.total + 
                user.stats.chat.total + 
                user.stats.call.total + 
                user.stats.offline.total
              } 
              color="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
            />
            <StatBadge 
              label="Upcoming" 
              value={
                user.stats.counselling.upcoming + 
                user.stats.chat.upcoming + 
                user.stats.call.upcoming + 
                user.stats.offline.upcoming
              } 
              color="bg-gradient-to-r from-green-500 to-green-600 text-white"
            />
            <StatBadge 
              label="Tests" 
              value={user.stats.tests.total} 
              color="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
            />
            <StatBadge 
              label="Completed" 
              value={user.stats.tests.completed} 
              color="bg-gradient-to-r from-blue-400 to-blue-500 text-white"
            />
          </div>
          
          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 transition-all shadow-md"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// Stat Badge Component
function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`px-3 py-2 rounded-lg ${color} text-center min-w-[80px] shadow-md`}>
      <div className="text-base sm:text-lg font-bold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
} 