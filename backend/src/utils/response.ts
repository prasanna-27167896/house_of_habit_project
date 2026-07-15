import type { Response } from "express";

export const sendSuccess = (res: Response, data: unknown, status = 200): void => {
  res.status(status).json({ success: true, data });
};

// Error responses are produced centrally by the error middleware
// (`{ success, message, code }`) — controllers throw `Errors.XXX()` rather than
// building error bodies by hand, so there is no `sendError` helper on purpose.
