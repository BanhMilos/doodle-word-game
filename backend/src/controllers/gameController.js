import gameService from "../services/gameService.js";
const startTurn = async (data, io) => {
  try {
    await gameService.startTurn(data, io);
  } catch (error) {
    console.log(error);
    io.to(data.roomId).emit("error", { message: error.message });
  }
};

const chooseWord = async (data, io) => {
  try {
    gameService.chooseWord(data, io);
  } catch (error) {
    console.log(error);
    io.to(data.roomId).emit("error", { message: error.message });
  }
};

const startGuessing = async (data, io) => {
  try {
    gameService.startGuessing(data, io);
  } catch (error) {
    console.log(error);
    io.to(data.roomId).emit("error", { message: error.message });
  }
};

const drawing = async (data, io) => {
  try {
    gameService.drawing(data, io);
  } catch (error) {
    console.log(error);
    io.to(data.roomId).emit("error", { message: error.message });
  }
};

const guessedCorrectly = async (data, socket, io) => {
  console.log(`guessedCorrectly called controller ${JSON.stringify(data)}`);
  try {
    gameService.guessedCorrectly(data, socket, io);
  } catch (error) {
    console.log(error);
    io.to(data.roomId).emit("error", { message: error.message });
  }
};

const endTurn = async (data, io) => {
  try {
    gameService.endTurn(data, io);
  } catch (error) {
    console.log(error);
    io.to(data.roomId).emit("error", { message: error.message });
  }
};

const gameOver = async (data, io) => {
  try {
    gameService.gameOver(data, io);
  } catch (error) {
    console.log(error);
    io.to(data.roomId).emit("error", { message: error.message });
  }
};

const handlePlayerLeave = async (data, io) => {
  try {
    await gameService.handlePlayerLeave(data, io);
  } catch (error) {
    console.error("Error handling player leave:", error);
  }
};

export default { startTurn, chooseWord, startGuessing, drawing, guessedCorrectly, endTurn, gameOver,handlePlayerLeave };
