import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import BaseError from "../utils/base-error";
import { httpStatusCodes } from "../utils/http-status-codes";
import {
  addProject,
  // foundAllTransactions,
  // foundTransactionById,
} from "../services/projectService";

/**
 * Add new project.
 */
export const addNewProject: RequestHandler = async (req, res, next) => {
  const { name, description } = req.body;

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

    if (!createdProject) {
      throw new BaseError(
        "Failed to create user",
        httpStatusCodes.INTERNAL_SERVER
      );
    }

    console.log("This is created project", createdProject);
    const projectObject = createdProject.toObject();
    // const { _id, ...projectData } = projectObject;

    res.status(httpStatusCodes.CREATED).json({
      status: "success",
      msg: "Project added!",
      data:  projectObject,
    });
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};
