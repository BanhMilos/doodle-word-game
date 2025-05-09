import Player from "../models/playerModel.js";
import Room from "../models/roomModel.js";
import { v4 as uuidv4 } from "uuid";
import redis from "../config/redis.js";

const createRoom = async (
  {
    username,
    roomName,
    occupancy,
    maxRound,
    turnsPerRound,
    wordsCount,
    drawTime,
    hints,
  },
  socket
) => {
  let player = await Player.findOne({ username });
  if (!player) {
    player = await Player.create({ username, socketID: socket.id });
  } else {
    player.socketID = socket.id;
    await player.save();
  }
  const roomId = uuidv4();
  const room = await Room.create({
    roomId,
    name: roomName,
    players: [player._id],
  });
  const roomData = {
    roomId,
    players: [player._id],
    drawings: [],
    guessedCorrectlyPeople: [],
    round: 1,
    turn: 0,
    currentWord: "",
    drawingPlayer: "",
    name: roomName,
    occupancy,
    maxRound,
    turnsPerRound,
    wordsCount,
    drawTime,
    hints,
    isJoin: true,
    scores: [],
    createdAt: Date.now(),
  };
  await redis.set(`room:${roomId}`, JSON.stringify(roomData));
  socket.join(roomId);
  socket.emit("approveJoin", {
    roomId,
    username,
    players: roomData.players,
    round: roomData.round,
    turn: roomData.turn,
    drawingPlayer: roomData.drawingPlayer,
    roomName: roomData.name,
    drawTime,
    hints,
    wordsCount,
  });
  socket.emit("chatMessage", {
    username,
    type: "create",
    message: `Room ${roomId} created by ${username}`,
  });
  console.log(`🏠 Room ${roomId} created by ${username}`);
};

const joinRoom = async ({ username, roomId }, socket, io) => {
  let player = await Player.findOne({ username });
  if (!player) {
    player = await Player.create({ username, socketID: socket.id });
  } else {
    player.socketID = socket.id;
    await player.save();
  }
  if (!roomId) {
    const keys = await redis.keys("room:*");
    for (const key of keys) {
      const roomData = JSON.parse(await redis.get(key));
      if (roomData.isJoin) {
        roomId = roomData.roomId;
        break;
      }
    }
  }
  if (!roomId)
    return socket.emit("noRoomAvailable", { message: "All rooms are full" });
  const roomKey = `room:${roomId}`;
  let roomData = await redis.get(roomKey);
  if (!roomData)
    return socket.emit("roomNotFound", { message: "Room not found" });
  roomData = JSON.parse(roomData);
  if (!roomData.isJoin)
    return socket.emit("roomFull", { message: "Room is full" });
  roomData.players.push(player._id);
  if (roomData.players.length === roomData.occupancy) {
    roomData.isJoin = false;
  }
  const room = await Room.findOne({ roomId });
  room.players = [...room.players, player._id];
  await room.save();
  await redis.set(roomKey, JSON.stringify(roomData));
  socket.join(roomId);
  socket.emit("approveJoin", {
    roomId,
    username,
    players: roomData.players,
    round: roomData.round,
    turn: roomData.turn,
    drawingPlayer: roomData.drawingPlayer,
    roomName: roomData.name,
    drawTime: roomData.drawTime,
    hints: roomData.hints,
    wordsCount: roomData.wordsCount,
    currentWord: roomData.currentWord,
  });
  io.to(roomId).emit("chatMessage", {
    username,
    type: "join",
    message: `${username} joined the room`,
  });
  console.log(`👤 ${username} joined room ${roomId}`);
};

export default { createRoom, joinRoom };
