import roomService from "../services/roomService.js";

const createRoom = async (
  data,
  socket
) => {
  try {
    await roomService.createRoom(data, socket);
  } catch (error) {
    console.log(error);
    socket.emit("error", { message: "Error creating room" });
  }
};

const joinRoom = async (data, socket, io) => {
  try {
    await roomService.joinRoom(data, socket, io);
  } catch (error) {
    console.log(error);
    socket.emit("error", { message: "Error joining room" });
  }
};

const getRoomData = async (data, socket) => {
  try {
    await roomService.getRoomData(data, socket);
  } catch (error) {
    console.log(error);
    socket.emit("error", { message: "Error getting room data" });
  }
}
export default { createRoom, joinRoom, getRoomData };
