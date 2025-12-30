import ProjectModel from "../models/Project";
import { IProject } from "../models/Project";

/**
 * Creates a new task.
 * @param data The data of the task to create.
 * @returns Promise<IProject | null>
 */
export const createProject = async (data: {
  name: string;
  description: string;
  createdBy: string;
}): Promise<IProject | null> => {
  const projectTask = new ProjectModel({
    name: data.name,
    description: data.description,
    createdBy: data.createdBy,
  });

  await projectTask.save();
  return projectTask;
};

/**
 * Finds a transaction by amount.
 * @param id The amount of the transaction to find.
 * @returns Promise<IProject | null>
 */
export const findProjectById = async (
  id: string
): Promise<IProject | null> => {
  return ProjectModel.findById(id).exec();
};