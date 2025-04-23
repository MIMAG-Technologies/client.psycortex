"use client";

import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaVenusMars } from "react-icons/fa";

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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start">
        {/* Profile Avatar */}
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-[#642494]/10 flex items-center justify-center mb-4 md:mb-0 md:mr-8 overflow-hidden shadow-lg border-4 border-white">
          {user.personalInfo.profileImage ? (
            <img
              src={user.personalInfo.profileImage}
              alt={user.personalInfo.name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <FaUser className="text-[#642494] text-5xl" />
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
            {user.personalInfo.name}
          </h1>
          <div className="text-gray-500 flex flex-col space-y-1">
            <div className="flex items-center justify-center md:justify-start">
              <FaEnvelope className="text-[#642494] mr-2" />
              <span>{user.personalInfo.email}</span>
            </div>
            
            <div className="flex items-center justify-center md:justify-start">
              <FaPhone className="text-[#642494] mr-2" />
              <span>{user.personalInfo.phone}</span>
            </div>
            
            <div className="flex items-center justify-center md:justify-start">
              <FaBirthdayCake className="text-[#642494] mr-2" />
              <span>{user.personalInfo.dateOfBirth}</span>
            </div>
            
            <div className="flex items-center justify-center md:justify-start">
              <FaVenusMars className="text-[#642494] mr-2" />
              <span className="capitalize">{user.personalInfo.gender}</span>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="mt-4 md:mt-0 flex flex-wrap justify-center md:justify-end gap-3 md:ml-4">
          <StatBadge 
            label="Sessions" 
            value={
              user.stats.counselling.total + 
              user.stats.chat.total + 
              user.stats.call.total + 
              user.stats.offline.total
            } 
            color="bg-[#642494]/10 text-[#642494]"
          />
          <StatBadge 
            label="Upcoming" 
            value={
              user.stats.counselling.upcoming + 
              user.stats.chat.upcoming + 
              user.stats.call.upcoming + 
              user.stats.offline.upcoming
            } 
            color="bg-green-100 text-green-700"
          />
          <StatBadge 
            label="Tests" 
            value={user.stats.tests.total} 
            color="bg-purple-100 text-purple-700"
          />
          <StatBadge 
            label="Completed" 
            value={user.stats.tests.completed} 
            color="bg-blue-100 text-blue-700"
          />
          
          <button
            onClick={handleLogout}
            className="mt-4 md:mt-4 w-full md:w-auto flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// Stat Badge Component
function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`px-3 py-1 rounded-full ${color} text-center min-w-[80px]`}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
} 