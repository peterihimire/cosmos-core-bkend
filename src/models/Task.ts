import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Define the interface for a Task document
export interface ITask extends Document {
  title: string;
  description: string;
  projectId: string;
  status: string;
  assignedTo?: string;
  claimedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for a Task
const TaskSchema: Schema = new Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    title: { type: String, required: true, default: "" },
    status: {
      type: String,
      required: true,
      enum: ["OPEN", "IN_PROGRESS", "EXPIRED", "COMPLETED"],
      default: "OPEN",
      index: true,
    },
    assignedTo: {
      type: String,
      required: false,
      default: null,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    claimedAt: {
      type: Date,
      required: false,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// TaskSchema.index(
//   { _id: 1, assignedTo: 1 },
//   { unique: true, partialFilterExpression: { assignedTo: { $ne: null } } }
// );
TaskSchema.index({ status: 1, assignedTo: 1 });
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ expiresAt: 1 });

const TaskModel = mongoose.model<ITask>("Task", TaskSchema);
export default TaskModel;
