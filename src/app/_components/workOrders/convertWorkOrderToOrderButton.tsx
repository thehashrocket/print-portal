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
            alert('Work Order successfully converted to Order');
            // You might want to redirect or refresh the page here
        } catch (error) {
            console.error('Error converting Work Order:', error);
            alert('Failed to convert Work Order to Order');
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
            {isConverting ? 'Converting...' : 'Convert Work Order to Order'}
        </button>
    );
}