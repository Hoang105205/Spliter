const WebSocket = require('ws');

// Tạo WebSocket Server
function createWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  // Lắng nghe sự kiện 'connection'
  wss.on('connection', (ws) => {
    console.log("Client đã kết nối!");

    // Gửi thông báo khi kết nối thành công
    ws.send(JSON.stringify({ message: "Chào mừng bạn đến với WebSocket Server!" }));

    // Định nghĩa các sự kiện
    require('./events')(ws);

    // Lắng nghe sự kiện 'close'
    ws.on('close', () => {
      console.log("Client đã ngắt kết nối.");
    });
  });

  return wss;
}

module.exports = createWebSocketServer;