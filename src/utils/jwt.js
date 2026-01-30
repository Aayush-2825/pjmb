import jwt from "jsonwebtoken";

export const signAccessToken = ({ userId, sessionId }) => {
  return jwt.sign(
    { userId, sessionId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

export const signRefreshToken = ({ sessionId }) => {
  return jwt.sign(
    { sessionId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" }
  );
};

export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
