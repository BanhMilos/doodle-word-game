import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createRoom, joinRoom } from "./controllers/roomController.js";
import { disconnect } from "./controllers/connectionController.js";
import { sendChatToAll } from "./controllers/chatController.js";
import { chooseWord, drawing, setWord, startTurn } from "./controllers/gameController.js";
import user_route from "./routes/userRoute.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (change this in production)
  },
});
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes

app.use("/", user_route);

// Socket.io Connection
io.on("connection", (socket) => {
  console.log(`⚡ A user connected: ${socket.id}`);

  // Connection
  socket.on("disconnect",() => disconnect(socket,io));

  // Room
  socket.on("createRoom", (data) => createRoom(data, socket));
  socket.on("joinRoom", (data) => joinRoom(data, socket, io));

  // Game
  socket.on("startTurn",(data,io)=> startTurn(data, io));
  socket.on("chooseWord",(data)=>chooseWord(data, socket));
  socket.on("setWord",(data,io)=>setWord(data, io));
  socket.on("drawing", (data)=> drawing(data, io));

  // Chat
  socket.on("chatMessage",(data) => sendChatToAll(data, io));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
