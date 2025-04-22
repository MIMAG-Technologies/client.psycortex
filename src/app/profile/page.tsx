"use client";

import { useAuth } from "@/context/AuthContext";
import SummarySection from "@/components/profile/SummarySection";
import { extractUserSessionHistory } from "@/utils/user";
import { ReferredTest } from "@/utils/userTypes";

export default function Profile() {
  const { user, me } = useAuth();

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

  // If user not available (handled by layout)
  if (!user || !me) {
    return null;
  }

  return (
    <SummarySection 
      userId={user.uid} 
      stats={me.stats} 
      extractUserSessionHistory={extractUserSessionHistory}
      getReferredTests={getReferredTests}
    />
  );
} 