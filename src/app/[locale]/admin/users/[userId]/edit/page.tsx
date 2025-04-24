import EditUserForm from "@/components/edit-user-form";
import { Pages, Routes } from "@/constants/enums";
import { Locale } from "@/i18n.config";
import getTrans from "@/lib/translation";
import { getUser, getUsers } from "@/server/db/users";
import { redirect } from "next/navigation";

// توليد المعلمات الثابتة للمسارات (Static Paths)
export async function generateStaticParams() {
  const users = await getUsers();
  return users.map((user) => ({ userId: user.id }));
}

// صفحة تعديل المستخدم
async function EditUserPage({
  params,
}: {
  params: Promise<{ userId: string; locale: Locale }>;
}) {
  const { locale, userId } = await params;

  // جلب الترجمات بناءً على اللغة
  const translations = await getTrans(locale);

  // جلب بيانات المستخدم بناءً على userId
  const user = await getUser(userId);

  // إعادة توجيه إذا لم يتم العثور على المستخدم
  if (!user) {
    redirect(`/${locale}/${Routes.ADMIN}/${Pages.USERS}`);
  }

  return (
    <main className="min-h-screen bg-black">
      <section className="section-gap py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-indigo-700 mb-6">
            {translations.admin?.users?.editUser || "Edit User"} - {user.name}
          </h1>
          <EditUserForm translations={translations} user={user} />
        </div>
      </section>
    </main>
  );
}

export default EditUserPage;