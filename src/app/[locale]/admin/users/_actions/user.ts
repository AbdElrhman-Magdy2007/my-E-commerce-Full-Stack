// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use server";

// import { Pages, Routes } from "@/constants/enums";
// import { getCurrentLocale } from "@/lib/getCurrentLocale";
// import { db } from "@/lib/prisma";
// import getTrans from "@/lib/translation";
// import { revalidatePath } from "next/cache";

// export const deleteUser = async (id: string) => {
//   // التحقق من صحة المعرف
//   if (!id || typeof id !== "string") {
//     const locale = await getCurrentLocale();
//     const translations = await getTrans(locale);
//     return {
//       status: 400,
//       message: translations.messages.invalidUserId || "Invalid user ID provided.",
//     };
//   }

//   const locale = await getCurrentLocale();
//   const translations = await getTrans(locale);

//   try {
//     // محاولة حذف المستخدم من قاعدة البيانات

//     // إعادة التحقق من المسارات لتحديث البيانات المخزنة مؤقتًا
//     revalidatePath(`/${locale}/${Routes.ADMIN}/${Pages.USERS}`);
//     revalidatePath(`/${locale}/${Routes.ADMIN}/${Pages.USERS}/${id}/${Pages.EDIT}`);

//     return {
//       status: 200,
//       message: translations.messages.deleteUserSuccess || "User deleted successfully.",
//     };
//   } catch (error) {
//     console.error("Error deleting user:", error);

//     // التحقق من نوع الخطأ لتقديم رسالة أكثر دقة
//     if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
//       return {
//         status: 404,
//         message: translations.messages.userNotFound || "User not found.",
//       };
//     }

//     return {
//       status: 500,
//       message: translations.messages.unexpectedError || "An unexpected error occurred.",
//     };
//   }
// };

"use server";
 
 import { Pages, Routes } from "@/constants/enums";
 import { getCurrentLocale } from "@/lib/getCurrentLocale";
 import { db } from "@/lib/prisma";
 import getTrans from "@/lib/translation";
 import { revalidatePath } from "next/cache";
 
 export const deleteUser = async (id: string) => {
   const locale = await getCurrentLocale();
   const translations = await getTrans(locale);
   try {
     await db.user.delete({
       where: { id },
     });
     revalidatePath(`/${locale}/${Routes.ADMIN}/${Pages.USERS}`);
     revalidatePath(
       `/${locale}/${Routes.ADMIN}/${Pages.USERS}/${id}/${Pages.EDIT}`
     );
     return {
       status: 200,
       message: translations.messages.deleteUserSucess,
     };
   } catch (error) {
     console.error(error);
     return {
       status: 500,
       message: translations.messages.unexpectedError,
     };
   }
 };