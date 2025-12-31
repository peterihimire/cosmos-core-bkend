import mongoose, { Document, Schema, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Define the interface for a Project document
export interface IProject extends Document {
  name: string;
  description?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for a Task
const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const ProjectModel = mongoose.model<IProject>("Project", ProjectSchema);
export default ProjectModel;
