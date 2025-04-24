"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";

export default function PageLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500); // وقت اللودينج بعد تغيير الصفحة

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed top-0 left-0 w-full h-1 bg-indigo-500 z-[9999]"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          exit={{ width: "100%", opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </AnimatePresence>
  );
}
