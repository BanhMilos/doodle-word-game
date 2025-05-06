import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authenticateSocket = (io) => {
    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("No token"));
        try {
            const payload= jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({ _id: payload.id });
            if (!user) return next(new Error("User not found"));
            socket.user = user;
            next();
        } catch (err) {
            next(new Error("Authentication error"));
        }
    })
}

export default authenticateSocket