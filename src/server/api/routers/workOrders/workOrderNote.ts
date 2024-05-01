import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const workOrderNoteRouter = createTRPCRouter({
    getByID: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.workOrderNote.findUnique({
            where: {
                id: input,
            },
            include: {
                createdBy: true
            }
        });
    }),

    getAll: publicProcedure.query(async ({ ctx }) => {
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
            return ctx.db.workOrderNote.delete({
                where: {
                    id: input
                }
            });
        }),
});