import dotenv from "dotenv";
import * as projectRepository from "../repositories/projectRepository";
import BaseError from "../utils/base-error";
import { httpStatusCodes } from "../utils/http-status-codes";
import { IProject } from "../models/Project";

dotenv.config();

// Add a new project
export const addProject = async (data: {
  name: string;
  description: string;
  createdBy: string;
}): Promise<IProject> => {
  const newProject = await projectRepository.createProject({
    name: data.name,
    description: data.description,
    createdBy: data.createdBy,
  });

  if (!newProject) {
    throw new BaseError(
      "Failed to create user",
      httpStatusCodes.INTERNAL_SERVER
    );
  }

  return newProject;
};

// Get Project by ID
export const getProjectById = async (data: {
  id: string;
}): Promise<IProject> => {
  const existingProject = await projectRepository.findProjectById(data.id);
  if (!existingProject) {
    throw new BaseError("Project does not exist!", httpStatusCodes.NOT_FOUND);
  }

  return existingProject;
};

// Get all projects with pagination and filtering
export const getAllProjects = async (
  userId: string | undefined,
  filters: {
    status?: string;
    search?: string;
    createdBy?: string;
    fromDate?: string;
    toDate?: string;
  } = {},
  page: number = 1,
  limit: number = 10,
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
): Promise<{
  projects: IProject[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> => {
  const skip = (page - 1) * limit;

  const mongoFilter: any = {};

  if (filters.status) mongoFilter.status = filters.status;
  if (filters.createdBy) mongoFilter.createdBy = filters.createdBy;

  if (filters.fromDate || filters.toDate) {
    mongoFilter.createdAt = {};
    if (filters.fromDate)
      mongoFilter.createdAt.$gte = new Date(filters.fromDate);
    if (filters.toDate) mongoFilter.createdAt.$lte = new Date(filters.toDate);
  }

  if (filters.search) {
    mongoFilter.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (userId) {
    mongoFilter.$or = [{ createdBy: userId }, { "members.userId": userId }];
  }

  const sort: any = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const [projects, total] = await Promise.all([
    projectRepository.findAllProjects(mongoFilter, skip, limit, sort),
    projectRepository.countProjects(mongoFilter),
  ]);

  return {
    projects,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Update a project
export const updateProject = async (
  userId: string | undefined,
  data: {
    id: string;
    name?: string;
    description?: string;
    status?: string;
    members?: Array<{ userId: string; role: string }>;
  }
): Promise<IProject> => {
  if (!userId) {
    throw new BaseError(
      "User authentication required",
      httpStatusCodes.UNAUTHORIZED
    );
  }

  const existingProject = await projectRepository.findProjectById(data.id);
  if (!existingProject) {
    throw new BaseError("Project not found", httpStatusCodes.NOT_FOUND);
  }

  const updates: Partial<IProject> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;

  const updatedProject = await projectRepository.updateProjectById(
    data.id,
    updates
  );

  if (!updatedProject) {
    throw new BaseError(
      "Failed to update project",
      httpStatusCodes.BAD_REQUEST
    );
  }

  return updatedProject;
};

// Delete a project
export const deleteProject = async (
  userId: string | undefined,
  data: {
    id: string;
  }
): Promise<IProject> => {
  if (!userId) {
    throw new BaseError(
      "User authentication required",
      httpStatusCodes.UNAUTHORIZED
    );
  }

  const existingProject = await projectRepository.findProjectById(data.id);
  if (!existingProject) {
    throw new BaseError("Project not found", httpStatusCodes.NOT_FOUND);
  }

  const deletedProject = await projectRepository.deleteProjectById(data.id);

  if (!deletedProject) {
    throw new BaseError(
      "Failed to delete project",
      httpStatusCodes.BAD_REQUEST
    );
  }

  return deletedProject;
};
