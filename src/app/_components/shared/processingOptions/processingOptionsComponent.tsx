// Receives ProcessingOptions as props
// displays the ProcessiongOptions in a grid.

"use client";

import React from "react";
import { ProcessingOptions } from "@prisma/client";
import { useProcessingOptions } from "~/app/contexts/ProcessingOptionsContext";
import ProcessingOptionsItem from "~/app/_components/shared/processingOptions/processingOptionsItem";
import ProcessingOptionsForm from "./processingOptionsForm";

type ProcessingOptionsComponentProps = {
    orderItemId?: string;
    workOrderItemId?: string;
};

const ProcessingOptionsComponent: React.FC<ProcessingOptionsComponentProps> = (
    {
        orderItemId = '',
        workOrderItemId = '',
    }) => {
    const { processingOptions, loading, error } = useProcessingOptions();
    const [isAdding, setIsAdding] = React.useState(false);

    const toggleAdding = () => {
        setIsAdding(!isAdding);
    }

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
            {/* Loop through processingOptions and output the name of each property and it's value */}
            <div className="mb-4 grid grid-cols-4 gap-4">
                {processingOptions.map((option) => (
                    <ProcessingOptionsItem key={option.id} option={option} />
                ))}
            </div>
        </>
    );
};

export default ProcessingOptionsComponent;
