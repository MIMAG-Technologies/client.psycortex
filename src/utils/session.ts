import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const bookSession = async (
  mode: "chat" | "video",
  is_couple: boolean,
  data: {
    user_id: string;
    counsellor_id: string;
    scheduled_at: string;
  }
) => {
  try {
    if (is_couple) {
      axios.post(`${baseUrl}/sessions/book_couple_sessions.php`, {
        ...data,
        type: mode,
        user_notes: "Couple counselling session for relationship issues",
      });
    }
    else{

      if (mode == "chat") {
        await axios.post(`${baseUrl}/sessions/book_chat_session.php`, data);
      } else {
        await axios.post(`${baseUrl}/sessions/book_session.php`, {
          ...data,
          notes: "Initial consultation session",
        });
      }
    }
    return true;
  } catch (error) {
    console.log(error);
    
    return false;
  }
};

