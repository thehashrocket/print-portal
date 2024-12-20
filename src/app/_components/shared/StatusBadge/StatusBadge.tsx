// src/app/_components/orders/orderItem/StatusBadge.tsx
import React, { useState } from 'react';
import { Switch } from '~/app/_components/ui/switch';
import { Input } from '../../ui/input';
import { ShippingMethod } from '@prisma/client';
import { Button } from '../../ui/button';
import { SelectField } from '~/app/_components/shared/ui/SelectField/SelectField';
import { Save } from 'lucide-react';
import { Disc } from 'lucide-react';

export interface StatusBadgeProps<T extends string> {
    id: string;
    status: T;
    currentStatus: T;
    orderId: string;
    onStatusChange: (
        newStatus: T, 
        sendEmail: boolean, 
        emailOverride: string,
        shippingDetails?: {
            trackingNumber?: string;
            shippingMethod?: ShippingMethod;
        }
    ) => void;
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
    const [trackingNumber, setTrackingNumber] = useState("");
    const [shippingMethod, setShippingMethod] = useState<ShippingMethod>(ShippingMethod.Other);

    const isShippingStatus = statusToSave === "Shipping";

    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(currentStatus)}`}>
                    {currentStatus}
                </span>
                <SelectField
                    options={statusOptions.map(status => ({ value: status, label: status }))}
                    value={statusToSave}
                    onValueChange={(value: string) => setStatusToSave(value as T)}
                    placeholder="Select status..."
                    required={true}
                />
            </div>
            
            {isShippingStatus && (
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="flex flex-col space-y-2">
                        <Input 
                            type="text" 
                            placeholder="Tracking Number" 
                            value={trackingNumber} 
                            onChange={(e) => setTrackingNumber(e.target.value)} 
                        />
                        <SelectField
                            options={Object.values(ShippingMethod).map(method => ({ value: method, label: method }))}
                            value={shippingMethod}
                            onValueChange={(value: string) => setShippingMethod(value as ShippingMethod)}
                            placeholder="Select shipping method..."
                            required={true}
                        />
                    </div>
                </div>
            )}

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
                    <Input 
                        type="email" 
                        placeholder="Email address (optional)" 
                        value={emailOverride} 
                        onChange={(e) => setEmailOverride(e.target.value)} 
                    />
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Button
                    variant="default"
                    onClick={() => {
                        setIsSaving(true);
                        const shippingDetails = isShippingStatus ? {
                            trackingNumber,
                            shippingMethod
                        } : undefined;
                        
                        onStatusChange(statusToSave, sendEmail, emailOverride, shippingDetails);
                        setIsSaving(false);
                    }}
                >
                    <Save className="w-4 h-4" /> Save
                </Button>
            </div>
        </div>
    );
}