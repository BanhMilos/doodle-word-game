import { generate } from "random-words";
import redis from "../config/redis.js";
import Player from "../models/playerModel.js";
const startTurn = async ({ roomId }, io) => {
  let roomData = await redis.get(`room:${roomId}`);
  roomData = JSON.parse(roomData);
  roomData.isStarted = true;
  if (roomData.turn === roomData.turnsPerRound) {
    roomData.round += 1;
    roomData.turn = 0;
  }
  roomData.turn += 1;
  let username;

  if (roomData.guessedCorrectlyPeople.length > 0) {
    username =
      roomData.guessedCorrectlyPeople[
        Math.floor(Math.random() * roomData.guessedCorrectlyPeople.length)
      ];
  } else if (roomData.players.length > 0) {
    const randomPlayerId =
      roomData.players[Math.floor(Math.random() * roomData.players.length)];
    const player = await Player.findOne({ _id: randomPlayerId });
    if (player) {
      username = player.username;
    } else {
      console.warn("Player not found in DB");
    }
  } else {
    console.warn("No players in roomData");
  }

  if (roomData.guessedCorrectlyPeople.length) {
    roomData.guessedCorrectlyPeople = [];
  }
  roomData.drawingPlayer = username;
  io.to(roomId).emit("getRoomData", roomData);
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
  console.log(roomId);
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
      if (
        roomData.turn === roomData.turnsPerRound &&
        roomData.round === roomData.maxRound
      ) {
        io.to(roomId).emit("gameOver", { message: "Game Over" });
        await gameOver(roomData, io);
      } else {
        await startTurn({ roomId }, io);
      }
    }
  }, 1000);
};

const drawing = async ({ username, roomId }, io) => {
  io.to(roomId).emit("drawing", { username });
};

const guessedCorrectly = async ({ username, roomId, score }, io) => {
  let roomData = await redis.get(`room:${roomId}`);
  roomData = JSON.parse(roomData);
  roomData.guessedCorrectlyPeople.push(username);
  roomData.scores[username] += score;
  await redis.set(`room:${roomId}`, JSON.stringify(roomData));
  io.to(roomId).emit("getRoomData", roomData);
};

const gameOver = async (roomData, io) => {
  const players = await Player.find({ _id: { $in: roomData.players } });
  for (const player of players) {
    player.totalGames += 1;
    player.highestScore = Math.max(player.highestScore, roomData.scores[player.username]);
    await player.save();
  }
  io.to(roomData.roomId).emit("leaderboard", roomData.scores);
};

export default {
  startTurn,
  chooseWord,
  startGuessing,
  drawing,
  guessedCorrectly,
  gameOver,
};
