import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import OAuthClient from 'intuit-oauth';
import { TRPCError } from "@trpc/server";
import axios from 'axios';
import querystring from 'querystring';

const oauthClient = new OAuthClient({
    clientId: process.env.QUICKBOOKS_CLIENT_ID!,
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
    environment: process.env.QUICKBOOKS_ENVIRONMENT as 'sandbox' | 'production',
    redirectUri: `${process.env.NEXTAUTH_URL}/api/quickbooks/callback`,
    logging: true
});

export const quickbooksRouter = createTRPCRouter({
    initiateAuth: protectedProcedure
        .mutation(async () => {
            const authUri = oauthClient.authorizeUri({
                scope: [OAuthClient.scopes.Accounting],
                state: 'intuit-test',
            });
            console.log('Auth URI:', authUri);
            return { authUri };
        }),

    handleCallback: protectedProcedure
        .input(z.object({
            code: z.string(),
            realmId: z.string(),
            state: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                const tokenEndpoint = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox'
                    ? 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
                    : 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

                const data = querystring.stringify({
                    grant_type: 'authorization_code',
                    code: input.code,
                    redirect_uri: `${process.env.NEXTAUTH_URL}/api/quickbooks/callback`,
                });

                const config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${Buffer.from(`${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`).toString('base64')}`,
                    },
                };

                const response = await axios.post(tokenEndpoint, data, config);
                const tokenJson = response.data;

                // Save tokens to your database here
                await ctx.db.user.update({
                    where: { id: ctx.session.user.id },
                    data: {
                        quickbooksAccessToken: tokenJson.access_token,
                        quickbooksRefreshToken: tokenJson.refresh_token,
                        quickbooksTokenExpiry: new Date(Date.now() + tokenJson.expires_in * 1000),
                        quickbooksRealmId: input.realmId,
                    },
                });

                return { success: true };
            } catch (error) {
                console.error('Error handling Quickbooks callback:', error);
                if (axios.isAxiosError(error)) {
                    console.error('Response data:', error.response?.data);
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to authenticate with Quickbooks',
                });
            }
        }),

    refreshToken: protectedProcedure
        .mutation(async ({ ctx }) => {
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { quickbooksAccessToken: true, quickbooksRefreshToken: true },
            });

            if (!user?.quickbooksRefreshToken) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'No refresh token available',
                });
            }

            try {
                oauthClient.setToken({
                    access_token: user.quickbooksAccessToken!,
                    refresh_token: user.quickbooksRefreshToken,
                });

                const authResponse = await oauthClient.refresh();
                const tokenJson = authResponse.getJson();

                // Update tokens in the database
                await ctx.db.user.update({
                    where: { id: ctx.session.user.id },
                    data: {
                        quickbooksAccessToken: tokenJson.access_token,
                        quickbooksRefreshToken: tokenJson.refresh_token,
                        quickbooksTokenExpiry: new Date(Date.now() + tokenJson.expires_in * 1000),
                    },
                });

                return { success: true };
            } catch (error) {
                console.error('Error refreshing Quickbooks token:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to refresh Quickbooks token',
                });
            }
        }),

    getCompanyInfo: protectedProcedure
        .query(async ({ ctx }) => {
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { quickbooksAccessToken: true, quickbooksRealmId: true },
            });

            if (!user?.quickbooksAccessToken || !user?.quickbooksRealmId) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Not authenticated with Quickbooks',
                });
            }

            oauthClient.setToken({
                access_token: user.quickbooksAccessToken,
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
                return JSON.parse(response.text());
            } catch (error) {
                console.error('Error getting company info:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to get company info from Quickbooks',
                });
            }
        }),

    checkQuickbooksAuthStatus: protectedProcedure
        .query(async ({ ctx }) => {
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { quickbooksAccessToken: true, quickbooksTokenExpiry: true },
            });

            return {
                isAuthenticated: !!user?.quickbooksAccessToken && new Date() < user.quickbooksTokenExpiry!,
            };
        }),
});