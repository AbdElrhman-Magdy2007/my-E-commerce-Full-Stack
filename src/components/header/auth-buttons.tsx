"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { usePathname, useParams, useRouter } from "next/navigation";
import { Pages, Routes } from "@/constants/enums";
import clsx from "clsx";

interface NavbarTranslations {
  Login: string;
  signOut: string;
  signUp?: string;
  [key: string]: string | undefined;
}

interface AuthButtonsProps {
  translations: NavbarTranslations;
  onCloseMenu?: () => void; // دالة اختيارية لإغلاق القائمة
}

function AuthButtons({ translations, onCloseMenu }: AuthButtonsProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams();

  // التحقق من وجود اللغة
  if (!locale) {
    console.error("Locale is undefined in AuthButtons");
    return (
      <div className="text-red-500 dark:text-red-400 font-semibold">
        Error: Locale not found
      </div>
    );
  }

  // حالة التحميل
  if (status === "loading") {
    return (
      <div className="flex items-center gap-4">
        <Button
          className={clsx(
            "px-8 rounded-full bg-indigo-900 text-black",
            "animate-pulse cursor-not-allowed",
            "transition-opacity duration-200 ease-in-out"
          )}
          size="lg"
          disabled
        >
          Loading...
        </Button>
      </div>
    );
  }

  // دالة مساعدة للتنقل مع إغلاق القائمة
  const navigateWithClose = (path: string) => {
    router.push(path);
    onCloseMenu?.(); // إغلاق القائمة إذا تم تمرير الدالة
  };

  // دالة تسجيل الخروج مع إغلاق القائمة
  const handleSignOut = () => {
    if (typeof signOut === "function") {
      signOut({ callbackUrl: `/${locale}${Routes.ROOT}` });
      onCloseMenu?.(); // إغلاق القائمة بعد تسجيل الخروج
    } else {
      console.error("signOut is not a function");
    }
  };

  // حالة المستخدم المسجل
  if (session?.user) {
    return (
<div className="flex items-center gap-4  ">
  <Button
    className={clsx(
      // الأنماط الأساسية
      "bg-indigo-600 text-white dark:bg-indigo-800 dark:text-white",
      // التفاعل
      "hover:bg-indigo-700 dark:hover:bg-indigo-900",
      "active:bg-indigo-800 dark:active:bg-indigo-950",
      // الظلال
      "shadow-sm hover:shadow-lg",
      // الانتقالات
      "transition-all duration-300 ease-in-out",
      // التخصيص الإضافي
      "px-6 py-3 text-base font-semibold rounded-lg"
    )}
    size="lg"
    onClick={handleSignOut}
  >
    {translations.signOut || "Sign Out"}
  </Button>
</div>
    );
  }

  // حالة تسجيل الدخول/التسجيل
  return (
    <div className="flex items-center gap-4">
<Button
  className={clsx(
    // الأنماط الأساسية
    "font-semibold text-base",
    pathname?.startsWith(`/${locale}/${Routes.AUTH}${Pages.LOGIN}`)
      ? "text-indigo-700 dark:text-indigo-300 underline underline-offset-4" // نشط
      : "text-indigo-600 dark:text-indigo-400", // غير نشط
    // التفاعل
    "hover:text-indigo-800 dark:hover:text-indigo-200",
    "active:text-indigo-900 dark:active:text-indigo-100",
    // الانتقالات
    "transition-colors duration-300 ease-in-out"
  )}
  size="lg"
  variant="link"
  onClick={() => navigateWithClose(`/${locale}/${Routes.AUTH}${Pages.LOGIN}`)}
>
  {translations.Login || "Login"}
</Button>

      <Button
        className={clsx(
          // الأنماط الأساسية
          "bg-indigo-600 text-black dark:bg-indigo-800 dark:text-white",
          // التفاعل
          "hover:bg-indigo-700 dark:hover:bg-indigo-900",
          "active:bg-indigo-800 dark:active:bg-indigo-950",
          // الظلال
          "shadow-sm hover:shadow-lg",
          // الانتقالات
          "transition-all duration-300 ease-in-out",
          // التخصيص الإضافي
          "px-6 py-3 text-base font-semibold rounded-lg"
        )}
        size="lg"
        onClick={() =>
          navigateWithClose(`/${locale}/${Routes.AUTH}${Pages.Register}`)
        }
      >
        {translations.signUp || "Sign Up"}
      </Button>
    </div>
  );
}

export default AuthButtons;
