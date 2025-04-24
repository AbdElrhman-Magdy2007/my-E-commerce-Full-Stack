// import { cache } from "@/lib/cache";
//  import { db } from "@/lib/prisma";

//  export const getUsers = cache(
//    () => {
//      const users = db.user.findMany();
//      return users;
//    },
//    ["users"],
//    { revalidate: 3600 }
//  );
//  export const getUser = cache(
//    (userId: string) => {
//      const user = db.user.findUnique({ where: { id: userId } });
//      return user;
//    },
//    [`user-${crypto.randomUUID()}`],
//    { revalidate: 3600 }
//  );

import { cache } from "@/lib/cache";
import { db } from "@/lib/prisma";

// جلب جميع المستخدمين مع التخزين المؤقت
export const getUsers = cache(
  async () => {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true, // يمكنك إضافة حقول إضافية حسب الحاجة
        image: true,
      },
    });
    return users;
  },
  ["users"], // مفتاح ثابت لجميع المستخدمين
  { revalidate: 3600 } // إعادة التحقق كل ساعة
);

// جلب مستخدم فردي بناءً على userId مع التخزين المؤقت
export const getUser = cache(
  async (userId: string) => {
    // التحقق من صحة userId
    if (!userId || typeof userId !== "string") {
      throw new Error("Invalid userId provided");
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        streetAddress: true,
        postalCode: true,
        role: true,
        city: true,
        country: true,
      },
    });

    return user;
  },
  (userId: string) => [`user-${userId}`], // مفتاح ديناميكي بناءً على userId
  { revalidate: 3600 } // إعادة التحقق كل ساعة
);
