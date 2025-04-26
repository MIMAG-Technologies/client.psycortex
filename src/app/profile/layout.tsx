"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FaUser, FaFileAlt, FaCalendarAlt } from "react-icons/fa";
import ProfileHeader from "@/components/profile/ProfileHeader";
import Link from "next/link";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const { user, me, logout, isLoading, needsProfileCompletion } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("");

  // Set active tab based on path
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("/profile/tests")) {
      setActiveTab("tests");
    } else if (path.includes("/profile/sessions")) {
      setActiveTab("sessions");
    } else {
      setActiveTab("summary");
    }
  }, []);

  // Redirect if not logged in or needs profile completion
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (needsProfileCompletion) {
        router.push("/complete-profile");
      }
    }
  }, [user, isLoading, router, needsProfileCompletion]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#642494]"></div>
      </div>
    );
  }

  if (!user || !me) {
    return null; // Will redirect to login via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <ProfileHeader user={me} logout={logout} />

          {/* Profile Tabs */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="border-b flex bg-gradient-to-r from-[#642494]/5 to-[#642494]/10 overflow-x-auto scrollbar-hide">
              <TabButton 
                onClick={()=>{
                  setActiveTab("summary")
                }}
                href="/profile"
                active={activeTab === "summary"} 
                icon={<FaUser />}
                label="Summary"
              />
              <TabButton 
                onClick={()=>{
                  setActiveTab("sessions")
                }}
                href="/profile/sessions"
                active={activeTab === "sessions"} 
                icon={<FaCalendarAlt />}
                label="Session History"
              />
              <TabButton 
                onClick={()=>{
                  setActiveTab("tests")
                }}
                href="/profile/tests"
                active={activeTab === "tests"} 
                icon={<FaFileAlt />}
                label="Test Results"
              />
            </div>

            <div className="p-4 sm:p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({ 
  href,
  active, 
  icon, 
  label,
  onClick
}: { 
  href: string;
  active: boolean; 
  icon: React.ReactNode; 
  label: string;
  onClick: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className="flex-1 min-w-fit">
      <div
        className={`flex items-center justify-center py-3 sm:py-4 px-3 sm:px-6 focus:outline-none transition-all cursor-pointer whitespace-nowrap ${
          active
            ? "border-b-2 border-[#642494] text-[#642494] font-semibold bg-white"
            : "text-gray-600 hover:text-[#642494] hover:bg-white/50"
        }`}
      >
        <span className="mr-1 sm:mr-2">{icon}</span>
        <span className="font-medium text-sm sm:text-base">{label}</span>
      </div>
    </Link>
  );
} 