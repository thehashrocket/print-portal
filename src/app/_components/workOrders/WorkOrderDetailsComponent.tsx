// ~/app/_components/workOrders/WorkOrderDetailsComponent.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { WorkOrderStatus } from "@prisma/client";
import { type SerializedWorkOrder, type SerializedWorkOrderItem } from "~/types/serializedTypes";
import { formatCurrency, formatDate } from "~/utils/formatters";
import WorkOrderItemsTable from "../../_components/workOrders/workOrderItem/workOrderItemsTable";
import ConvertWorkOrderButton from "../../_components/workOrders/convertWorkOrderToOrderButton";
import { api } from "~/trpc/react";
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";

const StatusBadge: React.FC<{ id: string, status: WorkOrderStatus, workOrderId: string }> = ({ id, status, workOrderId }) => {
    const [currentStatus, setCurrentStatus] = useState(status);
    const utils = api.useUtils();
    const { mutate: updateStatus, isError } = api.workOrders.updateStatus.useMutation({
        onSuccess: (updatedWorkOrder) => {
            utils.workOrders.getAll.invalidate();
        },
        onError: (error) => {
            console.error('Failed to update status:', error);
        }
    });

    const getStatusColor = (status: WorkOrderStatus): string => {
        switch (status) {
            case "Approved": return "bg-green-100 text-green-800";
            case "Cancelled": return "bg-red-100 text-red-800";
            case "Pending": return "bg-yellow-100 text-yellow-800";
            default: return "bg-blue-100 text-blue-800";
        }
    };

    const handleStatusChange = (newStatus: WorkOrderStatus) => {
        updateStatus({ id, status: newStatus });
        setCurrentStatus(newStatus);
    };

    useEffect(() => {
        setCurrentStatus(status);
    }, [status]);

    return (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(currentStatus)}`}>
                {currentStatus}
            </span>
            <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value as WorkOrderStatus)}
                className="px-2 py-1 rounded-md border border-gray-300"
            >
                {Object.values(WorkOrderStatus).map((status) => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
            {isError && <p className="text-red-500 mt-2">Failed to update status. Please try again.</p>}
        </div>
    );
};

const InfoCard = ({ title, content }: { title: string; content: React.ReactNode }) => (
    <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
        <div className="bg-gray-50 p-4 rounded-lg">{content}</div>
    </section>
);

interface WorkOrderDetailsProps {
    initialWorkOrder: SerializedWorkOrder | null;
    workOrderId: string;
}

export default function WorkOrderDetails({ initialWorkOrder, workOrderId }: WorkOrderDetailsProps) {
    const [workOrderItems, setWorkOrderItems] = useState<SerializedWorkOrderItem[]>([]);
    const [isWorkOrderItemsLoading, setIsWorkOrderItemsLoading] = useState(true);
    const { data: workOrder, isLoading, isError, error } = api.workOrders.getByID.useQuery(workOrderId, {
        initialData: initialWorkOrder,
    });

    useEffect(() => {
        if (workOrder) {
            setWorkOrderItems(workOrder.WorkOrderItems)
        }
    }, [workOrder]);

    useEffect(() => {
        if (workOrderItems) {
            setIsWorkOrderItemsLoading(false);
        }
    }, [workOrderItems]);

    useCopilotReadable({
        description: "The current work order that is being viewed.",
        value: workOrder,
    });

    if (isLoading) {
        return (
            <>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900">
                        <svg className="w-16 h-16" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 22C17.523 22 22 17.523 22 12H19V7h-2v5H15V7h-2v5H11V7H9v5H7V7H5v5H3V12c0 5.523 4.477 10 10 10z" />
                        </svg>
                    </div>
                </div>
            </>
        );
    }

    if (isError || !workOrder) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500 text-xl">
                    <p>Error loading work order details. Please try again.</p>
                    <p>{isError && error instanceof Error ? error.message : "Unknown error"}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold">Estimate Details</h1>
                        <div className="space-x-2">
                            {workOrder.Order === null && (
                                <ConvertWorkOrderButton workOrderId={workOrder.id} officeId={workOrder.Office.id} />
                            )}
                            <Link className="btn btn-primary" href="/workOrders/create">Create Estimate</Link>
                        </div>
                    </div>
                    <nav aria-label="breadcrumb" className="text-sm breadcrumbs">
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/workOrders">Estimates</Link></li>
                            <li>Estimate {workOrder.workOrderNumber}</li>
                        </ul>
                    </nav>
                </header>

                <main className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        <InfoCard
                            title="Estimate Number"
                            content={<p className="text-2xl font-bold">{workOrder.workOrderNumber}</p>}
                        />
                        <InfoCard
                            title="Office Name"
                            content={<p className="text-2xl">{workOrder.Office.Company.name}</p>}
                        />
                        <InfoCard
                            title="Order Status"
                            content={<StatusBadge id={workOrder.id} status={workOrder.status} workOrderId={workOrder.id} />}
                        />
                        <InfoCard
                            title="Order Price Details"
                            content={
                                <div>
                                    <p><strong>Item Total:</strong> {formatCurrency(workOrder.totalItemAmount ?? 0)}</p>
                                    <p><strong>Shipping Amount: </strong>{formatCurrency(workOrder.totalShippingAmount ?? 0)}</p>
                                    <p><strong>Subtotal:</strong> {formatCurrency(workOrder.calculatedSubTotal ?? 0)}</p>
                                    <p><strong>Tax Amount:</strong> {formatCurrency(workOrder.calculatedSalesTax ?? 0)}</p>
                                    <p><strong>Total Amount:</strong> {formatCurrency(workOrder.totalAmount ?? 0)}</p>
                                </div>
                            }
                        />
                        <InfoCard
                            title="Created By"
                            content={<p>{workOrder.createdBy?.name}</p>}
                        />
                        <InfoCard
                            title="Created At"
                            content={<p>{formatDate(workOrder.createdAt)}</p>}
                        />
                        <InfoCard
                            title="Contact Person"
                            content={<p>{workOrder.contactPerson?.name}</p>}
                        />
                        <InfoCard
                            title="In Hands Date"
                            content={<p>{formatDate(workOrder.inHandsDate)}</p>}
                        />
                    </div>
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <InfoCard
                                title="Recipient"
                                content={
                                    <div>
                                        <p className="font-semibold mb-2">{workOrder.Office.Company.name}</p>
                                        <p>{workOrder.ShippingInfo?.Address?.line1}</p>
                                        {workOrder.ShippingInfo?.Address?.line2 && <p>{workOrder.ShippingInfo.Address.line2}</p>}
                                        <p>{workOrder.ShippingInfo?.Address?.city}, {workOrder.ShippingInfo?.Address?.state} {workOrder.ShippingInfo?.Address?.zipCode}</p>
                                        <p>{workOrder.ShippingInfo?.Address?.country}</p>
                                        <p className="mt-2"><strong>Shipping Method:</strong> {workOrder.ShippingInfo?.shippingMethod}</p>
                                        <p><strong>Telephone:</strong> {workOrder.ShippingInfo?.Address?.telephoneNumber}</p>
                                    </div>
                                }
                            />
                            <InfoCard
                                title="Shipping Details"
                                content={
                                    <div>
                                        <p><strong>Shipping Method:</strong> {workOrder.ShippingInfo?.shippingMethod}</p>
                                        <p><strong>Shipping Cost:</strong> {formatCurrency(workOrder.totalShippingAmount ?? 0)}</p>
                                    </div>
                                }
                            />
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">Estimate Jobs</h2>
                            <Link className="btn btn-primary" href={`/workOrders/create/${workOrder.id}`}>
                                Add Estimate Job
                            </Link>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            {isWorkOrderItemsLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
                                </div>
                            ) : (
                                <WorkOrderItemsTable workOrderItems={workOrderItems} />
                            )}
                        </div>
                    </section>
                </main>
            </div>
            <CopilotPopup
                instructions={"You are assisting the user as best as you can. Ansewr in the best way possible given the data you have."}
                labels={{
                    title: "Estimate Details Assistant",
                    initial: "Need any help?",
                }}
            />
        </>
    );
}