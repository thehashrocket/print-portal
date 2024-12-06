// ~/src/app/_components/users/EditUserRolesModal.tsx
import React, { useState } from 'react';
import { api } from "~/trpc/react";
import { type User, type Role, RoleName } from "@prisma/client";
import { Button } from '../ui/button';

interface EditUserRolesModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User & { Roles: Role[] };
    onUpdateRoles: () => void;
}

const EditUserRolesModal: React.FC<EditUserRolesModalProps> = ({ isOpen, onClose, user, onUpdateRoles }) => {
    const [selectedRoles, setSelectedRoles] = useState<RoleName[]>(
        user.Roles.map(role => role.name as RoleName)
    );

    const updateUserRoles = api.userManagement.updateUserRoles.useMutation({
        onSuccess: () => {
            onUpdateRoles();
        },
    });

    const handleRoleToggle = (roleName: RoleName) => {
        setSelectedRoles(prev =>
            prev.includes(roleName)
                ? prev.filter(r => r !== roleName)
                : [...prev, roleName]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateUserRoles.mutateAsync({
            userId: user.id,
            roleNames: selectedRoles,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Edit Roles for {user.name}</h2>
                <form onSubmit={handleSubmit}>
                    {Object.values(RoleName).map((role) => (
                        <div key={role} className="mb-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedRoles.includes(role)}
                                    onChange={() => handleRoleToggle(role)}
                                    className="mr-2"
                                />
                                {role}
                            </label>
                        </div>
                    ))}
                    <div className="mt-4 flex justify-end">
                        <Button
                            variant="secondary"
                            onClick={onClose}
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
            </div>
        </div>
    );
};

export default EditUserRolesModal;