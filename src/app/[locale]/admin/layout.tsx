"use server";

import { Locale } from "@/i18n.config";
import getTrans from "@/lib/translation";
import { authOptions } from "@/server/auth";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";
import AdminTabs from "./_components/AdminTabs";

// تعريف نوع الترجمات
interface Translations {
  footer?: {
    copyright?: string;
    privacy?: string;
    terms?: string;
  };
  error?: string;
}

// دالة مساعدة للتحقق من صلاحيات الإدارة
async function ensureAdminAccess(locale: Locale) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect(`/${locale}/auth/login`);
  }
  return session;
}

export default async function AdminLayout({
  params,
  children,
}: {
  params: Promise<{ locale: Locale }>;
  children: React.ReactNode;
}) {
  const { locale } = await params;

  // التحقق من صلاحيات الإدارة
  await ensureAdminAccess(locale);

  // جلب الترجمات مع معالجة الأخطاء
  let translations: Translations;
  try {
    translations = await getTrans(locale);
  } catch (error) {
    console.error("Failed to load translations:", error);
    translations = { error: "Translation unavailable" };
  }

  // التحقق من وجود ترجمة التذييل
  const footerTranslations = translations.footer ?? {
    copyright: "All rights reserved",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* الهيدر */}
      <header className="bg-black shadow-sm border-b border-indigo-700/50">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <AdminTabs translations={translations} />
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-grow container max-w-7xl mx-auto px-4 py-8 text-indigo-200">
        {children}
      </main>

      {/* التذييل */}
      {/* <footer
        className={clsx(
          "bg-indigo-950 dark:bg-gray-900",
          "border-t border-indigo-700 dark:border-indigo-200/50",
          "py-8 text-center",
          "text-indigo-700 dark:text-indigo-200",
          "text-sm font-medium"
        )}
        aria-label="Site footer"
      >
        <div className="container max-w-7xl mx-auto px-4">
          <p className="mb-4">
            © {new Date().getFullYear()} {footerTranslations.copyright}
          </p>
          <div className="flex justify-center gap-6">
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
          </div>
        </div>
      </footer> */}
    </div>
  );
}

