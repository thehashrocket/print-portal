// ~/app/_components/workOrders/create/typesettingAndProcessingOptionsForm.tsx
"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWorkOrderContext } from '~/app/contexts/workOrderContext';

const typesettingSchema = z.object({
    // Define Typesetting fields
});

const processingOptionsSchema = z.object({
    // Define ProcessingOptions fields
});

type TypesettingFormData = z.infer<typeof typesettingSchema>;
type ProcessingOptionsFormData = z.infer<typeof processingOptionsSchema>;

const TypesettingAndProcessingOptionsForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<TypesettingFormData>({
        resolver: zodResolver(typesettingSchema),
    });
    const { register: registerProcessing, handleSubmit: handleSubmitProcessing, formState: { errors: errorsProcessing } } = useForm<ProcessingOptionsFormData>({
        resolver: zodResolver(processingOptionsSchema),
    });

    const { addTypesetting, addProcessingOptions } = useWorkOrderContext();

    const onSubmitTypesetting = (data: TypesettingFormData) => {
        addTypesetting(data);
    };

    const onSubmitProcessingOptions = (data: ProcessingOptionsFormData) => {
        addProcessingOptions(data);
    };

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmitTypesetting)}>
                {/* Add form fields for Typesetting */}
                <button type="submit">Add Typesetting</button>
            </form>
            <form onSubmit={handleSubmitProcessing(onSubmitProcessingOptions)}>
                {/* Add form fields for ProcessingOptions */}
                <button type="submit">Add Processing Options</button>
            </form>
        </div>
    );
};

export default TypesettingAndProcessingOptionsForm;
