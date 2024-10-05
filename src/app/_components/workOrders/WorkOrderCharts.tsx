// ~/src/app/_components/workOrders/WorkOrderCharts.tsx
"use client"
import React from 'react';
import dynamic from 'next/dynamic';
import { type SerializedWorkOrder } from "~/types/serializedTypes";


const WorkOrderChartsClient = dynamic(() => import('./WorkOrderChartsClient'), {
    ssr: false,
});

interface WorkOrderChartsProps {
    workOrders: SerializedWorkOrder[];
}

const WorkOrderCharts: React.FC<WorkOrderChartsProps> = ({ workOrders }) => {
    return <WorkOrderChartsClient workOrders={workOrders} />;
};

export default WorkOrderCharts;
