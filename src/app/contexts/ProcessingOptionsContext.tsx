import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "~/trpc/react";
import { type ProcessingOptions } from "@prisma/client";

// Define the context type
interface ProcessingOptionsContextType {
    processingOptions: ProcessingOptions[];
    loading: boolean;
    error: string | null;
    createOption: ReturnType<typeof api.processingOptions.create.useMutation>;
    updateOption: ReturnType<typeof api.processingOptions.update.useMutation>;
    deleteOption: ReturnType<typeof api.processingOptions.delete.useMutation>;
}

// Create the context
const ProcessingOptionsContext = createContext<ProcessingOptionsContextType | undefined>(undefined);

// Custom hook to use the context
export const useProcessingOptions = () => {
    const context = useContext(ProcessingOptionsContext);
    if (context === undefined) {
        throw new Error('useProcessingOptions must be used within a ProcessingOptionsProvider');
    }
    return context;
};

// Define the provider component
interface ProcessingOptionsProviderProps {
    children: ReactNode;
    orderItemId?: string;
    workOrderItemId?: string;
}

export const ProcessingOptionsProvider: React.FC<ProcessingOptionsProviderProps> = ({ children, orderItemId, workOrderItemId }) => {
    const [processingOptions, setProcessingOptions] = useState<ProcessingOptions[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: orderItemData, isLoading: isOrderItemLoading, isError: isOrderItemError, error: orderItemError } = api.processingOptions.getByOrderItemId.useQuery(orderItemId || "", {
        enabled: !!orderItemId,
    });

    const { data: workOrderItemData, isLoading: isWorkOrderItemLoading, isError: isWorkOrderItemError, error: workOrderItemError } = api.processingOptions.getByWorkOrderItemId.useQuery(workOrderItemId || "", {
        enabled: !!workOrderItemId,
    });

    useEffect(() => {
        setLoading(isOrderItemLoading || isWorkOrderItemLoading);
        if (isOrderItemError) {
            setError(orderItemError?.message || "Unknown error");
        } else if (isWorkOrderItemError) {
            setError(workOrderItemError?.message || "Unknown error");
        } else {
            setError(null);
            if (orderItemData) {
                setProcessingOptions(orderItemData);
            } else if (workOrderItemData) {
                setProcessingOptions(workOrderItemData);
            } else {
                setProcessingOptions([]);
            }
        }
    }, [orderItemData, workOrderItemData, isOrderItemLoading, isWorkOrderItemLoading, isOrderItemError, isWorkOrderItemError, orderItemError, workOrderItemError]);

    const createOption = api.processingOptions.create.useMutation({
        onSuccess: (newOption) => {
            setProcessingOptions((prev) => [...prev, newOption]);
        },
    });

    const updateOption = api.processingOptions.update.useMutation({
        onSuccess: (updatedOption) => {
            setProcessingOptions((prev) =>
                prev.map((option) => (option.id === updatedOption.id ? updatedOption : option))
            );
        },
    });

    const deleteOption = api.processingOptions.delete.useMutation({
        onSuccess: ({ id: deletedOptionId }) => {
            setProcessingOptions((prev) => prev.filter((option) => option.id !== deletedOptionId));
        },
    });

    return (
        <ProcessingOptionsContext.Provider
            value={{
                processingOptions,
                loading,
                error,
                createOption,
                updateOption,
                deleteOption,
            }}
        >
            {children}
        </ProcessingOptionsContext.Provider>
    );
};
