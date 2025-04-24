import EditUserForm from "@/components/edit-user-form";
import { Pages, Routes } from "@/constants/enums";
import { Locale } from "@/i18n.config";
import getTrans from "@/lib/translation";
import { authOptions } from "@/server/auth";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import clsx from "clsx";
// import { db } from "@/lib/prisma";
import { JSX } from "react";

/**
 * جلب بيانات الطلبات من الخادم باستخدام Prisma.
 * @returns Promise<{ amount: number; numberOfOrders: number }> - إجمالي المبلغ وعدد الطلبات
 */
// async function getServerData() {
//   try {
//     const data = await db.order.aggregate({
//       _sum: { pricePaidInCents: true },
//       _count: true,
//     });

//     return {
//       amount: (data._sum.pricePaidInCents || 0) / 100,
//       numberOfOrders: data._count,
//     };
//   } catch (error) {
//     console.error("Failed to fetch server data:", error);
//     return {
//       amount: 0,
//       numberOfOrders: 0,
//     };
//   }
// }

/**
 * مكون AdminPage لعرض لوحة تحكم المشرف.
 * يضمن أن يكون المستخدم مشرفًا مسجلاً، ويعيد التوجيه إذا لم يكن كذلك.
 * يعرض بيانات الطلبات ونموذج تعديل المستخدم.
 * @param params - كائن يحتوي على locale كـ Promise
 * @returns Promise<JSX.Element> - الصفحة المُنشأة للمشرف
 */

async function AdminPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<JSX.Element> {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  // إعادة التوجيه إذا لم يكن هناك جلسة
  if (!session?.user) {
    redirect(`/${locale}/${Routes.AUTH}/${Pages.LOGIN}`);
  }

  // إعادة التوجيه إذا لم يكن المستخدم مشرفًا
  if (session.user.role !== UserRole.ADMIN) {
    redirect(`/${locale}/${Routes.PROFILE}`);
  }

  const translations = await getTrans(locale);
  // const serverData = await getServerData();

  // التحقق من وجود الترجمات
  if (!translations?.stores?.Navbars) {
    console.error("Failed to load translations for AdminPage:", {
      locale,
      availableTranslations: translations,
      timestamp: new Date().toISOString(),
    });
    return (
      <main
        className={clsx(
          "min-h-screen bg-gray-100 dark:bg-gray-950",
          "flex items-center justify-center p-6"
        )}
      >
        <div
          className={clsx(
            "bg-red-50 dark:bg-red-900/20",
            "p-6 rounded-xl shadow-md border border-red-200 dark:border-red-800",
            "text-red-600 dark:text-red-400 text-center font-semibold text-lg",
            "supports-[backdrop-filter]:bg-red-50/80 supports-[backdrop-filter]:dark:bg-red-900/60",
            "supports-[backdrop-filter]:backdrop-blur-md"
          )}
        >
          {translations?.stores?.Navbars?.error || "Error: Unable to load translations"}
        </div>
      </main>
    );
  }

  return (
    <main
      className={clsx(
        "min-h-screen bg-black dark:bg-indigo-700",
        "flex flex-col items-center py-12 px-4"
      )}
    >
      <section
        className={clsx(
          "w-full max-w-4xl p-6 lg:p-8",
          "bg-text-indigo-700 dark:bg-indigo-700",
          "rounded-xl shadow-lg dark:shadow-indigo-700",
          "border border-indigo-700 dark:border-indigo-700",
          "supports-[backdrop-filter]:bg-black supports-[backdrop-filter]:dark:bg-indigo-700",
          "supports-[backdrop-filter]:backdrop-blur-md"
        )}
      >
        <div className="container mx-auto dark:bg-indigo-700">
          {/* العنوان */}
          <h1
            className={clsx(
              "text-2xl lg:text-3xl font-bold text-indigo-700 dark:text-black ",
              "mb-6 lg:mb-8 text-center "
            )}
          >
            {translations.stores.Navbars.admin || "Admin Dashboard"}
          </h1>



          {/* نموذج تعديل المستخدم */}
          <EditUserForm user={session.user} translations={translations} />
        </div>
      </section>
    </main>
  );
}

export default AdminPage;