// /src/server/api/routers/offices/office.ts
// trpc endpoint for getting, updating, and deleting an office
// offices are nested under companies

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { AddressType } from "@prisma/client"; // Import the Office model
import { TRPCError } from "@trpc/server";
import { normalizeOffice } from "~/utils/dataNormalization";

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
            isActive: z.boolean().optional(),
            Addresses: z.array(z.object({
                name: z.string().optional(),
                line1: z.string(),
                line2: z.string().optional(),
                line3: z.string().optional(),
                line4: z.string().optional(),
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
                            name: address.name ?? '',
                            line1: address.line1,
                            line2: address.line2,
                            line3: address.line3,
                            line4: address.line4,
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
            isActive: z.boolean().optional(),
            addresses: z.array(z.object({
                addressType: z.nativeEnum(AddressType),
                city: z.string(),
                country: z.string(),
                deleted: z.boolean().optional(),
                id: z.string().optional(), // Optional for new addresses
                line1: z.string(),
                line2: z.string().optional(),
                line3: z.string().optional(),
                line4: z.string().optional(),
                name: z.string().optional(),
                officeId: z.string(),
                state: z.string(),
                telephoneNumber: z.string(),
                zipCode: z.string(),
            })),
        })).mutation(async ({ ctx, input }) => {
            // First update the office name
            await ctx.db.office.update({
                where: { id: input.id },
                data: { name: input.name, isActive: input.isActive },
            });

            // Handle addresses
            for (const address of input.addresses) {
                if (address.id?.startsWith('temp-')) {
                    // Create new address
                    await ctx.db.address.create({
                        data: {
                            name: address.name ?? '',
                            line1: address.line1,
                            line2: address.line2,
                            line3: address.line3,
                            line4: address.line4,
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
                    const updateData: Record<string, any> = {
                        line1: address.line1,
                        city: address.city,
                        state: address.state,
                        zipCode: address.zipCode,
                        country: address.country,
                        telephoneNumber: address.telephoneNumber,
                        addressType: address.addressType,
                    };

                    // Only add optional fields if they are defined
                    if (address.name !== undefined) updateData.name = address.name;
                    if (address.line2 !== undefined) updateData.line2 = address.line2;
                    if (address.line3 !== undefined) updateData.line3 = address.line3;
                    if (address.line4 !== undefined) updateData.line4 = address.line4;
                    if (address.deleted !== undefined) updateData.deleted = address.deleted;

                    await ctx.db.address.update({
                        where: { id: address.id },
                        data: updateData,
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
    // Get the walk-in office
    getWalkInOffice: protectedProcedure
        .query(async ({ ctx }) => {
            const walkInOffice = await ctx.db.office.findFirst({
                where: {
                    isWalkInOffice: true,
                    deleted: false,
                },
                include: {
                    Addresses: {
                        where: { deleted: false }
                    },
                    Company: {
                        select: { name: true }
                    },
                    WorkOrders: false,
                    Orders: false
                }
            });

            if (!walkInOffice) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Walk-in office not found. Please configure a walk-in office in the system.",
                });
            }

            return normalizeOffice(walkInOffice);
        }),
});
