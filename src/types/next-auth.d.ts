import { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      Roles?: string[];
      Permissions?: string[];
    } & typeof Session.user;
  }
}
