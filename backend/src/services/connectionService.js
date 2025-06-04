import redis from "../config/redis.js";
import Player from "../models/playerModel.js";
import Room from "../models/roomModel.js";
const disconnect = async (socket, io) => {
  console.log(`❌ Player disconnected: ${socket.id}`);
  let player = await Player.findOne({ socketID: socket.id });
  console.log(player);
  const keys = await redis.keys("room:*");

  for (const key of keys) {
    const roomData = JSON.parse(await redis.get(key));
    const index = roomData.players.findIndex(
      (p) => p.toString() === player._id.toString()
    );
    console.log(index);
    if (index !== -1) {
      roomData.isJoin = true;
      const score = roomData.scores[player.username];
      roomData.players.splice(index, 1);
      roomData.existingPlayers.splice(index, 1);
      delete roomData.scores[player.username];
      await redis.set(key, JSON.stringify(roomData));
      io.to(roomData.roomId).emit("chatMessage", {
        username: player.username,
        type: "left",
        message: `${player.username} left the room`,
      });
      console.log(`👋 ${player.username} left room ${roomData.roomId}`);
      io.to(roomData.roomId).emit("getRoomData", roomData);

      player.totalGames += 1;
      player.highestScore = Math.max(player.highestScore, score);
      await player.save();

      if (roomData.players.length === 0) {
        await Room.updateOne(
          { roomId: roomData.roomId }, // 1. Filter: tìm document theo roomId
          {
            $set: {
              // 2. Update: các trường muốn sửa
              occupancy: roomData.occupancy,
              maxRound: roomData.maxRound,
              turnsPerRound: roomData.turnsPerRound,
              wordsCount: roomData.wordsCount,
              drawTime: roomData.drawTime,
            },
          }
        );
        await redis.del(key);
        console.log(`🗑️ Room ${roomData.roomId} empty — archived & deleted`);
      }
    }
  }
};

export default { disconnect };
