"use server";

import Link from "@/components/link";
import { buttonVariants } from "@/components/ui/button";
import { Languages, Pages, Routes } from "@/constants/enums";
import { Locale } from "@/i18n.config";
import getTrans from "@/lib/translation";
import { authOptions } from "@/server/auth";
import { getProducts } from "@/server/db/products";
import { UserRole } from "@prisma/client";
import { ArrowRightCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import MenuItems from "./_components/MenuItems";

async function MenuItemsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const locale = (await params).locale;
  const translations = await getTrans(locale);
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/${locale}/${Routes.AUTH}/${Pages.LOGIN}`);
  }

  if (session.user.role !== UserRole.ADMIN) {
    redirect(`/${locale}/${Routes.PROFILE}`);
  }

  let products;
  try {
    products = await getProducts(); // يُرجع ProductWithRelations[]
  } catch (error) {
    console.error("Error fetching products:", error);
    return (
      <main>
        <section className="section-gap">
          <div className="container bg-black bg-center items-center justify-center mx-auto rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold mb-4">
              {translations.admin.tabs.menuItems}
            </h1>
            <p className="text-destructive">
              {translations.messages.unexpectedError || "An unexpected error occurred"}
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="section-gap">
        <div className="container bg-black bg-center items-center justify-center mx-auto rounded-lg shadow-md">
          <h1 className="text-2xl text-indigo-700 font-semibold mb-4">
            {translations.admin.tabs.menuItems}
          </h1>
          <Link
            href={`/${locale}/${Routes.ADMIN}/${Pages.MENU_ITEMS}/${Pages.NEW}`}
            className={`${buttonVariants({
              variant: "outline",
            })} !mx-auto !flex !w-80 !h-10 mb-8 items-center gap-2 bg-indigo-600 text-black hover:bg-indigo-700 ` }
          >
            {translations.admin.menuItems.createNewMenuItem}
            <ArrowRightCircle
              className={`!w-5 !h-5 ${
                locale === Languages.ARABIC ? "rotate-180" : ""
              }`}
            />
          </Link>
          {products.length > 0 ? (
            <MenuItems products={products} />
          ) : (
            <p className="text-center text-muted-foreground">
              {translations.noProductsAvailable || "No products available"}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default MenuItemsPage;