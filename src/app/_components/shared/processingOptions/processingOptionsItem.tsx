import React, { useState } from "react";
import { useProcessingOptions } from "~/app/contexts/ProcessingOptionsContext";
import ProcessingOptionsForm from "~/app/_components/shared/processingOptions/processingOptionsForm";
import { ProcessingOptions } from "@prisma/client";
import { set } from "zod";

interface ProcessingOptionsItemProps {
    option: ProcessingOptions;
}

const ProcessingOptionsItem: React.FC<ProcessingOptionsItemProps> = ({ option }) => {
    const { deleteOption } = useProcessingOptions();
    const [isEditing, setIsEditing] = useState(false);
    const [isActive, setIsActive] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteOption.mutateAsync(option.id);
        } catch (error) {
            console.error("Failed to delete option", error);
        }
    };

    const toggleEdit = () => {
        setIsActive(!isActive);
        setIsEditing(!isEditing);
    };

    return (
        <div className="rounded-lg bg-white p-6 shadow-md mb-2">
            {isEditing ? (
                <ProcessingOptionsForm initialData={option} onClose={toggleEdit} onCancel={toggleEdit} isActive={isActive} />
            ) : (
                <>
                    {Object.entries(option).map(([key, value]) => (
                        <div key={key}>
                            <span className="font-semibold">{key}: </span>
                            <span>{String(value)}</span>
                        </div>
                    ))}
                    <button onClick={toggleEdit} className="btn btn-primary">Edit</button>
                    <button onClick={handleDelete} className="btn btn-danger">Delete</button>
                </>
            )}
        </div>
    );
};

export default ProcessingOptionsItem;
