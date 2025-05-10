import { Prisma } from "@prisma/client";

export type ProductWithRelations = Prisma.ProductGetPayload<{
    include: {
        sizes: true,
        extras: true,
        category: true,
        orders: true,
    };
}>

export type CategoryWithProducts = Prisma.CategoryGetPayload<{
    include: {
        products: {
            include: {
                category: true,
                sizes: true,
                extras: true,
                orders: true,
            }
        }
    }
}>