// import { cache } from "@/lib/cache";
//  import { db } from "@/lib/prisma";
 
//  export const getCategories = cache(
//    () => {
//      const categories = db.category.findMany({
//        orderBy: {
//          order: "asc",
//        },
//      });
//      return categories;
//    },
//    ["categories"],
//    { revalidate: 3600 }
//  );

import { cache } from "@/lib/cache";
import { db } from "@/lib/prisma";

export const getCategories = cache(
  async () => {
    try {
      const categories = await db.category.findMany({
        select: {
          id: true,
          name: true,
          image: true,
          order: true,
        },
        orderBy: {
          order: "asc",
        },
      });
      console.log("Fetched categories:", categories);
      return categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },
  ["categories"],
  { revalidate: 3600 }
);