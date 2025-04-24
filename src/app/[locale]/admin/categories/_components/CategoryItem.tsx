import { Category } from "@prisma/client";
import EditCategory from "./EditCategory";
import DeleteCategory from "./DeleteCategory";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import getTrans from "@/lib/translation";
import Image from "next/image";

async function CategoryItem({
  category,
  translations,
}: {
  category: Category;
  translations: any; // لو ممكن، عرفي نوع Translations
}) {
  const locale = await getCurrentLocale();
  const trans = await getTrans(locale);

  return (
    <li className="bg-indigo-800 p-4 rounded-md flex items-center gap-4">
      <div className="flex-shrink-0">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            width={64}
            height={64}
            className="rounded-full object-cover border-2 border-indigo-600"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-indigo-600">
            <span className="text-indigo-700 font-medium">
              {category.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <h3 className="text-indigo-100 font-medium text-lg flex-1">
        {category.name}
      </h3>
      <div className="flex items-center gap-2">
        <EditCategory translations={translations || trans} category={category} />
        <DeleteCategory id={category.id} />
      </div>
    </li>
  );
}

export default CategoryItem;