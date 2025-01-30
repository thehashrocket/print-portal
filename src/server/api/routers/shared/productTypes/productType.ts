// ProductType router

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const productTypeRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        // Get all product types and sort by name
        return await ctx.db.productType.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }),
});