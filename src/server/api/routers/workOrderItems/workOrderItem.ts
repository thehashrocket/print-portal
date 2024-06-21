// Purpose: Router for WorkOrderItems. This file contains all the procedures for WorkOrderItems.
// This file is imported into the main API router in src/server/api/routers/index.ts.

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
    // Create a new WorkOrderItem
    createWorkOrderItem: protectedProcedure
        .input(z.object({
            amount: z.number(),
            approved: z.boolean(),
            cs: z.string(),
            description: z.string(),
            expectedDate: z.date(),
            finishedQty: z.number(),
            inkColor: z.string(),
            other: z.string(),
            pressRun: z.string(),
            quantity: z.number(),
            size: z.string(),
            specialInstructions: z.string(),
            status: z.nativeEnum(WorkOrderItemStatus),
            stockOnHand: z.boolean(),
            stockOrdered: z.string(),
            workOrderId: z.string(),
        }))
        .mutation(({ ctx, input }) => {
            return ctx.db.workOrderItem.create({
                data: {
                    amount: input.amount,
                    approved: input.approved,
                    createdById: ctx.session.user.id,
                    cs: input.cs,
                    description: input.description,
                    expectedDate: input.expectedDate,
                    finishedQty: input.finishedQty,
                    inkColor: input.inkColor,
                    other: input.other,
                    pressRun: input.pressRun,
                    quantity: input.quantity,
                    size: input.size,
                    specialInstructions: input.specialInstructions,
                    status: input.status,
                    stockOnHand: input.stockOnHand,
                    stockOrdered: input.stockOrdered,
                    workOrderId: input.workOrderId,
                },
            });
        }),
});