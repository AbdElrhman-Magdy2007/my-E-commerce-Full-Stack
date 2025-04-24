"use server";

import { Pages, Routes } from "@/constants/enums";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import { db } from "@/lib/prisma";
import getTrans from "@/lib/translation";
import { addCategorySchema, updateCategorySchema } from "@/validations/category";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

// تعريف القيم الثابتة
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB بالبايت
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

// إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// واجهة الرد
interface ActionResponse {
  status: number;
  message: string;
  error?: Record<string, string>;
}

// دالة لرفع الصورة على Cloudinary
async function getImageUrl(imageFile: { name: string; type: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> }): Promise<string> {
  try {
    console.log(`[getImageUrl] Uploading image to Cloudinary: ${imageFile.name}, type: ${imageFile.type}, size: ${imageFile.size}`);
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const result = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "product_images", // نفس المجلد اللي عايزاه
          public_id: `${Date.now()}-${imageFile.name.replace(/\s+/g, "_")}`,
        },
        (error, result) => {
          if (error) {
            console.error("[getImageUrl] Cloudinary upload error:", error);
            return reject(error);
          }
          console.log("[getImageUrl] Image uploaded to Cloudinary:", result?.secure_url);
          resolve(result?.secure_url || "");
        }
      );
      uploadStream.end(buffer);
    });
    if (!result) {
      throw new Error("Cloudinary upload failed: No URL returned");
    }
    return result;
  } catch (error) {
    console.error(`[getImageUrl] Error uploading image '${imageFile.name}' to Cloudinary:`, error);
    throw new Error("Failed to upload image");
  }
}

// دالة إضافة فئة جديدة
export const addCategory = async (
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> => {
  const locale = await getCurrentLocale();
  const translations = await getTrans(locale);

  console.log("[addCategory] Called with FormData:", {
    categoryName: formData.get("categoryName"),
    image: formData.get("image") ? `[File: ${formData.get("image").name}]` : null,
  });

  // التحقق من وجود categoryName
  const categoryName = formData.get("categoryName")?.toString();
  if (!categoryName) {
    console.log("[addCategory] Validation failed: categoryName is missing");
    return {
      status: 400,
      message:
        translations.admin?.categories?.form?.name?.validation?.required ||
        "Category name is required",
      error: { categoryName: translations.admin?.categories?.form?.name?.validation?.required },
    };
  }

  // التحقق من categoryName باستخدام Zod
  const result = addCategorySchema(translations).safeParse({ categoryName });

  if (!result.success) {
    console.log("[addCategory] Zod validation failed:", result.error.formErrors.fieldErrors);
    return {
      status: 400,
      message: translations.messages.invalidInput || "Invalid input provided",
      error: result.error.formErrors.fieldErrors,
    };
  }

  const { categoryName: validatedCategoryName } = result.data;
  const image = formData.get("image");

  try {
    let imageUrl: string | null = null;

    // التحقق من الصورة
    if (image && typeof image !== "string" && image.size > 0) {
      console.log(`[addCategory] Processing image: ${image.name}, type: ${image.type}, size: ${image.size}`);
      if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
        console.log("[addCategory] Validation failed: Invalid image type");
        return {
          status: 400,
          message:
            translations.admin?.categories?.form?.image?.invalidType ||
            "Please upload a valid image (JPEG, PNG, or GIF)",
          error: { image: translations.admin?.categories?.form?.image?.invalidType },
        };
      }
      if (image.size > MAX_IMAGE_SIZE) {
        console.log("[addCategory] Validation failed: Image size exceeds limit");
        return {
          status: 400,
          message:
            translations.admin?.categories?.form?.image?.size ||
            "Image size exceeds the maximum limit of 5MB",
          error: { image: translations.admin?.categories?.form?.image?.size },
        };
      }
      imageUrl = await getImageUrl(image);
    } else {
      console.log("[addCategory] No valid image provided");
    }

    // إنشاء الفئة
    console.log("[addCategory] Creating category with data:", { name: validatedCategoryName, image: imageUrl });
    const newCategory = await db.category.create({
      data: {
        name: validatedCategoryName,
        image: imageUrl,
      },
    });
    console.log("[addCategory] Category created:", {
      id: newCategory.id,
      name: newCategory.name,
      image: newCategory.image,
    });

    revalidatePath(`/${locale}/${Routes.ADMIN}/${Pages.CATEGORIES}`);
    revalidatePath(`/${locale}/${Routes.MENU}`);

    return {
      status: 201,
      message: translations.messages.categoryAdded || "Category added successfully",
    };
  } catch (error) {
    console.error("[addCategory] Error adding category:", error);
    return {
      status: 500,
      message:
        error instanceof Error && error.message === "Failed to upload image"
          ? translations.admin?.categories?.form?.image?.uploadError || "Failed to upload image"
          : translations.messages.unexpectedError || "An unexpected error occurred",
      error: { general: "Operation failed" },
    };
  }
};

// دالة تحديث فئة
export const updateCategory = async (
  id: string,
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> => {
  const locale = await getCurrentLocale();
  const translations = await getTrans(locale);

  console.log("[updateCategory] Called with ID:", id, "FormData:", {
    categoryName: formData.get("categoryName"),
    image: formData.get("image") ? `[File: ${formData.get("image").name}]` : null,
  });

  // التحقق من وجود categoryName
  const categoryName = formData.get("categoryName")?.toString();
  if (!categoryName) {
    console.log("[updateCategory] Validation failed: categoryName is missing");
    return {
      status: 400,
      message:
        translations.admin?.categories?.form?.name?.validation?.required ||
        "Category name is required",
      error: { categoryName: translations.admin?.categories?.form?.name?.validation?.required },
    };
  }

  // التحقق من categoryName
  const result = updateCategorySchema(translations).safeParse({ categoryName });

  if (!result.success) {
    console.log("[updateCategory] Zod validation failed:", result.error.formErrors.fieldErrors);
    return {
      status: 400,
      message: translations.messages.invalidInput || "Invalid input provided",
      error: result.error.formErrors.fieldErrors,
    };
  }

  const { categoryName: validatedCategoryName } = result.data;
  const image = formData.get("image");

  try {
    let imageUrl: string | undefined;

    // التحقق من الصورة
    if (image && typeof image !== "string" && image.size > 0) {
      console.log(`[updateCategory] Processing image: ${image.name}, type: ${image.type}, size: ${image.size}`);
      if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
        console.log("[updateCategory] Validation failed: Invalid image type");
        return {
          status: 400,
          message:
            translations.admin?.categories?.form?.image?.invalidType ||
            "Please upload a valid image (JPEG, PNG, or GIF)",
          error: { image: translations.admin?.categories?.form?.image?.invalidType },
        };
      }
      if (image.size > MAX_IMAGE_SIZE) {
        console.log("[updateCategory] Validation failed: Image size exceeds limit");
        return {
          status: 400,
          message:
            translations.admin?.categories?.form?.image?.size ||
            "Image size exceeds the maximum limit of 5MB",
          error: { image: translations.admin?.categories?.form?.image?.size },
        };
      }
      imageUrl = await getImageUrl(image);
    } else {
      console.log("[updateCategory] No valid image provided");
    }

    // تحديث الفئة
    console.log("[updateCategory] Updating category with data:", {
      name: validatedCategoryName,
      image: imageUrl,
    });
    const updatedCategory = await db.category.update({
      where: { id },
      data: {
        name: validatedCategoryName,
        ...(imageUrl && { image: imageUrl }),
      },
    });
    console.log("[updateCategory] Category updated:", {
      id: updatedCategory.id,
      name: updatedCategory.name,
      image: updatedCategory.image,
    });

    revalidatePath(`/${locale}/${Routes.ADMIN}/${Pages.CATEGORIES}`);
    revalidatePath(`/${locale}/${Routes.MENU}`);

    return {
      status: 200,
      message: translations.messages.updateCategorySuccess || "Category updated successfully",
    };
  } catch (error) {
    console.error("[updateCategory] Error updating category:", error);
    return {
      status: 500,
      message:
        error instanceof Error && error.message === "Failed to upload image"
          ? translations.admin?.categories?.form?.image?.uploadError || "Failed to upload image"
          : translations.messages.unexpectedError || "An unexpected error occurred",
      error: { general: "Operation failed" },
    };
  }
};

// دالة حذف فئة
export const deleteCategory = async (id: string): Promise<ActionResponse> => {
  const locale = await getCurrentLocale();
  const translations = await getTrans(locale);

  console.log("[deleteCategory] Called with ID:", id);

  try {
    console.log("[deleteCategory] Deleting category with ID:", id);
    await db.category.delete({
      where: { id },
    });
    console.log("[deleteCategory] Category deleted successfully");

    revalidatePath(`/${locale}/${Routes.ADMIN}/${Pages.CATEGORIES}`);
    revalidatePath(`/${locale}/${Routes.MENU}`);

    return {
      status: 200,
      message: translations.messages.deleteCategorySuccess || "Category deleted successfully",
    };
  } catch (error) {
    console.error("[deleteCategory] Error deleting category:", error);
    return {
      status: 500,
      message: translations.messages.unexpectedError || "An unexpected error occurred",
      error: { general: "Operation failed" },
    };
  }
};