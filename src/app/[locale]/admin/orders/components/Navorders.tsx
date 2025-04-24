
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Routes, Pages } from "@/constants/enums";
import { Translations } from "@/types/translations";
import clsx from "clsx";
import { buttonVariants } from "@/components/ui/button";

interface NavLinkItem {
  title: string;
  href: string;
}

/**
 * مكون Navorders لعرض شريط تنقل احترافي مخصص لصفحات الطلبات الإدارية.
 * يسلط الضوء على الصفحة الحالية بناءً على المسار الحالي، مع تصميم متجاوب لجميع الشاشات.
 */
export default function Navorders({
  translations,
  locale = "en",
}: {
  translations: Translations;
  locale?: string;
}) {
  const pathname = usePathname() || "";

  // تعريف الروابط
  const links: NavLinkItem[] = [
    {
      title: translations.admin?.dashboard || "Dashboard",
      href: `/${locale}/${Routes.ADMIN}/${Pages.ORDERS}/${Pages.DASHBOARD}`,
    },
    {
      title: translations.admin?.tabs?.customers || "Customers",
      href: `/${locale}/${Routes.ADMIN}/${Pages.ORDERS}/${Pages.CUSTOMERS}`,
    },
    {
      title: translations.admin?.tabs?.sales || "Sales",
      href: `/${locale}/${Routes.ADMIN}/${Pages.ORDERS}/${Pages.SALES}`,
    },
  ];

  const isActiveTab = (href: string) => pathname.startsWith(href);

  return (
    <nav
      className={clsx(
        "dark:bg-indigo-800",
        "shadow-md dark:shadow-indigo-900",
        "sticky top-0 z-50",
        "px-2 sm:px-4 lg:px-8 py-3 sm:py-4",
        "flex items-center justify-center"
      )}
    >
      <div
        className={clsx(
          "flex flex-wrap justify-center gap-2 sm:gap-4 lg:gap-6",
          "w-full max-w-7xl"
        )}
      >
        {links.map((link) => {
          const active = isActiveTab(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                buttonVariants({
                  variant: active ? "default" : "outline",
                  size: "default",
                }),
                "relative px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-2",
                "text-sm sm:text-sm lg:text-base font-medium",
                "rounded-lg transition-all duration-200",
                active
                  ? "bg-indigo-700 text-indigo-600 hover:bg-indigo-800 border-indigo-600"
                  : "bg-transparent text-indigo-700 hover:bg-indigo-600 dark:bg-transparent dark:text-indigo-700 dark:hover:bg-indigo-900/50 border-indigo-700 dark:border-indigo-600",
                "group focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              )}
            >
              <span className="relative z-10">{link.title}</span>
              {!active && (
                <span
                  className={clsx(
                    "absolute inset-0 bg-indigo-700 dark:bg-indigo-700",
                    "rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200"
                  )}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
