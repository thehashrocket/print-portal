// ~/app/api/quickbooks/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const realmId = searchParams.get('realmId');
    const state = searchParams.get('state');

    if (!code || !realmId || !state) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    try {
        const session = await getServerAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await api.quickbooks.handleCallback({ code, realmId, state });

        // Use an absolute URL for redirection
        const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.get('host')}`;
        return NextResponse.redirect(`${baseUrl}/dashboard?quickbooks=success`);
    } catch (error) {
        console.error('Error in Quickbooks callback:', error);

        // Use an absolute URL for redirection
        const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.get('host')}`;
        return NextResponse.redirect(`${baseUrl}/dashboard?quickbooks=error`);
    }
}