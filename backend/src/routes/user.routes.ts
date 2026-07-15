import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import { requireRole } from "@middleware/role.middleware";
import * as userController from "@controllers/user.controller";

export const userRouter = Router();
export const adminUserRouter = Router();

// ── Customer (own profile) ─────────────────────────────────────────────────────
userRouter.use(authenticate);

/**
 * @openapi
 * /user/:
 *   get:
 *     tags: [User]
 *     summary: Get my profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
userRouter.get("/", userController.getProfile);

/**
 * @openapi
 * /user/update:
 *   put:
 *     tags: [User]
 *     summary: Update my profile
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateProfileInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
userRouter.put("/update", userController.updateProfile);

/**
 * @openapi
 * /user/change-password:
 *   put:
 *     tags: [User]
 *     summary: Change my password
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ChangeOwnPasswordInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
userRouter.put("/change-password", userController.changeOwnPassword);

// ── Admin (manage users) ───────────────────────────────────────────────────────
adminUserRouter.use(authenticate, requireRole("ROLE_ADMIN"));

/**
 * @openapi
 * /admin/users/:
 *   get:
 *     tags: [Admin · Users]
 *     summary: List users (paginated)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
adminUserRouter.get("/", userController.getAllUsers);

/**
 * @openapi
 * /admin/users/lock/{userId}:
 *   post:
 *     tags: [Admin · Users]
 *     summary: Lock/unlock a user (locking bans them from the platform)
 *     description: >
 *       Toggles the user's locked state. An admin cannot lock their own account
 *       or another admin (403). Unlocking is always allowed (e.g. to recover an
 *       auto-locked admin). Users are never deleted — locking is the ban mechanism.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { description: "Not an admin, or attempting to lock self / another admin" }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
adminUserRouter.post("/lock/:userId", userController.toggleLock);
