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
import { disableTwoFactor, enableTwoFactor, setupTwoFactor, twoFactorStatus, verifyTwoFactor, verifyTwoFactorRecovery } from "../controllers/twofactor.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", requireAuth, logoutUser);
router.post("/refresh", refreshAccessToken);
router.get('/me', requireAuth, getProfile);
router.post('/resend-verification', resendVerificationEmail)

router.post("/verify/email", verifyEmail);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);



router.post('/2fa/setup', requireAuth, setupTwoFactor);
router.post('/2fa/enable', requireAuth, enableTwoFactor);
router.post('/2fa/disable', requireAuth, disableTwoFactor);
router.post('/2fa/verify', requireAuth, verifyTwoFactor);
// router.post('/2fa/recovery/generate', requireAuth, );
router.post('/2fa/recovery/verify', requireAuth, verifyTwoFactorRecovery );
router.get('/2fa/status', requireAuth, twoFactorStatus);

export default router;
