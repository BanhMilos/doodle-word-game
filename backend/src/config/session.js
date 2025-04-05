import session from "express-session";
import MongoStore from "connect-mongo";
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collectionName: "sessions",
  ttl:  30 * 24 * 60 * 60,
});

export default session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: false,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
});
