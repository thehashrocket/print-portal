// ~/app/contexts/workOrderContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '~/trpc/react'; // Adjust the import path as necessary
import { WorkOrderItem, Typesetting, ProcessingOptions, WorkOrder } from '@prisma/client'; // Adjust imports based on your schema

// Define the context type
interface WorkOrderContextType {
    workOrderItems: WorkOrderItem[];
    typesettings: Typesetting[];
    processingOptions: ProcessingOptions[];
    loading: boolean;
    error: string | null;
    createWorkOrder: ReturnType<typeof api.workOrders.createWorkOrder.useMutation>;
}

// Create the context
const WorkOrderContext = createContext<WorkOrderContextType | undefined>(undefined);

// Custom hook to use the context
export const useWorkOrderContext = () => {
    const context = useContext(WorkOrderContext);
    if (context === undefined) {
        throw new Error('useWorkOrderContext must be used within a WorkOrderProvider');
    }
    return context;
};

// Define the provider component
interface WorkOrderProviderProps {
    children: ReactNode;
}

export const WorkOrderProvider: React.FC<WorkOrderProviderProps> = ({ children }) => {
    const [workOrderItems, setWorkOrderItems] = useState<WorkOrderItem[]>([]);
    const [typesettings, setTypesettings] = useState<Typesetting[]>([]);
    const [processingOptions, setProcessingOptions] = useState<ProcessingOptions[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data, isLoading, isError, error: fetchError } = api.workOrder.getAllWorkOrders.useQuery();

    useEffect(() => {
        setLoading(isLoading);
        if (isError) {
            setError(fetchError?.message || 'Unknown error');
        } else {
            setError(null);
            if (data) {
                // Update the state with fetched data
                setWorkOrderItems(data);
            } else {
                setWorkOrderItems([]);
            }
        }
    }, [data, isLoading, isError, fetchError]);

    const createWorkOrder = api.workOrder.createWorkOrder.useMutation({
        onSuccess: (newWorkOrder) => {
            setWorkOrderItems((prev) => [...prev, newWorkOrder]);
        },
        onError: (error) => {
            console.error(error);
            setError(error.message);
        },
    });

    return (
        <WorkOrderContext.Provider
            value={{
                workOrderItems,
                typesettings,
                processingOptions,
                loading,
                error,
                createWorkOrder,
            }}
        >
            {children}
        </WorkOrderContext.Provider>
    );
};
