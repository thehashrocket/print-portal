// This class is used to generate the typesetting proofs for the typesetting process.
// /src/server/api/routers/shared/typesetting/typesettingProofs.ts
import { ProofMethod } from "@prisma/client";
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const typesettingProofsRouter = createTRPCRouter({
    getByID: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.typesettingProof.findUnique({
            where: {
                id: input,
            },
        });
    }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.typesettingProof.findMany();
    }),

    create: protectedProcedure
        .input(z.object({
            approved: z.boolean(),
            dateSubmitted: z.string(),
            notes: z.string().optional(),
            proofCount: z.number(),
            proofMethod: z.nativeEnum(ProofMethod),
            proofNumber: z.number(),
            typesettingId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.typesettingProof.create({
                data: {
                    approved: input.approved,
                    createdById: ctx.session.user.id,
                    dateSubmitted: input.dateSubmitted,
                    notes: input.notes,
                    proofCount: input.proofCount,
                    proofMethod: input.proofMethod,
                    proofNumber: input.proofNumber,
                    typesettingId: input.typesettingId,
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