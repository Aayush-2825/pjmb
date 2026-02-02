import { Router } from "express";
import {
  forgotPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
  getProfile,
  googleCallback
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import passport from "../config/passport.js"
import { disableTwoFactor, enableTwoFactor, generateTwoFactorRecoveryCodes, setupTwoFactor, twoFactorStatus, verifyTwoFactor, verifyTwoFactorRecovery } from "../controllers/twofactor.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
import {
  enable2FASchema,
  verify2FASchema,
  verifyRecovery2FASchema,
} from "../validators/twofactor.validator.js";
import {
  registerRateLimiter,
  loginRateLimiter,
  passwordResetRateLimiter,
  twoFactorRateLimiter,
  emailResendRateLimiter,
} from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/register", registerRateLimiter, validate(registerSchema), registerUser);
router.post("/login", loginRateLimiter, validate(loginSchema), loginUser);
router.post("/logout", requireAuth, logoutUser);
router.post("/refresh", validate(refreshTokenSchema), refreshAccessToken);
router.get('/me', requireAuth, getProfile);
router.post('/resend-verification', emailResendRateLimiter, validate(resendVerificationSchema), resendVerificationEmail)

router.post("/verify/email", validate(verifyEmailSchema), verifyEmail);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

router.post('/forgot-password', passwordResetRateLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);



router.post('/2fa/setup', requireAuth, setupTwoFactor);
router.post('/2fa/enable', requireAuth, validate(enable2FASchema), enableTwoFactor);
router.post('/2fa/disable', requireAuth, disableTwoFactor);
router.post('/2fa/verify', requireAuth, twoFactorRateLimiter, validate(verify2FASchema), verifyTwoFactor);
router.post('/2fa/recovery/generate', requireAuth, generateTwoFactorRecoveryCodes );
router.post('/2fa/recovery/verify', requireAuth, validate(verifyRecovery2FASchema), verifyTwoFactorRecovery );
router.get('/2fa/status', requireAuth, twoFactorStatus);

export default router;
