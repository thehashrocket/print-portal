import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";
import { z } from "zod";
import { WorkOrderItemStatus } from "@prisma/client";

export const workOrderItemRouter = createTRPCRouter({
    // Get a WorkOrderItem by ID
    getByID: protectedProcedure
        .input(z.string()).query(({ ctx, input }) => {
            return ctx.db.workOrderItem.findUnique({
                where: {
                    id: input,
                },
            });
        }),
    // Get all WorkOrderItems
    getAll: protectedProcedure.query(({ ctx }) => {
        return ctx.db.workOrderItem.findMany();
    }),
    updateStatus: protectedProcedure
        .input(z.object({
            id: z.string(),
            status: z.nativeEnum(WorkOrderItemStatus),
        }))
        .mutation(({ ctx, input }) => {
            return ctx.db.workOrderItem.update({
                where: {
                    id: input.id,
                },
                data: {
                    status: input.status,
                },
            });
        }),
});