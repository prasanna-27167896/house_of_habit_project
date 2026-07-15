import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import * as authController from "@controllers/auth.controller";

export const authRouter = Router();
export const forgotRouter = Router();

// ── Registration flow ──────────────────────────────────────────────────────────

/**
 * @openapi
 * /auth/sendVerificationOtp:
 *   post:
 *     tags: [Auth]
 *     summary: Send registration OTP to an email
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema: { type: string, format: email }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       409: { description: Email already registered }
 */
authRouter.post("/sendVerificationOtp", authController.sendVerificationOtp);

/**
 * @openapi
 * /auth/verifyOtp/{email}:
 *   post:
 *     tags: [Auth]
 *     summary: Verify the registration OTP
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema: { type: string, format: email }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OtpInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       429: { description: Too many incorrect attempts — request a new OTP }
 */
authRouter.post("/verifyOtp/:email", authController.verifyRegistrationOtp);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Create an account (email must be OTP-verified first)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegisterInput' }
 *     responses:
 *       201: { description: Registered; returns accessToken, sets httpOnly refresh cookie }
 *       400: { $ref: '#/components/responses/ValidationError' }
 */
authRouter.post("/register", authController.register);

// ── Session ────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in
 *     description: Returns an accessToken in the body and sets the refresh token as an httpOnly cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginInput' }
 *     responses:
 *       200: { description: Logged in }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { description: Invalid credentials }
 *       403: { description: Account locked by an admin }
 *       429: { description: Too many failed attempts — temporary cooldown; message states minutes remaining }
 */
authRouter.post("/login", authController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate tokens using the refresh cookie
 *     description: Reads the httpOnly refresh_token cookie, rotates it, and returns a new accessToken.
 *     responses:
 *       200: { description: New accessToken issued }
 *       401: { description: Missing/invalid/replayed refresh token }
 */
authRouter.post("/refresh", authController.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out (revokes the current session)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
authRouter.post("/logout", authenticate, authController.logout);

// ── Forgot password ────────────────────────────────────────────────────────────

/**
 * @openapi
 * /forgotPassword/verifyMail:
 *   post:
 *     tags: [Forgot Password]
 *     summary: Send a password-reset OTP
 *     description: Always responds 200 with a generic message whether or not the email exists (anti-enumeration).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ForgotMailInput' }
 *     responses:
 *       200: { description: "If an account exists, an OTP was sent" }
 */
forgotRouter.post("/verifyMail", authController.sendForgotPasswordOtp);

/**
 * @openapi
 * /forgotPassword/verifyOtp/{email}:
 *   post:
 *     tags: [Forgot Password]
 *     summary: Verify the password-reset OTP
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema: { type: string, format: email }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OtpInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       429: { description: Too many incorrect attempts — request a new OTP }
 */
forgotRouter.post("/verifyOtp/:email", authController.verifyForgotPasswordOtp);

/**
 * @openapi
 * /forgotPassword/changePassword/{email}:
 *   post:
 *     tags: [Forgot Password]
 *     summary: Set a new password (revokes all sessions)
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema: { type: string, format: email }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ChangePasswordInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       429: { description: Too many incorrect attempts — request a new OTP }
 */
forgotRouter.post("/changePassword/:email", authController.changePassword);
