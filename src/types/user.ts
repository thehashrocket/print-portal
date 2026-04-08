import { type User, type Company, type Office, type Role } from "~/generated/prisma/browser";

export type ExtendedUser = User & {
    Roles: Role[];
    offices: {
        office: Office & {
            Company: Company | null;
        };
        userId: string;
        officeId: string;
        assignedAt: Date;
    }[];
};