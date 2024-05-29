// ~/app/contexts/WorkOrderContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '~/trpc/react';
import { WorkOrder, WorkOrderItem, Typesetting, ProcessingOptions } from '@prisma/client';

// Define the input types for the API calls
type CreateWorkOrderInput = Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>;
type CreateWorkOrderItemInput = Omit<WorkOrderItem, 'id' | 'createdAt' | 'updatedAt'>;
type CreateTypesettingInput = Omit<Typesetting, 'id' | 'createdAt' | 'updatedAt'>;
type CreateProcessingOptionsInput = Omit<ProcessingOptions, 'id' | 'createdAt' | 'updatedAt'>;

interface WorkOrderContextType {
    processingOptions: ProcessingOptions[];
    typesettings: Typesetting[];
    workOrders: WorkOrder[];
    workOrderItems: WorkOrderItem[];
    loading: boolean;
    error: string | null;
    addProcessingOptions: (data: CreateProcessingOptionsInput) => void;
    addTypesetting: (data: CreateTypesettingInput) => void;
    addWorkOrder: (data: CreateWorkOrderInput) => void;
    addWorkOrderItem: (data: CreateWorkOrderItemInput) => void;
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
        onMutate: () => setLoading(true),
        onSuccess: (newWorkOrder) => {
            setWorkOrders((prev) => [...prev, newWorkOrder]);
            setLoading(false);
        },
        onError: (error) => {
            console.error(error);
            setError(error.message);
            setLoading(false);
        },
    });

    const workOrderItemMutation = api.workOrderItems.createWorkOrderItem.useMutation({
        onMutate: () => setLoading(true),
        onSuccess: (newWorkOrderItem) => {
            setWorkOrderItems((prev) => [...prev, newWorkOrderItem]);
            setLoading(false);
        },
        onError: (error) => {
            console.error(error);
            setError(error.message);
            setLoading(false);
        },
    });

    const typesettingMutation = api.typesettings.create.useMutation({
        onMutate: () => setLoading(true),
        onSuccess: (newTypesetting) => {
            setTypesettings((prev) => [...prev, newTypesetting]);
            setLoading(false);
        },
        onError: (error) => {
            console.error(error);
            setError(error.message);
            setLoading(false);
        },
    });

    const processingOptionsMutation = api.processingOptions.create.useMutation({
        onMutate: () => setLoading(true),
        onSuccess: (newProcessingOptions) => {
            setProcessingOptions((prev) => [...prev, newProcessingOptions]);
            setLoading(false);
        },
        onError: (error) => {
            console.error(error);
            setError(error.message);
            setLoading(false);
        },
    });

    const addWorkOrder = (data: CreateWorkOrderInput) => {
        workOrderMutation.mutate({
            workOrder: {
                ...data,
                workOrderItems: [] // or provide the appropriate value for workOrderItems
            }
        });
    };

    const addProcessingOptions = (data: CreateProcessingOptionsInput) => {
        processingOptionsMutation.mutate({ processiongOptions: data });
    };

    const addTypesetting = (data: CreateTypesettingInput) => {
        typesettingMutation.mutate({ typesettingOptions: data });
    };

    const addWorkOrderItem = (data: CreateWorkOrderItemInput) => {
        workOrderItemMutation.mutate({ workOrderItem: data });
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
