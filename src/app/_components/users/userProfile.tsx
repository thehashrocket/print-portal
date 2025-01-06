// ~/app/_components/users/userProfile.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import UserProfileForm from "~/app/_components/users/userProfileForm";
import { type ExtendedUser } from "~/types/user";
import { type Company, type Office, type Role } from "@prisma/client";

type SessionUser = {
    id: string;
    Roles: string[];
    Permissions: string[];
};

interface UserProfileComponentProps {
    params: { id: string };
    session: {
        user: SessionUser;
    };
}

export default function UserProfileComponent({ params, session }: UserProfileComponentProps) {
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [offices, setOffices] = useState<Office[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    const { data: userData, refetch: refetchUser } = api.userManagement.getUserById.useQuery(params.id);
    const { data: companiesData } = api.companies.getAll.useQuery();
    const { data: officesData } = api.offices.getAll.useQuery();
    const { data: rolesData } = api.roles.getAll.useQuery();

    useEffect(() => {
        if (userData) setUser(userData as ExtendedUser);
        if (companiesData) setCompanies(companiesData);
        if (officesData) setOffices(officesData);
        if (rolesData) setRoles(rolesData);
    }, [userData, companiesData, officesData, rolesData]);

    if (!user) {
        return <div>Loading...</div>;
    }

    const isOwnProfile = session.user.id === user.id;
    const isAdmin = session.user.Roles.includes("Admin");
    const hasEditPermission = isAdmin || session.user.Permissions.some((p: string) =>
        ["user_create", "user_update", "user_edit"].includes(p)
    );

    const canEdit = isOwnProfile || hasEditPermission;
    const canAssignCompanyAndOffice = hasEditPermission;
    const canAssignRole = hasEditPermission;

    const handleProfileUpdate = async () => {
        await refetchUser();
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">User Profile</h1>
            <UserProfileForm
                user={user}
                canEdit={canEdit}
                canAssignCompanyAndOffice={canAssignCompanyAndOffice}
                canAssignRole={canAssignRole}
                companies={companies}
                offices={offices}
                roles={roles}
                onProfileUpdate={handleProfileUpdate}
            />
        </div>
    );
}