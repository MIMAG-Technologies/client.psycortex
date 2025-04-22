"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getExpertDetails } from "@/utils/experts";
import { FaCalendarAlt, FaClock, FaUserMd, FaVideo, FaPhone } from "react-icons/fa";
import Link from "next/link";

export default function BookingConfirmation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    communicationPreference: "video"
  });
  const [loading, setLoading] = useState(true);
  const [expert, setExpert] = useState<any>(null);

  // Get booking data from URL parameters
  const expertId = searchParams.get("expertId");
  const sessionType = searchParams.get("sessionType");
  const date = searchParams.get("date");
  const timeSlot = searchParams.get("timeSlot");

  useEffect(() => {
    // Validate required parameters
    if (!expertId || !sessionType || !date || !timeSlot) {
      router.push("/experts");
      return;
    }

    // Fetch expert details
    const fetchExpertDetails = async () => {
      try {
        const data = await getExpertDetails(expertId);
        setExpert(data);
      } catch (error) {
        console.error("Error fetching expert details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpertDetails();
  }, [expertId, sessionType, date, timeSlot, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real application, you would submit this to an API
    console.log("Booking submitted:", {
      expertId,
      sessionType,
      date,
      timeSlot,
      ...formData
    });

    // Show success message and redirect
    alert("Your appointment has been booked successfully!");
    router.push("/experts");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Your Information</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-4"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-4"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-4"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="communicationPreference">
                  Communication Preference
                </label>
                <select
                  id="communicationPreference"
                  name="communicationPreference"
                  value={formData.communicationPreference}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-4"
                  required
                >
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="inperson">In Person</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="notes">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md py-2 px-4"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Link
                  href={`/experts/${expertId}`}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back
                </Link>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              
              {expert && (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaUserMd className="text-indigo-600 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Expert</p>
                      <p>{expert.name}</p>
                      <p className="text-sm text-gray-600">{expert.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaCalendarAlt className="text-indigo-600 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p>{formatDate(date as string)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaClock className="text-indigo-600 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p>{timeSlot}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-indigo-600 mt-1 mr-3">
                      {formData.communicationPreference === 'video' ? (
                        <FaVideo />
                      ) : formData.communicationPreference === 'phone' ? (
                        <FaPhone />
                      ) : (
                        <FaUserMd />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Session Type</p>
                      <p>{sessionType}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <p className="font-medium">Price</p>
                    <p className="text-xl font-bold text-indigo-700">
                      ${expert.sessionPricing.rates.find((r: any) => r.sessionType === sessionType)?.price || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 