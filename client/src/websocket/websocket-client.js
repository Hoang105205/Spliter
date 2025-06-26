function connectWebSocket(userData) {
  const ws = new WebSocket('ws://localhost:3000');
  
  ws.onopen = () => {
    console.log("Đã kết nối tới WebSocket Server!");

    // Gửi thông tin người dùng với type = 'login' khi kết nối
    if (userData) {
      ws.send(JSON.stringify({
        type: "login", // Thêm field type để định nghĩa loại tin nhắn
        payload: {
          userID: userData.id, // ID của người dùng
          username: userData.username, // Tên người dùng
          email: userData.email, // Email của người dùng
          role: userData.role // Vai trò của người dùng
        }
      }));
    } else {
      console.warn("Không có thông tin người dùng để gửi.");
    }
  };

   ws.onmessage = (event) => {
    try {
      const jsonData = JSON.parse(event.data);
      console.log("Tin nhắn từ Server: ", jsonData);
      
      // Xử lý tin nhắn từ server theo loại
      handleServerMessage(jsonData.type, jsonData);
    } catch (error) {
      console.error("Lỗi parse JSON từ server: ", error);
    }
  };

  ws.onclose = () => {
    console.log("Đã mất kết nối tới WebSocket Server.");
  };

  return ws;
}

// Hàm xử lý tin nhắn từ server
function handleServerMessage(type, jsonData) {
  switch (type) {
    case 'SUCCESS':
      console.log(`Thành công: ${jsonData.message}`);
      break;
    case 'ERROR':
      console.error(`Lỗi: ${jsonData.message}`);
      break;

    case 'login_message':
      console.log(`Đăng nhập thành công: ${jsonData.payload.message}`);
      break;

    case 'FRIEND_REQUEST':
      handleFriendRequest(jsonData.payload);
      break;

    case 'ERROR':
      
      break;

    case 'NOTIFICATION':
      
      break;

    case 'MESSAGE':
      
      break;

    default:
      console.warn(`Loại tin nhắn không được hỗ trợ: ${type}`);
  }
}

function handleFriendRequest(payload) {
  const { senderId, senderUsername, status } = payload;
  console.log(`Yêu cầu kết bạn nhận được từ ${senderUsername} (${senderId}). Trạng thái: ${status}`);
  // Thêm logic xử lý, ví dụ: hiển thị pop-up yêu cầu kết bạn
}


export default connectWebSocket;