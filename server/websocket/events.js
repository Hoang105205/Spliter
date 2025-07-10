const { createFriendRequest } = require('../services/friendService.js');
const { createGroup, createGroupMemberRequest } = require('../services/groupService.js');
const { logActivity } = require('../services/activityService.js');
const { Users, Groups } = require('../schemas');
const { logNotification } = require('../services/notificationService.js');

module.exports = function(ws, connectedClients) {
  ws.on('message', (message) => {
    const parsedMessage = message.toString();

    try {
      const jsonData = JSON.parse(parsedMessage);
      console.log("Client gửi: ", jsonData);

      switch (jsonData.type) {
        
        // login message
        case 'login':
          handleLogin(ws, connectedClients, jsonData.payload);
          break;

        // friend request
        case 'ADD_FRIEND':
          handleAddFriend(ws, connectedClients, jsonData.payload);
          break;

        //  accept friend request
        case 'ACCEPT_FRIEND_REQUEST':
          handleAcceptFriendRequest(ws, connectedClients, jsonData.payload);
          break;

        case 'DECLINE_FRIEND_REQUEST':
          handleDeclineFriendRequest(ws, connectedClients, jsonData.payload);
          break;

        // create group
        case 'CREATE_GROUP':
          handleCreateGroup(ws, connectedClients, jsonData.payload);
          break;

        // add group member
        case 'ADD_GROUP_MEMBER':
          handleAddGroupMember(ws, connectedClients, jsonData.payload);
          break;
    
        // accept join group request
        case 'ACCEPT_JOIN_GROUP_REQUEST':
          handleAcceptJoinGroupRequest(ws, connectedClients, jsonData.payload);
          break;

        // decline join group request
        case 'DECLINE_JOIN_GROUP_REQUEST':
          handleDeclineJoinGroupRequest(ws, connectedClients, jsonData.payload);
          break;

        // unfriend
        case 'UNFRIEND':
          handleUnfriend(ws, connectedClients, jsonData.payload);
          break;
        
        // kick group member
        case 'KICK_GROUP_MEMBER':
          handleKickGroupMember(ws, connectedClients, jsonData.payload);
          break;

      
        default:
          ws.send(JSON.stringify({ 
            type: 'ERROR',
            message: `Loại tin nhắn không được hỗ trợ: ${jsonData.type}` 
          }));
      }
    } catch (error) {
      console.error("Lỗi khi parse JSON: ", error);
      ws.send(JSON.stringify({ message: "Tin nhắn không đúng định dạng JSON!" }));
    }
  });
};

// Hàm xử lý login
function handleLogin(ws, connectedClients, payload) {
  const { userID, username } = payload;

  if (userID && username) {
    // Lưu client vào danh sách
    connectedClients[userID] = {
      username: username,
      ws: ws, // Lưu WebSocket để gửi tin nhắn sau này
    };

    console.log(`Đã lưu client: ${username} (${userID})`);

    // Phản hồi lại client
    ws.send(JSON.stringify({
      type : 'SUCCESS',
      message: `Đăng nhập thành công: ${username}` 
    }));
  } else {
    console.warn("Thiếu thông tin định danh (userID hoặc username).");
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: "Đăng nhập thất bại: Thiếu thông tin định danh." }));
  }
}


// Hàm xử lý ADD_FRIEND
async function handleAddFriend(ws, connectedClients, payload) {
  const { senderId, receiverId } = payload;

  if (!senderId || !receiverId) {
    console.warn("Thiếu thông tin senderId hoặc receiverId.");
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: "Yêu cầu kết bạn thất bại: Thiếu thông tin người gửi hoặc người nhận." }));
    return;
  }

  try {
    
    const { exists, record } = await createFriendRequest(senderId, receiverId);

    if (exists) {
      return ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Yêu cầu kết bạn đã tồn tại.',
      }));
    }

    const receiverClient = connectedClients[receiverId];

    if (receiverClient && receiverClient.ws.readyState === ws.OPEN) {

      receiverClient.ws.send(JSON.stringify({
        type: 'FRIEND_REQUEST',
        payload: {
          senderId,
          senderUsername: connectedClients[senderId]?.username || "Không rõ",
          status: 'pending'
        }
      }));

      ws.send(JSON.stringify({
        type: 'SUCCESS',
        message: `Đã gửi lời mời kết bạn.`,
        data: record
      }));

    } 
    else {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: `Người nhận không online hoặc không kết nối.`
      }));
    }

  // Ghi nhận Activity: gửi lời mời kết bạn
  ReceiverName = await Users.findOne({ where: { id: receiverId } });
  await logActivity({
    userId: senderId,
    title: 'Send Friend Request',
    activityType: 'relationship',
    description: `Sent a friend request to ${ReceiverName.username}.`
  });

  } catch (err) {
    console.error("Lỗi tạo lời mời kết bạn:", err);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: err.message
    }));
  }
}



// Hàm xử lý ACCEPT_FRIEND_REQUEST
async function handleAcceptFriendRequest(ws, connectedClients, payload) {
  const { requestId, accepterId, requesterId } = payload;

  if (!requestId || !accepterId || !requesterId) {
    return ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Thiếu requestId, accepterId hoặc requesterId.'
    }));
  }

  try {

    const accepterClient = connectedClients[accepterId];
    const requesterClient = connectedClients[requesterId];

    
    // ✅ Tạo Notification cho requester
    const requesterName = await Users.findOne({ where: { id: requesterId } });
    const accepterName = await Users.findOne({ where: { id: accepterId } });

    await logNotification({
      userId: requesterId,
      description: `${accepterName.username} accepted your friend request.`
    });


    const message = {
      type: 'FRIEND_ACCEPTED',
      payload: {
        requestId,
        senderId: requesterId,
        accepterId,
        status: 'accepted'
      }
    };

    if (accepterClient?.ws?.readyState === ws.OPEN) {
      accepterClient.ws.send(JSON.stringify(message));
    }

    if (requesterClient?.ws?.readyState === ws.OPEN) {
      requesterClient.ws.send(JSON.stringify(message));
    }

    console.log(`Đã gửi tín hiệu FRIEND_ACCEPTED cho ${requesterId} và ${accepterId}`);

    // Ghi nhận Activity: chấp nhận lời mời kết bạn
    await logActivity({
      userId: accepterId,
      title: 'Accept Friend Request',
      activityType: 'relationship',
      description: `Accepted friend request from ${requesterName.username}.`
    });

  } catch (err) {
    console.error("Lỗi khi xử lý ACCEPT_FRIEND_REQUEST:", err);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: err.message
    }));
  }
}

// Hàm xử lý DECLINE_FRIEND_REQUEST
async function handleDeclineFriendRequest(ws, connectedClients, payload) {
  const { declinerId, requesterId } = payload;

  if (!declinerId || !requesterId) {
    return ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Thiếu thông tin declienerId hoặc requesterId.'
    }));
  }

  const requesterName = await Users.findOne({ where: { id: requesterId } });
  const declinerName = await Users.findOne({ where: { id: declinerId } });

  // ✅ Tạo Notification cho requester
  await logNotification({
    userId: requesterId,
    description: `${declinerName.username} rejected your friend request.`
  });


  console.log(`Người dùng ${declinerId} đã từ chối yêu cầu kết bạn từ ${requesterId}`);

  // Ghi nhận Activity: từ chối lời mời kết bạn
  await logActivity({
    userId: declinerId,
    title: 'Decline Friend Request',
    activityType: 'relationship',
    description: `Declined friend request from ${requesterName.username}.`
  });
}



// Hàm xử lý CREATE_GROUP
async function handleCreateGroup(ws, connectedClients, payload) {
  const { group_name, creator_id } = payload;

  if (!group_name || !creator_id) {
    return ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Thiếu thông tin group_name hoặc creator_id.'
    }));
  }

  try {
    
    const newGroup = await createGroup({ name: group_name, ownerId: creator_id });

    console.log(`Nhóm mới đã được tạo: ${group_name} bởi người dùng ${creator_id}`);

    ws.send(JSON.stringify({
      type: 'CREATE_GROUP_SUCCESS',
      message: `Group ${newGroup.name} is successfully created.`,
    }));

    
    // Ghi nhận Activity: tạo nhóm mới
    await logActivity({
      userId: creator_id,
      title: 'Create Group',
      activityType: 'relationship',
      description: `Created a new group: ${group_name}.`
    });

  } catch (err) {
    console.error("Lỗi khi tạo nhóm:", err);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: err.message
    }));
  }
}

// Hàm xử lý ADD_GROUP_MEMBER
async function handleAddGroupMember(ws, connectedClients, payload) {
  const { senderId, groupId, memberId, groupName } = payload;

  if (!groupId || !memberId) {
    return ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Thiếu thông tin groupId hoặc memberId.'
    }));
  }


  try {
    const { exists, record } = await createGroupMemberRequest({senderId, groupId, memberId });

    if (exists) {
      return ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'This Request already exists.',
      }));
    }

    const memberClient = connectedClients[memberId];

    if (memberClient && memberClient.ws.readyState === ws.OPEN) {
      memberClient.ws.send(JSON.stringify({
        type: 'GROUP_MEMBER_REQUEST',
        payload: {
          groupId,
          groupName,
        }})
      )
    }
    // Ghi nhận Activity: gửi yêu cầu thêm thành viên vào nhóm
    MemberName = await Users.findOne({ where: { id: memberId } });
    await logActivity({
      userId: senderId,
      groupId: groupId,
      title: 'Invite Friend to Group',
      activityType: 'relationship',
      description: `Invited ${MemberName.username} to join the group ${groupName}.`,
    });
    
  } catch (err) {
    console.error("Lỗi khi thêm thành viên vào nhóm:", err);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: err.message
    }));
  }
}

// Hàm xử lý ACCEPT_JOIN_GROUP_REQUEST
async function handleAcceptJoinGroupRequest(ws, connectedClients, payload) {
  const { groupId, accepterId, ownerId } = payload;

  if (!groupId || !accepterId || !ownerId) {
    return ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Thiếu thông tin groupId, accepterId hoặc ownerId.'
    }));
  }

  try {

    const accepterClient = connectedClients[accepterId];
    const ownerClient = connectedClients[ownerId];

    const GroupName = await Groups.findOne({ where: { id: groupId } });
    const accepterName = await Users.findOne({ where: { id: accepterId } });

    // ✅ Tạo Notification cho owner
    await logNotification({
      userId: ownerId,
      description: `${accepterName.username} accepted your group joining request.`
    });

    const message = {
      type: 'JOIN_GROUP_REQUEST_ACCEPTED',
      payload: {
        groupId,
        ownerId,
        accepterId,
        status: 'accepted'
      }
    };

    if (accepterClient?.ws?.readyState === ws.OPEN) {
      accepterClient.ws.send(JSON.stringify(message));
    }

    if (ownerClient?.ws?.readyState === ws.OPEN) {
      ownerClient.ws.send(JSON.stringify(message));
    }

    // Ghi nhận Activity: chấp nhận yêu cầu tham gia nhóm

    await logActivity({
      userId: accepterId,
      groupId: groupId,
      title: 'Accept Join Group Request',
      activityType: 'relationship',
      description: `Accepted join request for group ${GroupName.name}.`
    });

  } catch (err) {
    console.error("Lỗi khi xử lý ACCEPT_FRIEND_REQUEST:", err);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: err.message
    }));
  }
}

// Hàm xử lý DECLINE_JOIN_GROUP_REQUEST
async function handleDeclineJoinGroupRequest(ws, connectedClients, payload) {
  const { declinerId, ownerId } = payload;
  if (!declinerId || !ownerId) {
    return ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Thiếu thông tin declinerId hoặc ownerId.'
    }));
  }

  // Ghi nhận Activity: từ chối yêu cầu tham gia nhóm
  const ownerName = await Users.findOne({ where: { id: ownerId } });
  const declinerName = await Users.findOne({ where: { id: declinerId } });

  // ✅ Tạo Notification cho owner
  await logNotification({
    userId: ownerId,
    description: `${declinerName.username} rejected your group joining request.`
  });

  console.log(`Người dùng ${declinerId} đã từ chối yêu cầu tham gia nhóm từ ${ownerId}`);

  await logActivity({
    userId: declinerId,
    title: 'Decline Join Group Request',
    activityType: 'relationship',
    description: `Declined join group request from ${ownerName.username}.`
  });
}




// Hàm xử lý UNFRIEND
async function handleUnfriend(ws, connectedClients, payload) {
  const { userId, friendId } = payload;

  if (!userId || !friendId) {
    return ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Thiếu thông tin userId hoặc friendId.'
    }));
  }

  try {
    const userClient = connectedClients[userId];
    const friendClient = connectedClients[friendId];

    const FriendName = await Users.findOne({ where: { id: friendId } });
    const userName = await Users.findOne({ where: { id: userId } });

    // ✅ Tạo Notification cho người bị hủy kết bạn
    await logNotification({
      userId: friendId,
      description: `${userName.username} unfriended you.`
    });


    if (userClient && userClient.ws.readyState === ws.OPEN) {
      userClient.ws.send(JSON.stringify({
        type: 'UNFRIEND_ANNOUNCEMENT',
        payload: {
          userId: userId,
          friendId: friendId,
        }
      }));
    }

    if (friendClient && friendClient.ws.readyState === ws.OPEN) {
      friendClient.ws.send(JSON.stringify({
        type: 'UNFRIEND_ANNOUNCEMENT',
        payload: {
          userId: userId,
          friendId: friendId,
        }
      }));
    }

    // Ghi nhận Activity: hủy kết bạn

    await logActivity({
      userId: userId,
      friendId: friendId,
      title: 'Unfriend',
      activityType: 'relationship',
      description: `Deleted ${FriendName.username} from friend list.`
    });

  } catch (err) {
    console.error("Lỗi khi hủy kết bạn:", err);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: err.message
    }));
  }
}



// Hàm xử lý KICK_GROUP_MEMBER
async function handleKickGroupMember(ws, connectedClients, payload) {
  const {ownerId, groupId, memberId, groupName} = payload;
  if (!ownerId || !groupId || !memberId || !groupName) {
    return ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Thiếu thông tin ownerId, groupId, groupName hoặc memberId.'
    }));
  }

  try {
    memberClient = connectedClients[memberId];

    // Ghi nhận Activity: kick thành viên khỏi nhóm
    memberName = await Users.findOne({ where: { id: memberId } });

    // ✅ Tạo Notification cho người bị kick
    await logNotification({
      userId: memberId,
      description: `You have been kicked from the group: ${groupName}.`
    });

    if (memberClient && memberClient.ws.readyState === ws.OPEN) {
      memberClient.ws.send(JSON.stringify({
        type: 'KICKED_ANNOUNCEMENT',
        payload: {
          groupId,
          groupName,
          memberId,
        }
      }));
    }

    // Ghi nhận Activity: kick thành viên khỏi nhóm
    await logActivity({
      userId: ownerId,
      groupId: groupId,
      title: 'Kick Group Member',
      activityType: 'relationship',
      description: `Kicked ${memberName.username} from group ${groupName}.`
    });

  } catch (err) {
    console.error("Lỗi khi xử lý KICK_GROUP_MEMBER:", err);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: err.message
    }));
  }
}
