// ~/app/contexts/workOrderContext.tsx
"use client";
import React, { createContext, useState, ReactNode } from 'react';
import { InvoicePrintEmailOptions, ShippingInfo, WorkOrder, WorkOrderStatus } from '@prisma/client';
// import { Decimal } from '@prisma/client/runtime/library';
import { api } from '~/trpc/react';


interface WorkOrderContextProps {
    currentStep: number;
    getWorkOrder: (id: string) => void;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    workOrder: WorkOrder;  // Define the type of your workOrder as needed
    setWorkOrder: React.Dispatch<React.SetStateAction<any>>;
    saveWorkOrder: (workOrder: WorkOrder) => void;  // Define the type of your saveWorkOrder function as needed
}

const defaultValue: WorkOrderContextProps = {
    currentStep: 0,
    getWorkOrder: async () => { },
    setCurrentStep: () => { },
    workOrder: {} as WorkOrder,
    setWorkOrder: () => { },
    saveWorkOrder: () => { },
};

export const WorkOrderContext = createContext<WorkOrderContextProps>(defaultValue);

export const WorkOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [workOrder, setWorkOrder] = useState<any>({});

    const saveWorkOrder = (workOrder: any) => {
        // Implement save logic here
    };

    const getWorkOrder = async (id: string) => {
        const workOrder = await api.workOrders.getByID.useQuery(id);
        setWorkOrder(workOrder);
    }

    return (
        <WorkOrderContext.Provider value={{ currentStep, getWorkOrder, setCurrentStep, workOrder, setWorkOrder, saveWorkOrder, }}>
            {children}
        </WorkOrderContext.Provider>
    );
};
