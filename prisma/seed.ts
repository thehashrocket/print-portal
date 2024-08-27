import {
  AddressType,
  BindingType,
  InvoicePrintEmailOptions,
  OrderItem,
  OrderItemStatus,
  OrderStatus,
  Prisma,
  PrismaClient,
  ProofMethod,
  RoleName,
  ShippingMethod,
  StockStatus,
  TypesettingStatus,
  WorkOrderItem,
  WorkOrderItemStatus,
  WorkOrderStatus,
} from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const prismaClient = new PrismaClient();
const randomElementFromArray = <T>(array: T[]): T => {
  if (array.length === 0) {
    throw new Error("Cannot select a random element from an empty array");
  }
  return array[Math.floor(Math.random() * array.length)]!;
};
const MIN_ITEM_COUNT = 1;
const MAX_ITEM_COUNT = 5;
const MIN_NOTE_COUNT = 1;
const MAX_NOTE_COUNT = 5;
const MIN_QTY = 1;
const MAX_QTY = 1000;
const MIN_COST_PER_M = 50;
const MAX_COST_PER_M = 200;


const csOptions = ["C1", "C2", "C3", "C4", "C5", "C6"];
const inkColors = ["Black", "Cyan", "Magenta", "Yellow", "White"];
const proofTypes = Object.values(ProofMethod);
const randomInt = faker.number.int({ min: 0, max: 100 });
const sizes = ["Small", "Medium", "Large"];
const shippingMethods = Object.values(ShippingMethod);
const workOrderStatuses = Object.values(WorkOrderStatus);
const workOrderItemStatuses = Object.values(WorkOrderItemStatus);
const orderItemStatuses = Object.values(OrderItemStatus)
const orderStatuses = Object.values(OrderStatus);
const typesettingOptions = ["Negs", "Xante", "7200", "9200"];

const currentDate = new Date();
const maxFutureDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 7 days from today

// Convert a work order to an order
async function convertWorkOrderToOrder(workOrderId: string, officeId: string) {
  console.log('Converting Work Order to Order');
  const workOrder = await prismaClient.workOrder.findUnique({
    where: { id: workOrderId },
    include: { WorkOrderItems: true, ShippingInfo: true }
  });

  if (!workOrder) {
    throw new Error(`Work order with id ${workOrderId} not found`);
  }

  const order = await prismaClient.order.create({
    data: {
      officeId,
      shippingInfoId: workOrder.shippingInfoId,
      status: randomElementFromArray(orderStatuses),
      contactPersonId: workOrder.contactPersonId,
      createdById: workOrder.createdById,
      inHandsDate: workOrder.inHandsDate,
      workOrderId,
      version: 1,
      deposit: new Prisma.Decimal(faker.number.float({ min: 0, max: 1000, precision: 2 })),
      dateInvoiced: faker.date.recent(),
      invoicePrintEmail: workOrder.invoicePrintEmail,
    },
  });

  console.log('Order created: ', order.id);
  console.log('converting work order items to order items');

  for (const workOrderItem of workOrder.WorkOrderItems) {
    const orderItem = await prismaClient.orderItem.create({
      data: {
        approved: faker.datatype.boolean(),
        amount: workOrderItem.amount,
        cost: workOrderItem.cost,
        customerSuppliedStock: workOrderItem.customerSuppliedStock ?? "",
        description: workOrderItem.description,
        expectedDate: workOrderItem.expectedDate,
        finishedQty: 0,
        orderId: order.id,
        overUnder: '0',
        prepTime: workOrderItem.prepTime,
        pressRun: '0',
        size: workOrderItem.size,
        specialInstructions: workOrderItem.specialInstructions,
        createdById: workOrderItem.createdById,
        status: randomElementFromArray(orderItemStatuses),
      }
    });

    // Create OrderItemArtwork
    const workOrderItemArtworks = await prismaClient.workOrderItemArtwork.findMany({
      where: { workOrderItemId: workOrderItem.id },
    });

    for (const workOrderItemArtwork of workOrderItemArtworks) {
      await prismaClient.orderItemArtwork.create({
        data: {
          orderItemId: orderItem.id,
          fileUrl: workOrderItemArtwork.fileUrl,
          description: workOrderItemArtwork.description,
        }
      });
    }

    console.log('Order Item created');

    await copyProcessingOptionsToOrderItem(workOrderItem, orderItem, workOrderItem.createdById);
    await copyTypesettingsToOrderItem(workOrderItem, orderItem, workOrderItem.createdById);

    const workOrderStocks = await prismaClient.workOrderItemStock.findMany({
      where: { workOrderItemId: workOrderItem.id },
    });

    for (const workOrderStock of workOrderStocks) {
      await prismaClient.orderItemStock.create({
        data: {
          costPerM: workOrderStock.costPerM,
          expectedDate: workOrderStock.expectedDate,
          from: workOrderStock.from,
          notes: workOrderStock.notes,
          orderedDate: workOrderStock.orderedDate,
          orderItemId: orderItem.id,
          received: workOrderStock.received,
          receivedDate: workOrderStock.receivedDate,
          stockQty: workOrderStock.stockQty,
          stockStatus: workOrderStock.stockStatus,
          totalCost: workOrderStock.totalCost,
          createdById: workOrderStock.createdById,
        }
      });
    }
  }

  return order;
}

async function copyProcessingOptionsToOrderItem(workOrderItem: WorkOrderItem, orderItem: OrderItem, userId: string) {
  const processingOptions = await prismaClient.processingOptions.findMany({
    where: {
      workOrderItemId: workOrderItem.id,
    },
  });

  for (const processingOption of processingOptions) {
    await prismaClient.processingOptions.create({
      data: {
        name: processingOption.name,
        description: processingOption.description,
        binderyTime: processingOption.binderyTime,
        binding: processingOption.binding,
        cutting: processingOption.cutting,
        drilling: processingOption.drilling,
        folding: processingOption.folding,
        numberingColor: processingOption.numberingColor,
        numberingEnd: processingOption.numberingEnd,
        numberingStart: processingOption.numberingStart,
        other: processingOption.other,
        padding: processingOption.padding,
        stitching: processingOption.stitching,
        orderItemId: orderItem.id,
        createdById: userId,
      }
    });
  }
  console.log('Processing Options copied to Order Item');
}

async function copyTypesettingsToOrderItem(workOrderItem: WorkOrderItem, orderItem: OrderItem, userId: string) {
  const typesettings = await prismaClient.typesetting.findMany({
    where: {
      workOrderItemId: workOrderItem.id,
    },
    include: {
      TypesettingOptions: true,
      TypesettingProofs: true,
    },
  });

  for (const typesetting of typesettings) {
    const newTypesetting = await prismaClient.typesetting.create({
      data: {
        approved: typesetting.approved,
        cost: typesetting.cost,
        dateIn: typesetting.dateIn,
        followUpNotes: typesetting.followUpNotes,
        plateRan: typesetting.plateRan,
        prepTime: typesetting.prepTime,
        status: typesetting.status,
        timeIn: typesetting.timeIn,
        orderItemId: orderItem.id,
        createdById: userId,
      }
    });

    // Copy TypesettingOptions
    for (const option of typesetting.TypesettingOptions) {
      await prismaClient.typesettingOption.create({
        data: {
          typesettingId: newTypesetting.id,
          option: option.option,
          selected: option.selected,
          createdById: userId,
        }
      });
    }

    // Copy TypesettingProofs
    for (const proof of typesetting.TypesettingProofs) {
      await prismaClient.typesettingProof.create({
        data: {
          typesettingId: newTypesetting.id,
          proofNumber: proof.proofNumber,
          dateSubmitted: proof.dateSubmitted,
          notes: proof.notes,
          approved: proof.approved,
          proofCount: proof.proofCount,
          proofMethod: proof.proofMethod,
          createdById: userId,
        }
      });
    }
  }
  console.log('Typesettings copied to Order Item');
}

// Create an address record for an office
async function createAddress(officeId: string) {
  return await prismaClient.address.create({
    data: {
      officeId,
      line1: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country(),
      telephoneNumber: faker.phone.number(),
      addressType: randomElementFromArray(Object.values(AddressType)),
    },
  });
}

async function createAdminUser() {
  const hashedPassword = await hashPassword("your-password");
  const user = await prismaClient.user.create({
    data: {
      name: "Jason Shultz",
      email: "jason.shultz@1905newmedia.com",
      Roles: {
        connect: [{ name: "Admin" }],
      },
    },
  });
}

// Create a company
async function createCompany() {
  return await prismaClient.company.create({
    data: {
      name: faker.company.name(),
    },
  });
}

// Create an Internal User, not addociated with a company.
async function createInternalUsers() {
  // Creating internal users with different roles
  const internalRoles: RoleName[] = [
    "Admin",
    "Bindery",
    "Finance",
    "Manager",
    "Prepress",
    "Production",
    "Sales",
  ];
  try {
    await Promise.all(internalRoles.map(roleName => createUser(roleName, null)));
  } catch (error) {
    console.error(error);
  }
}

// Create an office for a company
async function createOffice(companyId: string, userId: string) {
  return await prismaClient.office.create({
    data: {
      companyId,
      name: faker.company.name(),
      createdById: userId, // Add the missing createdById property
    },
  });
}

async function createProcessingOptions(workOrderItemId: string, userId: string) {
  const processingOptions = await prismaClient.processingOptions.create({
    data: {
      binding: randomElementFromArray(Object.values(BindingType)),
      binderyTime: faker.number.int({ min: 0, max: 100 }),
      createdById: userId,
      cutting: faker.lorem.sentence(),
      description: faker.lorem.sentence(),
      drilling: faker.lorem.sentence(),
      folding: faker.lorem.sentence(),
      name: faker.lorem.sentence(),
      numberingColor: randomElementFromArray(inkColors),
      numberingEnd: randomInt + randomInt,
      numberingStart: randomInt,
      other: faker.lorem.sentence(),
      padding: faker.lorem.sentence(),
      stitching: faker.lorem.sentence(),
      workOrderItemId,
    },
  });
  console.log('Processing Options created');
  return processingOptions.id;
}

async function createRolesAndPermissions() {
  // Permissions array
  const permissions = [
    { name: "address_create", description: "Create address" },
    { name: "address_delete", description: "Delete address" },
    { name: "address_read", description: "Read address" },
    { name: "address_update", description: "Update address" },
    { name: "company_create", description: "Create company" },
    { name: "company_delete", description: "Delete company" },
    { name: "company_read", description: "Read company" },
    { name: "company_update", description: "Update company" },
    { name: "invoice_create", description: "Create invoice" },
    { name: "invoice_delete", description: "Delete invoice" },
    { name: "invoice_read", description: "Read invoice" },
    { name: "office_change_status", description: "Change office status" },
    { name: "office_create", description: "Create office" },
    { name: "office_delete", description: "Delete office" },
    { name: "office_read", description: "Read office" },
    { name: "office_update", description: "Update office" },
    { name: "order_change_status", description: "Change order status" },
    { name: "order_create", description: "Create order" },
    { name: "order_delete", description: "Delete order" },
    { name: "order_item_create", description: "Create order item" },
    { name: "order_item_delete", description: "Delete order item" },
    { name: "order_item_read", description: "Read order item" },
    { name: "order_item_update", description: "Update order item" },
    {
      name: "order_payment_change_status",
      description: "Change order payment status",
    },
    { name: "order_payment_create", description: "Create order payment" },
    { name: "order_payment_delete", description: "Delete order payment" },
    { name: "order_payment_read", description: "Read order payment" },
    { name: "order_payment_update", description: "Update order payment" },
    { name: "order_read", description: "Read order" },
    {
      name: "order_shipping_info_create",
      description: "Create order shipping info",
    },
    {
      name: "order_shipping_info_delete",
      description: "Delete order shipping info",
    },
    {
      name: "order_shipping_info_read",
      description: "Read order shipping info",
    },
    {
      name: "order_shipping_info_update",
      description: "Update order shipping info",
    },
    { name: "order_update", description: "Update order" },
    { name: "typesetting_create", description: "Create typesetting" },
    { name: "typesetting_delete", description: "Delete typesetting" },
    {
      name: "typesetting_option_create",
      description: "Create typesetting option",
    },
    {
      name: "typesetting_option_delete",
      description: "Delete typesetting option",
    },
    { name: "typesetting_option_read", description: "Read typesetting option" },
    {
      name: "typesetting_option_update",
      description: "Update typesetting option",
    },
    {
      name: "typesetting_proof_create",
      description: "Create typesetting proof",
    },
    { name: "typesetting_proof_read", description: "Read typesetting proof" },
    {
      name: "typesetting_proof_update",
      description: "Update typesetting proof",
    },
    { name: "typesetting_read", description: "Read typesetting" },
    { name: "typesetting_update", description: "Update typesetting" },
    { name: "user_create", description: "Create user" },
    { name: "user_delete", description: "Delete user" },
    { name: "user_read", description: "Read user" },
    { name: "user_update", description: "Update user" },
    {
      name: "work_order_change_status",
      description: "Change work order status",
    },
    { name: "work_order_create", description: "Create work order" },
    { name: "work_order_delete", description: "Delete work order" },
    { name: "work_order_item_create", description: "Create work order item" },
    { name: "work_order_item_delete", description: "Delete work order item" },
    { name: "work_order_item_read", description: "Read work order item" },
    { name: "work_order_item_update", description: "Update work order item" },
    { name: "work_order_read", description: "Read work order" },
    { name: "work_order_update", description: "Update work order" },
  ];

  // Bulk create permissions with upsert to avoid duplicates
  await Promise.all(
    permissions.map((permission) =>
      prismaClient.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission,
      }),
    ),
  );
  console.log("Permissions created");

  // Roles and their associated permissions
  const roles = [
    {
      name: "Admin",
      Permissions: [
        { name: "address_create" },
        { name: "address_read" },
        { name: "address_update" },
        { name: "address_delete" },
        { name: "company_create" },
        { name: "company_read" },
        { name: "company_update" },
        { name: "company_delete" },
        { name: "invoice_create" },
        { name: "invoice_delete" },
        { name: "invoice_read" },
        { name: "office_create" },
        { name: "office_read" },
        { name: "office_update" },
        { name: "office_delete" },
        { name: "office_change_status" },
        { name: "order_create" },
        { name: "order_read" },
        { name: "order_update" },
        { name: "order_delete" },
        { name: "order_change_status" },
        { name: "order_item_create" },
        { name: "order_item_read" },
        { name: "order_item_update" },
        { name: "order_item_delete" },
        { name: "order_payment_create" },
        { name: "order_payment_read" },
        { name: "order_payment_update" },
        { name: "order_payment_delete" },
        { name: "order_payment_change_status" },
        { name: "order_shipping_info_create" },
        { name: "order_shipping_info_read" },
        { name: "order_shipping_info_update" },
        { name: "order_shipping_info_delete" },
        { name: "typesetting_create" },
        { name: "typesetting_read" },
        { name: "typesetting_update" },
        { name: "typesetting_delete" },
        { name: "typesetting_option_create" },
        { name: "typesetting_option_read" },
        { name: "typesetting_option_update" },
        { name: "typesetting_option_delete" },
        { name: "typesetting_proof_create" },
        { name: "typesetting_proof_read" },
        { name: "typesetting_proof_update" },
        { name: "user_create" },
        { name: "user_read" },
        { name: "user_update" },
        { name: "user_delete" },
        { name: "work_order_create" },
        { name: "work_order_read" },
        { name: "work_order_update" },
        { name: "work_order_delete" },
        { name: "work_order_change_status" },
        { name: "work_order_item_create" },
        { name: "work_order_item_read" },
        { name: "work_order_item_update" },
        { name: "work_order_item_delete" },
      ],
    },
    {
      name: "Bindery",
      Permissions: [
        { name: "order_read" },
        { name: "order_item_read" },
        { name: "order_shipping_info_read" },
        { name: "order_change_status" },
        { name: "work_order_read" },
        { name: "work_order_item_read" },
      ],
    },
    {
      name: "Customer",
      Permissions: [
        { name: "address_read" },
        { name: "company_read" },
        { name: "office_read" },
        { name: "order_read" },
        { name: "order_item_read" },
        { name: "order_shipping_info_read" },
        { name: "work_order_read" },
        { name: "work_order_item_read" },
        { name: "order_payment_create" },
        { name: "order_payment_read" },
        { name: "typesetting_read" },
        { name: "typesetting_option_read" },
        { name: "typesetting_proof_read" },
      ],
    },
    {
      name: "Finance",
      Permissions: [
        { name: "address_read" },
        { name: "company_read" },
        { name: "invoice_create" },
        { name: "invoice_delete" },
        { name: "invoice_read" },
        { name: "office_read" },
        { name: "order_read" },
        { name: "order_update" },
        { name: "order_payment_create" },
        { name: "order_change_status" },
        { name: "order_payment_read" },
        { name: "order_payment_update" },
        { name: "order_payment_delete" },
        { name: "order_payment_change_status" },
        { name: "work_order_read" },
        { name: "work_order_change_status" },
      ],
    },
    {
      name: "Manager",
      Permissions: [
        { name: "address_create" },
        { name: "address_delete" },
        { name: "address_read" },
        { name: "address_update" },
        { name: "company_read" },
        { name: "company_update" },
        { name: "invoice_create" },
        { name: "invoice_delete" },
        { name: "invoice_read" },
        { name: "office_change_status" },
        { name: "office_create" },
        { name: "office_delete" },
        { name: "office_read" },
        { name: "office_update" },
        { name: "order_change_status" },
        { name: "order_item_read" },
        { name: "order_item_update" },
        { name: "order_payment_change_status" },
        { name: "order_payment_delete" },
        { name: "order_payment_read" },
        { name: "order_payment_update" },
        { name: "order_read" },
        { name: "order_shipping_info_read" },
        { name: "order_shipping_info_update" },
        { name: "order_update" },
        { name: "work_order_change_status" },
        { name: "work_order_item_read" },
        { name: "work_order_item_update" },
        { name: "work_order_read" },
        { name: "work_order_update" },
      ],
    },
    {
      name: "Prepress",
      Permissions: [
        { name: "address_read" },
        { name: "order_read" },
        { name: "order_item_read" },
        { name: "order_shipping_info_read" },
        { name: "order_change_status" },
        { name: "work_order_read" },
        { name: "work_order_item_read" },
      ],
    },
    {
      name: "Production",
      Permissions: [
        { name: "address_read" },
        { name: "order_read" },
        { name: "order_item_read" },
        { name: "order_shipping_info_read" },
        { name: "order_change_status" },
        { name: "work_order_read" },
        { name: "work_order_item_read" },
      ],
    },
    {
      name: "Sales",
      Permissions: [
        { name: "address_create" },
        { name: "address_delete" },
        { name: "address_read" },
        { name: "address_update" },
        { name: "order_change_status" },
        { name: "order_create" },
        { name: "order_item_create" },
        { name: "order_item_read" },
        { name: "order_read" },
        { name: "order_shipping_info_create" },
        { name: "order_shipping_info_delete" },
        { name: "order_shipping_info_read" },
        { name: "order_shipping_info_update" },
        { name: "order_update" },
        { name: "typesetting_create" },
        { name: "typesetting_delete" },
        { name: "typesetting_option_create" },
        { name: "typesetting_option_delete" },
        { name: "typesetting_option_read" },
        { name: "typesetting_option_update" },
        { name: "typesetting_proof_create" },
        { name: "typesetting_proof_read" },
        { name: "typesetting_proof_update" },
        { name: "typesetting_update" },
        { name: "user_create" },
        { name: "user_read" },
        { name: "user_update" },
        { name: "work_order_change_status" },
        { name: "work_order_create" },
        { name: "work_order_delete" },
        { name: "work_order_item_create" },
        { name: "work_order_item_delete" },
        { name: "work_order_item_read" },
        { name: "work_order_item_update" },
        { name: "work_order_read" },
      ],
    },
    {
      name: "User",
      Permissions: [
        { name: "address_create" },
        { name: "address_delete" },
        { name: "address_read" },
        { name: "address_update" },
        { name: "company_read" },
        { name: "office_read" },
        { name: "office_update" },
        { name: "order_item_read" },
        { name: "order_payment_create" },
        { name: "order_payment_read" },
        { name: "order_read" },
        { name: "order_shipping_info_read" },
        { name: "typesetting_option_read" },
        { name: "typesetting_proof_read" },
        { name: "typesetting_read" },
        { name: "work_order_item_read" },
        { name: "work_order_read" },
      ],
    },
  ];

  // Create roles with associated permissions
  for (const role of roles) {
    await prismaClient.role.create({
      data: {
        name: role.name as RoleName,
        Permissions: {
          connect: role.Permissions.map((perm) => ({ name: perm.name })),
        },
      },
    });
    console.log(`Role created: ${role.name}`);
  }

  console.log("Roles created with associated permissions");
}

// Create ShippingInfo record for a work order:
// officeId is the office to which the shipping info belongs
// workOrderId is the work order to which the shipping info belongs
// addressId: take the addressId from the first address created for the office.
// This function returns the ID of the created shipping info record
async function createShippingInfo(officeId: string, userId: string) {
  const office = await prismaClient.office.findUnique({
    where: { id: officeId },
    include: { Addresses: true },
  });

  if (!office || !office.Addresses.length) {
    throw new Error("Office or address not found");
  }

  const shippingMethod = randomElementFromArray(Object.values(ShippingMethod));

  const shippingInfo = await prismaClient.shippingInfo.create({
    data: {
      numberOfPackages: faker.datatype.number({ min: 1, max: 10 }),
      instructions: faker.lorem.sentence(),
      shippingOther: faker.lorem.sentence(),
      shippingDate: faker.date.future(),
      shippingMethod,
      shippingCost: faker.number.float({ min: 10, max: 100, precision: 2 }),
      officeId,
      shippingNotes: faker.lorem.sentence(),
      shipToSameAsBillTo: faker.datatype.boolean(),
      attentionTo: faker.person.fullName(),
      addressId: office.Addresses[0]?.id,
      createdById: userId,
      estimatedDelivery: faker.date.future(),
      trackingNumber: faker.string.alphanumeric(10),
    },
  });

  // If the shipping method is pickup, create a ShippingPickup record
  if (shippingMethod === ShippingMethod.Pickup) {
    await prismaClient.shippingPickup.create({
      data: {
        shippingInfoId: shippingInfo.id,
        pickupDate: faker.date.future(),
        pickupTime: faker.date.future().toTimeString().slice(0, 5),
        notes: faker.lorem.sentence(),
        contactName: faker.person.fullName(),
        contactPhone: faker.phone.number(),
        createdById: userId,
      },
    });
  }

  console.log(`Shipping Info created: ${shippingInfo.id}`);
  return shippingInfo.id;
}

// Create Typesetting record for a work order:
async function createTypesetting(workOrderItemId: string, userId: string) {
  const typesetting = await prismaClient.typesetting.create({
    data: {
      approved: faker.datatype.boolean(),
      cost: faker.number.float({ min: 50, max: 200, precision: 2 }),
      dateIn: faker.date.past(),
      followUpNotes: faker.lorem.sentence(),
      plateRan: faker.word.sample(),
      prepTime: faker.number.int({ min: 0, max: 100 }),
      status: randomElementFromArray(Object.values(TypesettingStatus)),
      timeIn: faker.date.recent().toLocaleTimeString(),
      workOrderItemId,
      createdById: userId, // Add the createdById property
    },
  });

  console.log(`Typesetting created: ${typesetting.id}`);
  return typesetting.id;
}

// Create a TypesettingOption record for a typesetting record.
async function createTypesettingOption(typesettingId: string, userId: string) {
  await prismaClient.typesettingOption.create({
    data: {
      typesettingId,
      option: randomElementFromArray(typesettingOptions),
      selected: faker.datatype.boolean(),
      createdById: userId,
    },
  });
  console.log('Typesetting Option created');
}

// Create a TypesettingProof record for a typesetting record.
async function createTypesettingProof(typesettingId: string, proofNumber: number, userId: string) {
  await prismaClient.typesettingProof.create({
    data: {
      typesettingId,
      proofNumber,
      proofCount: faker.number.int({ min: 1, max: 5 }),
      proofMethod: randomElementFromArray(proofTypes),
      dateSubmitted: faker.date.past(),
      notes: faker.lorem.sentence(),
      approved: faker.datatype.boolean(),
      createdById: userId,
    },
  });
  console.log(`Typesetting Proof created.`);
}

// Create a User record with a specific role and optionally office.
async function createUser(roleName: RoleName, officeId: string | null = null) {
  const hashedPassword = await hashPassword("your-password");

  // First, find the role by its name
  const role = await prismaClient.role.findUnique({
    where: {
      name: roleName, // Make sure roleName matches one of the RoleName enum values
    },
  });

  // Ensure the role exists before attempting to create a user and connect them
  if (!role) {
    console.error(`Role not found: ${roleName}`);
    return;
  }

  // Create the user
  // if officeId is null, the user is an internal user
  // if officeId is not null, the user is an external user
  // if officeId is null, then ignore the officeId field in the data object
  if (officeId === null) {
    console.log("officeId is null, this is an internal user.");
  } else {
    console.log("officeId ", officeId ?? null);
  }
  const user = await prismaClient.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      // ignore officeID field if officeId is null
      officeId: officeId,
      // Correct way to connect the user to roles in a many-to-many relationship
      Roles: {
        connect: [{ id: role.id }], // Use the role's ID directly for connecting
      },
    },
  });

  console.log(`User created: ${user.name}`);
}

// Create Users for an office
async function createUsers(officeId: string) {
  // Creating internal users with different roles
  // officeID is the office to which the user belongs and is required..
  const internalRoles: RoleName[] = [
    "Admin",
    "Bindery",
    "Finance",
    "Manager",
    "Prepress",
    "Production",
    "Sales",
  ] as RoleName[];

  try {
    await Promise.all(internalRoles.map(roleName => createUser(roleName, officeId)));
  } catch (error) {
    console.error(error);
  }
}

// Create a work order
async function createWorkOrder(officeId: string, shippingInfoId: string) {
  const internalUsers = await prismaClient.user.findMany({
    where: {
      Roles: { some: { NOT: { name: "Customer" } } }
    },
  });
  const officeUsers = await prismaClient.user.findMany({ where: { officeId } });

  const randomOfficeUser = randomElementFromArray(officeUsers);
  const randomUser = randomElementFromArray(internalUsers);

  if (!randomUser || !randomOfficeUser) {
    throw new Error("No users found to create work order");
  }

  const workOrder = await prismaClient.workOrder.create({
    data: {
      officeId,
      dateIn: faker.date.past(),
      inHandsDate: faker.date.future(),
      estimateNumber: String(faker.number.int({ min: 500, max: 30000 })),
      purchaseOrderNumber: faker.number.int().toString(),
      version: 1,
      status: randomElementFromArray(workOrderStatuses),
      shippingInfoId,
      contactPersonId: randomOfficeUser.id,
      createdById: randomUser.id,
      invoicePrintEmail: randomElementFromArray(Object.values(InvoicePrintEmailOptions)),
      workOrderNumber: faker.number.int({ min: 1000, max: 9999 }),
    },
  });

  console.log(`Work Order created: ${workOrder.estimateNumber}`);
  return workOrder;
}

// Create work order items
async function createWorkOrderItems(workOrderId: string, itemCount: number, userId: string) {
  for (let i = 0; i < itemCount; i++) {
    const cost = faker.number.float({ min: 50, max: 200, precision: 2 });
    const amount = cost * 1.3;

    const workOrderItem = await prismaClient.workOrderItem.create({
      data: {
        workOrderId,
        amount: new Prisma.Decimal(amount),
        cost: new Prisma.Decimal(cost),
        customerSuppliedStock: faker.helpers.arrayElement(csOptions),
        description: faker.commerce.productDescription(),
        expectedDate: faker.date.future(),
        ink: faker.helpers.arrayElement(inkColors),
        other: faker.commerce.productMaterial(),
        prepTime: faker.number.int({ min: 0, max: 100 }),
        size: faker.helpers.arrayElement(sizes),
        specialInstructions: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(workOrderItemStatuses),
        createdById: userId,
        artwork: {
          create: {
            fileUrl: faker.image.url(),
            description: faker.lorem.sentence(),
          },
        },
      },
    });

    await createWorkOrderStock(workOrderItem.id, userId);
    const typeSettingID = await createTypesetting(workOrderItem.id, userId);
    await createTypesettingOption(typeSettingID, userId);

    const numberOfProofs = faker.number.int({ min: 1, max: 5 });
    for (let i = 0; i < numberOfProofs; i++) {
      await createTypesettingProof(typeSettingID, i + 1, userId);
    }

    await createProcessingOptions(workOrderItem.id, userId);
  }
}

// Create work order notes
async function createWorkOrderNotes(workOrderId: string, noteCount: number, userId: string) {
  // Fetch internal users (assuming they don't have the 'Customer' role)
  const internalUsers = await prismaClient.user.findMany({
    where: {
      Roles: {
        some: {
          NOT: {
            name: "Customer",
          },
        },
      },
    },
  });

  for (let i = 0; i < noteCount; i++) {
    // Randomly select an internal user
    const randomUser = randomElementFromArray(internalUsers);
    if (!randomUser) {
      console.warn("No internal users found to create work order note");
      continue; // Skip this iteration
    }

    const workOrderNote = await prismaClient.workOrderNote.create({
      data: {
        workOrderId,
        note: faker.lorem.sentence(),
        createdById: randomUser.id, // Correct field based on your schema's relation
        createdAt: faker.date.past(),
      },
    });

    console.log(`Work Order Note created: ${workOrderNote.note}`);
  }
}

// Create a WorkOrderStock record
async function createWorkOrderStock(workOrderItemId: string, userId: string) {
  const stockQty = faker.number.int({ min: 1, max: 1000 });
  const costPerM = faker.number.float({ min: 50, max: 200, precision: 2 });
  const totalCost = stockQty * costPerM;
  console.log('workOrderItemId', workOrderItemId)
  return await prismaClient.workOrderItemStock.create({
    data: {
      workOrderItemId,
      stockQty,
      costPerM,
      totalCost,
      from: faker.company.name(),
      expectedDate: faker.date.future(),
      orderedDate: faker.date.past(),
      received: faker.datatype.boolean(),
      receivedDate: faker.date.past(),
      notes: faker.lorem.sentence(),
      stockStatus: randomElementFromArray(Object.values(StockStatus)),
      createdById: userId, // Add the createdById property
    },
  });
}

// Create work order versions
async function createWorkOrderVersions(workOrderId: string) {
  const numberOfVersions = faker.number.int({ min: 1, max: 5 });

  for (let i = 0; i < numberOfVersions; i++) {
    await prismaClient.workOrderVersion.create({
      data: {
        workOrderId,
        version: i + 2, // Assuming version 1 is the initial work order
        createdBy: faker.person.fullName(),
        createdAt: faker.date.past(),
      },
    });
  }
}

// Utility function to hash passwords
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function seed() {
  try {
    await createRolesAndPermissions();
    await createInternalUsers();
    await createAdminUser();

    const companyCount = 10;
    for (let companyIndex = 0; companyIndex < companyCount; companyIndex++) {
      console.log(`Creating company ${companyIndex + 1} of ${companyCount}`);
      const company = await createCompany();

      const numOffices = faker.number.int({ min: 1, max: 4 });
      for (let officeIndex = 0; officeIndex < numOffices; officeIndex++) {
        const internalUser = await prismaClient.user.findFirst({
          where: { Roles: { some: { name: "Sales" } } },
        });

        if (!internalUser) {
          console.warn("No internal user with the 'Sales' role found.");
          continue;
        }

        const office = await createOffice(company.id, internalUser.id);

        const numAddresses = faker.number.int({ min: 1, max: 2 });
        await Promise.all(Array(numAddresses).fill(null).map(() => createAddress(office.id)));

        await createUsers(office.id);

        const numberOfWorkOrders = faker.number.int({ min: 1, max: 9 });
        for (let workOrderIndex = 0; workOrderIndex < numberOfWorkOrders; workOrderIndex++) {
          const shippingInfoId = await createShippingInfo(office.id, internalUser.id);
          const workOrder = await createWorkOrder(office.id, shippingInfoId);

          if (workOrder) {
            await createWorkOrderItems(
              workOrder.id,
              faker.number.int({ min: MIN_ITEM_COUNT, max: MAX_ITEM_COUNT }),
              workOrder.createdById,
            );
            await createWorkOrderNotes(
              workOrder.id,
              faker.number.int({ min: MIN_NOTE_COUNT, max: MAX_NOTE_COUNT }),
              workOrder.createdById,
            );
            await createWorkOrderVersions(workOrder.id);

            if (workOrder.status === "Approved") {
              await prismaClient.$transaction(async () => {
                await convertWorkOrderToOrder(workOrder.id, office.id);
              });
            }
          } else {
            console.warn("Failed to create work order.");
          }
        }
      }
    }

    console.log("Database has been seeded successfully.");
  } catch (error) {
    console.error("Error seeding the database:", error);
    process.exit(1);
  } finally {
    await prismaClient.$disconnect();
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
