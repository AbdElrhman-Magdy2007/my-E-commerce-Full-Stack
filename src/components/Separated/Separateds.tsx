import { getCurrentLocale } from "@/lib/getCurrentLocale";
import getTrans from "@/lib/translation";
import React from "react";

async function Separateds() {
  const locale = await getCurrentLocale();
  const { stores } = await getTrans(locale);
  const { store } = stores;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4 text-center">
        {store.name}
      </h2>

      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
        {store.description}
      </p>

      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
        {store.features.shopping_cart}
      </p>

      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
        {store.features.payment}
      </p>

      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
        {store.features.content_management}
      </p>

      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
        {store.features.user_management}
      </p>

      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
        {store.future_enhancements.join(", ")}
      </p>

      <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold mt-6 text-center">
        {store.goal}
      </p>
    </div>
  );
}

export default Separateds;
