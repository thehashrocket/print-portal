// ~/src/server/api/routers/orderPayments/orderPayment.tsx
// tRPC endpoints for order payments

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { PaymentMethod } from "@prisma/client";
import { normalizeOrderPayment } from "~/utils/dataNormalization";

const orderPaymentSchema = z.object({
    amount: z.number(),
    paymentDate: z.date(),
    paymentMethod: z.nativeEnum(PaymentMethod),
    orderId: z.string(),
});

export const orderPaymentRouter = createTRPCRouter({
    create: protectedProcedure.input(orderPaymentSchema).mutation(async ({ ctx, input }) => {
        const payment = await ctx.db.orderPayment.create({
            data: {
                amount: input.amount,
                paymentDate: input.paymentDate,
                paymentMethod: input.paymentMethod,
                orderId: input.orderId,
            },
        });
        return normalizeOrderPayment(payment);
    }),
    getByOrderId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        const payments = await ctx.db.orderPayment.findMany({
            where: { orderId: input },
        });
        return payments.map(normalizeOrderPayment);
    }),
});