import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { refreshTokenIfNeeded } from "~/services/quickbooksService";
import { TRPCError } from "@trpc/server";
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import { z } from 'zod';

async function fetchAllInvoices(ctx: any, accessToken: string, quickbooksRealmId: string, customerId: string) {
    let query = `SELECT * from Invoice`;

    const baseUrl = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox'
        ? 'https://sandbox-quickbooks.api.intuit.com'
        : 'https://quickbooks.api.intuit.com';

    const parser = new XMLParser();

    const queryUrl = `${baseUrl}/v3/company/${quickbooksRealmId}/query?query=${encodeURIComponent(query)}`;

    const response = await axios.get(queryUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/xml',
        }
    });
    console.log(response.data);

    return response.data;
};

function formatItemDescription(item: any): string {
    let description = item.description || '';

    if (item.OrderItemStock && item.OrderItemStock.length > 0) {
        const stock = item.OrderItemStock[0];
        description += ` | Paper: ${stock.description || 'N/A'}`;
    }

    if (item.ProcessingOptions && item.ProcessingOptions.length > 0) {
        const options = item.ProcessingOptions[0];
        description += ` | Processing: ${options.description || 'N/A'}`;
    }

    if (item.Typesetting && item.Typesetting.length > 0) {
        const typesetting = item.Typesetting[0];
        description += ` | Typesetting: ${typesetting.description || 'N/A'}`;
    }

    if (item.quantity) {
        description += ` | Quantity: ${item.quantity}`;
    }

    return description;
}

export const qbInvoiceRouter = createTRPCRouter({
    syncInvoices: protectedProcedure
        .query(async ({ ctx }) => {
            const accessToken = await refreshTokenIfNeeded(ctx);
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { quickbooksRealmId: true },
            });

            // Look through the offices and find the all that has a quickbooksCustomerId
            const offices = await ctx.db.office.findMany({
                where: {
                    quickbooksCustomerId: { not: null }
                }
            });

            // Look through the offices and get the invoices for each office
            const invoices = await Promise.all(offices.map(async (office) => {
                if (office.quickbooksCustomerId && user?.quickbooksRealmId) {
                    return fetchAllInvoices(ctx, accessToken, user.quickbooksRealmId, office.quickbooksCustomerId);
                }
            }));

            return invoices;
        }),

    syncInvoice: protectedProcedure
        .input(z.object({ orderId: z.string() }))
        .mutation(async ({ ctx, input }) => {

        }),

    // Create Invoice for an Order
    createInvoice: protectedProcedure
        .input(z.object({ orderId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const accessToken = await refreshTokenIfNeeded(ctx);
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { quickbooksRealmId: true },
            });

            if (!user?.quickbooksRealmId) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Not authenticated with QuickBooks',
                });
            }

            const order = await ctx.db.order.findUnique({
                where: { id: input.orderId },
                include: {
                    Office: true,
                    OrderItems: {
                        include: {
                            OrderItemStock: true,
                            ProcessingOptions: true,
                            Typesetting: true,
                        }
                    },
                    ShippingInfo: {
                        include: {
                            Address: true,
                        }
                    },
                },
            });

            if (!order) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Order not found',
                });
            }

            if (!order.Office.quickbooksCustomerId) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Office does not have a QuickBooks Customer ID',
                });
            }

            const invoiceData = {
                Line: [
                    ...order.OrderItems.map(item => ({
                        DetailType: "SalesItemLineDetail",
                        Description: formatItemDescription(item),
                        Amount: item.amount?.toNumber() ?? 0,
                        SalesItemLineDetail: {
                            Qty: item.quantity,
                            UnitPrice: (item.amount?.toNumber() ?? 0) / (item.quantity || 1),
                        }
                    })),
                    ...(order.ShippingInfo ? [{
                        DetailType: "SalesItemLineDetail",
                        Description: "Shipping",
                        Amount: order.ShippingInfo.shippingCost?.toNumber() ?? 0,
                        SalesItemLineDetail: {
                            Qty: 1,
                            UnitPrice: order.ShippingInfo.shippingCost?.toNumber() ?? 0,
                        }
                    }] : []),
                ],
                CustomerRef: {
                    value: order.Office.quickbooksCustomerId,
                },
                ShipAddr: order.ShippingInfo?.Address ? {
                    Line1: order.ShippingInfo.Address.line1,
                    City: order.ShippingInfo.Address.city,
                    CountrySubDivisionCode: order.ShippingInfo.Address.state,
                    PostalCode: order.ShippingInfo.Address.zipCode,
                    Country: order.ShippingInfo.Address.country,
                } : undefined,
            };

            const baseUrl = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox'
                ? 'https://sandbox-quickbooks.api.intuit.com'
                : 'https://quickbooks.api.intuit.com';

            try {
                const response = await axios.post(
                    `${baseUrl}/v3/company/${user.quickbooksRealmId}/invoice`,
                    invoiceData,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                // Update the order with the QuickBooks Invoice ID
                await ctx.db.order.update({
                    where: { id: order.id },
                    data: {
                        quickbooksInvoiceId: response.data.Invoice.Id,
                    },
                });

                return response.data;
            } catch (error) {
                console.error('Error creating invoice in QuickBooks:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create invoice in QuickBooks',
                });
            }
        }),
});
