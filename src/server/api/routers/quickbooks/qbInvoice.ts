import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { refreshTokenIfNeeded } from "~/services/quickbooksService";
import { TRPCError } from "@trpc/server";
import axios from 'axios';

async function fetchInvoices(ctx: any, accessToken: string, companyID: string) {
    const response = await axios.get(`https://quickbooks.api.intuit.com/v3/company/${companyID}/invoice`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
}

export const qbInvoiceRouter = createTRPCRouter({
    getInvoices: protectedProcedure
        .query(async ({ ctx }) => {
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

            const invoices = await fetchInvoices(ctx, accessToken, user.quickbooksRealmId);
            return invoices;
        }),
});