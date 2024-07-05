"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "~/trpc/react"; // use client to fetch data instead of server
import { AgGridReact, CustomCellRendererProps } from "@ag-grid-community/react"; // React Grid Logic
import "@ag-grid-community/styles/ag-grid.css"; // Core CSS
import "@ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import { useRouter } from "next/navigation";
import { BindingType } from "@prisma/client";

import {
    ColDef,
    ModuleRegistry,
    ValueFormatterParams,
} from "@ag-grid-community/core";

import { ProcessingOptions } from "@prisma/client"; // Import the 'ProcessingOption' type
import { number } from "zod";

type ProcessingOptionsProps = {
    processingOptions: ProcessingOptions[];
    orderId: string;
    workOrderId: string;
};

const ProcessingOptionsTable: React.FC<ProcessingOptionsProps> = ({ processingOptions, orderId = '', workOrderId = '' }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState({
        binderyTime: 0,
        binding: "",
        cutting: '',
        description: "",
        drilling: '',
        folding: '',
        name: "",
        numberingColor: "",
        numberingEnd: 0,
        numberingStart: 0,
        other: "",
        padding: '',
        stitching: "",
        id: "",
    });
    const gridRef = useRef();
    const router = useRouter();
    const defaultColDef = {
        resizable: true,
        sortable: true,
    };

    const [formData, setFormData] = useState({
        binderyTime: 0,
        binding: "",
        cutting: '',
        description: "", // Added description property
        drilling: '',
        folding: '',
        name: "",
        numberingColor: "",
        numberingEnd: 0,
        numberingStart: 0,
        other: "",
        padding: '',
        stitching: "",
    });

    const [rowData, setRowData] = useState<{
        binderyTime: number;
        binding: string;
        cutting: string;
        description: string;
        drilling: boolean;
        folding: boolean;
        id: string;
        name: string;
        numberingColor: string;
        numberingEnd: number;
        numberingStart: number;
        other: string;
        padding: boolean;
        stitching: string;
    }[]>([]);


    // Define cell renderers here
    const actionsCellRenderer = (props: CustomCellRendererProps) => {
        return (
            <div className="grid grid-cols-2 gap-4">
                <button
                    className="btn btn-active btn-primary btn-xs sm:btn-sm"
                    onClick={() => handleEdit(props.data)}
                >Edit</button>
                <button
                    className="btn btn-active btn-secondary btn-xs sm:btn-sm "
                    onClick={() => handleDelete(props.data.id)}
                >
                    Delete
                </button>

            </div>
        );
    };

    // Define column definitions and row data here
    const columnDefs = [
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
            field: "id",
            cellRenderer: actionsCellRenderer,
        }
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
            binderyTime: data.binderyTime ?? 0,
            binding: data.binding ?? "",
            cutting: data.cutting ?? '',
            description: data.description ?? "",
            drilling: data.drilling ?? '',
            folding: data.folding ?? '',
            name: data.name ?? "",
            numberingColor: data.numberingColor ?? "",
            numberingEnd: data.numberingEnd ?? 0,
            numberingStart: data.numberingStart ?? 0,
            other: data.other ?? "",
            padding: data.padding ?? '', // Ensure this is managed correctly as a boolean or string, based on your data model
            stitching: data.stitching ?? "",
        });
        setIsEditMode(true);
        setCurrentItem(data); // Assuming 'data' includes an id or some unique identifier
    }, []);


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isEditMode) {
            // don't submit orderId to updateProcessingOption if it's not needed
            updateProcessingOption.mutate({
                ...formData,
                id: currentItem.id,
                orderId,
                workOrderId,
            });

            setIsEditMode(false); // Exit edit mode after submission
            resetForm();
        } else {
            createProcessingOption.mutate({
                ...formData,
                orderId,
                workOrderId,
            });
        };
    }

    const handleDelete = useCallback((id: string) => {
        // Call the delete mutation
        deleteProcessingOption.mutate(id);
        // Optionally refresh the data or remove the item from local state
        setRowData(rowData.filter(item => item.id !== id));
    }, []);


    const resetForm = () => setFormData({
        binderyTime: 0,
        binding: "",
        cutting: '',
        description: "",
        drilling: '',
        folding: '',
        name: "",
        numberingColor: "",
        numberingEnd: 0,
        numberingStart: 0,
        other: "",
        padding: '',
        stitching: "",
    });

    useEffect(() => setRowData(
        processingOptions.map((processingOption) => {
            return {
                binderyTime: processingOption.binderyTime ?? 0,
                binding: processingOption.binding ?? '',
                cutting: processingOption.cutting ?? false,
                description: processingOption.description ?? "",
                drilling: processingOption.drilling ?? '',
                folding: processingOption.folding ?? '',
                id: processingOption.id,
                name: processingOption.name ?? "",
                numberingColor: processingOption.numberingColor ?? "",
                numberingEnd: Number(processingOption.numberingEnd) ?? 0, // Convert to number
                numberingStart: Number(processingOption.numberingStart) ?? 0, // Convert to number
                other: processingOption.other ?? "",
                padding: processingOption.padding ?? '',
                stitching: processingOption.stitching ?? '',
            };
        })
    ), [processingOptions]);

    return (
        <>
            <div className="mb-4">
                <form
                    className="br-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                    onSubmit={handleSubmit}
                >
                    <div className="grid grid-cols-4 gap-4">
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Cutting
                            </label>
                            <input
                                type="checkbox"
                                checked={formData.cutting}
                                onChange={(e) => setFormData({ ...formData, cutting: e.target.checked })}
                                className="w-full rounded-full px-4 py-2 text-black"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Drilling
                            </label>
                            <input
                                type="checkbox"
                                checked={formData.drilling}
                                onChange={(e) => setFormData({ ...formData, drilling: e.target.checked })}
                                className="w-full rounded-full px-4 py-2 text-black"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Folding
                            </label>
                            <input
                                type="checkbox"
                                checked={formData.folding}
                                onChange={(e) => setFormData({ ...formData, folding: e.target.checked })}
                                className="w-full rounded-full px-4 py-2 text-black"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Padding
                            </label>
                            <input
                                type="checkbox"
                                checked={formData.padding}
                                onChange={(e) => setFormData({ ...formData, padding: e.target.checked })}
                                className="w-full rounded-full px-4 py-2 text-black"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Numbering Color
                            </label>
                            <input
                                type="text"
                                value={formData.numberingColor}
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
                                value={formData.numberingStart}
                                onChange={(e) => setFormData({ ...formData, numberingStart: parseInt(e.target.value) })}
                                className="w-full rounded-full px-4 py-2 text-black"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Numbering End
                            </label>
                            <input
                                type="number"
                                value={formData.numberingEnd}
                                onChange={(e) => setFormData({ ...formData, numberingEnd: parseInt(e.target.value) })}
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
                            value={formData.other}
                            onChange={(e) => setFormData({ ...formData, other: e.target.value })}
                            className="w-full rounded-full px-4 py-2 text-black"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={createProcessingOption.isPending}
                    >
                        {createProcessingOption.isPending ? "Submitting..." : "Submit"}
                    </button>
                </form>

            </div>
            <div className="ag-theme-quartz" style={{ height: 300, width: "100%" }}>
                <AgGridReact
                    ref={gridRef}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    rowData={rowData}
                />
            </div>
        </>
    );
}
export default ProcessingOptionsTable;
