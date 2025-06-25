function connectWebSocket() {
  const ws = new WebSocket('ws://localhost:3000');

  ws.onopen = () => {
    console.log("Đã kết nối tới WebSocket Server!");
    ws.send(JSON.stringify({ message: "Xin chào Server!" }));
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