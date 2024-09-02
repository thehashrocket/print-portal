// ~/app/_components/workOrders/create/workOrderItemForm.tsx
"use client";
import React, { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '~/trpc/react';
import ExistingWorkOrderItemsList from './existingWorkOrderItemsList';
import ExpandableWorkOrderItemDetails from './expandableWorkOrderItemDetails';
import { WorkOrderContext } from '~/app/contexts/workOrderContext';
import { WorkOrderItemStatus } from '@prisma/client'
import FileUpload from '~/app/_components/shared/fileUpload';
import { SerializedWorkOrderItem } from '~/types/serializedTypes';
import { useRouter } from 'next/navigation';

const workOrderItemSchema = z.object({
    amount: z.number().min(1, 'Amount is required'),
    artwork: z.array(z.object({
        fileUrl: z.string(),
        description: z.string().optional(),
    })).optional(),
    cost: z.number().optional(),
    costPerM: z.number().min(1, 'Cost Per M is required'),
    description: z.string().min(1, 'Description is required'),
    expectedDate: z.string().optional(),
    other: z.string().optional(),
    prepTime: z.number().optional(),
    quantity: z.number().min(1, 'Quantity is required'),
    size: z.string().optional(),
    specialInstructions: z.string().optional(),
    status: z.nativeEnum(WorkOrderItemStatus),
    stockOnHand: z.boolean(),
    stockOrdered: z.string().optional(),
});

type WorkOrderItemFormData = z.infer<typeof workOrderItemSchema>;

const WorkOrderItemForm: React.FC = () => {
    const [artworks, setArtworks] = useState<{ fileUrl: string; description: string }[]>([]);
    const [workOrderItems, setWorkOrderItems] = useState<SerializedWorkOrderItem[]>([]);
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
    const [workOrderItemId, setWorkOrderItemId] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<WorkOrderItemFormData>({
        resolver: zodResolver(workOrderItemSchema),
    });
    const { workOrder } = useContext(WorkOrderContext);
    const [isMounted, setIsMounted] = useState(false);
    const createWorkOrderItem = api.workOrderItems.createWorkOrderItem.useMutation();
    const router = useRouter();

    const { data: existingWorkOrderItems, refetch: refetchWorkOrderItems } = api.workOrderItems.getByWorkOrderId.useQuery(
        { workOrderId: workOrder.id },
        { enabled: !!workOrder.id }
    );

    useEffect(() => {
        if (existingWorkOrderItems) {
            setWorkOrderItems(existingWorkOrderItems);
        }
    }, [existingWorkOrderItems]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onSubmit = async (data: WorkOrderItemFormData) => {
        try {
            const newWorkOrderItem = await createWorkOrderItem.mutateAsync({
                ...data,
                workOrderId: workOrder.id,
                description: data.description, // Provide a default empty string if description is undefined
                artwork: artworks, // Use the artworks state instead of data.artwork
                expectedDate: data.expectedDate ? new Date(data.expectedDate) : new Date(),
                other: data.other || '',
                size: data.size || '',
                specialInstructions: data.specialInstructions || '',
                stockOrdered: data.stockOrdered || '',
            });
            await refetchWorkOrderItems();
            reset(); // Reset form after successful creation
            setArtworks([]); // Clear artworks after successful creation
        } catch (error) {
            console.error('Error saving work job', error);
        }
    };

    const handleFinish = () => {
        if (isMounted) {
            router.push(`/workOrders/${workOrder.id}`);
        }
    };

    const handleFileUploaded = (fileUrl: string, description: string) => {
        setArtworks(prev => [...prev, { fileUrl, description }]);
    };

    const handleFileRemoved = (fileUrl: string) => {
        setArtworks(prev => prev.filter(art => art.fileUrl !== fileUrl));
    };

    const handleDescriptionChanged = (fileUrl: string, newDescription: string) => {
        setArtworks(prev => prev.map(art =>
            art.fileUrl === fileUrl ? { ...art, description: newDescription } : art
        ));
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-semibold">Work Order Jobs</h2>

            <ExistingWorkOrderItemsList
                items={workOrderItems}
                onItemClick={setExpandedItemId}
            />

            {expandedItemId ? (
                <ExpandableWorkOrderItemDetails
                    itemId={expandedItemId}
                    onClose={() => setExpandedItemId(null)}
                />
            ) : (
                <>
                    <h3 className="text-xl font-semibold">Add New Work Order Job</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label htmlFor='artwork' className='block text-sm font-medium text-gray-700'>Artwork</label>
                            <FileUpload
                                onFileUploaded={handleFileUploaded}
                                onFileRemoved={handleFileRemoved}
                                onDescriptionChanged={handleDescriptionChanged}
                                workOrderItemId={workOrderItemId}
                                initialFiles={artworks}
                            />
                        </div>
                        <div>
                            <label htmlFor='amount' className='block text-sm font-medium text-gray-700'>Amount (we bill customer)</label>
                            <input id='amount' type='number' {...register('amount', { valueAsNumber: true })} className='input input-bordered w-full' />
                            {errors.amount && <p className='text-red-500'>{errors.amount.message}</p>}
                        </div>
                        <div>
                            <label htmlFor='cost' className='block text-sm font-medium text-gray-700'>Cost (our cost)</label>
                            <input id='cost' type='number' {...register('cost', { valueAsNumber: true })} className='input input-bordered w-full' />
                            {errors.cost && <p className='text-red-500'>{errors.cost.message}</p>}
                        </div>
                        <div>
                            <label htmlFor='costPerM' className='block text-sm font-medium text-gray-700'>Cost Per M</label>
                            <input id='costPerM' type='number' {...register('costPerM', { valueAsNumber: true })} className='input input-bordered w-full' />
                            {errors.costPerM && <p className='text-red-500'>{errors.costPerM.message}</p>}
                        </div>
                        <div>
                            <label htmlFor='description' className='block text-sm font-medium text-gray-700'>Description</label>
                            <input id='description' {...register('description')} className='input input-bordered w-full' />
                            {errors.description && <p className='text-red-500'>{errors.description.message}</p>}
                        </div>
                        <div>
                            <label htmlFor='expectedDate' className='block text-sm font-medium text-gray-700'>Expected Date</label>
                            <input id='expectedDate' type='date' {...register('expectedDate')} className='input input-bordered w-full' />
                            {errors.expectedDate && <p className='text-red-500'>{errors.expectedDate.message}</p>}
                        </div>
                        <div>
                            <label htmlFor='other' className='block text-sm font-medium text-gray-700'>Other</label>
                            <input id='other' {...register('other')} className='input input-bordered w-full' />
                            {errors.other && <p className='text-red-500'>{errors.other.message}</p>}
                        </div>
                        <div>
                            <label htmlFor='prepTime' className='block text-sm font-medium text-gray-700'>Prep Time</label>
                            <input id='prepTime' type='number' {...register('prepTime', { valueAsNumber: true })} className='input input-bordered w-full' />
                            {errors.prepTime && <p className='text-red-500'>{errors.prepTime.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity Ordered</label>
                            <input id="quantity" type="number" {...register('quantity', { valueAsNumber: true })} className="input input-bordered w-full" />
                            {errors.quantity && <p className="text-red-500">{errors.quantity.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="size" className="block text-sm font-medium text-gray-700">Size</label>
                            <input id="size" {...register('size')} className="input input-bordered w-full" />
                            {errors.size && <p className="text-red-500">{errors.size.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700">Special Instructions</label>
                            <input id="specialInstructions" {...register('specialInstructions')} className="input input-bordered w-full" />
                            {errors.specialInstructions && <p className="text-red-500">{errors.specialInstructions.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select id="status" {...register('status')} className="input input-bordered w-full">
                                {Object.values(WorkOrderItemStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            {errors.status && <p className="text-red-500">{errors.status.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="stockOnHand" className="block text-sm font-medium text-gray-700">Stock On Hand</label>
                            <input type="checkbox" className="checkbox" {...register("stockOnHand")} />
                            {errors.stockOnHand && <p className="text-red-500">{errors.stockOnHand.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="stockOrdered" className="block text-sm font-medium text-gray-700">Stock Ordered</label>
                            <input id="stockOrdered" {...register('stockOrdered')} className="input input-bordered w-full" />
                            {errors.stockOrdered && <p className="text-red-500">{errors.stockOrdered.message}</p>}
                        </div>
                        <button type="submit" className="btn btn-primary">
                            Add Work Order Job
                        </button>
                    </form>
                </>
            )}

            {isMounted && (
                <button onClick={handleFinish} className="btn btn-secondary">
                    Finish
                </button>
            )}
        </div>
    );
};

export default WorkOrderItemForm;