const { createFriendRequest } = require('../services/friendService.js');
const { createGroup, createGroupMemberRequest, deleteGroup } = require('../services/groupService.js');
const { logActivity } = require('../services/activityService.js');
const { Users, Groups, groupMembers, Expenses, expenseItems, Reports } = require('../schemas');
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


        // Expense related messages
        case 'CREATE_EXPENSE':
          handleCreateExpense(ws, connectedClients, jsonData.payload);
          break;

        
        // Handle delete group
        case 'DELETE_GROUP':
          handleDeleteGroup(ws, connectedClients, jsonData.payload);
          break;

        // Handle rename group
        case 'RENAME_GROUP':
          handleRenameGroup(ws, connectedClients, jsonData.payload);
          break;

        // Handle Leave Group
        case 'LEAVE_GROUP':
          handleLeaveGroup(ws, connectedClients, jsonData.payload);
          break;

        case 'SETTLE_UP':
          handleSettleUp(ws, connectedClients, jsonData.payload);
          break;

        case 'UPDATE_EXPENSE_ITEM_STATUS':
          handleUpdateExpenseItemStatus(ws, connectedClients, jsonData.payload);
          break;

        case 'SUBMIT_REPORT':
          handleSubmitReport(ws, connectedClients, jsonData.payload);
          break;

        // case 'RESOLVE_REPORT':
        //   handleResolveReport(ws, connectedClients, jsonData.payload);
        //   break;

      
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
    description: `Sent a friend request to "${ReceiverName.username}".`  
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
      description: `"${accepterName.username}" accepted your friend request.`
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
      description: `Accepted friend request from "${requesterName.username}".`
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
      message: 'Thiếu thông tin declinerId hoặc requesterId.'
    }));
  }

  try {
    const declinerClient = connectedClients[declinerId];
    const requesterClient = connectedClients[requesterId];

    const requesterName = await Users.findOne({ where: { id: requesterId } });
    const declinerName = await Users.findOne({ where: { id: declinerId } });

    // Tạo notification cho requester
    await logNotification({
      userId: requesterId,
      description: `"${declinerName.username}" rejected your friend request.`
    });

    // Gửi event về requester để cập nhật notification ngay
    const message = {
      type: 'DECLINE_FRIEND_REQUEST',
      payload: {
        declinerId,
        requesterId,
        status: 'rejected'
      }
    };

    if (declinerClient?.ws?.readyState === ws.OPEN) {
      declinerClient.ws.send(JSON.stringify(message));
    }
    if (requesterClient?.ws?.readyState === ws.OPEN) {
      requesterClient.ws.send(JSON.stringify(message));
    }

    console.log(`Đã gửi tín hiệu FRIEND_REQUEST_DECLINED cho ${requesterId} và ${declinerId}`);

    // Ghi nhận Activity: từ chối lời mời kết bạn
    await logActivity({
      userId: declinerId,
      title: 'Decline Friend Request',
      activityType: 'relationship',
      description: `Declined friend request from "${requesterName.username}".`
    });
  } catch (err) {
    console.error("Lỗi khi xử lý DECLINE_FRIEND_REQUEST:", err);
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

    
    // Ghi nhận Activity: tạo nhóm mới
    await logActivity({
      userId: creator_id,
      title: 'Create Group',
      activityType: 'relationship',
      description: `Created a new group: "${group_name}".`
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
      description: `Invited "${MemberName.username}" to join the group "${groupName}".`,
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
      description: `"${accepterName.username}" accepted your group joining request.`
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
      description: `Accepted join request for group "${GroupName.name}".`
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
  const { groupId, declinerId, ownerId } = payload;

  if (!groupId || !declinerId || !ownerId) {
    return ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Thiếu thông tin groupId, declinerId hoặc ownerId.'
    }));
  }

  try {
    const declinerClient = connectedClients[declinerId];
    const ownerClient = connectedClients[ownerId];

    const GroupName = await Groups.findOne({ where: { id: groupId } });
    const declinerName = await Users.findOne({ where: { id: declinerId } });

    // Tạo notification cho owner
    await logNotification({
      userId: ownerId,
      description: `"${declinerName.username}" rejected your group joining request.`
    });

    const message = {
      type: 'DECLINE_JOIN_GROUP_REQUEST',
      payload: {
        groupId,
        ownerId,
        declinerId,
        status: 'rejected'
      }
    };

    if (declinerClient?.ws?.readyState === ws.OPEN) {
      declinerClient.ws.send(JSON.stringify(message));
    }
    if (ownerClient?.ws?.readyState === ws.OPEN) {
      ownerClient.ws.send(JSON.stringify(message));
    }

    console.log(`Đã gửi tín hiệu JOIN_GROUP_REQUEST_DECLINED cho ${ownerId} và ${declinerId}`);

    // Ghi nhận Activity: từ chối yêu cầu tham gia nhóm
    await logActivity({
      userId: declinerId,
      groupId: groupId,
      title: 'Decline Join Group Request',
      activityType: 'relationship',
      description: `Declined join group request from "${GroupName.name}".`
    });
  } catch (err) {
    console.error("Lỗi khi xử lý DECLINE_JOIN_GROUP_REQUEST:", err);
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

  try {
    const userClient = connectedClients[userId];
    const friendClient = connectedClients[friendId];

    const FriendName = await Users.findOne({ where: { id: friendId } });
    const userName = await Users.findOne({ where: { id: userId } });

    // ✅ Tạo Notification cho người bị hủy kết bạn
    await logNotification({
      userId: friendId,
      description: `"${userName.username}" unfriended you.`
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
      description: `Deleted "${FriendName.username}" from friend list.`
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
      description: `You have been kicked from the group: "${groupName}".`
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
      description: `Kicked "${memberName.username}" from group "${groupName}".`
    });

  } catch (err) {
    console.error("Lỗi khi xử lý KICK_GROUP_MEMBER:", err);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: err.message
    }));
  }
}


// handle CREATE_EXPENSE
async function handleCreateExpense(ws, connectedClients, payload) {
  const { expenseId, groupId, paidbyId, createdbyId, members, amount, title } = payload;

  if (!expenseId || !groupId || !paidbyId || !createdbyId || !members || !amount || !title) {
    return ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Thiếu thông tin groupId, paidbyId, createdbyId, members, amount hoặc title.'
    }));
  }

  const Group = await Groups.findOne({ where: { id: groupId } });
  const paidUser = await Users.findOne({ where: { id: paidbyId } });
  const createdbyUser = await Users.findOne({ where: { id: createdbyId } });

  // Ghi nhận Activity: Tạo mới một expense
  await logActivity({
      userId: paidbyId,
      title: 'Create Expense',
      activityType: 'expense',
      description: `Created a new expense in group: "${Group.name}".`
  });
  //



  

  // log Notification: thông báo chi phí mới
  for (const member of members) {
    // Member who not created or paid the expense
    if (member.userId !== createdbyId && member.userId !== paidbyId) { 
      await logNotification({
        userId: member.userId,
        description: `"${createdbyUser.username}" created a new expense "${title}" in group "${Group.name}". You owe: "${member.shared_amount}đ".`,
      });
    }
    // Member who created the expense and not paid
    else if (member.userId === createdbyId && member.userId !== paidbyId) {
      await logNotification({
        userId: member.userId,
        description: `You created a new expense "${title}" in group "${Group.name}". You owe: "${member.shared_amount}đ".`,
      });
    }
    // Member who paid the expense
    else if (member.userId === paidbyId)
    {
      await logNotification({
        userId: member.userId,
        description: `You paid "${amount}đ" for the expense "${title}" in group "${Group.name}".`,
      });
    }
  }
  //



  // ws service 
  try {
    // Tạo payload cho tin nhắn gửi đến thành viên
    const expensePayload = {
      groupName: Group.name,
      paidName: paidUser.username,
      paidbyId,
      createdbyId,
      amount,
      title,
    };
    
    // Gửi thông báo đến tất cả thành viên trong bill
    members.forEach(member => {
      const memberClient = connectedClients[member.userId];
      if (memberClient && memberClient.ws.readyState === ws.OPEN) {
        memberClient.ws.send(JSON.stringify({
          type: 'EXPENSE_CREATED',
          payload: expensePayload,
        }));
      }
    });

  } catch (err) {
    console.error("Lỗi khi tạo chi phí:", err);
  }
}


// Handle DELETE_GROUP
async function handleDeleteGroup(ws, connectedClients, payload) {
  const { groupId, ownerId, groupName } = payload;

  if (!groupId || !ownerId || !groupName) {
    return ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Thiếu thông tin groupId, ownerId hoặc groupName.'
    }));
  }

  try {

    await logActivity({
      userId: ownerId,
      title: 'Delete Group',
      activityType: 'relationship',
      description: `Deleted the group "${groupName}".`
    });


    // 2. Gửi Notification cho tất cả thành viên
    const groupMembersList = await groupMembers.findAll({ where: { groupId } });
    const notifications = groupMembersList.map(member =>
      logNotification({
        userId: member.userId,
        description: `The group "${groupName}" has been deleted by the owner.`,
      })
    );
    await Promise.all(notifications); // Chờ tất cả notification được ghi

    // 3. Xóa nhóm
    await deleteGroup(groupId);

    // 4. Gửi thông báo xóa nhóm đến tất cả thành viên 
    groupMembersList.forEach(member => {
      const memberClient = connectedClients[member.userId];
      if (memberClient && memberClient.ws.readyState === ws.OPEN) {
        memberClient.ws.send(JSON.stringify({
          type: 'GROUP_DELETED',
          payload: {
            groupId,
            groupName,
            ownerId,
          },
        }));
      }
    });

  } catch (err) {
    console.error("Lỗi khi xóa nhóm:", err);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: err.message
    }));
  }
}

// Handle RENAME_GROUP
async function handleRenameGroup(ws, connectedClients, payload) {
  const { groupId, newName, oldName, ownerId } = payload;

  if (!groupId || !newName || !oldName || !ownerId) {
    return ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Thiếu thông tin groupId, newName, oldName hoặc ownerId.'
    }));
  }

  try {
    group = await Groups.findOne({ where: { id: groupId } });
    const Members = await groupMembers.findAll({ where: { groupId } });

    // Ghi nhận Activity: đổi tên nhóm
    await logActivity({
      userId: ownerId,
      title: 'Rename Group',
      activityType: 'relationship',
      description: `Renamed the group "${oldName}" to "${newName}".`
    });

    // Log Notification: thông báo đổi tên nhóm
    const notifications = Members.map(member =>
      logNotification({
        userId: member.userId,
        description: `The group has been renamed from "${oldName}" to "${newName}".`
      })
    );

    await Promise.all(notifications); // Chờ tất cả notification được ghi

    // Gửi thông báo đến tất cả thành viên trong nhóm
    Members.forEach(member => {
      const memberClient = connectedClients[member.userId];
      if (memberClient && memberClient.ws.readyState === ws.OPEN) {
        memberClient.ws.send(JSON.stringify({
          type: 'GROUP_RENAMED',
          payload: {
            groupId,
            newName,
            oldName,
            ownerId,
          }
        }));
      }
    });

  } catch (err) {
    console.error("Lỗi khi đổi tên nhóm:", err);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: err.message
    }));
  }

}


// Handle Leave Group
async function handleLeaveGroup(ws, connectedClients, payload) {
  const { groupId, memberId, groupName } = payload;

  if (!groupId || !memberId || !groupName) {
    return ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Thiếu thông tin groupId, memberId hoặc groupName.'
    }));
  }

  try {
    // Tìm thông tin nhóm và thành viên
    const group = await Groups.findOne({ where: { id: groupId } });
    if (!group) {
      throw new Error('Group not found');
    }

    const leftMember = await Users.findOne({ where: { id: memberId } });
    if (!leftMember) {
      throw new Error('Member not found');
    }

    const ownerId = group.ownerId;

    // Ghi nhận Activity: rời nhóm (chỉ log cho người rời nhóm)
    await logActivity({
      userId: memberId,
      title: 'Leave Group',
      activityType: 'relationship',
      description: `Left the group "${groupName}".`,
    });

    // Log Notification: thông báo rời nhóm (cho cả người rời và chủ nhóm)
    await logNotification({
      userId: memberId,
      description: `You have left the group ""${groupName}"".`
    });

    await logNotification({
      userId: ownerId,
      description: `"${leftMember.username}" has left your group "${groupName}".`
    });

    // Gửi thông báo đến tất cả thành viên trong nhóm
    const groupMembersList = await groupMembers.findAll({ where: { groupId } });
    groupMembersList.forEach(member => {
      const memberClient = connectedClients[member.userId];
      if (memberClient && memberClient.ws.readyState === ws.OPEN) {
        memberClient.ws.send(JSON.stringify({
          type: 'GROUP_MEMBER_LEFT',
          payload: {
            groupId,
            groupName,
            memberId: leftMember.id,
            memberName: leftMember.username,
          },
        }));
      }
    });


  } catch (err) {
    console.error("Lỗi khi xử lý Leave Group:", err);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: err.message || 'Failed to process leave group.',
    }));
  }
}

// Handle SETTLE_UP
async function handleSettleUp(ws, connectedClients, payload) {
  const { expenseId, groupId, userId, paidbyId } = payload;
  
  if (!expenseId || !groupId || !userId || !paidbyId) {
    return ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Thiếu thông tin expenseId, groupId, userId hoặc paidbyId.'
    }));
  }

  try {
    const group = await Groups.findOne({ where: { id: groupId } });
    if (!group) {
      throw new Error('Group not found');
    }

    const user = await Users.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const paidUser = await Users.findOne({ where: { id: paidbyId } });
    if (!paidUser) {
      throw new Error('Paid user not found');
    }

    const expense = await Expenses.findOne({ where: { id: expenseId, groupId } });

    // Ghi nhận Activity: gửi yêu cầu settle up
    await logActivity({
      userId: userId,
      title: 'Settle Up',
      activityType: 'expense',
      description: `Requested to settle up for expense "${expense.title}" in group "${group.name}".`
    });

    // Log Notification: thông báo settle up
    await logNotification({
      userId: paidbyId,
      description: `"${user.username}" has requested to settle up for the expense "${expense.title}" in group "${group.name}".`
    });

    // Gửi thông báo đến người trả tiền
    const paidUserClient = connectedClients[paidbyId];
    if (paidUserClient && paidUserClient.ws.readyState === ws.OPEN) {
      paidUserClient.ws.send(JSON.stringify({
        type: 'SETTLE_UP_REQUEST',
        payload: {
          groupName: group.name,
          userName: user.username,
          expenseTitle: expense.title,
        }
      }));
    }

  }
  catch (error) {
    console.error("Lỗi khi gửi tin nhắn WebSocket:", error);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: "Failed to settle up. Please try again."
    }));
  }

}

// Handle update expense item status  
async function handleUpdateExpenseItemStatus(ws, connectedClients, payload) {
  const { expenseId, groupId, itemId, userId, paidId, status } = payload;

  if (!expenseId || !itemId || !groupId || !userId || !paidId || !status) {
    return ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Thiếu thông tin expenseId, itemId, groupId, userId, paidId hoặc status.'
    }));
  }

  try {
    const user = await Users.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const group = await Groups.findOne({ where: { id: groupId } });
    if (!group) {
      throw new Error('Group not found');
    }

    const expense = await Expenses.findOne({ where: { id: expenseId } });
    if (!expense) {
      throw new Error('Expense not found');
    }

    // Cập nhật trạng thái của mục chi phí
    const expenseItem = await expenseItems.findOne({ where: { id: itemId, expenseId: expenseId } });
    if (!expenseItem) {
      throw new Error('Expense item not found');
    }

    expenseItem.is_paid = status;
    await expenseItem.save();

    // Ghi nhận Activity: cập nhật trạng thái mục chi phí
    // Chuyển đổi status thành chuỗi mô tả
    let statusText = status === 'yes' ? 'Paid' : 'Unpaid';

    await logActivity({
      userId: paidId,
      title: 'Update Expense Item Status',
      activityType: 'expense',
      description: `Updated the status of expense "${expense.title}" in group "${group.name}" to "${statusText}".`
    });

    await logNotification({
      userId: userId,
      description: `The status of expense item "${expense.title}" in group "${group.name}" has been updated to "${statusText}".`
    });

    // Gửi thông báo đến thành viên của item
    userClient = connectedClients[userId];
    if (userClient && userClient.ws.readyState === ws.OPEN) {
      userClient.ws.send(JSON.stringify({
        type: 'EXPENSE_ITEM_STATUS_UPDATED',
        payload: {
          groupName: group.name,
          expenseTitle: expense.title,
          status: status,
        }
      }));
    }

  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái mục chi phí:", error);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: "Failed to update expense item status. Please try again."
    }));
  }
}

// Handle submit report
async function handleSubmitReport(ws, connectedClients, payload) {
  const { reporterId, reportedUserId, reason } = payload;

  if (!reporterId || !reportedUserId || !reason) {
    return ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Missing required fields for report submission.'
    }));
  }

  try {
    // Get user information
    const reportedUser = await Users.findByPk(reportedUserId);
    if (!reportedUser) {
      return ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Reported user not found.'
      }));
    }

    // Log activity for the reporter
    await logActivity({
      userId: reporterId,
      title: 'Submit Report',
      activityType: 'report',
      description: `Submitted a report against user "${reportedUser.username}" for: ${reason}`
    });

    // Get reporter info for notification
    const reporterUser = await Users.findByPk(reporterId);

    // Get all admin users and send notifications
    const adminUsers = await Users.findAll({ where: { role: 'admin' } });
    
    // Log notifications for all admins
    const adminNotifications = adminUsers.map(admin =>
      logNotification({
        userId: admin.id,
        description: `New report submitted by "${reporterUser.username}" against "${reportedUser.username}" for: ${reason}`
      })
    );
    await Promise.all(adminNotifications);

    // Send real-time notifications to online admins via WebSocket
    adminUsers.forEach(admin => {
      const adminClient = connectedClients[admin.id];
      if (adminClient && adminClient.ws.readyState === ws.OPEN) {
        adminClient.ws.send(JSON.stringify({
          type: 'NEW_REPORT_NOTIFICATION',
          payload: {
            reporterId,
            reportedUsername: reportedUser.username,
            reason,
            message: `New report submitted by "${reporterUser.username}" against "${reportedUser.username}"`
          }
        }));
      }
    });

    // Send confirmation to reporter
    const reporterClient = connectedClients[reporterId];
    if (reporterClient && reporterClient.ws.readyState === ws.OPEN) {
      reporterClient.ws.send(JSON.stringify({
        type: 'REPORT_SUBMITTED',
        payload: {
          reporterId,
          reportedUsername: reportedUser.username,
          reason
        }
      }));
    }

  } catch (error) {
    console.error("Error handling report submission:", error);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: "Failed to submit report. Please try again."
    }));
  }
}

// // Handle resolve report
// async function handleResolveReport(ws, connectedClients, payload) {
//   const { reportId, adminId } = payload;

//   if (!reportId || !adminId) {
//     return ws.send(JSON.stringify({
//       type: 'ERROR',
//       message: 'Missing required fields for report resolution.'
//     }));
//   }

//   try {
//     // Get report information
//     const report = await Reports.findByPk(reportId, {
//       include: [
//         {
//           model: Users,
//           as: 'reporter',
//           attributes: ['id', 'username']
//         },
//         {
//           model: Users,
//           as: 'reportedUser',
//           attributes: ['id', 'username']
//         }
//       ]
//     });

//     if (!report) {
//       return ws.send(JSON.stringify({
//         type: 'ERROR',
//         message: 'Report not found.'
//       }));
//     }

//     // Update report status
//     report.status = 'Resolved';
//     await report.save();

//     // Log notification for the reporter
//     await logNotification({
//       userId: report.reporterId,
//       description: 'Your report has been resolved!'
//     });

//     // Send real-time notification to reporter via WebSocket
//     const reporterClient = connectedClients[report.reporterId];
//     if (reporterClient && reporterClient.ws.readyState === ws.OPEN) {
//       reporterClient.ws.send(JSON.stringify({
//         type: 'REPORT_RESOLVED',
//         payload: {
//           reportId: report.id,
//           message: 'Your report has been resolved!'
//         }
//       }));
//     }

//     // Send confirmation to admin
//     ws.send(JSON.stringify({
//       type: 'REPORT_RESOLVE_SUCCESS',
//       payload: {
//         reportId: report.id,
//         message: 'Report resolved successfully'
//       }
//     }));

//   } catch (error) {
//     console.error("Error handling report resolution:", error);
//     ws.send(JSON.stringify({
//       type: 'ERROR',
//       message: "Failed to resolve report. Please try again."
//     }));
//   }
// }
