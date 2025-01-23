import React from "react";
import { Button } from "~/app/_components/ui/button";
import { Check, X, PencilIcon } from "lucide-react";

interface EditableInfoCardProps {
    title: string;
    content: React.ReactNode;
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    editComponent: React.ReactNode;
}

export const EditableInfoCard: React.FC<EditableInfoCardProps> = ({ 
    title, 
    content, 
    isEditing, 
    onEdit, 
    onSave, 
    onCancel, 
    editComponent 
}) => (
    <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
        <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
            <div className="grow">
                {isEditing ? editComponent : content}
            </div>
            <div className="ml-4 flex gap-2">
                {isEditing ? (
                    <>
                        <Button variant="ghost" size="icon" onClick={onSave}>
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onCancel}>
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <Button variant="ghost" size="icon" onClick={onEdit}>
                        <PencilIcon className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    </section>
);
