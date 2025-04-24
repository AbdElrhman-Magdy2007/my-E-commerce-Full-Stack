"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Routes, Languages, Directions } from "@/constants/enums";
import { Button } from "@/components/ui/button";
import AuthButtons from "./auth-buttons";
import CartButton from "./CartButton";
import clsx from "clsx";
import { UserRole } from "@prisma/client";
import Profile from "./Profile";

// تعريف نوع الترجمات
interface NavbarTranslations {
  home: string;
  about: string;
  contact: string;
  menu: string;
  admin: string;
  profile: string;
  arabic: string;
  english: string;
  Login: string;
  signOut: string;
  signUp?: string;
  logo: string;
  [key: string]: string | undefined;
}

interface NavLink {
  title: string;
  href: string;
}

/**
 * Navbar متجاوب واحترافي مع دعم الوضع الليلي (عكس الألوان: الأبيض إلى أسود والأسود إلى أبيض).
 * يتضمن شعار، روابط تنقل، سلة تسوق، أزرار تسجيل الدخول، تبديل اللغة، زر هامبرغر لفتح القائمة،
 * وزر "X" لإغلاقها مع حركات سلسة.
 * يدعم RTL/LTR وإغلاق القائمة عند النقر خارجها.
 * @param translations - كائن يحتوي على ترجمات التنقل
 */
function Navbar({ translations }: { translations: NavbarTranslations }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLUListElement>(null);

  // تحديد اللغة الابتدائية بناءً على المسار
  const initialLocale = pathname?.startsWith(`/${Languages.ARABIC}`)
    ? Languages.ARABIC
    : Languages.ENGLISH;
  const [locale, setLocale] = useState(initialLocale);
  const [openMenu, setOpenMenu] = useState(false);
  const isAdmin = session?.user?.role === UserRole.ADMIN;

  // تحديث اللغة عند تغيير المسار
  useEffect(() => {
    if (!pathname) return;
    const newLocale = pathname.startsWith(`/${Languages.ARABIC}`)
      ? Languages.ARABIC
      : Languages.ENGLISH;
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
  }, [pathname]);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    };
    if (openMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  // تبديل اللغة بين العربية والإنجليزية
  const toggleLanguage = useCallback(() => {
    const newLocale =
      locale === Languages.ENGLISH ? Languages.ARABIC : Languages.ENGLISH;
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
    const cleanPath = pathname?.replace(/^\/(en|ar)/, "") || "/";
    router.push(`/${newLocale}${cleanPath}`);
  }, [locale, pathname, router]);

  // فتح وإغلاق القائمة
  const openMenuHandler = useCallback(() => setOpenMenu(true), []);
  const closeMenu = useCallback(() => setOpenMenu(false), []);

  // التحقق من وجود الترجمات
  if (!translations) {
    console.error("Translations are undefined in Navbar");
    return (
      <div className="text-red-500 dark:text-red-400 p-4 font-semibold text-center bg-white dark:bg-black">
        {translations?.error || "خطأ في تحميل الترجمات"}
      </div>
    );
  }

  // قائمة الروابط
  const links: NavLink[] = [
    { title: translations.home, href: Routes.ROOT },
    { title: translations.about, href: Routes.ABOUT },
    { title: translations.contact, href: Routes.CONTACT },
    { title: translations.menu, href: Routes.MENU },
  ];

  return (
    <nav
      // className={clsx(
      //   "fixed top-0 left-0 right-0 z-999",
      //   "px-4 py-3 lg:px-10 lg:py-4"
      // )}
      dir={locale === Languages.ARABIC ? Directions.RTL : Directions.LTR}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* الشعار */}
        <Link
          href={`/${locale}${Routes.ROOT}`}
          className={clsx(
            "flex items-center", // إضافة flex لمحاذاة الصورة والنص
            "text-2xl lg:text-3xl font-extrabold tracking-tight",
            "text-indigo-800 dark:text-white",
            "hover:text-dark dark:hover:text-dark",
            "transition-colors duration-300",
            "relative group",
            locale === Languages.ARABIC ? "mr-6" : "ml-6"
          )}
          onClick={closeMenu}
        >
          {/* <img src="/logo.svg" alt="Logo" className="w-10 h-10 mr-2" /> */}
          {translations.logo}
        </Link>

        {/* قائمة التنقل وأزرار التحكم */}
        <div className="flex items-center justify-center lg:gap-6 lg:px-0 ps-8">
          {/* زر فتح القائمة (هامبرغر) */}
          <Button
            variant="ghost"
            size="icon"
            className={clsx(
              "lg:hidden relative p-2 rounded-full",
              "bg-indigo-900 dark:bg-white", // الرمادي الفاتح يصبح أبيض
              "text-black dark:text-black", // الرمادي يصبح أسود
              "hover:bg-black hover:text-indigo-900 dark:hover:bg-gray-200", // التفاعل يتكيف
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "active:bg-gray-300 dark:active:bg-gray-300",
              "transition-all duration-300 ease-in-out",
              "shadow-md hover:shadow-lg",
              openMenu && "opacity-40 cursor-not-allowed",
              locale === Languages.ARABIC ? "ml-2" : "mr-2"
            )}
            onClick={openMenuHandler}
            aria-label="Open menu"
            disabled={openMenu}
          >
            <span
              className={clsx(
                "absolute inset-0 bg-primary/25 rounded-full scale-0",
                "group-active:animate-[ripple_0.5s_ease-out] pointer-events-none"
              )}
            />
            <svg
              className={clsx(
                "w-6 h-6 relative z-10",
                "transition-all duration-300 ease-in-out",
                openMenu ? "scale-90 opacity-70" : "scale-100 opacity-100"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </Button>

          {/* زر إغلاق القائمة (X) */}
          <Button
            variant="ghost"
            size="icon"
            className={clsx(
              "lg:hidden relative p-2 rounded-full",
              "bg-indigo-900 dark:bg-black", // الرمادي الفاتح يصبح أبيض
              "text-black dark:text-black", // الرمادي يصبح أسود
              "hover:bg-black hover:text-indigo-900 dark:hover:bg-gray-200", // التفاعل يتكيف
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "active:bg-gray-300 dark:active:bg-gray-300",
              "transition-all duration-300 ease-in-out",
              "shadow-md hover:shadow-lg",
              !openMenu && "opacity-40 cursor-not-allowed",
              locale === Languages.ARABIC ? "ml-2" : "mr-2"
            )}
            onClick={closeMenu}
            aria-label="Close menu"
            disabled={!openMenu}
          >
            <span
              className={clsx(
                "absolute inset-0 bg-primary/25 rounded-full scale-0",
                "group-active:animate-[ripple_0.5s_ease-out] pointer-events-none"
              )}
            />
            <svg
              className={clsx(
                "w-6 h-6 relative z-10",
                "transition-all duration-300 ease-in-out",
                openMenu
                  ? "rotate-0 scale-100 opacity-100"
                  : "rotate-45 scale-90 opacity-70"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>

          {/* قائمة الروابط */}
          <ul
            ref={menuRef}
            className={clsx(
              "lg:flex lg:gap-12 lg:items-center lg:justify-center lg:flex-row-reverse text-center",
              openMenu
                ? "flex flex-col absolute top-full left-0 right-0 bg-black dark:bg-black shadow-2xl py-6 px-6 rounded-b-3xl border-b border-gray-200/60 dark:border-white/60 opacity-100 translate-y-0"
                : "hidden opacity-0 -translate-y-4 lg:opacity-100 lg:translate-y-0",
              "transition-all duration-300 ease-in-out",
              locale === Languages.ARABIC
                ? "lg:flex-row-reverse"
                : "lg:flex-row"
            )}
          >
            {links.map((link, index) => (
              <li key={index} className="py-2 lg:py-0 relative group" id="link">
                <Link
                  href={`/${locale}/${link.href}`}
                  className={clsx(
                    // الأنماط الأساسية
                    "text-base lg:text-lg font-medium tracking-wide",
                    "text-indigo-600 dark:text-indigo-900", // اللون الأساسي: رمادي داكن نهارًا، أبيض ليلاً

                    // حالة النشاط (Active State)
                    pathname === `/${locale}/${link.href}` &&
                      "text-indigo-900 dark:text-indigo-900", // نشط: أبيض في كلا الوضعين

                    // التفاعل (Hover State)
                    pathname !== `/${locale}/${link.href}` &&
                      "group-hover:text-indigo-900 dark:group-hover:text-indigo-900", // hover: أبيض نهارًا، رمادي فاتح ليلاً

                    // الانتقالات والتأثيرات
                    "transition-colors duration-300 ease-out",
                    "relative",
                    "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-700", // الخط السفلي: أبيض
                    "after:transition-all after:duration-300 group-hover:after:w-full",
                    pathname === `/${locale}/${link.href}` && "after:w-full"
                  )}
                  onClick={closeMenu}
                >
                  {link.title}
                </Link>
              </li>
            ))}

            {/* رابط الملف الشخصي أو الإدارة */}
            {/* {session?.user && (
              <li className="py-2 lg:py-0 relative group">
                <Link
                  href={
                    isAdmin
                      ? `/${locale}/${Routes.ADMIN}`
                      : `/${locale}/${Routes.PROFILE}`
                  }
                  className={clsx(
                    // الأنماط الأساسية
                    "text-base lg:text-lg font-medium tracking-wide",
                    "text-indigo-700 dark:text-indigo-700",

                    // حالة النشاط (Active State)
                    pathname?.startsWith(
                      isAdmin
                        ? `/${locale}/${Routes.ADMIN}`
                        : `/${locale}/${Routes.PROFILE}`
                    ) && "text-indigo-700 dark:text-indigo-700",

                    // التفاعل (Hover State)
                    !pathname?.startsWith(
                      isAdmin
                        ? `/${locale}/${Routes.ADMIN}`
                        : `/${locale}/${Routes.PROFILE}`
                    ) &&
                      "group-hover:text-indigo-900 dark:group-hover:text-indigo-900",

                    // الانتقالات والتأثيرات
                    "transition-colors duration-300 ease-out",
                    "relative",
                    "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-700",
                    "after:transition-all after:duration-300 group-hover:after:w-full",
                    pathname?.startsWith(
                      isAdmin
                        ? `/${locale}/${Routes.ADMIN}`
                        : `/${locale}/${Routes.PROFILE}`
                    ) && "after:w-full"
                  )}
                  onClick={closeMenu}
                >
                  {isAdmin ? translations.admin : translations.profile}
                </Link>
              </li>
            )} */}

            {/* أزرار تسجيل الدخول/الخروج */}
            <div className={clsx("py-2 lg:py-0 pt-7", "lg:flex lg:items-center")}>
              <AuthButtons
                translations={translations}
                onCloseMenu={closeMenu}
              />
            </div>
          </ul>
        </div>
        {/* Profile */}
        {session?.user && (
  <div
    className={clsx(
      "flex items-center",
      locale === Languages.ARABIC ? "mr-4 lg:mr-0" : "ml-4 lg:ml-0"
    )}
  >
    <Button
      variant="ghost"
      className={clsx(
        "flex flex-col items-center gap-1.5 p-2.5 rounded-full",
        "text-black dark:text-black",
        "hover:bg-black dark:hover:bg-black",
        "hover:text-black dark:hover:text-black",
        "transition-all duration-300 ease-in-out",
        "group relative",
        "focus:outline-none focus:ring-2 focus:ring-black",
        "hover:shadow-sm"
      )}
      asChild
      aria-label={isAdmin ? translations.admin : translations.profile}
    >
      <Link
        href={isAdmin ? `/${locale}/${Routes.ADMIN}` : `/${locale}/${Routes.PROFILE}`}
        onClick={closeMenu}
        className="flex flex-col items-center gap-1.5"
      >
        <div
          className={clsx(
            "w-10 h-10 lg:w-12 lg:h-12 shrink-0 mt-4 ",
            "transform  transition-transform duration-300",
            "relative rounded-full overflow-hidden border-2 border-indigo-700 "
          )}
        >
          <Profile />
        </div>
        <span
          className={clsx(
            "text-sm font-semibold tracking-wide",
            "lg:text-base",
            "text-indigo-700 dark:text-indigo-200",
            "group-hover:text-indigo-900 ",
            "transition-colors duration-300"
          )}
        >
          {isAdmin ? translations.admin : translations.profile}
        </span>
      </Link>
    </Button>
  </div>
)}

        {/* أزرار الإجراءات (سلة التسوق واللغة) */}
        <div
          className={clsx(
            "flex items-center text-indigo-700 dark:text-indigo-900",
            locale === Languages.ARABIC ? "mr-4 lg:mr-0" : "ml-4 lg:ml-0"
          )}
        >
          <CartButton />
          {/* <Button
            onClick={toggleLanguage}
            className={clsx(
              "px-4 py-2 rounded-full text-sm lg:text-base font-semibold",
              "bg-white dark:bg-black", // الأسود يصبح أبيض
              "text-black dark:text-black", // الأبيض يصبح أسود
              "hover:bg-gray-800 dark:hover:bg-gray-200", // التفاعل يتكيف
              "shadow-md hover:shadow-lg",
              "focus:outline-none focus:ring-2 focus:ring-primary/60",
              "transition-all duration-300 ease-in-out"
            )}
          >
            {locale === Languages.ENGLISH
              ? translations.arabic
              : translations.english}
          </Button> */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
