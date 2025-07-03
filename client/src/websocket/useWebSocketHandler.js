import { toast } from 'sonner';
import { m } from 'framer-motion';
import { useEffect } from 'react';

// import hooks
import { useFriend } from '../hooks/useFriend';
import { useUser } from '../hooks/useUser';
import { useGroupMember } from '../hooks/useGroupMember';

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

      case 'UNFRIEND_ANNOUNCEMENT':
        handleUnfriendAnnouncement(jsonData.payload);
        break;

      case 'CREATE_GROUP_SUCCESS':
        handleCreateGroupSuccess(jsonData);
        break;

      case 'GROUP_MEMBER_REQUEST':
        handleGroupMemberRequest(jsonData.payload);
        break;

      case 'JOIN_GROUP_REQUEST_ACCEPTED':
        handleJoinGroupRequestAccepted(jsonData.payload);
        break;

      case 'KICKED_ANNOUNCEMENT':
        handleKickedAnnouncement(jsonData.payload);
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

  // Xử lí hủy kết bạn
  const handleUnfriendAnnouncement = ({ userId, friendId }) => {
    if (userData.id === userId || userData.id === friendId) {
      fetchFriends(userData.id);

      if (userData.id === Number(userId)) {
        toast.info("📢 You have unfriended a user !");
      }
      else if (userData.id === Number(friendId)) {
        toast.info("📢 You have been unfriended by a user !");
      }
    }
  };


  
  // Xử lý thành công tạo nhóm
  const handleCreateGroupSuccess = ({message}) => {
    const { fetchGroups } = useGroupMember.getState(); // trực tiếp lấy từ store
    fetchGroups(userData.id)
    toast.success("🎉 " + message);
  }
  
  // Xử lý yêu cầu tham gia nhóm
  const handleGroupMemberRequest = ({ groupId, groupName }) => {
    toast.info("👤 You have a new join group request. Please check notifications!");
  }


  // Xử lý khi yêu cầu tham gia nhóm được chấp nhận
  const handleJoinGroupRequestAccepted = ({ groupId, accepterId, ownerId }) => {
    if (userData.id === accepterId ) {
      toast.success("🎉 You have joined a new group!");
    }
    else if (userData.id === ownerId) {
      toast.success("🎉 A user has joined your group!");
    }
    const { fetchGroups} = useGroupMember.getState(); // trực tiếp lấy từ store
    fetchGroups(userData.id);
  }

  // Xử lý thông báo bị kick khỏi nhóm
  const handleKickedAnnouncement = ({ groupId, groupName, memberId }) => {
    if (userData.id === memberId) {
      toast.error(`🚫 You have been kicked from the group: ${groupName}`);
    }
    const { fetchGroups } = useGroupMember.getState(); // trực tiếp lấy từ store
    fetchGroups(userData.id);
  }

};


