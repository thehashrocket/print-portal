// ~/app/_components/workOrders/create/createWorkOrderComponent.tsx
// This page is loaded by page.tsx in the ceate folder of WorkOrders
// It is a client page that loads the WorkOrderWizard component
"use client";
import React from 'react';
import WorkOrderWizard from '~/app/_components/workOrders/create/workOrderWizard';
import { WorkOrderProvider } from '~/app/contexts/workOrderContext';

const CreateWorkOrderComponent: React.FC = () => {
    return (
        <div className="container mx-auto">
            <WorkOrderProvider>
                <WorkOrderWizard />
            </WorkOrderProvider>
        </div>
    );
};

export default CreateWorkOrderComponent;