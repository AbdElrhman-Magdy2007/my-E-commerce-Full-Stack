import { Locale } from "@/i18n.config";

// دالة مساعدة لاستخدامها في Server Components أو Server Actions
export const getCurrentLocale = async (): Promise<Locale> => {
  try {
    const { headers } = await import("next/headers");
    const headersList = headers();
    const acceptLanguage = (await headersList).get("accept-language") || "en";
    // افترض أن i18n.config يحتوي على اللغات المدعومة
    const supportedLocales: Locale[] = ["en", "ar"] as Locale[]; // عدّل حسب i18n.config
    const preferredLocale = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0])
      .find((lang) => supportedLocales.includes(lang as Locale));
    return (preferredLocale as Locale) || "en"; // الافتراضي: الإنجليزية
  } catch (error) {
    console.error("[getCurrentLocaleServer] Error fetching headers:", error);
    return "en" as Locale;
  }
};

// دالة للاستخدام في Client Components
export const getCurrentLocaleClient = (localeFromParams?: string): Locale => {
  const supportedLocales: Locale[] = ["en", "ar"] as Locale[];
  return supportedLocales.includes(localeFromParams as Locale) ? (localeFromParams as Locale) : "en";
};