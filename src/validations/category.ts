// import { Translations } from "@/types/translations";
// import * as z from "zod";
// /*************  ✨ Codeium Command ⭐  *************/
// /**
//  * Schema for adding a new category.
//  * @param translations - Object containing translations for the error messages.
//  * @returns A zod schema that validates the input for adding a new category.
//  */
// /******  0466ac43-0329-4eb6-bba2-06040d432160  *******/export const addCategorySchema = (translations: Translations) => {
//   return z.object({
//     name: z
//       .string()
//       .trim()
//       .min(1, {
//         message:
//           translations.admin?.categories?.form?.name?.validation?.required ||
//           "Default error message",
//       }),
//   });
// };

// export const updateCategorySchema = (translations: Translations) => {
//   return z.object({
//     categoryName: z
//       .string()
//       .trim()
//       .min(1, {
//         message:
//           translations.admin?.categories?.form?.name?.validation?.required ||
//           "Default error message",
//       }),
//   });
// };



import { Translations } from "@/types/translations";
import * as z from "zod";

/**
 * Schema for adding a new category.
 * @param translations - Object containing translations for error messages.
 * @returns A Zod schema that validates the input for adding a new category.
 */
export const addCategorySchema = (translations: Translations) =>
  z.object({
    categoryName: z
      .string()
      .trim()
      .min(1, {
        message:
          translations.admin?.categories?.form?.name?.validation?.required ||
          "Category name is required",
      })
      .max(100, {
        message:
          translations.admin?.categories?.form?.name?.validation?.maxLength ||
          "Category name must be 100 characters or less",
      }),
  });

/**
 * Schema for updating an existing category.
 * @param translations - Object containing translations for error messages.
 * @returns A Zod schema that validates the input for updating a category.
 */
export const updateCategorySchema = (translations: Translations) =>
  z.object({
    categoryName: z
      .string()
      .trim()
      .min(1, {
        message:
          translations.admin?.categories?.form?.name?.validation?.required ||
          "Category name is required",
      })
      .max(100, {
        message:
          translations.admin?.categories?.form?.name?.validation?.maxLength ||
          "Category name must be 100 characters or less",
      }),
  });