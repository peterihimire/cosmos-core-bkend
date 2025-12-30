export type User = {
  id: string;
  email: string;
  password?: string;
  role: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  projectId: string;
  assignedTo?: string;
  claimedAt?: Date;
  expiresAt: Date;
};

export interface JwtPayload {
  id: string;
  email: string;
  password: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdBy: string;
}
