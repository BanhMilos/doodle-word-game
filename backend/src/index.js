import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import db from "./config/database.js";
import roomController from "./controllers/roomController.js";
import connectionController from "./controllers/connectionController.js";
import chatController from "./controllers/chatController.js";
import gameController from "./controllers/gameController.js";
import sessionConfig from "./config/session.js";
import passport from "./auth/passport.js";
import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (change this in production)
  },
});

// MongoDB
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Chỉ cho phép frontend từ localhost:3000
    methods: ["GET", "POST"], // Các phương thức HTTP cho phép
    allowedHeaders: ["Content-Type", "Authorization"], // Các headers cho phép
    credentials: true, // Cho phép gửi cookie và session
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionConfig);
app.use(passport.initialize());
app.use(passport.session());

// Greeting
app.get("/", (req, res) => {
  req.session.views = (req.session.views || 0) + 1;
  console.log(req.session.views);
  res.send(`<h1>Hello World ${req.session.views}</h1>`);
});
// Routes
app.use("/api/auth", authRouter);
app.use("/api/profile",profileRouter);
// Socket.io Connection
io.on("connection", (socket) => {
  console.log(`⚡ A user connected: ${socket.id}`);

  // Connection
  socket.on("disconnect", () => connectionController.disconnect(socket, io));

  // Room
  socket.on("createRoom", (data) => roomController.createRoom(data, socket));
  socket.on("joinRoom", (data) => roomController.joinRoom(data, socket, io));

  // Game
  socket.on("startTurn", (data, io) => gameController.startTurn(data, io));
  socket.on("chooseWord", (data) => gameController.chooseWord(data, socket));
  socket.on("setWord", (data, io) => gameController.setWord(data, io));
  socket.on("drawing", (data) => gameController.drawing(data, io));

  // Chat
  socket.on("chatMessage", (data) => chatController.sendChatToAll(data, io));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
