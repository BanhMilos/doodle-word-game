import { generate } from "random-words";
import redis from "../config/redis.js";
import Player from "../models/playerModel.js";
import Room from "../models/roomModel.js";
const startTurn = async ({ roomId }, io) => {
  let roomData = await redis.get(`room:${roomId}`);
  roomData = JSON.parse(roomData);
  if (roomData.turn === roomData.turnsPerRound) {
    roomData.round += 1;
    roomData.turn = 0;
  }
  roomData.turn += 1;
  const username =
    roomData.guessedCorrectlyPeople[
      Math.floor(Math.random() * roomData.guessedCorrectlyPeople.length)
    ] ||
    (await Player.findOne({
      _id: roomData.players[
        Math.floor(Math.random() * roomData.players.length)
      ],
    }).username);
  if (roomData.guessedCorrectlyPeople) {
    roomData.guessedCorrectlyPeople = [];
  }
  roomData.drawingPlayer = username;
  io.to(roomId).emit("startTurn", {
    username,
    turn: roomData.turn,
    round: roomData.round,
  });
  await redis.set(`room:${roomId}`, JSON.stringify(roomData));
};

const chooseWord = async ({ username, wordsCount, roomId }, io) => {
  const words = generate(wordsCount);
  io.to(roomId).emit("chooseWord", { username, words });
};

const startGuessing = async ({ roomId, word, username, drawTime }, io) => {
  let roomData = await redis.get(`room:${roomId}`);
  roomData = JSON.parse(roomData);
  roomData.currentWord = word;
  await redis.set(`room:${roomId}`, JSON.stringify(roomData));
  io.to(roomId).emit("startGuessing", { username, word });
  const interval = setInterval(async () => {
    drawTime -= 1;
    io.to(roomId).emit("drawTime", { drawTime });
    if (drawTime === 0) {
      clearInterval(interval);
      io.to(roomId).emit("guessingTimeOver", { word });
    }
  }, 1000);
  if (
    roomData.turn === roomData.turnsPerRound &&
    roomData.round === roomData.maxRound
  ) {
    io.to(roomId).emit("gameOver", { message: "Game Over" });
  } else {
    await startTurn({ roomId }, io);
  }
};

const drawing = async ({ username, roomId }, io) => {
  io.to(roomId).emit("drawing", { username });
};

const guessedCorrectly = async ({ username, roomId }, io) => {
  let roomData = await redis.get(`room:${roomId}`);
  roomData = JSON.parse(roomData);
  roomData.guessedCorrectlyPeople.push(username);
  await redis.set(`room:${roomId}`, JSON.stringify(roomData));
  io.to(roomId).emit("guessedCorrectly", { username });
};

const endTurn = async ({ roomId, username, score }, io) => {
  let roomData = await redis.get(`room:${roomId}`);
  roomData = JSON.parse(roomData);
  if (roomData.scores[username]) roomData.scores[username] += score;
  else roomData.scores[username] = score;
  await redis.set(`room:${roomId}`, JSON.stringify(roomData));
  io.to(roomId).emit("endTurn", { username, score });
};

const gameOver = async ({ roomId, username, score }, io) => {
  const player = await Player.findOne({ username });
  player.totalGames += 1;
  player.highestScore = Math.max(player.highestScore, score);
  await player.save();
  let roomData = await redis.get(`room:${roomId}`);
  roomData = JSON.parse(roomData);
  roomData.players = roomData.players.filter((p) => p.username !== username);
  if (roomData.players.length === 0) {
    const room = await Room.findOne({ roomId });
    room.occupancy = roomData.occupancy;
    room.maxRound = roomData.maxRound;
    room.turnsPerRound = roomData.turnsPerRound;
    room.wordsCount = roomData.wordsCount;
    room.drawTime = roomData.drawTime;
    await room.save();
    await redis.del(`room:${roomId}`);
  } else {
    roomData.scores[username] += score;
    await redis.set(`room:${roomId}`, JSON.stringify(roomData));
    io.to(roomId).emit("leaderboard", { scores: roomData.scores });
  }
};

export default {
  startTurn,
  chooseWord,
  startGuessing,
  drawing,
  guessedCorrectly,
  endTurn,
  gameOver,
};
