import { Pages, Routes } from "@/constants/enums";
import { Locale } from "@/i18n.config";
import getTrans from "@/lib/translation";
import { authOptions } from "@/server/auth";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import EditUserForm from "@/components/edit-user-form";

async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  // بداية توقيت جلب البيانات
  console.time("fetching");

  const session = await getServerSession(authOptions);
  const translations = await getTrans(locale);

  // يمكن إضافة timeEnd بعد جلب البيانات الأخرى
  console.timeEnd("fetching");

  if (!session) {
    redirect(`/${locale}/${Routes.AUTH}/${Pages.LOGIN}`);
  }

  if (session && session.user.role === UserRole.ADMIN) {
    redirect(`/${locale}/${Routes.ADMIN}`);
  }

  return (
    <main>
      <section className="Section-gap lg:mt-[150px] mt-[120px]">
        <div className="container">
          <h1 className="text-3xl text-center text-white font-bold italic mb-10">
            {translations.stores.profile.title}
          </h1>
          {session?.user && (
            <EditUserForm user={session.user} translations={translations} />
          )}
        </div>
      </section>
    </main>
  );
}

export default ProfilePage;
