import { body } from "express-validator";

export const jobValidationRules = [
  body("company").notEmpty().withMessage("Company is required"),
  body("position").notEmpty().withMessage("Position is required"),
  body("status")
    .isIn(["Applied", "Interview", "Offer", "Rejected"])
    .withMessage("Invalid status"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be valid (YYYY-MM-DD)"),
];

export const userValidationRules = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];
