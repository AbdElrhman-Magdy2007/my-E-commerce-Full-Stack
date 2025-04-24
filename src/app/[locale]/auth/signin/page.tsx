import { buttonVariants } from "@/components/ui/button";
import { Pages, Routes } from "@/constants/enums";
import Link from "next/link";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import getTrans from "@/lib/translation"; // ✅ تحميل الترجمات ديناميكيًا
import Form from "./_components/Form";

async function SigninPage() {
  const locale = await getCurrentLocale();
  const translations = await getTrans(locale); // ✅ الحصول على الترجمات الصحيحة

  return (
    <main className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md">
        <div className="bg-black shadow-md rounded px-8 pt-6 pb-8 mb-4 lg:mt-[99px]">
          <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">
            {translations.auth.login.title} {/* ✅ استخدام الترجمة */}
          </h2>
          <Form translations={translations} /> {/* ✅ تمرير الترجمات بشكل صحيح */}
          <p className="text-center text-indigo-700 text-sm mt-4">
            {translations.auth.login.noAccount}{" "}
            <Link
              href={`/${locale}/${Routes.AUTH}/${Pages.Register}`}
              className={`${buttonVariants({
                variant: "link",
                size: "sm",
              })} !text-blue-600 hover:underline`}
            >
              {translations.auth.login.signUp} {/* ✅ استخدام ترجمة زر التسجيل */}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default SigninPage;
