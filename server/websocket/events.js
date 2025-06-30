const { createFriendRequest } = require('../services/friendService.js');

module.exports = function(ws, connectedClients) {
  ws.on('message', (message) => {
    const parsedMessage = message.toString();

    try {
      const jsonData = JSON.parse(parsedMessage);
      console.log("Client gửi: ", jsonData);

      switch (jsonData.type) {
        
        case 'login':
          handleLogin(ws, connectedClients, jsonData.payload);
          break;

        case 'ADD_FRIEND':
          handleAddFriend(ws, connectedClients, jsonData.payload);
          break;

        case 'FRIEND_REQUEST':
          handleFriendRequest(ws, connectedClients, jsonData.payload);
          break;


        case 'ACCEPT_FRIEND_REQUEST':
          handleAcceptFriendRequest(ws, connectedClients, jsonData.payload);
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
        data: record
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

// Hàm xử lý FRIEND_REQUEST
function handleFriendRequest(ws, connectedClients, payload) {
  const { requestId, senderId, status } = payload;

  if (!requestId || !senderId || !status) {
    console.warn("Thiếu thông tin requestId, senderId, hoặc status.");
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: "Phản hồi kết bạn thất bại: Thiếu thông tin cần thiết." }));
    return;
  }

  // Log phản hồi nhận được
  console.log(`Phản hồi kết bạn nhận được:`);
  console.log(`Request ID: ${requestId}`);
  console.log(`Người gửi (senderId): ${senderId}`);
  console.log(`Trạng thái: ${status}`);

  // // Tìm WebSocket của người gửi trong danh sách đã kết nối
  // const senderClient = connectedClients[senderId];

  // if (senderClient && senderClient.ws.readyState === ws.OPEN) {
  //   // Gửi thông báo kết quả tới người gửi
  //   senderClient.ws.send(
  //     JSON.stringify({
  //       type: 'FRIEND_REQUEST_RESULT',
  //       payload: {
  //         requestId: requestId,
  //         status: status,
  //       },
  //     })
  //   );

  //   console.log(`Đã gửi kết quả phản hồi tới ${senderClient.username} (${senderId}).`);
  // } else {
  //   console.warn(`Người gửi (${senderId}) không kết nối.`);
  //   ws.send(JSON.stringify({ message: `Người gửi (${senderId}) không online hoặc không kết nối.` }));
  // }
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
