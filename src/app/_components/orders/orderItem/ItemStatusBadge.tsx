"use client";
import { api } from "~/trpc/react";
import { OrderItemStatus } from "~/generated/prisma/browser";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Info, Save } from "lucide-react";
import { Switch } from "~/app/_components/ui/switch";
import { Input } from "~/app/_components/ui/input";
import { Button } from "~/app/_components/ui/button";
import { SelectField } from "~/app/_components/shared/ui/SelectField/SelectField";

const ItemStatusBadge: React.FC<{ id: string, status: OrderItemStatus, orderId: string, onUpdate: () => void }> = ({ id, status, orderId, onUpdate }) => {
    const [currentStatus, setCurrentStatus] = useState(status);
    const [sendEmail, setSendEmail] = useState(false);
    const [emailOverride, setEmailOverride] = useState("");
    const [statusToSave, setStatusToSave] = useState<OrderItemStatus>(status);

    const utils = api.useUtils();

    const { mutate: updateStatus } = api.orderItems.updateStatus.useMutation({
        onSuccess: (data) => {
            console.log('data', data);
            utils.orders.getByID.invalidate(orderId);
            toast.success('Status updated successfully', { duration: 4000, position: 'top-right' });
            onUpdate();
        },
        onError: (error) => {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status', { duration: 4000, position: 'top-right' });
        },
    });

    const getStatusColor = (s: OrderItemStatus): string => {
        switch (s) {
            case "Completed": return "bg-green-100 text-green-800";
            case "Cancelled": return "bg-red-100 text-red-800";
            case "Pending": return "bg-yellow-100 text-yellow-800";
            case "Hold": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 text-sm bg-blue-50 border border-blue-200 rounded-md mb-4">
                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                <p className="text-blue-700">
                    Select a new status from the dropdown, optionally notify the customer via email, then save.
                </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <span className={`px-2 py-1 rounded-full text-sm font-semibold w-48 flex items-center justify-center ${getStatusColor(currentStatus)}`}>
                    {currentStatus}
                </span>
                <SelectField
                    options={(Object.values(OrderItemStatus) as string[]).map(s => ({ value: s, label: s }))}
                    value={statusToSave}
                    onValueChange={(value: string) => setStatusToSave(value as OrderItemStatus)}
                    placeholder="Select status..."
                    required={true}
                />
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-2">
                    <Switch checked={sendEmail} onCheckedChange={setSendEmail} id="item-send-email" />
                    <label htmlFor="item-send-email" className="text-sm text-gray-600">Notify customer via email</label>
                </div>
                <Input
                    type="email"
                    placeholder="Email address (optional)"
                    value={emailOverride}
                    onChange={(e) => setEmailOverride(e.target.value)}
                />
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Button
                    variant="default"
                    onClick={() => {
                        updateStatus({ id, status: statusToSave, sendEmail, emailOverride });
                        setCurrentStatus(statusToSave);
                    }}
                >
                    <Save className="w-4 h-4" /> Save
                </Button>
            </div>
        </div>
    );
};

export default ItemStatusBadge;
