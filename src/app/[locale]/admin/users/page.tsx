// Remove 'use client'
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import clsx from "clsx";
import { Pages, Routes, Languages, Directions } from "@/constants/enums";
import { Locale } from "@/i18n.config";
import { getUsers } from "@/server/db/users";
import { Edit, Plus } from "lucide-react";
import DeleteUserButton from "./_components/DeleteUserButton";
import getTrans from "@/lib/translation";
import { Suspense } from "react";

interface UsersPageProps {
  params: Promise<{ locale: Locale }>;
}

async function UsersPage({ params }: UsersPageProps) {
  const { locale } = await params;
  const isArabic = locale === Languages.ARABIC;
  const users = await getUsers();
  const translations = await getTrans(locale);

  return (
    <main className="min-h-screen bg-black">
      <section className="py-12">
        <div className="container bg-black bg-center items-center justify-center mx-auto rounded-lg shadow-md">
          {/* Header with Title and Add User Button */}
          <div
            className={clsx(
              "flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4",
              isArabic ? "sm:flex-row-reverse" : "sm:flex-row"
            )}
          >
            <h1
              className={clsx(
                "text-3xl font-bold text-indigo-700",
                isArabic ? "text-right" : "text-left"
              )}
            >
              {translations.admin?.users?.title || "Users"}
            </h1>
            {/* Uncomment if needed */}
            {/* <Link
              href={`/${locale}/${Routes.ADMIN}/${Pages.USERS}/${Pages.NEW}`}
              className={clsx(
                buttonVariants({ variant: "default", size: "sm" }),
                "bg-indigo-950 text-indigo-100 dark:bg-indigo-900 dark:text-indigo-200",
                "hover:bg-indigo-900 hover:text-indigo-50 dark:hover:bg-indigo-800 dark:hover:text-indigo-100",
                "active:bg-indigo-800 dark:active:bg-indigo-700",
                "shadow-sm hover:shadow-md",
                "transition-all duration-300 ease-in-out",
                "px-6 py-2.5 rounded-lg flex items-center gap-2",
                isArabic ? "sm:mr-0" : "sm:ml-0"
              )}
              aria-label={translations.admin?.users?.addUser || "Add User"}
              title={translations.admin?.users?.addUser || "Add User"}
            >
              <Plus className="h-5 w-5" />
              {translations.admin?.users?.addUser || "Add User"}
            </Link> */}
          </div>

          {/* Users List or No Users Message */}
          <Suspense fallback={<p className="text-center text-indigo-100">Loading users...</p>}>
            {users.length === 0 ? (
              <div className="flex items-center justify-center py-16 bg-indigo-950 rounded-lg shadow-sm">
                <p
                  className={clsx(
                    "text-lg text-indigo-100",
                    isArabic ? "text-right" : "text-left"
                  )}
                >
                  {translations.admin?.users?.noUsers || "No users found."}
                </p>
              </div>
            ) : (
              <ul className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className={clsx(
                      "flex flex-col p-6 rounded-lg bg-indigo-700",
                      "shadow-sm hover:shadow-md",
                      "transition-all duration-200 ease-in-out",
                      isArabic ? "text-right" : "text-left"
                    )}
                  >
                    <div className="flex flex-col gap-3 flex-1">
                      <h3
                        className={clsx(
                          "text-lg font-semibold text-black truncate",
                          isArabic ? "text-right" : "text-left"
                        )}
                      >
                        {user.name}
                      </h3>
                      <p
                        className={clsx(
                          "text-base text-black truncate",
                          isArabic ? "text-right" : "text-left"
                        )}
                      >
                        {user.email}
                      </p>
                    </div>
                    <div
                      className={clsx(
                        "flex gap-3 mt-4",
                        isArabic ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <Link
                        href={`/${locale}/${Routes.ADMIN}/${Pages.USERS}/${user.id}/${Pages.EDIT}`}
                        className={clsx(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "bg-indigo-950 text-indigo-100 dark:bg-indigo-900 dark:text-indigo-200",
                          "border-indigo-500 dark:border-indigo-400",
                          "hover:bg-indigo-900 hover:text-indigo-50 dark:hover:bg-indigo-800 dark:hover:text-indigo-100",
                          "active:bg-indigo-800 dark:active:bg-indigo-700",
                          "shadow-sm hover:shadow-md",
                          "transition-all duration-300 ease-in-out",
                          "px-4 py-2 flex items-center gap-2"
                        )}
                        aria-label={
                          translations.admin?.users?.editUser
                            ? translations.admin.users.editUser.replace(
                                "{name}",
                                user.name
                              )
                            : `Edit user ${user.name}`
                        }
                        title={`Edit user ${user.name}`}
                      >
                        <Edit className="h-4 w-4" />
                        {translations.admin?.users?.edit || "Edit"}
                      </Link>
                      <DeleteUserButton
                        userId={user.id}
                        translations={translations}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Suspense>
        </div>
      </section>
    </main>
  );
}

export default UsersPage;