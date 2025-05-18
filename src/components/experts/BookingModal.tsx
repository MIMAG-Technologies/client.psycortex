"use client";

import { useState, useRef } from "react";
import { FaCalendarAlt, FaClock, FaFileAlt, FaUserFriends } from "react-icons/fa";
import { BiChat, BiPhone, BiUser, BiVideo } from "react-icons/bi";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

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
  const formRef = useRef<HTMLFormElement>(null);

  if (!isOpen) return null;
  const tax = 18;

  // Calculate amount with tax
  const amountWithTax = bookingData.price + (bookingData.price * tax) / 100; // Assuming 18% tax
  const orderId = `order_${Date.now()}`;

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePayment = () => {
    if (
      !me?.personalInfo.name ||
      !me?.personalInfo.email ||
      !me?.personalInfo.phone ||
      !me?.preferences.timezone ||
      !me?.id
    ) {
      toast.error("Please complete your profile before booking a session.");
      return;
    }

    if (formRef.current) {
      formRef.current.submit();
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

  const { me } = useAuth();


  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <form
        ref={formRef}
        method="post"
        action={`${process.env.NEXT_PUBLIC_BACKEND_URL}/ccavenue/webCCAVRequestHandler.php`}
        style={{ display: "none" }}
      >
        <input type="hidden" name="tid" value={Date.now().toString()} />
        <input
          type="hidden"
          name="merchant_id"
          value={process.env.NEXT_PUBLIC_MERCHANT_ID || ""}
        />
        <input type="hidden" name="order_id" value={orderId} />
        <input type="hidden" name="amount" value={amountWithTax.toString()} />
        <input type="hidden" name="currency" value="INR" />
        <input
          type="hidden"
          name="redirect_url"
          value={`${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/web_process_payment.php`}
        />
        <input
          type="hidden"
          name="cancel_url"
          value={`${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/web_process_payment.php`}
        />
        <input type="hidden" name="language" value="EN" />
        <input
          type="hidden"
          name="billing_name"
          value={me?.personalInfo.name || ""}
        />
        <input
          type="hidden"
          name="billing_email"
          value={me?.personalInfo.email || ""}
        />
        <input
          type="hidden"
          name="billing_tel"
          value={me?.personalInfo.phone || ""}
        />
        <input type="hidden" name="billing_country" value="India" />
        <input
          type="hidden"
          name="delivery_name"
          value={me?.personalInfo.name || ""}
        />
        <input
          type="hidden"
          name="delivery_tel"
          value={me?.personalInfo.phone || ""}
        />
        <input type="hidden" name="delivery_country" value="India" />
        <input
          type="hidden"
          name="merchant_param1"
          value={bookingData.isCouple ? "couple_pay" : "appointment_pay"}
        />
        <input type="hidden" name="merchant_param2" value={me?.id || ""} />
        <input
          type="hidden"
          name="merchant_param3"
          value={counsellorData.id || ""}
        />
        <input
          type="hidden"
          name="merchant_param4"
          value={bookingData.date + " " + bookingData.time}
        />
        <input type="hidden" name="merchant_param5" value={bookingData.mode} />
      </form>

      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden my-4">
        <div className="bg-purple-800 text-white p-3">
          <h2 className="text-lg font-bold">Confirm Booking</h2>
        </div>

        <div className="p-4 max-h-[80vh] overflow-y-auto">
          {/* Booking details */}
          <div className="space-y-3">
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
              <p className="font-semibold">
                {new Date(bookingData.date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-600">
                <FaClock />
                <span>Time:</span>
              </div>
              <p className="font-semibold">
                {new Date(`2000-01-01T${bookingData.time}`).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-600">
                {renderModeIcon()}
                <span>Mode:</span>
              </div>
              <p className="font-semibold">
                {formatModeName(bookingData.mode)}
              </p>
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

            <div className="space-y-2">
              <div className="flex justify-between items-center text-gray-600">
                <p>Base Price:</p>
                <p>{bookingData.currency} {bookingData.price}</p>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <p>GST (18%):</p>
                <p>{bookingData.currency} {(bookingData.price * 0.18).toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-purple-800 border-t pt-2">
                <p>Total:</p>
                <p>{bookingData.currency} {(bookingData.price * 1.18).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Terms and conditions */}
          <div className="mt-4 border-t pt-3">
            <div className="bg-gray-50 p-2 rounded-lg mb-3 max-h-[120px] overflow-y-auto text-sm">
              <div className="flex items-start mb-2">
                <FaFileAlt className="text-gray-400 mt-1 mr-2" />
                <strong className="text-gray-800">Terms and Conditions</strong>
              </div>
              <ul className="list-disc ml-6 space-y-2 text-gray-600">
                <li>
                  No cancellations or rescheduling is available. Once booked, the session cannot be changed or cancelled.
                </li>
                <li>
                  All sessions are confidential and adhere to our privacy
                  policy.
                </li>
                <li>
                  By proceeding with the payment, you agree to these terms.
                </li>
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
            >
              Cancel
            </button>
            <button
              className={`flex-1 py-2 rounded-lg font-medium text-white ${isTermsAccepted
                ? "bg-purple-700 hover:bg-purple-800"
                : "bg-purple-300 cursor-not-allowed"
                } relative`}
              onClick={handlePayment}
              disabled={!isTermsAccepted}
            >
              {
                `Pay ${bookingData.currency} ${(bookingData.price * 1.18).toFixed(2)}`
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;