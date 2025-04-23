import { useEffect, useState } from "react";
import { getCounsellotSchedule, ScheduleType } from "@/utils/experts";
import { toast } from "react-toastify";
import BookingModal from "./BookingModal";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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
    
    // Open the modal instead of just logging
    setIsModalOpen(true);
  };
  
  // Format the date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Format the time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true 
    });
  };

  const {me} = useAuth();

  const router = useRouter();
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
          </span>
        </div>
      

        {/* Days List */}
        <div className="w-full grid grid-cols-7 gap-[5px] mb-6">
          {counsellorSchedule.map((day) => {
            const isWorkingDay = day.is_working_day;
            return (
              <button
                key={day.date}
                disabled={!isWorkingDay}
                className={`flex flex-col items-center justify-center h-16 rounded-md text-sm ${
                  selectedDayIndex === day.date
                    ? "bg-[#2d1041] text-white"
                    : "bg-[#f8f3fa] text-[#2d1041]"
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
                ?.slots.map((slot, index) => (
                  <button
                    key={index}
                    disabled={!slot.is_available}
                    className={`w-full py-2 px-3 rounded-lg text-sm ${
                      selectedTimeSlot === slot.time
                        ? "bg-[#2d1041] text-white"
                        : "bg-[#f8f3fa] text-[#2d1041]"
                    } ${!slot.is_available ? "cursor-not-allowed opacity-50" : ""}`}
                    onClick={() => setSelectedTimeSlot(slot.time)}
                  >
                    {new Date(`2000-01-01T${slot.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                  </button>
                ))
            ) : (
              <div className="col-span-4 text-center py-4 text-gray-500">
                No slots available
              </div>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={me === null ?()=>{
            router.push('/login')
          } : handleBooking}
          className="w-full bg-[#2d1041] text-white py-3 rounded-lg font-semibold hover:bg-[#2d1041] transition mt-6"
        >
          {me === null ? 'Login to Continue' :'Continue Booking'}
          
        </button>
      </div>
      
      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userData={{
          name: me?.personalInfo.name || "User",
          id:me?.id || ""

        }}
        counsellorData={{
          name: counsellorName,
          id
        }}
        bookingData={{
          mode: selectedMode,
          date: formatDate(selectedDayIndex),
          time: formatTime(selectedTimeSlot),
          sessionType: selectedRate.sessionTitle || selectedSessionType,
          price: selectedRate.price,
          currency: selectedRate.currency
        }}
      />
    </>
  );
}
