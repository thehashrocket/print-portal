import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { refreshTokenIfNeeded } from "~/services/quickbooksService";
import { TRPCError } from "@trpc/server";
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import { z } from 'zod';
async function fetchInvoices(ctx: any, accessToken: string, companyID: string, customerID: string) {
    let query = `SELECT * from Invoice`;

    const baseUrl = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox'
        ? 'https://sandbox-quickbooks.api.intuit.com'
        : 'https://quickbooks.api.intuit.com';

    const parser = new XMLParser();

    const queryUrl = `${baseUrl}/v3/company/${companyID}/query?query=${encodeURIComponent(query)}`;

    const response = await axios.get(queryUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/xml',
        }
    });
    console.log(response.data);

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

            // Look through the offices and find the all that has a quickbooksCustomerId
            const offices = await ctx.db.office.findMany({
                where: {
                    quickbooksCustomerId: { not: null }
                }
            });

            // Look through the offices and get the invoices for each office
            const invoices = await Promise.all(offices.map(async (office) => {
                if (office.quickbooksCustomerId && user?.quickbooksRealmId) {
                    return fetchInvoices(ctx, accessToken, user.quickbooksRealmId, office.quickbooksCustomerId);
                }
            }));


            return invoices;
        }),
    // Get Invoice by Company ID
    getInvoiceByCompanyId: protectedProcedure
        .input(z.object({ companyId: z.string() }))
        .query(async ({ ctx, input }) => {
            const accessToken = await refreshTokenIfNeeded(ctx);
            const invoices = await fetchInvoices(ctx, accessToken, input.companyId);
            return invoices;
        }),
});
