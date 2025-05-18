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
const updateRoom = async (data, io) => {
  try {
    await roomService.updateRoom(data, io);
  } catch (error) {
    console.log(error);
    io.to(data.roomId).emit("error", { message: "Error updating room data" });
  }
}
const leaveRoom = async (data, io) => {
  try {
    await roomService.leaveRoom(data, io);
  } catch (error) {
    console.log(error);
    io.to(data.roomId).emit("error", { message: "Error leaving room" });
  }
}
export default { createRoom, joinRoom, getRoomData, updateRoom, leaveRoom };
