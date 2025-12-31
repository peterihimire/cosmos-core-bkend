import ProjectModel from "../models/Project";
import { IProject } from "../models/Project";


// Creates a new project
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

// Find a new project by id
export const findProjectById = async (
  id: string
): Promise<IProject | null> => {
  return ProjectModel.findById(id).exec();
};
