// ~/app/contexts/workOrderContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '~/trpc/react';
import { WorkOrder, WorkOrderItem, Typesetting, ProcessingOptions } from '@prisma/client';

interface WorkOrderContextType {
    processingOptions: ProcessingOptions[];
    typesettings: Typesetting[];
    workOrders: WorkOrder[];
    workOrderItems: WorkOrderItem[];
    loading: boolean;
    error: string | null;
    addProcessingOptions: (data: any) => void;
    addTypesetting: (data: any) => void;
    addWorkOrder: (data: any) => void;
    addWorkOrderItem: (data: any) => void;
}

const WorkOrderContext = createContext<WorkOrderContextType | undefined>(undefined);

export const useWorkOrderContext = () => {
    const context = useContext(WorkOrderContext);
    if (context === undefined) {
        throw new Error('useWorkOrderContext must be used within a WorkOrderProvider');
    }
    return context;
};

interface WorkOrderProviderProps {
    children: ReactNode;
}

export const WorkOrderProvider: React.FC<WorkOrderProviderProps> = ({ children }) => {
    const [workOrderItems, setWorkOrderItems] = useState<WorkOrderItem[]>([]);
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [typesettings, setTypesettings] = useState<Typesetting[]>([]);
    const [processingOptions, setProcessingOptions] = useState<ProcessingOptions[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data, isLoading, isError, error: fetchError } = api.workOrders.getAll.useQuery();

    useEffect(() => {
        setLoading(isLoading);
        if (isError) {
            setError(fetchError?.message || 'Unknown error');
        } else {
            setError(null);
            if (data) {
                setWorkOrders(data);
            } else {
                setWorkOrders([]);
            }
        }
    }, [data, isLoading, isError, fetchError]);

    const workOrderMutation = api.workOrders.createWorkOrder.useMutation({
        onSuccess: (newWorkOrder) => {
            setWorkOrders(
                (prev) => [...prev, newWorkOrder]
            );
        },
        onError: (error) => {
            console.error(error);
            setError(error.message);
        },
    });

    const workOrderItemMutation = api.workOrderItems.createWorkOrderItem.useMutation({
        onSuccess: (newWorkOrderItem) => {
            setWorkOrderItems((prev) => [...prev, newWorkOrderItem]);
        },
        onError: (error) => {
            console.error(error);
            setError(error.message);
        },
    });

    const typesettingMutation = api.typesettings.create.useMutation({
        onSuccess: (newTypesetting) => {
            setTypesettings((prev) => [...prev, newTypesetting]);
        },
        onError: (error) => {
            console.error(error);
            setError(error.message);
        },
    });

    const processingOptionsMutation = api.processingOptions.create.useMutation({
        onSuccess: (newProcessingOptions) => {
            setProcessingOptions((prev) => [...prev, newProcessingOptions]);
        },
        onError: (error) => {
            console.error(error);
            setError(error.message);
        },
    });

    const addWorkOrder = (data: any) => {
        workOrderMutation.mutate(data);
    };

    const addWorkOrderItem = (data: any) => {
        workOrderItemMutation.mutate(data);
    };

    const addTypesetting = (data: any) => {
        typesettingMutation.mutate(data);
    };

    const addProcessingOptions = (data: any) => {
        processingOptionsMutation.mutate(data);
    };

    return (
        <WorkOrderContext.Provider
            value={{
                processingOptions,
                workOrders,
                workOrderItems,
                typesettings,
                loading,
                error,
                addProcessingOptions,
                addTypesetting,
                addWorkOrder,
                addWorkOrderItem,
            }}
        >
            {children}
        </WorkOrderContext.Provider>
    );
};
