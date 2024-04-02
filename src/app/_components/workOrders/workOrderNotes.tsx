"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { WorkOrderNote } from '@prisma/client'; // use client to fetch data instead of server
import { api } from "~/trpc/react";
import { AgGridReact, CustomCellRendererProps } from "@ag-grid-community/react"; // React Grid Logic
import "@ag-grid-community/styles/ag-grid.css"; // Core CSS
import "@ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { useRouter } from "next/navigation";

import {
    ColDef,
    ModuleRegistry,
    ValueFormatterParams,
} from "@ag-grid-community/core";

type WorkOrderNotesProps = {
    notes: WorkOrderNote[];
    workOrderId: string;
};

const WorkOrderNotes: React.FC<WorkOrderNotesProps> = ({ notes, workOrderId }) => {
    const gridRef = useRef();
    const router = useRouter();
    const defaultColDef = {
        resizable: true,
        sortable: true,
    };
    const [rowData, setRowData] = useState<{
        note: string;
        user: string;
        date: Date
    }[]>([]);
    const [note, setNote] = useState("");

    // Define column definitions and row data here
    const columnDefs = [
        { headerName: "Note", field: "note", width: 400 },
        { headerName: "User", field: "user", width: 150 },
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
            notes.map((note) => {
                return {
                    note: note.note,
                    user: note.User.name, // Assuming `userId` is the correct property to access the user ID
                    date: note.createdAt,
                };
            }),
        );
    }, [notes]);

    return (
        <>
            <div className="mb-4">
                <form
                    className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        createNote.mutate({ note, workOrderId }) // Add the 'workOrderId' property to the argument object

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
                            type="text"
                            rows={3}
                            value={note}
                            placeholder="Enter note"
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                        disabled={createNote.isPending}
                    >
                        Add Note
                    </button>
                    {createNote.isPending && <span>Submitting...</span>}
                </form>
            </div>
            <div className="ag-theme-quartz" style={{ height: "300px", width: "100%" }}>
                <AgGridReact
                    style={{ width: '100%', height: '100%' }}
                    id="users_grid"
                    ref={gridRef}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowData={rowData}
                />
            </div>
        </>
    );
};

export default WorkOrderNotes;