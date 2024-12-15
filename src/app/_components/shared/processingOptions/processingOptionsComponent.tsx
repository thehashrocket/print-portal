// ~/src/app/_components/shared/processingOptions/processingOptionsComponent.tsx
"use client";

import React from "react";
import { useProcessingOptions } from "~/app/contexts/ProcessingOptionsContext";
import ProcessingOptionsItem from "~/app/_components/shared/processingOptions/processingOptionsItem";
import ProcessingOptionsForm from "./processingOptionsForm";
import { Button } from "../../ui/button";
import { PlusCircle } from "lucide-react";

type ProcessingOptionsComponentProps = {
    orderItemId?: string;
    workOrderItemId?: string;
};

const ProcessingOptionsComponent: React.FC<ProcessingOptionsComponentProps> = ({ orderItemId, workOrderItemId }) => {
    const { processingOptions, loading, error } = useProcessingOptions();
    const [isAdding, setIsAdding] = React.useState(false);

    const toggleAdding = () => {
        setIsAdding(!isAdding);
    };

    if (loading) return <div className="flex justify-center items-center p-4">Loading...</div>;
    if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

    return (
        <div className="space-y-4">
            {isAdding ? (
                <div className="w-full">
                    <ProcessingOptionsForm
                        orderItemId={orderItemId}
                        workOrderItemId={workOrderItemId}
                        onClose={toggleAdding}
                        onCancel={toggleAdding}
                        isActive={isAdding}
                    />
                </div>
            ) : (
                <div className="w-full">
                    <Button
                        variant="default"
                        onClick={toggleAdding}
                        className="w-full md:w-auto"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Bindery Option
                    </Button>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {processingOptions.map((option) => (
                    <ProcessingOptionsItem key={option.id} option={option} />
                ))}
            </div>
        </div>
    );
};

export default ProcessingOptionsComponent;
