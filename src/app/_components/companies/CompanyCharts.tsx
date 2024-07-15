// ~/app/_components/companies/CompanyCharts.tsx
"use client";

import React from 'react';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    LineChart, Line,
    ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CompanyCharts = ({ company }) => {
    // Prepare data for charts
    const workOrderStatusData = prepareWorkOrderStatusData(company);
    const orderStatusData = prepareOrderStatusData(company);
    const costByStatusData = prepareCostByStatusData(company);
    const officePerformanceData = prepareOfficePerformanceData(company);
    const averageOrderValueData = prepareAverageOrderValueData(company);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Work Order Status Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={workOrderStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                {workOrderStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Order Status Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={orderStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                {orderStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Total Cost by Status</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={costByStatusData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="workOrders" stackId="a" fill="#8884d8" />
                            <Bar dataKey="orders" stackId="a" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Office Performance Comparison</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={officePerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="workOrders" fill="#8884d8" />
                            <Bar dataKey="orders" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Average Order Value by Office</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={averageOrderValueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="averageValue" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// Helper functions to prepare data for charts
function prepareWorkOrderStatusData(company) {
    const statusCounts = {
        Draft: 0,
        Pending: 0,
        Approved: 0,
        Cancelled: 0
    };

    company.Offices.forEach(office => {
        office.WorkOrders.forEach(workOrder => {
            statusCounts[workOrder.status]++;
        });
    });

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
}

function prepareOrderStatusData(company) {
    const statusCounts = {
        Pending: 0,
        Shipping: 0,
        Completed: 0,
        Cancelled: 0,
        Invoicing: 0,
        PaymentReceived: 0
    };

    company.Offices.forEach(office => {
        office.Orders.forEach(order => {
            statusCounts[order.status]++;
        });
    });

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
}

function prepareCostByStatusData(company) {
    const costByStatus = {
        WorkOrders: {
            Draft: 0,
            Pending: 0,
            Approved: 0,
            Cancelled: 0
        },
        Orders: {
            Pending: 0,
            Shipping: 0,
            Completed: 0,
            Cancelled: 0,
            Invoicing: 0,
            PaymentReceived: 0
        }
    };

    company.Offices.forEach(office => {
        office.WorkOrders.forEach(workOrder => {
            costByStatus.WorkOrders[workOrder.status] += Number(workOrder.totalCost) || 0;
        });
        office.Orders.forEach(order => {
            costByStatus.Orders[order.status] += Number(order.totalCost) || 0;
        });
    });

    return Object.keys(costByStatus.WorkOrders).map(status => ({
        name: status,
        workOrders: costByStatus.WorkOrders[status],
        orders: costByStatus.Orders[status] || 0
    }));
}

function prepareOfficePerformanceData(company) {
    return company.Offices.map(office => {
        const workOrdersTotal = office.WorkOrders.reduce((sum, workOrder) => sum + Number(workOrder.totalCost) || 0, 0);
        const ordersTotal = office.Orders.reduce((sum, order) => sum + Number(order.totalCost) || 0, 0);
        return {
            name: office.name,
            workOrders: workOrdersTotal,
            orders: ordersTotal
        };
    });
}

function prepareAverageOrderValueData(company) {
    return company.Offices.map(office => {
        const totalOrderValue = office.Orders.reduce((sum, order) => sum + Number(order.totalCost) || 0, 0);
        const averageValue = office.Orders.length > 0 ? totalOrderValue / office.Orders.length : 0;
        return {
            name: office.name,
            averageValue: averageValue
        };
    });
}

export default CompanyCharts;