import { Request, Response, NextFunction } from "express";

export const parseFormData = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.data) {
    try {
      req.body = JSON.parse(req.body.data);
    } catch (error) {
      // If parsing fails, keep original body
    }
  }
  next();
};