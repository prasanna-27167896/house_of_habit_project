import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  initOnboard,
  sendOtp,
  verifyOtp,
} from "../controllers/auth.controller.js";

const authRoutes = express.Router();

authRoutes.post("/send-otp", sendOtp);
authRoutes.post("/verify-otp", verifyOtp);
authRoutes.post("/onboard", protect, initOnboard);

export default authRoutes;
