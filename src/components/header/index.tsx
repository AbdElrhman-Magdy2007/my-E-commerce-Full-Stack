import { getCurrentLocale } from "@/lib/getCurrentLocale";
import getTrans from "@/lib/translation";
import { Languages, Directions } from "../../constants/enums";
import clsx from "clsx";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import Navbar from "./Navbar";
import CartButton from "./CartButton";

// تعريف أنواع الترجمات
interface NavbarTranslations {
  home: string;
  about: string;
  contact: string;
  menu: string;
  admin: string;
  profile: string;
  arabic: string;
  english: string;
  login: string;
  signOut: string;
  logo: string;
  signUp: string;
  error?: string;
  [key: string]: string | undefined;
}

interface Translations {
  stores: {
    Navbars: NavbarTranslations;
  };
  [key: string]: any;
}

/**
 * Header component positioned above content with logo, navigation, auth buttons, and cart.
 * Fetches session and translations server-side, supports RTL/LTR, and includes error handling.
 * @returns JSX.Element - The rendered header component
 */
async function Header(): Promise<JSX.Element> {
  const initialSession = await getServerSession(authOptions);
  const locale = await getCurrentLocale();
  const translations: Translations = await getTrans(locale);

  if (!translations?.stores?.Navbars) {
    console.error(
      "Failed to load Navbar translations. Verify translation files or getTrans function.",
      {
        locale,
        availableTranslations: translations,
        timestamp: new Date().toISOString(),
      }
    );
    return (
      <header
        className={clsx(
          // Layout and Positioning
          "fixed inset-x-0 top-0 z-550",
          // Styling
          "bg-purple-700 dark:bg-purple-700",
          "shadow-md border-b border-red-200Veticaldark:border-red-800",
          // Spacing and Typography
          "p-4 text-center",
          "text-red-600 dark:text-red-400 font-semibold text-lg"
        )}
        dir={locale === Languages.ARABIC ? Directions.RTL : Directions.LTR}
      >
        {translations?.stores?.Navbars?.error ||
          "Error: Unable to load navigation translations"}
      </header>
    );
  }

  const navbarTranslations = translations.stores.Navbars;

  return (
    <header
      className={clsx(
        // Layout and Positioning
        "fixed inset-x-0 top-0 z-50",
        // Background and Border
        "bg-black dark:bg-black shadow-indigo-600/10 dark:shadow-indigo-600/10",
        "border-b border-gray-800 dark:border-gray-800 shadow-lg",
        // Spacing
        "py-4 lg:py-5"
      )}
    >
      <div
        className={clsx(
          // Container
          "container mx-auto",
          // Padding
          "px-4 lg:px-6",
          // Flex Layout
          "flex items-center justify-between",
          // Spacing between elements
          "gap-6 lg:gap-10",
          // Max Width
          "max-w-screen-xl",
          // RTL/LTR Support
          locale === Languages.ARABIC ? "flex-row-reverse" : "flex-row"
        )}
      >


        {/* Navigation */}
        <div
          className={clsx(
            "flex-1" // Takes remaining space
          )}
        >
          <Navbar translations={navbarTranslations} />
        </div>

        {/* Auth Buttons and Cart */}
        <div
          className={clsx(
            // Flex Layout
            "flex items-center",
            // Spacing
            "gap-4 lg:gap-6",
            // Alignment
            "justify-end",
            // Prevent shrinking
            "shrink-0",
            // RTL/LTR Support
            locale === Languages.ARABIC ? "flex-row-reverse" : "flex-row"
          )}
        >
          <div
            className={clsx(
              // Visibility
              "hidden lg:flex",
              // Flex Layout
              "items-center gap-4",
              // RTL/LTR Support
              locale === Languages.ARABIC ? "flex-row-reverse" : "flex-row"
            )}
          >
          </div>
          {/* <div
                    className={clsx(
                      "flex items-center text-indigo-700 dark:text-indigo-900",
                      locale === Languages.ARABIC ? "mr-4 lg:mr-0" : "ml-4 lg:ml-0"
                    )}
                  >
          <CartButton />
          </div> */}
        </div>
      </div>
    </header>
  );
}

export default Header;