// ~/utils/dataNormalization.ts

import {
    type Order,
    type OrderItem,
    type WorkOrder,
    type WorkOrderItem,
    type ShippingInfo,
    type ShippingPickup,
    type Address,
    type OrderPayment,
    type ProcessingOptions,
    ProofMethod,
    type Typesetting,
    type TypesettingOption,
    type TypesettingProof,
    type TypesettingProofArtwork,
    type WorkOrderItemArtwork,
    type WorkOrderItemStock,
    type Invoice,
    type InvoiceItem,
    type InvoicePayment,
    type OrderItemArtwork,
    type OrderItemStock,
    type OrderNote,
    type WorkOrderNote,
    type WorkOrderVersion,
    type Prisma,
    User,
    OrderStatus
} from "@prisma/client";

import {
    type SerializedOrder,
    type SerializedOrderItem,
    type SerializedWorkOrder,
    type SerializedWorkOrderItem,
    type SerializedShippingInfo,
    type SerializedShippingPickup,
    type SerializedProcessingOptions,
    type SerializedTypesetting,
    type SerializedTypesettingOption,
    type SerializedTypesettingProof,
    type SerializedTypesettingProofArtwork,
    type SerializedWorkOrderItemArtwork,
    type SerializedWorkOrderItemStock,
    type SerializedAddress,
    type SerializedInvoice,
    type SerializedInvoiceItem,
    type SerializedInvoicePayment,
    type SerializedOrderItemArtwork,
    type SerializedOrderItemStock,
    type SerializedOrderNote,
    type SerializedOrderPayment,
    type SerializedWorkOrderNote,
    type SerializedWorkOrderVersion
} from "~/types/serializedTypes";

export function normalizeInvoice(invoice: Invoice & {
    InvoiceItems: InvoiceItem[];
    InvoicePayments: InvoicePayment[];
    createdBy: {
        id: string;
        name: string | null;
        email: string | null;
    };
}): SerializedInvoice {
    return {
        createdAt: invoice.createdAt.toISOString(),
        createdById: invoice.createdById,
        createdBy: {
            id: invoice.createdBy.id,
            name: invoice.createdBy.name,
            email: invoice.createdBy.email
        },
        dateDue: invoice.dateDue.toISOString(),
        dateIssued: invoice.dateIssued.toISOString(),
        id: invoice.id,
        InvoiceItems: invoice.InvoiceItems.map(normalizeInvoiceItem),
        invoiceNumber: invoice.invoiceNumber,
        InvoicePayments: invoice.InvoicePayments.map(normalizeInvoicePayment),
        notes: invoice.notes,
        orderId: invoice.orderId,
        quickbooksId: invoice.quickbooksId ?? null,
        syncToken: invoice.syncToken ?? null,
        status: invoice.status,
        subtotal: invoice.subtotal.toString(),
        taxAmount: invoice.taxAmount.toString(),
        taxRate: invoice.taxRate.toString(),
        total: invoice.total.toString(),
        updatedAt: invoice.updatedAt.toISOString(),
    };
}

export function normalizeInvoiceItem(item: InvoiceItem): SerializedInvoiceItem {
    return {
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        total: item.total.toString(),
        invoiceId: item.invoiceId,
        orderItemId: item.orderItemId,
    };
}

export function normalizeInvoicePayment(payment: InvoicePayment): SerializedInvoicePayment {
    return {
        id: payment.id,
        amount: payment.amount.toString(),
        paymentDate: payment.paymentDate.toISOString(),
        paymentMethod: payment.paymentMethod,
        invoiceId: payment.invoiceId,
    };
}

export function normalizeOrder(order: Order & {
    calculatedSalesTax: Prisma.Decimal | null;
    calculatedSubTotal: Prisma.Decimal | null;
    totalAmount: Prisma.Decimal | null;
    totalCost: Prisma.Decimal | null;
    totalItemAmount: Prisma.Decimal | null;
    totalPaid: Prisma.Decimal | null;
    balance: Prisma.Decimal | null;
    totalShippingAmount: Prisma.Decimal | null;
    OrderPayments: OrderPayment[] | null;
    Office: {
        Company: { name: string };
    };
    OrderItems?: (OrderItem & {
        artwork: OrderItemArtwork[];
        Order: {
            id: string;
            Office: {
                Company: {
                    name: string;
                };
            };
        };
        OrderItemStock: OrderItemStock[];
    })[];
    contactPerson: {
        id: string;
        name: string | null;
        email: string | null;
    };
    createdBy: {
        id: string;
        name: string | null;
    };
    ShippingInfo?: (ShippingInfo & {
        Address: Address | null;
        ShippingPickup: ShippingPickup[];
    }) | null;
    Invoice?: (Invoice & {
        InvoiceItems: InvoiceItem[];
        InvoicePayments: InvoicePayment[];
        createdBy: {
            id: string;
            name: string | null;
            email: string | null;
        };
    }) | null;
    OrderNotes?: OrderNote[];
}): SerializedOrder {
    return {
        calculatedSalesTax: order.calculatedSalesTax ? order.calculatedSalesTax.toString() : null,
        calculatedSubTotal: order.calculatedSubTotal ? order.calculatedSubTotal.toString() : null,
        contactPersonId: order.contactPersonId,
        createdAt: order.createdAt.toISOString(),
        quickbooksInvoiceId: order.quickbooksInvoiceId,
        syncToken: order.syncToken,
        createdById: order.createdById,
        dateInvoiced: order.dateInvoiced?.toISOString() ?? null,
        deposit: order.deposit.toString(),
        id: order.id,
        inHandsDate: order.inHandsDate?.toISOString() ?? null,
        invoicePrintEmail: order.invoicePrintEmail,
        officeId: order.officeId,
        orderNumber: order.orderNumber,
        shippingInfoId: order.shippingInfoId,
        status: order.status,
        totalAmount: order.totalAmount ? order.totalAmount.toString() : null,
        totalCost: order.totalCost ? order.totalCost.toString() : null,
        totalItemAmount: order.totalItemAmount ? order.totalItemAmount.toString() : null,
        totalShippingAmount: order.totalShippingAmount ? order.totalShippingAmount.toString() : null,
        totalPaid: order.totalPaid ? order.totalPaid.toString() : null,
        balance: order.balance ? order.balance.toString() : null,
        updatedAt: order.updatedAt.toISOString(),
        version: order.version,
        workOrderId: order.workOrderId,
        pressRun: order.pressRun,
        contactPerson: {
            id: order.contactPerson.id,
            name: order.contactPerson.name,
            email: order.contactPerson.email
        },
        createdBy: {
            id: order.createdBy.id,
            name: order.createdBy.name
        },
        Office: {
            Company: {
                name: order.Office.Company.name
            }
        },
        OrderItems: order.OrderItems ? order.OrderItems.map(normalizeOrderItem) : [],
        OrderPayments: order.OrderPayments ? order.OrderPayments.map(normalizeOrderPayment) : [],
        ShippingInfo: order.ShippingInfo ? normalizeShippingInfo(order.ShippingInfo) : null,
        Invoice: order.Invoice ? normalizeInvoice(order.Invoice) : null,
        OrderNotes: order.OrderNotes ? order.OrderNotes.map(normalizeOrderNote) : [],
    };
}

export function normalizeOrderItem(item: OrderItem & {
    artwork: OrderItemArtwork[];
    OrderItemStock: OrderItemStock[];
    Order: {
        id: string;
        Office: {
            Company: {
                name: string;
            };
        };
    };
}): SerializedOrderItem {
    return {
        id: item.id,
        amount: item.amount ? item.amount.toString() : null,
        cost: item.cost ? item.cost.toString() : null,
        createdAt: item.createdAt.toISOString(),
        createdById: item.createdById,
        description: item.description,
        expectedDate: item.expectedDate ? item.expectedDate.toISOString() : null,
        finishedQty: item.finishedQty,
        ink: item.ink,
        Order: {
            id: item.Order.id,
            Office: {
                Company: {
                    name: item.Order.Office.Company.name
                }
            }
        },
        orderId: item.orderId,
        orderItemNumber: item.orderItemNumber,
        other: item.other,
        prepTime: item.prepTime,
        pressRun: item.pressRun,
        quantity: item.quantity,
        shippingAmount: item.shippingAmount ? item.shippingAmount.toString() : null,
        size: item.size,
        specialInstructions: item.specialInstructions,
        status: item.status,
        updatedAt: item.updatedAt.toISOString(),
        artwork: item.artwork.map(normalizeOrderItemArtwork),
        OrderItemStock: item.OrderItemStock.map(normalizeOrderItemStock)
    };
}


export function normalizeOrderItemArtwork(artwork: OrderItemArtwork): SerializedOrderItemArtwork {
    return {
        id: artwork.id,
        orderItemId: artwork.orderItemId,
        fileUrl: artwork.fileUrl,
        description: artwork.description,
        createdAt: artwork.createdAt.toISOString(),
        updatedAt: artwork.updatedAt.toISOString(),
    };
}

export function normalizeOrderItemStock(stock: OrderItemStock): SerializedOrderItemStock {
    return {
        costPerM: stock.costPerM.toString(),
        createdAt: stock.createdAt.toISOString(),
        createdById: stock.createdById,
        expectedDate: stock.expectedDate?.toISOString() ?? null,
        from: stock.from,
        id: stock.id,
        notes: stock.notes,
        orderedDate: stock.orderedDate?.toISOString() ?? null,
        orderItemId: stock.orderItemId,
        received: stock.received,
        receivedDate: stock.receivedDate?.toISOString() ?? null,
        stockQty: stock.stockQty,
        stockStatus: stock.stockStatus,
        supplier: stock.supplier,
        totalCost: stock.totalCost?.toString() ?? null,
        updatedAt: stock.updatedAt.toISOString(),
    };
}

export function normalizeOrderNote(note: OrderNote): SerializedOrderNote {
    return {
        id: note.id,
        note: note.note,
        orderId: note.orderId,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        createdById: note.createdById
    };
}

export function normalizeOrderPayment(payment: OrderPayment): SerializedOrderPayment {
    return {
        id: payment.id,
        amount: payment.amount.toString(),
        paymentDate: payment.paymentDate.toISOString(),
        paymentMethod: payment.paymentMethod,
        orderId: payment.orderId,
    };
}

export function normalizeShippingInfo(shippingInfo: ShippingInfo & {
    Address: Address | null;
    ShippingPickup: ShippingPickup[];
}): SerializedShippingInfo {
    return {
        id: shippingInfo.id,
        shippingMethod: shippingInfo.shippingMethod,
        instructions: shippingInfo.instructions,
        shippingCost: shippingInfo.shippingCost?.toString() ?? null,
        shippingDate: shippingInfo.shippingDate?.toISOString() ?? null,
        shippingNotes: shippingInfo.shippingNotes,
        shippingOther: shippingInfo.shippingOther,
        shipToSameAsBillTo: shippingInfo.shipToSameAsBillTo,
        estimatedDelivery: shippingInfo.estimatedDelivery?.toISOString() ?? null,
        numberOfPackages: shippingInfo.numberOfPackages,
        trackingNumber: shippingInfo.trackingNumber,
        attentionTo: shippingInfo.attentionTo,
        addressId: shippingInfo.addressId,
        createdAt: shippingInfo.createdAt.toISOString(),
        updatedAt: shippingInfo.updatedAt.toISOString(),
        createdById: shippingInfo.createdById,
        officeId: shippingInfo.officeId,
        Address: shippingInfo.Address ? normalizeAddress(shippingInfo.Address) : null,
        ShippingPickup: shippingInfo.ShippingPickup.length > 0 && shippingInfo.ShippingPickup[0]
            ? normalizeShippingPickup(shippingInfo.ShippingPickup[0])
            : null,
    };
}

export function normalizeAddress(address: Address): SerializedAddress {
    return {
        id: address.id,
        officeId: address.officeId,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        quickbooksId: address.quickbooksId,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        telephoneNumber: address.telephoneNumber,
        addressType: address.addressType,
        createdAt: address.createdAt.toISOString(),
        updatedAt: address.updatedAt.toISOString(),
    };
}

export function normalizeShippingPickup(pickup: ShippingPickup): SerializedShippingPickup {
    return {
        id: pickup.id,
        pickupDate: pickup.pickupDate.toISOString(),
        pickupTime: pickup.pickupTime,
        notes: pickup.notes,
        contactName: pickup.contactName,
        contactPhone: pickup.contactPhone,
        createdAt: pickup.createdAt.toISOString(),
        updatedAt: pickup.updatedAt.toISOString(),
        createdById: pickup.createdById,
        shippingInfoId: pickup.shippingInfoId,
    };
}

export function normalizeProcessingOptions(options: ProcessingOptions): SerializedProcessingOptions {
    return {
        id: options.id,
        cutting: options.cutting,
        padding: options.padding,
        drilling: options.drilling,
        folding: options.folding,
        other: options.other,
        numberingStart: options.numberingStart,
        numberingEnd: options.numberingEnd,
        numberingColor: options.numberingColor,
        createdAt: options.createdAt.toISOString(),
        updatedAt: options.updatedAt.toISOString(),
        orderItemId: options.orderItemId,
        workOrderItemId: options.workOrderItemId,
        createdById: options.createdById,
        description: options.description,
        name: options.name,
        stitching: options.stitching,
        binderyTime: options.binderyTime,
        binding: options.binding,
    };
}

export function normalizeTypesetting(typesetting: Typesetting & {
    TypesettingOptions: TypesettingOption[];
    TypesettingProofs: TypesettingProof[];
}): SerializedTypesetting {
    return {
        id: typesetting.id,
        approved: typesetting.approved,
        cost: typesetting.cost?.toString() ?? null,
        createdAt: typesetting.createdAt.toISOString(),
        createdById: typesetting.createdById,
        dateIn: typesetting.dateIn.toISOString(),
        followUpNotes: typesetting.followUpNotes,
        orderItemId: typesetting.orderItemId,
        plateRan: typesetting.plateRan,
        prepTime: typesetting.prepTime,
        status: typesetting.status,
        timeIn: typesetting.timeIn,
        updatedAt: typesetting.updatedAt.toISOString(),
        workOrderItemId: typesetting.workOrderItemId,
        TypesettingOptions: typesetting.TypesettingOptions.map(normalizeTypesettingOption),
        TypesettingProofs: typesetting.TypesettingProofs.map(normalizeTypesettingProof),
    };
}

export function normalizeTypesettingOption(option: TypesettingOption): SerializedTypesettingOption {
    return {
        id: option.id,
        typesettingId: option.typesettingId,
        option: option.option,
        selected: option.selected,
        createdAt: option.createdAt.toISOString(),
        createdById: option.createdById,
        updatedAt: option.updatedAt.toISOString(),
    };
}

export function normalizeTypesettingProof(proof: TypesettingProof & { artwork?: TypesettingProofArtwork[] }): SerializedTypesettingProof {
    return {
        ...proof,
        dateSubmitted: proof.dateSubmitted ? new Date(proof.dateSubmitted) : null,
        createdAt: new Date(proof.createdAt),
        updatedAt: new Date(proof.updatedAt),
        artwork: (proof.artwork || []).map(normalizeTypesettingProofArtwork),
    };
}

function normalizeTypesettingProofArtwork(artwork: TypesettingProofArtwork): SerializedTypesettingProofArtwork {
    return {
        ...artwork,
        createdAt: new Date(artwork.createdAt),
        updatedAt: new Date(artwork.updatedAt),
    };
}

export function normalizeWorkOrder(workOrder: WorkOrder & {
    totalAmount: Prisma.Decimal | null;
    totalCost: Prisma.Decimal | null;
    totalItemAmount: Prisma.Decimal | null;
    calculatedSalesTax: Prisma.Decimal | null;
    calculatedSubTotal: Prisma.Decimal | null;
    totalShippingAmount: Prisma.Decimal | null;
    contactPerson: { id: string; name: string | null };
    createdBy: { id: string; name: string | null };
    Office: {
        id: string;
        name: string;
        Company: { name: string };
    };
    Order: { id: string } | null;
    ShippingInfo: (ShippingInfo & {
        Address: Address | null;
        ShippingPickup: ShippingPickup[];
    }) | null;
    WorkOrderItems: (WorkOrderItem & {
        artwork: WorkOrderItemArtwork[];
        Typesetting: (Typesetting & {
            TypesettingOptions: TypesettingOption[];
            TypesettingProofs: TypesettingProof[];
        })[];
        ProcessingOptions: ProcessingOptions[];
        WorkOrderItemStock: WorkOrderItemStock[];
        createdBy: {
            id: string;
            name: string | null
        };
    })[];
    WorkOrderNotes: WorkOrderNote[];
    WorkOrderVersions: WorkOrderVersion[];
}): SerializedWorkOrder {
    return {
        calculatedSalesTax: workOrder.calculatedSalesTax ? workOrder.calculatedSalesTax.toString() : null,
        calculatedSubTotal: workOrder.calculatedSubTotal ? workOrder.calculatedSubTotal.toString() : null,
        contactPersonId: workOrder.contactPersonId,
        createdAt: workOrder.createdAt.toISOString(),
        createdById: workOrder.createdById,
        dateIn: workOrder.dateIn.toISOString(),
        estimateNumber: workOrder.estimateNumber,
        id: workOrder.id,
        inHandsDate: workOrder.inHandsDate.toISOString(),
        invoicePrintEmail: workOrder.invoicePrintEmail,
        officeId: workOrder.officeId,
        purchaseOrderNumber: workOrder.purchaseOrderNumber,
        shippingInfoId: workOrder.shippingInfoId,
        status: workOrder.status,
        totalAmount: workOrder.totalAmount?.toString() ?? null,
        totalCost: workOrder.totalCost?.toString() ?? null,
        totalItemAmount: workOrder.totalItemAmount?.toString() ?? null,
        totalShippingAmount: workOrder.totalShippingAmount?.toString() ?? null,
        updatedAt: workOrder.updatedAt.toISOString(),
        version: workOrder.version,
        workOrderNumber: workOrder.workOrderNumber,
        contactPerson: {
            id: workOrder.contactPerson.id,
            name: workOrder.contactPerson.name
        },
        createdBy: {
            id: workOrder.createdBy.id,
            name: workOrder.createdBy.name
        },
        Office: {
            Company: {
                name: workOrder.Office.Company.name
            },
            id: workOrder.Office.id,
            name: workOrder.Office.name
        },
        Order: workOrder.Order?.id ? { id: workOrder.Order.id } : null,
        WorkOrderItems: workOrder.WorkOrderItems.map(normalizeWorkOrderItem),
        ShippingInfo: workOrder.ShippingInfo ? normalizeShippingInfo(workOrder.ShippingInfo) : null,
        WorkOrderNotes: workOrder.WorkOrderNotes.map(normalizeWorkOrderNote),
        WorkOrderVersions: workOrder.WorkOrderVersions.map(normalizeWorkOrderVersion)
    };
}

export function normalizeWorkOrderItem(item: WorkOrderItem & {
    artwork: WorkOrderItemArtwork[];
    ProcessingOptions: ProcessingOptions[];
    Typesetting: (Typesetting & {
        TypesettingOptions: TypesettingOption[];
        TypesettingProofs: TypesettingProof[];
    })[];
    WorkOrderItemStock: WorkOrderItemStock[];
    createdBy: {
        id: string;
        name: string | null
    };
}): SerializedWorkOrderItem {
    return {
        id: item.id,
        amount: item.amount?.toString() ?? null,
        cost: item.cost?.toString() ?? null,
        createdAt: item.createdAt.toISOString(),
        createdById: item.createdById,
        createdBy: {
            id: item.createdBy.id,
            name: item.createdBy.name ?? null
        },
        description: item.description,
        ink: item.ink,
        expectedDate: item.expectedDate.toISOString(),
        other: item.other,
        quantity: item.quantity,
        size: item.size,
        specialInstructions: item.specialInstructions,
        status: item.status,
        updatedAt: item.updatedAt.toISOString(),
        workOrderId: item.workOrderId,
        artwork: item.artwork.map(normalizeWorkOrderItemArtwork),
        ProcessingOptions: item.ProcessingOptions.map(normalizeProcessingOptions),
        Typesetting: item.Typesetting.map(normalizeTypesetting),
        workOrderItemNumber: item.workOrderItemNumber,
        WorkOrderItemStock: item.WorkOrderItemStock.map(normalizeWorkOrderItemStock),
    };
}

export function normalizeWorkOrderItemArtwork(artwork: WorkOrderItemArtwork): SerializedWorkOrderItemArtwork {
    return {
        id: artwork.id,
        workOrderItemId: artwork.workOrderItemId,
        fileUrl: artwork.fileUrl,
        description: artwork.description,
        createdAt: artwork.createdAt.toISOString(),
        updatedAt: artwork.updatedAt.toISOString(),
    };
}

export function normalizeWorkOrderItemStock(stock: WorkOrderItemStock): SerializedWorkOrderItemStock {
    return {
        id: stock.id,
        stockQty: stock.stockQty,
        costPerM: stock.costPerM.toString(),
        totalCost: stock.totalCost?.toString() ?? null,
        from: stock.from,
        expectedDate: stock.expectedDate?.toISOString() ?? null,
        orderedDate: stock.orderedDate?.toISOString() ?? null,
        received: stock.received,
        receivedDate: stock.receivedDate?.toISOString() ?? null,
        notes: stock.notes,
        stockStatus: stock.stockStatus,
        createdAt: stock.createdAt.toISOString(),
        updatedAt: stock.updatedAt.toISOString(),
        workOrderItemId: stock.workOrderItemId,
        createdById: stock.createdById,
        supplier: stock.supplier,
    };
}

export function normalizeWorkOrderNote(note: WorkOrderNote): SerializedWorkOrderNote {
    return {
        id: note.id,
        workOrderId: note.workOrderId,
        note: note.note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        createdById: note.createdById
    };
}

export function normalizeWorkOrderVersion(version: WorkOrderVersion): SerializedWorkOrderVersion {
    return {
        id: version.id,
        workOrderId: version.workOrderId,
        version: version.version,
        createdBy: version.createdBy,
        createdAt: version.createdAt.toISOString()
    };
}