import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authenticateSocket = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token || !token.startsWith("Bearer ")) {
      return next(new Error("Unauthorized"));
    }
    console.log(token);
    try {
      const payload = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
      const user = await User.findOne({ _id: payload.id });
      if (!user) return next(new Error("User not found"));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });
};

export default authenticateSocket;
