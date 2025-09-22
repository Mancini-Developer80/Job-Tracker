import { Request, Response, NextFunction } from "express";

// Centralized error handler middleware
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error details (could be extended to use winston, morgan, etc.)
  // For now, log to console
  console.error(`[${new Date().toISOString()}]`, err);

  // Customize error response
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
}
