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
import { type SerializedWorkOrderItem } from '~/types/serializedTypes';
import { useRouter } from 'next/navigation';
import { Button } from '~/app/_components/ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { SelectField } from '../../shared/ui/SelectField/SelectField';

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
    ink: z.string().optional(),
    other: z.string().optional(),
    prepTime: z.number().optional(),
    quantity: z.number().min(1, 'Quantity is required'),
    size: z.string().optional(),
    specialInstructions: z.string().optional(),
    status: z.nativeEnum(WorkOrderItemStatus),
});

type WorkOrderItemFormData = z.infer<typeof workOrderItemSchema>;

const WorkOrderItemForm: React.FC = () => {
    const [artworks, setArtworks] = useState<{ fileUrl: string; description: string }[]>([]);
    const [workOrderItems, setWorkOrderItems] = useState<SerializedWorkOrderItem[]>([]);
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
    const [workOrderItemId, setWorkOrderItemId] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<WorkOrderItemFormData>({
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
                ink: data.ink || '',
                other: data.other || '',
                size: data.size || '',
                specialInstructions: data.specialInstructions || '',
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
            <h2 className="text-2xl font-semibold">Estimate Jobs</h2>

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
                    <h3 className="text-xl font-semibold">Add New Estimate Job</h3>
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
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor='amount'>Amount (we bill customer)</Label>
                            <Input id='amount' type='number' {...register('amount', { valueAsNumber: true })} placeholder="Enter amount..." />
                            {errors.amount && <p className='text-red-500'>{errors.amount.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor='cost'>Cost (our cost)</Label>
                            <Input id='cost' type='number' {...register('cost', { valueAsNumber: true })} placeholder="Enter cost..." />
                            {errors.cost && <p className='text-red-500'>{errors.cost.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor='costPerM'>Cost Per M</Label>
                            <Input id='costPerM' type='number' {...register('costPerM', { valueAsNumber: true })} placeholder="Enter cost per m..." />
                            {errors.costPerM && <p className='text-red-500'>{errors.costPerM.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor='description'>Description</Label>
                            <Input id='description' {...register('description')} placeholder="Enter description..." />
                            {errors.description && <p className='text-red-500'>{errors.description.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor='ink'>Ink</Label>
                            <Input id='ink' {...register('ink')} placeholder="Enter ink..." />
                            {errors.ink && <p className='text-red-500'>{errors.ink.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor='expectedDate'>Expected Date</Label>
                            <input id='expectedDate' type='date' {...register('expectedDate')} placeholder="Select date..." />
                            {errors.expectedDate && <p className='text-red-500'>{errors.expectedDate.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor='other'>Other</Label>
                            <Input id='other' {...register('other')} placeholder="Enter other..." />
                            {errors.other && <p className='text-red-500'>{errors.other.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor='prepTime'>Prep Time</Label>
                            <Input id='prepTime' type='number' {...register('prepTime', { valueAsNumber: true })} placeholder="Enter prep time..." />
                            {errors.prepTime && <p className='text-red-500'>{errors.prepTime.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor="quantity">Quantity Ordered</Label>
                            <Input id="quantity" type="number" {...register('quantity', { valueAsNumber: true })} placeholder="Enter quantity..." />
                            {errors.quantity && <p className="text-red-500">{errors.quantity.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor="size">Size</Label>
                            <Input id="size" {...register('size')} placeholder="Enter size..." />
                            {errors.size && <p className="text-red-500">{errors.size.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor="specialInstructions">Special Instructions</Label>
                            <Input id="specialInstructions" {...register('specialInstructions')} placeholder="Enter special instructions..." />
                            {errors.specialInstructions && <p className="text-red-500">{errors.specialInstructions.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor="status">Status</Label>
                            <SelectField
                                options={Object.values(WorkOrderItemStatus).map(status => ({ value: status, label: status }))}
                                value={watch('status') || ''}
                                onValueChange={(value) => setValue('status', value as WorkOrderItemStatus)}
                                placeholder="Select status..."
                                required={true}
                            />
                            {errors.status && <p className="text-red-500">{errors.status.message}</p>}
                        </div>
                        <Button
                            variant="default"
                            type="submit"
                        >
                            Add Estimate Job
                        </Button>
                    </form>
                </>
            )}

            {isMounted && (
                <Button
                    onClick={handleFinish}
                    className="items-center justify-center gap-2 w-full flex px-[15px] py-[10px] rounded-[5px] text-[14px] font-normal text-center transition-colors bg-[#006739] text-white hover:bg-[#005730]"
                >
                    Finish
                </Button>
            )}
        </div>
    );
};

export default WorkOrderItemForm;