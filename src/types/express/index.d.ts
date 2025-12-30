import express from "express";
import { User, Task, JwtPayload } from "../types";
import { IUser } from "../../models/User";
import { ITask } from "../../models/Task";
import { IProject } from "../../models/Project";

// This works with the verify-token file
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      project?: IProject;
      task?: ITask;
      jwt: JwtPayload;
    }
  }
}
