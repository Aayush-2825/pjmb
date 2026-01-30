import mongoose from "mongoose";

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
      index: true,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
      index: true,
    },

    avatar: {
      url: String,
      localPath: String,
      isCustom: {
        type: Boolean,
        default: false,
      },
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", function () {
  if (!this.avatar?.url) {
    this.avatar = {
      url: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        this.name,
      )}&background=random&color=random`,
      localPath: "",
      isCustom: false,
    };
  }
  // next();
});

userSchema.pre("validate", async function () {
  if (this.username) return;

  const baseUsername = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);

  let username = baseUsername;

  const User = mongoose.models.User;

  const exists = await User.findOne({ username });
  if (!exists) {
    this.username = username;
    return;
  }

  while (true) {
    const suffix = Math.floor(Math.random() * 10000);
    username = `${baseUsername}_${suffix}`;

    const taken = await User.findOne({ username });
    if (!taken) {
      this.username = username;
      return;
    }
  }
});

userSchema.index({ emailVerifiedAt: 1 });
userSchema.index({ isBlocked: 1 });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
