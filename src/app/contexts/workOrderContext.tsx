// ~/app/contexts/workOrderContext.tsx
"use client";
import React, { createContext, useState, type ReactNode, useEffect } from 'react';
import { type SerializedWorkOrder } from '~/types/serializedTypes';
import { api } from '~/trpc/react';

interface WorkOrderContextProps {
    currentStep: number;
    getWorkOrder: (id: string) => void;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    workOrder: SerializedWorkOrder;
    setWorkOrder: React.Dispatch<React.SetStateAction<SerializedWorkOrder>>;
}

const defaultValue: WorkOrderContextProps = {
    currentStep: 0,
    getWorkOrder: () => { /* empty synchronous function */ },
    setCurrentStep: () => { },
    workOrder: {} as SerializedWorkOrder,
    setWorkOrder: () => { },
};

export const WorkOrderContext = createContext<WorkOrderContextProps>(defaultValue);

export const WorkOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [workOrder, setWorkOrder] = useState<SerializedWorkOrder>({} as SerializedWorkOrder);
    const [workOrderId, setWorkOrderId] = useState<string | null>(null);

    const { data: workOrderData } = api.workOrders.getByID.useQuery(
        workOrderId as string,
        { 
            enabled: !!workOrderId
        }
    );

    useEffect(() => {
        if (workOrderData) {
            setWorkOrder(workOrderData);
        }
    }, [workOrderData]);

    const getWorkOrder = (id: string) => {
        setWorkOrderId(id);
    };

    return (
        <WorkOrderContext.Provider value={{ currentStep, getWorkOrder, setCurrentStep, workOrder, setWorkOrder }}>
            {children}
        </WorkOrderContext.Provider>
    );
};
