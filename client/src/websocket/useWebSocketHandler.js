import { toast } from 'sonner';
import { m } from 'framer-motion';
import { useEffect } from 'react';

// import hooks
import { useFriend } from '../hooks/useFriend';
import { useUser } from '../hooks/useUser';
import { useGroupMember } from '../hooks/useGroupMember';
import { useGroup } from '../hooks/useGroup';
import { useNotification } from '../hooks/useNotification'; // ✅ Thêm useNotification

export const useWebSocketHandler = (ws) => {
  const { fetchFriends } = useFriend();
  const { userData } = useUser();
  const { fetchGroups, refreshGroups } = useGroupMember();
  const { fetchNotifications } = useNotification.getState(); // ✅ Gọi trực tiếp không cần trigger
  const { incrementNotificationTrigger } = useNotification.getState(); // ✅ Thêm useNotification

  const { getGroupmember } = useGroup();

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
        incrementNotificationTrigger(); // ✅ Tăng trigger để UI cập nhật
        break;

      case 'FRIEND_ACCEPTED':
        handleFriendAccepted(jsonData.payload);
        incrementNotificationTrigger(); // ✅ Tăng trigger để UI cập nhật
        break;

      case 'UNFRIEND_ANNOUNCEMENT':
        handleUnfriendAnnouncement(jsonData.payload);
        incrementNotificationTrigger(); // ✅ Tăng trigger để UI cập nhật
        break;

      case 'CREATE_GROUP_SUCCESS':
        handleCreateGroupSuccess(jsonData);
        break;

      case 'GROUP_MEMBER_REQUEST':
        handleGroupMemberRequest(jsonData.payload);
        incrementNotificationTrigger(); // ✅ Tăng trigger để UI cập nhật
        break;

      case "JOIN_GROUP_REQUEST_ACCEPTED":
        handleJoinGroupRequestAccepted(jsonData.payload);
        incrementNotificationTrigger(); // ✅ Tăng trigger để UI cập nhật
        break;

      case 'KICKED_ANNOUNCEMENT':
        handleKickedAnnouncement(jsonData.payload);
        incrementNotificationTrigger(); // ✅ Tăng trigger để UI cập nhật
        break;
      case 'DECLINE_FRIEND_REQUEST':
        handleDeclineFriendRequest(jsonData.payload);
        incrementNotificationTrigger();
        break;
      case 'DECLINE_JOIN_GROUP_REQUEST':
        handleDeclineJoinGroupRequest(jsonData.payload);
        incrementNotificationTrigger();
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
    fetchGroups(userData.id)
    toast.success("🎉 " + message);
  }
  
  // Xử lý yêu cầu tham gia nhóm
  const handleGroupMemberRequest = ({ groupId, groupName }) => {
    toast.info("👤 You have a new join group request. Please check notifications!");
  }


  // Xử lý khi yêu cầu tham gia nhóm được chấp nhận
  const handleJoinGroupRequestAccepted = async ({ groupId, accepterId, ownerId }) => {
    if (userData.id === accepterId) {
      toast.success("🎉 You have joined a new group!");
    } else if (userData.id === ownerId) {
      toast.success("🎉 A user has joined your group!");
    }

    refreshGroups(); // Làm mới danh sách nhóm

    await fetchGroups(userData.id); // Cập nhật danh sách nhóm
    await getGroupmember(groupId); // Cập nhật danh sách thành viên
  };

  // Xử lý thông báo bị kick khỏi nhóm
  const handleKickedAnnouncement = ({ groupId, groupName, memberId }) => {
    if (userData.id === memberId) {
      toast.error(`🚫 You have been kicked from the group: ${groupName}`);
    }
    fetchGroups(userData.id);
  }

  // Xử lý từ chối lời mời kết bạn
  const handleDeclineFriendRequest = ({ declinerId, requesterId, status }) => {
    if (userData.id === declinerId) {
      toast.info('❌ You have declined a friend request.');
    } else if (userData.id === requesterId) {
      toast.info('❌ Your friend request was declined.');
    }
    // Không cần fetchNotifications ở đây vì đã có trigger
  };

  // Xử lý từ chối lời mời tham gia nhóm
  const handleDeclineJoinGroupRequest = ({ groupId, ownerId, declinerId, status }) => {
    if (userData.id === declinerId) {
      toast.info('❌ You have declined a group join request.');
    } else if (userData.id === ownerId) {
      toast.info('❌ Your group join request was declined.');
    }
    // Không cần fetchNotifications ở đây vì đã có trigger
  }

};


