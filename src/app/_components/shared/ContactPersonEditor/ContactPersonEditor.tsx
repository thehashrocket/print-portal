// ~/src/app/_components/shared/ContactPersonEditor/ContactPersonEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '~/trpc/react';
import { toast } from 'react-hot-toast';
import { CheckCircle, LucideIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';


interface ContactPersonEditorProps {
    orderId: string;
    currentContactPerson: { id: string; name: string | null; email: string | null } | null;
    officeId: string;
    onUpdate: () => void;
}

const ContactPersonEditor: React.FC<ContactPersonEditorProps> = ({ orderId, currentContactPerson, officeId, onUpdate }) => {
    const [selectedUserId, setSelectedUserId] = useState(currentContactPerson?.id || '');
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const { data: users, isLoading } = api.users.getByOfficeId.useQuery(officeId);
    const updateContactPersonMutation = api.orders.updateContactPerson.useMutation();

    const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedUserId(event.target.value);
    };

    const handleUpdateContactPerson = async () => {
        try {
            await updateContactPersonMutation.mutateAsync({ 
                orderId, 
                contactPersonId: selectedUserId 
            });
            setMessage('Contact person updated successfully');
            setIsError(false);
            onUpdate();
        } catch (error) {
            console.error('Failed to update contact person:', error);
            setMessage('Failed to update contact person');
            setIsError(true);
        }
    };

    if (isLoading) {
        return <p>Loading users...</p>;
    }

    return (
        <div className="p-4 bg-white shadow-md rounded-md">
            <div className="mb-4">
                <Label htmlFor="contactPerson">Select Contact Person</Label>
                <select 
                    id="contactPerson" 
                    value={selectedUserId} 
                    onChange={handleUserChange} 
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    {users?.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.name || user.email || user.id}
                        </option>
                    ))}
                </select>
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
            {/* Show Address and Phone Number for Contact Person */}
            {currentContactPerson && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-900">{currentContactPerson.name}</p>
                    <p className="text-sm text-gray-500">{currentContactPerson.email}</p>
                </div>
            )}
        </div>
    );
};

export default ContactPersonEditor;