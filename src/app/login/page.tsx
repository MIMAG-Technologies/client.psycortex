"use client";

import { useState, useEffect } from "react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isResettingPassword) {
        await resetPassword(email);
        setLoading(false);
        setIsResettingPassword(false);
        alert("Password reset email sent. Check your inbox.");
        return;
      }

      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }

      // Successful login/register
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push(needsProfileCompletion ? "/complete-profile" : "/");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Authentication failed");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    
    try {
      await loginWithGoogle();
      
      // Successful login
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push(needsProfileCompletion ? "/complete-profile" : "/");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Google login failed");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#642494]/10 to-[#642494]/30 z-0">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
      </div>
      
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 z-10 backdrop-blur-sm bg-white/95">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-[#642494]/10 flex items-center justify-center rounded-full">
            <FaUser className="text-[#642494] text-3xl" />
          </div>
        </div>
        
        {isResettingPassword ? (
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Reset Password</h1>
        ) : (
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">{isLogin ? "Login" : "Create Account"}</h1>
        )}

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">{error}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && !isResettingPassword && (
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#642494]"
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
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#642494]"
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
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#642494]"
                  placeholder="Your password"
                  required={!isResettingPassword}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
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

          <button
            type="submit"
            className="w-full bg-[#642494] text-white py-3 rounded-md hover:bg-[#4e1c72] transition-colors shadow-md"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : isResettingPassword ? (
              "Send Reset Link"
            ) : isLogin ? (
              "Login"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {!isResettingPassword && (
          <>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-md py-3 px-4 hover:bg-gray-50 shadow-sm"
                  disabled={loading}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                    </g>
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              {isLogin ? (
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <button 
                    onClick={() => setIsLogin(false)} 
                    className="text-[#642494] hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <button 
                    onClick={() => setIsLogin(true)} 
                    className="text-[#642494] hover:underline font-medium"
                  >
                    Login
                  </button>
                </p>
              )}
            </div>
          </>
        )}

        <div className="mt-4 text-center">
          {isResettingPassword ? (
            <button 
              onClick={() => setIsResettingPassword(false)} 
              className="text-[#642494] hover:underline text-sm font-medium"
            >
              Back to login
            </button>
          ) : (
            <button 
              onClick={() => setIsResettingPassword(true)} 
              className="text-[#642494] hover:underline text-sm font-medium"
            >
              Forgot password?
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 