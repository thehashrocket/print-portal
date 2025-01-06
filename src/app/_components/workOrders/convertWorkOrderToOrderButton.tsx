// ~/src/app/_components/workOrders/convertWorkOrderToOrderButton.tsx
'use client';
import React, { useState } from "react";
import { api } from "~/trpc/react"; // use client to fetch data instead of server
import { Button } from '~/app/_components/ui/button';
import { Send, Info } from "lucide-react";

interface ConvertWorkOrderButtonProps {
    workOrderId: string;
    officeId: string;
}

export default function ConvertWorkOrderButton({ workOrderId, officeId }: ConvertWorkOrderButtonProps) {
    const [isConverting, setIsConverting] = useState(false);
    const convertMutation = api.workOrders.convertWorkOrderToOrder.useMutation();
    const utils = api.useUtils();
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
            await utils.workOrders.getByID.invalidate(workOrderId);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <Button
                variant="default"
                onClick={handleConvert}
                disabled={isConverting}
            >
                <Send className="w-4 h-4 mr-2" />
                {isConverting ? 'Converting...' : 'Send Order to Production'}
            </Button>
            
            <div className="flex items-start gap-2 p-3 text-sm bg-blue-50 border border-blue-200 rounded-md">
                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                <p className="text-blue-700">
                    Click the button above to convert this estimate into a production order. 
                    Once converted, the order will be sent to the production team.
                </p>
            </div>
        </div>
    );
}