// ~/src/app/_components/users/UserProfileForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { type User, type Company, type Office, type Role } from "@prisma/client";
import { Button } from "../ui/button";
import { Pencil, User as UserIcon, Mail, Building2, Building, Users } from "lucide-react";
import { SelectField } from "~/app/_components/shared/ui/SelectField/SelectField";
import { Input } from "~/app/_components/ui/input";
import { Label } from "~/app/_components/ui/label";

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

    const handleCompanyChange = (newCompanyId: string) => {
        setSelectedCompanyId(newCompanyId);
        setAvailableOffices(offices.filter(office => office.companyId === newCompanyId));
        setValue("officeId", null); // Reset office selection when company changes
    };

    if (!isEditing) {
        return (
            <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <UserIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                            <div className="text-sm text-gray-500">Name</div>
                            <div className="font-medium">{user.name}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                            <div className="text-sm text-gray-500">Email</div>
                            <div className="font-medium">{user.email}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                            <div className="text-sm text-gray-500">Company</div>
                            <div className="font-medium">{user.Office?.Company?.name || "Not assigned"}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                            <div className="text-sm text-gray-500">Office</div>
                            <div className="font-medium">{user.Office?.name || "Not assigned"}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                            <div className="text-sm text-gray-500">Roles</div>
                            <div className="font-medium">{user.Roles.map(role => role.name).join(", ")}</div>
                        </div>
                    </div>
                </div>

                {canEdit && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <Button
                            variant="default"
                            onClick={() => setIsEditing(true)}
                            className="w-full sm:w-auto"
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col gap-4">
            <div className="">
                <Label htmlFor="name">Name</Label>
                <Input
                    {...register("name")}
                    id="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
                <Label htmlFor="email">Email</Label>
                <Input
                    {...register("email")}
                    id="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {canAssignCompanyAndOffice && (
                <>
                    <div>
                        <Label htmlFor="companyId">Company</Label>
                        <SelectField
                            options={companies.map(company => ({ value: company.id, label: company.name }))}
                            value={selectedCompanyId ?? ''}
                            onValueChange={(value: string) => handleCompanyChange(value)}
                            placeholder="Select a company"
                            required={true}
                        />
                    </div>

                    <div>
                        <Label htmlFor="officeId">Office</Label>
                        <SelectField
                            options={availableOffices.map(office => ({ value: office.id, label: office.name }))}
                            value={watch("officeId") ?? ''}
                            onValueChange={(value: string) => setValue("officeId", value)}
                            placeholder="Select an office"
                            required={true}
                        />
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
                <Button
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                >
                    Cancel
                </Button>
                <Button
                    variant="default"
                    type="submit"
                >
                    Save Changes
                </Button>
            </div>
        </form>
    );
}