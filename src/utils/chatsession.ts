import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export type ChatMessage = {
    id: string;
    sender_id: string;
    sender_name: string;
    is_counsellor: boolean;
    message_type: string;
    message: string;
    media_url: string | null;
    is_read: boolean;
    created_at: string;
};

export type ChatSessionDetails = {
    total: number;
    has_more: boolean;
    session_status: string;
    session_end_time: string | null;
    is_active: boolean;
}

export const getChatMessages = async (chat_session_id: string, limit: number = 40) => {
    try {
        const res = await axios.get(
          `${baseUrl}/chats/get_messages.php?chat_session_id=${chat_session_id}&limit=${limit}`
        );
        return {
            messages: res.data.messages as ChatMessage[],
            details: {
                total: res.data.total,
                has_more: res.data.has_more,
                session_status: res.data.session_status,
                session_end_time: res.data.session_end_time,
                is_active: res.data.is_active
            } as ChatSessionDetails
        };
    } catch (error) {
        console.log(error);
        return {
            messages: [],
            details: {
                total: 0,
                has_more: false,
                session_status: 'unknown',
                session_end_time: null,
                is_active: false
            }
        };
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
