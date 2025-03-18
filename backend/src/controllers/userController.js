import User from "../models/userModel.js";
import bcrypt from "bcrypt";

const registerLoad = async (req, res) => {
  try {
    res.render("register");
  } catch (error) {
    console.log(error);
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      image: req.file.filename,
      password: hashedPassword,
    });
    await user.save();
    res.render("register", { message: "User registered successfully" });
  } catch (error) {
    console.log(error);
  }
};

const loginLoad = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        req.session.user = user;
        res.redirect("/dashboard");
      } else {
        res.render("login", { message: "Invalid password" });
      }
    } else {
      res.render("login", { message: "User not found" });
    }
  } catch (error) {
    console.log(error);
  }
}

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
}

const dashboardLoad = async (req, res) => {
  try {
    const users=await User.find({_id:{$nin:[req.session.user._id]}})
    res.render("dashboard", { user: req.session.user, users });
  } catch (error) {
    console.log(error);
  }
}
export default {
  registerLoad,
  register,
  loginLoad,
  login,
  logout,
  dashboardLoad
};
