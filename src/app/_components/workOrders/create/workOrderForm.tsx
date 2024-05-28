// ~/app/_components/workOrders/create/workOrderForm.tsx
"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWorkOrderContext } from '~/app/contexts/workOrderContext';

const workOrderSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    workOrderNumber: z.number().min(1, 'Work Order Number is required'),
    status: z.enum(['Approved', 'Cancelled', 'Draft', 'Pending']),
    officeId: z.string().min(1, 'Office ID is required'),
    shippingInfoId: z.string().min(1, 'Shipping Info ID is required'),
    createdBy: z.string().min(1, 'Created By is required'),
    dateIn: z.date().refine(val => val <= new Date(), 'Date In must be in the past'),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

const WorkOrderForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<WorkOrderFormData>({
        resolver: zodResolver(workOrderSchema),
    });
    const { addWorkOrderItem } = useWorkOrderContext();

    const onSubmit = (data: WorkOrderFormData) => {
        addWorkOrderItem(data);
        // Move to the next step (WorkOrderItem creation)
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label htmlFor="description">Description</label>
                <input id="description" {...register('description')} />
                {errors.description && <p>{errors.description.message}</p>}
            </div>
            <div>
                <label htmlFor="workOrderNumber">Work Order Number</label>
                <input id="workOrderNumber" type="number" {...register('workOrderNumber')} />
                {errors.workOrderNumber && <p>{errors.workOrderNumber.message}</p>}
            </div>
            <div>
                <label htmlFor="status">Status</label>
                <select id="status" {...register('status')}>
                    <option value="Approved">Approved</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                </select>
                {errors.status && <p>{errors.status.message}</p>}
            </div>
            <div>
                <label htmlFor="officeId">Office ID</label>
                <input id="officeId" {...register('officeId')} />
                {errors.officeId && <p>{errors.officeId.message}</p>}
            </div>
            <div>
                <label htmlFor="shippingInfoId">Shipping Info ID</label>
                <input id="shippingInfoId" {...register('shippingInfoId')} />
                {errors.shippingInfoId && <p>{errors.shippingInfoId.message}</p>}
            </div>
            <div>
                <label htmlFor="createdBy">Created By</label>
                <input id="createdBy" {...register('createdBy')} />
                {errors.createdBy && <p>{errors.createdBy.message}</p>}
            </div>
            <div>
                <label htmlFor="dateIn">Date In</label>
                <input id="dateIn" type="date" {...register('dateIn')} />
                {errors.dateIn && <p>{errors.dateIn.message}</p>}
            </div>
            <button type="submit">Next</button>
        </form>
    );
};

export default WorkOrderForm;
