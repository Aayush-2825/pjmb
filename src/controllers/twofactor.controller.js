import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
import { generateSecret } from "../utils/generate-secret.js";
import speakeasy from "speakeasy";
import crypto from "crypto";
import { hashRecoveryCode } from "../utils/recovery-code.js";

/**
 * STEP 1: SETUP (QR CODE)
 */
const setupTwoFactor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select("+twoFactorTempSecret");

  if (!user) throw new ApiError(404, "User not found");
  if (user.twoFactorEnabled)
    throw new ApiError(400, "2FA already enabled");

  const { secret, otpAuthUrl, qrCode } = await generateSecret(user);

  user.twoFactorTempSecret = secret.base32;
  await user.save();

  return res.json(
    new ApiResponse(
      200,
      { otpAuthUrl, qrCode },
      "Scan QR and verify OTP"
    )
  );
});

/**
 * STATUS
 */
const twoFactorStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) throw new ApiError(404, "User not found");

  return res.json(
    new ApiResponse(
      200,
      {
        enabled: user.twoFactorEnabled,
        enabledAt: user.twoFactorEnabledAt,
      },
      "2FA status"
    )
  );
});

/**
 * STEP 2: ENABLE
 */
const enableTwoFactor = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const user = await User.findById(req.userId).select(
    "+twoFactorTempSecret +twoFactorSecret"
  );

  if (!user?.twoFactorTempSecret)
    throw new ApiError(400, "2FA setup not initiated");

  const valid = speakeasy.totp.verify({
    secret: user.twoFactorTempSecret,
    encoding: "base32",
    token: otp,
    window: 1,
  });

  if (!valid) throw new ApiError(400, "Invalid OTP");

  const rawCodes = Array.from({ length: 8 }, () =>
    crypto.randomBytes(4).toString("hex")
  );

  user.twoFactorSecret = user.twoFactorTempSecret;
  user.twoFactorTempSecret = undefined;
  user.twoFactorEnabled = true;
  user.twoFactorEnabledAt = new Date();
  user.twoFactorRecoveryCodes = rawCodes.map(hashRecoveryCode);
  user.twoFactorFailedAttempts = 0;
  user.twoFactorLockedUntil = null;

  await user.save();

  return res.json(
    new ApiResponse(
      200,
      { recoveryCodes: rawCodes },
      "2FA enabled — save recovery codes"
    )
  );
});

/**
 * VERIFY OTP (TEST)
 */
const verifyTwoFactor = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const user = await User.findById(req.userId).select("+twoFactorSecret");

  if (!user?.twoFactorEnabled)
    throw new ApiError(400, "2FA not enabled");

  let valid;
  try {
    valid = user.verifyTwoFactorCode(otp);
  } catch (err) {
    await user.save();
    throw new ApiError(423, err.message);
  }

  await user.save();

  if (!valid) throw new ApiError(400, "Invalid OTP");

  return res.json(new ApiResponse(200, {}, "OTP verified"));
});

/**
 * VERIFY RECOVERY CODE
 */
const verifyTwoFactorRecovery = asyncHandler(async (req, res) => {
  const { recoveryCode } = req.body;

  const user = await User.findById(req.userId).select(
    "+twoFactorRecoveryCodes"
  );

  if (!user?.twoFactorEnabled)
    throw new ApiError(400, "2FA not enabled");

  const valid = user.verifyRecoveryCode(recoveryCode);
  await user.save();

  if (!valid) throw new ApiError(400, "Invalid recovery code");

  return res.json(
    new ApiResponse(200, {}, "Recovery code accepted")
  );
});

/**
 * DISABLE
 */
const disableTwoFactor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) throw new ApiError(404, "User not found");
  if (!user.twoFactorEnabled)
    throw new ApiError(400, "2FA not enabled");

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  user.twoFactorTempSecret = undefined;
  user.twoFactorRecoveryCodes = [];
  user.twoFactorEnabledAt = null;
  user.twoFactorFailedAttempts = 0;
  user.twoFactorLockedUntil = null;

  await user.save();

  return res.json(
    new ApiResponse(200, {}, "2FA disabled")
  );
});

const generateTwoFactorRecoveryCodes = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select(
    "+twoFactorEnabled +twoFactorRecoveryCodes"
  );
  if (!user) throw new ApiError(404, "User not found");
  if (!user.twoFactorEnabled)
    throw new ApiError(400, "2FA not enabled");
  const rawCodes = Array.from({ length: 8 }, () => 
    crypto.randomBytes(4).toString("hex")
  );
  user.twoFactorRecoveryCodes = rawCodes.map(hashRecoveryCode);
  await user.save();
  return res.json(
    new ApiResponse(
      200,
      { recoveryCodes: rawCodes },
      "New recovery codes generated — save them securely"
    )
  );

})

export {
  setupTwoFactor,
  twoFactorStatus,
  enableTwoFactor,
  verifyTwoFactor,
  verifyTwoFactorRecovery,
  disableTwoFactor,
  generateTwoFactorRecoveryCodes,
};