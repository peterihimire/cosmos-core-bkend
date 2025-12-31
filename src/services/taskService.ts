import bcrypt from "bcrypt";
import dotenv from "dotenv";
import TaskModel, { ITask } from "../models/Task";
import * as taskRepository from "../repositories/taskRepository";
import * as projectRepository from "../repositories/projectRepository";
import BaseError from "../utils/base-error";
import { httpStatusCodes } from "../utils/http-status-codes";
import mongoose from "mongoose";
import e from "express";
import { ClientSession } from "mongoose";
import { logAction } from "./auditLogService";

dotenv.config();

interface TaskFilters {
  status?: string;
  assignedTo?: string;
  fromDate?: string;
  toDate?: string;
}

// Add a new task
export const addTask = async (data: {
  title: string;
  description: string;
  projectId: string;
}): Promise<ITask | null> => {
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
  console.log("This is project ID", data.projectId);
  const validProject = await projectRepository.findProjectById(data.projectId);
  if (!validProject) {
    throw new BaseError("Project does not exist!", httpStatusCodes.NOT_FOUND);
  }
  console.log("This is valid project", validProject);

  const newTask = await taskRepository.createTask({
    title: data.title,
    description: data.description,
    projectId: data.projectId,
    expiresAt: expiresAt,
  });

  return newTask;
};

// Get task by ID
export const getTaskById = async (data: {
  id: string;
}): Promise<ITask | null> => {
  const existingTask = await taskRepository.findTaskById(data.id);
  if (!existingTask) {
    throw new BaseError("Task does not exist!", httpStatusCodes.NOT_FOUND);
  }

  return existingTask;
};

// Get all tasks with pagination and filtering
export const getAllTasks = async (
  pageNum: number,
  pageSize: number,
  filters: TaskFilters = {}
): Promise<{
  totalItems: number;
  totalPages: number;
  currentPage: number;
  tasks: ITask[];
}> => {
  const pageNumber = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
  const limit = isNaN(pageSize) || pageSize <= 0 ? 10 : pageSize;
  const offset = (pageNumber - 1) * limit;

  try {
    const query: any = {};
    console.log("Here are the filters", filters);

    // Filtering
    if (filters.status) query.status = filters.status;
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;
    if (filters.fromDate || filters.toDate) {
      query.createdAt = {};
    }
    if (filters.fromDate) {
      const from = new Date(filters.fromDate);
      from.setHours(0, 0, 0, 0);
      query.createdAt.$gte = from;
    }
    if (filters.toDate) {
      const to = new Date(filters.toDate);
      to.setHours(23, 59, 59, 999);
      query.createdAt.$lte = to;
    }
    // if (filters.fromDate || filters.toDate) query.createdAt = {};
    // if (filters.fromDate) query.createdAt.$gte = new Date(filters.fromDate);
    // if (filters.toDate) query.createdAt.$lte = new Date(filters.toDate);

    const totalItems = await taskRepository.countTasks(query);
    const tasks = await taskRepository.findAllTasks(limit, offset, query);
    const totalPages = Math.ceil(totalItems / limit);

    // Return pagination details
    return {
      totalItems,
      totalPages,
      currentPage: pageNumber,
      tasks,
    };
  } catch (error) {
    throw new BaseError(
      "Failed to retrieve tasks",
      httpStatusCodes.INTERNAL_SERVER
    );
  }
};

// Claim a task
export const claimTask = async (
  taskId: string,
  userId: string
): Promise<ITask | null> => {
  // const session = await mongoose.startSession();
  // session.startTransaction();
  try {
    const activeTaskCount = await taskRepository.activeTasks(
      userId
      // session
    );
    if (activeTaskCount >= 2) {
      throw new BaseError(
        "You already have 2 active tasks",
        httpStatusCodes.BAD_REQUEST
      );
    }
    const claimedTask = await taskRepository.claimTask(
      taskId,
      userId
      // session
    );
    if (!claimedTask) {
      throw new BaseError(
        "Task is already claimed or does not exist",
        httpStatusCodes.BAD_REQUEST
      );
    }
    // await session.commitTransaction();
    return claimedTask;
  } catch (error) {
    // await session.abortTransaction();
    throw error;
  } finally {
    // session.endSession();
  }
};

// Run task lifecycle to expire and reopen tasks
export const runTaskLifecycle = async () => {
  const now = new Date();

  const expireCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const reopenCutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const expired = await taskRepository.expireOpenTasks(expireCutoff);
  if (expired.modifiedCount > 0) {
    const expiredTasks = await taskRepository.findExpiredTasks(expireCutoff);

    for (const task of expiredTasks) {
      await logAction({
        action: "TASK_EXPIRED",
        resourceType: "Task",
        resourceId: task.id,
        userId: "SYSTEM",
        userEmail: "SYSTEM",
        //  userRole: "SYSTEM",
        details: "Task expired automatically after 24 hours",
      });
    }
  }

  const reopened = await taskRepository.reopenStaleTasks(reopenCutoff);
  if (reopened.modifiedCount > 0) {
    const reopenedTasks = await taskRepository.findReopenedTasks(reopenCutoff);

    for (const task of reopenedTasks) {
      await logAction({
        action: "TASK_REASSIGNED",
        resourceType: "Task",
        resourceId: task.id,
        userId: "SYSTEM",
        userEmail: "SYSTEM",
        //  userRole: "SYSTEM",
        details: "Task reopened automatically after 48 hours stale",
      });
    }
  }

  console.log(`Expired: ${expired.modifiedCount}`);
  console.log(`Reopened: ${reopened.modifiedCount}`);
};

// Complete a task
export const completeTask = async (taskId: string, userId: string) => {
  const task = await taskRepository.completeTask(taskId, userId);

  if (!task) {
    throw new BaseError("Task does not exist!", httpStatusCodes.NOT_FOUND);
  }

  return task;
};
