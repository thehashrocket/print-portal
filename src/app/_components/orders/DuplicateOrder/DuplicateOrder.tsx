"use client";
// This component is used to duplicate an order.
// It has a button to duplicate the order.
// It has a button to cancel the duplication.
// When the order is duplicated, it creates a new order with the same items and quantities.
// On successful duplication, it redirects to the new order.

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { api } from "~/trpc/react";
import { toast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";
interface DuplicateOrderProps {
    orderId: string;
}

const DuplicateOrder: React.FC<DuplicateOrderProps> = ({ orderId }) => {
    const utils = api.useUtils();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newOrderId, setNewOrderId] = useState<string | null>(null);
    const { mutate: duplicateOrder, isPending } = api.orders.duplicateOrder.useMutation({
        onSuccess: (data) => {
            setNewOrderId(data.order.id);
            toast({
                title: "Order duplicated successfully",
            });
        },
        onError: () => {
            toast({
                title: "Failed to duplicate order",
            });
        },
    });
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Duplicate Order</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Duplicate Order</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <p>Are you sure you want to duplicate this order?</p>
                    <div className="flex flex-row gap-2">
                        <Button 
                            variant="default"
                            onClick={() => duplicateOrder(orderId)} 
                            disabled={isPending}
                        >
                            {isPending ? "Duplicating..." : "Duplicate Order"}
                        </Button>
                        {newOrderId && (
                            <Button 
                                variant="outline" 
                                onClick={() => router.push(`/orders/${newOrderId}`)}
                            >
                                Go to new order
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DuplicateOrder;