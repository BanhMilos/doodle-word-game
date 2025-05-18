import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import db from "./config/database.js";
import roomController from "./controllers/roomController.js";
import connectionController from "./controllers/connectionController.js";
import chatController from "./controllers/chatController.js";
import gameController from "./controllers/gameController.js";
import passport from "./auth/passport.js";
import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import authenticateSocket from "./socket/authSocket.js";
import cookieParser from "cookie-parser";
import authenticate from "./middlewares/authenticate.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (change this in production)
  },
});
authenticateSocket(io);

// MongoDB
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Middleware
app.use(
  cors({
    origin: process.env.ORIGIN, 
    methods: ["GET", "POST", "PUT", "DELETE"], // Các phương thức HTTP cho phép
    allowedHeaders: ["Content-Type", "Authorization"], // Các headers cho phép
    credentials: true, // Cho phép gửi cookie và session
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Greeting
app.get("/", (req, res) => {
  res.send(`<h1>Hello World 👋</h1>`);
});
// Routes
app.use("/api/auth", authRouter);
app.use("/api/profile",authenticate,profileRouter);
// Socket.io Connection
io.on("connection", (socket) => {
  console.log(`⚡ A user connected: ${socket.id}`);

  // Connection
  socket.on("disconnect", () => connectionController.disconnect(socket, io));

  // Room
  socket.on("createRoom", (data) => roomController.createRoom(data, socket));
  socket.on("joinRoom", (data) => roomController.joinRoom(data, socket, io),);
  socket.on("getRoomData", (data) => roomController.getRoomData(data, socket));
  socket.on("leaveRoom", (data) => roomController.leaveRoom(data, io));
  socket.on("updateRoom", (data) => roomController.updateRoom(data, io));

  // Game
  socket.on("startTurn", (data) => gameController.startTurn(data, io));
  socket.on("chooseWord", (data) => gameController.chooseWord(data, io));
  socket.on("startGuessing", (data) => gameController.startGuessing(data, io));
  socket.on("guessedCorrectly", (data) => gameController.guessedCorrectly(data, socket, io));
  socket.on("drawing", (data) => gameController.drawing(data, io));
  socket.on("endTurn", (data) => gameController.endTurn(data, io));
  socket.on("gameOver", (data) => gameController.gameOver(data, io));
  socket.on("leaveRoom", (data) => {gameController.handlePlayerLeave(data, io);});
  
  // Chat
  socket.on("chatMessage", (data) => chatController.sendChatToAll(data, io));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
