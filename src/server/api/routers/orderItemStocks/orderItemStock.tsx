// ~/src/server/api/routers/orderItemStocks/orderItemStock.tsx
// tRPC endpoints for work order item stocks

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { type SerializedOrderItemStock } from "~/types/serializedTypes";
import { normalizeOrderItemStock } from "~/utils/dataNormalization";
import { StockStatus, PaperBrand, PaperType, PaperFinish } from "@prisma/client";

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
    PaperProduct: z.object({
        id: z.string(),
        brand: z.nativeEnum(PaperBrand),
        paperType: z.nativeEnum(PaperType),
        finish: z.nativeEnum(PaperFinish),
        weightLb: z.number(),
        caliper: z.number(),
        size: z.string(),
    }).optional(),
});

export const orderItemStockRouter = createTRPCRouter({
    getByID: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }): Promise<SerializedOrderItemStock | null> => {
            const stock = await ctx.db.orderItemStock.findUnique({
                where: { id: input },
                include: { PaperProduct: true },
            });
            return stock ? normalizeOrderItemStock(stock) : null;
        }),
    getByOrderItemId: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }): Promise<SerializedOrderItemStock[]> => {
            const stocks = await ctx.db.orderItemStock.findMany({
                where: { orderItemId: input },
                include: { PaperProduct: true },
            });
            return stocks.map(normalizeOrderItemStock);
        }),
    create: protectedProcedure
        .input(orderItemStockSchema)
        .mutation(async ({ ctx, input }) => {
            const { PaperProduct, orderItemId, ...rest } = input;
            const stock = await ctx.db.orderItemStock.create({
                data: {
                    ...rest,
                    createdBy: {
                        connect: { id: ctx.session.user.id }
                    },
                    OrderItem: {
                        connect: { id: orderItemId }
                    },
                    PaperProduct: PaperProduct ? {
                        connect: { id: PaperProduct.id }
                    } : undefined,
                },
                include: { PaperProduct: true }
            });
            return normalizeOrderItemStock(stock);
        }),
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            data: orderItemStockSchema.omit({ orderItemId: true }),
        }))
        .mutation(async ({ ctx, input }) => {
            const stock = await ctx.db.orderItemStock.update({
                where: { id: input.id },
                data: {
                    ...input.data,
                    PaperProduct: input.data.PaperProduct ? {
                        connect: { id: input.data.PaperProduct.id }
                    } : undefined
                },
                include: { PaperProduct: true }
            });
            return normalizeOrderItemStock(stock);
        }),
    delete: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const stock = await ctx.db.orderItemStock.delete({
                where: { id: input },
                include: { PaperProduct: true }
            });
            return normalizeOrderItemStock(stock);
        }),
});