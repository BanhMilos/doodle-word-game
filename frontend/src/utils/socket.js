// socket.js
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

// Tạo instance socket nhưng không tự động connect
const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false
});

// Hàm gọi khi bạn đã có accessToken (ví dụ sau khi login thành công)
// Nó sẽ kéo token từ localStorage, gán vào auth rồi connect()
export function connectSocket() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.warn("Chưa có accessToken, không thể kết nối socket.");
    return;
  }

  // Cập nhật phần auth trước khi gọi connect()
  socket.auth = { token: `Bearer ${token}` };
  socket.connect();
}

// Hàm gọi khi bạn logout hoặc muốn ngắt kết nối
export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}

export default socket;
