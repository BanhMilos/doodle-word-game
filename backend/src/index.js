import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import user_route from "./routes/UserRoute.js";
import Room from "./models/roomModel.js";
import Player from "./models/playerModel.js";

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

  socket.on("disconnect", async () => {
    const player = await Player.findOne({ socketID: socket.id });
    const rooms = await Room.find({ players: player._id });

    for (const room of rooms) {
      // Xoá player khỏi room
      room.players.pull(player._id);
      await room.save();

      // Nếu sau khi xóa room trống, xóa room
      if (room.players.length === 0) {
        await room.deleteOne();
        console.log(`🗑️ Room ${room._id} deleted because it's empty.`);
      } else {
        console.log(`✅ Player removed from room ${room._id}`);
      }
    }
    await player.deleteOne();
    console.log(`❌ User disconnected: ${socket.id}`);
  });
  socket.on("create_room", async ({ username, roomName, size, rounds }) => {
    try {
      const roomExists = await Room.findOne({ name: roomName });
      if (roomExists) {
        socket.emit("room_exists", { message: "Room already exists" });
        return;
      }
      const roomData = new Room({
        name: roomName,
        occupancy: size,
        maxRound: rounds,
      });
      const player = new Player({
        name: username,
        socketID: socket.id,
        isPartyLeader: true,
      });
      roomData.players.push(player);
      await roomData.save();
      await player.save();
      socket.join(roomName);
      io.to(roomName).emit("updateRoom", { roomData });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("join_room", async ({ username, roomName }) => {
    try {
      const roomData = await Room.findOne({ name: roomName });
      if (!roomData) {
        socket.emit("room_not_found", { message: "Room not found" });
        return;
      }
      if (roomData.isJoin) {
        const player = new Player({
          name: username,
          socketID: socket.id,
          isPartyLeader: false,
        });
        roomData.players.push(player);
        await player.save();
        socket.join(roomName);
        if (roomData.players.length === roomData.occupancy) {
          roomData.isJoin = false;
        }
        roomData.turn = roomData.players[roomData.turnIndex];
        await roomData.save();
        const updatedRoom = await Room.findById(roomData._id).populate('players');
        io.to(roomName).emit("updateRoom", { roomData: updatedRoom });
      } else {
        socket.emit("room_full", { message: "Room is full" });
      }
    } catch (error) {
      console.log(error);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
