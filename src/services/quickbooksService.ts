import { PrismaClient, Prisma, OrderStatus, OrderItemStatus, WorkOrderStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import OAuthClient from 'intuit-oauth';
import axios from 'axios';
import querystring from 'querystring';

const oauthClient = new OAuthClient({
    clientId: process.env.QUICKBOOKS_CLIENT_ID!,
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
    environment: process.env.QUICKBOOKS_ENVIRONMENT as 'sandbox' | 'production',
    redirectUri: `${process.env.NEXTAUTH_URL}/api/quickbooks/callback`,
    logging: true
});

export async function refreshTokenIfNeeded(ctx: any) {
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

    // If token is expired or will expire in the next 30 minutes, refresh it
    if (tokenExpiryTime <= new Date(currentTime.getTime() + 30 * 60 * 1000)) {
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
            console.log('tokenJson', tokenJson);
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
};
