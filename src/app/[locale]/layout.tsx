/* eslint-disable react/jsx-no-undef */
import Header from "@/components/header";
import { Directions, Languages } from "@/constants/enums";
import { Locale } from "@/i18n.config";
import ReduxProvider from "@/providers/ReduxProvider";
import type { Metadata } from "next";
import { Inter, Roboto, Cairo, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import NextAuthSessionProvider from "@/providers/NextAuthSessionProvider";
import Footer from "@/components/header/Footer";
import PageLoader from "@/components/PageLoader"; // ✅ تمت الإضافة

// Font configurations
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  preload: true,
});

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "700"],
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: true,
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poppins",
  preload: true,
});

// Metadata
export const metadata: Metadata = {
  title: "Shopping Cart App",
  description: "A multilingual shopping cart application built with Next.js",
};

// Generate static params for supported locales
export async function generateStaticParams() {
  return [
    { locale: Languages.ENGLISH },
    { locale: Languages.ARABIC },
  ];
}

// Root Layout Component
export default async function RootLayout({
  params,
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  const isArabic = locale === Languages.ARABIC;

  return (
    <html lang={locale} dir={isArabic ? Directions.RTL : Directions.LTR}>
      <body
        className={`${inter.variable} ${poppins.variable} ${
          isArabic ? cairo.className : roboto.className
        } text-gray-100 bg-black dark:bg-gray-900`}
      >
        <NextAuthSessionProvider>
          <ReduxProvider>
            <Header />
            <PageLoader /> {/* ✅ تمت الإضافة هنا */}
            {children}
            <Toaster />
            <Footer locale={locale} />
          </ReduxProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
