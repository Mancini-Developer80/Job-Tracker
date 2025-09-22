import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: { id: string; email?: string; role?: string };
}

export const adminMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (
    !req.user ||
    (req.user.role !== "Admin" && req.user.role !== "Superuser")
  ) {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
};
