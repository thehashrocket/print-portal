"use client";
import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '~/trpc/react';
import { WorkOrderContext } from '~/app/contexts/workOrderContext';
import { WorkOrderItem, WorkOrderItemStatus } from '@prisma/client'
import ProcessingOptionsForm from '../../shared/processingOptions/processingOptionsForm';
import { TypesettingProvider } from '~/app/contexts/TypesettingContext';
import { ProcessingOptionsProvider } from '~/app/contexts/ProcessingOptionsContext';
import TypesettingComponent from '../../shared/typesetting/typesettingComponent';
import Link from 'next/link';

const workOrderItemSchema = z.object({
    amount: z.number().min(1, 'Amount is required'),
    approved: z.boolean(),
    artwork: z.string().optional(),
    cost: z.number().optional(),
    costPerM: z.number().min(1, 'Cost Per M is required'),
    cs: z.string().optional(),
    description: z.string().optional(),
    expectedDate: z.string().optional(),
    finishedQty: z.number().optional(),
    inkColor: z.string().optional(),
    other: z.string().optional(),
    overUnder: z.number().optional(),
    plateRan: z.string().optional(),
    prepTime: z.number().optional(),
    pressRun: z.string().optional(),
    quantity: z.number().min(1, 'Quantity is required'),
    size: z.string().optional(),
    specialInstructions: z.string().optional(),
    status: z.nativeEnum(WorkOrderItemStatus),
    stockOnHand: z.boolean(),
    stockOrdered: z.string().optional(),
});

type WorkOrderItemFormData = z.infer<typeof workOrderItemSchema>;

const WorkOrderItemForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<WorkOrderItemFormData>({
        resolver: zodResolver(workOrderItemSchema),
    });
    const { workOrder, setCurrentStep } = useContext(WorkOrderContext);
    const createWorkOrderItem = api.workOrderItems.createWorkOrderItem.useMutation();
    const [showAdditonalForms, setShowAdditionalForms] = useState(false);
    const [workOrderItemId, setWorkOrderItemId] = useState<string | null>(null);

    const onSubmit = async (data: WorkOrderItemFormData) => {
        try {
            const newWorkOrderItem = await createWorkOrderItem.mutateAsync({
                ...data,
                cs: data.cs || '',
                description: data.description || '',
                expectedDate: data.expectedDate ? new Date(data.expectedDate) : new Date(),
                finishedQty: data.finishedQty || 0,
                inkColor: data.inkColor || '',
                other: data.other || '',
                pressRun: data.pressRun || '',
                size: data.size || '',
                specialInstructions: data.specialInstructions || '',
                stockOrdered: data.stockOrdered || '',
                workOrderId: workOrder.id,
            });
            setWorkOrderItemId(
                newWorkOrderItem.id
            );
            setShowAdditionalForms(true);
            // setCurrentStep(prev => prev + 1);
        } catch (error) {
            console.error('Error saving work order item', error);
        }
    };

    return (
        <>
            <h2 className="text-2xl font-semibold">Work Order Details</h2>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4 w-full"
            >
                <div>
                    <label htmlFor='amount' className='block text-sm font-medium text-gray-700'>Amount</label>
                    <input id='amount' type='number' {...register('amount', { valueAsNumber: true })} className='input input-bordered w-full' />
                    {errors.amount && <p className='text-red-500'>{errors.amount.message}</p>}
                </div>
                <div>
                    <label htmlFor='approved' className='block text-sm font-medium text-gray-700'>Approved</label>
                    <input type="checkbox" className="checkbox" {...register("approved")} />
                    {errors.approved && <p className='text-red-500'>{errors.approved.message}</p>}
                </div>
                <div>
                    <label htmlFor='artwork' className='block text-sm font-medium text-gray-700'>Artwork</label>
                    <input id='artwork' {...register('artwork')} className='input input-bordered w-full' />
                    {errors.artwork && <p className='text-red-500'>{errors.artwork.message}</p>}
                </div>
                <div>
                    <label htmlFor='cost' className='block text-sm font-medium text-gray-700'>Cost</label>
                    <input id='cost' type='number' {...register('cost', { valueAsNumber: true })} className='input input-bordered w-full' />
                    {errors.cost && <p className='text-red-500'>{errors.cost.message}</p>}
                </div>
                <div>
                    <label htmlFor='costPerM' className='block text-sm font-medium text-gray-700'>Cost Per M</label>
                    <input id='costPerM' type='number' {...register('costPerM', { valueAsNumber: true })} className='input input-bordered w-full' />
                    {errors.costPerM && <p className='text-red-500'>{errors.costPerM.message}</p>}
                </div>
                <div>
                    <label htmlFor='cs' className='block text-sm font-medium text-gray-700'>CS</label>
                    <input id='cs' {...register('cs')} className='input input-bordered w-full' />
                    {errors.cs && <p className='text-red-500'>{errors.cs.message}</p>}
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
                    <label htmlFor='finishedQty' className='block text-sm font-medium text-gray-700'>Finished Qty</label>
                    <input id='finishedQty' type='number' {...register('finishedQty', { valueAsNumber: true })} className='input input-bordered w-full' />
                    {errors.finishedQty && <p className='text-red-500'>{errors.finishedQty.message}</p>}
                </div>
                <div>
                    <label htmlFor='inkColor' className='block text-sm font-medium text-gray-700'>Ink Color</label>
                    <input id='inkColor' {...register('inkColor')} className='input input-bordered w-full' />
                    {errors.inkColor && <p className='text-red-500'>{errors.inkColor.message}</p>}
                </div>
                <div>
                    <label htmlFor='other' className='block text-sm font-medium text-gray-700'>Other</label>
                    <input id='other' {...register('other')} className='input input-bordered w-full' />
                    {errors.other && <p className='text-red-500'>{errors.other.message}</p>}
                </div>
                <div>
                    <label htmlFor='overUnder' className='block text-sm font-medium text-gray-700'>Over Under</label>
                    <input id='overUnder' type='number' {...register('overUnder', { valueAsNumber: true })} className='input input-bordered w-full' />
                    {errors.overUnder && <p className='text-red-500'>{errors.overUnder.message}</p>}
                </div>
                <div>
                    <label htmlFor='plateRan' className='block text-sm font-medium text-gray-700'>Plate Ran</label>
                    <input id='plateRan' {...register('plateRan')} className='input input-bordered w-full' />
                    {errors.plateRan && <p className='text-red-500'>{errors.plateRan.message}</p>}
                </div>
                <div>
                    <label htmlFor='prepTime' className='block text-sm font-medium text-gray-700'>Prep Time</label>
                    <input id='prepTime' type='number' {...register('prepTime', { valueAsNumber: true })} className='input input-bordered w-full' />
                    {errors.prepTime && <p className='text-red-500'>{errors.prepTime.message}</p>}
                </div>
                <div>
                    <label htmlFor='pressRun' className='block text-sm font-medium text-gray-700'>Press Run</label>
                    <input id='pressRun' {...register('pressRun')} className='input input-bordered w-full' />
                    {errors.pressRun && <p className='text-red-500'>{errors.pressRun.message}</p>}
                </div>
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
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

                {!workOrderItemId && (
                    <button type="submit" className="btn btn-primary">Save Work Order Item</button>
                )}

            </form>
            {showAdditonalForms && workOrderItemId && (
                <div className='flex flex-col gap-4 w-full'>
                    <h2 className="text-2xl font-semibold mt-8">Typesetting Options</h2>
                    <TypesettingProvider>
                        <TypesettingComponent
                            workOrderItemId={workOrderItemId}
                            orderItemId=''
                            initialTypesetting={[]}
                        />
                    </TypesettingProvider>
                    <h2 className="text-2xl font-semibold mt-8">Processing Options</h2>
                    <ProcessingOptionsProvider>
                        <ProcessingOptionsForm workOrderItemId={workOrderItemId} />
                    </ProcessingOptionsProvider>
                </div>
            )}
            {workOrderItemId && (
                <div className='flex flex-row gap-4'>
                    <Link href={`/workOrders/${workOrder.id}`} className="btn btn-primary mt-8">
                        View Work Order
                    </Link>
                    <Link href="/workOrders/create" className="btn btn-primary mt-8">
                        Create Another Work Order Item
                    </Link>
                </div>

            )}
        </>
    );
};

export default WorkOrderItemForm;
