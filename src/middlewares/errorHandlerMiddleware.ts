import express, { RequestHandler, ErrorRequestHandler } from "express";
import { httpStatusCodes } from "../utils/http-status-codes";
import BaseError from "../utils/base-error";

export function logError(err: any): void {
  console.log(`error: ${err.message}, status: ${err.errorCode}`);
}

export const logErrorMiddleware: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  logError(err);
  next(err);
};

export const returnError: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.errorCode || 500);
  res.json({
    status: "fail",
    msg: err.message || "An unknown error occurred!",
  });
};

export const unknownRoute: RequestHandler = (req, res, next) => {
  try {
    return next(
      new BaseError(
        `Could not find this route: ${req.protocol}://${req.get("host")}${
          req.url
        }, make sure the URL is correct!`,
        httpStatusCodes.NOT_FOUND
      )
    );
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};
