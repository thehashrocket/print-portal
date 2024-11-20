// src/app/_components/orders/orderItem/StatusBadge.tsx
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';

export interface StatusBadgeProps<T extends string> {
    id: string;
    status: T;
    currentStatus: T;
    orderId: string;
    onStatusChange: (newStatus: T, sendEmail: boolean) => void;
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

    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(currentStatus)}`}>
                    {currentStatus}
                </span>
                <select
                    value={currentStatus}
                    onChange={(e) => onStatusChange(e.target.value as T, sendEmail)}
                    className="px-2 py-1 rounded-md border border-gray-300"
                >
                    {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
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
        </div>
    );
}