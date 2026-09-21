import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  registerUser,
  resendVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getMe,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/resend-verification").post(resendVerification);
router.route("/verify-email").post(verifyEmail);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(protect, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(protect, changePassword);
router.route("/get-me").get(protect, getMe);

export default router;
