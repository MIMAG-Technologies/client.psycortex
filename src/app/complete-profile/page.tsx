"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FaUser, FaEnvelope, FaPhone } from "react-icons/fa";
import axios from "axios";

export default function CompleteProfile() {
  const { user, me, isLoading, needsProfileCompletion } = useAuth();
  const router = useRouter();

  const initialUserData = {
    id: "",
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    profileImage: "",
    gender: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  const [userData, setUserData] = useState(initialUserData);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // User not logged in, redirect to login
        router.push("/login");
      } else if (me && !needsProfileCompletion) {
        // User already has a complete profile, redirect to home
        router.push("/");
      } else if (user) {
        // Pre-fill data from Firebase user
        setUserData((prev) => ({
          ...prev,
          id: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          profileImage: user.photoURL || "",
        }));
      }
    }
  }, [user, me, isLoading, needsProfileCompletion, router]);

  const handleInputChange = useCallback(
    (field: keyof typeof userData, value: string) => {
      setUserData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitLoading(true);

    const { dateOfBirth, gender, phone, name } = userData;

    if (!dateOfBirth || !gender || !phone || !name) {
      setError("Please fill all required fields");
      setSubmitLoading(false);
      return;
    }

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await axios.post(
        `${BACKEND_URL}/user/submit_user_details.php`,
        userData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        // Profile completed successfully, redirect
        router.push("/");
      } else {
        setError(response.data.message || "Failed to complete profile");
      }
    } catch (error: any) {
      console.error("Error submitting profile:", error);
      setError(
        error.response?.data?.message ||
          "Failed to complete profile. Please try again."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
          Complete Your Profile
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Please provide these additional details to set up your account.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-gray-700 mb-1">
              Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                value={userData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your full name"
                required
              />
            </div>
          </div>

          {/* Email Field - Disabled */}
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={userData.email}
                className="pl-10 w-full p-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                placeholder="Your email"
                disabled
              />
            </div>
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-gray-700 mb-1">
              Phone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="text-gray-400" />
              </div>
              <input
                id="phone"
                type="tel"
                value={userData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your phone number"
                required
              />
            </div>
          </div>

          {/* Date of Birth Field */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              type="date"
              value={userData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Gender Field */}
          <div>
            <label htmlFor="gender" className="block text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              value={userData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full mt-6 bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-70"
          >
            {submitLoading ? "Processing..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
} 