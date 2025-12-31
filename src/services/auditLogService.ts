import AuditLogModel, { IAuditLog } from "../models/AuditLog";

interface AuditLogPayload {
  action:
    | "TASK_CLAIMED"
    | "TASK_CREATED"
    | "TASK_COMPLETED"
    | "TASK_EXPIRED"
    | "TASK_REASSIGNED";

  userId?: string;
  userEmail?: string;
  userRole?: "USER" | "ADMIN";
  resourceType: string;
  resourceId?: string;
  details?: string;
}

export const logAction = async (
  payload: AuditLogPayload
): Promise<IAuditLog> => {
  const log = new AuditLogModel({
    ...payload,
    timestamp: new Date(),
  });
  console.log("Audit Log Created:", log);
  await log.save();
  return log;
};
