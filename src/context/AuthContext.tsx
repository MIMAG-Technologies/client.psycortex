"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  User
} from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import axios from "axios";
import { useRouter } from "next/navigation";

 export type Me = {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: "male" | "female" | "other";
    profileImage: string; // URL
  };
  preferences: {
    timezone: string;
  };
  accountInfo: {
    createdAt: string;
  };
  stats: {
    counselling: {
      total: number;
      completed: number;
      upcoming: number;
    };
    chat: {
      total: number;
      completed: number;
      upcoming: number;
    };
    call: {
      total: number;
      completed: number;
      upcoming: number;
      cancelled: number;
      missed: number;
    };
    tests: {
      total: number;
      completed: number;
      active: number;
      pending: number;
      paid: number;
      referred: number;
      referredUnpaid: number;
    };
    offline: {
      total: number;
      completed: number;
      upcoming: number;
    };
  };
};

type AuthContextType = {
  user: User | null;
  me: Me | null;
  userAge: number | null;
  isLoading: boolean;
  setLoading: (value: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  needsProfileCompletion: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number | null => {
  if (!dateOfBirth) return null;
  
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null; // Invalid date
  
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();
  
  // If birthday hasn't occurred yet this year, subtract one year
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [userAge, setUserAge] = useState<number | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const router = useRouter();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Calculate age whenever me changes
  useEffect(() => {
    if (me?.personalInfo?.dateOfBirth) {
      setUserAge(calculateAge(me.personalInfo.dateOfBirth));
    } else {
      setUserAge(null);
    }
  }, [me]);

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

  // Check if user is logged in on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      console.log(currentUser?.uid);

      setLoading(true);

      if (currentUser) {
        try {
          const res = await axios.get<{ user: Me }>(
            `${BACKEND_URL}/user/get_user_details.php?userId=${currentUser.uid}`
          );
          setMe(res.data.user);
          setNeedsProfileCompletion(false);
        } catch (error) {
          console.error("Failed to fetch user details:", error);
          setNeedsProfileCompletion(true);
        }
      } else {
        setMe(null);
        setNeedsProfileCompletion(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [BACKEND_URL]);

  // Register function
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, { displayName: name });
      await sendEmailVerification(userCredential.user);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // Login with Google
  const loginWithGoogle = async (): Promise<void> => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        me,
        userAge,
        isLoading,
        setLoading,
        login,
        loginWithGoogle,
        logout,
        register,
        resetPassword,
        needsProfileCompletion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 