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
    } catch (error) {
      console.error("Lỗi parse JSON từ server: ", error);
    }
  };

  ws.onclose = () => {
    console.log("Đã mất kết nối tới WebSocket Server.");
  };

  return ws;
}

export default connectWebSocket;