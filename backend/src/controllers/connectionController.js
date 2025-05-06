import connectionService from "../services/connectionService.js";
const disconnect = async (socket,io) => {
  try {
    await connectionService.disconnect(socket,io);
  } catch (error) {
    console.log(error);
    socket.emit("error", { message: "Error disconnecting" });
  }
};

export default { disconnect };