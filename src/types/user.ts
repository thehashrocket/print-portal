import { User } from "@prisma/client";

export type Permission = {
    id: string;
    name: string;
    description: string;
};

export type Role = {
    id: string;
    name: string;
    description: string;
    Permissions: Permission[];
};

export type UserData = {
    id: string;
    name: string;
    email: string;
    Roles: Role[];
};

// Define a type that includes the Roles relationship
export type UserWithRoles = User & {
    Roles: (Role & {
        Permissions: Permission[]
    })[]
};