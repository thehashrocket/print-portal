// ~/app/_components/orders/OrderDetailsComponent.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { OrderStatus, type ShippingMethod } from "@prisma/client";
import OrderItemsTable from "~/app/_components/orders/orderItem/orderItemsTable";
import { formatCurrency, formatDate } from "~/utils/formatters";
import { api } from "~/trpc/react";
import { type SerializedOrder, type SerializedOrderItem } from "~/types/serializedTypes";
import OrderDeposit from "./OrderDeposit/orderDeposit";
import ShippingInfoEditor from "~/app/_components/shared/shippingInfoEditor/ShippingInfoEditor";
import { toast } from "react-hot-toast";
import {
    Printer,
    RefreshCcw,
    Send,
    FilePlus2,
    CalendarIcon,
    Receipt,
    Truck,
    Calculator,
    Percent,
    DollarSign,
    FileText,
    ReceiptIcon,
    PlusCircle,
    Loader2,
} from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge/StatusBadge";
import ContactPersonEditor from "../shared/ContactPersonEditor/ContactPersonEditor";
import { Button } from "../ui/button";
import { generateOrderPDFData } from "~/app/_components/orders/OrderPDFGenerator";
import { Input } from "../ui/input";
import { useQuickbooksStore } from '~/store/useQuickbooksStore';
import InfoCard from "../shared/InfoCard/InfoCard";
import { Textarea } from "../ui/textarea";
import TransferOwnership from "./TransferOwnership/TransferOwnership";
import DuplicateOrder from "./DuplicateOrder/DuplicateOrder";
import { EditableInfoCard } from "../shared/editableInfoCard/EditableInfoCard";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import dayjs from "dayjs";
import { cn } from "~/lib/utils";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OrderStatusBadge: React.FC<{ id: string, status: OrderStatus, orderId: string }> = ({ id, status, orderId }) => {
    const [currentStatus, setCurrentStatus] = useState(status);
    const utils = api.useUtils();
    const { mutate: updateStatus } = api.orders.updateStatus.useMutation({
        onSuccess: () => {
            utils.orders.getByID.invalidate(orderId);
            toast.success('Status updated successfully');
        },
        onError: (error) => {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        }
    });

    const getStatusColor = (status: OrderStatus): string => {
        switch (status) {
            case "Completed": return "bg-green-100 text-green-800";
            case "Cancelled": return "bg-red-100 text-red-800";
            case "Pending": return "bg-yellow-100 text-yellow-800";
            case "Shipping": return "bg-blue-100 text-blue-800";
            case "Invoiced": return "bg-blue-100 text-blue-800";
            case "PaymentReceived": return "bg-blue-100 text-blue-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const handleStatusChange = (
        newStatus: OrderStatus,
        sendEmail: boolean,
        emailOverride: string,
        shippingDetails?: {
            trackingNumber?: string[];
            shippingMethod?: ShippingMethod;
        }
    ) => {
        updateStatus({
            id,
            status: newStatus,
            sendEmail,
            emailOverride,
            shippingDetails
        });
        setCurrentStatus(newStatus);
    };

    return (
        <StatusBadge<OrderStatus>
            id={id}
            status={status}
            currentStatus={currentStatus}
            orderId={orderId}
            onStatusChange={handleStatusChange}
            getStatusColor={getStatusColor}
            statusOptions={Object.values(OrderStatus)}
        />
    );
}

const CreateInvoiceButton = ({ order }: { order: SerializedOrder }) => {
    const utils = api.useUtils();
    const createInvoiceMutation = api.invoices.create.useMutation({
        onSuccess: () => {
            utils.orders.getByID.invalidate(order.id);
            toast.success('Invoice created');
        },
        onError: (error) => {
            console.error('Failed to create invoice:', error);
            toast.error('Failed to create invoice');
        }
    });

    const handleCreateInvoice = () => {
        if (order.Invoice || createInvoiceMutation.isPending) {
            return;
        }

        createInvoiceMutation.mutate({
            orderId: order.id,
            dateIssued: new Date(),
            dateDue: new Date(new Date().setDate(new Date().getDate() + 14)),
            subtotal: Number(order.calculatedSubTotal),
            taxRate: Number(0.07),
            taxAmount: Number(order.calculatedSalesTax),
            total: Number(order.totalAmount),
            status: "Draft",
            items: order.OrderItems.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: Number((Number(item.amount) / Number(item.quantity)).toFixed(2)),
                total: Number(item.amount),
                orderItemId: item.id,
            })),
        });
    };

    const isInvoiceCreated = order.Invoice !== null;

    const buttonText = isInvoiceCreated
        ? "Invoice Created"
        : createInvoiceMutation.isPending
            ? "Creating..."
            : "Create Invoice";

    return (
        <Button
            variant="default"
            disabled={isInvoiceCreated || createInvoiceMutation.isPending}
            onClick={handleCreateInvoice}
        >
            {isInvoiceCreated ? (
                <FilePlus2 className="w-4 h-4" />
            ) : createInvoiceMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <FilePlus2 className="w-4 h-4" />
            )}
            {buttonText}
        </Button>
    );
};

interface OrderDetailsProps {
    initialOrder: SerializedOrder | null; // Replace 'any' with the correct type for your order object
    orderId: string;
}

export default function OrderDetails({ initialOrder, orderId }: OrderDetailsProps) {
    const [orderItems, setOrderItems] = useState<SerializedOrderItem[]>([]);
    const [isOrderItemsLoading, setIsOrderItemsLoading] = useState(true);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [emailTouched, setEmailTouched] = useState(false);
    const [hasUserEditedRecipient, setHasUserEditedRecipient] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const utils = api.useUtils();
    const isAuthenticated = useQuickbooksStore((state) => state.isAuthenticated);
    const { data: order, isLoading, isError, error } = api.orders.getByID.useQuery(orderId, {
        initialData: initialOrder,
    });
    const [orderNotes, setOrderNotes] = useState(order?.notes ?? "");
    const contactPersonEmail = order?.contactPerson?.email ?? "";
    const normalizedContactEmail = contactPersonEmail.trim();

    const { mutate: updateNotes } = api.orders.updateNotes.useMutation({
        onSuccess: () => {
            toast.success('Order notes updated');
            utils.orders.getByID.invalidate(orderId);
        },
        onError: (error) => {
            console.error('Failed to update order notes:', error);
            toast.error('Failed to update order notes');
        }
    });

    const { mutate: updateOrder } = api.orders.updateFields.useMutation({
        onSuccess: () => {
            toast.success('Order updated successfully');
            utils.orders.getByID.invalidate(orderId);
            setEditingField(null); // Exit editing mode after successful save
        },
        onError: (error) => {
            console.error('Failed to update order:', error);
            toast.error('Failed to update order');
        }
    });

    const handleSave = (field: string) => {
        if (!order) return;

        const updates: Record<string, unknown> = {};
        switch (field) {
            case 'purchaseOrderNumber':
                updates.purchaseOrderNumber = tempPurchaseOrderNumber;
                break;
            case 'inHandsDate':
                updates.inHandsDate = tempInHandsDate;
                break;
        }

        updateOrder({
            id: order.id,
            data: updates
        });
    };

    const handleCancel = (field: string) => {
        if (!order) return;

        switch (field) {
            case 'purchaseOrderNumber':
                setTempPurchaseOrderNumber(order.purchaseOrderNumber ?? "");
                break;
            case 'inHandsDate':
                setTempInHandsDate(order.inHandsDate ? new Date(order.inHandsDate) : undefined);
                break;
        }
    };

    const handleOrderNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setOrderNotes(e.target.value);
    };

    const updateOrderNotes = () => {
        updateNotes({ id: orderId, notes: orderNotes });
    };

    const handleRecipientEmailChange = (value: string) => {
        if (emailStatus) {
            setEmailStatus(null);
        }
        setRecipientEmail(value);
        const trimmedValue = value.trim();
        setHasUserEditedRecipient(trimmedValue !== normalizedContactEmail);
    };

    const handleRecipientEmailBlur = () => {
        if (!emailTouched) {
            setEmailTouched(true);
        }
    };

    const handleSendOrderEmail = async () => {
        if (!order) {
            return;
        }

        setEmailTouched(true);

        const trimmedEmail = recipientEmail.trim();

        if (!EMAIL_REGEX.test(trimmedEmail)) {
            setEmailStatus({ type: "error", message: "Enter a valid email address." });
            return;
        }

        setEmailStatus(null);

        try {
            const latestOrder = await utils.orders.getByID.fetch(order.id);
            if (!latestOrder) {
                throw new Error("Unable to fetch the latest order details.");
            }

            const pdfData = await generateOrderPDFData(latestOrder);
            if (!pdfData) {
                throw new Error("Failed to generate order PDF.");
            }

            const base64Content = pdfData.split(",")[1] ?? '';

            await sendOrderEmailMutation.mutateAsync({
                orderId: order.id,
                recipientEmail: trimmedEmail,
                pdfContent: base64Content
            });

            setEmailStatus({ type: "success", message: `Order sent to ${trimmedEmail}` });
            setEmailTouched(false);
            setRecipientEmail(trimmedEmail);
            setHasUserEditedRecipient(trimmedEmail !== normalizedContactEmail);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to send order email.';
            console.error('Error sending order email:', err);
            setEmailStatus({ type: "error", message });
        }
    };

    // Use sendOrderEmail from orders/order.ts
    const sendOrderEmailMutation = api.orders.sendOrderEmail.useMutation({
        onSuccess: () => {
            toast.success('Order sent by email');
        },
        onError: (error) => {
            console.error('Failed to send order by email:', error);
            toast.error('Failed to send order by email');
        }
    });

    const createQuickbooksInvoiceMutation = api.qbInvoices.createQbInvoiceFromOrder.useMutation({
        onSuccess: () => {
            toast.success('Quickbooks invoice created');
            utils.orders.getByID.invalidate(orderId);
        },
        onError: (error) => {
            console.error('Failed to create Quickbooks invoice:', error);
            toast.error('Failed to create QuickBooks invoice');
        }
    });

    const handleCreateQuickbooksInvoice = async (orderId: string) => {
        await createQuickbooksInvoiceMutation.mutateAsync({ orderId });
    };

    useEffect(() => {
        if (order) {
            setOrderItems(order.OrderItems);
        }
    }, [order]);

    useEffect(() => {
        if (!normalizedContactEmail || hasUserEditedRecipient) {
            return;
        }

        if (recipientEmail === normalizedContactEmail) {
            return;
        }

        setRecipientEmail(normalizedContactEmail);
        setEmailTouched(false);
        setEmailStatus(null);
    }, [normalizedContactEmail, hasUserEditedRecipient, recipientEmail]);

    const [tempPurchaseOrderNumber, setTempPurchaseOrderNumber] = useState(order?.purchaseOrderNumber ?? "");
    const [tempInHandsDate, setTempInHandsDate] = useState<Date | undefined>(order?.inHandsDate ? new Date(order.inHandsDate) : undefined);

    useEffect(() => {
        if (orderItems) {
            setIsOrderItemsLoading(false);
        }
    }, [orderItems]);

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

    if (isError || !order) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500 text-xl">
                    <p>Error loading order. Please try again.</p>
                    <p>{isError && error instanceof Error ? error.message : "Unknown error"}</p>
                </div>
            </div>
        );
    }

    const trimmedRecipientEmail = recipientEmail.trim();
    const canSendEmail = EMAIL_REGEX.test(trimmedRecipientEmail);
    const showEmailError = emailTouched && !canSendEmail;
    const emailHelperId = "order-email-helper";



    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold">Order Details</h1>

                    </div>
                    <nav aria-label="breadcrumb" className="text-sm breadcrumbs">
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/orders">Orders</Link></li>
                            <li>Order {order.orderNumber}</li>
                        </ul>
                    </nav>
                </header>

                <main className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <InfoCard
                                title="Order Number"
                                content={<>
                                    <p className="text-2xl font-bold">{order.orderNumber}</p>
                                    <p className="text-sm text-gray-500">
                                        {order.Office?.isWalkInOffice == true ? "Walk-in" : "In-office"}
                                    </p>
                                </>}
                            />
                            <EditableInfoCard
                                title="Purchase Order Number"
                                content={order.purchaseOrderNumber ?? ""}
                                isEditing={editingField === "purchaseOrderNumber"}
                                onEdit={() => {
                                    setEditingField("purchaseOrderNumber");
                                }}
                                onSave={() => {
                                    handleSave("purchaseOrderNumber");
                                }}
                                onCancel={() => {
                                    handleCancel("purchaseOrderNumber");
                                }}
                                editComponent={
                                    <Input
                                        type="text"
                                        value={tempPurchaseOrderNumber}
                                        onChange={(e) => setTempPurchaseOrderNumber(e.target.value)}
                                    />
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <InfoCard
                                title="Company"
                                content={<>
                                    <p className="text-xl">{order.Office?.Company.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {order.Office?.isWalkInOffice == true ? "Walk-in" : "In-office"}
                                    </p>
                                </>}
                            />
                            {order.WalkInCustomer == null && (
                                <InfoCard
                                    title='Office'
                                    content={<p className="text-xl">{
                                        order.Office.name
                                    }</p>}
                                />
                            )}
                            {order.WalkInCustomer != null && (
                                <InfoCard
                                    title="Walk-in Customer"
                                    content={<p className="text-xl">{order.WalkInCustomer.name}</p>}
                                />
                            )}
                            <div className="flex flex-row gap-2">
                                <InfoCard
                                    title="Transfer Ownership"
                                    content={<TransferOwnership orderId={order.id} />}
                                />
                                <InfoCard
                                    title="Duplicate Order"
                                    content={<DuplicateOrder orderId={order.id} />}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="grid-cols-1 gap-4">
                            {/* Status Badge */}
                            <InfoCard
                                title="Order Status"
                                content={<OrderStatusBadge
                                    id={order.id}
                                    status={order.status}
                                    orderId={order.id}
                                />}
                            />

                            <div className="grid grid-cols-2 gap-4">

                                {/* Print Order */}
                                <InfoCard
                                    title="Print Order"
                                    content={
                                        <Link href={`/orders/${order.id}/print`}>
                                            <Button
                                                variant="default"
                                            >
                                                <Printer className="w-4 h-4" />
                                                Print Order
                                            </Button>
                                        </Link>
                                    }
                                />

                                {/* Send Order by Email */}
                                <InfoCard
                                    title="Send Order by Email"
                                    content={
                                        <div className="flex flex-col gap-2">
                                            <Input
                                                type="email"
                                                placeholder={normalizedContactEmail || "recipient@example.com"}
                                                value={recipientEmail}
                                                onChange={(e) => handleRecipientEmailChange(e.target.value)}
                                                onBlur={handleRecipientEmailBlur}
                                                aria-invalid={showEmailError}
                                                aria-describedby={emailHelperId}
                                                autoComplete="email"
                                            />

                                            <Button
                                                type="button"
                                                variant="default"
                                                className="flex items-center gap-2"
                                                disabled={!canSendEmail || sendOrderEmailMutation.isPending}
                                                onClick={handleSendOrderEmail}
                                            >
                                                {sendOrderEmailMutation.isPending ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                                {sendOrderEmailMutation.isPending ? "Sending..." : "Send Order by Email"}
                                            </Button>

                                            {emailStatus && (
                                                <p
                                                    id={emailHelperId}
                                                    className={cn(
                                                        "text-sm",
                                                        emailStatus.type === "error" ? "text-red-600" : "text-green-600"
                                                    )}
                                                >
                                                    {emailStatus.message}
                                                </p>
                                            )}
                                            {!emailStatus && showEmailError && (
                                                <p id={emailHelperId} className="text-sm text-red-600">
                                                    Enter a valid email address.
                                                </p>
                                            )}
                                        </div>
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid-flow-dense">
                            <InfoCard
                                title="Order Price Details"
                                content={
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Left Column - Price Details */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Receipt className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Item Total</div>
                                                        <div className="font-semibold">{formatCurrency(order.totalItemAmount ?? "")}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Truck className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Shipping Amount</div>
                                                        <div className="font-semibold">{formatCurrency(order.totalShippingAmount ?? "")}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Calculator className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Subtotal</div>
                                                        <div className="font-semibold">{formatCurrency(order.calculatedSubTotal ?? "")}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Percent className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Sales Tax</div>
                                                        <div className="font-semibold">{formatCurrency(order.calculatedSalesTax ?? "")}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 pt-2 border-t">
                                                    <DollarSign className="w-5 h-5 text-green-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Total Amount</div>
                                                        <div className="text-lg font-bold text-green-600">{formatCurrency(order.totalAmount ?? "")}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column - Actions */}
                                            <div className="space-y-3">
                                                <div>
                                                    {order.Invoice === null ? (
                                                        <CreateInvoiceButton order={order} />
                                                    ) : (
                                                        <Link
                                                            href={`/invoices/${order.Invoice.id}`}
                                                        >
                                                            <Button
                                                                variant="default"
                                                            >
                                                                <ReceiptIcon className="w-4 h-4" />
                                                                View Invoice
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>

                                                {!order.quickbooksInvoiceId && (
                                                    <Button
                                                        variant="default"
                                                        className="flex items-center gap-2"
                                                        disabled={!isAuthenticated || createQuickbooksInvoiceMutation.isPending}
                                                        onClick={() => handleCreateQuickbooksInvoice(order.id)}
                                                    >
                                                        {createQuickbooksInvoiceMutation.isPending ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <PlusCircle className="w-4 h-4" />
                                                        )}
                                                        {createQuickbooksInvoiceMutation.isPending ? "Creating..." : "Create QuickBooks Invoice"}
                                                    </Button>
                                                )}

                                                {order.quickbooksInvoiceId && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <FileText className="w-4 h-4" />
                                                        QB Invoice: {order.quickbooksInvoiceId}
                                                    </div>
                                                )}

                                                <OrderDeposit order={order} />
                                            </div>
                                        </div>
                                    </div>
                                }
                            />
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-700 mb-2">Order Notes</h2>
                                <Textarea
                                    value={orderNotes}
                                    onChange={handleOrderNotesChange}
                                    className="bg-gray-50 p-4 rounded-lg w-full mb-4"
                                />
                                <Button variant="default" onClick={updateOrderNotes}>
                                    Update Notes
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <InfoCard
                            title="Order Created By"
                            content={<p>{order.createdBy?.name}</p>}
                        />
                        <InfoCard
                            title="Created At"
                            content={<p>{formatDate(order.createdAt ?? "")}</p>}
                        />
                        <InfoCard
                            title="Contact Person"
                            content={<ContactPersonEditor
                                orderId={order.id}
                                currentContactPerson={order.contactPerson}
                                officeId={order.officeId}
                                onUpdate={() => {
                                    utils.orders.getByID.invalidate(orderId);
                                }}
                            />}
                        />
                        <EditableInfoCard
                            title="In Hands Date"
                            content={order.inHandsDate ? formatDate(order.inHandsDate) : "N/A"}
                            isEditing={editingField === "inHandsDate"}
                            onEdit={() => {
                                setEditingField("inHandsDate");
                                setTempInHandsDate(order.inHandsDate ? new Date(order.inHandsDate) : undefined);
                            }}
                            onSave={() => {
                                handleSave("inHandsDate");
                            }}
                            onCancel={() => {
                                handleCancel("inHandsDate");
                            }}
                            editComponent={
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !tempInHandsDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {tempInHandsDate ? dayjs(tempInHandsDate).format("MMMM D, YYYY") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={tempInHandsDate}
                                            onSelect={setTempInHandsDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            }
                        />
                        <InfoCard
                            title="In Hands Date"
                            content={<p>{order.inHandsDate ? formatDate(order.inHandsDate) : "N/A"}</p>}
                        />
                    </div>

                    <section className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">Shipping Information</h2>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <ShippingInfoEditor
                                orderId={order.id}
                                currentShippingInfo={order.ShippingInfo}
                                officeId={order.officeId}
                                onUpdate={() => {
                                    // Wrap the invalidation in a try-catch and add a small delay
                                    try {
                                        setTimeout(() => {
                                            utils.orders.getByID.invalidate(orderId)
                                                .catch(error => {
                                                    console.error("Error invalidating order:", error);
                                                    toast.error("Error refreshing order details");
                                                });
                                        }, 100);
                                    } catch (error) {
                                        console.error("Error in shipping info update:", error);
                                        toast.error("Error updating shipping information");
                                    }
                                }}
                            />
                        </div>
                    </section>

                    <section className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">Order Items</h2>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-md">
                            {isOrderItemsLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
                                </div>
                            ) : orderItems && orderItems.length > 0 ? (
                                <OrderItemsTable orderItems={orderItems} />
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    No order items found
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
