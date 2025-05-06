import passport from "passport";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import LocalStrategy from "passport-local";

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
      const user = await User.findOne({ name: username });
      if (!user) {
          return done(null, false, { message: 'User not found' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
          return done(null, user);
      } else {
          return done(null, false, { message: 'Incorrect password' });
      }
  } catch (error) {
    console.log(error);
      return done(error, false);
  }
})
);

export default passport;
