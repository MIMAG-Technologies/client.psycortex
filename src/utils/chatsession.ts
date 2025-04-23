import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  is_counsellor: boolean;
  message_type: 'text' | 'media';
  message: string;
  media_url: string | null;
  is_read: boolean;
  created_at: string;
}


export const getChatMessages = async (chat_session_id: string) => {
    try {
        const res = await axios.get(
          `${baseUrl}/chats/get_messages.php?chat_session_id=${chat_session_id}`
        );
        return res.data.messages as ChatMessage[];
    } catch (error) {
        console.log(error);
        return [];
    }
};

export const sendChatMessage = async (
  chat_session_id: string,
  sender_id: string,
  message: string
) => {
  try {
    const formData = new FormData();
    formData.append("chat_session_id", chat_session_id);
    formData.append("sender_id", sender_id);
    formData.append("message", message);
    await axios.post(`${baseUrl}/chats/send_message.php`,formData,  {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
