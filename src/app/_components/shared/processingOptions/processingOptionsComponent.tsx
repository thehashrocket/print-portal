"use client";

import React from "react";
import { useProcessingOptions } from "~/app/contexts/ProcessingOptionsContext";
import ProcessingOptionsItem from "~/app/_components/shared/processingOptions/processingOptionsItem";
import ProcessingOptionsForm from "./processingOptionsForm";

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
                <button onClick={toggleAdding} className="btn btn-primary">Add Processing Option</button>
            )}
            <div className="mb-4 grid grid-cols-4 gap-4">
                {processingOptions.map((option) => (
                    <ProcessingOptionsItem key={option.id} option={option} />
                ))}
            </div>
        </>
    );
};

export default ProcessingOptionsComponent;
