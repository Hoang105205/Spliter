import { useEffect } from 'react';
import { useFriend } from '../hooks/useFriend';
import { useUser } from '../hooks/useUser';
import { toast } from 'sonner';

export const useWebSocketHandler = (ws) => {
  const { fetchFriends } = useFriend();
  const { userData } = useUser();

  useEffect(() => {
    if (!ws || !userData?.id) return;

    // Gửi thông tin người dùng khi kết nối thành công
    ws.onopen = () => {
      console.log("Đã kết nối tới WebSocket Server!");

      ws.send(JSON.stringify({
        type: 'login',
        payload: {
          userID: userData.id,
          username: userData.username,
          email: userData.email,
          role: userData.role
        }
      }));
    };

    // Lắng nghe tin nhắn từ server
    ws.onmessage = (event) => {
      try {
        const jsonData = JSON.parse(event.data);
        console.log("Tin nhắn từ Server: ", jsonData);
        handleServerMessage(jsonData.type, jsonData);
      } catch (error) {
        console.error("Lỗi parse JSON từ server:", error);
      }
    };

    ws.onclose = () => {
      console.log("Đã mất kết nối tới WebSocket Server.");
    };

    // Cleanup khi unmount hoặc disconnect
    return () => {
      ws.close?.();
    };

  }, [ws, userData?.id]);

  // Hàm xử lý message theo type
  const handleServerMessage = (type, jsonData) => {
    switch (type) {
      case 'login_message':
        console.log(`🔔 Tin nhắn từ server: ${jsonData.payload.message}`);
        break;

      case 'SUCCESS':
        console.log(`✅ Thành công: ${jsonData?.message}`);
        break;

      case 'ERROR':
        console.error(`❌ Lỗi: ${jsonData?.message}`);
        break;


      case 'FRIEND_REQUEST':
        handleFriendRequest(jsonData.payload);
        break;

      case 'FRIEND_ACCEPTED':
        handleFriendAccepted(jsonData.payload);
        break;

      default:
        console.warn(`⚠️ Loại tin nhắn không hỗ trợ: ${type}`);
    }
  };

  // Xử lý yêu cầu kết bạn
  const handleFriendRequest = ({ senderId, senderUsername, status }) => {
    toast.info("👤 You have a new friend request. Please check notifications!");
  };

  // Xử lý đã chấp nhận kết bạn
  const handleFriendAccepted = ({ senderId, accepterId }) => {
    if (userData.id === senderId || userData.id === accepterId) {
      console.log("🔄 Cập nhật danh sách bạn bè sau khi accept.");
      fetchFriends(userData.id);
      toast.success("🎉 You have a new friend!");
    }
  };
  
};


