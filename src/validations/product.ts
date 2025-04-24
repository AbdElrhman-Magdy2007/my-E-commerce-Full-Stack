
import { Translations } from "@/types/translations";
import { z } from "zod";

// Centralized error message keys for translations
const errorMessages = {
  requiredName: "admin.menuItems.form.name.validation.required",
  requiredDescription: "admin.menuItems.form.description.validation.required",
  requiredBasePrice: "admin.menuItems.form.basePrice.validation.required",
  invalidBasePrice: "admin.menuItems.form.basePrice.validation.invalid",
  requiredCategory: "admin.menuItems.form.category.validation.required",
  requiredImage: "admin.menuItems.form.image.validation.required",
  invalidImage: "admin.menuItems.form.image.validation.invalid",
  invalidLimit: "validation.validLimit",
};

/**
 * Validates an image file, ensuring it meets type and presence requirements.
 * @param translations - Translation object for error messages.
 * @param isRequired - Whether the image is required (true for add, false for update).
 * @returns Zod schema for image validation.
 */
const imageValidation = (translations: Translations, isRequired: boolean) => {
  const validMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/jpg",
    "image/svg+xml",
    "image/bmp",
  ];

  const baseSchema = z.any().nullable();

  if (isRequired) {
    return baseSchema
      .refine(
        (value: unknown) => value !== null && value !== undefined && value !== "",
        {
          message: translations[errorMessages.requiredImage] || "Image is required",
        }
      )
      .refine((value: File) => value && validMimeTypes.includes(value.type), {
        message: translations[errorMessages.invalidImage] || "Invalid image format",
      });
  }

  return baseSchema.refine(
    (value: File | null) => !value || (value && validMimeTypes.includes(value.type)),
    {
      message: translations[errorMessages.invalidImage] || "Invalid image format",
    }
  );
};

/**
 * Common validations for product fields used in both add and update schemas.
 * @param translations - Translation object for error messages.
 * @returns Object containing Zod schemas for common fields.
 */
const getCommonValidations = (translations: Translations) => {
  return {
    name: z.string().trim().min(1, {
      message: translations[errorMessages.requiredName] || "Name is required",
    }),
    description: z.string().trim().min(1, {
      message: translations[errorMessages.requiredDescription] || "Description is required",
    }),
    basePrice: z
      .string()
      .min(1, {
        message: translations[errorMessages.requiredBasePrice] || "Base price is required",
      })
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val).toString().match(/^\d+(\.\d{1,2})?$/),
        {
          message:
            translations[errorMessages.invalidBasePrice] ||
            "Base price must be a valid number with up to 2 decimal places",
        }
      ),
    categoryId: z.string().min(1, {
      message: translations[errorMessages.requiredCategory] || "Category is required",
    }),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val >= 1, {
        message: translations[errorMessages.invalidLimit] || "Limit must be a positive integer",
      }),
  };
};

/**
 * Type definition for validated product data (used in add and update).
 */
export type ProductValidatedData = {
  name: string;
  description: string;
  basePrice: string;
  categoryId: string;
  limit: number;
  image: File | null;
};

/**
 * Validation schema for adding a new product.
 * Requires an image and enforces common validations.
 * @param translations - Translation object for error messages.
 * @returns Zod schema for adding a product.
 */
export const addProductSchema = (translations: Translations) => {
  return z.object({
    ...getCommonValidations(translations),
    image: imageValidation(translations, true),
  });
};

/**
 * Validation schema for updating an existing product.
 * Image is optional, but other fields follow common validations.
 * @param translations - Translation object for error messages.
 * @returns Zod schema for updating a product.
 */
export const updateProductSchema = (translations: Translations) => {
  return z.object({
    ...getCommonValidations(translations),
    image: imageValidation(translations, false),
  });
};
