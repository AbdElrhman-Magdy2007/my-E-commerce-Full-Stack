// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { db } from "@/lib/prisma";
// import { Product, Category } from "@prisma/client";
// import { ProductWithRelations, CategoryWithProducts } from "@/types/product";

// /**
//  * جلب جميع المنتجات مع بيانات الفئة، الأحجام، والإضافات
//  * @returns قائمة المنتجات أو مصفوفة فارغة في حالة الخطأ
//  */
// export const getProducts = async (): Promise<ProductWithRelations[]> => {
//   try {
//     const products = await db.product.findMany({
//       include: {
//         category: true,
//         sizes: true,
//         extras: true,
//       },
//       orderBy: {
//         category: { order: "asc" },
//       },
//     });
//     return products;
//   } catch (error) {
//     console.error("❌ خطأ أثناء جلب المنتجات:", error);
//     return [];
//   }
// };

// /**
//  * جلب المنتجات الأكثر مبيعًا بناءً على عدد الطلبات
//  * @param limit - الحد الأقصى لعدد المنتجات المطلوبة (اختياري)
//  * @returns قائمة المنتجات الأكثر مبيعًا أو مصفوفة فارغة في حالة الخطأ
//  */
// export const getBestSellers = async (limit?: number): Promise<ProductWithRelations[]> => {
//   try {
//     const products = await db.product.findMany({
//       where: {
//         orders: {
//           some: {},
//         },
//       },
//       orderBy: {
//         orders: {
//           _count: "desc",
//         },
//       },
//       include: {
//         sizes: true,
//         extras: true,
//       },
//       take: limit,
//     });
//     return products;
//   } catch (error) {
//     console.error("❌ خطأ أثناء جلب المنتجات الأكثر مبيعًا:", error);
//     return [];
//   }
// };

// /**
//  * جلب جميع الفئات مع المنتجات المرتبطة بها
//  * @returns قائمة الفئات مع منتجاتها أو مصفوفة فارغة في حالة الخطأ
//  */
// export const getProductsByCategory = async (): Promise<CategoryWithProducts[]> => {
//   try {
//     const categories = await db.category.findMany({
//       include: {
//         products: {
//           include: {
//             sizes: true,
//             extras: true,
//           },
//         },
//       },
//       orderBy: {
//         order: "asc", // ترتيب الفئات حسب حقل order
//       },
//     });
//     return categories;
//   } catch (error) {
//     console.error("❌ خطأ أثناء جلب الفئات مع المنتجات:", error);
//     return [];
//   }
// };

// /**
//  * جلب المنتجات حسب معرف الفئة
//  * @param categoryId - معرف الفئة المطلوبة
//  * @returns قائمة المنتجات في الفئة أو مصفوفة فارغة في حالة الخطأ
//  */
// export const getProductsByCategoryId = async (categoryId: string): Promise<ProductWithRelations[]> => {
//   try {
//     const products = await db.product.findMany({
//       where: {
//         categoryId,
//       },
//       include: {
//         category: true,
//         orders: true,
//         // images: true, // Removed as it does not exist in the Prisma schema
//         // جلب معلومات الطلبات المرتبطة بالمنتج
//         sizes: true,
//         extras: true,
//       },
//       orderBy: {
//         name: "asc", // ترتيب حسب اسم المنتج
//       },
//     });
//     return products;
//   } catch (error) {
//     console.error("❌ خطأ أثناء جلب المنتجات حسب الفئة:", error);
//     return [];
//   }
// };



"use server";

import { db } from "@/lib/prisma";
import { ProductWithRelations, CategoryWithProducts } from "@/types/product";

// واجهة لخيارات جلب المنتجات
interface GetProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "basePrice";
  order?: "asc" | "desc";
}

/**
 * جلب جميع المنتجات بدون قيود
 * @returns قائمة المنتجات مع العلاقات
 * @throws خطأ إذا فشل جلب المنتجات
 */
export async function getAllProducts(): Promise<ProductWithRelations[]> {
  try {
    const products = await db.product.findMany({
      include: {
        category: true,
        sizes: true,
        extras: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`getAllProducts fetched ${products.length} products`);
    }

    return products;
  } catch (error) {
    console.error("❌ خطأ أثناء جلب جميع المنتجات:", error);
    throw error;
  }
}

/**
 * جلب المنتجات مع دعم الفلترة، الترتيب، والتجزئة
 * @param options - خيارات الفلترة والترتيب والصفحة
 * @returns قائمة المنتجات
 * @throws خطأ إذا فشل جلب المنتجات
 */
export async function getProducts(options: GetProductsOptions = {}): Promise<ProductWithRelations[]> {
  try {
    const {
      page = 1,
      limit = 0, // 0 يعني جلب جميع المنتجات
      search,
      sortBy = "name",
      order = "asc",
    } = options;

    const skip = limit > 0 ? (page - 1) * limit : 0;

    const products = await db.product.findMany({
      where: {
        name: search
          ? {
              contains: search,
              mode: "insensitive",
            }
          : undefined,
      },
      include: {
        category: true,
        sizes: true,
        extras: true,
      },
      orderBy: {
        [sortBy]: order,
      },
      skip,
      take: limit > 0 ? limit : undefined, // إزالة القيد إذا كان limit = 0
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`getProducts fetched ${products.length} products with options:`, options);
    }

    return products;
  } catch (error) {
    console.error("❌ خطأ أثناء جلب المنتجات:", error);
    throw error;
  }
}

/**
 * جلب عدد المنتجات مع دعم الفلترة
 * @param options - خيارات الفلترة
 * @returns عدد المنتجات
 * @throws خطأ إذا فشل الجلب
 */
export async function getProductsCount(options: Pick<GetProductsOptions, "search"> = {}): Promise<number> {
  try {
    const count = await db.product.count({
      where: {
        name: options.search
          ? {
              contains: options.search,
              mode: "insensitive",
            }
          : undefined,
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`getProductsCount: ${count} products in database`);
    }

    return count;
  } catch (error) {
    console.error("❌ خطأ أثناء جلب عدد المنتجات:", error);
    throw error;
  }
}

/**
 * جلب المنتجات الأكثر مبيعًا بناءً على عدد الطلبات
 * @param limit - الحد الأقصى لعدد المنتجات (اختياري)
 * @returns قائمة المنتجات الأكثر مبيعًا
 * @throws خطأ إذا فشل الجلب
 */
export async function getBestSellers(limit?: number): Promise<ProductWithRelations[]> {
  try {
    const products = await db.product.findMany({
      where: {
        orders: {
          some: {},
        },
      },
      orderBy: {
        orders: {
          _count: "desc",
        },
      },
      include: {
        category: true,
        sizes: true,
        extras: true,
      },
      take: limit,
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`getBestSellers fetched ${products.length} products`);
    }

    return products;
  } catch (error) {
    console.error("❌ خطأ أثناء جلب المنتجات الأكثر مبيعًا:", error);
    throw error;
  }
}

/**
 * 
 * جلب جميع الفئات مع المنتجات المرتبطة بها
 * @returns قائمة الفئات مع منتجاتها
 * @throws خطأ إذا فشل الجلب
 */
export async function getProductsByCategory(): Promise<CategoryWithProducts[]> {
  try {
    const categories = await db.category.findMany({
      include: {
        products: {
          include: {
            category: true,
            sizes: true,
            extras: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`getProductsByCategory fetched ${categories.length} categories`);
    }

    return categories;
  } catch (error) {
    console.error("❌ خطأ أثناء جلب الفئات مع المنتجات:", error);
    throw error;
  }
}

/**
 * جلب المنتجات حسب معرف الفئة مع دعم الفلترة والتجزئة
 * @param categoryId - معرف الفئة
 * @param options - خيارات الفلترة والترتيب والصفحة
 * @returns قائمة المنتجات في الفئة
 * @throws خطأ إذا فشل الجلب
 */
export async function getProductsByCategoryId(
  categoryId: string,
  options: GetProductsOptions = {}
): Promise<ProductWithRelations[]> {
  try {
    const {
      page = 1,
      limit = 0, // 0 يعني جلب جميع المنتجات
      search,
      sortBy = "name",
      order = "asc",
    } = options;

    const skip = limit > 0 ? (page - 1) * limit : 0;

    const products = await db.product.findMany({
      where: {
        categoryId,
        name: search
          ? {
              contains: search,
              mode: "insensitive",
            }
          : undefined,
      },
      include: {
        category: true,
        sizes: true,
        extras: true,
      },
      orderBy: {
        [sortBy]: order,
      },
      skip,
      take: limit > 0 ? limit : undefined, // إزالة القيد إذا كان limit = 0
    });

    if (process.env.NODE_ENV === "development") {
      console.log(
        `getProductsByCategoryId fetched ${products.length} products for category ${categoryId}`
      );
    }

    return products;
  } catch (error) {
    console.error("❌ خطأ أثناء جلب المنتجات حسب الفئة:", error);
    throw error;
  }
}