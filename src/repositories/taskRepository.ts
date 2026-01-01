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
  return TaskModel.findById(id)
    .populate("assignedTo", "_id firstname lastname email")
    .exec();
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
  return TaskModel.find(filter)
    .populate("assignedTo", "_id firstname lastname email")
    .skip(offset)
    .limit(limit)
    .sort({ createdAt: -1 })
    .exec();
};

// Claim a task
/* 
  This is where atomic updates with condition was implemented 
**/
export const claimTask = async (
  taskId: string,
  userId: string
): Promise<ITask | null> => {
  const claimedTask = await TaskModel.findOneAndUpdate(
    {
      _id: taskId,
      assignedTo: null,
      status: "OPEN",
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
    }
  ).exec();
  return claimedTask;
};

// Active task count
export const activeTasks = async (userId: string): Promise<number> => {
  const activeTasks = await TaskModel.countDocuments({
    assignedTo: userId,
    status: "IN_PROGRESS",
  });

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
/* 
  This is where atomic updates with condition was implemented 
**/
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
