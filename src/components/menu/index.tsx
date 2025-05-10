"use client";

import MenuItem from "./MenuItem";
import { ProductWithRelations } from "@/types/product";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useMemo } from "react";
import clsx from "clsx";

// تعريف الـ Props
interface MenuProps {
  items: ProductWithRelations[];
  isLoading?: boolean;
}

// تحسين السكيلتون ليعكس تصميم MenuItem بدقة
function MenuSkeleton() {
  return (
    <ul
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      role="list"
      aria-label="Loading menu items"
    >
      {Array(6)
        .fill(0)
        .map((_, index) => (
          <li key={index} className="p-4 sm:p-6">
            <Skeleton
              height={192}
              className="rounded-md mb-4"
              baseColor="#1e1b4b"
              highlightColor="#312e81"
            />
            <div className="space-y-3 text-center">
              <Skeleton
                width="60%"
                height={24}
                className="mx-auto"
                baseColor="#1e1b4b"
                highlightColor="#312e81"
              />
              <Skeleton
                width="80%"
                height={16}
                count={2}
                className="mx-auto"
                baseColor="#1e1b4b"
                highlightColor="#312e81"
              />
              <Skeleton
                width="40%"
                height={20}
                className="mx-auto"
                baseColor="#1e1b4b"
                highlightColor="#312e81"
              />
              <Skeleton
                height={48}
                className="mt-4 rounded-xl"
                baseColor="#1e1b4b"
                highlightColor="#312e81"
              />
            </div>
          </li>
        ))}
    </ul>
  );
}

function Menu({ items, isLoading = false }: MenuProps) {
  // استخدام useMemo لتجنب إعادة رندر العناصر
  const memoizedItems = useMemo(() => items, [items]);

  // حالة التحميل
  if (isLoading) {
    return <MenuSkeleton />;
  }

  // حالة البيانات الفعلية
  return memoizedItems.length > 0 ? (
    <ul
      className={clsx(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        "gap-4 sm:gap-6"
      )}
      role="list"
      aria-label="Menu items list"
    >
      {memoizedItems.map((item) => (
        <MenuItem key={item.id} item={item} />
      ))}
    </ul>
  ) : (
    <div
      className="flex flex-col items-center justify-center py-16 bg-black rounded-xl border border-indigo-800"
      role="alert"
      aria-label="No menu items available"
    >
      <h2 className="text-2xl sm:text-3xl font-semibold text-indigo-700">
        لا توجد عناصر متاحة
      </h2>
      <p className="mt-2 text-sm sm:text-base text-indigo-700">
        يبدو أن القائمة فارغة حاليًا. تحقق لاحقًا!
      </p>
    </div>
  );
}

export default Menu;
