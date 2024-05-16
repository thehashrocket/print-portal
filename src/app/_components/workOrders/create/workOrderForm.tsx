// ~/app/_components/workOrders/create/workOrderWizard.tsx
"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWorkOrderContext } from '~/app/contexts/workOrderContext';

const workOrderSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    // Add other necessary fields here
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
            {/* Add other form fields here */}
            <button type="submit">Next</button>
        </form>
    );
};

export default WorkOrderForm;
