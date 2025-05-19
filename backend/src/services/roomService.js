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
    scores: {
      [username]: 0,
    },
    existingPlayers: [player],
    isPlaying: false,
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
  socket.emit("getRoomData", roomData);
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
    let availableRooms = [];
    const keys = await redis.keys("room:*");
    for (const key of keys) {
      const roomData = JSON.parse(await redis.get(key));
      if (roomData.isJoin) {
        availableRooms.push(roomData.roomId);
      }
    }
    if (availableRooms.length === 0)
      return socket.emit("noRoomAvailable", { message: "All rooms are full" });
    else {
      roomId =
        availableRooms[Math.floor(Math.random() * availableRooms.length)];
    }
  }
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
  const newPlayer = await Player.findOne({ _id: player._id });
  const existingPlayers = [...roomData.existingPlayers, newPlayer];
  roomData.existingPlayers = existingPlayers;
  roomData.scores[username] = 0;
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
    existingPlayers: roomData.existingPlayers,
  });
  io.to(roomId).emit("chatMessage", {
    username,
    type: "join",
    message: `${username} joined the room`,
  });
  io.to(roomId).emit("getRoomData", roomData);
  console.log(`👤 ${username} joined room ${roomId}`);
};

const getRoomData = async ({ username, roomId }, socket) => {
  console.log("getRoomData getRoomData called");
  console.log("getRoomData", roomId);
  if (roomId) {
    let roomData = await redis.get(`room:${roomId}`);
    roomData = JSON.parse(roomData);
    socket.emit("getRoomData", roomData);
    return;
  }

  const keys = await redis.keys("room:*");
  for (const key of keys) {
    const tempRoomData = JSON.parse(await redis.get(key));
    if (tempRoomData.existingPlayers.find((p) => p.username === username)) {
      const roomId = tempRoomData.roomId;
      let roomData = await redis.get(`room:${roomId}`);
      roomData = JSON.parse(roomData);
      socket.emit("getRoomData", roomData);
      break;
    }
  }
};

const updateRoom = async (
  { roomId, occupancy, maxRound, turnsPerRound, wordsCount, drawTime, hints },
  io
) => {
  let roomData = await redis.get(`room:${roomId}`);
  roomData = JSON.parse(roomData);
  roomData = {
    ...roomData,
    occupancy,
    maxRound,
    turnsPerRound,
    wordsCount,
    drawTime,
    hints,
  };
  io.to(roomId).emit("getRoomData", roomData);
  io.to(roomData.roomId).emit("chatMessage", {
    message: `Room setting updated`,
    username: "System",
  });
  console.log("updateRoom called");
};

const leaveRoom = async ({ username, roomId }, io) => {
  const roomKey = `room:${roomId}`;
  let roomData = await redis.get(roomKey);
  if (!roomData) return;

  roomData = JSON.parse(roomData);

  const playerObj = roomData.existingPlayers.find(
    (p) => p.username === username
  );
  if (!playerObj) {
    console.warn(`User ${username} not found in room ${roomId}`);
    return;
  }

  const playerId = playerObj._id;

  roomData.players = roomData.players.filter((p) => p !== playerId);

  roomData.existingPlayers = roomData.existingPlayers.filter(
    (p) => p.username !== username
  );

  roomData.isJoin = true;

  const score = roomData.scores[username];
  delete roomData.scores[username];

  await redis.set(roomKey, JSON.stringify(roomData));

  io.to(roomData.roomId).emit("chatMessage", {
    username: username,
    type: "left",
    message: `${username} left the room`,
  });

  const player = await Player.findOne({ username });
  if (player) {
    player.totalGames += 1;
    player.highestScore = Math.max(player.highestScore, score || 0);
    await player.save();
  }

  io.to(roomData.roomId).emit("getRoomData", roomData);
  console.log(`getRoomData leaveRoom called ${JSON.stringify(roomData)}`);
};

export default { createRoom, joinRoom, getRoomData, updateRoom, leaveRoom };
