// ~/src/server/api/routers/workOrderItemStocks/workOrderItemStock.tsx
// tRPC endpoints for work order item stocks

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { type SerializedWorkOrderItemStock } from "~/types/serializedTypes";
import { normalizeWorkOrderItemStock } from "~/utils/dataNormalization";
import { StockStatus } from "@prisma/client";

const workOrderItemStockSchema = z.object({
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
    workOrderItemId: z.string(),
});

export const workOrderItemStockRouter = createTRPCRouter({
    getByID: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }): Promise<SerializedWorkOrderItemStock | null> => {
            const stock = await ctx.db.workOrderItemStock.findUnique({
                where: { id: input },
            });
            return stock ? normalizeWorkOrderItemStock(stock) : null;
        }),
    getByWorkOrderItemId: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }): Promise<SerializedWorkOrderItemStock[]> => {
            const stocks = await ctx.db.workOrderItemStock.findMany({
                where: { workOrderItemId: input },
            });
            return stocks.map(normalizeWorkOrderItemStock);
        }),
    create: protectedProcedure
        .input(workOrderItemStockSchema)
        .mutation(async ({ ctx, input }) => {
            const stock = await ctx.db.workOrderItemStock.create({
                data: {
                    ...input,
                    createdById: ctx.session.user.id,
                },
            });
            return normalizeWorkOrderItemStock(stock);
        }),
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            data: workOrderItemStockSchema,
        }))
        .mutation(async ({ ctx, input }) => {
            const stock = await ctx.db.workOrderItemStock.update({
                where: { id: input.id },
                data: input.data,
            });
            return normalizeWorkOrderItemStock(stock);
        }),
    delete: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const stock = await ctx.db.workOrderItemStock.delete({
                where: { id: input },
            });
            return normalizeWorkOrderItemStock(stock);
        }),
});