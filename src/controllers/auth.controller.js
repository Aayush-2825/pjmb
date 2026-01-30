import mongoose from "mongoose";
import { Account } from "../models/account.model.js";
import { Session } from "../models/session.model.js";
import { User } from "../models/user.model.js";
import { Verification } from "../models/verification.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
import { compareValue, hashValue } from "../utils/bcrypt.js";
import {
  calculateExpirationDate,
  threeMinutesAgo,
} from "../utils/date-time.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { sendEmail } from "../utils/sendMail.js";
import {
  generateVerificationToken,
  hashedVerificationToken,
} from "../utils/Token.js";

// ==========================================
// 1. REGISTER (Atomic Transaction)
// ==========================================
const registerUser = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  // Sanitize email: trim whitespace and lowercase
  const email = req.body.email?.toLowerCase().trim();

  if (!name || !email || !password)
    throw new ApiError(400, "All fields are required");

  // Check duplicate outside transaction for speed
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(409, "User already exists");

  const hashedPassword = await hashValue(password);
  const rawVerificationToken = generateVerificationToken();
  const hashVerificationToken = hashedVerificationToken(rawVerificationToken);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [user] = await User.create([{ name, email }], { session });

    await Account.create(
      [
        {
          userId: user._id,
          provider: "credentials",
          providerAccountId: email,
          passwordHash: hashedPassword,
        },
      ],
      { session },
    );

    await Verification.create(
      [
        {
          identifier: email,
          type: "email-verification",
          token: hashVerificationToken,
          expiresAt: calculateExpirationDate("15m"),
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    // Send Email (Non-blocking)
    const verificationUrl = `${process.env.APP_ORIGIN}/confirm-account?code=${rawVerificationToken}`;
    setImmediate(() => {
      sendEmail({
        to: email,
        subject: "Verify your email",
        html: `<p>Hi ${user.name}, verify here: <a href="${verificationUrl}">Link</a></p>`,
      }).catch((err) => console.error("Email failed:", err));
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { user: { id: user._id, email } },
          "Verify your email.",
        ),
      );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, "Registration failed.");
  }
});

// ==========================================
// 2. LOGIN (Session & Token Issue)
// ==========================================
const loginUser = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const email = req.body.email?.toLowerCase().trim();

  if (!email || !password) throw new ApiError(400, "Required fields missing");

  const user = await User.findOne({ email });
  if (!user || user.isBlocked) throw new ApiError(401, "Invalid credentials");
  if (!user.emailVerifiedAt) throw new ApiError(403, "Verify email first");

  const account = await Account.findOne({
    userId: user._id,
    provider: "credentials",
  }).select("+passwordHash");
  if (!account || !(await compareValue(password, account.passwordHash))) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Create Session
  const session = await Session.create({
    userId: user._id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = signAccessToken({
    userId: user._id,
    sessionId: session._id,
  });
  const refreshToken = signRefreshToken({ sessionId: session._id });

  // Store refresh token hash for reuse detection
  session.refreshTokenHash = await hashValue(refreshToken);
  await session.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { accessToken, refreshToken }, "Login successful"),
    );
});

// ==========================================
// 3. REFRESH TOKEN (Rotation & Theft Protection)
// ==========================================
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(401, "Token required");

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid token");
  }

  const oldSession = await Session.findOne({
    _id: payload.sessionId,
    revokedAt: null,
  }).select("+refreshTokenHash");
  if (!oldSession) throw new ApiError(401, "Session expired");

  const isValid = await compareValue(refreshToken, oldSession.refreshTokenHash);

  if (!isValid) {
    // SECURITY: Token reuse detected! Revoke session immediately.
    await Session.updateOne(
      { _id: payload.sessionId },
      { revokedAt: new Date() },
    );
    throw new ApiError(401, "Security alert: Token reuse detected");
  }

  // Rotate Session
  oldSession.revokedAt = new Date();
  await oldSession.save();

  const newSession = await Session.create({
    userId: oldSession.userId,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    parentSessionId: oldSession._id,
  });

  const newAccessToken = signAccessToken({
    userId: oldSession.userId,
    sessionId: newSession._id,
  });
  const newRefreshToken = signRefreshToken({ sessionId: newSession._id });

  newSession.refreshTokenHash = await hashValue(newRefreshToken);
  await newSession.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { accessToken: newAccessToken, refreshToken: newRefreshToken },
        "Refreshed",
      ),
    );
});

// ==========================================
// 4. VERIFY EMAIL
// ==========================================
const verifyEmail = asyncHandler(async (req, res) => {
  const { code } = req.query;
  const hashedToken = hashedVerificationToken(code);

  const verification = await Verification.findOne({
    type: "email-verification",
    token: hashedToken,
    expiresAt: { $gt: new Date() },
    usedAt: null,
  });

  if (!verification) throw new ApiError(400, "Invalid code");

  const user = await User.findOneAndUpdate(
    { email: verification.identifier },
    { emailVerifiedAt: new Date() },
    { new: true },
  );

  verification.usedAt = new Date();
  await verification.save();

  return res.json(new ApiResponse(200, { user: { id: user._id } }, "Verified"));
});

// ==========================================
// 5. RESEND VERIFICATION (With Rate Limit)
// ==========================================
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  if (!email) throw new ApiError(400, "Email required");

  const user = await User.findOne({ email });
  if (!user || user.emailVerifiedAt) {
    // Don't reveal user status
    return res.json(new ApiResponse(200, {}, "Email sent if account exists"));
  }

  // Rate Limit: Check attempts in last 3 mins
  const count = await Verification.countDocuments({
    identifier: email,
    type: "email-verification",
    createdAt: { $gt: threeMinutesAgo() },
  });

  if (count >= 2) throw new ApiError(429, "Too many requests");

  // Cleanup old tokens
  await Verification.deleteMany({
    identifier: email,
    type: "email-verification",
    usedAt: null,
  });

  const rawToken = generateVerificationToken();
  await Verification.create({
    identifier: email,
    type: "email-verification",
    token: hashedVerificationToken(rawToken),
    expiresAt: calculateExpirationDate("15m"),
  });

  const url = `${process.env.APP_ORIGIN}/confirm-account?code=${rawToken}`;
  await sendEmail({
    to: email,
    subject: "Verify Email",
    html: `<a href="${url}">Verify</a>`,
  });

  return res.json(new ApiResponse(200, {}, "Email sent"));
});

// ==========================================
// 6. PASSWORD RESET (Security Best Practices)
// ==========================================
const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  if (!email) throw new ApiError(400, "Email required");

  const user = await User.findOne({ email });
  if (!user)
    return res.json(new ApiResponse(200, {}, "Email sent if account exists"));

  // Rate Limit
  const count = await Verification.countDocuments({
    identifier: email,
    type: "password-reset",
    createdAt: { $gt: threeMinutesAgo() },
  });
  if (count >= 2) throw new ApiError(429, "Too many requests");

  await Verification.deleteMany({
    identifier: email,
    type: "password-reset",
    usedAt: null,
  });

  const rawToken = generateVerificationToken();
  await Verification.create({
    identifier: email,
    type: "password-reset",
    token: hashedVerificationToken(rawToken),
    expiresAt: calculateExpirationDate("15m"),
  });

  const url = `${process.env.APP_ORIGIN}/reset-password?code=${rawToken}`;
  await sendEmail({
    to: email,
    subject: "Reset Password",
    html: `<a href="${url}">Reset</a>`,
  });

  return res.json(new ApiResponse(200, {}, "Email sent if account exists"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { code } = req.query;
  const { password } = req.body;
  if (!code || !password) throw new ApiError(400, "Missing data");

  const verification = await Verification.findOne({
    type: "password-reset",
    token: hashedVerificationToken(code),
    expiresAt: { $gt: new Date() },
    usedAt: null,
  });

  if (!verification) throw new ApiError(400, "Invalid token");

  const user = await User.findOne({ email: verification.identifier });
  const account = await Account.findOne({
    userId: user._id,
    provider: "credentials",
  });

  account.passwordHash = await hashValue(password);
  await account.save();

  verification.usedAt = new Date();
  await verification.save();

  // SECURITY: Revoke all active sessions upon password change
  await Session.updateMany(
    { userId: user._id, revokedAt: null },
    { revokedAt: new Date() },
  );

  return res.json(new ApiResponse(200, {}, "Password reset successful"));
});

const logoutUser = asyncHandler(async (req, res) => {
  if (!req.sessionId) throw new ApiError(400, "Session missing");
  await Session.findByIdAndUpdate(req.sessionId, { revokedAt: new Date() });
  return res.json(new ApiResponse(200, {}, "Logged out"));
});

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
};
