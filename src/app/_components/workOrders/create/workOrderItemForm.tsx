// ~/app/_components/workOrders/create/workOrderItemForm.tsx
"use client";
import React, { useState, useContext, useEffect, useRef } from 'react';
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
import { WorkOrderItemStockDialog } from '../WorkOrderItemStock/workOrderItemStockDialog';
import { useWorkOrderItemStockStore } from '~/app/store/workOrderItemStockStore';
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";

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
    prepTime: z.number().min(0, 'Design time must be a positive number'),
    quantity: z.number().min(1, 'Quantity is required'),
    size: z.string(),
    specialInstructions: z.string().optional(),
    status: z.nativeEnum(WorkOrderItemStatus),
    workOrderId: z.string(),
    productTypeId: z.string().optional(),
});

type WorkOrderItemFormData = z.infer<typeof workOrderItemSchema>;

const WorkOrderItemForm: React.FC = () => {
    const { workOrder } = useContext(WorkOrderContext);
    const createWorkOrderItem = api.workOrderItems.createWorkOrderItem.useMutation();
    const createWorkOrderItemStock = api.workOrderItemStocks.create.useMutation();
    const router = useRouter();

    const [artworks, setArtworks] = useState<{ fileUrl: string; description: string }[]>([]);
    const [workOrderItems, setWorkOrderItems] = useState<SerializedWorkOrderItem[]>([]);
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
    const [workOrderItemId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const { tempStocks, clearTempStocks } = useWorkOrderItemStockStore();

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

    const { data: productTypes } = api.productTypes.getAll.useQuery();
    const { data: paperProducts } = api.paperProducts.getAll.useQuery();

    const findPaperProduct = (paperProductId: string) => {
        return paperProducts?.find(product => product.id === paperProductId)?.brand + ' ' + paperProducts?.find(product => product.id === paperProductId)?.size + ' ' + paperProducts?.find(product => product.id === paperProductId)?.paperType + ' ' + paperProducts?.find(product => product.id === paperProductId)?.finish + ' ' + paperProducts?.find(product => product.id === paperProductId)?.weightLb;
    };

    useEffect(() => {
        if (existingWorkOrderItems) {
            setWorkOrderItems(existingWorkOrderItems);
        }
    }, [existingWorkOrderItems]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Add CopilotKit readable context for form state
    useCopilotReadable({
        description: "Current work order item form values and validation state",
        value: {
            formValues: {
                amount: watch('amount'),
                cost: watch('cost'),
                description: watch('description'),
                expectedDate: watch('expectedDate'),
                ink: watch('ink'),
                other: watch('other'),
                prepTime: watch('prepTime'),
                quantity: watch('quantity'),
                size: watch('size'),
                specialInstructions: watch('specialInstructions'),
                status: watch('status'),
                productTypeId: watch('productTypeId'),
            },
            formErrors: Object.keys(errors).length > 0 ? Object.fromEntries(
                Object.entries(errors).map(([key, value]) => [key, value.message])
            ) : {},
            isSubmitting,
            submitError,
        },
    });

    // Add CopilotKit readable context for artwork and files
    useCopilotReadable({
        description: "Artwork and file attachments for the work order item",
        value: {
            artworks: artworks.map(art => ({
                fileUrl: art.fileUrl,
                description: art.description,
            })),
            hasFiles: artworks.length > 0,
        },
    });

    // Add CopilotKit readable context for stock items
    useCopilotReadable({
        description: "Paper stock items selected for the work order item",
        value: {
            stockItems: tempStocks.map(stock => ({
                stockQty: stock.stockQty,
                paperProductId: stock.paperProductId,
                stockStatus: stock.stockStatus,
                supplier: stock.supplier,
            })),
            hasStocks: tempStocks.length > 0,
            availablePaperProducts: paperProducts?.map(product => ({
                id: product.id,
                name: `${product.brand} ${product.size} ${product.paperType} ${product.finish} ${product.weightLb}`,
            })) ?? [],
        },
    });

    // Add CopilotKit readable context for available options
    useCopilotReadable({
        description: "Available product types and existing work order items",
        value: {
            productTypes: productTypes?.map((type: { id: string; name: string | null }) => ({
                id: type.id,
                name: type.name,
            })) ?? [],
            existingItems: workOrderItems.map(item => ({
                id: item.id,
                description: item.description,
                status: item.status,
                quantity: item.quantity,
            })),
            expandedItemId,
        },
    });

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
                expectedDate: data.expectedDate ? new Date(data.expectedDate + 'T12:00:00') : new Date(),
                ink: data.ink || '',
                other: data.other || '',
                size: data.size || '',
                specialInstructions: data.specialInstructions || '',
                status: data.status,
            });

            // Create WorkOrderItemStocks for the newly created WorkOrderItem
            if (tempStocks.length > 0) {
                const createStockPromises = tempStocks.map(stock => 
                    createWorkOrderItemStock.mutateAsync({
                        ...stock,
                        workOrderItemId: result.id,
                    })
                );
                await Promise.all(createStockPromises);
                clearTempStocks();
            }

            console.log('Mutation result:', result);
            await refetchWorkOrderItems();
            reset();
            setArtworks([]);
            setSubmitError(null);
            clearTempStocks();
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
            router.refresh();
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
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label htmlFor='artwork' className='block text-sm font-medium text-gray-700'>Files</label>
                            <FileUpload
                                onFileUploaded={handleFileUploaded}
                                onFileRemoved={handleFileRemoved}
                                onDescriptionChanged={handleDescriptionChanged}
                                workOrderItemId={workOrderItemId}
                                initialFiles={artworks}
                            />
                        </div>

                        {/* Stock Items Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between w-320">
                                <Label>Paper Stock Items</Label>
                                <WorkOrderItemStockDialog />
                            </div>
                            
                            {tempStocks.length > 0 && (
                                <div className="space-y-2">
                                    {tempStocks.map((stock, index) => (
                                        <div key={index} className="p-4 border rounded-lg">
                                            <p>Quantity: {stock.stockQty}</p>
                                            <p>Paper Product: {stock.paperProductId ? findPaperProduct(stock.paperProductId) : 'Unknown'}</p>
                                            <p>Status: {stock.stockStatus}</p>
                                            <p>{stock.supplier && <p>Supplier: {stock.supplier}</p>}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Rest of the form fields */}
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

            <CopilotPopup
                instructions={`You are an AI assistant helping users create work order items in a print portal system. You have access to:
                    1. The complete form state including values and validation errors
                    2. Artwork and file attachments
                    3. Paper stock selections and available paper products
                    4. Product types and specifications
                    5. Existing work order items in this order

                    Your role is to:
                    - Guide users through the work order item creation process
                    - Help with file uploads and artwork management
                    - Assist with paper stock selection and specifications
                    - Explain pricing and quantity calculations
                    - Help with product type selection and specifications
                    - Provide guidance on dates and status options

                    When responding:
                    - Reference specific form fields and their current values
                    - Explain validation errors clearly
                    - Help users understand paper stock options and requirements
                    - Guide users through artwork and file requirements
                    - Explain technical specifications (size, ink, etc.)
                    - Assist with cost and pricing calculations
                    - Help users understand the relationship between different fields`}
                labels={{
                    title: "Work Order Item Assistant",
                    initial: "How can I help you create your work order item?",
                    placeholder: "Ask about specifications, pricing, paper stock...",
                }}
            />
        </div>
    );
};

export default WorkOrderItemForm;