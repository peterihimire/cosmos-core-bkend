export interface CreateTaskDTO {
  title: string;
  description: string;
  projectId: string;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  projectId?: string;
}

