import { Translations } from "@/types/translations";
import { z } from "zod";

export const getUpdateProfileSchema = (translations: Translations) => {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: translations?.validation?.nameRequired || "Name is required" }),

    email: z
      .string()
      .trim()
      .email({ message: translations?.validation?.validEmail || "Invalid email format" }),

    phone: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) => !value || /^\+?[1-9]\d{1,14}$/.test(value),
        { message: translations?.profile?.form?.phone?.validation?.invalid || "Invalid phone number" }
      ),

    streetAddress: z.string().trim().optional(),

    postalCode: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) => !value || /^\d{5,10}$/.test(value),
        { message: translations?.profile?.form?.postalCode?.validation?.invalid || "Invalid postal code" }
      ),

    city: z.string().trim().optional(),
    country: z.string().trim().optional(),

    image: z
      .any()
      .optional()
      .refine(
        (file): file is File | string | undefined => {
          if (!file || typeof file === "string") return true; // السماح بعدم تغيير الصورة
          
          if (typeof window === "undefined") return true; // تجنب تنفيذ التحقق على الخادم

          return file instanceof File && file.size <= 2 * 1024 * 1024 && file.type.startsWith("image/");
        },
        {
          message: (file) => {
            if (!file || typeof file === "string") return undefined;
            if (typeof window === "undefined") return undefined; // لا تعرض رسالة خطأ على الخادم

            if (!(file instanceof File)) return translations?.profile?.form?.image?.validation?.invalidFormat || "Invalid file format";
            if (file.size > 2 * 1024 * 1024) return translations?.profile?.form?.image?.validation?.sizeExceeded || "Image size is too large";
            if (!file.type.startsWith("image/")) return translations?.profile?.form?.image?.validation?.invalidFormat || "Invalid image format";
            return "Invalid image";
          },
        }
      ),
  });
};
