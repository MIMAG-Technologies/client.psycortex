"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FaUser, FaFileAlt, FaCalendarAlt } from "react-icons/fa";
import ProfileHeader from "@/components/profile/ProfileHeader";
import SummarySection from "@/components/profile/SummarySection";
import SessionHistory from "@/components/profile/SessionHistory";
import axios from "axios";
import { HistoryItem, ReferredTest } from "@/utils/userTypes";
import { extractUserSessionHistory } from "@/utils/user";
import { getReferredTests } from "@/utils/test";

export default function Profile() {
  const { user, me, logout, isLoading, needsProfileCompletion } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("summary");

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


  const getReferredTests = async (userId: string): Promise<ReferredTest[]> => {
    // Mock data for demo purposes
    return [
      {
        bookingId: "test1",
        testSlug: "anxiety-assessment",
        status: "pending",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        payment: {
          id: "pay1",
          amount: 39.99,
          currency: "$",
          isPaid: false,
          status: "pending"
        },
        referredBy: {
          id: "counselor1",
          name: "Dr. Sarah Johnson",
          specialization: "Anxiety & Stress Management"
        },
        test: {
          id: "test-anxiety",
          title: "Comprehensive Anxiety Assessment",
          slug: "anxiety-assessment",
          description: "Evaluates your anxiety levels across different situations",
          duration: 15,
          price: 39.99,
          currency: "$",
          category: "Mental Health",
          tags: ["anxiety", "stress", "assessment"]
        }
      }
    ];
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || !me) {
    return null; // Will redirect to login via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <ProfileHeader user={me} logout={logout} />

        {/* Profile Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b flex flex-wrap">
            <TabButton 
              active={activeTab === "summary"} 
              onClick={() => setActiveTab("summary")}
              icon={<FaUser />}
              label="Summary"
            />
            <TabButton 
              active={activeTab === "sessions"} 
              onClick={() => setActiveTab("sessions")}
              icon={<FaCalendarAlt />}
              label="Session History"
            />
            <TabButton 
              active={activeTab === "tests"} 
              onClick={() => setActiveTab("tests")}
              icon={<FaFileAlt />}
              label="Test Results"
            />
          </div>

          <div className="p-6">
            {activeTab === "summary" && (
              <SummarySection 
                userId={user.uid} 
                stats={me.stats} 
                extractUserSessionHistory={extractUserSessionHistory}
                getReferredTests={getReferredTests}
              />
            )}
            {activeTab === "sessions" && (
              <SessionHistory 
                userId={user.uid} 
                extractUserSessionHistory={extractUserSessionHistory}
              />
            )}
            {activeTab === "tests" && (
              <div className="text-center py-10 text-gray-500">
                <p>Test results feature coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string 
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center py-3 px-6 focus:outline-none transition-colors ${
        active
          ? "border-b-2 border-indigo-500 text-indigo-600"
          : "text-gray-600 hover:text-indigo-500"
      }`}
    >
      <span className="mr-2">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
} 