import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { getUserJobStats } from "../controllers/jobStatsController";

const router = Router();

router.get("/stats", authMiddleware, getUserJobStats);
router.get("/stats", authMiddleware, getUserJobStats);
// router.get("/admin/stats", authMiddleware, adminMiddleware, adminJobStats);
export default router;
