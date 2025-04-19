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

  socket.on("join_room", ({ username, avatar }) => {
    const roomId = "default"; // for now, one room
    socket.join(roomId);

    if (!rooms[roomId]) rooms[roomId] = [];

    rooms[roomId].push({ id: socket.id, username, avatar });
    io.to(roomId).emit("update_players", rooms[roomId]);
  });

  socket.on("send_message", ({ username, message }) => {
    io.emit("receive_message", { username, message });
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