// ~/app/api/quickbooks/callback/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const realmId = searchParams.get('realmId');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('QuickBooks Callback Received', {
        code,
        realmId,
        state,
        error,
        errorDescription,
        fullUrl: req.url,
        headers: Object.fromEntries(req.headers.entries()),
    });

    if (error) {
        console.error('Error in QuickBooks callback:', error, errorDescription);
        const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.get('host')}`;
        return NextResponse.redirect(`${baseUrl}/dashboard?quickbooks=error&error=${error}&description=${errorDescription}`);
    }

    if (!code || !realmId || !state) {
        console.error('Missing required parameters in QuickBooks callback');
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    try {
        const session = await getServerAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await api.qbAuth.handleCallback({ code, realmId, state });

        const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.get('host')}`;
        return NextResponse.redirect(`${baseUrl}/?quickbooks=success`);
    } catch (error: any) {
        console.error('Detailed error in Quickbooks callback:', {
            error: error,
            message: error.message,
            stack: error.stack,
            request: {
                url: req.url,
                headers: Object.fromEntries(req.headers.entries()),
            }
        });

        // Use an absolute URL for redirection
        const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.get('host')}`;
        return NextResponse.redirect(`${baseUrl}/?quickbooks=error`);
    }
}