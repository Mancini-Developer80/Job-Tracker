import { Response, Request, NextFunction } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";

// Custom request type with user
interface AuthenticatedRequest extends Request {
  user?: { id: string; email?: string; role?: string };
}

// Get current user's profile
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Update current user's profile
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    await user.save();
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

// Placeholder: Get user settings (extend as needed)
export const getSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({ settings: {} });
  } catch (err) {
    next(err);
  }
};

// Placeholder: Update user settings (extend as needed)
export const updateSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({ settings: req.body });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res.status(400).json({ message: "Old and new password required" });
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (
      req.user?.id !== String(user._id) &&
      req.user?.role !== "Admin" &&
      req.user?.role !== "Superuser"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match)
      return res.status(400).json({ message: "Old password is incorrect" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (
      req.user?.id !== String(user._id) &&
      req.user?.role !== "Admin" &&
      req.user?.role !== "Superuser"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (
      req.user?.id !== String(user._id) &&
      req.user?.role !== "Admin" &&
      req.user?.role !== "Superuser"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (
      req.body.role &&
      (req.user?.role === "Admin" || req.user?.role === "Superuser")
    ) {
      user.role = req.body.role;
    }
    await user.save();
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
