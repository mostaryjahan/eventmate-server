import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateAndParse = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let parsedBody;

      if (req.body?.data) {
        parsedBody = JSON.parse(req.body.data);
      } else {
        parsedBody = req.body;
      }

      // Zod validation
      const validatedData = schema.parse(parsedBody);

      // Keep validated data + keep file
      req.body = validatedData;

      next();
    } catch (error) {
      next(error);
    }
  };
};
