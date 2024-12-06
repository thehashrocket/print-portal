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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            {isAdding ? (
                <ProcessingOptionsForm
                    orderItemId={orderItemId}
                    workOrderItemId={workOrderItemId}
                    onClose={toggleAdding}
                    onCancel={toggleAdding}
                    isActive={isAdding}
                />
            ) : (
                <Button
                    variant="default"
                    onClick={toggleAdding}
                >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Bindery Option
                </Button>
            )}
            <div className="mb-4 mt-4 grid grid-cols-2 gap-4">
                {processingOptions.map((option) => (
                    <ProcessingOptionsItem key={option.id} option={option} />
                ))}
            </div>
        </>
    );
};

export default ProcessingOptionsComponent;
