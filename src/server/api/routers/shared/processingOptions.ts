// used by both Orders and WorkOrders. This is a good example of how to share code between routers.

// Path: src/server/api/routers/shared/processingOptions.ts

// Fields include: cutting, drilling, folding, numberingColor, numberingEnd, numberingStart, other, padding, orderItemId, workOrderItemId

import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure
} from "~/server/api/trpc";
import { BindingType } from "@prisma/client";

export const processingOptionsRouter = createTRPCRouter({
    getByID: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.processingOptions.findUnique({
            where: {
                id: input,
            },
        });
    }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.processingOptions.findMany();
    }),

    getByOrderItemId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.processingOptions.findMany({
            where: {
                orderItemId: input,
            },
        });
    }),

    getByWorkOrderItemId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.processingOptions.findMany({
            where: {
                workOrderItemId: input,
            },
        });
    }),

    create: protectedProcedure
        .input(z.object({
            binderyTime: z.number().optional(),
            binding: z.nativeEnum(BindingType).optional(),
            cutting: z.string().optional(),
            description: z.string().optional(),
            drilling: z.string().optional(),
            folding: z.string().optional(),
            name: z.string(), // Add the 'name' property
            numberingColor: z.string().optional(),
            numberingEnd: z.number().optional(),
            numberingStart: z.number().optional(),
            orderItemId: z.string().optional().nullable(), // Allow optional and nullable
            other: z.string(),
            padding: z.string(),
            stitching: z.string().optional(),
            workOrderItemId: z.string().optional().nullable(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.processingOptions.create({
                data: {
                    binderyTime: input.binderyTime,
                    binding: input.binding,
                    cutting: input.cutting,
                    description: input.description,
                    drilling: input.drilling,
                    folding: input.folding,
                    name: input.name, // Include the 'name' property
                    numberingColor: input.numberingColor,
                    numberingEnd: input.numberingEnd,
                    numberingStart: input.numberingStart,
                    other: input.other,
                    padding: input.padding,
                    stitching: input.stitching,
                    createdById: ctx.session.user.id, // Include the 'createdBy' property
                    // Conditionally add or remove orderItemId
                    ...(input.orderItemId ? { orderItemId: input.orderItemId } : {}),
                    // Conditionally add or remove workOrderItemId
                    ...(input.workOrderItemId ? { workOrderItemId: input.workOrderItemId } : {}),

                },
            });
        }),

    // Update processing options
    // if orderItemId is not provided (or is an empty string), it will be set to null
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            binderyTime: z.number().optional(),
            binding: z.nativeEnum(BindingType).optional(),
            cutting: z.string().optional(),
            description: z.string().optional(),
            drilling: z.string().optional(),
            folding: z.string().optional(),
            name: z.string(), // Add the 'name' property
            numberingColor: z.string().optional(),
            numberingEnd: z.number().optional(),
            numberingStart: z.number().optional(),
            other: z.string().optional(),
            padding: z.string().optional(),
            stitching: z.string().optional(),
            orderItemId: z.string().optional().nullable(), // Allow optional and nullable
            workOrderItemId: z.string().optional().nullable(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.processingOptions.update({
                where: {
                    id: input.id,
                },
                data: {
                    binderyTime: input.binderyTime,
                    binding: input.binding,
                    cutting: input.cutting,
                    description: input.description,
                    drilling: input.drilling,
                    folding: input.folding,
                    name: input.name, // Include the 'name' property
                    numberingColor: input.numberingColor,
                    numberingEnd: input.numberingEnd,
                    numberingStart: input.numberingStart,
                    other: input.other,
                    padding: input.padding,
                    stitching: input.stitching,
                    // Conditionally add or remove orderItemId
                    ...(input.orderItemId ? { orderItemId: input.orderItemId } : {}),
                    // Conditionally add or remove workOrderItemId
                    ...(input.workOrderItemId ? { workOrderItemId: input.workOrderItemId } : {}),
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