import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { STATUS_CODES } from "../constants/status_codes";
import { UserSchema } from "../validation/validations";

export const validateDataMW = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    UserSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      let response: { [k: string]: any } = {};
      error.errors.forEach(
        (issue) => (response[issue.path.join(".")] = issue.message)
      );
      res.status(STATUS_CODES.VALIDATION_ERR).json({
        code: STATUS_CODES.VALIDATION_ERR,
        errors: response,
      });
    } else {
      res.status(STATUS_CODES.SERVER_ERROR).json({
        code: STATUS_CODES.SERVER_ERROR,
        error: "INTERNAL SERVER ERROR",
      });
    }
  }
};
