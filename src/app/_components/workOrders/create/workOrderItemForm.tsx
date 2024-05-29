// ~/app/_components/workOrders/create/WorkOrderItemForm.tsx
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
    dateIn: z.string().refine(val => new Date(val) <= new Date(), 'Date In must be in the past'),
    estimateNumber: z.string().min(1, 'Estimate Number is required'),
    inHandsDate: z.string().refine(val => new Date(val) >= new Date(), 'In Hands Date must be in the future'),
    purchaseOrderNumber: z.string().min(1, 'Purchase Order Number is required'),
});

type WorkOrderItemFormData = z.infer<typeof workOrderItemSchema>;

interface WorkOrderItemFormProps {
    nextStep: () => void;
    prevStep: () => void;
}

const WorkOrderItemForm: React.FC<WorkOrderItemFormProps> = ({ nextStep, prevStep }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<WorkOrderItemFormData>({
        resolver: zodResolver(workOrderItemSchema),
    });
    const { addWorkOrderItem } = useWorkOrderContext();

    const onSubmit = (data: WorkOrderItemFormData) => {
        addWorkOrderItem({
            ...data,
            dateIn: new Date(data.dateIn),
            inHandsDate: new Date(data.inHandsDate),
        });
        nextStep();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
                <label htmlFor="name" className="label">
                    <span className="label-text">Name</span>
                </label>
                <input id="name" {...register('name')} className="input input-bordered w-full" />
                {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>
            <div className="form-control">
                <label htmlFor="quantity" className="label">
                    <span className="label-text">Quantity</span>
                </label>
                <input id="quantity" type="number" {...register('quantity', { valueAsNumber: true })} className="input input-bordered w-full" />
                {errors.quantity && <p className="text-red-500">{errors.quantity.message}</p>}
            </div>
            <div className="form-control">
                <label htmlFor="itemId" className="label">
                    <span className="label-text">Item ID</span>
                </label>
                <input id="itemId" {...register('itemId')} className="input input-bordered w-full" />
                {errors.itemId && <p className="text-red-500">{errors.itemId.message}</p>}
            </div>
            <div className="form-control">
                <label htmlFor="typesettingId" className="label">
                    <span className="label-text">Typesetting ID</span>
                </label>
                <input id="typesettingId" {...register('typesettingId')} className="input input-bordered w-full" />
                {errors.typesettingId && <p className="text-red-500">{errors.typesettingId.message}</p>}
            </div>
            <div className="form-control">
                <label htmlFor="processingOptionsId" className="label">
                    <span className="label-text">Processing Options ID</span>
                </label>
                <input id="processingOptionsId" {...register('processingOptionsId')} className="input input-bordered w-full" />
                {errors.processingOptionsId && <p className="text-red-500">{errors.processingOptionsId.message}</p>}
            </div>
            <div className="form-control">
                <label htmlFor="createdById" className="label">
                    <span className="label-text">Created By ID</span>
                </label>
                <input id="createdById" {...register('createdById')} className="input input-bordered w-full" />
                {errors.createdById && <p className="text-red-500">{errors.createdById.message}</p>}
            </div>
            <div className="form-control">
                <label htmlFor="dateIn" className="label">
                    <span className="label-text">Date In</span>
                </label>
                <input id="dateIn" type="date" {...register('dateIn')} className="input input-bordered w-full" />
                {errors.dateIn && <p className="text-red-500">{errors.dateIn.message}</p>}
            </div>
            <div className="form-control">
                <label htmlFor="estimateNumber" className="label">
                    <span className="label-text">Estimate Number</span>
                </label>
                <input id="estimateNumber" {...register('estimateNumber')} className="input input-bordered w-full" />
                {errors.estimateNumber && <p className="text-red-500">{errors.estimateNumber.message}</p>}
            </div>
            <div className="form-control">
                <label htmlFor="inHandsDate" className="label">
                    <span className="label-text">In Hands Date</span>
                </label>
                <input id="inHandsDate" type="date" {...register('inHandsDate')} className="input input-bordered w-full" />
                {errors.inHandsDate && <p className="text-red-500">{errors.inHandsDate.message}</p>}
            </div>
            <div className="form-control">
                <label htmlFor="purchaseOrderNumber" className="label">
                    <span className="label-text">Purchase Order Number</span>
                </label>
                <input id="purchaseOrderNumber" {...register('purchaseOrderNumber')} className="input input-bordered w-full" />
                {errors.purchaseOrderNumber && <p className="text-red-500">{errors.purchaseOrderNumber.message}</p>}
            </div>
            <div className="flex justify-between">
                <button type="button" className="btn btn-secondary" onClick={prevStep}>Previous</button>
                <button type="submit" className="btn btn-primary">Next</button>
            </div>
        </form>
    );
};

export default WorkOrderItemForm;