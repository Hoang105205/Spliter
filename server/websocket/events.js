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


        default:
          ws.send(JSON.stringify({ message: `Loại tin nhắn không được hỗ trợ: ${jsonData.type}` }));
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
    ws.send(JSON.stringify({ message: `Đăng nhập thành công: ${username}` }));
  } else {
    console.warn("Thiếu thông tin định danh (userID hoặc username).");
    ws.send(JSON.stringify({ message: "Đăng nhập thất bại: Thiếu thông tin định danh." }));
  }
}


// Hàm xử lý ADD_FRIEND
function handleAddFriend(ws, connectedClients, payload) {
  const { senderId, receiverId } = payload;

  if (!senderId || !receiverId) {
    console.warn("Thiếu thông tin senderId hoặc receiverId.");
    ws.send(JSON.stringify({ message: "Yêu cầu kết bạn thất bại: Thiếu thông tin người gửi hoặc người nhận." }));
    return;
  }

  // Log trạng thái của connectedClients và WebSocket
  console.log("Trạng thái hiện tại của connectedClients: ", connectedClients);
  console.log(`Sender WebSocket readyState: ${connectedClients[senderId]?.ws.readyState}`);
  console.log(`Receiver WebSocket readyState: ${connectedClients[receiverId]?.ws.readyState}`);

  // Log thông tin nhận được từ client
  console.log(`Yêu cầu kết bạn nhận được:`);
  console.log(`Người gửi (senderId): ${senderId}`);
  console.log(`Người nhận (receiverId): ${receiverId}`);

  // Tìm WebSocket của người nhận trong danh sách đã kết nối
  const receiverClient = connectedClients[receiverId];

  if (receiverClient && receiverClient.ws.readyState === ws.OPEN) {
    // Gửi thông báo yêu cầu kết bạn tới người nhận
    receiverClient.ws.send(
      JSON.stringify({
        type: 'FRIEND_REQUEST',
        payload: {
          senderId: senderId,
          senderUsername: connectedClients[senderId]?.username || "Người dùng không xác định",
          status: 'pending', // Trạng thái ban đầu là 'pending'
        },
      })
    );
    console.log(`Đã gửi yêu cầu kết bạn tới ${receiverClient.username} (${receiverId})`);

    // Phản hồi lại người gửi
    ws.send(JSON.stringify({ message: `Yêu cầu kết bạn đã được gửi tới ${receiverClient.username}.` }));
  } else {
    console.warn(`Người nhận (${receiverId}) không kết nối.`);
    ws.send(
      JSON.stringify({
        type: 'ERROR',
        message: `Người nhận (${receiverId}) không online hoặc không kết nối.`,
      })
    );
  }
}

// Hàm xử lý FRIEND_REQUEST
function handleFriendRequest(ws, connectedClients, payload) {
  const { requestId, senderId, status } = payload;

  if (!requestId || !senderId || !status) {
    console.warn("Thiếu thông tin requestId, senderId, hoặc status.");
    ws.send(JSON.stringify({ message: "Phản hồi kết bạn thất bại: Thiếu thông tin cần thiết." }));
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