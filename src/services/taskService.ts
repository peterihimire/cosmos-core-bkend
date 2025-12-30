import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { ITask } from "../models/Task";
import * as taskRepository from "../repositories/taskRepository";
import * as projectRepository from "../repositories/projectRepository";
import BaseError from "../utils/base-error";
import { httpStatusCodes } from "../utils/http-status-codes";
import e from "express";

dotenv.config();

/**
 * Registers a new user.
 * @param data The data of the user to create.
 * @returns Promise<IUser | null>
 */

interface TaskFilters {
  status?: string;
  assignedTo?: string;
  fromDate?: string;
  toDate?: string;
}

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

/**
 * Retrieves a transaction by its ID.
 * @param data The data containing the ID of the transaction to retrieve.
 * @returns Promise<ITask | null>
 */
export const getTaskById = async (data: {
  id: string;
}): Promise<ITask | null> => {
  const existingTask = await taskRepository.findTaskById(data.id);
  if (!existingTask) {
    throw new BaseError("Task does not exist!", httpStatusCodes.NOT_FOUND);
  }

  return existingTask;
};

/**
 * Retrieves all transactions with pagination.
 * @param limit Number of task to retrieve per page.
 * @param offset Number of task to skip.
 * @param pageNum Current page number.
 * @param pageSize Number of task per page.
 * @returns Promise<{ totalItems: number, totalPages: number, currentPage: number, task: ITask[] }>
 */
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

    // Filtering
    if (filters.status) query.status = filters.status;
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;
    if (filters.fromDate || filters.toDate) query.createdAt = {};
    if (filters.fromDate) query.createdAt.$gte = new Date(filters.fromDate);
    if (filters.toDate) query.createdAt.$lte = new Date(filters.toDate);

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

export const claimTask = async (
  taskId: string,
  userId: string
): Promise<ITask | null> => {
  const activeTaskCount = await taskRepository.activeTasks(userId);
  if (activeTaskCount >= 2) {
    throw new BaseError(
      "You already have 2 active tasks",
      httpStatusCodes.BAD_REQUEST
    );
  }
  const claimedTask = await taskRepository.claimTask(taskId, userId);
  if (!claimedTask) {
    throw new BaseError(
      "Task is already claimed or does not exist",
      httpStatusCodes.BAD_REQUEST
    );
  }
  return claimedTask;
};

export const runTaskLifecycle = async () => {
  const now = new Date();

  const expireCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const reopenCutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const expired = await taskRepository.expireOpenTasks(expireCutoff);
  const reopened = await taskRepository.reopenStaleTasks(reopenCutoff);

  console.log(`Expired: ${expired.modifiedCount}`);
  console.log(`Reopened: ${reopened.modifiedCount}`);
};
