import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";
import { z } from "zod";
import { Company, Prisma } from "@prisma/client"; // Import the Company model
import { formatCurrency } from "~/utils/formatters";
const SALES_TAX = 0.07;

export const companyRouter = createTRPCRouter({
    // Get a Company by ID
    getByID: protectedProcedure
        .input(z.string()).query(async ({ ctx, input }) => {
            const company = await ctx.db.company.findUnique({
                where: {
                    id: input,
                },
                // Include the Offices, Addresses, WorkOrders, and OrderItems associated with the Company
                // Include the sum of the WorkOrderItems and OrderItems
                
                include: {
                    Offices: {
                        include: {
                            Addresses: {
                                where: {
                                    deleted: false,
                                },
                            }, // Include the Address associated with the Office
                            Company: {
                                select: {
                                    name: true,
                                },
                            },
                            WorkOrders: {
                                include: {
                                    WorkOrderItems: {
                                        select: {
                                            id: true,
                                            createdAt: true,
                                            updatedAt: true,
                                            status: true,
                                            createdById: true,
                                            amount: true,
                                            cost: true,
                                            description: true,
                                            expectedDate: true,
                                            workOrderItemNumber: true,
                                            workOrderId: true,
                                            other: true,
                                            ink: true,
                                            size: true,
                                            quantity: true,
                                            specialInstructions: true,
                                            prepTime: true,
                                            shippingAmount: true,
                                        }
                                    }, // Include the WorkOrderItems associated with the WorkOrder
                                },
                            },
                            Orders: {
                                include: {
                                    OrderItems: {
                                        select: {
                                            amount: true,
                                            cost: true,
                                            shippingAmount: true
                                        }
                                    }, // Include the OrderItems associated with the Order
                                }
                            }
                        },
                    },
                },
            })

            if (!company) return null;

            const officesWithTotals = company.Offices.map(office => ({
                ...office,
                WorkOrders: office.WorkOrders.map(workOrder => {

                    const totalCost = workOrder.WorkOrderItems.reduce(
                        (sum, item) => sum.add(item.cost || new Prisma.Decimal(0)),
                        new Prisma.Decimal(0)
                    );
                    const totalItemAmount = workOrder.WorkOrderItems.reduce(
                        (sum, item) => sum.add(item.amount || new Prisma.Decimal(0)),
                        new Prisma.Decimal(0)
                    );
                    const totalShippingAmount = workOrder.WorkOrderItems.reduce(
                        (sum, item) => sum.add(item.shippingAmount || new Prisma.Decimal(0)),
                        new Prisma.Decimal(0)
                    );
                    const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
                    const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
                    const totalAmount = calculatedSubTotal.add(calculatedSalesTax);

                    return {
                        ...workOrder,
                        totalCost,
                        totalItemAmount,
                        totalShippingAmount,
                        calculatedSubTotal,
                        calculatedSalesTax,
                        totalAmount
                    };
                }),
                Orders: office.Orders.map(order => {
                    const totalCost = order.OrderItems.reduce(
                        (sum, item) => sum.add(item.cost || new Prisma.Decimal(0)),
                        new Prisma.Decimal(0)
                    );
                    const totalItemAmount = order.OrderItems.reduce(
                        (sum, item) => sum.add(item.amount || new Prisma.Decimal(0)),
                        new Prisma.Decimal(0)
                    );
                    const totalShippingAmount = order.OrderItems.reduce(
                        (sum, item) => sum.add(item.shippingAmount || new Prisma.Decimal(0)),
                        new Prisma.Decimal(0)
                    );
                    const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
                    const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
                    const totalAmount = calculatedSubTotal.add(calculatedSalesTax);

                    return {
                        ...order,
                        totalCost,
                        totalItemAmount,
                        totalShippingAmount,
                        calculatedSubTotal,
                        calculatedSalesTax,
                        totalAmount
                    };
                }),
            }));

            const totalWorkOrderAmount = officesWithTotals.reduce((sum, office) => {
                return sum.add(office.WorkOrders.reduce((orderSum, workOrder) => {
                    return orderSum.add(workOrder.totalAmount);
                }, new Prisma.Decimal(0)));
            }, new Prisma.Decimal(0));

            const totalOrderAmount = officesWithTotals.reduce((sum, office) => {
                return sum.add(office.Orders.reduce((orderSum, order) => {
                    return orderSum.add(order.totalAmount);
                }, new Prisma.Decimal(0)));
            }, new Prisma.Decimal(0));


            return {
                ...company,
                Offices: officesWithTotals,
                totalWorkOrderAmount,
                totalOrderAmount
            };
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
    // Get a Company by ID with detailed financials
    getByIDWithFinancials: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const company = await ctx.db.company.findUnique({
                where: { id: input },
                include: {
                    Offices: {
                        include: {
                            Addresses: true,
                            WorkOrders: {
                                include: {
                                    WorkOrderItems: {
                                        select: {
                                            amount: true,
                                            cost: true
                                        }
                                    }
                                }
                            },
                            Orders: {
                                include: {
                                    OrderItems: {
                                        select: {
                                            amount: true,
                                            cost: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!company) return null;

            return {
                ...company,
                Offices: company.Offices.map(office => ({
                    ...office,
                    WorkOrders: office.WorkOrders.map(workOrder => ({
                        ...workOrder,
                        totalAmount: workOrder.WorkOrderItems.reduce(
                            (sum, item) => sum.add(item.amount || new Prisma.Decimal(0)),
                            new Prisma.Decimal(0)
                        ),
                        totalCost: workOrder.WorkOrderItems.reduce(
                            (sum, item) => sum.add(item.cost || new Prisma.Decimal(0)),
                            new Prisma.Decimal(0)
                        )
                    })),
                    Orders: office.Orders.map(order => ({
                        ...order,
                        totalAmount: order.OrderItems.reduce(
                            (sum, item) => sum.add(item.amount || new Prisma.Decimal(0)),
                            new Prisma.Decimal(0)
                        ),
                        totalCost: order.OrderItems.reduce(
                            (sum, item) => sum.add(item.cost || new Prisma.Decimal(0)),
                            new Prisma.Decimal(0)
                        )
                    }))
                }))
            };
        }),
});