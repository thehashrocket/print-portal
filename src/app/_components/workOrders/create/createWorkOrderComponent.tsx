// ~/app/_components/workOrders/create/createWorkOrderComponent.tsx
// This page is loaded by page.tsx in the ceate folder of WorkOrders
// It is a client page that loads the WorkOrderWizard component
"use client";
import React from 'react';
import { WorkOrderProvider } from '~/app/contexts/workOrderContext';
import WorkOrderForm from './workOrderForm';

const CreateWorkOrderComponent: React.FC = () => {
    return (
        <WorkOrderProvider>
            <>
                <h3 className='mb-2 text-gray-600 text-l font-semibold'>Estimate Information</h3>
                <WorkOrderForm />
            </>
        </WorkOrderProvider>
    );
};

export default CreateWorkOrderComponent;