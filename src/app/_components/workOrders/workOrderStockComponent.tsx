"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "~/trpc/react";
import { WorkOrderStock } from "@prisma/client";
import { z } from "zod";

type workOrderStockComponentProps = {
    workOrderStock: WorkOrderStock[];
    workOrderId: string;
}

const WorkOrderStockComponent: React.FC<workOrderStockComponentProps> = ({ workOrderStock, workOrderId }) => {
    return (
        <div className="mb-4 grid grid-cols-2">
            {workOrderStock.map((stock) => (
                <div key={stock.id}>
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <p className="mb-2 text-gray-600 text-md font-semibold">Stock Qty</p>
                        <p className="text-sm">{stock.stockQty}</p>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <p className="mb-2 text-gray-600 text-md font-semibold">Cost Per M</p>
                        <p className="text-sm">{stock.costPerM}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default WorkOrderStockComponent;