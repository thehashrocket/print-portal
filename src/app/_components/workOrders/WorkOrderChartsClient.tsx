// ~/src/app/_components/workOrders/WorkOrderChartsClient.tsx
"use client";

import React from 'react';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    LineChart, Line,
    ResponsiveContainer
} from 'recharts';
import { WorkOrder, WorkOrderStatus } from '@prisma/client'; // Adjust import path as needed

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface WorkOrderChartsClientProps {
    workOrders: WorkOrder[];
}

interface StatusDistributionData {
    name: string;
    value: number;
}

interface TimelineData {
    date: string;
    count: number;
}

interface CostByStatusData {
    status: string;
    totalCost: number;
}

interface ProcessingTimeData {
    status: string;
    averageDays: number;
}

const WorkOrderChartsClient: React.FC<WorkOrderChartsClientProps> = ({ workOrders }) => {
    const statusDistribution = prepareStatusDistributionData(workOrders);
    const timeline = prepareTimelineData(workOrders);
    const costByStatus = prepareCostByStatusData(workOrders);
    const averageProcessingTime = prepareProcessingTimeData(workOrders);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Work Order Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={statusDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {statusDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Work Orders Timeline</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeline}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Total Cost by Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={costByStatus}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalCost" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Average Processing Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={averageProcessingTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="averageDays" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// Helper functions to prepare data for charts
function prepareStatusDistributionData(workOrders: WorkOrder[]): StatusDistributionData[] {
    const statusCounts = workOrders.reduce((acc: Record<string, number>, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count,
    }));
}

function prepareTimelineData(workOrders: WorkOrder[]): TimelineData[] {
    const dateGroups = workOrders.reduce((acc: Record<string, number>, order) => {
        const date = new Date(order.dateIn).toISOString().split('T')[0];
        if (date) {
            acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
    }, {});

    return Object.entries(dateGroups)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function prepareCostByStatusData(workOrders: WorkOrder[]): CostByStatusData[] {
    const costByStatus = workOrders.reduce((acc: Partial<Record<WorkOrderStatus, number>>, order) => {
        const status = order.status as WorkOrderStatus;
        acc[status] = (acc[status] || 0) + Number(order.totalCost || 0);
        return acc;
    }, {});

    return Object.entries(costByStatus).map(([status, totalCost]) => ({
        status,
        totalCost: totalCost || 0,
    }));
}

function prepareProcessingTimeData(workOrders: WorkOrder[]): ProcessingTimeData[] {
    const processingTimes = workOrders.reduce((acc: Partial<Record<WorkOrderStatus, { total: number; count: number }>>, order) => {
        const status = order.status as WorkOrderStatus;
        const processingTime = new Date(order.updatedAt).getTime() - new Date(order.dateIn).getTime();
        const days = processingTime / (1000 * 60 * 60 * 24);

        if (!acc[status]) {
            acc[status] = { total: 0, count: 0 };
        }

        if (acc[status]) {
            acc[status]!.total += days;
            acc[status]!.count += 1;
        }

        return acc;
    }, {});

    return Object.entries(processingTimes).map(([status, data]) => ({
        status,
        averageDays: data ? data.total / data.count : 0,
    }));
}

export default WorkOrderChartsClient;