// ~/app/_components/workOrders/create/workOrderItemForm.tsx

"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWorkOrderContext } from '~/app/contexts/workOrderContext';

const workOrderItemSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    // Add other necessary fields here
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
            {/* Add other form fields here */}
            <button type="submit">Next</button>
        </form>
    );
};

export default WorkOrderItemForm;
