import { NextRequest, NextResponse } from "next/server";
import { i18n, LanguageType, Locale } from "./i18n.config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { Pages, Routes } from "./constants/enums";
import { UserRole } from "@prisma/client";

/**
 * Extracts the preferred locale from request headers using Negotiator.
 * @param request - The incoming NextRequest object
 * @returns The matched locale or default locale if matching fails
 */
function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    negotiatorHeaders[key] = value;
  });

  const locales: LanguageType[] = i18n.locales;
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    const matchedLocale = matchLocale(languages, locales, i18n.defaultLocale);
    console.log("Matched Locale:", matchedLocale);
    return matchedLocale;
  } catch (error) {
    console.warn("Locale matching failed:", error);
    return i18n.defaultLocale;
  }
}

/**
 * Middleware to handle locale redirection, authentication, and route protection.
 */
export default withAuth(
  async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const pathname = url.pathname;
    console.log("Pathname:", pathname); // تصحيح: تتبع المسار

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-url", request.url);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    // التحقق مما إذا كان المسار يفتقد اللغة
    const pathnameIsMissingLocale = i18n.locales.every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    if (pathnameIsMissingLocale) {
      const locale = getLocale(request);
      const redirectUrl = new URL(`/${locale}${pathname || "/"}`, request.url);
      console.log("Redirecting to:", redirectUrl.toString());
      return NextResponse.redirect(redirectUrl);
    }

    // استخراج اللغة الحالية من المسار
    const currentLocale = pathname.split("/")[1] as Locale;
    console.log("Current Locale:", currentLocale);

    // التحقق من حالة المصادقة
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const isAuthenticated = !!token;
    console.log("Is Authenticated:", isAuthenticated, "Token:", token);

    // تحديد أنواع المسارات
    const isAuthPage = pathname.startsWith(`/${currentLocale}/${Routes.AUTH}`);
    const protectedRoutes = [Routes.PROFILE, Routes.ADMIN];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(`/${currentLocale}/${route}`)
    );

    // إذا لم يكن المستخدم مصادقًا وحاول الوصول إلى مسار محمي
    if (!isAuthenticated && isProtectedRoute) {
      const redirectUrl = new URL(`/${currentLocale}/${Routes.AUTH}${Pages.LOGIN}`, request.url);
      console.log("Redirecting to Login:", redirectUrl.toString());
      return NextResponse.redirect(redirectUrl);
    }

    // إذا كان المستخدم مصادقًا وحاول الوصول إلى صفحة المصادقة
    if (isAuthPage && isAuthenticated) {
      const role = token?.role as UserRole;
      const redirectUrl =
        role === UserRole.ADMIN
          ? new URL(`/${currentLocale}/${Routes.ADMIN}`, request.url)
          : new URL(`/${currentLocale}/${Routes.PROFILE}`, request.url);
      console.log("Redirecting Authenticated User to:", redirectUrl.toString());
      return NextResponse.redirect(redirectUrl);
    }

    // إذا كان المستخدم مصادقًا وحاول الوصول إلى مسار الإدارة بدون صلاحيات
    if (
      isAuthenticated &&
      pathname.startsWith(`/${currentLocale}/${Routes.ADMIN}`) &&
      token?.role !== UserRole.ADMIN
    ) {
      const redirectUrl = new URL(`/${currentLocale}/${Routes.PROFILE}`, request.url);
      console.log("Redirecting Non-Admin to Profile:", redirectUrl.toString());
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  },
  {
    callbacks: {
      authorized: () => true, // السماح للـ middleware بالتعامل مع التحقق
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};