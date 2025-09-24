import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { jobValidationRules } from "../middleware/validation";
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from "../controllers/jobController";

const router = Router();

router.get("/", authMiddleware, getJobs);
router.get("/:id", authMiddleware, getJobById);
router.post("/", authMiddleware, jobValidationRules, createJob);
// Accept partial update for favorite toggle (skip validation if only favorite is present)
router.put(
  "/:id",
  authMiddleware,
  (req, res, next) => {
    // If only 'favorite' is present, skip validation
    if (
      req.body &&
      Object.keys(req.body).length === 1 &&
      Object.prototype.hasOwnProperty.call(req.body, "favorite")
    ) {
      return next();
    }
    return jobValidationRules[0](req, res, () => {
      jobValidationRules[1](req, res, () => {
        jobValidationRules[2](req, res, () => {
          jobValidationRules[3](req, res, next);
        });
      });
    });
  },
  updateJob
);
router.delete("/:id", authMiddleware, deleteJob);

export default router;
