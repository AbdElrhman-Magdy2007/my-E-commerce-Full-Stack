"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@prisma/client";
import { Translations } from "@/types/translations";
import { Label } from "@/components/ui/Label";
import { Languages } from "@/constants/enums";
import { useParams } from "next/navigation";

function SelectCategory({
  categories,
  categoryId,
  setCategoryId,
  translations,
  className,
}: {
  categories: Category[];
  categoryId: string;
  translations: Translations;
  setCategoryId: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
}) {
  const currentItem = categories.find((item) => item.id === categoryId);
  const { locale } = useParams();

  return (
    <div className={`space-y-2 ${className}`}>
      {/* العنوان */}
      <Label
        htmlFor="categoryId"
        className="text-indigo-600 text-base font-medium capitalize block"
      >
        {translations.category || "Category"}
      </Label>

      {/* القائمة المنسدلة */}
      <Select
        name="categoryId"
        onValueChange={(value: React.SetStateAction<string>) => setCategoryId(value)}
        defaultValue={categoryId}
      >
        <SelectTrigger
          className={`w-full max-w-xs h-12 bg-black border border-indigo-600 text-indigo-600 rounded-lg shadow-sm hover:shadow-md focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-200 ${
            locale === Languages.ARABIC ? "flex-row-reverse text-right" : "flex-row text-left"
          }`}
        >
          <SelectValue placeholder={translations.noCategoriesFound || "No categories found"}>
            {currentItem?.name || translations.noCategoriesFound || "No categories found"}
          </SelectValue>
        </SelectTrigger>

        <SelectContent className="bg-black border border-indigo-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <SelectGroup className="text-indigo-600">
            {categories.length > 0 ? (
              categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id}
                  className="px-4 py-2 hover:bg-indigo-800 hover:text-indigo-600 focus:bg-indigo-800 focus:text-black transition-colors duration-150 cursor-pointer"
                >
                  {category.name}
                </SelectItem>
              ))
            ) : (
              <div className="px-4 py-2 text-indigo-600 italic">
                {translations.noCategoriesFound || "No categories found"}
              </div>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default SelectCategory;