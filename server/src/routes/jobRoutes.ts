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
router.put("/:id", authMiddleware, jobValidationRules, updateJob);
router.delete("/:id", authMiddleware, deleteJob);

export default router;
