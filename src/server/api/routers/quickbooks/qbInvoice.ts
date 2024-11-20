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

    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
        parseAttributeValue: true
    });

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

async function fetchInvoicesForOffice(ctx: any, accessToken: string, quickbooksRealmId: string, customerId: string) {
    let query = `SELECT * from Invoice WHERE CustomerRef = '${customerId}'`;

    const baseUrl = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox'
        ? 'https://sandbox-quickbooks.api.intuit.com'
        : 'https://quickbooks.api.intuit.com';

    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
        parseAttributeValue: true
    });

    const queryUrl = `${baseUrl}/v3/company/${quickbooksRealmId}/query?query=${encodeURIComponent(query)}`;

    const response = await axios.get(queryUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/xml',
        }
    });
    const result = parser.parse(response.data);
    const totalCount = result.IntuitResponse.QueryResponse.totalCount;
    const invoices = result.IntuitResponse.QueryResponse.Invoice;

    console.log('invoices', invoices);
    return invoices;
}

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

    // Create a QuickBooks Invoice from an Invoice
    createQbInvoiceFromInvoice: protectedProcedure
        .input(z.object({ invoiceId: z.string() }))
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

            const invoice = await ctx.db.invoice.findUnique({
                where: { id: input.invoiceId },
                include: {
                    InvoiceItems: true,
                    Order: {
                        include: {
                            Office: true,
                            ShippingInfo: {
                                include: {
                                    Address: true,
                                }
                            },
                        }
                    }
                },
            });

            if (!invoice) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Invoice not found',
                });
            }

            if (!invoice.Order.Office.quickbooksCustomerId) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Office does not have a QuickBooks Customer ID',
                });
            }

            const invoiceData = {
                Line: [
                    ...invoice.InvoiceItems.map(item => ({
                        DetailType: "SalesItemLineDetail",
                        Description: formatItemDescription(item),
                        Amount: item.total?.toNumber() ?? 0,
                        SalesItemLineDetail: {
                            Qty: item.quantity,
                            UnitPrice: (item.total?.toNumber() ?? 0) / (item.quantity || 1),
                        }
                    })),
                    ...(invoice.Order.ShippingInfo ? [{
                        DetailType: "SalesItemLineDetail",
                        Description: "Shipping",
                        Amount: invoice.Order.ShippingInfo.shippingCost?.toNumber() ?? 0,
                        SalesItemLineDetail: {
                            Qty: 1,
                            UnitPrice: invoice.Order.ShippingInfo.shippingCost?.toNumber() ?? 0,
                        }
                    }] : []),
                ],
                CustomerRef: {
                    value: invoice.Order.Office.quickbooksCustomerId,
                },
                ShipAddr: invoice.Order.ShippingInfo?.Address ? {
                    Line1: invoice.Order.ShippingInfo.Address.line1,
                    City: invoice.Order.ShippingInfo.Address.city,
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
                // Update the invoice with the QuickBooks Invoice ID
                await ctx.db.invoice.update({
                    where: { id: invoice.id },
                    data: {
                        quickbooksId: response.data.Invoice.Id,
                    },
                });

                await ctx.db.order.update({
                    where: { id: invoice.Order.id },
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

    // Create Invoice for an Order
    createQbInvoiceFromOrder: protectedProcedure
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

    // Get a Single Invoice PDF
    getInvoicePdf: protectedProcedure
        .input(z.object({
            quickbooksId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                // Get fresh access token
                const accessToken = await refreshTokenIfNeeded(ctx);

                // Get the company ID from the user's session
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

                const baseUrl = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox'
                    ? 'https://sandbox-quickbooks.api.intuit.com'
                    : 'https://quickbooks.api.intuit.com';

                const response = await axios({
                    method: 'get',
                    url: `${baseUrl}/v3/company/${user.quickbooksRealmId}/invoice/${input.quickbooksId}/pdf?minorversion=73`,
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Accept': 'application/pdf',
                    },
                    responseType: 'arraybuffer' // Important: This ensures we get binary data
                });

                // Convert the binary data to base64
                const pdfBuffer = Buffer.from(response.data);
                const base64Pdf = pdfBuffer.toString('base64');

                return base64Pdf;
            } catch (error) {
                console.error('Error getting invoice PDF:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to get invoice PDF from QuickBooks',
                    cause: error
                });
            }
        }),

    // Send an Invoice Email
    sendInvoiceEmail: protectedProcedure
        .input(z.object({
            quickbooksId: z.string(),
            recipientEmail: z.string().email(),
        }))
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

            const baseUrl = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox'
                ? 'https://sandbox-quickbooks.api.intuit.com'
                : 'https://quickbooks.api.intuit.com';

            const response = await axios.post(
                `${baseUrl}/v3/company/${user.quickbooksRealmId}/invoice/${input.quickbooksId}/send?sendTo=${input.recipientEmail}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/octet-stream',
                    },
                }
            );
            console.log('response', response.data);
            return response.data;

        }),

    // Sync a Single Invoice for an Office
    syncInvoice: protectedProcedure
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

            const invoices = await fetchInvoicesForOffice(ctx, accessToken, user.quickbooksRealmId, order.Office.quickbooksCustomerId);
            return invoices;

        }),

    // Fetch all invoices for all offices
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

    // Sync Invoices for an Office
    syncInvoicesForOffice: protectedProcedure
        .input(z.object({ officeId: z.string() }))
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

            const office = await ctx.db.office.findUnique({
                where: { id: input.officeId },
                select: { quickbooksCustomerId: true },
            });

            if (!office?.quickbooksCustomerId) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Office does not have a QuickBooks Customer ID',
                });
            }

            const invoices = await fetchInvoicesForOffice(ctx, accessToken, user.quickbooksRealmId, office.quickbooksCustomerId);
            return invoices;
        }),

});
