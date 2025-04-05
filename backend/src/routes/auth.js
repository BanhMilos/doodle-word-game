import express from "express";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import passport from "passport";

const router = express.Router();
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ name: username });
    if (user) res.status(400).json({ message: "User already exists" });
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name: username, password: hashed });
    req.login(newUser, (err) => {
      if (err)
        return res.status(500).json({ message: "Login after register failed" });
      res.status(200).json({ message: "Register successful" });
    });
  } catch (error) {
    res.status(500).json({ message: "Register failed" });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "An error occurred during authentication" });
    }
    if (!user) {
      return res.status(401).json({ message: info.message || "Unauthorized" });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return res
          .status(500)
          .json({ message: "An error occurred during login" });
      }
      return res.status(200).json({ message: "Login successful", user });
    });
  })(req, res, next);
});
router.get("/logout", (req, res) => {
  req.logout();
  res.status(200).json({ message: "Logout successful" });
});

export default router;
