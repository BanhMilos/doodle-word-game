import io from "socket.io-client";
const socket = io.connect("http://localhost:"+process.env.REACT_APP_BACKEND_PORT);
export default socket 