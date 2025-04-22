import jwt from "jsonwebtoken";
const authenticate = async (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      req.user = user;
      next();
  })
};
export default authenticate;
