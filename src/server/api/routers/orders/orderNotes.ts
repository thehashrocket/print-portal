import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { assertNoteOwnership } from "~/server/api/routers/shared/noteOwnership";

export const orderNoteRouter = createTRPCRouter({
    getByID: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.orderNote.findUnique({
            where: {
                id: input,
            },
            include: {
                createdBy: true
            }
        });
    }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.orderNote.findMany({
            include: {
                createdBy: true
            }
        });
    }),

    create: protectedProcedure
        .input(z.object({
            note: z.string(),
            orderId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.orderNote.create({
                data: {
                    note: input.note,
                    orderId: input.orderId,
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
            const existing = await ctx.db.orderNote.findUnique({
                where: { id: input.id },
                select: { createdById: true },
            });
            assertNoteOwnership(existing, ctx, "Order note");

            return ctx.db.orderNote.update({
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
            const existing = await ctx.db.orderNote.findUnique({
                where: { id: input },
                select: { createdById: true },
            });
            assertNoteOwnership(existing, ctx, "Order note");

            return ctx.db.orderNote.delete({
                where: {
                    id: input
                }
            });
        }),
});