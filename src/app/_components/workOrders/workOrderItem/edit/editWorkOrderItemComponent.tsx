"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { SerializedWorkOrderItem } from "~/types/serializedTypes";
import { WorkOrderItemStatus } from "@prisma/client";

interface EditWorkOrderItemProps {
    workOrderItemId: string;
}

const EditWorkOrderItemComponent: React.FC<EditWorkOrderItemProps> = ({ workOrderItemId }) => {
    const router = useRouter();
    const [workOrderItem, setWorkOrderItem] = useState<SerializedWorkOrderItem | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { data: fetchedWorkOrderItem, isLoading, error: fetchError } = api.workOrderItems.getByID.useQuery(workOrderItemId);

    const updateWorkOrderItemMutation = api.workOrderItems.update.useMutation({
        onSuccess: (updatedItem) => {
            router.push(`/workOrders/${updatedItem.workOrderId}/workOrderItem/${updatedItem.id}`);
        },
        onError: (error) => {
            setError(`Failed to update: ${error.message}`);
        },
    });

    useEffect(() => {
        if (fetchedWorkOrderItem) {
            setWorkOrderItem(fetchedWorkOrderItem);
        }
    }, [fetchedWorkOrderItem]);

    if (isLoading) return <div>Loading...</div>;
    if (fetchError) return <div>Error: {fetchError.message}</div>;
    if (!workOrderItem) return <div>No work order item found</div>;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (workOrderItem) {
            const { id,
                amount,
                cost,
                description,
                expectedDate,
                ink,
                other,
                quantity,
                size,
                status,
                specialInstructions,
            } = workOrderItem;
            updateWorkOrderItemMutation.mutate({
                id,
                data: {
                    amount: amount !== null ? Number(amount) : undefined,
                    cost: cost !== null ? Number(cost) : undefined,
                    description,
                    expectedDate: expectedDate ? new Date(expectedDate) : undefined,
                    ink: ink ?? undefined,
                    other: other ?? undefined,
                    quantity: quantity ?? undefined,
                    size: size ?? undefined,
                    status: status ?? undefined,
                    specialInstructions: specialInstructions ?? undefined,
                }
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setWorkOrderItem(prev => prev ? { ...prev, [name]: value } : null);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Edit Work Order Item</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="amount" className="block mb-1">Amount</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={workOrderItem.amount ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="cost" className="block mb-1">Cost</label>
                    <input
                        type="number"
                        id="cost"
                        name="cost"
                        value={workOrderItem.cost ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block mb-1">Description</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={workOrderItem.description}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="expectedDate" className="block mb-1">Expected Date</label>
                    <input
                        type="date"
                        id="expectedDate"
                        name="expectedDate"
                        value={workOrderItem.expectedDate ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="ink" className="block mb-1">Ink</label>
                    <input
                        type="text"
                        id="ink"
                        name="ink"
                        value={workOrderItem.ink ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label htmlFor="other" className="block mb-1">Other</label>
                    <input
                        type="text"
                        id="other"
                        name="other"
                        value={workOrderItem.other ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label htmlFor="quantity" className="block mb-1">Quantity</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={workOrderItem.quantity}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="size" className="block mb-1">Size</label>
                    <input
                        type="text"
                        id="size"
                        name="size"
                        value={workOrderItem.size ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label htmlFor="status" className="block mb-1">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={workOrderItem.status}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    >
                        {Object.values(WorkOrderItemStatus).map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="specialInstructions" className="block mb-1">Special Instructions</label>
                    <textarea
                        id="specialInstructions"
                        name="specialInstructions"
                        value={workOrderItem.specialInstructions || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        rows={4}
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Update Work Order Item
                </button>
            </form>
        </div>
    );
};

export default EditWorkOrderItemComponent;
