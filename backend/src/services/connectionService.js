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
      const score = roomData.scores[player.username];
      roomData.players.splice(index, 1);
      await redis.set(key, JSON.stringify(roomData));
      io.to(roomData.roomId).emit("chatMessage", { username, type: "left", message: `${player.username} left the room` });
      console.log(`👋 ${player.username} left room ${roomData.roomId}`);

      player.totalGames += 1;
      player.highestScore = Math.max(player.highestScore, score);
      await player.save();

      if (roomData.players.length === 0) {
        await Room.updateOne({
          roomId: roomData.roomId,
          occupancy: roomData.occupancy,
          maxRound: roomData.maxRound,
          turnsPerRound: roomData.turnsPerRound,
          wordsCount: roomData.wordsCount,
          drawTime: roomData.drawTime,
        });
        await redis.del(key);
        console.log(`🗑️ Room ${roomData.roomId} empty — archived & deleted`);
      }
    }
  }
};

export default { disconnect };