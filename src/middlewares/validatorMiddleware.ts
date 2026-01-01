import { check, ValidationChain } from "express-validator";

// Signup Validator
export const SignupValidator: ValidationChain[] = [
  check("firstname")
    .trim()
    .isString()
    .notEmpty()
    .withMessage("Firstname is required")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "Firstname must be alphanumeric and cannot contain special characters"
    ),
  check("lastname")
    .trim()
    .isString()
    .notEmpty()
    .withMessage("Lastname is required")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "Lastname must be alphanumeric and cannot contain special characters"
    ),
  check("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Email is required"),
  check("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long")
    .matches(/(?=.*?[A-Z])/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/(?=.*?[a-z])/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/(?=.*?[0-9])/)
    .withMessage("Password must contain at least one number")
    .matches(/(?=.*?[#?!@$%^&*-])/)
    .withMessage("Password must contain at least one special character")
    .not()
    .matches(/^\s*$/)
    .withMessage("Password cannot be empty or contain only whitespace"),
];

// Task Validator
export const TaskValidator: ValidationChain[] = [
  check("title").isString().notEmpty().withMessage("Title must be a string"),
  check("description")
    .isString()
    .notEmpty()
    .withMessage("Description must be a string"),
];

// Project Validator
export const ProjectValidator: ValidationChain[] = [
  check("name").isString().notEmpty().withMessage("Name must be a string"),
  check("description")
    .isString()
    .notEmpty()
    .withMessage("Description must be a string"),
];
