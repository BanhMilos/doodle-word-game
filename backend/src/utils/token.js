import jwt from 'jsonwebtoken';

const createAccessToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const createRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
};

export { createAccessToken, createRefreshToken };
