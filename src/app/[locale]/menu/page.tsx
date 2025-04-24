/* eslint-disable react/jsx-no-undef */
import { Locale } from "@/i18n.config";
import getTrans from "@/lib/translation";
import { getProductsByCategory } from "@/server/db/products";
import Menu from "@/components/menu";
import clsx from "clsx";
import { Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import Image from "next/image";

// تعريف الـ Props
interface MenuPageProps {
  params: { locale: Locale };
}

/**
 * صفحة القائمة التي تعرض الفئات ومنتجاتها بناءً على اللغة
 * @param params - معلمات المسار تحتوي على اللغة (locale)
 */
export default async function MenuPage({ params }: MenuPageProps) {
  const { locale } = params;

  console.time("fetching"); // إضافة لحساب وقت تحميل البيانات
  const translations = await getTrans(locale);
  const categories = await getProductsByCategory();
  console.timeEnd("fetching"); // طباعة الوقت الذي استغرقته العملية

  return (
    <main
      className={clsx(
        "container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-black min-h-screen",
        "text-indigo-700"
      )}
      role="main"
      aria-label="Menu page"
    >
      {/* عنوان رئيسي للصفحة */}
      <header className="text-center mb-10 sm:mb-12">
        <h1
          className={clsx(
            "text-3xl sm:text-4xl lg:text-5xl font-bold text-indigo-700 mb-3 sm:mb-4",
            "animate-fadeIn"
          )}
        >
          {translations.menu?.title || "Our Menu"}
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-indigo-700 max-w-2xl mx-auto">
          {translations.menu?.description || "Explore our delicious offerings!"}
        </p>
      </header>

      {/* عرض الفئات والمنتجات */}
      <Suspense fallback={<MenuSkeleton />}>
        {categories.length > 0 ? (
          <div className="space-y-12 sm:space-y-16">
            {categories.map((category) => (
              <section
                key={category.id}
                className="animate-fadeInUp"
                aria-labelledby={`category-${category.id}`}
              >
                <div className="container text-center">
                  <h2
                    id={`category-${category.id}`}
                    className={clsx(
                      "text-2xl sm:text-3xl font-bold text-indigo-700 italic mb-4 sm:mb-6",
                      "border-b-2 border-indigo-600 pb-2 sm:pb-3"
                    )}
                  >
                    <div className="relative flex flex-col items-center p-4 sm:p-6">
                      {category.image && (
                        <div className="relative w-72 h-28 sm:w-64 sm:h-24 lg:w-92 lg:h-40 mb-4">
                          <Image
                            src={category.image}
                            alt={`صورة فئة ${category.name}`}
                            fill
                            className="object-cover rounded-lg border-2 border-indigo-900 transition-transform duration-300 hover:scale-105"
                            sizes="(max-width: 640px) 192px, (max-width: 1024px) 256px, 384px"
                            priority={false}
                            quality={75}
                            loading="lazy"
                          />
                        </div>
                      )}
                      {category.name}
                    </div>
                  </h2>
                  <Menu items={category.products} />
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div
            className={clsx(
              "flex flex-col items-center justify-center py-16 sm:py-20",
              "bg-black rounded-xl border border-indigo-800 shadow-md"
            )}
            role="alert"
            aria-label="No products available"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-indigo-700 mb-2">
              {translations.noProductsFound || "No products found"}
            </h3>
            <p className="text-sm sm:text-base text-indigo-700 max-w-md text-center">
              {translations.noProductsMessage ||
                "It looks like we don't have any products available right now. Check back later!"}
            </p>
          </div>
        )}
      </Suspense>
    </main>
  );
}

// كومبوننت السكيلتون لتحميل الصفحة
function MenuSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-10 sm:mb-12">
        <Skeleton
          height={40}
          width="40%"
          className="mx-auto mb-4"
          baseColor="#1e1b4b"
          highlightColor="#312e81"
        />
        <Skeleton
          height={20}
          width="60%"
          className="mx-auto"
          baseColor="#1e1b4b"
          highlightColor="#312e81"
        />
      </div>
      <div className="space-y-12 sm:space-y-16">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <section key={index}>
              <div className="text-center">
                <Skeleton
                  height={128}
                  width={384}
                  className="mx-auto mb-4 rounded-lg"
                  baseColor="#1e1b4b"
                  highlightColor="#312e81"
                />
                <Skeleton
                  height={36}
                  width="30%"
                  className="mx-auto mb-6"
                  baseColor="#1e1b4b"
                  highlightColor="#312e81"
                />
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
