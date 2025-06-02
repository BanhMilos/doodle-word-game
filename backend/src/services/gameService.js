import { generate } from "random-words";
import redis from "../config/redis.js";
import Player from "../models/playerModel.js";
import Room from "../models/roomModel.js";

const intervalMap = new Map();

const startTurn = async ({ roomId }, io) => {
  let roomData = await redis.get(`room:${roomId}`);
  roomData = JSON.parse(roomData);
  const playerCount = roomData?.players?.length ?? 3;
  console.log(`LOG : startTurn run ${roomId} ${roomData.maxRound}`);

  if (roomData.round > roomData.maxRound) {
    roomData.round = 1;
  }

  if (roomData.turn === playerCount) {
    roomData.round += 1;
    roomData.turn = 0;
  }

  roomData.turn += 1;

  const guessed = roomData.guessedCorrectlyPeople || [];
  const players = roomData.players || [];
  let username;

  if (guessed.length > 0) {
    username = guessed[Math.floor(Math.random() * guessed.length)];
  } else {
    const playerId = players[Math.floor(Math.random() * players.length)];
    const player = await Player.findById(playerId);
    if (!player) {
      console.error("⚠️ Player not found for ID:", playerId);
      return;
    }
    username = player.username;
  }

  roomData.guessedCorrectlyPeople = [];
  roomData.drawingPlayer = username;
  roomData.drawings = [];
  roomData.currentWord = "";

  io.to(roomId).emit("clearCanvas");
  console.log(`LOG : startTurn emit clearCanvas ${roomId}`);
  io.to(roomId).emit("startTurn", {
    username,
    turn: roomData.turn,
    round: roomData.round,
  });

  await redis.set(`room:${roomId}`, JSON.stringify(roomData));
};

const chooseWord = async ({ username, wordsCount, roomId }, io) => {
  const words = generate(wordsCount);
  const player = await Player.findOne({ username });
  console.log(`LOG : chooseWord run ${username}`);
  if (player) {
    io.to(player.socketID).emit("chooseWord", { username, words });
  }
};

const startGuessing = async ({ roomId, word, username, drawTime }, io) => {
  let roomData = await redis.get(`room:${roomId}`);
  roomData = JSON.parse(roomData);
  roomData.drawTime = drawTime;

  roomData.currentWord = word;
  await redis.set(`room:${roomId}`, JSON.stringify(roomData));

  console.log(
    `LOG : startGuessing run ${roomId} ${word} ${username} ${drawTime}`
  );
  io.to(roomId).emit("startGuessing", { username, word });

  if (intervalMap.has(roomId)) {        //xoá interval cũ 
    clearInterval(intervalMap.get(roomId));
    intervalMap.delete(roomId);
  }

  const waitForDrawTime = new Promise((resolve) => {      //tạo interval mới
    const interval = setInterval(async () => {
      drawTime -= 1;
      io.to(roomId).emit("drawTime", { drawTime });
      if (drawTime === 0) {
        clearInterval(interval);
        intervalMap.delete(roomId); // cleanup
        io.to(roomId).emit("guessingTimeOver", { word });
        resolve();
      }
    }, 1000);

    intervalMap.set(roomId, interval); // lưu interval mới
  });

  await waitForDrawTime;

  const playerCount = roomData?.players?.length ?? 3;
  if (roomData.turn === playerCount && roomData.round === roomData.maxRound) {
    io.to(roomId).emit("gameOver", { message: "Game Over" });
  } else {
    await startTurn({ roomId }, io);
  }
};

const drawing = async ({ roomId, username, drawingData }, io) => {
  //console.log(`LOG : drawing fired ${roomId} ${username}`)
  try {
    const roomKey = `room:${roomId}`;
    const roomDataRaw = await redis.get(roomKey);
    if (!roomDataRaw) return;

    const roomData = JSON.parse(roomDataRaw);
    const isDrawer = roomData.drawingPlayer === username;
    if (!isDrawer) return;

    roomData.drawings = roomData.drawings || [];
    roomData.drawings.push(drawingData);
    await redis.set(roomKey, JSON.stringify(roomData));

    io.to(roomId).emit("drawing", {
      drawingData,
      from: username,
    });
  } catch (error) {
    console.log(error);
  }
};

const guessedCorrectly = async (
  { username, roomId, message, timer },
  socket,
  io
) => {
  console.log(`guessedCorrectly called service ${username} ${roomId}`);
  let roomData = await redis.get(`room:${roomId}`);
  roomData = JSON.parse(roomData);

  if (roomData.drawingPlayer === username) return;

  if (
    message.trim().toLowerCase() === roomData.currentWord.trim().toLowerCase()
  ) {
    if (!roomData.guessedCorrectlyPeople.includes(username)) {
      roomData.guessedCorrectlyPeople.push(username);

      //tính điểm
      const drawTime = roomData.drawTime || 60;
      let score = Math.round((timer / drawTime) * 1000);

      if (!roomData.scores[username]) roomData.scores[username] = 0;
      roomData.scores[username] += score;
      score = roomData.scores[username];

      await redis.set(`room:${roomId}`, JSON.stringify(roomData));
      io.to(roomId).emit("guessedCorrectly", { username, score });

      const totalGuessers = roomData.players.length - 1; // trừ người vẽ
      if (roomData.guessedCorrectlyPeople.length === totalGuessers) {
        console.log(
          `✅ All players guessed correctly in room ${roomId}. Ending turn.`
        );

        io.to(roomId).emit("allGuessedCorrectly", {
          message: "All players guessed correctly!",
          word: roomData.currentWord,
        });
        const playerCount = roomData?.players?.length ?? 3;
        if (
          roomData.turn === playerCount &&
          roomData.round === roomData.maxRound
        ) {
            console.log(`LOG : gameOver ${roomData.round} ${roomData.maxRound}`);
          io.to(roomId).emit("gameOver", { message: "Game Over" });
          
        } else {
          await startTurn({ roomId }, io);
        }
      }
    }
  }
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
    if (!roomData.scores[username]) roomData.scores[username] = 0;
    roomData.scores[username] += score;
    const sortedScores = Object.entries(roomData.scores)
      .sort((a, b) => b[1] - a[1])
      .map(([username, score]) => ({ username, score }));

    console.log(`📊 Leaderboard for room ${roomId}:`);
    sortedScores.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.username}: ${entry.score}`);
    });

    await redis.set(`room:${roomId}`, JSON.stringify(roomData));
    io.to(roomId).emit("leaderboard", { scores: sortedScores });
  }
};

const handlePlayerLeave = async ({ roomId, username }, io) => {
  let roomDataRaw = await redis.get(`room:${roomId}`);
  if (!roomDataRaw) return;

  let roomData = JSON.parse(roomDataRaw);

  roomData.players = roomData.players.filter((p) => p !== username);

  if (roomData.players.length === 1) {
    await redis.del(`room:${roomId}`);
    io.to(roomId).emit("gameOver", {
      message: `Game ended.`,
    });
    return;
  }

  if (roomData.drawingPlayer === username) {
    roomData.guessedCorrectlyPeople = [];
    roomData.drawingPlayer = "";
    roomData.currentWord = "";
    roomData.drawings = [];

    await redis.set(`room:${roomId}`, JSON.stringify(roomData));

    io.to(roomId).emit("turnEndedDueToDrawerLeave", {
      message: `${username} (the drawer) left the room. Starting a new turn...`,
    });

    await startTurn({ roomId }, io);
    return;
  }

  await redis.set(`room:${roomId}`, JSON.stringify(roomData));
  io.to(roomId).emit("playerLeft", { username });
};

export default {
  startTurn,
  chooseWord,
  startGuessing,
  drawing,
  guessedCorrectly,
  endTurn,
  gameOver,
  handlePlayerLeave,
};
