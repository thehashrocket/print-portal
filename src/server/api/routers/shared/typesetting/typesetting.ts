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
            approved: z.boolean(),
            cost: z.number(),
            dateIn: z.string(),
            orderId: z.string().optional().nullable(),
            orderItemId: z.string().optional().nullable(),
            plateRan: z.string(),
            prepTime: z.number(),
            timeIn: z.string(),
            workOrderItemId: z.string().optional().nullable(),
            typesettingOptions: z.array(z.object({
                option: z.string(),
                selected: z.boolean(),
            }).optional().nullable()),
            typesettingProofs: z.array(z.object({
                approved: z.boolean(),
                dateSubmitted: z.string(),
                notes: z.string(),
                proofNumber: z.number(),
            }).optional().nullable()),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.typesetting.create({
                data: {
                    ...(input.orderItemId ? { orderItemId: input.orderItemId } : {}),
                    ...(input.workOrderItemId ? { workOrderItemId: input.workOrderItemId } : {}),
                    approved: input.approved,
                    cost: input.cost,
                    dateIn: input.dateIn,
                    plateRan: input.plateRan,
                    prepTime: input.prepTime,
                    timeIn: input.timeIn,
                    createdById: ctx.session.user, // Add the createdById property

                },
            });
        }),

    update: protectedProcedure
        .input(z.object({
            approved: z.boolean(),
            cost: z.number().optional().nullable(),
            dateIn: z.string(),
            id: z.string(),
            orderItemId: z.string().optional().nullable(),
            plateRan: z.string(),
            prepTime: z.number(),
            timeIn: z.string(),
            workOrderItemId: z.string().nullable().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.typesetting.update({
                where: {
                    id: input.id,
                },
                data: {
                    ...(input.orderItemId ? { orderItemId: input.orderItemId } : {}),
                    ...(input.workOrderItemId ? { workOrderItemId: input.workOrderItemId } : {}),
                    approved: input.approved,
                    cost: input.cost,
                    dateIn: input.dateIn,
                    plateRan: input.plateRan,
                    prepTime: input.prepTime,
                    timeIn: input.timeIn,
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