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
    const jobs = await Job.find({ user: req.user?.id });
    // Always return user as user._id (string) for frontend compatibility
    const jobsWithUserId = jobs.map((job) => {
      const jobObj = job.toObject();
      // Convert customFields Map to plain object if present
      if (
        jobObj.customFields &&
        typeof jobObj.customFields === "object" &&
        jobObj.customFields !== null
      ) {
        if (jobObj.customFields instanceof Map) {
          jobObj.customFields = Object.fromEntries(
            jobObj.customFields.entries()
          );
        } else {
          jobObj.customFields = { ...jobObj.customFields };
        }
      }
      return {
        ...jobObj,
        user: jobObj.user?.toString?.() || jobObj.user,
        notes: typeof jobObj.notes === "string" ? jobObj.notes : "",
      };
    });
    res.json(jobsWithUserId);
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
    });
    if (!job) return res.status(404).json({ message: "Job not found" });
    const jobObj = job.toObject();
    // Convert customFields Map to plain object if present
    if (
      jobObj.customFields &&
      typeof jobObj.customFields === "object" &&
      jobObj.customFields instanceof Map
    ) {
      jobObj.customFields = Object.fromEntries(jobObj.customFields.entries());
    }
    res.json({
      ...jobObj,
      user: jobObj.user?.toString?.() || jobObj.user,
      notes: typeof jobObj.notes === "string" ? jobObj.notes : "",
    });
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
    const {
      company,
      position,
      status,
      date,
      tags,
      favorite,
      notes,
      customFields,
    } = req.body;
    const job = await Job.create({
      user: req.user?.id,
      company,
      position,
      status,
      date,
      tags: Array.isArray(tags) ? tags : [],
      favorite: typeof favorite === "boolean" ? favorite : false,
      notes: typeof notes === "string" ? notes : "",
      customFields:
        typeof customFields === "object" && customFields !== null
          ? customFields
          : {},
    });
    // console.log("Job created:", job);
    const jobObj = job.toObject();
    // Convert customFields Map to plain object if present
    if (
      jobObj.customFields &&
      typeof jobObj.customFields === "object" &&
      jobObj.customFields !== null &&
      typeof (jobObj.customFields as any).entries === "function"
    ) {
      jobObj.customFields = Object.fromEntries(
        (jobObj.customFields as any).entries()
      );
    }
    res.status(201).json({
      ...jobObj,
      user: jobObj.user?.toString?.() || jobObj.user,
      notes: typeof jobObj.notes === "string" ? jobObj.notes : "",
    });
  } catch (err) {
    next(err);
  }
};

export const updateJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // If only favorite is present, skip validation
  if (
    req.body &&
    Object.keys(req.body).length === 1 &&
    (Object.prototype.hasOwnProperty.call(req.body, "favorite") ||
      Object.prototype.hasOwnProperty.call(req.body, "notes"))
  ) {
    try {
      const job = await Job.findOneAndUpdate(
        { _id: req.params.id, user: req.user?.id },
        req.body,
        { new: true }
      );
      if (!job) return res.status(404).json({ message: "Job not found" });
      const jobObj = job.toObject();
      return res.json({
        ...jobObj,
        user: jobObj.user?.toString?.() || jobObj.user,
        notes: typeof jobObj.notes === "string" ? jobObj.notes : "",
      });
    } catch (err) {
      return next(err);
    }
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Only allow updating allowed fields, including customFields
    const update: any = { ...req.body };
    if (update.customFields && typeof update.customFields === "object") {
      update.customFields = update.customFields;
    }
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      update,
      { new: true }
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    const jobObj = job.toObject();
    // Convert customFields Map to plain object if present
    if (
      jobObj.customFields &&
      typeof jobObj.customFields === "object" &&
      jobObj.customFields !== null &&
      typeof (jobObj.customFields as any).entries === "function"
    ) {
      jobObj.customFields = Object.fromEntries(
        (jobObj.customFields as any).entries()
      );
    }
    res.json({
      ...jobObj,
      user: jobObj.user?.toString?.() || jobObj.user,
      notes: typeof jobObj.notes === "string" ? jobObj.notes : "",
    });
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
