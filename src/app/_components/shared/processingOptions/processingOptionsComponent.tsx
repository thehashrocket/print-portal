// Receives ProcessingOptions as props
// displays the ProcessiongOptions in a grid.

"use client";

import React from "react";
import { ProcessingOptions } from "@prisma/client";

type ProcessingOptionsComponentProps = {
    processingOptions: ProcessingOptions[];
};

const ProcessingOptionsComponent: React.FC<ProcessingOptionsComponentProps> = ({ processingOptions }) => {


    return (
        <>
            {/* Loop through processingOptions and output the name of each property and it's value */}
            {processingOptions.map((option) => (
                <div key={option.id} className="mb-4 grid grid-cols-4 gap-4">
                    {Object.entries(option).map(([key, value]) => {
                        // Exclude specific properties if needed
                        if (key === "id" || key === "createdAt" || key === "updatedAt" || key === "orderItemId" || key === "workOrderItemId" || key === "createdById") {
                            return null;
                        }

                        return (
                            <div key={key} className="rounded-lg bg-white p-6 shadow-md mb-2">
                                <span className="font-semibold">{key}: </span>
                                <span>{String(value)}</span> // Convert value to string
                            </div>
                        );
                    })}
                </div>
            ))}
        </>
    );
};

export default ProcessingOptionsComponent;
