// /src/server/api/routers/shared/typesetting/typesetting.ts
// This file contains the typesetting router which is used to handle all typesetting related requests.
// ~/server/api/trpc.ts is a file that contains the createTRPCRouter function which is used to create a router for handling requests.
// The typesetting router has the following procedures:
// getById: This procedure gets a typesetting record by its ID.
// getByOrderItemID: This procedure gets all typesetting records associated with an order item.
// getByWorkOrderItemID: This procedure gets all typesetting records associated with a work order item.
// getAll: This procedure gets all typesetting records.
// create: This procedure creates a new typesetting record.
// update: This procedure updates an existing typesetting record.
// delete: This procedure deletes a typesetting record.

import { get } from "http";
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";
import { Prisma, TypesettingStatus } from "@prisma/client";
import { create } from "domain";
import { types } from "util";

export const typesettingRouter = createTRPCRouter({
    getById: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
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
    getByOrderItemID: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.typesetting.findMany({
            where: {
                orderItemId: input,
            },
            include: {
                TypesettingOptions: true,
                TypesettingProofs: {
                    include: {
                        artwork: true,
                    }
                },
            }
        });
    }),
    getByWorkOrderItemID: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.typesetting.findMany({
            where: {
                workOrderItemId: input,
            },
            include: {
                TypesettingOptions: true,
                TypesettingProofs: true,
            }
        });
    }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.typesetting.findMany();
    }),

    create: protectedProcedure
        .input(z.object({
            approved: z.boolean(),
            cost: z.number().optional().default(0),
            dateIn: z.date(),
            followUpNotes: z.string().optional().default(""),
            orderItemId: z.string().optional().nullable(),
            plateRan: z.string().optional().nullable(),
            prepTime: z.number().optional().nullable(),
            status: z.nativeEnum(TypesettingStatus),
            timeIn: z.string(),
            workOrderItemId: z.string().optional().nullable(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.typesetting.create({
                data: {
                    ...(input.orderItemId ? { orderItemId: input.orderItemId } : {}),
                    ...(input.workOrderItemId ? { workOrderItemId: input.workOrderItemId } : {}),
                    approved: input.approved,
                    cost: input.cost ? new Prisma.Decimal(input.cost) : null, // Ensure correct type for cost
                    dateIn: input.dateIn,
                    followUpNotes: input.followUpNotes,
                    plateRan: input.plateRan,
                    prepTime: input.prepTime,
                    status: input.status,
                    timeIn: input.timeIn,
                    createdById: ctx.session.user.id, // Ensure createdById is always a string
                },
            });
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            approved: z.boolean(),
            cost: z.number().optional().nullable(),
            dateIn: z.date(),
            followUpNotes: z.string().optional().nullable(),
            orderItemId: z.string().optional().nullable(),
            plateRan: z.string().optional().nullable(),
            prepTime: z.number().optional().nullable(),
            status: z.nativeEnum(TypesettingStatus),
            timeIn: z.string(),
            workOrderItemId: z.string().optional().nullable(),
            TypesettingOptions: z.array(z.object({
                option: z.string(),
                selected: z.boolean(),
                createdAt: z.date().default(() => new Date()),
                updatedAt: z.date().default(() => new Date()),
            })).optional().nullable(),
            TypesettingProofs: z.array(z.object({
                approved: z.boolean().default(false),
                dateSubmitted: z.string(),
                notes: z.string(),
                proofCount: z.number(),
                proofNumber: z.number(),
                typesettingId: z.string(),
                createdAt: z.date().default(() => new Date()),
                updatedAt: z.date().default(() => new Date()),
            })).optional().nullable(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.typesetting.update({
                where: { id: input.id },
                data: {
                    ...(input.orderItemId ? { orderItemId: input.orderItemId } : {}),
                    ...(input.workOrderItemId ? { workOrderItemId: input.workOrderItemId } : {}),
                    approved: input.approved,
                    cost: input.cost ? new Prisma.Decimal(input.cost) : 0, // Ensure correct type for cost
                    dateIn: input.dateIn,
                    followUpNotes: input.followUpNotes,
                    plateRan: input.plateRan,
                    prepTime: input.prepTime,
                    status: input.status,
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