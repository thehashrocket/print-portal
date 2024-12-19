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
import { DollarSign, PlusCircle } from "lucide-react";
import { Calculator, Percent, Truck } from "lucide-react";
import { Receipt } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import { SelectField } from "~/app/_components/shared/ui/SelectField/SelectField";
import { WorkOrderShippingInfoEditor } from './workOrderShippingInfo/WorkOrderShippingInfoEditor';

const StatusBadge: React.FC<{ id: string, status: WorkOrderStatus, workOrderId: string }> = ({ id, status, workOrderId }) => {
    const [currentStatus, setCurrentStatus] = useState(status);
    const utils = api.useUtils();
    const { mutate: updateStatus, isError } = api.workOrders.updateStatus.useMutation({
        onSuccess: (updatedWorkOrder) => {
            utils.workOrders.getByID.invalidate(workOrderId);
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
            <SelectField
                options={Object.values(WorkOrderStatus).map((status) => ({ value: status, label: status }))}
                value={currentStatus}
                onValueChange={(value: string) => handleStatusChange(value as WorkOrderStatus)}
                placeholder="Select status..."
                required={true}
            />
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

    const utils = api.useUtils();

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

    useEffect(() => {
        if (workOrder) {
            utils.workOrders.getByID.invalidate(workOrderId);
        }
    }, [workOrder]);

    useEffect(() => {
        if (workOrder) {
            console.log('WorkOrder data:', {
                id: workOrder.id,
                shippingInfo: workOrder.ShippingInfo,
                officeId: workOrder.officeId,
                companyName: workOrder.Office.Company.name
            });
        }
    }, [workOrder]);

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
                            <Link href="/workOrders/create">
                                <Button
                                    variant="default"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Create Estimate
                                </Button>
                            </Link>
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
                                <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Receipt className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Item Total</div>
                                                        <div className="font-semibold">{formatCurrency(workOrder.totalItemAmount ?? "")}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Truck className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Shipping Amount</div>
                                                        <div className="font-semibold">{formatCurrency(workOrder.totalShippingAmount ?? "")}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Calculator className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Subtotal</div>
                                                        <div className="font-semibold">{formatCurrency(workOrder.calculatedSubTotal ?? "")}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Percent className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Sales Tax</div>
                                                        <div className="font-semibold">{formatCurrency(workOrder.calculatedSalesTax ?? "")}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 pt-2 border-t">
                                                    <DollarSign className="w-5 h-5 text-green-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Total Amount</div>
                                                        <div className="text-lg font-bold text-green-600">{formatCurrency(workOrder.totalAmount ?? "")}</div>
                                                    </div>
                                                </div>
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
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">Shipping Information</h2>
                        </div>
                        {workOrder && workOrder.ShippingInfo ? (
                            <WorkOrderShippingInfoEditor
                                workOrderId={workOrder.id}
                                currentShippingInfo={workOrder.ShippingInfo}
                                officeId={workOrder.officeId}
                                companyName={workOrder.Office.Company.name}
                                onUpdate={() => {
                                    utils.workOrders.getByID.invalidate(workOrderId);
                                }}
                            />
                        ) : null}
                    </section>

                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">Estimate Jobs</h2>
                            <Link href={`/workOrders/create/${workOrder.id}`}>
                                <Button
                                    variant="default"
                                    disabled={workOrder.status === WorkOrderStatus.Approved}
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Add Estimate Job
                                </Button>
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