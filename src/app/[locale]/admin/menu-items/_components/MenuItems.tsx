"use server";

import Link from "@/components/link";
import { Pages, Routes } from "@/constants/enums";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import getTrans from "@/lib/translation";
import { Product } from "@prisma/client";
import Image from "next/image";

// تعريف واجهة للترجمات لتجنب الوصول غير الآمن
interface Translations {
  admin?: {
    menuItems?: {
      edit?: string;
    };
  };
  noProductsFound?: string;
}

// واجهة Props مع تعريف صريح
interface MenuItemsProps {
  products: Product[];
}

export default async function MenuItems({ products }: MenuItemsProps) {
  // جلب اللغة الحالية
  const locale = await getCurrentLocale();

  // جلب الترجمات مع معالجة الأخطاء
  let translations: Translations = {};
  try {
    translations = await getTrans(locale);
  } catch (error) {
    console.error("Failed to fetch translations:", error);
  }

  // تسجيل عدد المنتجات لتصحيح الأخطاء (في وضع التطوير فقط)
  if (process.env.NODE_ENV === "development") {
    console.log(`MenuItems received ${products?.length || 0} products:`, products);
  }

  // التحقق من صحة البيانات
  if (!products || !Array.isArray(products)) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
        <p className="text-lg font-medium text-red-600">
          {translations.noProductsFound || "Error: Invalid products data"}
        </p>
      </div>
    );
  }

  // عرض رسالة إذا كانت القائمة فارغة
  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
        <p className="text-lg font-medium text-gray-500">
          {translations.noProductsFound || "No products found"}
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {products.map((product) => (
        <li
          key={product.id}
          className="group bg-black rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-indigo-700 hover:border-indigo-500"
        >
          <Link
            href={`/${locale}/${Routes.ADMIN}/${Pages.MENU_ITEMS}/${product.id}/${Pages.EDIT}`}
            className="flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative w-36 h-36 mb-4">
              <Image
                src={product.image || "/default-product-image.png"}
                alt={product.name || "Product image"}
                width={144}
                height={144}
                className="rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy" // تحميل كسول لتحسين الأداء
                placeholder="blur"
                blurDataURL="/placeholder-image.png"
              />
            </div>
            <h3 className="text-xl font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors duration-200 truncate max-w-full">
              {product.name}
            </h3>
            <span className="mt-2 text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {translations.admin?.menuItems?.edit || "Edit"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}