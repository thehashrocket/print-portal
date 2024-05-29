import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";
import { z } from "zod";
import { Company } from "@prisma/client"; // Import the Company model

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
                        }, // Include the Offices associated with the Company
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
                                totalCost: true,
                                status: true,
                            },
                        },
                        Orders: {
                            select: {
                                totalCost: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        });

        const companyDashboardData = companies.map((company) => {
            const workOrderTotalPending = company.Offices.reduce((total, office) => {
                const pendingWorkOrders = office.WorkOrders.filter(
                    (workOrder) =>
                        workOrder.status !== 'Approved' && workOrder.status !== 'Cancelled'
                );
                const pendingTotal = pendingWorkOrders.reduce(
                    (sum, workOrder) => sum + Number(workOrder.totalCost || 0),
                    0
                );
                return total + pendingTotal;
            }, 0);

            const orderTotalPending = company.Offices.reduce((total, office) => {
                const pendingOrders = office.Orders.filter(
                    (order) =>
                        order.status !== 'Cancelled' &&
                        order.status !== 'PaymentReceived' &&
                        order.status !== 'Completed'
                );
                const pendingTotal = pendingOrders.reduce(
                    (sum, order) => sum + Number(order.totalCost || 0),
                    0
                );
                return total + pendingTotal;
            }, 0);

            const orderTotalCompleted = company.Offices.reduce((total, office) => {
                const completedOrders = office.Orders.filter(
                    (order) =>
                        order.status === 'PaymentReceived' || order.status === 'Completed'
                );
                const completedTotal = completedOrders.reduce(
                    (sum, order) => sum + Number(order.totalCost || 0),
                    0
                );
                return total + completedTotal;
            }, 0);

            return {
                id: company.id,
                name: company.name,
                workOrderTotalPending,
                orderTotalPending,
                orderTotalCompleted,
            };
        });

        return companyDashboardData;
    }),
});