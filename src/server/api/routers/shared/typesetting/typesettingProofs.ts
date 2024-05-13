// This class is used to generate the typesetting proofs for the typesetting process.

import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const typesettingProofsRouter = createTRPCRouter({
    getByID: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.typesettingProof.findUnique({
            where: {
                id: input,
            },
        });
    }),

    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.typesettingProof.findMany();
    }),

    create: protectedProcedure
        .input(z.object({
            typesettingId: z.string(),
            proofNumber: z.number(),
            dateSubmitted: z.string(),
            approved: z.boolean(),
            notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.typesettingProof.create({
                data: {
                    typesettingId: input.typesettingId,
                    proofNumber: input.proofNumber,
                    dateSubmitted: input.dateSubmitted,
                    approved: input.approved,
                    notes: input.notes,
                    createdById: ctx.session.user.id,
                },
            });
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            typesettingId: z.string(),
            proofNumber: z.number(),
            dateSubmitted: z.string(),
            approved: z.boolean(),
            notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.typesettingProof.update({
                where: {
                    id: input.id,
                },
                data: {
                    typesettingId: input.typesettingId,
                    proofNumber: input.proofNumber,
                    dateSubmitted: input.dateSubmitted,
                    approved: input.approved,
                    notes: input.notes,
                },
            });
        }),

    delete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        return ctx.db.typesettingProof.delete({
            where: {
                id: input,
            },
        });
    }),
});