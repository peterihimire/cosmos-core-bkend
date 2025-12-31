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

// Find all projects with pagination, filtering, and sorting
export const findAllProjects = async (
  filter: any = {},
  skip: number = 0,
  limit: number = 10,
  sort: any = { createdAt: -1 }
): Promise<IProject[]> => {
  return ProjectModel.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .exec();
};

// Update a project by id
export const updateProjectById = async (
  id: string,
  updates: Partial<IProject>
): Promise<IProject | null> => {
  const updatedProject = await ProjectModel.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).exec();
  
  return updatedProject;
};

// Count projects for pagination
export const countProjects = async (filter: any = {}): Promise<number> => {
  return ProjectModel.countDocuments(filter);
};


// Delete a project by id
export const deleteProjectById = async (id: string): Promise<IProject | null> => {
  const deletedProject = await ProjectModel.findByIdAndDelete(id).exec();
  return deletedProject;
};