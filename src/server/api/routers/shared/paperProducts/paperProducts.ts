// This file is for shared paper products that are used in multiple places in the app.
// This is to avoid having to create a new paper product for each order.
// Instead, we can just use the shared paper product.

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { type Prisma } from "@prisma/client";
import { PaperBrand, PaperType, PaperFinish } from "@prisma/client";

export const paperProductsRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.paperProduct.findMany();
    }),

    create: protectedProcedure
        .input(z.object({
            brand: z.nativeEnum(PaperBrand).default(PaperBrand.Other),
            paperType: z.nativeEnum(PaperType).default(PaperType.Other),
            finish: z.nativeEnum(PaperFinish).default(PaperFinish.Other),
            weightLb: z.number().optional(),
            caliper: z.number().optional(),
            size: z.string().optional(),
            width: z.number().optional(),
            height: z.number().optional(),
            mWeight: z.number().optional(),
            sheetsPerUnit: z.number().optional(),
            referenceId: z.string().optional(),
            customDescription: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const data: Prisma.PaperProductCreateInput = {
                width: input.width ?? 0,
                height: input.height ?? 0,
                mWeight: input.mWeight ?? 0,
                sheetsPerUnit: input.sheetsPerUnit ?? 0,
                referenceId: input.referenceId ?? `custom-${Date.now()}`,
                brand: input.brand,
                paperType: input.paperType,
                finish: input.finish,
                weightLb: input.weightLb ?? null,
                caliper: input.caliper ?? null,
                size: input.size ?? null,
                customDescription: input.customDescription ?? null,
            };

            return await ctx.db.paperProduct.create({
                data,
            });
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            brand: z.nativeEnum(PaperBrand).default(PaperBrand.Other),
            paperType: z.nativeEnum(PaperType).default(PaperType.Other),
            finish: z.nativeEnum(PaperFinish).default(PaperFinish.Other),
            weightLb: z.number().optional(),
            caliper: z.number().optional(),
            size: z.string().optional(),
            width: z.number().optional(),
            height: z.number().optional(),
            mWeight: z.number().optional(),
            sheetsPerUnit: z.number().optional(),
            referenceId: z.string().optional(),
            customDescription: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, ...updateData } = input;
            const data: Prisma.PaperProductUpdateInput = {
                brand: updateData.brand,
                paperType: updateData.paperType,
                finish: updateData.finish,
                weightLb: updateData.weightLb ?? undefined,
                caliper: updateData.caliper ?? undefined,
                size: updateData.size ?? undefined,
                width: updateData.width ?? undefined,
                height: updateData.height ?? undefined,
                mWeight: updateData.mWeight ?? undefined,
                sheetsPerUnit: updateData.sheetsPerUnit ?? undefined,
                referenceId: updateData.referenceId ?? undefined,
                customDescription: updateData.customDescription ?? undefined,
            };

            return await ctx.db.paperProduct.update({
                where: { id },
                data,
            });
        }),
}); 