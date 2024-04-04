import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const typesettingRouter = createTRPCRouter({
    getById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.typesetting.findUnique({
            where: {
                id: input,
            },
            include: {
                TypesettingOptions: true,
                TypesettingProofs: true,
            }
        });
    }),

    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.typesetting.findMany();
    }),

    create: protectedProcedure
        .input(z.object({
            workOrderId: z.string(),
            orderId: z.string().optional().nullable(),
            dateIn: z.string(),
            timeIn: z.string(),
            cost: z.number(),
            approved: z.boolean(),
            prepTime: z.number(),
            plateRan: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.typesetting.create({
                data: {
                    workOrderId: input.workOrderId,
                    ...(input.orderId ? { orderId: input.orderId } : {}),
                    dateIn: input.dateIn,
                    timeIn: input.timeIn,
                    cost: input.cost,
                    approved: input.approved,
                    prepTime: input.prepTime,
                    plateRan: input.plateRan,
                },
            });
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            workOrderId: z.string(),
            orderId: z.string().optional().nullable(),
            dateIn: z.string(),
            timeIn: z.string(),
            cost: z.number(),
            approved: z.boolean(),
            prepTime: z.number(),
            plateRan: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.typesetting.update({
                where: {
                    id: input.id,
                },
                data: {
                    workOrderId: input.workOrderId,
                    ...(input.orderId ? { orderId: input.orderId } : {}),
                    dateIn: input.dateIn,
                    timeIn: input.timeIn,
                    cost: input.cost,
                    approved: input.approved,
                    prepTime: input.prepTime,
                    plateRan: input.plateRan,
                },
            });
        }),

    delete: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            return ctx.db.typesetting.delete({
                where: {
                    id: input,
                },
            });
        }),
});