// ~/src/app/_components/workOrders/WorkOrderCharts.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { type WorkOrder, type WorkOrderNote, type User } from '@prisma/client';
import { api } from "~/trpc/react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { useRouter } from "next/navigation";
import { Button } from "~/app/_components/ui/button";

import {
    type ColDef,
    type GridReadyEvent,
} from "@ag-grid-community/core";

type WorkOrderWithNotes = WorkOrder & {
    WorkOrderNotes: (WorkOrderNote & {
        createdBy: User;
    })[];
};

type WorkOrderNotesProps = {
    workOrder: WorkOrderWithNotes;
};

type RowDataType = {
    note: string;
    createdBy: string;
    date: Date;
};

const WorkOrderNotesComponent: React.FC<WorkOrderNotesProps> = ({ workOrder }) => {
    const gridRef = useRef<AgGridReact<RowDataType>>(null);
    const router = useRouter();
    const defaultColDef = {
        resizable: true,
        sortable: true,
    };
    const [rowData, setRowData] = useState<RowDataType[]>([]);
    const [note, setNote] = useState("");

    const columnDefs: ColDef<RowDataType>[] = [
        { headerName: "Note", field: "note", width: 400 },
        { headerName: "User", field: "createdBy", width: 150 },
        { headerName: "Date", field: "date", width: 120 },
    ];

    const createNote = api.workOrderNotes.create.useMutation({
        onSuccess: () => {
            setNote("");
            router.refresh();
        },
    });

    useEffect(() => {
        setRowData(
            workOrder.WorkOrderNotes.map((note) => ({
                note: note.note,
                createdBy: note.createdBy.name ?? 'Unknown',
                date: note.createdAt,
            }))
        );
        if (gridRef.current) {
            gridRef.current.api.sizeColumnsToFit();
        }
    }, [workOrder.WorkOrderNotes]);

    return (
        <>
            <div className="mb-4">
                <form
                    className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        createNote.mutate({ note, workOrderId: workOrder.id });
                    }}
                >
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="note">
                            Add Note
                        </label>
                        <textarea
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="note"
                            name="note"
                            rows={3}
                            value={note}
                            placeholder="Enter note"
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="default"
                        type="submit"
                        disabled={createNote.isPending}
                    >
                        Add Note
                    </Button>
                    {createNote.isPending && <span>Submitting...</span>}
                </form>
            </div>
            <div className="ag-theme-quartz" style={{ height: "300px", width: "100%" }}>
                <AgGridReact<RowDataType>
                    ref={gridRef}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowData={rowData}
                    onGridReady={(params: GridReadyEvent) => {
                        if (gridRef.current) {
                            gridRef.current.api.sizeColumnsToFit();
                        }
                    }}
                />
            </div>
        </>
    );
};

export default WorkOrderNotesComponent;