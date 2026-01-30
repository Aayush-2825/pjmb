import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ["credentials", "google", "github", "magic-link"],
      required: true,
      index: true,
    },

    providerAccountId: {
      type: String,
      required: true,
    },

    passwordHash: {
      type: String,
      select: false,
    },

    accessToken: String,
    refreshToken: String,

    accessTokenExpiresAt: Date,
    refreshTokenExpiresAt: Date,

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

accountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });
accountSchema.index({ userId: 1, provider: 1 });


export const Account =
  mongoose.models.Account || mongoose.model("Account", accountSchema);
