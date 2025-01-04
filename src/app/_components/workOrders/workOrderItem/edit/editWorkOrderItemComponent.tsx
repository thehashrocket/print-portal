"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { type SerializedWorkOrderItem } from "~/types/serializedTypes";
import { WorkOrderItemStatus } from "@prisma/client";
import { Button } from "~/app/_components/ui/button";
import { SelectField } from "~/app/_components/shared/ui/SelectField/SelectField";
import { Textarea } from "~/app/_components/ui/textarea";
import { Input } from "~/app/_components/ui/input";
import { Label } from "~/app/_components/ui/label";

interface EditWorkOrderItemProps {
    workOrderItemId: string;
}

const EditWorkOrderItemComponent: React.FC<EditWorkOrderItemProps> = ({ workOrderItemId }) => {
    const router = useRouter();
    const utils = api.useUtils();
    const [workOrderItem, setWorkOrderItem] = useState<SerializedWorkOrderItem | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { data: fetchedWorkOrderItem, isLoading, error: fetchError } = api.workOrderItems.getByID.useQuery(workOrderItemId);
    
    const { data: productTypes } = api.productTypes.getAll.useQuery();
    const { data: paperProducts } = api.paperProducts.getAll.useQuery();
    const updateWorkOrderItemMutation = api.workOrderItems.update.useMutation({
        onSuccess: (updatedItem) => {
            utils.workOrderItems.getByID.invalidate(updatedItem.id ?? '');
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
            const {
                id,
                amount,
                cost,
                description,
                expectedDate,
                ink,
                other,
                paperProductId,
                productTypeId,
                quantity,
                size,
                status,
                specialInstructions,
            } = workOrderItem;
            updateWorkOrderItemMutation.mutate({
                id,
                data: {
                    amount: amount ? parseFloat(amount) : undefined,
                    cost: cost ? parseFloat(cost) : undefined,
                    description,
                    expectedDate: expectedDate ? new Date(expectedDate) : undefined,
                    ink: ink ?? undefined,
                    other: other ?? undefined,
                    paperProductId: paperProductId ?? undefined,
                    productTypeId: productTypeId ?? undefined,
                    quantity,
                    size: size ?? undefined,
                    status: status ?? undefined,
                    specialInstructions: specialInstructions ?? undefined,
                }
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'quantity') {
            const numValue = value === '' ? 1 : parseInt(value, 10);
            setWorkOrderItem(prev => prev ? { ...prev, quantity: numValue } : null);
        } else if (name === 'amount' || name === 'cost') {
            setWorkOrderItem(prev => prev ? { ...prev, [name]: value === '' ? null : value } : null);
        } else {
            setWorkOrderItem(prev => prev ? { ...prev, [name]: value } : null);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Edit Estimate Item</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="amount" className="block mb-1">Amount</Label>
                    <Input
                        type="number"
                        id="amount"
                        name="amount"
                        value={workOrderItem.amount ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                        step="0.01"
                        min="0"
                    />
                </div>
                <div>
                    <Label htmlFor="cost" className="block mb-1">Cost</Label>
                    <Input
                        type="number"
                        id="cost"
                        name="cost"
                        value={workOrderItem.cost ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                        step="0.01"
                        min="0"
                    />
                </div>
                <div>
                    <Label htmlFor="productTypeId" className="block mb-1">Product Type</Label>
                    {productTypes && (
                        <SelectField
                            options={productTypes.map(productType => ({ value: productType.id, label: productType.name }))}
                            value={workOrderItem.productTypeId ?? ''}
                        onValueChange={(value) => setWorkOrderItem(prev => prev ? { ...prev, productTypeId: value } : null)}
                        placeholder="Select product type..."
                            required={true}
                        />
                    )}
                </div>
                <div>
                    <Label htmlFor="paperProductId" className="block mb-1">Paper Product</Label>
                    {paperProducts && (
                        <SelectField
                            options={paperProducts.map(paperProduct => ({ value: paperProduct.id, label: `${paperProduct.brand} ${paperProduct.paperType} ${paperProduct.finish} ${paperProduct.weightLb} lbs` }))}
                            value={workOrderItem.paperProductId ?? ''}
                            onValueChange={(value) => setWorkOrderItem(prev => prev ? { ...prev, paperProductId: value } : null)}
                            placeholder="Select paper product..."
                            required={true}
                        />
                    )}
                </div>
                <div>
                    <Label htmlFor="description" className="block mb-1">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        rows={4}
                        placeholder="Enter description..."
                        value={workOrderItem.description}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="expectedDate" className="block mb-1">Expected Date</Label>
                    <Input
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
                    <Label htmlFor="ink" className="block mb-1">Ink</Label>
                    <Input
                        type="text"
                        id="ink"
                        name="ink"
                        value={workOrderItem.ink ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <Label htmlFor="other" className="block mb-1">Other</Label>
                    <Input
                        type="text"
                        id="other"
                        name="other"
                        value={workOrderItem.other ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <Label htmlFor="quantity" className="block mb-1">Quantity</Label>
                    <Input
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
                    <Label htmlFor="size" className="block mb-1">Size</Label>
                    <Input
                        type="text"
                        id="size"
                        name="size"
                        value={workOrderItem.size ?? ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <Label htmlFor="status" className="block mb-1">Status</Label>
                    <SelectField
                        options={Object.values(WorkOrderItemStatus).map((status) => ({ value: status, label: status }))}
                        value={workOrderItem.status}
                        onValueChange={(value: string) => setWorkOrderItem(prev => prev ? { ...prev, status: value as WorkOrderItemStatus } : null)}
                        placeholder="Select status..."
                        required={true}
                    />
                </div>
                <div>
                    <Label htmlFor="specialInstructions" className="block mb-1">Special Instructions</Label>
                    <Textarea
                        id="specialInstructions"
                        name="specialInstructions"
                        value={workOrderItem.specialInstructions || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        rows={4}
                    />
                </div>
                <Button
                    type="submit"
                    variant="default"
                >
                    Update Estimate Item
                </Button>
            </form>
        </div>
    );
};

export default EditWorkOrderItemComponent;

