import { Environment, Pages, Routes } from "@/constants/enums";
import { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/prisma";
import { Locale } from "@/i18n.config";
import { login } from "./_actions/auth";
import { User, UserRole } from "@prisma/client";

// توسيع واجهة Session لتشمل خصائص المستخدم من Prisma
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User;
  }
}

// توسيع واجهة JWT لتشمل خصائص المستخدم المخصصة
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
    image?: string | null;
    city?: string | null;
    country?: string | null;
    phone?: string | null;
    postalCode?: string | null;
    streetAddress?: string | null;
  }
}

/**
 * إعدادات NextAuth.js للمصادقة.
 * يشمل مزودي المصادقة، ردود الجلسات والتوكن، واستراتيجيات المصادقة.
 */
export const authOptions: NextAuthOptions = {
  // استخدام محول Prisma لقاعدة البيانات
  adapter: PrismaAdapter(db),

  // إعدادات الجلسة
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // الجلسة تدوم 7 أيام
    updateAge: 24 * 60 * 60, // يتم تحديث الجلسة كل 24 ساعة
  },

  // المفتاح السري للمصادقة
  secret: process.env.NEXTAUTH_SECRET,

  // تفعيل التصحيح فقط في بيئة التطوير
  debug: process.env.NODE_ENV === Environment.DEV,

  // مزودو المصادقة
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "hello@example.com" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          // استخراج اللغة من عنوان URL
          const currentUrl = req?.headers?.referer;
          const locale = (currentUrl?.split("/")[3] as Locale) || "en";

          // محاولة تسجيل الدخول
          const res = await login(credentials, locale);

          if (res?.status === 200 && res?.user) {
            return res.user;
          }

          throw new Error(
            JSON.stringify({
              validationError: res.error || "Invalid credentials",
              responseError: res.message || "Authentication failed",
            })
          );
        } catch (error) {
          console.error("Authorize error:", error);
          throw error;
        }
      },
    }),
  ],

  // تخصيص مسارات المصادقة
  pages: {
    signIn: `/${Routes.AUTH}${Pages.LOGIN}`,
  },

  // ردود الجلسة والتوكن
  callbacks: {
    /**
     * تحديث بيانات الجلسة بناءً على التوكن
     */
    session: async ({ session, token }) => {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          name: token.name ?? "",
          email: token.email,
          role: token.role,
          image: token.image ?? null,
          city: token.city ?? null,
          country: token.country ?? null,
          phone: token.phone ?? null,
          postalCode: token.postalCode ?? null,
          streetAddress: token.streetAddress ?? null,
        };
      }
      return session;
    },

    /**
     * تحديث التوكن بناءً على بيانات المستخدم من قاعدة البيانات
     */
    jwt: async ({ token }) => {
      if (!token.email) return token;

      try {
        const dbUser = await db.user.findUnique({ where: { email: token.email } });

        if (!dbUser) {
          console.warn(`User not found for email: ${token.email}`);
          return token;
        }

        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          image: dbUser.image,
          city: dbUser.city,
          country: dbUser.country,
          phone: dbUser.phone,
          postalCode: dbUser.postalCode,
          streetAddress: dbUser.streetAddress,
        };
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },
  },
};
