"use client"
import { useEffect, useState } from "react";
import { getCounsellotSchedule, ScheduleType } from "@/utils/experts";
import { toast } from "react-toastify";
import BookingModal from "./BookingModal";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FaPhone, FaMapMarkerAlt, FaUserFriends, FaUser } from "react-icons/fa";

export default function OneExpertBookingCompoent(props: {
  id: string;
  rates: {
    sessionType: string;
    price: number;
    currency: string;
    sessionTitle: string;
    availabilityTypes: string[];
  }[];
  className: string;
  counsellorName?: string;
}) {
  const { id, rates, className, counsellorName = "Counsellor" } = props;

  const [selectedSessionType, setSelectedSessionType] = useState<string>(
    rates[0]?.sessionType || ""
  );
  const [selectedDayIndex, setSelectedDayIndex] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [counsellorSchedule, setCounsellorSchedule] = useState<ScheduleType[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCoupleCounselling, setIsCoupleCounselling] = useState(false);

  // Selected rate
  const selectedRate = rates.find(rate => rate.sessionType === selectedSessionType) || rates[0] || {
    sessionType: "Session",
    price: 0,
    currency: "INR",
    sessionTitle: "Counselling Session",
    availabilityTypes: []
  };

  // Selected mode from availabilityTypes
  const [selectedMode, setSelectedMode] = useState<string>(
    selectedRate?.availabilityTypes[0] || "video"
  );

  // Fetch schedule
  const fetchCounsellorSchedule = async () => {
    try {
      const schedule = await getCounsellotSchedule(id);
      setCounsellorSchedule(schedule);

      // Automatically select the first available day
      const firstAvailableDay = schedule.find((day) => day.is_working_day);
      if (firstAvailableDay) {
        setSelectedDayIndex(firstAvailableDay.date);
      }
    } catch (error) {
      console.error("Error fetching counsellor schedule:", error);
      toast.error("Failed to load schedule. Please try again later.");
    }
  };

  useEffect(() => {
    fetchCounsellorSchedule();
  }, [id]);

  // Update selected mode when session type changes
  useEffect(() => {
    const newSelectedRate = rates.find(rate => rate.sessionType === selectedSessionType);
    if (newSelectedRate && newSelectedRate.availabilityTypes.length > 0) {
      setSelectedMode(newSelectedRate.availabilityTypes[0]);
    }
  }, [selectedSessionType, rates]);

  // Handle booking confirmation
  const handleBooking = () => {
    if (!selectedTimeSlot) {
      toast.info("Please select a time slot to proceed.");
      return;
    }

    // Don't open modal for call or in_person modes
    if (selectedMode === 'call' || selectedMode === 'in_person') {
      return;
    }

    // Open the modal instead of just logging
    setIsModalOpen(true);
  };

  const { me } = useAuth();

  const router = useRouter();

  const renderSessionContent = () => {
    if (selectedMode === 'call') {
      return (
        <div className="border border-[#642494]/20 rounded-lg p-4 mt-4 bg-[#642494]/5 text-center">
          <FaPhone className="text-[#642494] text-2xl mx-auto mb-2" />
          <h3 className="font-medium text-[#642494] mb-2">Download our app to book a call session</h3>
          <p className="text-gray-600 text-sm">
            Call sessions are only available through our mobile application.
          </p>
        </div>
      );
    } else if (selectedMode === 'in_person') {
      return (
        <div className="border border-[#642494]/20 rounded-lg p-4 mt-4 bg-[#642494]/5 text-center">
          <FaMapMarkerAlt className="text-[#642494] text-2xl mx-auto mb-2" />
          <h3 className="font-medium text-[#642494] mb-2">Book Offline (In-Person) Appointment</h3>
          <p className="text-gray-600 text-sm mb-2">
            Offline appointments can only be booked by the PsyCortex team. Please call our support to schedule your session.
          </p>
          <p className="font-medium text-[#642494]">+91 8767027078</p>
        </div>
      );
    } else {
      return (
        <>
          {/* Days List */}
          <div className="w-full grid grid-cols-7 gap-[5px] mb-6">
            {counsellorSchedule.map((day) => {
              const isWorkingDay = day.is_working_day;
              return (
                <button
                  key={day.date}
                  disabled={!isWorkingDay}
                  className={`flex flex-col items-center justify-center h-16 rounded-md text-sm ${selectedDayIndex === day.date
                    ? "bg-[#642494] text-white"
                    : "bg-[#f8f3fa] text-[#642494]"
                    } ${!isWorkingDay ? "cursor-not-allowed opacity-50" : ""}`}
                  onClick={() => setSelectedDayIndex(day.date)}
                >
                  <span>{day.day.substring(0, 3)}</span>
                  <span>{new Date(day.date).getDate()}</span>
                </button>
              );
            })}
          </div>

          {/* Time Slots */}
          <div>
            <h3 className="text-gray-700 font-medium mb-2">Available Slots</h3>
            <div className="grid grid-cols-4 gap-2">
              {counsellorSchedule
                .find((day) => day.date === selectedDayIndex)
                ?.slots.length ? (
                counsellorSchedule
                  .find((day) => day.date === selectedDayIndex)
                  ?.slots
                  // For couple counselling, we need consecutive slots
                  .filter((slot, index, slots) => {
                    if (!isCoupleCounselling) return slot.is_available;

                    // For couple counselling (2 hours), check if there's another available slot after this one
                    const nextSlot = slots[index + 1];
                    return slot.is_available && nextSlot && nextSlot.is_available;
                  })
                  .map((slot, index) => (
                    <button
                      key={index}
                      disabled={!slot.is_available}
                      className={`w-full py-2 px-3 rounded-lg text-sm ${selectedTimeSlot === slot.time
                        ? "bg-[#642494] text-white"
                        : "bg-[#f8f3fa] text-[#642494]"
                        } ${!slot.is_available ? "cursor-not-allowed opacity-50" : ""}`}
                      onClick={() => setSelectedTimeSlot(slot.time)}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {new Date(`2000-01-01T${slot.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                        {isCoupleCounselling && (
                          <FaUserFriends size={12} className={`${selectedTimeSlot === slot.time ? "text-white" : "text-pink-600"}`} />
                        )}
                      </div>
                      {isCoupleCounselling && <div className="text-xs mt-1">(90 mins)</div>}
                    </button>
                  ))
              ) : (
                <div className="col-span-4 text-center py-4 text-gray-500">
                  No slots available
                </div>
              )}
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <>
      <div className={className}>
        {/* Session Type Selection */}
        <div className="mb-4 flex justify-between w-full items-center">
          <select
            className="border border-gray-300 rounded-md py-2 px-4 w-full"
            value={selectedSessionType}
            onChange={(e) => setSelectedSessionType(e.target.value)}
          >
            {rates.map((rate) => (
              <option key={rate.sessionType} value={rate.sessionType}>
                {rate.sessionTitle || rate.sessionType}
              </option>
            ))}
          </select>
          <span className="text-xl font-semibold ml-4">
            {selectedRate?.currency || "₹"}
            {selectedRate?.price || "N/A"}
            {isCoupleCounselling ? ' x2' : ''}
          </span>
        </div>

        {/* Couple Counselling Toggle */}
        {(selectedMode === 'video' || selectedMode === 'chat') && (
          <div className="mb-4 border border-[#642494]/20 rounded-lg p-3 bg-[#f8f3fa] w-full">
            <div className="flex flex-col space-y-2">
              <span className="text-gray-700 font-medium">Session Type</span>
              <div className="flex h-10 bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setIsCoupleCounselling(false)}
                  className={`flex items-center justify-center w-1/2 rounded-md transition-colors ${!isCoupleCounselling
                    ? 'bg-[#642494] text-white shadow-md'
                    : 'bg-transparent text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  <FaUser className="mr-2" />
                  <span>Individual</span>
                </button>
                <button
                  onClick={() => setIsCoupleCounselling(true)}
                  className={`flex items-center justify-center w-1/2 rounded-md transition-colors ${isCoupleCounselling
                    ? 'bg-[#642494] text-white shadow-md'
                    : 'bg-transparent text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  <FaUserFriends className="mr-2" />
                  <span>Couple</span>
                </button>
              </div>
            </div>
            {isCoupleCounselling && (
              <p className="text-sm text-gray-600 mt-2">
                Couple counselling sessions are 90 minutes long and charged at 2x the individual rate.
              </p>
            )}
          </div>
        )}

        {renderSessionContent()}

        {/* Continue Button */}
        {(selectedMode !== 'call' && selectedMode !== 'in_person') && (
          <button
            onClick={me === null ? () => {
              router.push('/login')
            } : handleBooking}
            disabled={!selectedTimeSlot}
            className={`w-full bg-[#642494] text-white py-3 rounded-lg font-semibold hover:bg-[#4e1c72] transition mt-6 ${!selectedTimeSlot ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {me === null ? 'Login to Continue' : 'Continue Booking'}
          </button>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userData={{
          name: me?.personalInfo.name || "User",
          id: me?.id || ""
        }}
        counsellorData={{
          name: counsellorName,
          id
        }}
        bookingData={{
          mode: selectedMode,
          date: selectedDayIndex,
          time: selectedTimeSlot,
          sessionType: selectedRate.sessionTitle || selectedSessionType,
          price: isCoupleCounselling ? selectedRate.price * 2 : selectedRate.price,
          currency: selectedRate.currency,
          isCouple: isCoupleCounselling
        }}
      />
    </>
  );
}
