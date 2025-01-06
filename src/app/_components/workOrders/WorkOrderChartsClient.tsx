// ~/src/app/_components/workOrders/WorkOrderChartsClient.tsx
"use client";

import React from 'react';
import { type SerializedWorkOrder } from '~/types/serializedTypes';

interface WorkOrderChartsClientProps {
    workOrders: SerializedWorkOrder[];
}

// // Define the data types used in charts
// interface StatusDistributionData {
//     name: string;
//     value: number;
// }

// interface TimelineData {
//     date: string;
//     count: number;
// }

// interface CostByStatusData {
//     status: string;
//     totalCost: number;
// }

// interface ProcessingTimeData {
//     status: string;
//     averageDays: number;
// }

const WorkOrderChartsClient: React.FC<WorkOrderChartsClientProps> = () => {
    // const statusDistribution = prepareStatusDistributionData(workOrders);
    // const timeline = prepareTimelineData(workOrders);
    // const costByStatus = prepareCostByStatusData(workOrders);
    // const averageProcessingTime = prepareProcessingTimeData(workOrders);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Render charts */}
        </div>
    );
};

// // Helper functions to prepare data for charts
// function prepareStatusDistributionData(workOrders: SerializedWorkOrder[]): StatusDistributionData[] {
//     const statusCounts = workOrders.reduce((acc: Record<string, number>, order) => {
//         acc[order.status] = (acc[order.status] || 0) + 1;
//         return acc;
//     }, {});

//     return Object.entries(statusCounts).map(([status, count]) => ({
//         name: status,
//         value: count,
//     }));
// }

// function prepareTimelineData(workOrders: SerializedWorkOrder[]): TimelineData[] {
//     const dateGroups = workOrders.reduce((acc: Record<string, number>, order) => {
//         const date = new Date(order.dateIn).toISOString().split('T')[0];
//         if (date) {
//             acc[date] = (acc[date] || 0) + 1;
//         }
//         return acc;
//     }, {});

//     return Object.entries(dateGroups)
//         .map(([date, count]) => ({ date, count }))
//         .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
// }

// function prepareCostByStatusData(workOrders: SerializedWorkOrder[]): CostByStatusData[] {
//     const costByStatus = workOrders.reduce((acc: Partial<Record<string, number>>, order) => {
//         const status = order.status;
//         acc[status] = (acc[status] || 0) + Number(order.totalCost || 0);
//         return acc;
//     }, {});

//     return Object.entries(costByStatus).map(([status, totalCost]) => ({
//         status,
//         totalCost: totalCost || 0,
//     }));
// }

// function prepareProcessingTimeData(workOrders: SerializedWorkOrder[]): ProcessingTimeData[] {
//     const processingTimes = workOrders.reduce((acc: Partial<Record<string, { total: number; count: number }>>, order) => {
//         const status = order.status;
//         const processingTime = new Date(order.updatedAt).getTime() - new Date(order.dateIn).getTime();
//         const days = processingTime / (1000 * 60 * 60 * 24);

//         if (!acc[status]) {
//             acc[status] = { total: 0, count: 0 };
//         }

//         if (acc[status]) {
//             acc[status]!.total += days;
//             acc[status]!.count += 1;
//         }

//         return acc;
//     }, {});

//     return Object.entries(processingTimes).map(([status, data]) => ({
//         status,
//         averageDays: data ? data.total / data.count : 0,
//     }));
// }

export default WorkOrderChartsClient;
