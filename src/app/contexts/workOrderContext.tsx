// ~/app/contexts/workOrderContext.tsx
import React, { createContext, useState, ReactNode } from 'react';

interface WorkOrderContextProps {
    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    workOrder: any;  // Define the type of your workOrder as needed
    setWorkOrder: React.Dispatch<React.SetStateAction<any>>;
    saveWorkOrder: (workOrder: any) => void;  // Define the type of your saveWorkOrder function as needed
}

const defaultValue: WorkOrderContextProps = {
    currentStep: 0,
    setCurrentStep: () => { },
    workOrder: {},
    setWorkOrder: () => { },
    saveWorkOrder: () => { },
};

export const WorkOrderContext = createContext<WorkOrderContextProps>(defaultValue);

export const WorkOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [workOrder, setWorkOrder] = useState<any>({});

    const saveWorkOrder = (workOrder: any) => {
        // Implement save logic here
        console.log('Saving workOrder', workOrder);
    };

    return (
        <WorkOrderContext.Provider value={{ currentStep, setCurrentStep, workOrder, setWorkOrder, saveWorkOrder }}>
            {children}
        </WorkOrderContext.Provider>
    );
};
