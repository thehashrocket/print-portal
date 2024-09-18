// ~/src/server/auth/quickbooksProvider.ts
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";


export interface QuickBooksProfile extends Record<string, any> {
    sub: string;
    email: string;
    emailVerified: boolean;
    givenName: string;
    familyName: string;
}

export default function QuickBooks<P extends QuickBooksProfile>(
    options: OAuthUserConfig<P>
): OAuthConfig<P> {
    return {
        id: "quickbooks",
        name: "QuickBooks",
        type: "oauth",
        wellKnown: "https://oauth.platform.intuit.com/.well-known/openid-configuration",
        authorization: {
            params: {
                scope: "openid profile email com.intuit.quickbooks.accounting",
            },
        },
        idToken: true,
        checks: ["pkce", "state"],
        profile(profile) {
            return {
                id: profile.sub,
                name: profile.givenName + " " + profile.familyName,
                email: profile.email,
                image: null,
            };
        },
        style: {
            logo: "/quickbooks-logo.png",
            logoDark: "/quickbooks-logo-dark.png",
            bg: "#fff",
            text: "#0077C5",
            bgDark: "#0077C5",
            textDark: "#fff",
        },
        options,
    };
}