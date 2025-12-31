import { RequestHandler } from "express";
import dotenv from "dotenv";
import { verify } from "jsonwebtoken";
import BaseError from "../utils/base-error";
import { httpStatusCodes } from "../utils/http-status-codes";
import { IUser } from "../models/User";

dotenv.config();

export const verifyToken: RequestHandler = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (token) {
    verify(token, process.env.JWT_KEY as string, (err: any, decoded: any) => {
      if (err) {
        return next(
          new BaseError("Expired or invalid token!", httpStatusCodes.FORBIDDEN)
        );
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      } as IUser;

      next();
    });
  } else {
    return next(
      new BaseError("You are not authenticated!", httpStatusCodes.UNAUTHORIZED)
    );
  }
};

// AUTHENTICATED USER
export const verifyTokenAndAuthorization: RequestHandler = (req, res, next) => {
  verifyToken(req, res, async () => {
    const user = req.user;

    if (!user?.email) {
      return next(
        new BaseError(
          "Not authorised to access resource, invalid or expired token!",
          httpStatusCodes.UNAUTHORIZED
        )
      );
    }

    next();
  });
};

// ADMIN USER
export const requireAdmin: RequestHandler = (req, res, next) => {
  verifyToken(req, res, async () => {
    const user = req.user;

    if (!user?.role || user.role !== "ADMIN") {
      return next(
        new BaseError(
          "You are not authorized, only admins are allowed!",
          httpStatusCodes.UNAUTHORIZED
        )
      );
    }

    next();
  });
};
