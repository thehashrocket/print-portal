// ~/app/_components/workOrders/create/createWorkOrderComponent.tsx
// This page is loaded by page.tsx in the ceate folder of WorkOrders
// It is a client page that loads the WorkOrderWizard component
"use client";
import React from 'react';
import { WorkOrderProvider } from '~/app/contexts/workOrderContext';
import WorkOrderWizard from './workOrderWizard';

const CreateWorkOrderComponent: React.FC = () => {
    return (
        <WorkOrderProvider>
            <WorkOrderWizard />
        </WorkOrderProvider>
    );
};

export default CreateWorkOrderComponent;