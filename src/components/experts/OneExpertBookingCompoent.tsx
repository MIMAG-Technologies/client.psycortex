import { useEffect, useState } from "react";
import { getCounsellotSchedule, ScheduleType } from "@/utils/experts";
import { toast } from "react-toastify";

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
}) {
  const { id, rates, className } = props;

  const [selectedSessionType, setSelectedSessionType] = useState<string>(
    rates[0]?.sessionType || ""
  );
  const [selectedDayIndex, setSelectedDayIndex] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [counsellorSchedule, setCounsellorSchedule] = useState<ScheduleType[]>(
    []
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

  // Handle booking confirmation
  const handleBooking = () => {
    if (!selectedTimeSlot) {
      toast.info("Please select a time slot to proceed.");
      return;
    }

    toast.success("Booking confirmed!");
    console.log({
      counsellorId: id,
      sessionType: selectedSessionType,
      date: selectedDayIndex,
      timeSlot: selectedTimeSlot,
    });
  };

  return (
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
              {rate.sessionType}
            </option>
          ))}
        </select>
        <span className="text-xl font-semibold ml-4">
          ₹
          {rates.find((rate) => rate.sessionType === selectedSessionType)
            ?.price || "N/A"}
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
      <div className="mb-6 w-full">
        <h3 className="text-gray-700 font-medium mb-2">Available Slots</h3>
        <div className="grid grid-cols-4 gap-2">
          {counsellorSchedule
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
                {slot.time}
              </button>
            ))}
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={handleBooking}
        className="w-full bg-[#2d1041] text-white py-3 rounded-lg font-semibold hover:bg-[#2d1041] transition"
      >
        Continue Booking
      </button>
    </div>
  );
}
