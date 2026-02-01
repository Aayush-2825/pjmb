import { Session } from "../models/session.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import asyncHandler from "../utils/async-handler.js";

const listSessions = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const sessions = await Session
        .find({ userId })
        .sort({ createdAt: -1 })
        .lean();

    res
        .status(200)
        .json(new ApiResponse(200, sessions, "All listed sessions"));
});


const revokeSession = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const sessionId = req.params.id;

    const session = await Session.findOne({
        _id: sessionId,
        userId
    });

    if (!session) {
        throw new ApiError(404, "Session not found", []);
    }

    await session.deleteOne();

    res
        .status(200)
        .json(new ApiResponse(200, session, "Session revoked successfully"));
});


const revokeAllSessions = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const result = await Session.deleteMany({ userId });

    if (result.deletedCount === 0) {
        throw new ApiError(404, "No sessions found", []);
    }

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { deletedCount: result.deletedCount },
                "All sessions revoked successfully"
            )
        );
});

export {
    listSessions,
    revokeSession,
    revokeAllSessions
};
