// ~/app/_components/workOrders/create/workOrderWizard.tsx
"use client"
import React, { useContext } from 'react';
import { WorkOrderContext } from '~/app/contexts/workOrderContext';
import WorkOrderForm from './workOrderForm';
import WorkOrderItemForm from './workOrderItemForm';
import TypesettingAndProcessingOptionsForm from './typesettingAndProcessingOptionsForm';
import WorkOrderShippingInfoForm from './workOrderShippingInfoForm';

const WorkOrderWizard: React.FC = () => {
    const { currentStep, setCurrentStep, workOrder, saveWorkOrder } = useContext(WorkOrderContext);

    const steps = [
        <>
            <h3 className='mb-2 text-gray-600 text-l font-semibold'>Work Order Information</h3>
            <WorkOrderForm />
        </>,
        <>
            <h3 className='mb-2 text-gray-600 text-l font-semibold'>Shipping Information</h3>
            <WorkOrderShippingInfoForm />
        </>,
        <>
            <h3 className='mb-2 text-gray-600 text-l font-semibold'>Work Order Items</h3>
            <WorkOrderItemForm />
        </>,
        <>
            <h3 className='mb-2 text-gray-600 text-l font-semibold'>Typesetting and Processing Options</h3>
            <TypesettingAndProcessingOptionsForm />
        </>,
        <div>
            <h2>Review and Create Work Order</h2>
            <button onClick={() => saveWorkOrder(workOrder)}>Save Work Order</button>
        </div>
    ];

    return (
        <div>
            <h2 className="mb-2 text-gray-600 text-xl font-semibold">Create Work Order</h2>
            {steps[currentStep]}
            {currentStep > 0 && (
                <button className='btn btn-primary mr-2 mt-2' onClick={() => setCurrentStep((prev) => prev - 1)}>Previous</button>
            )}
            {currentStep < steps.length - 1 && (
                <button className='btn btn-primary m-2' onClick={() => setCurrentStep((prev) => prev + 1)}>Next</button>
            )}

        </div>
    );
};

export default WorkOrderWizard;



