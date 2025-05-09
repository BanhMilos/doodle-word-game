const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

let rooms = {};

io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);

  socket.on("join_room", ({ username, avatar, roomId }) => {
    const room = roomId || "default"; // Use provided roomId or default
    socket.join(room);

    if (!rooms[room]) rooms[room] = [];

    rooms[room].push({ id: socket.id, username, avatar });
    io.to(room).emit("update_players", rooms[room]);
    socket.emit("room_joined", { roomId: room }); // Emit room ID to the client
  });

  socket.on("send_message", ({ username, message, roomId }) => {
    io.to(roomId || "default").emit("receive_message", { username, message });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter(player => player.id !== socket.id);
      io.to(roomId).emit("update_players", rooms[roomId]);
    }
  });
});

server.listen(4000, () => {
  console.log("Server listening on port 4000");
});