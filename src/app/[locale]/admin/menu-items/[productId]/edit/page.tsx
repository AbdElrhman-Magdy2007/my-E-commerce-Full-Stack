"use server";

import { Locale } from "@/i18n.config";
import { getProducts } from "@/server/db/products";
import { getCategories } from "@/server/db/categories";
import getTrans from "@/lib/translation";
import Form from "../../_components/Form";
import { db } from "@/lib/prisma";

// توليد المسارات الثابتة لكل منتج
export async function generateStaticParams() {
  try {
    const products = await getProducts();
    if (!products || products.length === 0) {
      return [];
    }
    return products.map((product) => ({ productId: product.id }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// دالة لجلب منتج بناءً على المعرف
async function getProduct(productId: string) {
  try {
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { sizes: true, extras: true, category: true, orders: true },
    });
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: Locale; productId: string }>;
}) {
  const { productId, locale } = await params;
  const translations = await getTrans(locale);

  // جلب المنتج والفئات
  const product = await getProduct(productId);
  const categories = await getCategories();

  // حالة عدم وجود المنتج
  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <section className="w-full max-w-md">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {translations.admin.tabs.menuItems || "Menu Items"}
            </h1>
            <p className="text-red-600 text-lg font-medium">
              {translations.messages.productNotFound || "Product not found"}
            </p>
            <a
              href={`/${locale}/admin/menu-items`}
              className="mt-6 inline-block text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              {translations.cancel || "Back to Menu Items"}
            </a>
          </div>
        </section>
      </main>
    );
  }

  // حالة عدم وجود فئات
  if (!categories || categories.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <section className="w-full max-w-md">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {translations.admin.tabs.menuItems || "Menu Items"}
            </h1>
            <p className="text-red-600 text-lg font-medium">
              {translations.noCategoriesFound || "No categories found"}
            </p>
            <a
              href={`/${locale}/admin/categories`}
              className="mt-6 inline-block text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              {translations.admin.tabs.categories || "Go to Categories"}
            </a>
          </div>
        </section>
      </main>
    );
  }

  // عرض صفحة تعديل المنتج
  return (
    <main className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <section className="max-w-5xl mx-auto">
        <div className="bg-black p-8 rounded-xl shadow-md">
          <h1 className="text-3xl font-bold text-indigo-600 mb-6 border-b border-indigo-600 pb-4">
            {translations.admin.menuItems.createNewMenuItem || "Edit Product"}
          </h1>
          <div className="mt-6 ">
            <Form
              product={product}
              categories={categories}
              translations={translations}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default EditProductPage;