import { Session } from "../models/session.model.js";
import { ApiError } from "../utils/api-error.js";
import asyncHandler from "../utils/async-handler.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized", []);
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyAccessToken(token);

  const session = await Session.findOne({
    _id: payload.sessionId,
    revokedAt: null,
  });

  if (!session) {
    throw new ApiError(401, "Session expired", []);
  }

  req.userId = payload.userId;
  req.sessionId = session._id;

  next();
});
