import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "~/trpc/react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { useRouter } from "next/navigation";
import { type BindingType, type ProcessingOptions } from "@prisma/client";
import { type ColDef, type GridReadyEvent } from "@ag-grid-community/core";
import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";

type ProcessingOptionsProps = {
    processingOptions: ProcessingOptions[];
    orderItemId: string;
    workOrderItemId: string;
};

type FormDataType = {
    binderyTime: number | null;
    binding: BindingType | null;
    cutting: string | null;
    description: string;
    drilling: string | null;
    folding: string | null;
    name: string;
    numberingColor: string | null;
    numberingEnd: number | null;
    numberingStart: number | null;
    other: string;
    padding: string;
    stitching: string | null;
    orderItemId: string | null;
    workOrderItemId: string | null;
};

const ProcessingOptionsTable: React.FC<ProcessingOptionsProps> = ({
    processingOptions,
    orderItemId = '',
    workOrderItemId = '',
}) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState<ProcessingOptions | null>(null);
    const gridRef = useRef<AgGridReact>(null);
    const router = useRouter();

    const [formData, setFormData] = useState<FormDataType>({
        binderyTime: null,
        binding: null,
        cutting: null,
        description: '',
        drilling: null,
        folding: null,
        name: '',
        numberingColor: null,
        numberingEnd: null,
        numberingStart: null,
        other: '',
        padding: '',
        stitching: null,
        orderItemId: null,
        workOrderItemId: null,
    });

    const [rowData, setRowData] = useState<ProcessingOptions[]>([]);

    const actionsCellRenderer = (props: { data: ProcessingOptions }) => (
        <div className="grid grid-cols-2 gap-4">
            <Button
                variant="default"
                onClick={() => handleEdit(props.data)}
            >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
            </Button>
            <Button
                variant="destructive"
                onClick={() => handleDelete(props.data.id)}
            >
                <Trash className="w-4 h-4 mr-2" />
                Delete
            </Button>
        </div>
    );

    const columnDefs: ColDef[] = [
        { headerName: "Cutting", field: "cutting", width: 100 },
        { headerName: "Drilling", field: "drilling", width: 100 },
        { headerName: "Folding", field: "folding", width: 100 },
        { headerName: "Padding", field: "padding", width: 100 },
        { headerName: "Numbering Color", field: "numberingColor", width: 150 },
        { headerName: "Numbering End", field: "numberingEnd", width: 150 },
        { headerName: "Numbering Start", field: "numberingStart", width: 150 },
        { headerName: "Other", field: "other" },
        {
            headerName: "Actions",
            cellRenderer: actionsCellRenderer,
            width: 200,
        },
    ];

    const createProcessingOption = api.processingOptions.create.useMutation({
        onSuccess: () => {
            resetForm();
            router.refresh();
        },
    });

    const updateProcessingOption = api.processingOptions.update.useMutation({
        onSuccess: () => {
            resetForm();
            router.refresh();
        },
    });

    const deleteProcessingOption = api.processingOptions.delete.useMutation({
        onSuccess: () => {
            router.refresh();
        },
    });

    const handleEdit = useCallback((data: ProcessingOptions) => {
        setFormData({
            binderyTime: data.binderyTime,
            binding: data.binding,
            cutting: data.cutting,
            description: data.description,
            drilling: data.drilling,
            folding: data.folding,
            name: data.name,
            numberingColor: data.numberingColor,
            numberingEnd: data.numberingEnd,
            numberingStart: data.numberingStart,
            other: data.other || '',
            padding: data.padding || '',
            stitching: data.stitching,
            orderItemId: data.orderItemId,
            workOrderItemId: data.workOrderItemId,
        });
        setIsEditMode(true);
        setCurrentItem(data);
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const commonData = {
            binderyTime: formData.binderyTime ?? undefined,
            binding: formData.binding ?? undefined,
            cutting: formData.cutting ?? undefined,
            description: formData.description,
            drilling: formData.drilling ?? undefined,
            folding: formData.folding ?? undefined,
            name: formData.name,
            numberingColor: formData.numberingColor ?? undefined,
            numberingEnd: formData.numberingEnd ?? undefined,
            numberingStart: formData.numberingStart ?? undefined,
            other: formData.other ?? undefined,
            padding: formData.padding ?? undefined,
            stitching: formData.stitching ?? undefined,
            orderItemId: orderItemId || undefined,
            workOrderItemId: workOrderItemId || undefined,
        };

        if (isEditMode && currentItem) {
            updateProcessingOption.mutate({
                id: currentItem.id,
                ...commonData,
            });
            setIsEditMode(false);
        } else {
            createProcessingOption.mutate(commonData);
        }
        resetForm();
    };

    const handleDelete = useCallback((id: string) => {
        deleteProcessingOption.mutate(id);
        setRowData((prevData) => prevData.filter((item) => item.id !== id));
    }, [deleteProcessingOption]);

    const resetForm = () => {
        setFormData({
            binderyTime: null,
            binding: null,
            cutting: '',
            description: '',
            drilling: '',
            folding: '',
            name: '',
            numberingColor: '',
            numberingEnd: null,
            numberingStart: null,
            other: '',
            padding: '',
            stitching: '',
            orderItemId: null,
            workOrderItemId: null,
        });
        setIsEditMode(false);
        setCurrentItem(null);
    };

    useEffect(() => {
        setRowData(processingOptions);
        if (gridRef.current) {
            gridRef.current.api.sizeColumnsToFit();
        }
    }, [processingOptions]);

    const onGridReady = (params: GridReadyEvent) => {
        params.api.sizeColumnsToFit();
    };

    return (
        <>
            <div className="mb-4">
                <form
                    className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                    onSubmit={handleSubmit}
                >
                    {/* Form fields */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Cutting
                            </label>
                            <input
                                type="text"
                                value={formData.cutting || ''}
                                onChange={(e) => setFormData({ ...formData, cutting: e.target.value })}
                                className="w-full rounded-full px-4 py-2 text-black"
                            />
                        </div>
                        {/* Add similar fields for drilling, folding, padding */}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Numbering Color
                            </label>
                            <input
                                type="text"
                                value={formData.numberingColor || ''}
                                onChange={(e) => setFormData({ ...formData, numberingColor: e.target.value })}
                                className="w-full rounded-full px-4 py-2 text-black"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Numbering Start
                            </label>
                            <input
                                type="number"
                                value={formData.numberingStart || 0}
                                onChange={(e) => setFormData({ ...formData, numberingStart: parseInt(e.target.value) || 0 })}
                                className="w-full rounded-full px-4 py-2 text-black"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Numbering End
                            </label>
                            <input
                                type="number"
                                value={formData.numberingEnd || 0}
                                onChange={(e) => setFormData({ ...formData, numberingEnd: parseInt(e.target.value) || 0 })}
                                className="w-full rounded-full px-4 py-2 text-black"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Other
                        </label>
                        <input
                            type="text"
                            value={formData.other || ''}
                            onChange={(e) => setFormData({ ...formData, other: e.target.value })}
                            className="w-full rounded-full px-4 py-2 text-black"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={createProcessingOption.isPending || updateProcessingOption.isPending}
                    >
                        {(createProcessingOption.isPending || updateProcessingOption.isPending)
                            ? "Submitting..."
                            : isEditMode ? "Update" : "Submit"}
                    </Button>
                </form>
            </div>
            <div className="ag-theme-quartz" style={{ height: 300, width: "100%" }}>
                <AgGridReact
                    ref={gridRef}
                    columnDefs={columnDefs}
                    rowData={rowData}
                    onGridReady={onGridReady}
                />
            </div>
        </>
    );
};

export default ProcessingOptionsTable;