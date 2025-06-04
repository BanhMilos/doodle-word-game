import Player from "../models/playerModel.js";
import User from "../models/userModel.js";
import { createAccessToken, createRefreshToken } from "../utils/token.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const user = await User.find({ name: username } || { email });
    console.log(user);
    if (user.length) return res.status(400).json({ message: "User already exists" });
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: username,
      password: hashed,
      email,
    });
    const newPlayer = await Player.create({username:"player"+newUser._id, avatar: "😠", userId: newUser._id });
    return res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Register failed" });
  }
};

const login = async (req, res) => {
  const user = req.user;
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({ accessToken });
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);
  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    console.log(payload);
    const user = await User.findOne({ _id: payload.id });
    if (!user) return res.sendStatus(403);
    const accessToken = createAccessToken(user);
    res.json({ accessToken });
  } catch (err) {
    console.log(err);
    return res.sendStatus(403);
  }
};

const logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(204);

  try {
    const payload = jwt.verify(token, process.env.REFRESH_SECRET);
    const user = await User.findOne({ _id: payload.id });
    if (!user) return res.sendStatus(204);
    user.refreshToken = null;
    await user.save();
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
  } catch (err) {
    res.clearCookie("refreshToken");
    return res.sendStatus(204);
  }
  return res.sendStatus(200);
};

const me = async (req, res) => {
  res.status(200).json(req.user);
};

export default { register, login, refresh, logout, me };
