import { Response, Request, NextFunction } from "express";
import Job from "../models/Job";

// Custom request type with user
interface AuthenticatedRequest extends Request {
  user?: { id: string; email?: string; role?: string };
}

export const getUserJobStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await Job.aggregate([
      { $match: { user: req.user?.id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const total = await Job.countDocuments({ user: req.user?.id });
    res.json({ total, byStatus: stats });
  } catch (err) {
    next(err);
  }
};

export const getAllJobStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await Job.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const total = await Job.countDocuments();
    res.json({ total, byStatus: stats });
  } catch (err) {
    next(err);
  }
};
