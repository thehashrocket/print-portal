// used by both Orders and WorkOrders. This is a good example of how to share code between routers.

// Path: src/server/api/routers/shared/processingOptions.ts

// Fields include: cutting, drilling, folding, numberingColor, numberingEnd, numberingStart, other, padding, orderId, workOrderId

import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const processingOptionsRouter = createTRPCRouter({
    getByID: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.processingOptions.findUnique({
            where: {
                id: input,
            },
        });
    }),

    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.processingOptions.findMany();
    }),

    create: protectedProcedure
        .input(z.object({
            cutting: z.boolean(),
            drilling: z.boolean(),
            folding: z.boolean(),
            numberingColor: z.string(),
            numberingEnd: z.number(),
            numberingStart: z.number(),
            other: z.string(),
            padding: z.boolean(),
            orderId: z.string().optional().nullable(), // Allow optional and nullable
            workOrderId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.processingOptions.create({
                data: {
                    cutting: input.cutting,
                    drilling: input.drilling,
                    folding: input.folding,
                    numberingColor: input.numberingColor,
                    numberingEnd: input.numberingEnd,
                    numberingStart: input.numberingStart,
                    other: input.other,
                    padding: input.padding,
                    // Conditionally add Order connection if orderId is present and not empty
                    ...(input.orderId ? { Order: { connect: { id: input.orderId } } } : {}),
                    WorkOrder: {
                        connect: {
                            id: input.workOrderId,
                        },
                    },
                },
            });
        }),

    // Update processing options
    // if orderId is not provided (or is an empty string), it will be set to null
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            cutting: z.boolean(),
            drilling: z.boolean(),
            folding: z.boolean(),
            numberingColor: z.string(),
            numberingEnd: z.number(),
            numberingStart: z.number(),
            other: z.string(),
            padding: z.boolean(),
            orderId: z.string().optional().nullable(), // Allow optional and nullable
            workOrderId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.processingOptions.update({
                where: {
                    id: input.id,
                },
                data: {
                    cutting: input.cutting,
                    drilling: input.drilling,
                    folding: input.folding,
                    numberingColor: input.numberingColor,
                    numberingEnd: input.numberingEnd,
                    numberingStart: input.numberingStart,
                    other: input.other,
                    padding: input.padding,
                    // Conditionally add or remove orderId
                    ...(input.orderId ? { orderId: input.orderId } : {}),
                    workOrderId: input.workOrderId,
                },
            });
        }),

    delete: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            return ctx.db.processingOptions.delete({
                where: {
                    id: input,
                },
            });
        }),
});