// ~/src/app/_components/users/UserProfileForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { type ExtendedUser } from "~/types/user";
import { type Company, type Office, type Role } from "@prisma/client";
import { Button } from "../ui/button";
import { Pencil, User as UserIcon, Mail, Building2, Users } from "lucide-react";
import { Input } from "~/app/_components/ui/input";
import { Label } from "~/app/_components/ui/label";
import { CustomComboBox } from "../shared/ui/CustomComboBox";

const userProfileSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    officeIds: z.array(z.string()),
    roleIds: z.array(z.string()),
});

type FormValues = z.infer<typeof userProfileSchema>;

type OfficeAssignment = {
    officeId: string;
    companyId: string;
    officeName: string;
    companyName: string;
};

type UserProfileFormProps = {
    user: ExtendedUser;
    canEdit: boolean;
    canAssignCompanyAndOffice: boolean;
    canAssignRole: boolean;
    companies: Company[];
    offices: Office[];
    roles: Role[];
    onProfileUpdate: () => Promise<void>;
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
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>();
    const [selectedOfficeId, setSelectedOfficeId] = useState<string>();
    const [availableOffices, setAvailableOffices] = useState<Office[]>(offices);
    const [officeAssignments, setOfficeAssignments] = useState<OfficeAssignment[]>(
        user.offices.map(office => ({
            officeId: office.officeId,
            companyId: office.office.Company?.id || '',
            officeName: office.office.name,
            companyName: office.office.Company?.name || '',
        }))
    );

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(userProfileSchema),
        defaultValues: {
            name: user.name || "",
            email: user.email || "",
            officeIds: user.offices.map(o => o.officeId),
            roleIds: user.Roles.map(role => role.id),
        },
    });

    const updateUser = api.userManagement.updateUser.useMutation();

    const handleCompanyChange = (newCompanyId: string) => {
        setSelectedCompanyId(newCompanyId);
        setSelectedOfficeId(undefined);
        setAvailableOffices(offices.filter(office => office.companyId === newCompanyId));
    };

    const handleOfficeChange = (officeId: string) => {
        setSelectedOfficeId(officeId);
    };

    const addOfficeAssignment = () => {
        if (!selectedCompanyId || !selectedOfficeId) return;

        const office = offices.find(o => o.id === selectedOfficeId);
        const company = companies.find(c => c.id === selectedCompanyId);
        
        if (!office || !company) return;

        const newAssignment: OfficeAssignment = {
            officeId: office.id,
            companyId: company.id,
            officeName: office.name,
            companyName: company.name,
        };

        setOfficeAssignments(prev => [...prev, newAssignment]);
        setValue('officeIds', [...officeAssignments.map(a => a.officeId), office.id]);
        
        // Reset selections
        setSelectedCompanyId(undefined);
        setSelectedOfficeId(undefined);
    };

    const removeOfficeAssignment = (officeId: string) => {
        setOfficeAssignments(prev => prev.filter(a => a.officeId !== officeId));
        setValue('officeIds', officeAssignments.filter(a => a.officeId !== officeId).map(a => a.officeId));
    };

    const onSubmit = async (data: FormValues) => {
        try {
            await updateUser.mutateAsync({
                id: user.id,
                name: data.name,
                email: data.email,
                roleIds: data.roleIds,
                officeIds: data.officeIds,
            });
            setIsEditing(false);
            await onProfileUpdate();
        } catch (error) {
            console.error("Failed to update user", error);
        }
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

                    <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                            <div className="text-sm text-gray-500">Companies & Offices</div>
                            {user.offices.length > 0 ? (
                                <div className="space-y-2 mt-1">
                                    {user.offices.map((officeAssignment) => (
                                        <div 
                                            key={officeAssignment.officeId}
                                            className="bg-gray-50 rounded-md p-2"
                                        >
                                            <div className="font-medium">
                                                {officeAssignment.office.Company?.name}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {officeAssignment.office.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Assigned: {new Date(officeAssignment.assignedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 italic">No offices assigned</div>
                            )}
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
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="companyId">Company</Label>
                            <CustomComboBox
                                options={companies.map(company => ({
                                    value: company.id,
                                    label: company.name
                                }))}
                                value={selectedCompanyId ?? ''}
                                onValueChange={handleCompanyChange}
                                placeholder="Select a company"
                                emptyText="No companies found"
                                searchPlaceholder="Search companies"
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="officeId">Office</Label>
                            <CustomComboBox
                                options={availableOffices.map(office => ({
                                    value: office.id,
                                    label: office.name
                                }))}
                                value={selectedOfficeId ?? ''}
                                onValueChange={handleOfficeChange}
                                placeholder="Select an office"
                                emptyText="No offices found"
                                searchPlaceholder="Search offices"
                            />
                        </div>
                        <Button
                            type="button"
                            onClick={addOfficeAssignment}
                            disabled={!selectedCompanyId || !selectedOfficeId}
                            className="mt-6"
                        >
                            Add Office
                        </Button>
                    </div>

                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Assigned Offices</h3>
                        <div className="space-y-2">
                            {officeAssignments.map((assignment) => (
                                <div
                                    key={assignment.officeId}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                                >
                                    <div>
                                        <span className="font-medium">{assignment.companyName}</span>
                                        <span className="mx-2">•</span>
                                        <span>{assignment.officeName}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => removeOfficeAssignment(assignment.officeId)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
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