"use client";

import { useAuth } from "@/context/AuthContext";
import SessionHistory from "@/components/profile/SessionHistory";
export default function SessionsPage() {
  const { user } = useAuth();

  // If user not available (handled by layout)
  if (!user) {
    return null;
  }

  return (
    <SessionHistory 
      userId={user.uid} 
    />
  );
} 