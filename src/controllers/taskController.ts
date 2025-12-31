import { RequestHandler } from "express";
import { httpStatusCodes } from "../utils/http-status-codes";
import { CreateTaskDTO } from "../types/taskDto";
import {
  addTask,
  getAllTasks,
  getTaskById,
  claimTask,
  completeTask,
  updateTask,
  deleteTask,
} from "../services/taskService";

// Adds a new task.
export const addNewTask: RequestHandler = async (req, res, next) => {
  const { title, description, projectId }: CreateTaskDTO = req.body;

  try {
    const createdTask = await addTask({
      title,
      description,
      projectId,
    });

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

// Get all tasks with pagination and filtering
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

// Get a single task by ID
export const getTask: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  try {
    const getTask = await getTaskById({ id });

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

// Update a task
export const updateTaskController: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, status, assignedTo, expiresAt } = req.body;
  const userId = req.user?.id;

  try {
    const updatedTask = await updateTask(userId, {
      id,
      title,
      description,
      status,
      assignedTo,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    res.status(httpStatusCodes.OK).json({
      status: "success",
      msg: "Task updated successfully!",
      data: updatedTask.toObject(),
    });
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};

// Delete a task
export const deleteTaskController: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedTask = await deleteTask({
      id,
    });

    res.status(httpStatusCodes.OK).json({
      status: "success",
      msg: "Task deleted successfully!",
      data: {
        id: deletedTask._id,
        title: deletedTask.title,
      },
    });
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};

// Claim a task
export const claimTaskController: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user?.id as string;

  try {
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

// Complete a task
export const completeTaskController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { id: taskId } = req.params;
    const userId = req.user!.id;
    const task = await completeTask(taskId, userId);

    res.status(httpStatusCodes.OK).json({
      status: "success",
      message: "Task completed successfully",
      data: task,
    });
  } catch (err) {
    next(err);
  }
};
