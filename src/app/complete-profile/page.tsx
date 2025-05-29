"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { FaUser, FaEnvelope, FaPhone } from "react-icons/fa";
import axios from "axios";

export default function CompleteProfile() {
  const { user, me, isLoading, needsProfileCompletion, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

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
        return;
      }

      if (isEditMode) {
        if (me) {
          // Pre-fill data from existing user profile
          const dbDate = me.personalInfo.dateOfBirth;
          const formattedDate = dbDate ? formatDateForDisplay(dbDate) : "";

          setUserData({
            id: user.uid,
            name: me.personalInfo.name,
            email: me.personalInfo.email,
            phone: me.personalInfo.phone,
            dateOfBirth: formattedDate,
            profileImage: me.personalInfo.profileImage,
            gender: me.personalInfo.gender,
            timezone: me.preferences.timezone,
          });
        }
      } else {
        // Normal profile completion flow
        if (me && !needsProfileCompletion) {
          // User already has a complete profile, redirect to home
          router.push("/");
          return;
        }
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
  }, [user, me, isLoading, needsProfileCompletion, router, isEditMode]);

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
      const submissionData = {
        ...userData,
        dateOfBirth: formatDateForSubmission(dateOfBirth),
      };

      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await axios.post(
        `${BACKEND_URL}/user/submit_user_details.php`,
        submissionData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        if (isEditMode) {
          window.location.href = "/profile";
        } else {
          window.location.reload();
        }
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

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Format date from YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (dbDate: string): string => {
    if (!dbDate) return "";

    // Check if the date is already in DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dbDate)) return dbDate;

    try {
      const [year, month, day] = dbDate.split('-');
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date for display:", error);
      return dbDate; // Return original if parsing fails
    }
  };

  // Format date from DD/MM/YYYY to YYYY-MM-DD for database submission
  const formatDateForSubmission = (displayDate: string): string => {
    if (!displayDate) return "";

    // Check if the date is already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(displayDate)) return displayDate;

    try {
      const [day, month, year] = displayDate.split('/');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date for submission:", error);
      return displayDate; // Return original if parsing fails
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
          {isEditMode ? "Edit Profile" : "Complete Your Profile"}
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
                inputMode="numeric"
                pattern="[0-9]*"
                value={userData.phone}
                disabled={isEditMode}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={isEditMode ? "pl-10 w-full p-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed" : "pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"}
                placeholder="Your phone number"
                required
              />
            </div>
          </div>

          {/* Date of Birth Field */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-gray-700 mb-1">
              Date of Birth (DD/MM/YYYY)
            </label>
            <input
              id="dateOfBirth"
              type="text"
              value={userData.dateOfBirth}
              onChange={(e) => {
                const value = e.target.value;
                // Allow only numbers and forward slash
                const sanitized = value.replace(/[^\d/]/g, '');
                // Auto-add slashes after DD and MM
                const formatted = sanitized
                  .replace(/^(\d{2})(?=\d)/, '$1/')
                  .replace(/^(\d{2}\/\d{2})(?=\d)/, '$1/')
                  .slice(0, 10);
                handleInputChange("dateOfBirth", formatted);
              }}
              placeholder="DD/MM/YYYY"
              pattern="\d{2}/\d{2}/\d{4}"
              maxLength={10}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <small className="text-gray-500 mt-1 block">
              Example: 01/01/1990
            </small>
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
            className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-70"
          >
            {submitLoading
              ? "Processing..."
              : isEditMode
                ? "Save Changes"
                : "Complete Profile"}
          </button>

          {isEditMode && (
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="w-full bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Log Out
          </button>
        </form>
      </div>
    </div>
  );
}