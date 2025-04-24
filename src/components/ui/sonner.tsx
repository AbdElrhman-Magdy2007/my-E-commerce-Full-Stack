"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { useEffect, useState, useMemo } from "react";
import clsx from "clsx";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster = (props: ToasterProps) => {
  const { theme, resolvedTheme } = useTheme(); // 🔥 إضافة `resolvedTheme`
  const [currentTheme, setCurrentTheme] = useState<ToasterProps["theme"]>("light"); // 🔥 حفظ الثيم بعد تحميله
  const [position, setPosition] = useState<ToasterProps["position"]>(
    typeof window !== "undefined" && window.innerWidth < 640 ? "top-right" : "top-center"
  );

  // ✅ تحديث `theme` بعد تحميله
  useEffect(() => {
    if (resolvedTheme) {
      setCurrentTheme(resolvedTheme as ToasterProps["theme"]);
    }
  }, [resolvedTheme]);

  // ✅ ضبط موقع `toast` بناءً على حجم الشاشة
  useEffect(() => {
    const updatePosition = () => {
      const newPosition = window.innerWidth < 640 ? "top-right" : "top-center";
      setPosition((prev) => (prev !== newPosition ? newPosition : prev));
    };

    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  const toastOptions = useMemo(
    () => ({
      classNames: {
        toast: clsx(
          "group toast p-3 rounded-lg shadow-lg border",
          "w-[90%] sm:w-[80%] md:w-[60%] max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl",
          "mt-2 sm:mt-4 md:mt-6",
          "bg-[var(--toast-bg)] border-[var(--toast-border)] text-[var(--toast-text)]"
        ),
        description: "text-[var(--toast-text)] text-xs sm:text-sm",
        actionButton: "bg-[var(--toast-primary)] text-[var(--toast-primary-text)] px-3 py-1 rounded",
        cancelButton: "bg-[var(--toast-muted)] text-[var(--toast-muted-text)] px-3 py-1 rounded",
      },
    }),
    []
  );

  return (
    <div data-theme={currentTheme}>
      <Sonner theme={currentTheme} position={position} className="toaster group" toastOptions={toastOptions} {...props} />
    </div>
  );
};
