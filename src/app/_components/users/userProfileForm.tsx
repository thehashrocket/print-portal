// ~/src/app/_components/users/UserProfileForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { User, Company, Office, Role } from "@prisma/client";

const userProfileSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    officeId: z.string().nullable(),
    roleIds: z.array(z.string()),
});

type ExtendedUser = User & {
    Roles: Role[];
    Office: (Office & { Company: Company | null }) | null;
};

type UserProfileFormProps = {
    user: ExtendedUser;
    canEdit: boolean;
    canAssignCompanyAndOffice: boolean;
    canAssignRole: boolean;
    companies: Company[];
    offices: Office[];
    roles: Role[];
    onProfileUpdate: () => void;
};

export default function UserProfileForm({
    user,
    canEdit,
    canAssignCompanyAndOffice,
    canAssignRole,
    companies,
    offices,
    roles,
    onProfileUpdate,
}: UserProfileFormProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(user.Office?.Company?.id);
    const [availableOffices, setAvailableOffices] = useState<Office[]>(offices);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(userProfileSchema),
        defaultValues: {
            name: user.name || "",
            email: user.email || "",
            officeId: user.officeId || null,
            roleIds: user.Roles.map(role => role.id),
        },
    });

    const updateUser = api.userManagement.updateUser.useMutation();
    const officeId = watch("officeId");

    useEffect(() => {
        if (officeId) {
            const selectedOffice = offices.find(office => office.id === officeId);
            setSelectedCompanyId(selectedOffice?.companyId);
            setAvailableOffices(offices.filter(office => office.companyId === selectedOffice?.companyId));
        }
    }, [officeId, offices]);

    const onSubmit = async (data: z.infer<typeof userProfileSchema>) => {
        try {
            await updateUser.mutateAsync({
                id: user.id,
                name: data.name,
                email: data.email,
                roleIds: data.roleIds,
                officeId: data.officeId || undefined, // Convert null to undefined
            });
            setIsEditing(false);
            onProfileUpdate();
        } catch (error) {
            console.error("Failed to update user", error);
        }
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCompanyId = e.target.value;
        setSelectedCompanyId(newCompanyId);
        setAvailableOffices(offices.filter(office => office.companyId === newCompanyId));
        setValue("officeId", null); // Reset office selection when company changes
    };

    if (!isEditing) {
        return (
            <div>
                <p>Name: {user.name}</p>
                <p>Email: {user.email}</p>
                <p>Company: {user.Office?.Company?.name || "Not assigned"}</p>
                <p>Office: {user.Office?.name || "Not assigned"}</p>
                <p>Roles: {user.Roles.map(role => role.name).join(", ")}</p>
                {canEdit && (
                    <button onClick={() => setIsEditing(true)} className="btn btn-primary mt-4">
                        Edit Profile
                    </button>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    {...register("name")}
                    id="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                    {...register("email")}
                    id="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {canAssignCompanyAndOffice && (
                <>
                    <div>
                        <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">Company</label>
                        <select
                            id="companyId"
                            value={selectedCompanyId}
                            onChange={handleCompanyChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value="">Select a company</option>
                            {companies.map(company => (
                                <option key={company.id} value={company.id}>{company.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="officeId" className="block text-sm font-medium text-gray-700">Office</label>
                        <select
                            {...register("officeId")}
                            id="officeId"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value="">Select an office</option>
                            {availableOffices.map(office => (
                                <option key={office.id} value={office.id}>{office.name}</option>
                            ))}
                        </select>
                    </div>
                </>
            )}

            {canAssignRole && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Roles</label>
                    {roles.map(role => (
                        <div key={role.id} className="mt-1">
                            <input
                                {...register("roleIds")}
                                type="checkbox"
                                id={`role-${role.id}`}
                                value={role.id}
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <label htmlFor={`role-${role.id}`} className="ml-2 text-sm text-gray-700">{role.name}</label>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                    Save Changes
                </button>
            </div>
        </form>
    );
}