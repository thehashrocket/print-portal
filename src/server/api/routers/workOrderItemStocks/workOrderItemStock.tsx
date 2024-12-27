// ~/src/server/api/routers/workOrderItemStocks/workOrderItemStock.tsx
// tRPC endpoints for work order item stocks

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { type SerializedWorkOrderItemStock } from "~/types/serializedTypes";
import { normalizeWorkOrderItemStock } from "~/utils/dataNormalization";
import { PaperType, PaperFinish, StockStatus, PaperBrand } from "@prisma/client";

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
    paperProductId: z.string().optional()
});

export const workOrderItemStockRouter = createTRPCRouter({
    getByID: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }): Promise<SerializedWorkOrderItemStock | null> => {
            const stock = await ctx.db.workOrderItemStock.findUnique({
                where: { id: input },
                include: { PaperProduct: true },
            });
            return stock ? normalizeWorkOrderItemStock(stock) : null;
        }),
    getByWorkOrderItemId: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }): Promise<SerializedWorkOrderItemStock[]> => {
            const stocks = await ctx.db.workOrderItemStock.findMany({
                where: { workOrderItemId: input },
                include: { PaperProduct: true },
            });
            return stocks.map(normalizeWorkOrderItemStock);
        }),
    create: protectedProcedure
        .input(workOrderItemStockSchema)
        .mutation(async ({ ctx, input }) => {
            const { paperProductId, workOrderItemId, ...rest } = input;
            console.log("Creating work order item stock with paper product ID:", paperProductId);
            const stock = await ctx.db.workOrderItemStock.create({
                data: {
                    ...rest,
                    createdBy: {
                        connect: { id: ctx.session.user.id }
                    },
                    WorkOrderItem: {
                        connect: { id: workOrderItemId }
                    }
                }
            });
            return normalizeWorkOrderItemStock(stock);
        }),
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            data: workOrderItemStockSchema.omit({ workOrderItemId: true }),
        }))
        .mutation(async ({ ctx, input }) => {
            const { paperProductId, ...rest } = input.data;
            console.log("Updating work order item stock with paper product ID:", paperProductId);
            const stock = await ctx.db.workOrderItemStock.update({
                where: { id: input.id },
                data: {
                    ...rest,
                }
            });
            return normalizeWorkOrderItemStock(stock);
        }),
    delete: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const stock = await ctx.db.workOrderItemStock.delete({
                where: { id: input },
                include: { PaperProduct: true }
            });
            return normalizeWorkOrderItemStock(stock);
        }),
});