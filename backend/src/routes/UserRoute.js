import express from "express";
import path from "path";
import multer from "multer";
import userController from "../controllers/userController.js";
import session from "express-session";
import dotenv from "dotenv";
import auth from "../middlewares/auth.js";

dotenv.config();
const user_route = express();
const __dirname = path.resolve();

// Middleware
user_route.use(express.json());
user_route.use(express.urlencoded({ extended: true }));
user_route.use(express.static("public"));
user_route.use(
  session({
    secret: process.env.SESSION_SECRET,
  })
);
user_route.set("view engine", "ejs");
user_route.set("views", path.join(__dirname, "./src/views"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "./public/images")); // Lưu file vào thư mục "public/images"
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Đổi tên file để tránh trùng lặp
  },
});

const upload = multer({ storage: storage });

// Routes
// Register
user_route.get("/register",auth.isLogout, userController.registerLoad);
user_route.post("/register", upload.single("image"), userController.register);

// Login
user_route.get("/",auth.isLogout, userController.loginLoad);
user_route.post("/", userController.login);

// Logout
user_route.get("/logout", auth.isLogin, userController.logout);

// Dashboard
user_route.get("/dashboard", auth.isLogin, userController.dashboardLoad);

user_route.get("*", (req, res) => res.redirect("/"));
export default user_route;
