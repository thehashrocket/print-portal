import { api } from "~/trpc/react";
import { OrderItemStatus } from "@prisma/client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { StatusBadge } from "../../shared/StatusBadge/StatusBadge";


const ItemStatusBadge: React.FC<{ id: string, status: OrderItemStatus, orderId: string, onUpdate: () => void }> = ({ id, status, orderId, onUpdate }) => {
    const [currentStatus, setCurrentStatus] = useState(status);
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

    const getStatusColor = (status: OrderItemStatus): string => {
        switch (status) {
            case "Completed": return "bg-green-100 text-green-800";
            case "Cancelled": return "bg-red-100 text-red-800";
            case "Pending": return "bg-yellow-100 text-yellow-800";
            case "Hold": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const handleStatusChange = (newStatus: OrderItemStatus, sendEmail: boolean, emailOverride: string) => {
        updateStatus({
            id,
            status: newStatus,
            sendEmail,
            emailOverride
        });
        setCurrentStatus(newStatus);
    };

    return (
        <StatusBadge<OrderItemStatus>
            id={id}
            status={status}
            currentStatus={currentStatus}
            orderId={orderId}
            onStatusChange={handleStatusChange}
            getStatusColor={getStatusColor}
            statusOptions={Object.values(OrderItemStatus)}
        />
    );
};

export default ItemStatusBadge;

