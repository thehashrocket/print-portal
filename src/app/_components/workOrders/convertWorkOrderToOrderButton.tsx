// ~/src/app/_components/workOrders/convertWorkOrderToOrderButton.tsx
'use client';
import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react"; // use client to fetch data instead of server


interface ConvertWorkOrderButtonProps {
    workOrderId: string;
    officeId: string;
}

export default function ConvertWorkOrderButton({ workOrderId, officeId }: ConvertWorkOrderButtonProps) {
    const [isConverting, setIsConverting] = useState(false);
    const convertMutation = api.workOrders.convertWorkOrderToOrder.useMutation();

    const handleConvert = async () => {
        setIsConverting(true);
        try {
            await convertMutation.mutateAsync({ id: workOrderId, officeId });
            alert('Order successfully sent to Production');
            // You might want to redirect or refresh the page here
        } catch (error) {
            console.error('Error sending Order to Production:', error);
            alert('Failed to send Order to Production');
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <button
            onClick={handleConvert}
            disabled={isConverting}
            className="btn btn-primary"
        >
            {isConverting ? 'Converting...' : 'Send Order to Production'}
        </button>
    );
}