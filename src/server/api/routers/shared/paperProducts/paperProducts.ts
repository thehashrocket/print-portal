// This file is for shared paper products that are used in multiple places in the app.
// This is to avoid having to create a new paper product for each order.
// Instead, we can just use the shared paper product.

import { createTRPCRouter, publicProcedure } from "../../../trpc";

export const paperProductsRouter = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        return await ctx.db.paperProduct.findMany();
    }),
}); 