import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import OAuthClient from 'intuit-oauth';
import { TRPCError } from "@trpc/server";
import { refreshTokenIfNeeded } from "~/services/quickbooksService";

const oauthClient = new OAuthClient({
    clientId: process.env.QUICKBOOKS_CLIENT_ID!,
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
    environment: process.env.QUICKBOOKS_ENVIRONMENT as 'sandbox' | 'production',
    redirectUri: `${process.env.NEXTAUTH_URL}/api/quickbooks/callback`,
    logging: true
});

export const qbCompanyRouter = createTRPCRouter({
    getCompanyInfo: protectedProcedure
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

            oauthClient.setToken({
                access_token: accessToken,
                realmId: user.quickbooksRealmId,
            });

            const companyID = user.quickbooksRealmId;
            const url = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox' ?
                OAuthClient.environment.sandbox :
                OAuthClient.environment.production;

            try {
                const response = await oauthClient.makeApiCall({
                    url: `${url}v3/company/${companyID}/companyinfo/${companyID}`
                });

                // Return only the necessary data
                return {
                    companyInfo: response.json.CompanyInfo,
                    time: response.json.time
                };
            } catch (error) {
                console.error('Error getting company info:', error);
                if (error instanceof Error) {
                    console.error('Error message:', error.message);
                    console.error('Error stack:', error.stack);
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to get company info from QuickBooks',
                    cause: error
                });
            }
        }),
});