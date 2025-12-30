import TaskModel from "../models/Task";
import { ITask } from "../models/Task";

/**
 * Creates a new task.
 * @param data The data of the task to create.
 * @returns Promise<ITask | null>
 */
export const createTask = async (data: {
  title: string;
  description: string;
  projectId: string;
  expiresAt: Date;
}): Promise<ITask | null> => {
  const newTask = new TaskModel({
    title: data.title,
    description: data.description,
    projectId: data.projectId,
    expiresAt: data.expiresAt,
  });

  await newTask.save();
  return newTask;
};

/**
 * Finds a transaction by amount.
 * @param id The amount of the transaction to find.
 * @returns Promise<ITask | null>
 */
export const findTaskById = async (id: string): Promise<ITask | null> => {
  return TaskModel.findById(id).exec();
};

/**
 * Counts the total number of tasks.
 * @returns Promise<number>
 */
export const countTasks = async (filter: any = {}): Promise<number> => {
  return TaskModel.countDocuments(filter);
};

/**
 * Finds all tasks with pagination.
 * @param limit Number of tasks to retrieve per page.
 * @param offset Number of tasks to skip.
 * @returns Promise<ITask[]>
 */
export const findAllTasks = async (
  limit: number,
  offset: number,
  filter: any = {}
): Promise<ITask[]> => {
  return TaskModel.find(filter).skip(offset).limit(limit).exec();
};

export const claimTask = async (
  taskId: string,
  userId: string
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
    { new: true } // return the updated document
  ).exec();
  return claimedTask;
};

export const activeTasks = async (userId: string): Promise<number> => {
  const activeTasks = await TaskModel.countDocuments({
    assignedTo: userId,
    status: "IN_PROGRESS",
  });

  return activeTasks;
};

// repositories/task.repository.ts
export const expireOpenTasks = async (cutoff: Date) => {
  return TaskModel.updateMany(
    {
      status: "OPEN",
      createdAt: { $lte: cutoff },
    },
    { $set: { status: "EXPIRED" } }
  );
};

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