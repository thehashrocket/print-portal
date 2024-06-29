import React, { useState } from "react";
import { useProcessingOptions } from "~/app/contexts/ProcessingOptionsContext";
import ProcessingOptionsForm from "~/app/_components/shared/processingOptions/processingOptionsForm";
import { ProcessingOptions } from "@prisma/client";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

interface ProcessingOptionsItemProps {
    option: ProcessingOptions;
}

const ProcessingOptionsItem: React.FC<ProcessingOptionsItemProps> = ({ option }) => {
    const { deleteOption } = useProcessingOptions();
    const [isEditing, setIsEditing] = useState(false);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this option?")) {
            try {
                await deleteOption.mutateAsync(option.id);
            } catch (error) {
                console.error("Failed to delete option", error);
            }
        }
    };

    const toggleEdit = () => setIsEditing(!isEditing);

    const formatValue = (key: string, value: any) => {
        if (key === "createdAt" || key === "updatedAt") {
            return new Date(value).toLocaleString();
        }
        return String(value) || "N/A";
    };

    const renderOptionDetails = () => {
        const excludeKeys = ["id", "createdById", "orderItemId", "workOrderItemId", "name", "createdAt", "updatedAt"];
        const details = Object.entries(option).filter(([key]) => !excludeKeys.includes(key));
        return (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                {details.map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-base text-gray-900">{formatValue(key, value)}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {isEditing ? (
                <ProcessingOptionsForm
                    initialData={option}
                    onClose={toggleEdit}
                    onCancel={toggleEdit}
                    isActive={true}
                />
            ) : (
                <div className="p-6">
                    <div className="flex flex-col mb-4">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{option.name || "Processing Option"}</h3>
                        <div className="flex justify-between items-start">
                            <div className="text-sm text-gray-500">
                                <p>Created: {formatValue("createdAt", option.createdAt)}</p>
                                <p>Updated: {formatValue("updatedAt", option.updatedAt)}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={toggleEdit}
                                    className="btn btn-sm btn-outline btn-primary"
                                >
                                    <FiEdit2 className="mr-1" /> Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="btn btn-sm btn-outline btn-error"
                                >
                                    <FiTrash2 className="mr-1" /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                    {renderOptionDetails()}
                </div>
            )}
        </div>
    );
};

export default ProcessingOptionsItem;