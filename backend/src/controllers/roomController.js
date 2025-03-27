import Player from "../models/playerModel.js";
import Room from "../models/roomModel.js";
import { v4 as uuidv4 } from "uuid";
import redis from "../config/redis.js";

export const createRoom = async ({
  username,
  roomName,
  occupancy,
  maxRound,
  wordsCount,
  drawTime,
  hints,
},socket) => {
  try {
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
      players: [player._id],
    });
    const roomData = {
      roomId,
      players: [player._id],
      drawings: [],
      wordsUsed: [],
      round: 1,
      turn: 0,
      currentPlayerIndex: 0,
      currentWord: "",
      name: roomName,
      occupancy,
      maxRound,
      wordsCount,
      drawTime,
      hints,
      isJoin: true,
      createdAt: Date.now(),
    };
    await redis.set(`room:${roomId}`, JSON.stringify(roomData));
    socket.join(roomId);
    socket.emit("chatMessage", { username, type: "create", message: `Room ${roomId} created by ${username}` });
    console.log(`🏠 Room ${roomId} created by ${username}`);
  } catch (error) {
    console.log(error);
  }
};

export const joinRoom = async ({ username, roomId }, socket, io) => {
  try {
    let player = await Player.findOne({ username });
    if (!player) {
      player = await Player.create({ username, socketID: socket.id });
    } else {
      player.socketID = socket.id;
      await player.save();
    }

    const roomKey = `room:${roomId}`;
    let roomData = await redis.get(roomKey);
    if (!roomData)
      return socket.emit("roomNotFound", { message: "Room not found" });

    if (!roomData.isJoin)
      return socket.emit("roomFull", { message: "Room is full" });
    roomData = JSON.parse(roomData);
    roomData.players.push(player._id);
    if (roomData.players.length === roomData.occupancy) {
      roomData.isJoin = false;
    }
    await redis.set(roomKey, JSON.stringify(roomData));
    socket.join(roomId);
    io.to(roomId).emit("chatMessage", { username, type: "join", message: `${username} joined the room` });
    console.log(`👤 ${username} joined room ${roomId}`);
  } catch (error) {
    console.log(error);
  }
};
