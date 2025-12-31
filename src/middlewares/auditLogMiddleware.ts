import { RequestHandler } from "express";
import { logAction } from "../services/auditLogService";

export const auditMiddleware = (
  action: 'TASK_CLAIMED' | 'TASK_CREATED' | 'TASK_COMPLETED' | 'TASK_EXPIRED' | 'TASK_REASSIGNED',
  resourceType: string
): RequestHandler => {
  return async (req, res, next) => {
    res.on("finish", async () => {
      if (res.statusCode < 400) {
        await logAction({
          action,
          userId: req.user!.id,
          userEmail: req.user!.email,
          userRole: req.user!.role,
          resourceType,
          resourceId: req.params.id || "",
          details: JSON.stringify(req.body),
        });
      }
    });
    next();
  };
};
