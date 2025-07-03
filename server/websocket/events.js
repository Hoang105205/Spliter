const { createFriendRequest } = require('../services/friendService.js');
const { createGroup, createGroupMemberRequest } = require('../services/groupService.js');

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

  } catch (err) {
    console.error("Lỗi khi xử lý ACCEPT_FRIEND_REQUEST:", err);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: err.message
    }));
  }
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


  } catch (err) {
    console.error("Lỗi khi xử lý ACCEPT_FRIEND_REQUEST:", err);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: err.message
    }));
  }
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

  // Xử lí Activity ở đây (Unfriend)





  try {
    const userClient = connectedClients[userId];
    const friendClient = connectedClients[friendId];

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

  // Xử lí Activity ở đây (Kick Group Member)






  


  try {
    memberClient = connectedClients[memberId];


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
  
  } catch (err) {
    console.error("Lỗi khi xử lý KICK_GROUP_MEMBER:", err);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: err.message
    }));
  }

}
