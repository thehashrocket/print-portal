// ~/app/_components/workOrders/create/typesettingAndProcessingOptionsForm.tsx
"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWorkOrderContext } from '~/app/contexts/workOrderContext';

const typesettingSchema = z.object({
    // Define Typesetting fields
    typesettingDetail: z.string().min(1, 'Typesetting detail is required'),
});

const processingOptionsSchema = z.object({
    // Define ProcessingOptions fields
    processingDetail: z.string().min(1, 'Processing detail is required'),
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
                <div>
                    <label htmlFor="typesettingDetail">Typesetting Detail</label>
                    <input id="typesettingDetail" {...register('typesettingDetail')} />
                    {errors.typesettingDetail && <p>{errors.typesettingDetail.message}</p>}
                </div>
                <button type="submit">Add Typesetting</button>
            </form>
            <form onSubmit={handleSubmitProcessing(onSubmitProcessingOptions)}>
                <div>
                    <label htmlFor="processingDetail">Processing Detail</label>
                    <input id="processingDetail" {...registerProcessing('processingDetail')} />
                    {errorsProcessing.processingDetail && <p>{errorsProcessing.processingDetail.message}</p>}
                </div>
                <button type="submit">Add Processing Options</button>
            </form>
        </div>
    );
};

export default TypesettingAndProcessingOptionsForm;
