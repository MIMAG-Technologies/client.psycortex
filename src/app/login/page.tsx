"use client";

import { useState } from "react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, register, loginWithGoogle, resetPassword, needsProfileCompletion } = useAuth();
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
        
        // Check if profile completion needed, otherwise go to profile
        if (needsProfileCompletion) {
          router.push("/complete-profile");
        } else {
          router.push("/profile");
        }
      } else {
        if (!name) {
          setError("Name is required for registration");
          setLoading(false);
          return;
        }
        
        await register(name, email, password);
        // After registration, redirect to login and show success message
        setIsLogin(true);
        setError("");
        setPassword("");
        setLoading(false);
        // Display success message (you might want to add a success state)
        alert("Registration successful! Please verify your email to login.");
        return;
      }
    } catch (err: any) {
      let message = "Authentication failed. Please check your credentials.";
      
      // Handle specific Firebase errors
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        message = "Invalid email or password.";
      } else if (err.code === "auth/email-already-in-use") {
        message = "This email is already registered.";
      } else if (err.code === "auth/weak-password") {
        message = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        message = "Invalid email format.";
      } else if (err.code === "auth/network-request-failed") {
        message = "Network error. Please check your connection.";
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      
      // Check if profile completion needed
      if (needsProfileCompletion) {
        router.push("/complete-profile");
      } else {
        router.push("/profile");
      }
    } catch (err) {
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email to reset the password.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      alert("Password reset email sent! Please check your inbox or spam folder.");
      setIsResettingPassword(false);
    } catch (err: any) {
      let message = "Error sending password reset email.";
      
      if (err.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (err.code === "auth/invalid-email") {
        message = "Invalid email format.";
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
          {isResettingPassword 
            ? "Reset Password" 
            : isLogin 
              ? "Login to Your Account" 
              : "Create Account"}
        </h1>
        
        <p className="text-gray-600 mb-6 text-center">
          {isResettingPassword 
            ? "Enter your email to receive a password reset link." 
            : isLogin 
              ? "Welcome back! Log in to continue your journey with us." 
              : "Create an account to unlock a personalized experience tailored just for you!"}
        </p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-1">Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your full name"
                  required={!isLogin}
                />
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your email address"
                required
              />
            </div>
          </div>
          
          {!isResettingPassword && (
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your password"
                  required={!isResettingPassword}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm"
                >
                  {showPassword ? (
                    <FiEyeOff className="text-gray-400" />
                  ) : (
                    <FiEye className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          )}
          
          {isResettingPassword ? (
            <>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-70"
              >
                {loading ? "Processing..." : "Send Reset Link"}
              </button>
              <button
                type="button"
                onClick={() => setIsResettingPassword(false)}
                className="w-full mt-2 bg-gray-200 text-gray-800 p-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back to Login
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-70"
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Create Account"}
            </button>
          )}
        </form>
        
        {!isResettingPassword && (
          <div className="mt-4 text-center">
            <button
              onClick={toggleAuthMode}
              className="text-indigo-600 hover:text-indigo-800"
            >
              {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
            </button>
            
            {isLogin && (
              <p
                onClick={() => setIsResettingPassword(true)}
                className="mt-2 text-gray-600 hover:text-indigo-600 text-sm cursor-pointer"
              >
                Forgot your password?
              </p>
            )}
          </div>
        )}
        
        {!isResettingPassword && (
          <>
            <div className="flex items-center justify-between mt-6">
              <span className="w-1/2 border-b dark:border-gray-600 md:w-1/2"></span>
              <p className="text-xs text-gray-500 uppercase dark:text-gray-400 mx-2">OR</p>
              <span className="w-1/2 border-b dark:border-gray-600 md:w-1/2"></span>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex items-center justify-center w-full mt-4 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60999L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                  fill="#EA4335"
                />
                <path
                  d="M23.49 12.275C23.49 11.49 23.4149 10.73 23.2799 10H12V14.51H18.47C18.13 15.99 17.26 17.25 16 18.1L19.88 21.1C22.16 19 23.49 15.92 23.49 12.275Z"
                  fill="#4285F4"
                />
                <path
                  d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.8804 21.095L16.0004 18.095C14.9654 18.785 13.6204 19.17 12.0004 19.17C8.8704 19.17 6.21537 17.06 5.2654 14.295L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                  fill="#34A853"
                />
              </svg>
              Continue with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
} 