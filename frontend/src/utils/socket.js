import io from "socket.io-client";
const createSocket = () => {
  const token = localStorage.getItem("accessToken");
  const socket = io("http://localhost:5000", {
    transports: ["websocket"],
    auth: {
      token: token,
    },
  });
  return socket;
};
export default createSocket;
