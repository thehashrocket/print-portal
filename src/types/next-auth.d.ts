import { Session } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            roles?: string[];
            permissions?: string[];
        } & typeof Session.user;
    }
}
