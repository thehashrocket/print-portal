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
    type OutsourcedOrderItemInfo,
    type ProcessingOptions,
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
    type PaperProduct,
    type ProductType,
    OutsourcedOrderItemInfoFile,
} from "@prisma/client";

import {
    type SerializedOrder,
    type SerializedOrderItem,
    type SerializedWorkOrder,
    type SerializedWorkOrderItem,
    type SerializedShippingInfo,
    type SerializedShippingPickup,
    type SerializedProcessingOptions,
    type SerializedPaperProduct,
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
    type SerializedWorkOrderVersion,
    type SerializedProductType,
    type SerializedWalkInCustomer,
    type SerializedOffice,
    SerializedOutsourcedOrderItemInfo,
    SerializedOutsourcedOrderItemInfoFile
} from "~/types/serializedTypes";

export function normalizeAddress(address: Address): SerializedAddress {
    return {
        id: address.id,
        officeId: address.officeId,
        name: address.name,
        line1: address.line1,
        line2: address.line2,
        line3: address.line3,
        line4: address.line4,
        city: address.city,
        deleted: address.deleted,
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

export function normalizeInvoice(invoice: Invoice & {
    InvoiceItems: InvoiceItem[];
    InvoicePayments: InvoicePayment[];
    createdBy: {
        id: string;
        name: string | null;
        email: string | null;
    };
    Order?: {
        Office: {
            Company: { name: string };
        };
    }
}): SerializedInvoice {
    return {
        createdAt: invoice.createdAt.toISOString(),
        createdById: invoice.createdById,
        createdBy: {
            id: invoice.createdBy.id,
            name: invoice.createdBy?.name ?? null,
            email: invoice.createdBy?.email ?? null
        },
        dateDue: invoice.dateDue.toISOString(),
        dateIssued: invoice.dateIssued.toISOString(),
        id: invoice.id,
        InvoiceItems: invoice.InvoiceItems.map(normalizeInvoiceItem),
        invoiceNumber: invoice.invoiceNumber,
        InvoicePayments: invoice.InvoicePayments.map(normalizeInvoicePayment),
        notes: invoice.notes,
        Order: invoice.Order ? {
            Office: {
                Company: { name: invoice.Order.Office.Company.name }
            }
        } : {
            Office: {
                Company: { name: "" }  // Provide a default value
            }
        },
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
    notes: string | null;
    purchaseOrderNumber: string | null;
    totalAmount: Prisma.Decimal | null;
    totalCost: Prisma.Decimal | null;
    totalItemAmount: Prisma.Decimal | null;
    totalPaid: Prisma.Decimal | null;
    balance: Prisma.Decimal | null;
    totalShippingAmount: Prisma.Decimal | null;
    OrderPayments: OrderPayment[] | null;
    Office: {
        isWalkInOffice: boolean;
        name: string;
        Company: { name: string };
    };
    OrderItems?: (OrderItem & {
        artwork: OrderItemArtwork[];
        createdBy: {
            id: string;
            name: string | null;
            email: string | null;
        };
        Order: {
            Office: {
                isWalkInOffice: boolean;
                name: string;
                Company: {
                    name: string;
                };
            };
            WorkOrder: {
                purchaseOrderNumber: string | null;
            };
        };
        OrderItemStock: OrderItemStock[];
        ProductType: ProductType | null;
    })[];
    contactPerson: {
        id: string;
        name: string | null;
        email: string | null;
    } | null;
    createdBy: {
        id: string;
        name: string | null;
        email: string | null;
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
    WorkOrder: {
        purchaseOrderNumber: string | null;
    };
    WalkInCustomer: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        createdAt: string;
        updatedAt: string;
    } | null;
}): SerializedOrder {
    return {
        calculatedSalesTax: order.calculatedSalesTax ? order.calculatedSalesTax.toString() : null,
        calculatedSubTotal: order.calculatedSubTotal ? order.calculatedSubTotal.toString() : null,
        contactPersonId: order.contactPersonId ?? null,
        createdAt: order.createdAt.toISOString(),
        notes: order.notes,
        quickbooksInvoiceId: order.quickbooksInvoiceId,
        syncToken: order.syncToken,
        contactPerson: order.contactPerson ? {
            id: order.contactPerson.id,
            name: order.contactPerson.name,
            email: order.contactPerson.email
        } : {
            id: order.contactPersonId || '',
            name: null,
            email: null
        },
        createdBy: {
            id: order.createdBy.id,
            name: order.createdBy?.name ?? null,
            email: order.createdBy?.email ?? null
        },
        createdById: order.createdById,
        dateInvoiced: order.dateInvoiced?.toISOString() ?? null,
        deposit: order.deposit.toString(),
        id: order.id,
        inHandsDate: order.inHandsDate?.toISOString() ?? null,
        invoicePrintEmail: order.invoicePrintEmail,
        Office: {
            isWalkInOffice: order.Office.isWalkInOffice,
            name: order.Office.name,
            Company: {
                name: order.Office.Company.name
            }
        },
        officeId: order.officeId,
        orderNumber: order.orderNumber,
        purchaseOrderNumber: order.purchaseOrderNumber ?? null,
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
        WorkOrder: {
            purchaseOrderNumber: order.WorkOrder.purchaseOrderNumber ?? null
        },
        OrderItems: order.OrderItems ? order.OrderItems.map(normalizeOrderItem) : [],
        OrderPayments: order.OrderPayments ? order.OrderPayments.map(normalizeOrderPayment) : [],
        ShippingInfo: order.ShippingInfo ? normalizeShippingInfo(order.ShippingInfo) : null,
        Invoice: order.Invoice ? normalizeInvoice(order.Invoice) : null,
        OrderNotes: order.OrderNotes ? order.OrderNotes.map(normalizeOrderNote) : [],
        isWalkIn: order.isWalkIn || false,
        walkInCustomerId: order.walkInCustomerId,
        WalkInCustomer: order.WalkInCustomer ? normalizeWalkInCustomer(order.WalkInCustomer) : null,
    };
}

export function normalizeOrderItem(item: OrderItem & {
    artwork: OrderItemArtwork[];
    createdBy: {
        id: string;
        name: string | null;
        email: string | null;
    };
    OutsourcedOrderItemInfo?: OutsourcedOrderItemInfo | null;
    OrderItemStock: OrderItemStock[];
    ProductType: ProductType | null;
    shippingInfoId?: string | null;
    ShippingInfo?: (ShippingInfo & {
        Address: Address | null;
        ShippingPickup: ShippingPickup[];
    }) | null;
    Order: {
        Office: {
            isWalkInOffice: boolean;
            name: string;
            Company: {
                name: string;
            };
        };
        WorkOrder: {
            purchaseOrderNumber: string | null;
        };
    };
}): SerializedOrderItem {
    return {
        id: item.id,
        amount: item.amount ? item.amount.toString() : null,
        cost: item.cost ? item.cost.toString() : null,
        createdAt: item.createdAt.toISOString(),
        createdById: item.createdById,
        createdBy: {
            id: item.createdById,
            name: item.createdBy?.name ?? null,
            email: item.createdBy?.email ?? null
        },
        description: item.description,
        expectedDate: item.expectedDate ? item.expectedDate.toISOString() : null,
        finishedQty: item.finishedQty,
        ink: item.ink,
        Order: {
            Office: {
                isWalkInOffice: item.Order.Office.isWalkInOffice,
                name: item.Order.Office.name,
                Company: {
                    name: item.Order.Office.Company.name
                },
            },
            WorkOrder: {
                purchaseOrderNumber: item.Order.WorkOrder.purchaseOrderNumber ?? null
            }
        },
        artwork: item.artwork.map(normalizeOrderItemArtwork),
        orderId: item.orderId,
        orderItemNumber: item.orderItemNumber,
        OutsourcedOrderItemInfo: item.OutsourcedOrderItemInfo ? normalizeOutsourcedOrderItemInfo(item.OutsourcedOrderItemInfo) : null,
        OrderItemStock: item.OrderItemStock.map(normalizeOrderItemStock),
        other: item.other,
        prepTime: item.prepTime,
        pressRun: item.pressRun,
        ProductType: item.ProductType ? normalizeProductType(item.ProductType) : null,
        quantity: item.quantity,
        shippingAmount: item.shippingAmount ? item.shippingAmount.toString() : null,
        ShippingInfo: item.ShippingInfo ? normalizeShippingInfo(item.ShippingInfo) : null,
        shippingInfoId: item.shippingInfoId ?? null,
        size: item.size,
        specialInstructions: item.specialInstructions,
        status: item.status,
        updatedAt: item.updatedAt.toISOString(),
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

export function normalizeOutsourcedOrderItemInfo(info: OutsourcedOrderItemInfo & {
    files?: OutsourcedOrderItemInfoFile[];
}): SerializedOutsourcedOrderItemInfo {
    return {
        id: info.id,
        orderItemId: info.orderItemId,
        companyName: info.companyName ?? "",
        contactName: info.contactName ?? "",
        contactPhone: info.contactPhone ?? "",
        contactEmail: info.contactEmail ?? "",
        jobDescription: info.jobDescription ?? "",
        orderNumber: info.orderNumber ?? "",
        estimatedDeliveryDate: info.estimatedDeliveryDate?.toISOString() ?? null,
        files: info.files?.map(normalizeOutsourcedOrderItemInfoFile) ?? [],
    };
}

export function normalizeOutsourcedOrderItemInfoFile(file: OutsourcedOrderItemInfoFile): SerializedOutsourcedOrderItemInfoFile {
    return {
        id: file.id,
        fileUrl: file.fileUrl,
        description: file.description ?? "",
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
    };
}
export function normalizeOrderItemStock(stock: OrderItemStock & {
    PaperProduct?: PaperProduct | null;
}): SerializedOrderItemStock {
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
        orderItemId: stock.orderItemId,
        createdById: stock.createdById,
        supplier: stock.supplier,
        paperProductId: stock.paperProductId,
        PaperProduct: stock.PaperProduct ? normalizePaperProduct(stock.PaperProduct) : null
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
    OrderItems?: (OrderItem & {
        artwork: OrderItemArtwork[];
        createdBy: {
            id: string;
            name: string | null;
            email: string | null;
        };
        OrderItemStock: OrderItemStock[];
        ProductType: ProductType | null;
        Order: {
            Office: {
                isWalkInOffice: boolean;
                name: string;
                Company: {
                    name: string;
                };
            };
            WorkOrder: {
                purchaseOrderNumber: string | null;
            };
        };
    })[];
    WorkOrderItems?: (WorkOrderItem & {
        artwork: WorkOrderItemArtwork[];
        ProcessingOptions: ProcessingOptions[];
        ProductType: ProductType | null;
        Typesetting: (Typesetting & {
            TypesettingOptions: TypesettingOption[];
            TypesettingProofs: TypesettingProof[];
        })[];
        WorkOrderItemStock: WorkOrderItemStock[];
        createdBy: {
            id: string;
            name: string | null;
        };
    })[];
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
        createdAt: shippingInfo.createdAt?.toISOString() ?? new Date().toISOString(),
        updatedAt: shippingInfo.updatedAt?.toISOString() ?? new Date().toISOString(),
        createdById: shippingInfo.createdById,
        officeId: shippingInfo.officeId,
        Address: shippingInfo.Address ? normalizeAddress(shippingInfo.Address) : null,
        ShippingPickup: shippingInfo.ShippingPickup && shippingInfo.ShippingPickup.length > 0 && shippingInfo.ShippingPickup[0]
            ? normalizeShippingPickup(shippingInfo.ShippingPickup[0])
            : null,
        OrderItems: shippingInfo.OrderItems ? shippingInfo.OrderItems.map(normalizeOrderItem) : [],
        WorkOrderItems: shippingInfo.WorkOrderItems ? shippingInfo.WorkOrderItems.map(normalizeWorkOrderItem) : [],
    };
}

export function normalizeProductType(productType: ProductType): SerializedProductType {
    return {
        id: productType.id,
        name: productType.name,
        description: productType.description,
        createdAt: productType.createdAt.toISOString(),
        updatedAt: productType.updatedAt.toISOString(),
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
    contactPerson: { id: string; name: string | null; email: string | null } | null;
    createdBy: { id: string; name: string | null; email: string | null };
    Office: {
        id: string;
        name: string;
        isWalkInOffice: boolean;
        Company: { name: string };
    };
    Orders: { id: string }[];
    ShippingInfo: (ShippingInfo & {
        Address: Address | null;
        ShippingPickup: ShippingPickup[];
    }) | null;
    WorkOrderItems: (WorkOrderItem & {
        artwork: WorkOrderItemArtwork[];
        ProductType: ProductType | null;
        Typesetting: (Typesetting & {
            TypesettingOptions: TypesettingOption[];
            TypesettingProofs: TypesettingProof[];
        })[];
        ProcessingOptions: ProcessingOptions[];
        WorkOrderItemStock: WorkOrderItemStock[];
        createdBy: {
            id: string;
            name: string | null;
            email: string | null;
        };
    })[];
    WorkOrderNotes: WorkOrderNote[];
    WorkOrderVersions: WorkOrderVersion[];
    isWalkIn: boolean | null;
    walkInCustomerId: string | null;
    WalkInCustomer?: any;
}): SerializedWorkOrder {
    return {
        calculatedSalesTax: workOrder.calculatedSalesTax ? workOrder.calculatedSalesTax.toString() : null,
        calculatedSubTotal: workOrder.calculatedSubTotal ? workOrder.calculatedSubTotal.toString() : null,
        contactPersonId: workOrder.contactPersonId ?? null,
        createdAt: workOrder.createdAt.toISOString(),
        createdById: workOrder.createdById,
        dateIn: workOrder.dateIn.toISOString(),
        estimateNumber: workOrder.estimateNumber ?? null,
        id: workOrder.id,
        inHandsDate: workOrder.inHandsDate.toISOString(),
        invoicePrintEmail: workOrder.invoicePrintEmail,
        officeId: workOrder.officeId,
        purchaseOrderNumber: workOrder.purchaseOrderNumber ?? null,
        shippingInfoId: workOrder.shippingInfoId,
        status: workOrder.status,
        totalAmount: workOrder.totalAmount?.toString() ?? null,
        totalCost: workOrder.totalCost?.toString() ?? null,
        totalItemAmount: workOrder.totalItemAmount?.toString() ?? null,
        totalShippingAmount: workOrder.totalShippingAmount?.toString() ?? null,
        updatedAt: workOrder.updatedAt.toISOString(),
        version: workOrder.version,
        workOrderNumber: workOrder.workOrderNumber.toString(),
        contactPerson: workOrder.contactPerson || {
            id: workOrder.contactPersonId || '',
            name: null,
            email: null
        },
        createdBy: {
            id: workOrder.createdBy.id,
            name: workOrder.createdBy?.name ?? null
        },
        Office: {
            Company: {
                name: workOrder.Office.Company.name,
            },
            id: workOrder.Office.id,
            name: workOrder.Office.name,
            isWalkInOffice: workOrder.Office.isWalkInOffice,
        },
        Orders: workOrder.Orders[0] ? { id: workOrder.Orders[0].id } : null,
        WorkOrderItems: workOrder.WorkOrderItems.map(normalizeWorkOrderItem),
        ShippingInfo: workOrder.ShippingInfo ? normalizeShippingInfo(workOrder.ShippingInfo) : null,
        WorkOrderNotes: workOrder.WorkOrderNotes.map(normalizeWorkOrderNote),
        WorkOrderVersions: workOrder.WorkOrderVersions.map(normalizeWorkOrderVersion),
        isWalkIn: workOrder.isWalkIn ?? false,
        walkInCustomerId: workOrder.walkInCustomerId,
        WalkInCustomer: workOrder.WalkInCustomer ? normalizeWalkInCustomer(workOrder.WalkInCustomer) : null,
    };
}

export function normalizeWorkOrderItem(item: WorkOrderItem & {
    artwork: WorkOrderItemArtwork[];
    PaperProduct?: PaperProduct | null;
    ProcessingOptions: ProcessingOptions[];
    ProductType: ProductType | null;
    shippingInfoId?: string | null;
    ShippingInfo?: (ShippingInfo & {
        Address: Address | null;
        ShippingPickup: ShippingPickup[];
    }) | null;
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
        paperProductId: item.paperProductId,
        productTypeId: item.productTypeId,
        quantity: item.quantity,
        size: item.size,
        specialInstructions: item.specialInstructions,
        status: item.status,
        updatedAt: item.updatedAt.toISOString(),
        workOrderId: item.workOrderId,
        shippingInfoId: item.shippingInfoId ?? null,
        ShippingInfo: item.ShippingInfo ? normalizeShippingInfo(item.ShippingInfo) : null,
        artwork: item.artwork?.map(normalizeWorkOrderItemArtwork) ?? [],
        PaperProduct: item.PaperProduct ? normalizePaperProduct(item.PaperProduct) : null,
        ProcessingOptions: item.ProcessingOptions?.map(normalizeProcessingOptions) ?? [],
        ProductType: item.ProductType ? normalizeProductType(item.ProductType) : null,
        Typesetting: item.Typesetting?.map(normalizeTypesetting) ?? [],
        workOrderItemNumber: item.workOrderItemNumber,
        WorkOrderItemStock: item.WorkOrderItemStock?.map(normalizeWorkOrderItemStock) ?? [],
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

export function normalizeWorkOrderItemStock(stock: WorkOrderItemStock & {
    PaperProduct?: PaperProduct | null;
}): SerializedWorkOrderItemStock {
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
        paperProductId: stock.paperProductId,
        PaperProduct: stock.PaperProduct ? normalizePaperProduct(stock.PaperProduct) : null
    };
}

export function normalizePaperProduct(product: PaperProduct): SerializedPaperProduct {
    return {
        id: product.id,
        brand: product.brand ?? undefined,
        paperType: product.paperType ?? undefined,
        finish: product.finish ?? undefined,
        weightLb: product.weightLb ?? undefined,
        caliper: product.caliper ?? undefined,
        size: product.size ?? undefined,
        customDescription: product.customDescription ?? undefined,
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

export function normalizeWalkInCustomer(walkInCustomer: any): SerializedWalkInCustomer {
    return {
        id: walkInCustomer.id,
        name: walkInCustomer.name,
        email: walkInCustomer.email,
        phone: walkInCustomer.phone,
        createdAt: walkInCustomer.createdAt instanceof Date ? walkInCustomer.createdAt.toISOString() : walkInCustomer.createdAt,
        updatedAt: walkInCustomer.updatedAt instanceof Date ? walkInCustomer.updatedAt.toISOString() : walkInCustomer.updatedAt,
    };
}

export function normalizeOffice(office: any): SerializedOffice {
    return {
        id: office.id,
        name: office.name,
        createdAt: office.createdAt.toISOString(),
        updatedAt: office.updatedAt.toISOString(),
        createdById: office.createdById,
        companyId: office.companyId,
        isActive: office.isActive,
        isWalkInOffice: office.isWalkInOffice,
        quickbooksCustomerId: office.quickbooksCustomerId,
        Addresses: office.Addresses?.map(normalizeAddress) ?? [],
        Company: office.Company,
        WorkOrders: office.WorkOrders ?? [],
        Orders: office.Orders ?? []
    };
}