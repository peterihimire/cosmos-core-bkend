import mongoose, { Document, Schema } from "mongoose";

export interface IAuditLog extends Document {
  action:
    | "TASK_CLAIMED"
    | "TASK_CREATED"
    | "TASK_COMPLETED"
    | "TASK_EXPIRED"
    | "TASK_REASSIGNED";
  userId: string;
  userEmail: string;
  userRole: "USER" | "ADMIN";
  resourceType: string; 
  resourceId?: string;
  details?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "TASK_CLAIMED",
        "TASK_CREATED",
        "TASK_COMPLETED",
        "TASK_EXPIRED",
        "TASK_REASSIGNED",
      ],
    }, 
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    userRole: { type: String, required: true, enum: ["USER", "ADMIN"] },
    resourceType: { type: String, required: true },
    resourceId: { type: String, required: false },
    details: { type: String, default: "" },
  },
  { timestamps: true }
);

const AuditLogModel = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
export default AuditLogModel;
