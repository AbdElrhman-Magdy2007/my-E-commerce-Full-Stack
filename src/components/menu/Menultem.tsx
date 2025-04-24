
"use client";

import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";
import { ProductWithRelations } from "@/types/product";
import AddToCartButton from "./AddToCartButton";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useMemo } from "react";
import clsx from "clsx";

// تعريف الـ Props مع إضافة isLoading
interface MenuItemProps {
  item: ProductWithRelations;
  isLoading?: boolean;
}

// تحسين السكيلتون مع ألوان indigo/black
function MenuItemSkeleton() {
  return (
    <li className="bg-black p-4 sm:p-6 rounded-xl shadow-md border border-indigo-800">
      <Skeleton height={192} className="rounded-md mb-4" baseColor="#1e1b4b" highlightColor="#312e81" />
      <div className="text-center space-y-3">
        <Skeleton width="60%" height={24} className="mx-auto" baseColor="#1e1b4b" highlightColor="#312e81" />
        <Skeleton width="80%" height={16} count={2} className="mx-auto" baseColor="#1e1b4b" highlightColor="#312e81" />
        <Skeleton width="40%" height={20} className="mx-auto" baseColor="#1e1b4b" highlightColor="#312e81" />
      </div>
      <Skeleton height={48} className="mt-6 rounded-xl" baseColor="#1e1b4b" highlightColor="#312e81" />
    </li>
  );
}

function MenuItem({ item, isLoading = false }: MenuItemProps) {
  // استخدام useMemo لتجنب إعادة حساب categoryName
  const categoryName = useMemo(
    () =>
      typeof item.categoryId === "object" && item.categoryId?.name
        ? item.categoryId.name
        : "غير مصنف",
    [item.categoryId]
  );

  // إذا كان في حالة التحميل، اعرض السكيلتون
  if (isLoading) {
    return <MenuItemSkeleton />;
  }

  return (
    <li
      className={clsx(
        "bg-black p-4 sm:p-6 rounded-xl shadow-md border border-indigo-800",
        "hover:shadow-lg transition-all duration-300 ease-in-out",
        "focus-within:ring-2 focus-within:ring-indigo-600"
      )}
      tabIndex={0}
      aria-label={`Menu item: ${item.name} in ${categoryName} category`}
    >
      <div className="relative w-full h-48 sm:h-64 mb-4">
        <Image
          src={item.image}
          alt={`${item.name} - ${categoryName}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="rounded-md object-cover transition-transform duration-500 hover:scale-105"
          priority={false}
          loading="lazy"
        />
      </div>
      <div className="text-center space-y-3">
        <h4 className="text-lg sm:text-xl font-semibold text-indigo-700">
          {item.name}
        </h4>
        <p className="text-indigo-700 text-sm sm:text-base line-clamp-2">
          {item.description}
        </p>
        <strong className="text-base sm:text-lg text-indigo-700 font-bold block">
          {formatCurrency(item.basePrice)}
        </strong>
      </div>
      <div className="mt-6">
        <AddToCartButton item={item} />
      </div>
    </li>
  );
}

export default MenuItem;
