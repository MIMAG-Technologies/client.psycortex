import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const bookSession = async (
  mode: "chat" | "video",
  data: {
    user_id: string;
    counsellor_id: string;
    scheduled_at: string;
  }
) => {
  try {
    if (mode == "chat") {
      await axios.post(`${baseUrl}/sessions/book_chat_session.php`, data);
    } else {
      // await axios.post(`${baseUrl}`)
    }
    return true;
  } catch (error) {
    console.log(error);
    
    return false;
  }
};
