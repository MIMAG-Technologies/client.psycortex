"use client";

import { useAuth } from "@/context/AuthContext";
import SummarySection from "@/components/profile/SummarySection";
import { extractUserSessionHistory } from "@/utils/user";

export default function Profile() {
  const { user, me } = useAuth();


  // If user not available (handled by layout)
  if (!user || !me) {
    return null;
  }

  return (
    <SummarySection 
      userId={user.uid} 
      stats={me.stats} 
      extractUserSessionHistory={extractUserSessionHistory}
    />
  );
} 