"use client";

import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthStateHandler({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth();

  // Show a minimal loading indicator during initial auth check
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#642494]"></div>
      </div>
    );
  }

  return <>{children}</>;
} 