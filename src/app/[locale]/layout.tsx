import { ReactNode } from "react";
import Header from "@/components/header";
import { Directions, Languages } from "@/constants/enums";
import { Locale } from "@/i18n.config";
import ReduxProvider from "@/providers/ReduxProvider";
import { Inter, Roboto, Poppins, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css"; // Correct path relative to src/app/[locale]
import { Toaster } from "@/components/ui/sonner";
import NextAuthSessionProvider from "@/providers/NextAuthSessionProvider";
import Footer from "@/components/header/Footer";
import PageLoader from "@/components/PageLoader";

// Fonts
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// Generate static params for supported locales
export async function generateStaticParams() {
  return [
    { locale: Languages.ENGLISH },
    { locale: Languages.ARABIC },
  ];
}

// Generate dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return {
    title: locale === Languages.ARABIC ? "تطبيق عربة التسوق" : "Shopping Cart App",
    description:
      locale === Languages.ARABIC
        ? "تطبيق عربة تسوق متعدد اللغات مبني باستخدام Next.js"
        : "A multilingual shopping cart application built with Next.js",
  };
}

// Root Layout Component
export default function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: Locale };
}) {
  const { locale } = params;
  const isArabic = locale === Languages.ARABIC;

  return (
    <html lang={locale} dir={isArabic ? Directions.RTL : Directions.LTR}>
      <body
        className={`${inter.variable} ${poppins.variable} ${
          isArabic ? notoSansArabic.className : roboto.className
        } text-gray-100 bg-black dark:bg-gray-900`}
      >
        <NextAuthSessionProvider>
          <ReduxProvider>
            <Header />
            <PageLoader />
            <main>{children}</main>
            <Toaster dir={isArabic ? "rtl" : "ltr"} position="top-right" />
            <Footer locale={locale} />
          </ReduxProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}




/////////////////////////////////////////////////////////////////