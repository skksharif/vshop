import { Router } from "express";
import {
  forgotPassword,
  loginUser,
  refreshAccessToken,
  registerUser,
  resendForgotPasswordOTP,
  resendVerificationOTP,
  resetPassword,
  verifyOtp,
} from "../controller/auth.controller";

const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/resend-verification-otp", resendVerificationOTP);
authRouter.post("/resend-forgot-password-otp", resendForgotPasswordOTP);
authRouter.post("/refresh", refreshAccessToken);

export default authRouter;
