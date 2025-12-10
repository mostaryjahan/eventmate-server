import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = err.message || "Something went wrong!";
  let error = err;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      message = "Duplicate key error";
      error = error.meta;
      statusCode = httpStatus.CONFLICT;
    }
    if (err.code === "P1000") {
      message = "Authentication error";
      error = error.meta;
      statusCode = httpStatus.UNAUTHORIZED;
    }
    if (err.code === "P2003") {
      message = "Foreign key error";
      error = error.meta;
      statusCode = httpStatus.BAD_REQUEST;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    message = "Validation error";
    error = error.meta;
    statusCode = httpStatus.BAD_REQUEST;
  }

  if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    message = "Unknown error";
    error = error.meta;
    statusCode = httpStatus.BAD_REQUEST;
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    message = "Prisma client failed to initialized";
    error = error.meta;
    statusCode = httpStatus.BAD_REQUEST;
  }

  res.status(statusCode).json({
    success,
    message,
    error,
  });
};

export default globalErrorHandler;