// /src/server/api/routers/offices/office.ts
// trpc endpoint for getting, updating, and deleting an office
// offices are nested under companies

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";
import { z } from "zod";
import { Address, AddressType, Office } from "@prisma/client"; // Import the Office model
import { TRPCError } from "@trpc/server";

export const officeRouter = createTRPCRouter({
    // Get an Office by ID
    getById: protectedProcedure
        .input(z.string()).query(({ ctx, input }) => {
            return ctx.db.office.findUnique({
                where: {
                    id: input,
                    deleted: false,
                },
                include: {
                    Addresses: {
                        where: {
                            deleted: false,
                        },
                    }, // Include the Address associated with the Office
                    // Only include the Company Name and nothing else.
                    Company: {
                        select: {
                            name: true,
                        },
                    },
                    WorkOrders: {
                        include: {
                            WorkOrderItems: true, // Include the WorkOrderItems associated with the WorkOrder
                        },
                    },
                    Orders: {
                        include: {
                            OrderItems: true, // Include the OrderItems associated with the Order
                        },
                    },
                },
            });
        }),
    // Get Offices by Company ID
    getByCompanyId: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            return ctx.db.office.findMany({
                where: {
                    companyId: input,
                    deleted: false,
                },
                include: {
                    Company: true,
                },
            });
        }),
    // Return Offices
    getAll: protectedProcedure
        .query(async ({ ctx }) => {
            // Check if the user has permission to view all offices
            const canViewOffices = ctx.session.user.Roles.includes("Admin") ||
                ctx.session.user.Permissions.includes("office_read");

            if (!canViewOffices) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't have permission to view all offices",
                });
            }

            return ctx.db.office.findMany({
                include: {
                    Company: true,
                },
            });
        }),
    // Create an Office
    create: protectedProcedure
        .input(z.object({
            name: z.string(),
            companyId: z.string(),
            Addresses: z.array(z.object({
                line1: z.string(),
                line2: z.string().optional(),
                city: z.string(),
                state: z.string(),
                zipCode: z.string(),
                country: z.string(),
                telephoneNumber: z.string(),
            })),
        })).mutation(({ ctx, input }) => {
            return ctx.db.office.create({
                data: {
                    name: input.name,
                    createdBy: {
                        connect: {
                            id: ctx.session.user.id,
                        },
                    },
                    Company: {
                        connect: {
                            id: input.companyId,
                        },
                    },
                    Addresses: {
                        create: input.Addresses.map((address) => ({
                            line1: address.line1,
                            line2: address.line2,
                            city: address.city,
                            state: address.state,
                            zipCode: address.zipCode,
                            country: address.country,
                            telephoneNumber: address.telephoneNumber,
                        })),
                    },
                },
            });
        }),
    // Update an Office
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string(),
            addresses: z.array(z.object({
                addressType: z.nativeEnum(AddressType),
                city: z.string(),
                country: z.string(),
                deleted: z.boolean().optional(),
                id: z.string().optional(), // Optional for new addresses
                line1: z.string(),
                line2: z.string().optional(),
                officeId: z.string(),
                state: z.string(),
                telephoneNumber: z.string(),
                zipCode: z.string(),
            })),
        })).mutation(async ({ ctx, input }) => {
            // First update the office name
            await ctx.db.office.update({
                where: { id: input.id },
                data: { name: input.name },
            });

            // Handle addresses
            for (const address of input.addresses) {
                if (address.id?.startsWith('temp-')) {
                    // Create new address
                    await ctx.db.address.create({
                        data: {
                            line1: address.line1,
                            line2: address.line2,
                            city: address.city,
                            deleted: address.deleted,
                            state: address.state,
                            zipCode: address.zipCode,
                            country: address.country,
                            telephoneNumber: address.telephoneNumber,
                            addressType: address.addressType,
                            Office: { connect: { id: input.id } },
                        },
                    });
                } else if (address.id) {
                    // Update existing address
                    await ctx.db.address.update({
                        where: { id: address.id },
                        data: {
                            line1: address.line1,
                            line2: address.line2,
                            city: address.city,
                            deleted: address.deleted,
                            state: address.state,
                            zipCode: address.zipCode,
                            country: address.country,
                            telephoneNumber: address.telephoneNumber,
                            addressType: address.addressType,
                        },
                    });
                }
            }

            const updatedOffice = await ctx.db.office.findUnique({
                where: { id: input.id },
                include: { Addresses: { where: { deleted: false } } },
            });

            return updatedOffice;
        }),
    // Delete an Office
    delete: protectedProcedure
        .input(z.string()).mutation(({ ctx, input }) => {
            return ctx.db.office.delete({
                where: {
                    id: input,
                },
            });
        }),
    // Add this new endpoint for soft-deleting addresses
    deleteAddress: protectedProcedure
        .input(z.string()) // address id
        .mutation(async ({ ctx, input }) => {
            await ctx.db.address.update({
                where: { id: input },
                data: { deleted: true }
            });

            return { success: true };
        }),
});
