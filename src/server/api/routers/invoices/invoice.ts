// ~/src/server/api/routers/invoices/invoice.ts

import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { InvoiceStatus, OrderStatus, PaymentMethod, Order, Invoice } from "@prisma/client";
import { sendInvoiceEmail } from "~/utils/sengrid"
import { generateInvoicePDF } from "~/utils/pdfGenerator"
import { TRPCError } from "@trpc/server";
import { normalizeOrder, normalizeOrderItem, normalizeOrderPayment } from "~/utils/dataNormalization";
import { type SerializedOrder, type SerializedOrderItem } from "~/types/serializedTypes";

export const invoiceRouter = createTRPCRouter({
    getAll: protectedProcedure
        .query(async ({ ctx }) => {
            return ctx.db.invoice.findMany({
                include: {
                    Order: true,
                    createdBy: true,
                    InvoiceItems: true,
                    InvoicePayments: true,
                },
            });
        }),

    getById: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            return ctx.db.invoice.findUnique({
                where: { id: input },
                include: {
                    Order: {
                        include: {
                            Office: {
                                include: {
                                    createdBy: true,
                                    Company: true,
                                },
                            },
                        }
                    },
                    createdBy: true,
                    InvoiceItems: true,
                    InvoicePayments: true,
                },
            });
        }),

    create: protectedProcedure
        .input(z.object({
            orderId: z.string(),
            dateIssued: z.date(),
            dateDue: z.date(),
            subtotal: z.number(),
            taxRate: z.number(),
            taxAmount: z.number(),
            total: z.number(),
            status: z.nativeEnum(InvoiceStatus),
            notes: z.string().optional(),
            items: z.array(z.object({
                description: z.string(),
                quantity: z.number(),
                unitPrice: z.number(),
                total: z.number(),
                orderItemId: z.string().optional(),
            })),
        }))
        .mutation(async ({ ctx, input }) => {

            const order = await ctx.db.order.findUnique({
                where: { id: input.orderId },
                include: {
                    OrderItems: true,
                },
            });

            if (!order) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Order not found',
                });
            }

            const invoice = await ctx.db.invoice.create({
                data: {
                    invoiceNumber: await generateInvoiceNumber(ctx),
                    dateIssued: input.dateIssued,
                    dateDue: input.dateDue,
                    subtotal: input.subtotal,
                    taxRate: input.taxRate,
                    taxAmount: input.taxAmount,
                    total: input.total,
                    status: input.status,
                    notes: input.notes,
                    Order: { connect: { id: input.orderId } },
                    createdBy: { connect: { id: ctx.session.user.id } },
                    InvoiceItems: {
                        create: input.items.map(item => ({
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            total: item.total,
                            orderItem: item.orderItemId ? { connect: { id: item.orderItemId } } : undefined,
                        })),
                    },
                },
                include: {
                    InvoiceItems: true,
                },
            });

            // Update order status to Invoiced
            await ctx.db.order.update({
                where: { id: input.orderId },
                data: { status: OrderStatus.Invoicing },
            });

            return invoice;
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            dateIssued: z.date().optional(),
            dateDue: z.date().optional(),
            subtotal: z.number().optional(),
            taxRate: z.number().optional(),
            taxAmount: z.number().optional(),
            total: z.number().optional(),
            status: z.nativeEnum(InvoiceStatus).optional(),
            notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.invoice.update({
                where: { id: input.id },
                data: input,
            });
        }),

    delete: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            return ctx.db.invoice.delete({
                where: { id: input },
            });
        }),

    addPayment: protectedProcedure
        .input(z.object({
            invoiceId: z.string(),
            amount: z.number(),
            paymentDate: z.date(),
            paymentMethod: z.nativeEnum(PaymentMethod),
        }))
        .mutation(async ({ ctx, input }) => {
            const payment = await ctx.db.invoicePayment.create({
                data: input,
            });

            const invoice = await ctx.db.invoice.findUnique({
                where: { id: input.invoiceId },
                include: { InvoicePayments: true },
            });

            if (invoice) {
                const totalPaid = invoice.InvoicePayments.reduce((sum, payment) => sum + payment.amount.toNumber(), 0);
                const newStatus = totalPaid >= invoice.total.toNumber() ? InvoiceStatus.Paid : InvoiceStatus.Sent;

                await ctx.db.invoice.update({
                    where: { id: input.invoiceId },
                    data: { status: newStatus },
                });
            }

            return payment;
        }),
    sendInvoiceEmail: protectedProcedure
        .input(z.object({
            invoiceId: z.string(),
            recipientEmail: z.string().email(),
        }))
        .mutation(async ({ ctx, input }) => {
            const invoice = await ctx.db.invoice.findUnique({
                where: { id: input.invoiceId },
                include: {
                    Order: {
                        include: {
                            Office: {
                                include: {
                                    Company: true,
                                },
                            },
                        },
                    },
                    InvoiceItems: true,
                },
            });

            if (!invoice) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Invoice not found',
                });
            }

            const pdfContent = await generateInvoicePDF(invoice);
            const emailHtml = `
        <h1>Invoice ${invoice.invoiceNumber}</h1>
        <p>Please find attached the invoice for your recent order.</p>
        <p>Total Amount Due: $${invoice.total}</p>
        <p>Due Date: ${invoice.dateDue.toDateString()}</p>
      `;

            const emailSent = await sendInvoiceEmail(
                input.recipientEmail,
                `Invoice ${invoice.invoiceNumber} from ${invoice.Order.Office.Company.name}`,
                emailHtml,
                pdfContent
            );

            if (emailSent) {
                await ctx.db.invoice.update({
                    where: { id: input.invoiceId },
                    data: { status: InvoiceStatus.Sent },
                });
                return { success: true, message: 'Invoice sent successfully' };
            } else {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to send invoice email',
                });
            }
        }),
});

async function generateInvoiceNumber(ctx: any): Promise<string> {
    const currentYear = new Date().getFullYear();
    const lastInvoice = await ctx.db.invoice.findFirst({
        where: {
            invoiceNumber: {
                startsWith: `INV-${currentYear}-`,
            },
        },
        orderBy: {
            invoiceNumber: 'desc',
        },
    });

    let nextNumber = 1;
    if (lastInvoice) {
        const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2], 10);
        nextNumber = lastNumber + 1;
    }

    return `INV-${currentYear}-${nextNumber.toString().padStart(5, '0')}`;
}