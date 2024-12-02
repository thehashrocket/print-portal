// src/app/_components/orders/orderItem/StatusBadge.tsx
import React, { useState } from 'react';
import { Switch } from '~/app/_components/ui/switch';
import { Input } from '../ui/input';

export interface StatusBadgeProps<T extends string> {
    id: string;
    status: T;
    currentStatus: T;
    orderId: string;
    onStatusChange: (newStatus: T, sendEmail: boolean, emailOverride: string) => void;
    getStatusColor: (status: T) => string;
    statusOptions: T[];
}

export function StatusBadge<T extends string>({
    id,
    status,
    currentStatus,
    orderId,
    onStatusChange,
    getStatusColor,
    statusOptions,
}: StatusBadgeProps<T>) {
    const [sendEmail, setSendEmail] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [emailOverride, setEmailOverride] = useState("");
    const [statusToSave, setStatusToSave] = useState(currentStatus);

    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(currentStatus)}`}>
                    {currentStatus}
                </span>
                <select
                    value={statusToSave}
                    onChange={(e) => setStatusToSave(e.target.value as T)}
                    className="px-2 py-1 rounded-md border border-gray-300"
                >
                    {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={sendEmail}
                        onCheckedChange={setSendEmail}
                        id="send-email"
                    />
                    <label htmlFor="send-email" className="text-sm text-gray-600">
                        Notify customer via email
                    </label>
                </div>
                <div className="flex items-center space-x-2">
                    {/* Input field allowing for email address override. If email is sent, it will be sent to this address instead of the customer's email address. */}
                    <Input type="email" placeholder="Email address (optional)" value={emailOverride} onChange={(e) => setEmailOverride(e.target.value)} />
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <button 
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    onClick={() => {
                        setIsSaving(true);
                        onStatusChange(statusToSave, sendEmail, emailOverride);
                        setIsSaving(false);
                    }}
                >
                    Save
                </button>
            </div>
        </div>
    );
}