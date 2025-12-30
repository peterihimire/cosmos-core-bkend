import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { ITask } from "../models/Task";
import * as taskRepository from "../repositories/taskRepository";
import * as projectRepository from "../repositories/projectRepository";
import BaseError from "../utils/base-error";
import { httpStatusCodes } from "../utils/http-status-codes";
import { IProject } from "../models/Project";

dotenv.config();

/**
 * Registers a new user.
 * @param data The data of the user to create.
 * @returns Promise<IUser | null>
 */
export const addProject = async (data: {
  name: string;
  description: string;
  createdBy: string;
}): Promise<IProject | null> => {
  const newProject = await projectRepository.createProject({
    name: data.name,
    description: data.description,
    createdBy: data.createdBy,
  });

  return newProject;
};
