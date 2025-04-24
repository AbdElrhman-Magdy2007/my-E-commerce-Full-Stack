"use server";

import { Locale } from "@/i18n.config";
import getTrans from "@/lib/translation";
import clsx from "clsx";
import Link from "next/link";

// تعريف نوع الترجمات
interface FooterTranslations {
  copyright?: string;
  privacy?: string;
  terms?: string;
}

interface FooterProps {
  locale: Locale;
}

export default async function Footer({ locale }: FooterProps) {
  // جلب الترجمات مع معالجة الأخطاء
  let translations: { footer?: FooterTranslations } = {};
  try {
    translations = await getTrans(locale);
  } catch (error) {
    console.error("Failed to load footer translations:", error);
  }

  // ترجمات افتراضية
  const footerTranslations: FooterTranslations = translations.footer ?? {
    copyright: "All rights reserved",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
  };

  return (
    <footer
      className={clsx(
        "bg-indigo-950 dark:bg-gray-900",
        "border-t border-indigo-700 dark:border-indigo-200/50",
        "py-6 sm:py-8 text-center",
        "text-indigo-700 dark:text-indigo-200",
        "text-sm font-medium"
      )}
      aria-label="Site footer"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <p className="mb-3 sm:mb-4">
          © {new Date().getFullYear()} {footerTranslations.copyright}
        </p>
        {/* <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
          <Link
            href={`/${locale}/privacy`}
            className={clsx(
              "text-indigo-600 dark:text-indigo-300",
              "hover:text-indigo-900 dark:hover:text-indigo-100",
              "transition-colors duration-300"
            )}
          >
            {footerTranslations.privacy}
          </Link>
          <Link
            href={`/${locale}/terms`}
            className={clsx(
              "text-indigo-600 dark:text-indigo-300",
              "hover:text-indigo-900 dark:hover:text-indigo-100",
              "transition-colors duration-300"
            )}
          >
            {footerTranslations.terms}
          </Link>
        </div> */}
      </div>
    </footer>
  );
}