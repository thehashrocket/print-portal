import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { Prisma } from "@prisma/client"; // Import the Company model
import { normalizeWorkOrder, normalizeOrder, normalizeWalkInCustomer } from "~/utils/dataNormalization";

const SALES_TAX = 0.07;

export const companyRouter = createTRPCRouter({
    // Get a Company by ID
    getByID: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const company = await ctx.db.company.findUnique({
                where: { 
                    id: input,
                    deleted: false 
                },
                include: {
                    Offices: {
                        include: {
                            Company: true,
                            // Get Addresses that are not deleted
                            Addresses: {
                                where: {
                                    deleted: false
                                }
                            },
                            WorkOrders: {
                                include: {
                                    contactPerson: true,
                                    createdBy: true,
                                    Office: {
                                        include: {
                                            Company: true,
                                        }
                                    },
                                    Order: true,
                                    ShippingInfo: {
                                        include: {
                                            Address: true,
                                            ShippingPickup: true,
                                        }
                                    },
                                    WorkOrderItems: {
                                        include: {
                                            artwork: true,
                                            createdBy: true,
                                            Typesetting: {
                                                include: {
                                                    TypesettingOptions: true,
                                                    TypesettingProofs: true,
                                                }
                                            },
                                            ProcessingOptions: true,
                                            ProductType: true,
                                            WorkOrderItemStock: true,
                                        }
                                    },
                                    WorkOrderNotes: true,
                                    WorkOrderVersions: true,
                                    WalkInCustomer: true,
                                }
                            },
                            Orders: {
                                include: {
                                    contactPerson: true,
                                    createdBy: true,
                                    Office: {
                                        include: {
                                            Company: true
                                        }
                                    },
                                    OrderItems: {
                                        include: {
                                            artwork: true,
                                            Order: {
                                                include: {
                                                    Office: {
                                                        include: {
                                                            Company: true
                                                        }
                                                    },
                                                    WorkOrder: true
                                                }
                                            },
                                            OrderItemStock: true,
                                            ProductType: true
                                        }
                                    },
                                    OrderPayments: true,
                                    ShippingInfo: {
                                        include: {
                                            Address: true,
                                            ShippingPickup: true
                                        }
                                    },
                                    Invoice: {
                                        include: {
                                            InvoiceItems: true,
                                            InvoicePayments: true,
                                            createdBy: true
                                        }
                                    },
                                    OrderNotes: true,
                                    WorkOrder: true,
                                    WalkInCustomer: true,
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
                    createdAt: office.createdAt.toISOString(),
                    updatedAt: office.updatedAt.toISOString(),
                    isActive: office.isActive,
                    Company: { name: office.Company.name },
                    Addresses: office.Addresses.map(address => ({
                        ...address,
                        createdAt: address.createdAt.toISOString(),
                        updatedAt: address.updatedAt.toISOString()
                    })),
                    WorkOrders: office.WorkOrders.map(workOrder => {
                        const totalItemAmount = workOrder.WorkOrderItems.reduce(
                            (sum, item) => sum.add(item.amount || new Prisma.Decimal(0)),
                            new Prisma.Decimal(0)
                        );
                        const totalCost = workOrder.WorkOrderItems.reduce(
                            (sum, item) => sum.add(item.cost || new Prisma.Decimal(0)),
                            new Prisma.Decimal(0)
                        );
                        const totalShippingAmount = workOrder.WorkOrderItems.reduce(
                            (sum, item) => sum.add(item.shippingAmount || new Prisma.Decimal(0)),
                            new Prisma.Decimal(0)
                        );
                        const calculatedSalesTax = totalItemAmount.mul(new Prisma.Decimal(0.07));
                        const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
                        const totalAmount = totalItemAmount.add(totalShippingAmount).add(calculatedSalesTax);

                        return normalizeWorkOrder({
                            ...workOrder,
                            calculatedSalesTax,
                            calculatedSubTotal,
                            totalAmount,
                            totalCost,
                            totalItemAmount,
                            totalShippingAmount,
                        });
                    }),
                    Orders: office.Orders.map(order => {
                        const totalItemAmount = order.OrderItems.reduce(
                            (sum, item) => sum.add(item.amount || new Prisma.Decimal(0)),
                            new Prisma.Decimal(0)
                        );
                        const totalCost = order.OrderItems.reduce(
                            (sum, item) => sum.add(item.cost || new Prisma.Decimal(0)),
                            new Prisma.Decimal(0)
                        );
                        const totalShippingAmount = order.OrderItems.reduce(
                            (sum, item) => sum.add(item.shippingAmount || new Prisma.Decimal(0)),
                            new Prisma.Decimal(0)
                        );
                        const calculatedSalesTax = totalItemAmount.mul(new Prisma.Decimal(0.07));
                        const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
                        const totalAmount = totalItemAmount.add(totalShippingAmount).add(calculatedSalesTax);
                        const totalPaid = order.OrderPayments?.reduce(
                            (sum, payment) => sum.add(payment.amount || new Prisma.Decimal(0)),
                            new Prisma.Decimal(0)
                        ) || new Prisma.Decimal(0);
                        const balance = totalAmount.sub(totalPaid);

                        return normalizeOrder({
                            ...order,
                            calculatedSalesTax,
                            calculatedSubTotal,
                            totalAmount,
                            totalCost,
                            totalItemAmount,
                            totalShippingAmount,
                            totalPaid,
                            balance,
                            WalkInCustomer: order.WalkInCustomer ? normalizeWalkInCustomer(order.WalkInCustomer) : null
                        });
                    })
                }))
            };
        }),
    // Return Companies
    getAll: protectedProcedure
        .query(({ ctx }) => {
            return ctx.db.company.findMany({
                where: {
                    deleted: false
                }
            });
        }),
    // Create a Company
    create: protectedProcedure
        .input(z.object({
            name: z.string(),
            Offices: z.array(z.object({
                name: z.string(),
                isActive: z.boolean(),
                Addresses: z.array(z.object({
                    line1: z.string(),
                    line2: z.string(),
                    line3: z.string().optional(),
                    line4: z.string().optional(),
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
                    isActive: true,
                },
            });
        }),
    // Toggle Active
    toggleActive: protectedProcedure
        .input(z.string()).mutation(({ ctx, input }) => {
            return ctx.db.company.findUnique({ where: { id: input } })
                .then(company => {
                    if (!company) {
                        throw new Error('Company not found');
                    }
                    return ctx.db.company.update({
                        where: { id: input },
                        data: { isActive: !company.isActive },
                    });
                });
        }),
    // Update a Company
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string(),
            isActive: z.boolean(),
        })).mutation(({ ctx, input }) => {
            return ctx.db.company.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.name,
                    isActive: input.isActive,
                },
            });
        }),
    // Delete a Company
    delete: protectedProcedure
        .input(z.string()).mutation(({ ctx, input }) => {
            return ctx.db.company.update({
                where: {
                    id: input,
                },
                data: {
                    deleted: true,
                    isActive: false,
                },
            });
        }),
    // Company Dashboard Data
    companyDashboard: protectedProcedure.query(async ({ ctx }) => {
        const companies = await ctx.db.company.findMany({
            where: {
                deleted: false,
            },
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
                isActive: company.isActive,
                deleted: company.deleted,
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
    search: protectedProcedure
        .input(z.object({ searchTerm: z.string() }))
        .query(async ({ ctx, input }) => {
            const { searchTerm } = input;
            
            if (searchTerm.length < 3) {
                return [];
            }
            
            return await ctx.db.company.findMany({
                where: {
                    AND: [
                        {
                            name: {
                                contains: searchTerm,
                                mode: 'insensitive'
                            }
                        },
                        { deleted: false },
                        { isActive: true }
                    ]
                },
                orderBy: {
                    name: 'asc'
                },
                take: 10 // Limit to 10 most relevant results
            });
        }),
});