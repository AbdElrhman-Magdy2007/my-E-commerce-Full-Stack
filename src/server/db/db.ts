import { PrismaClient } from "@prisma/client";

/**
 * دالة مساعدة لإنشاء مثيل جديد من PrismaClient.
 * @returns PrismaClient - مثيل جديد من PrismaClient
 */
const prismaClientSingleton = () => {
  return new PrismaClient();
};

// تعريف نوع عالمي لـ prisma مع السماح بـ undefined
declare global {
  // eslint-disable-next-line no-var
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

// إنشاء مثيل PrismaClient أو استخدام المثيل الموجود عالميًا
const db: PrismaClient =
  globalThis.prisma ?? prismaClientSingleton();

// تعيين المثيل العالمي في بيئة التطوير فقط
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

export default db;