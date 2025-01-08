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
import { Textarea } from '../../ui/textarea';
import { CustomComboBox } from '../../shared/ui/CustomComboBox';
import { CreatePaperProductModal } from "~/app/_components/shared/paperProducts/createPaperProductModal";

const workOrderItemSchema = z.object({
    amount: z.number().multipleOf(0.01).default(1).optional(),
    artwork: z.array(z.object({
        fileUrl: z.string(),
        description: z.string().optional(),
    })).optional(),
    cost: z.number().multipleOf(0.01).default(1).optional(),
    description: z.string().min(1, 'Description is required'),
    expectedDate: z.string().optional(),
    ink: z.string().optional(),
    other: z.string().optional(),
    paperProductId: z.string().optional(),
    productTypeId: z.string().optional(),
    prepTime: z.number().min(0, 'Design time must be a positive number'),
    quantity: z.number().min(1, 'Quantity is required'),
    size: z.string(),
    specialInstructions: z.string().optional(),
    status: z.nativeEnum(WorkOrderItemStatus),
    workOrderId: z.string(),
});

type WorkOrderItemFormData = z.infer<typeof workOrderItemSchema>;

const WorkOrderItemForm: React.FC = () => {
    const { workOrder } = useContext(WorkOrderContext);
    const createWorkOrderItem = api.workOrderItems.createWorkOrderItem.useMutation();
    const utils = api.useUtils();
    const router = useRouter();

    const [artworks, setArtworks] = useState<{ fileUrl: string; description: string }[]>([]);
    const [workOrderItems, setWorkOrderItems] = useState<SerializedWorkOrderItem[]>([]);
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
    const [workOrderItemId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [customPaperProductId, setCustomPaperProductId] = useState<string | null>(null);
    const [customPaperDescription, setCustomPaperDescription] = useState<string>('');
    const [isCreatePaperProductModalOpen, setIsCreatePaperProductModalOpen] = useState(false);
    
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<WorkOrderItemFormData>({
        resolver: zodResolver(workOrderItemSchema),
        defaultValues: {
            status: WorkOrderItemStatus.Draft,
            quantity: 1,
            prepTime: 0,
            size: '',
            description: '',
            workOrderId: workOrder?.id || '',
        }
    });

    useEffect(() => {
        if (workOrder?.id) {
            setValue('workOrderId', workOrder.id);
        }
    }, [workOrder, setValue]);

    const { data: existingWorkOrderItems, refetch: refetchWorkOrderItems } = api.workOrderItems.getByWorkOrderId.useQuery(
        { workOrderId: workOrder.id },
        { enabled: !!workOrder.id }
    );

    // Retrieve all paper products, then reduce the list to only include the paper products to remove the duplicates based on the brand, size, paperType, finish, and weightLb
    const { data: paperProducts } = api.paperProducts.getAll.useQuery();
    const { data: productTypes } = api.productTypes.getAll.useQuery();
    const uniquePaperProducts = paperProducts?.filter((paperProduct, index, self) =>
        index === self.findIndex(t => t.brand === paperProduct.brand && t.size === paperProduct.size && t.paperType === paperProduct.paperType && t.finish === paperProduct.finish && t.weightLb === paperProduct.weightLb)
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
        console.log('Form submission started');
        setSubmitError(null);
        
        if (!workOrder?.id) {
            console.error('Work order ID is missing:', workOrder);
            setSubmitError('Work order ID is missing. Please try again or refresh the page.');
            return;
        }

        console.log('Submitting data:', data);
        try {
            const result = await createWorkOrderItem.mutateAsync({
                ...data,
                workOrderId: workOrder.id,
                description: data.description,
                artwork: artworks,
                expectedDate: data.expectedDate ? new Date(data.expectedDate) : new Date(),
                ink: data.ink || '',
                other: data.other || '',
                size: data.size || '',
                specialInstructions: data.specialInstructions || '',
                status: data.status,
            });
            console.log('Mutation result:', result);
            await refetchWorkOrderItems();
            reset();
            setArtworks([]);
        } catch (error) {
            console.error('Error saving estimate item:', error);
            if (error instanceof Error) {
                setSubmitError(error.message);
                console.error('Error details:', error.message);
            } else {
                setSubmitError('An unexpected error occurred. Please try again.');
                console.error('Unknown error:', error);
            }
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

    const handlePaperProductCreated = (newPaperProduct: { id: string }) => {
        setValue('paperProductId', newPaperProduct.id);
        utils.paperProducts.getAll.invalidate();
    };

    return (
        <div className="space-y-8">
            <CreatePaperProductModal
                isOpen={isCreatePaperProductModalOpen}
                onClose={() => setIsCreatePaperProductModalOpen(false)}
                onPaperProductCreated={handlePaperProductCreated}
            />
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
                    <h3 className="text-xl font-semibold">Add New Estimate Item</h3>
                    <form 
                        onSubmit={(e) => {
                            console.log('Form submit event triggered');
                            handleSubmit((data) => {
                                console.log('HandleSubmit callback triggered');
                                return onSubmit(data);
                            })(e);
                        }} 
                        className="space-y-4"
                    >
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
                            <Label htmlFor='amount' className='flex gap-1'>
                                Amount (we bill customer)
                            </Label>
                            <Input
                                id='amount'
                                type='number'
                                step="0.01"
                                {...register('amount', {
                                    setValueAs: (v: string) => v === '' ? 0 : parseFloat(v),
                                })}
                                placeholder="Enter amount..."
                            />
                            {errors.amount && <p className='text-red-500'>{errors.amount.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor='cost' className='flex gap-1'>
                                Cost (our cost)
                            </Label>
                            <Input
                                id='cost'
                                type='number'
                                step="0.01"
                                {...register('cost', {
                                    setValueAs: (v: string) => v === '' ? 0 : parseFloat(v),
                                })}
                                placeholder="Enter cost..."
                            />
                            {errors.cost && <p className='text-red-500'>{errors.cost.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor='productTypeId' className='flex gap-1'>
                                Product Type
                            </Label>
                            {productTypes && (
                                <SelectField
                                    options={productTypes.map(productType => ({ value: productType.id, label: productType.name }))}
                                value={watch('productTypeId') ?? ''}
                                onValueChange={(value) => setValue('productTypeId', value)}
                                placeholder="Select product type..."
                                />
                            )}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor='description' className='flex gap-1'>
                                Description
                                <span className='text-red-500'>*</span>
                            </Label>
                            <Textarea
                                id='description'
                                {...register('description')}
                                placeholder="Enter description..."
                                rows={4}
                            />
                            {errors.description && <p className='text-red-500'>{errors.description.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor='paperProductId' className='flex gap-1'>
                                Paper Product
                            </Label>
                            <div className="space-y-2">
                                {uniquePaperProducts && (
                                    <div className="flex gap-2">
                                        <div className="flex-grow">
                                            <CustomComboBox
                                                options={uniquePaperProducts.map((paperProduct) => ({
                                                    value: paperProduct.id,
                                                    label: paperProduct.customDescription || 
                                                        `${paperProduct.brand} ${paperProduct.finish} ${paperProduct.paperType} ${paperProduct.size} ${paperProduct.weightLb}lbs.`
                                                }))}
                                                value={watch('paperProductId') ?? ''}
                                                onValueChange={(value: string) => setValue('paperProductId', value)}
                                                placeholder="Select paper product..."
                                                emptyText="No paper products found"
                                                searchPlaceholder="Search paper products..."
                                                className="w-full"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsCreatePaperProductModalOpen(true)}
                                        >
                                            Add New
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor='ink'>Color</Label>
                            <Input id='ink' {...register('ink')} placeholder="Enter color..." />
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
                            <Label htmlFor='prepTime' className='flex gap-1'>
                                Design Time
                                <span className='text-red-500'>*</span>
                            </Label>
                            <Input id='prepTime' type='number' {...register('prepTime', { valueAsNumber: true })} placeholder="Enter design time..." />
                            {errors.prepTime && <p className='text-red-500'>{errors.prepTime.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor="quantity" className='flex gap-1'>
                                Quantity Ordered
                                <span className='text-red-500'>*</span>
                            </Label>
                            <Input id="quantity" type="number" {...register('quantity', { valueAsNumber: true })} placeholder="Enter quantity..." />
                            {errors.quantity && <p className="text-red-500">{errors.quantity.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor="size" className='flex gap-1'>
                                Size
                                <span className='text-red-500'>*</span>
                            </Label>
                            <Input id="size" {...register('size')} placeholder="Enter size..." />
                            {errors.size && <p className="text-red-500">{errors.size.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor="specialInstructions">Special Instructions</Label>
                            <Input id="specialInstructions" {...register('specialInstructions')} placeholder="Enter special instructions..." />
                            {errors.specialInstructions && <p className="text-red-500">{errors.specialInstructions.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor="status" className='flex gap-1'>
                                Status
                                <span className='text-red-500'>*</span>
                            </Label>
                            <SelectField
                                options={Object.values(WorkOrderItemStatus).map(status => ({ value: status, label: status }))}
                                value={watch('status') || ''}
                                onValueChange={(value) => setValue('status', value as WorkOrderItemStatus)}
                                placeholder="Select status..."
                                required={true}
                            />
                            {errors.status && <p className="text-red-500">{errors.status.message}</p>}
                        </div>
                        <div className="space-y-2">
                            {Object.keys(errors).length > 0 && (
                                <div className="text-red-500 p-2 border border-red-500 rounded">
                                    <p>Form has the following errors:</p>
                                    <ul>
                                        {Object.entries(errors).map(([field, error]) => (
                                            <li key={field}>{field}: {error.message}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {submitError && (
                                <div className="text-red-500 p-2 border border-red-500 rounded">
                                    {submitError}
                                </div>
                            )}
                            <Button
                                variant="default"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Adding...' : 'Add Item to Estimate'}
                            </Button>
                        </div>
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