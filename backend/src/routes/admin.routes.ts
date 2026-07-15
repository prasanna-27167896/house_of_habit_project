import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import { requireRole } from "@middleware/role.middleware";
import { getSetupStatus } from "@controllers/admin.controller";

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole("ROLE_ADMIN"));

/**
 * @openapi
 * /admin/setup-status:
 *   get:
 *     tags: [Admin]
 *     summary: Store readiness check (admin)
 *     description: Warns about missing store info, empty catalogue, out-of-stock, etc.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Returns { isReady, criticalCount, warningCount, warnings[] }" }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
adminRouter.get("/setup-status", getSetupStatus);
