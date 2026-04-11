import mongoose from "mongoose";
import speakeasy from "speakeasy";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 60,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
      index: true,
    },

    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
      index: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    avatar: {
      url: String,
      localPath: String,
      isCustom: {
        type: Boolean,
        default: false,
      },
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorSecret: {
      type: String,
      select: false,
    },

    twoFactorTempSecret: {
      type: String,
      select: false,
    },

    twoFactorRecoveryCodes: {
      type: [String],
      select: false,
    },

    twoFactorEnabledAt: {
      type: Date,
    },

    twoFactorFailedAttempts: {
      type: Number,
      default: 0,
    },

    twoFactorLockedUntil: {
      type: Date,
    },
  },
  { timestamps: true },
);


userSchema.pre("save", function () {
  if (!this.avatar?.url) {
    this.avatar = {
      url: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        this.name
      )}&background=random&color=random`,
      localPath: "",
      isCustom: false,
    };
  }
});


userSchema.pre("validate", async function () {
  if (this.username) return;

  const base = this.name.replace(/\s+/g, "_").toLowerCase();
  let username = base;
  const User = mongoose.models.User;
  let count = 0;

  while (await User.exists({ username })) {
    count += 1;
    username = `${base}_${count}`;
  }
  this.username = username;

});


userSchema.index({ email: 1, emailVerifiedAt: 1 });
userSchema.index({ role: 1, isBlocked: 1 });

userSchema.methods.verifyTwoFactorCode = function (token) {
  if (this.twoFactorLockedUntil && this.twoFactorLockedUntil > new Date()) {
    throw new Error("2FA account is temporarily locked due to too many failed attempts");
  }

  const valid = speakeasy.totp.verify({
    secret: this.twoFactorSecret,
    encoding: "base32",
    token: token,
    window: 1,
  });

  if (valid) {
    this.twoFactorFailedAttempts = 0;
    this.twoFactorLockedUntil = null;
    return true;
  }

  this.twoFactorFailedAttempts += 1;
  if (this.twoFactorFailedAttempts >= 5) {
    this.twoFactorLockedUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 min lock
  }
  return false;
};

userSchema.methods.verifyRecoveryCode = function (code) {
  const hash = crypto.createHash("sha256").update(code).digest("hex");
  const index = this.twoFactorRecoveryCodes.indexOf(hash);

  if (index !== -1) {
    this.twoFactorRecoveryCodes.splice(index, 1);
    return true;
  }
  return false;
};

export const User =
  mongoose.models.User || mongoose.model("User", userSchema);
