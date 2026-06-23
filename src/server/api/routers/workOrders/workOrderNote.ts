// /src/server/api/routers/workOrders/workOrderNote.ts
// This file contains the workOrderNote router which is used to handle all work order note related requests.
// ~/server/api/trpc.ts is a file that contains the createTRPCRouter function which is used to create a router for handling requests.

import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { assertNoteOwnership } from "~/server/api/routers/shared/noteOwnership";

export const workOrderNoteRouter = createTRPCRouter({
    getByID: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.workOrderNote.findUnique({
            where: {
                id: input,
            },
            include: {
                createdBy: true
            }
        });
    }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.workOrderNote.findMany({
            include: {
                createdBy: true
            }
        });
    }),

    create: protectedProcedure
        .input(z.object({
            note: z.string(),
            workOrderId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.workOrderNote.create({
                data: {
                    note: input.note,
                    workOrderId: input.workOrderId,
                    createdById: ctx.session.user.id
                }
            });
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            note: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.db.workOrderNote.findUnique({
                where: { id: input.id },
                select: { createdById: true },
            });
            assertNoteOwnership(existing, ctx, "Work order note");

            return ctx.db.workOrderNote.update({
                where: {
                    id: input.id
                },
                data: {
                    note: input.note
                }
            });
        }),

    delete: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.db.workOrderNote.findUnique({
                where: { id: input },
                select: { createdById: true },
            });
            assertNoteOwnership(existing, ctx, "Work order note");

            return ctx.db.workOrderNote.delete({
                where: {
                    id: input
                }
            });
        }),
});