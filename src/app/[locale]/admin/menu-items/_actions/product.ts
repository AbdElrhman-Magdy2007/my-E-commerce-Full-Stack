
"use server";

import { Pages, Routes } from "@/constants/enums";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import { db } from "@/lib/prisma";
import getTrans from "@/lib/translation";
import { addProductSchema, updateProductSchema } from "@/validations/product";
import { Extra, ExtraIngredients, ProductSize, Size } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Define response type for server actions
interface ActionResponse {
  status: number;
  message: string;
  error?: Record<string, string>;
  formData?: FormData;
}

// Maximum image size (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * Adds a new product to the database.
 * @param args - Category ID and size/extra options.
 * @param prevState - Previous state (unused).
 * @param formData - Form data containing product details.
 * @returns ActionResponse with status and message.
 */
export const addProduct = async (
  args: {
    categoryId: string;
    options: { sizes: Partial<Size>[]; extras: Partial<Extra>[] };
  },
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> => {
  const locale = await getCurrentLocale();
  const translations = await getTrans(locale);
  console.log("Incoming FormData:", Object.fromEntries(formData.entries()));
  const result = addProductSchema(translations).safeParse(
    Object.fromEntries(formData.entries())
  );

  // Validate form data
  if (!result.success) {
    const errorDetails = result.error.flatten();
    console.log("Validation errors:", {
      fieldErrors: errorDetails.fieldErrors,
      formErrors: errorDetails.formErrors,
    });
    return {
      error: Object.fromEntries(
        Object.entries(errorDetails.fieldErrors).map(([key, value]) => [
          key,
          value?.join(", ") || "",
        ])
      ),
      status: 400,
      message: translations.messages.validationError || "Data validation failed",
      formData,
    };
  }

  console.log("Validated data:", result.data);
  const data = result.data;
  const basePrice = Number(data.basePrice);
  const limit = data.limit;
  const imageFile = data.image as File | null;

  // Validate image presence and size
  if (!imageFile || imageFile.size === 0) {
    console.log("Image validation failed: No image provided or empty file");
    return {
      status: 400,
      message:
        translations.admin?.menuItems?.imageValidation?.required ||
        "Image is required",
    };
  }
  if (imageFile.size > MAX_IMAGE_SIZE) {
    console.log("Image validation failed: Size exceeds 5MB", {
      size: imageFile.size,
    });
    return {
      status: 400,
      message:
        translations.admin?.menuItems?.imageValidation?.size ||
        "Image size exceeds the maximum limit of 5MB",
    };
  }

  let imageUrl: string;
  try {
    imageUrl = await getImageUrl(imageFile);
  } catch (error) {
    console.error("Image upload error:", error);
    return {
      status: 500,
      message: translations.messages.imageUploadError || "Failed to upload image",
    };
  }

  // Create product in the database
  try {
    const newProduct = await db.product.create({
      data: {
        ...data,
        image: imageUrl,
        basePrice,
        limit,
        categoryId: args.categoryId,
        order: 0,
        sizes: {
          createMany: {
            data: args.options.sizes.map((size) => ({
              name: size.name as ProductSize,
              price: Number(size.price),
            })),
          },
        },
        extras: {
          createMany: {
            data: args.options.extras.map((extra) => ({
              name: extra.name as ExtraIngredients,
              price: Number(extra.price),
            })),
          },
        },
      },
    });

    // Revalidate paths after adding the product
    revalidatePath(`/${locale}/${Routes.MENU}`);
    revalidatePath(`/${locale}/${Routes.ADMIN}/${Pages.MENU_ITEMS}`);
    revalidatePath(`/${locale}`);

    return {
      status: 201,
      message: translations.messages.productAdded || "Product added successfully",
    };
  } catch (error) {
    console.error("Error adding product:", error);
    return {
      status: 500,
      message: translations.messages.unexpectedError || "An unexpected error occurred",
    };
  }
};

/**
 * Updates an existing product in the database.
 * @param args - Product ID and size/extra options.
 * @param prevState - Previous state (unused).
 * @param formData - Form data containing updated product details.
 * @returns ActionResponse with status and message.
 */
export const updateProduct = async (
  args: {
    productId: string;
    options: { sizes: Partial<Size>[]; extras: Partial<Extra>[] };
  },
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> => {
  const locale = await getCurrentLocale();
  const translations = await getTrans(locale);
  console.log("Incoming FormData:", Object.fromEntries(formData.entries()));
  const result = updateProductSchema(translations).safeParse(
    Object.fromEntries(formData.entries())
  );

  // Validate form data
  if (!result.success) {
    const errorDetails = result.error.flatten();
    console.log("Validation errors:", {
      fieldErrors: errorDetails.fieldErrors,
      formErrors: errorDetails.formErrors,
    });
    return {
      error: Object.fromEntries(
        Object.entries(errorDetails.fieldErrors).map(([key, value]) => [
          key,
          value?.join(", ") || "",
        ])
      ),
      status: 400,
      message: translations.messages.validationError || "Data validation failed",
      formData,
    };
  }

  console.log("Validated data:", result.data);
  const data = result.data;
  const basePrice = Number(data.basePrice);
  const limit = data.limit;
  const imageFile = data.image as File | null;
  let imageUrl: string | undefined;

  // Check if product exists
  const product = await db.product.findUnique({
    where: { id: args.productId },
  });
  if (!product) {
    return {
      status: 404,
      message: translations.messages.productNotFound || "Product not found",
    };
  }

  // Validate image if uploaded
  if (imageFile && imageFile.size > 0) {
    if (imageFile.size > MAX_IMAGE_SIZE) {
      console.log("Image validation failed: Size exceeds 5MB", {
        size: imageFile.size,
      });
      return {
        status: 400,
        message:
          translations.admin?.menuItems?.imageValidation?.size ||
          "Image size exceeds the maximum limit of 5MB",
      };
    }
    try {
      imageUrl = await getImageUrl(imageFile);
    } catch (error) {
      console.error("Image upload error:", error);
      return {
        status: 500,
        message: translations.messages.imageUploadError || "Failed to upload image",
      };
    }
  }

  // Update product using a transaction
  try {
    const updatedProduct = await db.$transaction(async (tx) => {
      const productUpdate = await tx.product.update({
        where: { id: args.productId },
        data: {
          ...data,
          basePrice,
          limit,
          image: imageUrl ?? product.image,
        },
      });

      await tx.size.deleteMany({ where: { productId: args.productId } });
      await tx.size.createMany({
        data: args.options.sizes.map((size) => ({
          productId: args.productId,
          name: size.name as ProductSize,
          price: Number(size.price),
        })),
      });

      await tx.extra.deleteMany({ where: { productId: args.productId } });
      await tx.extra.createMany({
        data: args.options.extras.map((extra) => ({
          productId: args.productId,
          name: extra.name as ExtraIngredients,
          price: Number(extra.price),
        })),
      });

      return productUpdate;
    });

    // Revalidate paths after updating the product
    revalidatePath(`/${locale}/${Routes.MENU}`);
    revalidatePath(`/${locale}/${Routes.ADMIN}/${Pages.MENU_ITEMS}`);
    revalidatePath(
      `/${locale}/${Routes.ADMIN}/${Pages.MENU_ITEMS}/${updatedProduct.id}/${Pages.EDIT}`
    );
    revalidatePath(`/${locale}`);

    return {
      status: 200,
      message:
        translations.messages.updateProductSuccess || "Product updated successfully",
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      status: 500,
      message: translations.messages.unexpectedError || "An unexpected error occurred",
    };
  }
};

/**
 * Uploads an image file and returns its URL.
 * @param imageFile - The image file to upload.
 * @returns URL of the uploaded image.
 * @throws Error if the upload fails or the response is invalid.
 */
const getImageUrl = async (imageFile: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("pathName", "product_images");

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Image upload failed: ${response.statusText}`);
  }

  const image = await response.json();
  if (!image?.url) {
    throw new Error("Invalid response from image upload API");
  }

  return image.url as string;
};

/**
 * Deletes a product from the database.
 * @param id - The ID of the product to delete.
 * @returns ActionResponse with status and message.
 */
export const deleteProduct = async (id: string): Promise<ActionResponse> => {
  const locale = await getCurrentLocale();
  const translations = await getTrans(locale);

  // Check if product exists
  const product = await db.product.findUnique({
    where: { id },
  });
  if (!product) {
    return {
      status: 404,
      message: translations.messages.productNotFound || "Product not found",
    };
  }

  // Delete product
  try {
    await db.product.delete({
      where: { id },
    });

    // Revalidate paths after deletion
    revalidatePath(`/${locale}/${Routes.MENU}`);
    revalidatePath(`/${locale}/${Routes.ADMIN}/${Pages.MENU_ITEMS}`);
    revalidatePath(
      `/${locale}/${Routes.ADMIN}/${Pages.MENU_ITEMS}/${id}/${Pages.EDIT}`
    );
    revalidatePath(`/${locale}`);

    return {
      status: 200,
      message:
        translations.messages.deleteProductSuccess || "Product deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      status: 500,
      message: translations.messages.unexpectedError || "An unexpected error occurred",
    };
  }
};

























// "use server";

// import { Pages, Routes } from "@/constants/enums";
// import { getCurrentLocale } from "@/lib/getCurrentLocale";
// import { db } from "@/lib/prisma";
// import getTrans from "@/lib/translation";
// import { addProductSchema, updateProductSchema } from "@/validations/product";
// import { Extra, ExtraIngredients, ProductSize, Size } from "@prisma/client";
// import { revalidatePath } from "next/cache";

// // تعريف نوع للرد
// interface ActionResponse {
//   status: number;
//   message: string;
//   error?: Record<string, string>;
//   formData?: FormData;
// }

// // الحد الأقصى لحجم الصورة (مثال: 5 ميجابايت)
// const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// export const addProduct = async (
//   args: {
//     categoryId: string;
//     options: { sizes: Partial<Size>[]; extras: Partial<Extra>[] };
//   },
//   prevState: unknown,
//   formData: FormData
// ): Promise<ActionResponse> => {
//   const locale = await getCurrentLocale();
//   const translations = await getTrans(locale);
//   const result = addProductSchema(translations).safeParse(
//     Object.fromEntries(formData.entries())
//   );

//   // التحقق من صحة البيانات
//   if (!result.success) {
//     return {
//       error: Object.fromEntries(
//         Object.entries(result.error.formErrors.fieldErrors).map(([key, value]) => [
//           key,
//           value?.join(", ") || "",
//         ])
//       ),
//       status: 400,
//       message: translations.messages.validationError || "Validation failed",
//       formData,
//     };
//   }

//   const data = result.data;
//   const basePrice = Number(data.basePrice);
//   const imageFile = data.image as File;

//   // التحقق من وجود الصورة وحجمها
//   if (imageFile.size === 0) {
//     return {
//       status: 400,
//       message:
//         translations.admin?.menuItems?.imageValidation?.required ||
//         "Image is required",
//     };
//   }
//   if (imageFile.size > MAX_IMAGE_SIZE) {
//     return {
//       status: 400,
//       message:
//         translations.admin?.menuItems?.imageValidation?.size ||
//         "Image size exceeds the maximum limit of 5MB",
//     };
//   }

//   let imageUrl: string;
//   try {
//     imageUrl = await getImageUrl(imageFile);
//   } catch (error) {
//     console.error("Error uploading image:", error);
//     return {
//       status: 500,
//       message: translations.messages.imageUploadError || "Failed to upload image",
//     };
//   }

//   // إنشاء المنتج في قاعدة البيانات
//   try {
//     await db.product.create({
//       data: {
//         ...data,
//         image: imageUrl,
//         basePrice,
//         categoryId: args.categoryId,
//         order: 0, // قيمة افتراضية، يمكن تعديلها لاحقًا
//         sizes: {
//           createMany: {
//             data: args.options.sizes.map((size) => ({
//               name: size.name as ProductSize,
//               price: Number(size.price),
//             })),
//           },
//         },
//         extras: {
//           createMany: {
//             data: args.options.extras.map((extra) => ({
//               name: extra.name as ExtraIngredients,
//               price: Number(extra.price),
//             })),
//           },
//         },
//       },
//     });

//     // إعادة التحقق من المسارات بعد الإضافة
//     revalidatePath(`/${locale}/${Routes.MENU}`);
//     revalidatePath(`/${locale}/${Routes.ADMIN}/${Pages.MENU_ITEMS}`);
//     revalidatePath(`/${locale}`);

//     return {
//       status: 201,
//       message: translations.messages.productAdded || "Product added successfully",
//     };
//   } catch (error) {
//     console.error("Error adding product:", error);
//     return {
//       status: 500,
//       message: translations.messages.unexpectedError || "An unexpected error occurred",
//     };
//   }
// };

// export const updateProduct = async (
//   args: {
//     productId: string;
//     options: { sizes: Partial<Size>[]; extras: Partial<Extra>[] };
//   },
//   prevState: unknown,
//   formData: FormData
// ): Promise<ActionResponse> => {
//   const locale = await getCurrentLocale();
//   const translations = await getTrans(locale);
//   const result = updateProductSchema(translations).safeParse(
//     Object.fromEntries(formData.entries())
//   );

//   // التحقق من صحة البيانات
//   if (!result.success) {
//     return {
//       error: Object.fromEntries(
//         Object.entries(result.error.formErrors.fieldErrors).map(([key, value]) => [
//           key,
//           value?.join(", ") || "",
//         ])
//       ),
//       status: 400,
//       message: translations.messages.validationError || "Validation failed",
//       formData,
//     };
//   }

//   const data = result.data;
//   const basePrice = Number(data.basePrice);
//   const imageFile = data.image as File;
//   let imageUrl: string | undefined;

//   // التحقق من وجود المنتج
//   const product = await db.product.findUnique({
//     where: { id: args.productId },
//   });
//   if (!product) {
//     return {
//       status: 404,
//       message: translations.messages.productNotFound || "Product not found",
//     };
//   }

//   // التحقق من الصورة إذا تم رفعها
//   if (imageFile.size > 0) {
//     if (imageFile.size > MAX_IMAGE_SIZE) {
//       return {
//         status: 400,
//         message:
//           translations.admin?.menuItems?.imageValidation?.size ||
//           "Image size exceeds the maximum limit of 5MB",
//       };
//     }
//     try {
//       imageUrl = await getImageUrl(imageFile);
//     } catch (error) {
//       console.error("Error uploading image:", error);
//       return {
//         status: 500,
//         message: translations.messages.imageUploadError || "Failed to upload image",
//       };
//     }
//   }

//   // تحديث المنتج باستخدام معاملة
//   try {
//     const updatedProduct = await db.$transaction(async (tx) => {
//       const productUpdate = await tx.product.update({
//         where: { id: args.productId },
//         data: {
//           ...data,
//           basePrice,
//           image: imageUrl ?? product.image,
//         },
//       });

//       await tx.size.deleteMany({ where: { productId: args.productId } });
//       await tx.size.createMany({
//         data: args.options.sizes.map((size) => ({
//           productId: args.productId,
//           name: size.name as ProductSize,
//           price: Number(size.price),
//         })),
//       });

//       await tx.extra.deleteMany({ where: { productId: args.productId } });
//       await tx.extra.createMany({
//         data: args.options.extras.map((extra) => ({
//           productId: args.productId,
//           name: extra.name as ExtraIngredients,
//           price: Number(extra.price),
//         })),
//       });

//       return productUpdate;
//     });

//     // إعادة التحقق من المسارات بعد التحديث
//     revalidatePath(`/${locale}/${Routes.MENU}`);
//     revalidatePath(`/${locale}/${Routes.ADMIN}/${Pages.MENU_ITEMS}`);
//     revalidatePath(
//       `/${locale}/${Routes.ADMIN}/${Pages.MENU_ITEMS}/${updatedProduct.id}/${Pages.EDIT}`
//     );
//     revalidatePath(`/${locale}`);

//     return {
//       status: 200,
//       message:
//         translations.messages.updateProductSuccess || "Product updated successfully",
//     };
//   } catch (error) {
//     console.error("Error updating product:", error);
//     return {
//       status: 500,
//       message: translations.messages.unexpectedError || "An unexpected error occurred",
//     };
//   }
// };

// const getImageUrl = async (imageFile: File): Promise<string> => {
//   const formData = new FormData();
//   formData.append("file", imageFile);
//   formData.append("pathName", "product_images");

//   const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`, {
//     method: "POST",
//     body: formData,
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to upload image: ${response.statusText}`);
//   }

//   const image = (await response.json()) as { url: string };
//   return image.url;
// };

// export const deleteProduct = async (id: string): Promise<ActionResponse> => {
//   const locale = await getCurrentLocale();
//   const translations = await getTrans(locale);

//   // التحقق من وجود المنتج
//   const product = await db.product.findUnique({
//     where: { id },
//   });
//   if (!product) {
//     return {
//       status: 404,
//       message: translations.messages.productNotFound || "Product not found",
//     };
//   }

//   // حذف المنتج
//   try {
//     await db.product.delete({
//       where: { id },
//     });

//     // إعادة التحقق من المسارات بعد الحذف
//     revalidatePath(`/${locale}/${Routes.MENU}`);
//     revalidatePath(`/${locale}/${Routes.ADMIN}/${Pages.MENU_ITEMS}`);
//     revalidatePath(
//       `/${locale}/${Routes.ADMIN}/${Pages.MENU_ITEMS}/${id}/${Pages.EDIT}`
//     );
//     revalidatePath(`/${locale}`);

//     return {
//       status: 200,
//       message:
//         translations.messages.deleteProductSuccess || "Product deleted successfully",
//     };
//   } catch (error) {
//     console.error("Error deleting product:", error);
//     return {
//       status: 500,
//       message: translations.messages.unexpectedError || "An unexpected error occurred",
//     };
//   }
// };



// // src/app/[locale]/admin/_actions/product.ts
// "use server";

// import { Pages, Routes } from "@/constants/enums";
// import { getCurrentLocale } from "@/lib/getCurrentLocale";
// import { db } from "@/lib/prisma";
// import getTrans from "@/lib/translation";
// import { addProductSchema, updateProductSchema } from "@/validations/product";
// import { Extra, ExtraIngredients, ProductSize, Size } from "@prisma/client";
// import { revalidatePath } from "next/cache";

// // تعريف نوع للرد
// interface ActionResponse {
//   status: number;
//   message: string;
//   error?: Record<string, string>;
//   formData?: FormData;
// }

// // الحد الأقصى لحجم الصورة
// const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
// const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

// // دالة مساعدة لإعادة التحقق من المسارات
// const revalidateProductPaths = (locale: string, productId?: string) => {
//   revalidatePath(`/${locale}/${Routes.MENU}`);
//   revalidatePath(`/${locale}/${Routes.ADMIN}/${Pages.MENU_ITEMS}`);
//   if (productId) {
//     revalidatePath(`/${locale}/${Routes.ADMIN}/${Pages.MENU_ITEMS}/${productId}/${Pages.EDIT}`);
//   }
//   revalidatePath(`/${locale}`);
// };

// // دالة لرفع الصورة
// const getImageUrl = async (imageFile: File): Promise<string> => {
//   // التحقق من نوع الصورة
//   if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
//     throw new Error("Only JPEG, PNG, or GIF images are allowed");
//   }

//   // التحقق من حجم الصورة
//   if (imageFile.size > MAX_IMAGE_SIZE) {
//     throw new Error("Image size exceeds the maximum limit of 5MB");
//   }

//   const formData = new FormData();
//   formData.append("file", imageFile);
//   formData.append("pathName", "product_images");

//   try {
//     const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`, {
//       method: "POST",
//       body: formData,
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to upload image: ${response.statusText}`);
//     }

//     const image = (await response.json()) as { url: string };
//     return image.url;
//   } catch (error) {
//     console.error("Image upload error:", error);
//     throw new Error("Failed to upload image to server");
//   }
// };

// export const addProduct = async (
//   args: {
//     categoryId: string;
//     options: { sizes: Partial<Size>[]; extras: Partial<Extra>[] };
//   },
//   prevState: ActionResponse | null,
//   formData: FormData
// ): Promise<ActionResponse> => {
//   const locale = await getCurrentLocale();
//   const translations = await getTrans(locale);

//   // تحويل FormData إلى كائن
//   const dataObject = Object.fromEntries(formData.entries());
//   const result = addProductSchema(translations).safeParse(dataObject);

//   // التحقق من صحة البيانات
//   if (!result.success) {
//     return {
//       error: Object.fromEntries(
//         Object.entries(result.error.formErrors.fieldErrors).map(([key, value]) => [
//           key,
//           value?.join(", ") || "",
//         ])
//       ),
//       status: 400,
//       message: translations.messages.validationError || "Validation failed",
//       formData,
//     };
//   }

//   const data = result.data;
//   const basePrice = Number(data.basePrice);
//   const imageFile = formData.get("image") as File;

//   // التحقق من وجود الصورة
//   if (!imageFile || imageFile.size === 0) {
//     return {
//       status: 400,
//       message: translations.admin?.menuItems?.imageValidation?.required || "Image is required",
//       error: { image: translations.admin?.menuItems?.imageValidation?.required || "Image is required" },
//     };
//   }

//   let imageUrl: string;
//   try {
//     imageUrl = await getImageUrl(imageFile);
//   } catch (error) {
//     return {
//       status: 500,
//       message: translations.messages.imageUploadError || "Failed to upload image",
//       error: { image: error.message || "Image upload failed" },
//     };
//   }

//   // إنشاء المنتج
//   try {
//     await db.product.create({
//       data: {
//         name: data.name,
//         description: data.description,
//         basePrice,
//         image: imageUrl,
//         categoryId: args.categoryId,
//         order: 0,
//         sizes: {
//           createMany: {
//             data: args.options.sizes.map((size) => ({
//               name: size.name as ProductSize,
//               price: Number(size.price) || 0,
//             })),
//           },
//         },
//         extras: {
//           createMany: {
//             data: args.options.extras.map((extra) => ({
//               name: extra.name as ExtraIngredients,
//               price: Number(extra.price) || 0,
//             })),
//           },
//         },
//       },
//     });

//     revalidateProductPaths(locale);

//     return {
//       status: 201,
//       message: translations.messages.productAdded || "Product added successfully",
//     };
//   } catch (error) {
//     console.error("Error adding product:", error);
//     return {
//       status: 500,
//       message: translations.messages.unexpectedError || "An unexpected error occurred",
//       error: { server: "Failed to create product" },
//     };
//   }
// };

// export const updateProduct = async (
//   args: {
//     productId: string;
//     options: { sizes: Partial<Size>[]; extras: Partial<Extra>[] };
//   },
//   prevState: ActionResponse | null,
//   formData: FormData
// ): Promise<ActionResponse> => {
//   const locale = await getCurrentLocale();
//   const translations = await getTrans(locale);

//   // تحويل FormData إلى كائن
//   const dataObject = Object.fromEntries(formData.entries());
//   const result = updateProductSchema(translations).safeParse(dataObject);

//   // التحقق من صحة البيانات
//   if (!result.success) {
//     return {
//       error: Object.fromEntries(
//         Object.entries(result.error.formErrors.fieldErrors).map(([key, value]) => [
//           key,
//           value?.join(", ") || "",
//         ])
//       ),
//       status: 400,
//       message: translations.messages.validationError || "Validation failed",
//       formData,
//     };
//   }

//   const data = result.data;
//   const basePrice = Number(data.basePrice);
//   const imageFile = formData.get("image") as File;

//   // التحقق من وجود المنتج
//   const product = await db.product.findUnique({
//     where: { id: args.productId },
//   });
//   if (!product) {
//     return {
//       status: 404,
//       message: translations.messages.productNotFound || "Product not found",
//       error: { product: "Product not found" },
//     };
//   }

//   // التعامل مع الصورة
//   let imageUrl: string | undefined = product.image;
//   if (imageFile && imageFile.size > 0) {
//     try {
//       imageUrl = await getImageUrl(imageFile);
//     } catch (error) {
//       return {
//         status: 500,
//         message: translations.messages.imageUploadError || "Failed to upload image",
//         error: { image: error.message || "Image upload failed" },
//       };
//     }
//   }

//   // تحديث المنتج
//   try {
//     const updatedProduct = await db.$transaction(async (tx) => {
//       const productUpdate = await tx.product.update({
//         where: { id: args.productId },
//         data: {
//           name: data.name,
//           description: data.description,
//           basePrice,
//           image: imageUrl,
//           categoryId: data.categoryId || product.categoryId,
//         },
//       });

//       await tx.size.deleteMany({ where: { productId: args.productId } });
//       await tx.size.createMany({
//         data: args.options.sizes.map((size) => ({
//           productId: args.productId,
//           name: size.name as ProductSize,
//           price: Number(size.price) || 0,
//         })),
//       });

//       await tx.extra.deleteMany({ where: { productId: args.productId } });
//       await tx.extra.createMany({
//         data: args.options.extras.map((extra) => ({
//           productId: args.productId,
//           name: extra.name as ExtraIngredients,
//           price: Number(extra.price) || 0,
//         })),
//       });

//       return productUpdate;
//     });

//     revalidateProductPaths(locale, updatedProduct.id);

//     return {
//       status: 200,
//       message: translations.messages.updateProductSuccess || "Product updated successfully",
//     };
//   } catch (error) {
//     console.error("Error updating product:", error);
//     return {
//       status: 500,
//       message: translations.messages.unexpectedError || "An unexpected error occurred",
//       error: { server: "Failed to update product" },
//     };
//   }
// };

// export const deleteProduct = async (id: string): Promise<ActionResponse> => {
//   const locale = await getCurrentLocale();
//   const translations = await getTrans(locale);

//   // التحقق من وجود المنتج
//   const product = await db.product.findUnique({
//     where: { id },
//   });
//   if (!product) {
//     return {
//       status: 404,
//       message: translations.messages.productNotFound || "Product not found",
//       error: { product: "Product not found" },
//     };
//   }

//   // حذف المنتج
//   try {
//     await db.product.delete({
//       where: { id },
//     });

//     revalidateProductPaths(locale, id);

//     return {
//       status: 200,
//       message: translations.messages.deleteProductSuccess || "Product deleted successfully",
//     };
//   } catch (error) {
//     console.error("Error deleting product:", error);
//     return {
//       status: 500,
//       message: translations.messages.unexpectedError || "An unexpected error occurred",
//       error: { server: "Failed to delete product" },
//     };
//   }
// };