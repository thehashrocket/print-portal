// ~/src/server/api/routers/orderItemStocks/orderItemStock.tsx
// tRPC endpoints for work order item stocks

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { type SerializedOrderItemStock } from "~/types/serializedTypes";
import { normalizeOrderItemStock } from "~/utils/dataNormalization";
import { StockStatus } from "@prisma/client";

const orderItemStockSchema = z.object({
    costPerM: z.number(),
    expectedDate: z.date().optional(),
    from: z.string().optional(),
    notes: z.string().optional(),
    orderedDate: z.date().optional(),
    received: z.boolean(),
    receivedDate: z.date().optional(),
    stockQty: z.number(),
    stockStatus: z.nativeEnum(StockStatus),
    supplier: z.string().optional(),
    totalCost: z.number().optional(),
    orderItemId: z.string(),
});

export const orderItemStockRouter = createTRPCRouter({
    getByID: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }): Promise<SerializedOrderItemStock | null> => {
            const stock = await ctx.db.orderItemStock.findUnique({
                where: { id: input },
            });
            return stock ? normalizeOrderItemStock(stock) : null;
        }),
    getByOrderItemId: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }): Promise<SerializedOrderItemStock[]> => {
            const stocks = await ctx.db.orderItemStock.findMany({
                where: { orderItemId: input },
            });
            return stocks.map(normalizeOrderItemStock);
        }),
    create: protectedProcedure
        .input(orderItemStockSchema)
        .mutation(async ({ ctx, input }) => {
            const stock = await ctx.db.orderItemStock.create({
                data: {
                    ...input,
                    createdById: ctx.session.user.id,
                },
            });
            return normalizeOrderItemStock(stock);
        }),
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            data: orderItemStockSchema,
        }))
        .mutation(async ({ ctx, input }) => {
            const stock = await ctx.db.orderItemStock.update({
                where: { id: input.id },
                data: input.data,
            });
            return normalizeOrderItemStock(stock);
        }),
    delete: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const stock = await ctx.db.orderItemStock.delete({
                where: { id: input },
            });
            return normalizeOrderItemStock(stock);
        }),
});