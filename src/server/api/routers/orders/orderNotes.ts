import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const orderNoteRouter = createTRPCRouter({
    getByID: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.orderNote.findUnique({
            where: {
                id: input,
            },
            include: {
                User: true
            }
        });
    }),

    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.orderNote.findMany({
            include: {
                User: true
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
                    userId: ctx.session.user.id
                }
            });
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            note: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
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
            return ctx.db.orderNote.delete({
                where: {
                    id: input
                }
            });
        }),
});