import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { httpStatusCodes } from "../utils/http-status-codes";
import { CreateProjectDTO } from "../types/projectDto";
import {
  addProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../services/projectService";

// Adds a new project.
export const addNewProject: RequestHandler = async (req, res, next) => {
  const { name, description }: CreateProjectDTO = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(httpStatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }

    const createdProject = await addProject({
      name,
      description,
      createdBy: req.user?.id as string,
    });

    const projectObject = createdProject.toObject();

    res.status(httpStatusCodes.CREATED).json({
      status: "success",
      msg: "Project added!",
      data: projectObject,
    });
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};

// Get a single project by ID
export const getProject: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  try {
    const getProject = await getProjectById({ id });

    const projectObject = getProject.toObject();

    res.status(httpStatusCodes.OK).json({
      status: "success",
      msg: "Project info",
      data: projectObject,
    });
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};

// Get all projects with pagination and filtering
export const getAllProjectsController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filters: {
      fromDate?: string;
      toDate?: string;
    } = {};

    if (req.query.fromDate) filters.fromDate = String(req.query.fromDate);
    if (req.query.toDate) filters.toDate = String(req.query.toDate);

    const result = await getAllProjects(filters, page, limit);

    res.status(httpStatusCodes.OK).json({
      status: "success",
      msg: "Projects retrieved successfully!",
      data: {
        projects: result.projects.map((project) => project.toObject()),
        pagination: result.pagination,
      },
    });
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};

// Update a project
export const updateProjectController: RequestHandler = async (
  req,
  res,
  next
) => {
  const { id } = req.params;
  const { name, description, status, members } = req.body;
  const userId = req.user?.id;

  try {
    const updatedProject = await updateProject(userId, {
      id,
      name,
      description,
      status,
      members,
    });

    res.status(httpStatusCodes.OK).json({
      status: "success",
      msg: "Project updated successfully!",
      data: updatedProject.toObject(),
    });
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};

// Delete a project
export const deleteProjectController: RequestHandler = async (
  req,
  res,
  next
) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const deletedProject = await deleteProject(userId, { id });

    res.status(httpStatusCodes.OK).json({
      status: "success",
      msg: "Project deleted successfully!",
      data: {
        id: deletedProject._id,
        name: deletedProject.name,
        deletedAt: new Date(),
      },
    });
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};
