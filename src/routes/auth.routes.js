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
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout",requireAuth ,logoutUser);
router.post("/refresh", refreshAccessToken);
// router.get('/me', /* getProfile */);
router.post('/resend-verification', resendVerificationEmail)

router.post("/verify/email", verifyEmail);
// router.post('/verify/token', /* verifyToken */);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// router.post('/callback/:provider', /* oauthCallback */);
// router.delete('/account/:provider', /* disconnectProvider */);

export default router;
