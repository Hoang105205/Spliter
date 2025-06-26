const WebSocket = require('ws');

// Lưu trữ thông tin client đã kết nối
const connectedClients = {};

// Tạo WebSocket Server
function createWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  // Lắng nghe sự kiện 'connection'
  wss.on('connection', (ws) => {
    console.log("Client đã kết nối!");

    // Gửi thông báo khi kết nối thành công
    ws.send(JSON.stringify({ message: "Chào mừng bạn đến với WebSocket Server!" }));

    // Định nghĩa các sự kiện
    require('./events')(ws, connectedClients);

    // Lắng nghe sự kiện 'close'
    ws.on('close', () => {
      console.log("Client đã ngắt kết nối.");
      // Xóa client khỏi danh sách kết nối
      Object.keys(connectedClients).forEach((userID) => {
        if (connectedClients[userID].ws === ws) {
          console.log(`Xóa kết nối của client: ${connectedClients[userID].username} (${userID})`);
          delete connectedClients[userID];
        }
      });
    });
  });

  return wss;
}

module.exports = createWebSocketServer;