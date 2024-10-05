// ~/app/_components/orders/orderNotesComponent.tsx

"use client";
import React, { useState, useEffect, useRef } from "react";
import { type OrderNote } from '@prisma/client';
import { api } from "~/trpc/react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { useRouter } from "next/navigation";

import {
    type ColDef,
    type GridReadyEvent,
} from "@ag-grid-community/core";

type OrderNoteWithUser = OrderNote & {
    createdBy: {
        name: string | null;
    };
};

interface OrderNotesProps {
    notes: OrderNoteWithUser[];
    orderId: string;
}

const OrderNotesComponent: React.FC<OrderNotesProps> = ({ notes, orderId }) => {
    const gridRef = useRef<AgGridReact>(null);
    const router = useRouter();
    const [rowData, setRowData] = useState<OrderNoteWithUser[]>([]);
    const [note, setNote] = useState("");

    const defaultColDef: ColDef = {
        resizable: true,
        sortable: true,
    };

    const columnDefs: ColDef[] = [
        { headerName: "Note", field: "note", width: 400 },
        { headerName: "User", field: "createdBy.name", width: 150 },
        {
            headerName: "Date",
            field: "createdAt",
            width: 120,
            valueFormatter: (params) => new Date(params.value).toLocaleString(),
        },
    ];

    const createNote = api.orderNotes.create.useMutation({
        onSuccess: () => {
            setNote("");
            router.refresh();
        },
    });

    useEffect(() => {
        setRowData(notes);
    }, [notes]);

    const onGridReady = (params: GridReadyEvent) => {
        params.api.sizeColumnsToFit();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createNote.mutate({ note, orderId });
    };

    return (
        <>
            <form
                className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                onSubmit={handleSubmit}
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
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                    disabled={createNote.isPending}
                >
                    {createNote.isPending ? "Adding..." : "Add Note"}
                </button>
            </form>
            <div className="ag-theme-alpine" style={{ height: "300px", width: "100%" }}>
                <AgGridReact
                    ref={gridRef}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowData={rowData}
                    onGridReady={onGridReady}
                />
            </div>
        </>
    );
};

export default OrderNotesComponent;