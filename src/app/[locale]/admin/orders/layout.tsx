"use server";

import { Locale } from "@/i18n.config";
import getTrans from "@/lib/translation";
import Navorders from "./components/Navorders"; // تأكد من المسار الصحيح
import { authOptions } from "@/server/auth";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import clsx from "clsx";

export default async function AdminLayout({
  params,
  children,
}: {
  params: Promise<{ locale: Locale }>;
  children: React.ReactNode;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect(`/${locale}/auth/login`);
  }

  const translations = await getTrans(locale);

  return (
    <div
      className={clsx(
        "min-h-screen bg-black dark:bg-gray-900",
        "flex flex-col"
      )}
    >
      <header className="bg-black dark:bg-gray-800 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Navorders translations={translations} locale={locale} />
        </div>
      </header>
      <main
        className={clsx(
          "container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",
          "flex-grow flex flex-col items-center"
        )}
      >
        {children}
      </main>
      {/* <footer
        className={clsx(
          "bg-black dark:bg-gray-800",
          "border-t border-indigo-900 dark:border-gray-700/50",
          "py-6 text-center text-indigo-600 dark:text-gray-400 text-sm"
        )}
      >
        © {new Date().getFullYear()} {translations.footer?.copyright || "All rights reserved"}
      </footer> */}
    </div>
  );
}