import mongoose from "mongoose";
import { calculateExpirationDate } from "../utils/date-time.js";

const verificationSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      index: true, // Useful for lookups by email
    },
    type: {
      type: String,
      enum: ["email-verification", "password-reset", "magic-link", "mfa"],
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true, // This is enough for security
    },
    expiresAt: {
      type: Date,
      required: true,
      // Wrap in a function so it's calculated at creation time, not boot time
      default: () => calculateExpirationDate("15m"),
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// TTL Index
verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Ensure only one pending request per user/type
verificationSchema.index(
  { identifier: 1, type: 1 },
  { unique: true, partialFilterExpression: { usedAt: null } },
);

export const Verification =
  mongoose.models.Verification ||
  mongoose.model("Verification", verificationSchema);
