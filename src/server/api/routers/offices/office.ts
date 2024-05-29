// /src/server/api/routers/offices/office.ts
// trpc endpoint for getting, updating, and deleting an office
// offices are nested under companies

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";
import { z } from "zod";
import { Office } from "@prisma/client"; // Import the Office model

export const officeRouter = createTRPCRouter({
    // Get an Office by ID
    getById: protectedProcedure
        .input(z.string()).query(({ ctx, input }) => {
            return ctx.db.office.findUnique({
                where: {
                    id: input,
                },
                include: {
                    Addresses: true, // Include the Address associated with the Office
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
        .input(z.string()).query(({ ctx, input }) => {
            return ctx.db.office.findMany({
                where: {
                    companyId: input,
                },
                include: {
                    Addresses: true, // Include the Address associated with the Office
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
    // Return Offices
    getAll: protectedProcedure
        .query(({ ctx }) => {
            return ctx.db.office.findMany();
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
            Address: z.object({
                id: z.string(),
                line1: z.string(),
                line2: z.string().optional(),
                city: z.string(),
                state: z.string(),
                zipCode: z.string(),
                country: z.string(),
                telephoneNumber: z.string(),
            }),
        })).mutation(({ ctx, input }) => {
            return ctx.db.office.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.name,
                    Addresses: {
                        update: {
                            where: {
                                id: input.Address.id,
                            },
                            data: {
                                line1: input.Address.line1,
                                line2: input.Address.line2,
                                city: input.Address.city,
                                state: input.Address.state,
                                zipCode: input.Address.zipCode,
                                country: input.Address.country,
                                telephoneNumber: input.Address.telephoneNumber,
                            },
                        },
                    },
                },
            });
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
});
