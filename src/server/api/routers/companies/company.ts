import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";
import { z } from "zod";
import { Company, Prisma } from "@prisma/client"; // Import the Company model

export const companyRouter = createTRPCRouter({
    // Get a Company by ID
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
                            WorkOrders: {
                                include: {
                                    WorkOrderItems: true, // Include the WorkOrderItems associated with the WorkOrder
                                },
                            },
                            Orders: {
                                include: {
                                    OrderItems: true, // Include the OrderItems associated with the Order
                                }
                            }
                        },
                    },
                },
            })
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
    // Company Dashboard Data
    companyDashboard: protectedProcedure.query(async ({ ctx }) => {
        const companies = await ctx.db.company.findMany({
            include: {
                Offices: {
                    include: {
                        WorkOrders: {
                            select: {
                                id: true,
                                status: true,
                            },
                        },
                        Orders: {
                            select: {
                                id: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        });

        const companyDashboardData = await Promise.all(companies.map(async (company) => {
            const workOrderTotalPending = await ctx.db.workOrderItem.aggregate({
                where: {
                    WorkOrder: {
                        officeId: { in: company.Offices.map(office => office.id) },
                        status: { notIn: ['Approved', 'Cancelled'] },
                    },
                },
                _sum: { amount: true },
            });

            const orderTotalPending = await ctx.db.orderItem.aggregate({
                where: {
                    Order: {
                        officeId: { in: company.Offices.map(office => office.id) },
                        status: { notIn: ['Cancelled', 'PaymentReceived', 'Completed'] },
                    },
                },
                _sum: { amount: true },
            });

            const orderTotalCompleted = await ctx.db.orderItem.aggregate({
                where: {
                    Order: {
                        officeId: { in: company.Offices.map(office => office.id) },
                        status: { in: ['PaymentReceived', 'Completed'] },
                    },
                },
                _sum: { amount: true },
            });

            return {
                id: company.id,
                name: company.name,
                quickbooksId: company.quickbooksId || "",
                createdAt: company.createdAt,
                updatedAt: company.updatedAt,
                syncToken: company.syncToken || '0',
                workOrderTotalPending: Number(workOrderTotalPending._sum.amount) || 0,
                orderTotalPending: Number(orderTotalPending._sum.amount) || 0,
                orderTotalCompleted: Number(orderTotalCompleted._sum.amount) || 0,
            };
        }));

        return companyDashboardData;
    }),
});