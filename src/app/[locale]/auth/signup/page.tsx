import { buttonVariants } from "@/components/ui/button";
import { Pages, Routes } from "@/constants/enums";
import Link from "next/link";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import getTrans from "@/lib/translation";
import Form from "./_components/Form";
import clsx from "clsx";

async function SignupPage() {
  const locale = await getCurrentLocale();
  const translations = await getTrans(locale);

  // التحقق من وجود ترجمات لصفحة التسجيل
  if (!translations?.auth?.register) {
    console.error("Failed to load signup translations", {
      locale,
      availableTranslations: translations,
      timestamp: new Date().toISOString(),
    });
    return (
      <main className="flex items-center justify-center h-screen bg-indigo-700 dark:bg-gray-950">
        <div className="w-full max-w-md p-6 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-md border border-red-200 dark:border-red-800">
          <p className="text-center text-red-600 dark:text-red-400 font-semibold">
            {translations?.auth?.error || "Error: Unable to load signup page"}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={clsx(
        "flex items-center justify-center min-h-screen",
        "bg-black dark:bg-gray-950",
        "transition-all duration-300 ease-in-out",
        "lg:mt-[91px] p-10" // الإضافة هنا: margin-top: 50px للشاشات الكبيرة (≥1024px)
      )}
    >
      <div
        className={clsx(
          "w-full max-w-md p-4 lg:p-8",
          "bg-indigo-900 dark:bg-gray-900",
          "rounded-xl shadow-lg dark:shadow-indigo-900",
          "border border-indigo-900 dark:border-indigo-900",
          "supports-[backdrop-filter]:bg-black supports-[backdrop-filter]:dark:bg-gray-900/95",
          "supports-[backdrop-filter]:backdrop-blur-md"
        )}
      >
        {/* عنوان الصفحة */}
        <h2
          className={clsx(
            "text-2xl lg:text-3xl font-bold text-indigo-900 dark:text-indigo-900",
            "mb-6 lg:mb-8 text-center"
          )}
        >
          {translations.auth.register.title || "Create an Account"}
        </h2>

        {/* نموذج التسجيل */}
        <Form translations={translations} />

        {/* رابط تسجيل الدخول */}
        <p
          className={clsx(
            "text-center text-indigo-900 dark:text-indigo-900 text-sm mt-6",
            "flex items-center justify-center gap-2"
          )}
        >
          {translations.auth.register.haveAccount || "Already have an account?"}
          <Link
            href={`/${locale}/${Routes.AUTH}/${Pages.LOGIN}`}
            className={clsx(
              buttonVariants({ variant: "link", size: "sm" }),
              "!text-indigo-900 dark:!text-indigo-900 hover:underline",
              "font-medium transition-colors duration-200"
            )}
          >
            {translations.auth.register.signIn || "Sign In"}
          </Link>
        </p>
      </div>
    </main>
  );
}

export default SignupPage;