"use client";

import React from 'react';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    LineChart, Line,
    ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const WorkOrderChartsClient = ({ workOrders }) => {
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
function prepareStatusDistributionData(workOrders) {
    const statusCounts = workOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count,
    }));
}

function prepareTimelineData(workOrders) {
    // Group work orders by date and count
    const dateGroups = workOrders.reduce((acc, order) => {
        const date = new Date(order.dateIn).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(dateGroups)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function prepareCostByStatusData(workOrders) {
    const costByStatus = workOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + Number(order.totalCost || 0);
        return acc;
    }, {});

    return Object.entries(costByStatus).map(([status, totalCost]) => ({
        status,
        totalCost,
    }));
}

function prepareProcessingTimeData(workOrders) {
    const processingTimes = workOrders.reduce((acc, order) => {
        const processingTime = new Date(order.updatedAt).getTime() - new Date(order.dateIn).getTime();
        const days = processingTime / (1000 * 60 * 60 * 24);
        if (!acc[order.status]) {
            acc[order.status] = { total: 0, count: 0 };
        }
        acc[order.status].total += days;
        acc[order.status].count += 1;
        return acc;
    }, {});

    return Object.entries(processingTimes).map(([status, { total, count }]) => ({
        status,
        averageDays: total / count,
    }));
}

export default WorkOrderChartsClient;