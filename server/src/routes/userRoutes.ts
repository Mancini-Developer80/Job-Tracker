import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { userValidationRules } from "../middleware/validation";
import {
  changePassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
} from "../controllers/userController";

const router = Router();

// Profile endpoints
router.get("/me/profile", authMiddleware, getProfile);
router.put("/me/profile", authMiddleware, userValidationRules, updateProfile);

// Settings endpoints (placeholders)
router.get("/me/settings", authMiddleware, getSettings);
router.put("/me/settings", authMiddleware, updateSettings);

router.post("/:id/change-password", authMiddleware, changePassword);
router.get("/", authMiddleware, adminMiddleware, getAllUsers);
router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, userValidationRules, updateUser);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

export default router;
