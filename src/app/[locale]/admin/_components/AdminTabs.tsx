"use client"; // إضافة "use client" لأن المكون يعتمد على ميزات العميل

import Link from "@/components/link";
import { buttonVariants } from "@/components/ui/button";
import { Pages, Routes } from "@/constants/enums";
import { Translations } from "@/types/translations";
import { useParams, usePathname } from "next/navigation";
import { memo } from "react";
import clsx from "clsx";

// تعريف نوع لعناصر التبويب
interface AdminTab {
  id: string;
  title: string;
  href: string;
}

/**
 * مكون AdminTabs لعرض تبويبات الإدارة بشكل متجاوب مع دعم التنقل والترجمة.
 * يعتمد على المسار الحالي لتحديد التبويب النشط.
 * @param translations - كائن الترجمات المستخدم في التبويبات
 */
const AdminTabs = memo(({ translations }: { translations: Translations }) => {
  const pathname = usePathname();
  const params = useParams();
  const locale = params?.locale as string;

  // دالة مساعدة لتوليد معرف فريد في جانب العميل
  const generateUniqueId = () => {
    return "tab-" + Math.random().toString(36).substr(2, 9);
  };

  // تعريف التبويبات
  const tabs: AdminTab[] = [
    {
      id: generateUniqueId(),
      title: translations.admin?.tabs?.profile || "Profile",
      href: `${Routes.ADMIN}`,
    },
    {
      id: generateUniqueId(),
      title: translations.admin?.tabs?.categories || "Categories",
      href: `${Routes.ADMIN}/${Pages.CATEGORIES}`,
    },
    // {
    //   id: generateUniqueId(),
    //   title: translations.admin?.tabs?.products || "Products",
    //   href: `${Routes.ADMIN}/${Pages.PRODUCTS}`,
    // },

    {
      id: generateUniqueId(),
      title: translations.admin?.tabs?.menuItems || "Menu Items",
      href: `${Routes.ADMIN}/${Pages.MENU_ITEMS}`,
    },
    {
      id: generateUniqueId(),
      title: translations.admin?.tabs?.users || "Users",
      href: `${Routes.ADMIN}/${Pages.USERS}`,
    },
    {
      id: generateUniqueId(),
      title: translations.admin?.tabs?.orders || "Orders",
      href: `${Routes.ADMIN}/${Pages.ORDERS}`,
    },
  ];

  // دالة لتحديد ما إذا كان التبويب نشطًا بناءً على المسار
  const isActiveTab = (href: string) => {
    const fullHref = `/${locale}/${href}`;
    return href === Routes.ADMIN
      ? pathname === fullHref
      : pathname.startsWith(fullHref);
  };

  return (
    <nav
      className="mt-[90px] px-4 sm:px-6 lg:px-8 bg-black shadow-sm dark:bg-indigo-800 dark:shadow-indigo-800"
      // ^^^ الإضافة هنا: mt-[50px] لتطبيق margin-top: 50px على جميع الشاشات
    >
      <ul
        className="flex items-center flex-wrap gap-6 justify-center max-w-6xl mx-auto py-4"
        role="tablist"
      >
        {tabs.map((tab) => {
          const active = isActiveTab(tab.href);
          return (
            <li key={tab.id} role="presentation">
              <Link
                href={`/${locale}/${tab.href}`}
                className={clsx(
                  buttonVariants({
                    variant: active ? "default" : "outline",
                    size: "lg",
                  }),
                  "relative px-6 py-3 text-base font-semibold tracking-wide transition-all duration-200 ease-in-out bg-black border-indigo-700",
                  active
                    ? "text-indigo-800 bg-indigo-700 hover:bg-black dark:bg-black dark:hover:bg-indigo-700 border border-indigo-700 dark:border-indigo-700"
                    : "text-indigo-800 hover:text-black hover:bg-indigo-800 dark:text-indigo-800 dark:hover:bg-indigo-800  dark:hover:text-indigo-700 border border-indigo-600 dark:border-indigo-800",
                  "group" // لتفعيل تأثيرات hover على العناصر الفرعية
                )}
                aria-selected={active}
                role="tab"
              >
                <span className="relative z-10">{tab.title}</span>
                {/* تأثير خلفية ديناميكي عند التمرير */}
                {!active && (
                  <span
                    className="absolute inset-0 bg-indigo-800 dark:bg-indigo-800 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 ease-in-out pointer-events-none"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
});

AdminTabs.displayName = "AdminTabs";

export default AdminTabs;