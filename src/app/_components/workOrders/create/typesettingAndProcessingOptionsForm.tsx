// ~/app/_components/workOrders/create/TypesettingAndProcessingOptionsForm.tsx
"use client";
import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkOrderContext } from '~/app/contexts/workOrderContext';

const typesettingSchema = z.object({
    typesettingDetail: z.string().min(1, 'Typesetting detail is required'),
});

const processingOptionsSchema = z.object({
    processingDetail: z.string().min(1, 'Processing detail is required'),
});

type TypesettingFormData = z.infer<typeof typesettingSchema>;
type ProcessingOptionsFormData = z.infer<typeof processingOptionsSchema>;

const TypesettingAndProcessingOptionsForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<TypesettingFormData>({
        resolver: zodResolver(typesettingSchema),
    });
    const { setCurrentStep, currentStep } = useContext(WorkOrderContext);
    const { setWorkOrder, workOrder } = useContext(WorkOrderContext);
    const { register: registerProcessing, handleSubmit: handleSubmitProcessing, formState: { errors: errorsProcessing } } = useForm<ProcessingOptionsFormData>({
        resolver: zodResolver(processingOptionsSchema),
    });

    // const { addTypesetting, addProcessingOptions } = WorkOrderContext;



    return (
        <div>
            <form onSubmit={handleSubmit(onSubmitTypesetting)}>
                <div>
                    <label htmlFor="typesettingDetail" className="block text-sm font-medium text-gray-700">Typesetting Detail</label>
                    <input id="typesettingDetail" {...register('typesettingDetail')} className="input input-bordered w-full" />
                    {errors.typesettingDetail && <p className="text-red-500">{errors.typesettingDetail.message}</p>}
                </div>
                <button type="submit" className="btn btn-primary">Add Typesetting</button>
            </form>
            <form onSubmit={handleSubmitProcessing(onSubmitProcessingOptions)}>
                <div>
                    <label htmlFor="processingDetail" className="block text-sm font-medium text-gray-700">Processing Detail</label>
                    <input id="processingDetail" {...registerProcessing('processingDetail')} className="input input-bordered w-full" />
                    {errorsProcessing.processingDetail && <p className="text-red-500">{errorsProcessing.processingDetail.message}</p>}
                </div>
                <button type="submit" className="btn btn-primary">Add Processing Options</button>
            </form>
        </div>
    );
};

export default TypesettingAndProcessingOptionsForm;
