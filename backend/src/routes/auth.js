import express from "express";
import passport from "passport";
import authController from "../auth/authController.js";

const router = express.Router();
router.post("/register", async (req, res) => {
  try {
    authController.register(req, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Register failed" });
  }
});

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  authController.login
);

router.get("/refresh", authController.refresh);

router.get("/logout", authController.logout);

export default router;
