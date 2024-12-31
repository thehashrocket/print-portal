// ProductType router

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const productTypeRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.productType.findMany();
    }),
});