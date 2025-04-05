import redis from "../config/redis.js";
import Player from "../models/playerModel.js";
import Room from "../models/roomModel.js";
const disconnect = async (socket,io) => {
  console.log(`❌ Player disconnected: ${socket.id}`);
  let player = await Player.findOne({ socketID: socket.id });
  const keys = await redis.keys("room:*");

  for (const key of keys) {
    const roomData = JSON.parse(await redis.get(key));
    const index = roomData.players.findIndex((p) => p._id === player._id);
    if (index !== -1) {
      roomData.isJoin = true;
      const score = roomData.players[index].score;
      roomData.players.splice(index, 1);
      roomData.currentPlayerIndex -= 1;
      await redis.set(key, JSON.stringify(roomData));
      io.to(roomData.roomId).emit("chatMessage", { username, type: "left", message: `${player.username} left the room` });
      console.log(`👋 ${player.username} left room ${roomData.roomId}`);

      // Tinh diem cho nguoi choi
      player.totalGames += 1;
      player.highestScore = Math.max(player.highestScore, score);
      await player.save();

      // Cập nhật số lượng thành viên trong phòng
      const room = await Room.findOne({ roomId: roomData.roomId });
      room.players = [...room.players, player._id];
      await room.save();

      // Nếu phòng trống, lưu vào MongoDB rồi xoá
      if (roomData.players.length === 0) {
        await Room.updateOne({
          roomId: roomData.roomId,
          drawings: roomData.drawings,
          createdAt: new Date(roomData.createdAt),
          wordsUsed: roomData.wordsUsed,
          name: roomName,
          occupancy: roomData.occupancy,
          maxRound: roomData.maxRound,
          wordsCount: roomData.wordsCount,
          drawTime: roomData.drawTime,
          createdAt: Date.now(),
        });
        await redis.del(key);
        console.log(`🗑️ Room ${roomData.roomId} empty — archived & deleted`);
      }
    }
  }
};

export default { disconnect };