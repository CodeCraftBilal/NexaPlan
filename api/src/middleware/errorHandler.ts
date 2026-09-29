import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: err.issues[0]?.message ?? "Please check the submitted fields",
      errors: err.issues,
    });
    return;
  }
  if (err instanceof SyntaxError && "status" in err && err.status === 400) {
    res
      .status(400)
      .json({ success: false, message: "Invalid JSON request body" });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error("Request failed:", err);
  res
    .status(500)
    .json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
};
