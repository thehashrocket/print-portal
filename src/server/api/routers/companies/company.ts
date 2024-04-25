import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";
import { z } from "zod";
import { Company } from "@prisma/client"; // Import the Company model

// Get a Company by ID
export const companyRouter = createTRPCRouter({
    getByID: protectedProcedure
        .input(z.string()).query(({ ctx, input }) => {
            return ctx.db.company.findUnique({
                where: {
                    id: input,
                },
                include: {
                    Offices: {
                        include: {
                            Addresses: true, // Include the Address associated with the Office
                            WorkOrders: true, // Include the WorkOrders associated with the Office
                            Orders: true, // Include the Orders associated with the Office
                        }
                    }, // Include the Offices associated with the Company
                },
            });
        }),
    // Return Companies
    getAll: protectedProcedure
        .query(({ ctx }) => {
            return ctx.db.company.findMany();
        }),
    // Create a Company
    create: protectedProcedure
        .input(z.object({
            name: z.string(),
            Offices: z.array(z.object({
                name: z.string(),
                Addresses: z.array(z.object({
                    line1: z.string(),
                    line2: z.string(),
                    city: z.string(),
                    state: z.string(),
                    zipCode: z.string(),
                    country: z.string(),
                    telephoneNumber: z.string(),
                })),
            })),
        })).mutation(({ ctx, input }) => {
            return ctx.db.company.create({
                data: {
                    name: input.name,
                },
            });
        }),
    // Update a Company
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string(),
        })).mutation(({ ctx, input }) => {
            return ctx.db.company.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.name,
                },
            });
        }),
    // Delete a Company
    delete: protectedProcedure
        .input(z.string()).mutation(({ ctx, input }) => {
            return ctx.db.company.delete({
                where: {
                    id: input,
                },
            });
        }),
});