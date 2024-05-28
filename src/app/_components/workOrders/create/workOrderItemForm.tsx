// ~/app/_components/workOrders/create/workOrderItemForm.tsx
"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWorkOrderContext } from '~/app/contexts/workOrderContext';

const workOrderItemSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    quantity: z.number().min(1, 'Quantity is required'),
    itemId: z.string().min(1, 'Item ID is required'),
    typesettingId: z.string().min(1, 'Typesetting ID is required'),
    processingOptionsId: z.string().min(1, 'Processing Options ID is required'),
    createdById: z.string().min(1, 'Created By ID is required'),
    dateIn: z.date().refine(val => val <= new Date(), 'Date In must be in the past'),
    estimateNumber: z.string().min(1, 'Estimate Number is required'),
    inHandsDate: z.date().refine(val => val >= new Date(), 'In Hands Date must be in the future'),
    purchaseOrderNumber: z.string().min(1, 'Purchase Order Number is required'),
});

type WorkOrderItemFormData = z.infer<typeof workOrderItemSchema>;

const WorkOrderItemForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<WorkOrderItemFormData>({
        resolver: zodResolver(workOrderItemSchema),
    });
    const { addWorkOrderItem } = useWorkOrderContext();

    const onSubmit = (data: WorkOrderItemFormData) => {
        addWorkOrderItem(data);
        // Move to the next step (Typesetting and ProcessingOptions)
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label htmlFor="name">Name</label>
                <input id="name" {...register('name')} />
                {errors.name && <p>{errors.name.message}</p>}
            </div>
            <div>
                <label htmlFor="quantity">Quantity</label>
                <input id="quantity" type="number" {...register('quantity')} />
                {errors.quantity && <p>{errors.quantity.message}</p>}
            </div>
            <div>
                <label htmlFor="itemId">Item ID</label>
                <input id="itemId" {...register('itemId')} />
                {errors.itemId && <p>{errors.itemId.message}</p>}
            </div>
            <div>
                <label htmlFor="typesettingId">Typesetting ID</label>
                <input id="typesettingId" {...register('typesettingId')} />
                {errors.typesettingId && <p>{errors.typesettingId.message}</p>}
            </div>
            <div>
                <label htmlFor="processingOptionsId">Processing Options ID</label>
                <input id="processingOptionsId" {...register('processingOptionsId')} />
                {errors.processingOptionsId && <p>{errors.processingOptionsId.message}</p>}
            </div>
            <div>
                <label htmlFor="createdById">Created By ID</label>
                <input id="createdById" {...register('createdById')} />
                {errors.createdById && <p>{errors.createdById.message}</p>}
            </div>
            <div>
                <label htmlFor="dateIn">Date In</label>
                <input id="dateIn" type="date" {...register('dateIn')} />
                {errors.dateIn && <p>{errors.dateIn.message}</p>}
            </div>
            <div>
                <label htmlFor="estimateNumber">Estimate Number</label>
                <input id="estimateNumber" {...register('estimateNumber')} />
                {errors.estimateNumber && <p>{errors.estimateNumber.message}</p>}
            </div>
            <div>
                <label htmlFor="inHandsDate">In Hands Date</label>
                <input id="inHandsDate" type="date" {...register('inHandsDate')} />
                {errors.inHandsDate && <p>{errors.inHandsDate.message}</p>}
            </div>
            <div>
                <label htmlFor="purchaseOrderNumber">Purchase Order Number</label>
                <input id="purchaseOrderNumber" {...register('purchaseOrderNumber')} />
                {errors.purchaseOrderNumber && <p>{errors.purchaseOrderNumber.message}</p>}
            </div>
            <button type="submit">Next</button>
        </form>
    );
};

export default WorkOrderItemForm;
