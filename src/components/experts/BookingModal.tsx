"use client";

import { useState } from "react";
import { FaCalendarAlt, FaClock, FaVideo, FaUser, FaFileAlt, FaUserFriends } from "react-icons/fa";
import { BiChat, BiPhone, BiUser, BiVideo } from "react-icons/bi";
import { bookSession } from "@/utils/session";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    name: string;
    id: string;
  };
  counsellorData: {
    name: string;
    id: string;
  };
  bookingData: {
    mode: string;
    date: string;
    time: string;
    sessionType: string;
    price: number;
    currency: string;
    isCouple: boolean;
  };
}

const BookingModal = ({
  isOpen,
  onClose,
  userData,
  counsellorData,
  bookingData,
}: BookingModalProps) => {
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderModeIcon = () => {
    switch (bookingData.mode) {
      case "chat":
        return <BiChat className="text-green-600 text-xl" />;
      case "call":
        return <BiPhone className="text-green-600 text-xl" />;
      case "video":
        return <BiVideo className="text-green-600 text-xl" />;
      case "in_person":
        return <BiUser className="text-green-600 text-xl" />;
      default:
        return <BiVideo className="text-green-600 text-xl" />;
    }
  };

  const formatModeName = (mode: string) => {
    switch (mode) {
      case "chat":
        return "Chat";
      case "call":
        return "Call";
      case "video":
        return "Video";
      case "in_person":
        return "In-person";
      default:
        return mode;
    }
  };

  const handlebooking = async () => {
    setIsLoading(true);
    try {
      const res = await bookSession(bookingData.mode as "chat" | "video", bookingData.isCouple, {
        user_id: userData.id,
        counsellor_id: counsellorData.id,
        scheduled_at: bookingData.date + bookingData.time
      });

      if (res) {
        toast.success("Booking Successfully");
        router.push('/profile/sessions');
      } else {
        toast.error("Booking Failed");
      }
    } catch (error) {
      toast.error("An error occurred while booking");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-purple-800 text-white p-4">
          <h2 className="text-xl font-bold">Confirm Booking</h2>
        </div>

        <div className="p-6">
          {/* Booking details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Client:</p>
              <p className="font-semibold">{userData.name}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-gray-600">Counsellor:</p>
              <p className="font-semibold">{counsellorData.name}</p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-600">
                <FaCalendarAlt />
                <span>Date:</span>
              </div>
              <p className="font-semibold">{bookingData.date}</p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-600">
                <FaClock />
                <span>Time:</span>
              </div>
              <p className="font-semibold">{bookingData.time}</p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-600">
                {renderModeIcon()}
                <span>Mode:</span>
              </div>
              <p className="font-semibold">{formatModeName(bookingData.mode)}</p>
            </div>

            {bookingData.isCouple && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaUserFriends />
                  <span>Session Type:</span>
                </div>
                <p className="font-semibold text-pink-600 flex items-center">
                  <span className="mr-1">Couple Counselling</span>
                  <FaUserFriends size={14} />
                </p>
              </div>
            )}

            <div className="flex justify-between items-center text-lg font-bold text-purple-800">
              <p>Total:</p>
              <p>{bookingData.currency} {bookingData.price}</p>
            </div>
          </div>

          {/* Terms and conditions */}
          <div className="mt-6 border-t pt-4">
            <div className="bg-gray-50 p-3 rounded-lg mb-4 max-h-[150px] overflow-y-auto text-sm">
              <div className="flex items-start mb-2">
                <FaFileAlt className="text-gray-400 mt-1 mr-2" />
                <strong className="text-gray-800">Terms and Conditions</strong>
              </div>
              <ul className="list-disc ml-6 space-y-2 text-gray-600">
                <li>Cancellations are allowed up to 2 hours before the session with a full refund.</li>
                <li>The session link/details will be sent 15 minutes before the scheduled time.</li>
                <li>The counsellor may reschedule if they're unavailable due to an emergency.</li>
                <li>All sessions are confidential and adhere to our privacy policy.</li>
                <li>By proceeding with the payment, you agree to these terms.</li>
              </ul>
            </div>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                checked={isTermsAccepted}
                onChange={() => setIsTermsAccepted(!isTermsAccepted)}
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the terms and conditions
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            <button
              className="flex-1 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className={`flex-1 py-2 rounded-lg font-medium text-white ${
                isTermsAccepted && !isLoading
                  ? "bg-purple-700 hover:bg-purple-800"
                  : "bg-purple-300 cursor-not-allowed"
              } relative`}
              disabled={!isTermsAccepted || isLoading}
              onClick={handlebooking}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="ml-2">Processing...</span>
                </div>
              ) : (
                `Pay ${bookingData.currency} ${bookingData.price}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal; 