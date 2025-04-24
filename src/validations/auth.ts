import { z } from "zod";
import { Translations } from "../types/translations";

// Centralized validation message keys
const validationMessages = {
  requiredEmail: "validation.requiredEmail",
  validEmail: "validation.validEmail",
  requiredPassword: "validation.requiredPassword",
  passwordMinLength: "validation.passwordMinLength",
  passwordMaxLength: "validation.passwordMaxLength",
  requiredName: "validation.requiredName",
  nameMaxLength: "validation.nameMaxLength",
  requiredConfirmPassword: "validation.requiredConfirmPassword",
  passwordsDoNotMatch: "validation.passwordsDoNotMatch",
  validLimit: "validation.validLimit",
  limitMax: "validation.limitMax",
};

/**
 * Validates that the password and confirmPassword fields match.
 * @param data - Object containing password and confirmPassword fields.
 * @param translations - Translation object for error messages.
 * @returns True if passwords match, otherwise a Zod issue.
 */
const passwordMatchValidation = (
  data: { password: string; confirmPassword: string },
  translations: Translations
) => ({
  isValid: data.password === data.confirmPassword,
  issue: {
    message: translations[validationMessages.passwordsDoNotMatch] || "Passwords do not match",
    path: ["confirmPassword"],
  },
});

/**
 * Type definition for validated login form data.
 */
export type LoginData = {
  email: string;
  password: string;
};

/**
 * Type definition for validated signup form data.
 */
export type SignupData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  limit: number;
};

/**
 * Type definition for validation errors returned by Zod.
 */
export type ValidationError = Record<string, string>;

/**
 * Validation schema for login form fields.
 * Ensures email is a valid, lowercase email address and password meets length requirements.
 * @param translations - Object containing localized error messages.
 * @returns Zod schema for login form validation.
 */
export const loginSchema = (translations: Translations) =>
  z.object({
    email: z
      .string()
      .trim()
      .min(1, {
        message: translations[validationMessages.requiredEmail] || "Email is required",
      })
      .email({
        message: translations[validationMessages.validEmail] || "Invalid email format",
      })
      .transform((val) => val.toLowerCase()),

    password: z
      .string()
      .min(1, {
        message: translations[validationMessages.requiredPassword] || "Password is required",
      })
      .min(6, {
        message: translations[validationMessages.passwordMinLength] || "Password must be at least 6 characters",
      })
      .max(40, {
        message: translations[validationMessages.passwordMaxLength] || "Password must be less than 40 characters",
      }),
  });

/**
 * Validation schema for signup form fields.
 * Includes name, email, password, confirmPassword, and a required limit field.
 * Ensures limit is a positive integer (defaulting to 1) and passwords match.
 * @param translations - Object containing localized error messages.
 * @returns Zod schema for signup form validation.
 */
export const signupSchema = (translations: Translations) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1, {
          message: translations[validationMessages.requiredName] || "Name is required",
        })
        .max(50, {
          message: translations[validationMessages.nameMaxLength] || "Name must be less than 50 characters",
        }),

      email: z
        .string()
        .trim()
        .min(1, {
          message: translations[validationMessages.requiredEmail] || "Email is required",
        })
        .email({
          message: translations[validationMessages.validEmail] || "Invalid email format",
        })
        .transform((val) => val.toLowerCase()),

      password: z
        .string()
        .min(1, {
          message: translations[validationMessages.requiredPassword] || "Password is required",
        })
        .min(6, {
          message: translations[validationMessages.passwordMinLength] || "Password must be at least 6 characters",
        })
        .max(40, {
          message: translations[validationMessages.passwordMaxLength] || "Password must be less than 40 characters",
        }),

      confirmPassword: z
        .string()
        .min(1, {
          message: translations[validationMessages.requiredConfirmPassword] || "Password confirmation is required",
        }),

      limit: z
        .number()
        .int()
        .min(1, {
          message: translations[validationMessages.validLimit] || "Limit must be a positive integer",
        })
        .max(100, {
          message: translations[validationMessages.limitMax] || "Limit must be 100 or less",
        })
        .default(1),
    })
    .refine(
      (data) => passwordMatchValidation(data, translations).isValid,
      (data) => passwordMatchValidation(data, translations).issue
    );

export default {
  loginSchema,
  signupSchema,
};