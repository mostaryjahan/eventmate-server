import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

import httpStatus from "http-status-codes";
import AppError from "../errorHelpers/AppError";
import { envVars } from "../../config/env";
import { verifyToken } from "../utils/jwt";

interface CustomJwtPayload extends JwtPayload {
  role: string;
}

const checkAuth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "You are not authorized!",
        );
      }

      const verifyUser = verifyToken(
        token,
        envVars.JWT_ACCESS_SECRET
      ) as CustomJwtPayload;

      req.user = verifyUser;

      if (roles.length && !roles.includes(verifyUser.role)) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized!");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default checkAuth;