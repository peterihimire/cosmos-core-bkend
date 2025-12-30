import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import BaseError from "../utils/base-error";
import { httpStatusCodes } from "../utils/http-status-codes";
import { ITask } from "../models/Task";
import {
  addTask,
  getAllTasks,
  getTaskById,
  claimTask,
} from "../services/taskService";

/**
 * Add new task.
 */
export const addNewTask: RequestHandler = async (req, res, next) => {
  const { title, description, projectId } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(httpStatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }

    const createdTask = await addTask({
      title,
      description,
      projectId,
    });

    if (!createdTask) {
      throw new BaseError(
        "Failed to create user",
        httpStatusCodes.INTERNAL_SERVER
      );
    }

    console.log("This is created task", createdTask);
    const taskObject = createdTask.toObject();
    // const { _id, ...taskData } = taskObject;

    res.status(httpStatusCodes.CREATED).json({
      status: "success",
      msg: "Task added!",
      data: taskObject,
    });
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};

/**
 * Get all tasks with pagination.
 */
export const getTasks: RequestHandler = async (req, res, next) => {
  try {
    const pageNumber = Number(req.query.page) || 1;
    const pageSize = Number(req.query.limit) || 10;

    const filters: {
      status?: string;
      assignedTo?: string;
      fromDate?: string;
      toDate?: string;
    } = {};

    if (req.query.status) filters.status = String(req.query.status);
    if (req.query.assignedTo) filters.assignedTo = String(req.query.assignedTo);
    if (req.query.fromDate) filters.fromDate = String(req.query.fromDate);
    if (req.query.toDate) filters.toDate = String(req.query.toDate);

    const { totalItems, totalPages, currentPage, tasks } = await getAllTasks(
      pageNumber,
      pageSize,
      filters
    );

    res.status(httpStatusCodes.OK).json({
      status: "success",
      msg: "Retrieved tasks successfully!",
      data: {
        totalItems,
        totalPages,
        currentPage,
        tasks,
      },
    });
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};

/**
 * Get task
 */
export const getTask: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  try {
    const getTask: ITask | null = await getTaskById({ id });

    if (!getTask) {
      throw new BaseError("No tasks found", httpStatusCodes.NOT_FOUND);
    }

    console.log("This are all the available tasks", getTask);
    const taskObject = getTask.toObject();
    // const { _id, ...taskData } = taskObject;

    res.status(httpStatusCodes.OK).json({
      status: "success",
      msg: "Task info",
      data: taskObject,
    });
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};

export const claimTaskController: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user?.id as string;

  try {
    const task = await getTaskById({ id });
    if (!task) {
      throw new BaseError("Task not found", httpStatusCodes.NOT_FOUND);
    }
    const taskData = await claimTask(id, userId);

    res.status(httpStatusCodes.OK).json({
      status: "success",
      msg: "Task claimed successfully",
      data: taskData,
    });
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};
