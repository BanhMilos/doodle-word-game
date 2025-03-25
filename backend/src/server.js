import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

//socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend at localhost:3000
    methods: ["GET", "POST"],
  },
});

// client
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

socket.on("chatMessage", (message) => {
    console.log("Message received:", message);

io.emit("chatMessage", message);
  });

socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
