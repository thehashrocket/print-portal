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

async function refreshTokenIfNeeded(ctx: any) {
    const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
            quickbooksAccessToken: true,
            quickbooksRefreshToken: true,
            quickbooksTokenExpiry: true,
            quickbooksRealmId: true,
        },
    });

    if (!user?.quickbooksTokenExpiry || !user.quickbooksRefreshToken) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated with QuickBooks',
        });
    }

    const currentTime = new Date();
    const tokenExpiryTime = new Date(user.quickbooksTokenExpiry);

    // If token is expired or will expire in the next 5 minutes, refresh it
    if (tokenExpiryTime <= new Date(currentTime.getTime() + 5 * 60 * 1000)) {
        try {
            oauthClient.setToken({
                access_token: user.quickbooksAccessToken!,
                refresh_token: user.quickbooksRefreshToken,
                realmId: user.quickbooksRealmId!,
            });

            const response = await axios.post(
                'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
                querystring.stringify({
                    grant_type: 'refresh_token',
                    refresh_token: user.quickbooksRefreshToken,
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${Buffer.from(`${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`).toString('base64')}`,
                    },
                }
            );
            const tokenJson = response.data;


            // const authResponse = await oauthClient.refresh();
            // const tokenJson = authResponse.getJson();

            // Update tokens in the database
            await ctx.db.user.update({
                where: { id: ctx.session.user.id },
                data: {
                    quickbooksAccessToken: tokenJson.access_token,
                    quickbooksRefreshToken: tokenJson.refresh_token,
                    quickbooksTokenExpiry: new Date(Date.now() + tokenJson.expires_in * 1000),
                },
            });

            return tokenJson.access_token;
        } catch (error) {
            console.error('Error refreshing QuickBooks token:', error);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to refresh QuickBooks token',
            });
        }
    }

    return user.quickbooksAccessToken;
}

export const quickbooksRouter = createTRPCRouter({
    initiateAuth: protectedProcedure
        .mutation(async () => {
            console.log('Initiating Quickbooks auth');
            const authUri = oauthClient.authorizeUri({
                scope: [OAuthClient.scopes.Accounting],
                state: 'intuit-test',
            });
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
                select: {
                    quickbooksAccessToken: true,
                    quickbooksRefreshToken: true,
                    quickbooksRealmId: true,
                    quickbooksTokenExpiry: true,
                },
            });

            if (!user?.quickbooksRefreshToken) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'No refresh token available',
                });
            }

            const currentTime = new Date();

            try {

                oauthClient.setToken({
                    access_token: user.quickbooksAccessToken!,
                    refresh_token: user.quickbooksRefreshToken,
                    realmId: user.quickbooksRealmId!,
                    token_type: 'bearer',
                });

                // Attempt to refresh the token manually
                // Example of manually refreshing the token using curl:
                // Convert this to axios:
                // curl - X POST 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer' \
                // -H 'Accept: application/json' \
                // -H 'Content-Type: application/x-www-form-urlencoded' \
                // -H 'Authorization: REPLACE_WITH_AUTHORIZATION_HEADER (details below)'  \
                // -d 'grant_type=refresh_token' \
                // -d 'refresh_token=REPLACE_WITH_REFRESH_TOKEN'

                // Use Axios to make the request
                const response = await axios.post(
                    'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
                    querystring.stringify({
                        grant_type: 'refresh_token',
                        refresh_token: user.quickbooksRefreshToken,
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': `Basic ${Buffer.from(`${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`).toString('base64')}`,
                        },
                    }
                );
                const tokenJson = response.data;

                // const authResponse = await oauthClient.refresh();
                // const tokenJson = authResponse.getJson();

                // Update tokens in the database
                await ctx.db.user.update({
                    where: { id: ctx.session.user.id },
                    data: {
                        quickbooksAccessToken: tokenJson.access_token,
                        quickbooksRefreshToken: tokenJson.refresh_token,
                        quickbooksTokenExpiry: new Date(Date.now() + tokenJson.expires_in * 1000),
                    },
                });

                return { success: true, message: 'Token refreshed successfully' };
            } catch (error) {
                console.error('Detailed error refreshing QuickBooks token:', error);

                if (error instanceof Error) {
                    console.error('Error name:', error.name);
                    console.error('Error message:', error.message);
                    console.error('Error stack:', error.stack);
                }

                if (error instanceof Error &&
                    (error.message.includes('invalid') || error.message.includes('expired'))) {
                    // Clear QuickBooks data if the refresh token is invalid or expired
                    await ctx.db.user.update({
                        where: { id: ctx.session.user.id },
                        data: {
                            quickbooksAccessToken: null,
                            quickbooksRefreshToken: null,
                            quickbooksTokenExpiry: null,
                            quickbooksRealmId: null,
                        },
                    });

                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'QuickBooks authorization has expired. Please reconnect your account.',
                    });
                }

                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to refresh QuickBooks token',
                    cause: error,
                });
            }
        }),

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