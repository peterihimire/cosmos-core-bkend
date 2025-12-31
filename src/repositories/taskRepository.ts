import { ClientSession } from "mongoose";
import TaskModel from "../models/Task";
import { ITask } from "../models/Task";

// Create a new task
export const createTask = async (data: {
  title: string;
  description: string;
  projectId: string;
  expiresAt: Date;
}): Promise<ITask> => {
  const newTask = new TaskModel({
    title: data.title,
    description: data.description,
    projectId: data.projectId,
    expiresAt: data.expiresAt,
  });

  await newTask.save();
  return newTask;
};

// Find a task by id
export const findTaskById = async (id: string): Promise<ITask | null> => {
  return TaskModel.findById(id).exec();
};

// Count a task for use in pagination
export const countTasks = async (filter: any = {}): Promise<number> => {
  return TaskModel.countDocuments(filter);
};

// Update a task by id
export const updateTaskById = async (
  id: string,
  updates: Partial<ITask>
): Promise<ITask | null> => {
  const updatedTask = await TaskModel.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).exec();

  return updatedTask;
};

// Delete a task by id
export const deleteTaskById = async (id: string): Promise<ITask | null> => {
  const deletedTask = await TaskModel.findByIdAndDelete(id).exec();
  return deletedTask;
};

// Find all task
export const findAllTasks = async (
  limit: number,
  offset: number,
  filter: any = {}
): Promise<ITask[]> => {
  return TaskModel.find(filter).skip(offset).limit(limit).exec();
};

// Claim a task
export const claimTask = async (
  taskId: string,
  userId: string
  // session: ClientSession
): Promise<ITask | null> => {
  const claimedTask = await TaskModel.findOneAndUpdate(
    {
      _id: taskId,
      assignedTo: "", // only unassigned tasks
      status: "OPEN", // optional: only open tasks
    },
    {
      $set: {
        assignedTo: userId,
        status: "IN_PROGRESS",
        claimedAt: new Date(),
      },
    },
    {
      new: true,
      // session
    } // return the updated document
  ).exec();
  return claimedTask;
};

// Active task count
export const activeTasks = async (
  userId: string
  // session: ClientSession
): Promise<number> => {
  const activeTasks = await TaskModel.countDocuments(
    {
      assignedTo: userId,
      status: "IN_PROGRESS",
    },
    {
      // session
    }
  );

  return activeTasks;
};

// Set Task as Expired
export const expireOpenTasks = async (cutoff: Date) => {
  return TaskModel.updateMany(
    {
      status: "OPEN",
      createdAt: { $lte: cutoff },
    },
    { $set: { status: "EXPIRED" } }
  );
};

// Set Task as open
export const reopenStaleTasks = async (cutoff: Date) => {
  return TaskModel.updateMany(
    {
      status: "IN_PROGRESS",
      claimedAt: { $lte: cutoff },
    },
    {
      $set: {
        status: "OPEN",
        assignedTo: null,
        claimedAt: null,
      },
    }
  );
};

// Find Expired Task
export const findExpiredTasks = async (cutoff: Date): Promise<ITask[]> => {
  return TaskModel.find({ status: "EXPIRED", createdAt: { $lte: cutoff } });
};

// Find Opened Task
export const findReopenedTasks = async (cutoff: Date): Promise<ITask[]> => {
  return TaskModel.find({ status: "OPEN", claimedAt: { $lte: cutoff } });
};

// Set Task as completed
export const completeTask = async (
  taskId: string,
  userId: string
): Promise<ITask | null> => {
  return TaskModel.findOneAndUpdate(
    {
      _id: taskId,
      status: "IN_PROGRESS",
      assignedTo: userId,
    },
    {
      $set: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    },
    {
      new: true,
    }
  );
};
