import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateOtpEmail } from "../templates/otpEmail.js";

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      attempts: 0,
    });

    // await sendEmail({
    //   email,
    //   subject: "OTP from House of Habit",
    //   message: `Your OTP is ${otp}`,

    //   html: generateOtpEmail(otp),
    // });

    await sendEmail({
      email,
      subject: "OTP from House of Habit",
      message: `Your OTP is ${otp}`,
      html: generateOtpEmail(otp),
      attachments: [
        {
          filename: "logo.png",
          path: "./assets/logo.png",
          cid: "hoh-logo",
        },
        {
          filename: "envelope.png",
          path: "./assets/envelope.png",
          cid: "hoh-envelope",
        },
        // 👇 Add the background circles image here
        {
          filename: "circles.png",
          path: "./assets/circles.png",
          cid: "hoh-circles",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found",
      });
    }

    if (otpRecord.attempts >= 5) {
      await Otp.deleteMany({ email });

      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    const isValid = await otpRecord.matchOtp(otp);

    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: `Invalid OTP. Attempts left: ${5 - otpRecord.attempts}`,
      });
    }

    await Otp.deleteMany({ email });

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Authentication successful",
      user,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const initOnboard = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing Details",
      });
    }

    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { phone, name, email },
      { returnDocument: "after" },
    );

    return res.status(200).json({
      success: true,
      message: "Phone number, Name and email were added successfully",
      user: updatedUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Phone number is already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
