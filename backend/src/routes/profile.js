import express from "express";
import Player from "../models/playerModel.js";
import User from "../models/userModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "You must log in!" });
  }
  const player = await Player.findOne({ userId: req.user.id });
  const user = await User.findOne({ _id: req.user.id });
  res.status(200).json({ player, user });
});

router.post("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "You must log in!" });
  }
  const player = await Player.findOne({ userId: req.user.id });
  if (!player) {
    const usedUsername = await Player.findOne({ username: req.body.username });
    if (usedUsername) {
      return res.status(400).json({ error: "Username already in use!" });
    }
    console.log(req.body);
    const newPlayer = await Player.create({ ...req.body, userId: req.user.id });
    return res.status(200).json(newPlayer);
  }
  const usedUsername = await Player.findOne({ username: req.body.username });
  if (!usedUsername) {
    player.username = req.body.username;
    player.avatar = req.body.avatar;
    await player.save();
    return res.status(200).json(player);
  }
  if (usedUsername.userId != req.user.id) {
    return res.status(400).json({ error: "Username already in use!" });
  }
  player.username = req.body.username;
  player.avatar = req.body.avatar;
  await player.save();
  res.status(200).json(player);
});

export default router;
