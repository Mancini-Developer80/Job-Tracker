import { Response, Request, NextFunction } from "express";
import Job from "../models/Job";
import { validationResult } from "express-validator";

// Custom request type with user
interface AuthenticatedRequest extends Request {
  user?: { id: string; email?: string; role?: string };
}

export const getJobs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const jobs = await Job.find({ user: req.user?.id }).populate(
      "user",
      "name email"
    );
    res.json(jobs);
  } catch (err) {
    next(err);
  }
};

export const getJobById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      user: req.user?.id,
    }).populate("user", "name email");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    next(err);
  }
};

export const createJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { company, position, status, date } = req.body;
    const job = await Job.create({
      user: req.user?.id,
      company,
      position,
      status,
      date,
    });
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
};

export const updateJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      req.body,
      { new: true }
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    next(err);
  }
};

export const deleteJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      user: req.user?.id,
    });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted" });
  } catch (err) {
    next(err);
  }
};
