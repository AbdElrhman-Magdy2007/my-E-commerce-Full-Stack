/* eslint-disable @next/next/no-img-element */
import { getProductsByCategory } from "@/server/db/products";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Category {
  id: string;
  name: string;
  image?: string;
}

export default async function MenuPage() {
  const categories: Category[] = await getProductsByCategory();

  return (
    <section className="relative lg:mt-[300px] w-full min-h-screen bg-gradient-to-b from-indigo-950 to-black py-6 overflow-hidden">
      <main
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-6"
        role="main"
        aria-label="Menu page"
      >
        {/* Header */}
        <header className="text-center mb-6 sm:mb-8 container">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-indigo-100 mb-2 animate-fade-in tracking-tight">
            Category
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-indigo-300 italic">
            Choose the category that suits you best and explore our products
          </p>
        </header>

        {/* Categories Display */}
        <Suspense fallback={<MenuSkeleton />}>
          {categories.length > 0 ? (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 px-3 sm:px-4 lg:px-25 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 justify-items-center mx-auto"
              role="list"
            >
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/menu`}
                  className="bg-indigo-950 rounded-lg shadow-sm p-3 flex flex-col items-center text-center transition-all hover:scale-105 hover:shadow-indigo-900/50 duration-300 border border-indigo-800 w-full max-w-[150px] aspect-square"
                  role="listitem"
                >
                  {category.image && (
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mb-2">
                      <Image
                        src={category.image}
                        alt={`Category image: ${category.name}`}
                        fill
                        className="object-cover rounded-full border-2 border-indigo-900"
                        sizes="(max-width: 640px) 48px, (max-width: 1024px) 56px, 64px"
                        priority={false}
                        quality={75}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <p className="text-xs sm:text-xs lg:text-sm font-semibold text-indigo-200 line-clamp-2">
                    {category.name}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-12 bg-indigo-950 rounded-lg border border-indigo-900 shadow-sm"
              role="alert"
              aria-label="No categories available"
            >
              <h3 className="text-lg sm:text-xl font-bold text-indigo-100 mb-2">
                There are no categories currently available.
              </h3>
              <p className="text-xs sm:text-sm text-indigo-300 max-w-xs text-center">
                New categories will be added soon.
              </p>
            </div>
          )}
        </Suspense>
      </main>
    </section>
  );
}

function MenuSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="text-center mb-6 sm:mb-8">
        <Skeleton
          height={28}
          width="30%"
          className="mx-auto mb-2"
          baseColor="#1e1b4b"
          highlightColor="#312e81"
        />
        <Skeleton
          height={16}
          width="50%"
          className="mx-auto"
          baseColor="#1e1b4b"
          highlightColor="#312e81"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 justify-items-center mx-auto">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="flex flex-col items-center w-full max-w-[150px] aspect-square">
              <Skeleton
                height={90}
                className="rounded-lg w-full"
                baseColor="#1e1b4b"
                highlightColor="#312e81"
              />
              <Skeleton
                height={12}
                width="50%"
                className="mx-auto mt-2"
                baseColor="#1e1b4b"
                highlightColor="#312e81"
              />
            </div>
          ))}
      </div>
    </div>
  );
}