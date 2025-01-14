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
import { DollarSign, Eye, Info, PlusCircle, RefreshCcw } from "lucide-react";
import { Calculator, Percent, Truck } from "lucide-react";
import { Receipt } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import { SelectField } from "~/app/_components/shared/ui/SelectField/SelectField";
import { WorkOrderShippingInfoEditor } from './workOrderShippingInfo/WorkOrderShippingInfoEditor';
import ContactPersonEditor from '../shared/ContactPersonEditor/ContactPersonEditor';
import { toast } from "react-hot-toast";
import { type TRPCClientErrorLike } from "@trpc/client";
import { type AppRouter } from "~/server/api/root";

const EstimateStatusBadge: React.FC<{ id: string, status: WorkOrderStatus, workOrderId: string }> = ({ id, status, workOrderId }) => {
    const [currentStatus, setCurrentStatus] = useState(status);
    const utils = api.useUtils();
    const { mutate: updateStatus, isError } = api.workOrders.updateStatus.useMutation({
        onSuccess: () => {
            utils.workOrders.getByID.invalidate(workOrderId);
        },
        onError: (error: TRPCClientErrorLike<AppRouter>) => {
            toast.error(error.message ?? "Failed to update status. Please try again.");
        }
    });

    const getStatusColor = (status: WorkOrderStatus): string => {
        switch (status) {
            case WorkOrderStatus.Approved: return "bg-green-100 text-green-800";
            case WorkOrderStatus.Cancelled: return "bg-red-100 text-red-800";
            case WorkOrderStatus.Pending: return "bg-yellow-100 text-yellow-800";
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
        <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 text-sm bg-blue-50 border border-blue-200 rounded-md mb-4">
                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                <p className="text-blue-700">
                    Status is the current status of the estimate.
                    You can change the status of the estimate by selecting a new status from the dropdown.
                    When you convert an estimate to an order, the status of the work order will be set to Approved.
                </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <span className={`px-2 py-1 rounded-full text-sm font-semibold w-48 flex items-center justify-center ${getStatusColor(currentStatus)}`}>
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
        </div>
    );
};

const InfoCard = ({ title, content }: { title: string; content: React.ReactNode }) => (
    <section className="mb-6 bg-white p-4 rounded-lg shadow-md">
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
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });
    const utils = api.useUtils();
    useEffect(() => {
        if (workOrder?.WorkOrderItems) {
            setWorkOrderItems(workOrder.WorkOrderItems);
            setIsWorkOrderItemsLoading(false);
        }
    }, [workOrder?.WorkOrderItems]);

    if (isLoading) {
        return (
            <>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900">
                        <RefreshCcw className="w-16 h-16" />
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
                            {workOrder.Order !== null && (
                                <Link href={`/orders/${workOrder.Order.id}`}>
                                    <Button
                                        variant="default"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Order
                                    </Button>
                                </Link>
                            )}
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
                            title="Estimate Status"
                            content={<EstimateStatusBadge id={workOrder.id} status={workOrder.status} workOrderId={workOrder.id} />}
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
                            content={
                                <ContactPersonEditor
                                    orderId={workOrder.id}
                                    currentContactPerson={workOrder.contactPerson}
                                    officeId={workOrder.officeId}
                                    onUpdate={() => {
                                        utils.workOrders.getByID.invalidate(workOrderId);
                                    }}
                                    isWorkOrder={true}
                                />
                            }
                        />
                        <InfoCard
                            title="In Hands Date"
                            content={<p>{formatDate(workOrder.inHandsDate)}</p>}
                        />
                    </div>

                    <section className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">Shipping Information</h2>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <WorkOrderShippingInfoEditor
                                workOrderId={workOrder.id}
                                currentShippingInfo={workOrder.ShippingInfo}
                                officeId={workOrder.Office.id}
                                onUpdate={() => {
                                    utils.workOrders.getByID.invalidate(workOrderId);
                                }}
                            />
                        </div>
                    </section>

                    <section className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">Estimate Items</h2>
                            <Link href={`/workOrders/create/${workOrder.id}`}>
                                <Button
                                    variant="default"
                                    disabled={workOrder.status === WorkOrderStatus.Approved}
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Add Item to Estimate
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
        </>
    );
}