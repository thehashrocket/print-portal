// ~/src/app/_components/shared/ContactPersonEditor/ContactPersonEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '~/trpc/react';
import { toast } from 'react-hot-toast';
import { CheckCircle, Info, LucideIcon, PlusCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { SelectField } from '../../shared/ui/SelectField/SelectField';
import { CreateContactModal } from '../contacts/createContactModal';

interface ContactPersonEditorProps {
    orderId: string;
    currentContactPerson: { id: string; name: string | null; email: string | null } | null;
    officeId: string;
    onUpdate: () => void;
    isWorkOrder?: boolean;
}

const ContactPersonEditor: React.FC<ContactPersonEditorProps> = ({
    orderId,
    currentContactPerson,
    officeId,
    onUpdate,
    isWorkOrder = false
}) => {
    const [selectedUserId, setSelectedUserId] = useState(currentContactPerson?.id || '');
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { data: users, isLoading, refetch } = api.users.getByOfficeId.useQuery(officeId);
    const orderMutation = api.orders.updateContactPerson.useMutation();
    const workOrderMutation = api.workOrders.updateContactPerson.useMutation();

    const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedUserId(event.target.value);
    };

    const handleUpdateContactPerson = async () => {
        try {
            if (isWorkOrder) {
                await workOrderMutation.mutateAsync({
                    workOrderId: orderId,
                    contactPersonId: selectedUserId
                });
            } else {
                await orderMutation.mutateAsync({
                    orderId: orderId,
                    contactPersonId: selectedUserId
                });
            }
            setMessage('Contact person updated successfully');
            setIsError(false);
            onUpdate();
        } catch (error) {
            console.error('Failed to update contact person:', error);
            setMessage('Failed to update contact person');
            setIsError(true);
        }
    };

    const handleContactCreated = async (newContact: { id: string; name: string; email: string }) => {
        await refetch();
        setSelectedUserId(newContact.id);
    };

    if (isLoading) {
        return <p>Loading users...</p>;
    }

    return (
        <div className="">
            <div className="mb-4">
                <div className="flex items-start gap-2 p-3 text-sm bg-blue-50 border border-blue-200 rounded-md mb-4">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                    <p className="text-blue-700">
                        Select a contact person for this order.
                    </p>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="contactPerson">Select Contact Person</Label>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create Contact
                    </Button>
                </div>
                <SelectField
                    options={users?.map(user => ({ value: user.id, label: user.name || user.email || user.id })) || []}
                    value={selectedUserId}
                    onValueChange={(value) => setSelectedUserId(value)}
                    placeholder="Select Contact Person"
                />
            </div>
            <Button
                variant="default"
                onClick={handleUpdateContactPerson}
            >
                <CheckCircle className="w-5 h-5 mr-2" />
                Update
            </Button>
            {message && (
                <p className={`mt-4 text-sm ${isError ? 'text-red-500' : 'text-green-500'}`}>
                    {message}
                </p>
            )}
            {currentContactPerson && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-900">{currentContactPerson.name}</p>
                    <p className="text-sm text-gray-500">{currentContactPerson.email}</p>
                </div>
            )}

            <CreateContactModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                officeId={officeId}
                onContactCreated={handleContactCreated}
            />
        </div>
    );
};

export default ContactPersonEditor;