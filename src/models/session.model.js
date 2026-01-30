import mongoose from "mongoose";
import { calculateExpirationDate } from "../utils/date-time.js";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    parentSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },

    refreshTokenHash: {
      type: String,
      select: false,
    },

    expiresAt: {
      type: Date,
      default: () => calculateExpirationDate("30d"),
    },

    ipAddress: String,
    userAgent: String,

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

sessionSchema.index({ userId: 1 });
sessionSchema.index({ revokedAt: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ parentSessionId: 1 });

export const Session =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);
