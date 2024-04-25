import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { WorkOrderStatus } from "@prisma/client";
import { OrderStatus } from "@prisma/client";
const prismaClient = new PrismaClient();
const randomElementFromArray = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

const addressTypes = ["Billing", "Shipping", "Mailing", "Other"];
const csOptions = ["C1", "C2", "C3", "C4", "C5", "C6"];
const inkColors = ["Black", "Cyan", "Magenta", "Yellow", "White"];
const paymentStatuses = ["Pending", "Paid", "Overdue", "Refunded"];
const paymentTypes = ["Credit Card", "Check", "Cash", "Wire Transfer"];
const randomInt = faker.number.int({ min: 0, max: 100 });
const sizes = ["Small", "Medium", "Large"];
const shippingMethods = ["UPS", "FedEx", "USPS", "DHL"];
const workOrderStatuses = Object.values(WorkOrderStatus);
const orderStatuses = Object.values(OrderStatus);
const typesettingOptions = ["Negs", "Xante", "7200", "9200"];

const currentDate = new Date();
const maxFutureDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 7 days from today

// Convert a work order to an order
async function convertWorkOrderToOrder(workOrderId, officeId) {
  console.log('Converting Work Order to Order');
  // Find the work order
  const workOrder = await prismaClient.workOrder.findUnique({
    where: {
      id: workOrderId,
    }
  });
  const order = await prismaClient.order.create({
    data: {
      approved: faker.datatype.boolean(),
      artwork: workOrder?.artwork,
      binderyTime: workOrder?.binderyTime,
      costPerM: workOrder?.costPerM,
      deposit: workOrder?.deposit,
      description: workOrder?.description,
      expectedDate: workOrder?.expectedDate,
      officeId,
      overUnder: workOrder?.overUnder,
      plateRan: workOrder?.plateRan,
      prepTime: workOrder?.prepTime,
      pressRun: workOrder?.pressRun,
      proofCount: faker.number.int({ min: 1, max: 5 }),
      proofType: faker.word.sample(),
      shippingInfoId: workOrder.shippingInfoId,
      specialInstructions: workOrder?.specialInstructions,
      status: randomElementFromArray(orderStatuses),
      totalCost: workOrder?.totalCost,
      userId: workOrder.userId,
      workOrderId,
      version: 1,
    },
  });
  console.log('Order created: ', order.id);
  console.log('converting work order items to order items');
  // Convert work order items to order items
  const workOrderItems = await prismaClient.workOrderItem.findMany({
    where: {
      workOrderId,
    },
  });

  workOrderItems.forEach(async (workOrderItem) => {
    await prismaClient.orderItem.create({
      data: {
        amount: workOrderItem.amount,
        cs: workOrderItem.cs,
        cutting: workOrderItem.cutting,
        description: workOrderItem.description,
        drilling: workOrderItem.drilling,
        finishedQty: workOrderItem.finishedQty,
        folding: workOrderItem.folding,
        inkColor: workOrderItem.inkColor,
        other: workOrderItem.other,
        orderId: order.id,
        pressRun: workOrderItem.pressRun,
        quantity: workOrderItem.quantity,
        size: workOrderItem.size,
        stockOnHand: workOrderItem.stockOnHand,
        stockOrdered: workOrderItem.stockOrdered,
      }
    });
    console.log('Order Item created');
  });

  const processingOptions = await prismaClient.processingOptions.findMany({
    where: {
      workOrderId,
    },
  });

  processingOptions.forEach(async (processingOption) => {
    await prismaClient.processingOptions.create({
      data: {
        cutting: processingOption.cutting,
        drilling: processingOption.drilling,
        folding: processingOption.folding,
        numberingColor: processingOption.numberingColor,
        numberingEnd: processingOption.numberingEnd,
        numberingStart: processingOption.numberingStart,
        other: processingOption.other,
        orderId: order.id,
        padding: processingOption.padding,
      }
    });
    console.log('Processing Option created');
  });

  const typesettings = await prismaClient.typesetting.findMany({
    where: {
      workOrderId,
    },
  });

  typesettings.forEach(async (typesetting) => {
    {
      await prismaClient.typesetting.update({
        data: {
          orderId: order.id,
        },
        where: {
          id: typesetting.id,
        }
      });
      console.log('Typesetting created');
    }
  });

  const workOrderStocks = await prismaClient.workOrderStock.findMany({
    where: {
      workOrderId,
    },
  });

  workOrderStocks.forEach(async (workOrderStock) => {
    await prismaClient.orderStock.create({
      data: {
        costPerM: workOrderStock.costPerM,
        expectedDate: workOrderStock.expectedDate,
        from: workOrderStock.from,
        notes: workOrderStock.notes,
        orderedDate: workOrderStock.orderedDate,
        orderId: order.id,
        received: workOrderStock.received,
        receivedDate: workOrderStock.receivedDate,
        stockQty: workOrderStock.stockQty,
        stockStatus: workOrderStock.stockStatus,
        totalCost: workOrderStock.totalCost,
      }
    });
    console.log('Order Stock created');
  });


  return order;
}

// Create an address record for an office
async function createAddress(officeId) {
  return await prismaClient.address.create({
    data: {
      officeId,
      line1: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country(),
      telephoneNumber: faker.phone.number(),
      addressType: randomElementFromArray(addressTypes),
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
  const internalRoles = [
    "Admin",
    "Bindery",
    "Finance",
    "Manager",
    "Prepress",
    "Production",
    "Sales",
  ];
  // loop through the internal roles and create a user for each role
  for (let i = 0; i < internalRoles.length; i++) {
    const roleName = internalRoles[i];
    await createUser(roleName, null);
  }
  console.log("Internal users created");
}

// Create an office for a company
async function createOffice(companyId) {
  return await prismaClient.office.create({
    data: {
      companyId,
      name: faker.company.name(),
      // Additional data if needed
    },
  });
}

async function createProcessingOptions(workOrderId) {
  const processingOptions = await prismaClient.processingOptions.create({
    data: {
      workOrderId,
      cutting: faker.datatype.boolean(),
      padding: faker.datatype.boolean(),
      drilling: faker.datatype.boolean(),
      folding: faker.datatype.boolean(),
      other: faker.lorem.sentence(),
      numberingStart: randomInt,
      numberingEnd: randomInt,
      numberingColor: randomElementFromArray(inkColors),
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
        name: role.name,
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
async function createShippingInfo(officeId) {
  // Find office by officeId
  const office = await prismaClient.office.findUnique({
    where: {
      id: officeId,
    },
    include: {
      Addresses: true,
    },
  });

  // Create shipping info using faker for demo data
  const shippingInfo = await prismaClient.shippingInfo.create({
    data: {
      instructions: faker.lorem.sentence(),
      shippingOther: faker.lorem.sentence(),
      shippingDate: faker.date.future(),
      shippingMethod: randomElementFromArray(shippingMethods),
      shippingCost: faker.number.float({ min: 10, max: 100, precision: 2 }),
      officeId,
      shipToSameAsBillTo: faker.datatype.boolean(),
      attentionTo: faker.person.fullName(),
      addressId: office.Addresses[0].id, // Assuming the office has at least one address
    },
  });

  console.log(`Shipping Info created: ${shippingInfo.id}`);
  return shippingInfo.id;
}


// Create Typesetting record for a work order:
async function createTypesetting(workOrderId) {
  const typesetting = await prismaClient.typesetting.create({
    data: {
      workOrderId,
      dateIn: faker.date.past(),
      timeIn: faker.date.recent().toLocaleTimeString(),
      cost: faker.number.float({ min: 50, max: 200, precision: 2 }),
      approved: faker.datatype.boolean(),
      prepTime: faker.number.int({ min: 0, max: 100 }),
      plateRan: faker.word.sample(),
    },
  });

  console.log(`Typesetting created: ${typesetting.id}`);
  return typesetting.id;
}

// Create a TypesettingOption record for a typesetting record.
async function createTypesettingOption(typesettingId) {
  await prismaClient.typesettingOption.create({
    data: {
      typesettingId,
      option: randomElementFromArray(typesettingOptions),
      selected: faker.datatype.boolean(),
    },
  });
  console.log('Typesetting Option created');
}

// Create a TypesettingProof record for a typesetting record.
async function createTypesettingProof(typesettingId, proofNumber) {
  await prismaClient.typesettingProof.create({
    data: {
      typesettingId,
      proofNumber,
      dateSubmitted: faker.date.past(),
      notes: faker.lorem.sentence(),
      approved: faker.datatype.boolean(),
    },
  });
  console.log(`Typesetting Proof created.`);
}

// Create a User record with a specific role and optionally office.
async function createUser(roleName, officeId = null) {
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
  console.log("officeId ", officeId ?? null);
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
async function createUsers(officeId) {
  // Creating internal users with different roles
  // officeID is the office to which the user belongs and is required..
  const internalRoles = [
    "Admin",
    "Bindery",
    "Finance",
    "Manager",
    "Prepress",
    "Production",
    "Sales",
  ];
  for (let i = 0; i < 15; i++) {
    const roleName =
      i < internalRoles.length
        ? internalRoles[i % internalRoles.length]
        : "User";
    await createUser(roleName, officeId);
  }

  // Creating external users
  for (let i = 0; i < 5; i++) {
    await createUser("User", officeId);
  }
}

// Create a work order
async function createWorkOrder(officeId, shippingInfoId) {
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

  const randomUser = randomElementFromArray(internalUsers);

  const workOrder = await prismaClient.workOrder.create({
    data: {
      officeId,
      dateIn: faker.date.past(),
      inHandsDate: faker.date.future(),
      estimateNumber: String(faker.number.int({ min: 500, max: 30000 })),
      purchaseOrderNumber: faker.number.int().toString(),
      pressRun: faker.word.sample(),
      specialInstructions: faker.lorem.sentence(),
      artwork: faker.internet.url(),
      approved: faker.datatype.boolean(),
      prepTime: faker.number.int({ min: 0, max: 100 }),
      plateRan: faker.word.sample(),
      expectedDate: faker.date.between(currentDate, maxFutureDate),
      deposit: faker.number.int({ min: 100, max: 500 }) + 0.01,
      costPerM: faker.number.int({ min: 50, max: 200 }) + 0.02,
      totalCost: faker.number.int({ min: 500, max: 10000 }) + 0.03,
      binderyTime: faker.word.sample(),
      overUnder: faker.word.sample(),
      version: 1,
      description: faker.commerce.productName(),
      status: randomElementFromArray(workOrderStatuses),
      shippingInfoId,
      userId: randomUser.id, // Correct field based on your schema's relation
    },
  });
  console.log(`Work Order created: ${workOrder.estimateNumber}`);

  return workOrder;
}

// Create work order items
async function createWorkOrderItems(workOrderId: string, itemCount: number) {
  // Create multiple work order items based on the itemCount
  for (let i = 0; i < itemCount; i++) {
    const workOrderItem = await prismaClient.workOrderItem.create({
      data: {
        workOrderId: workOrderId,
        amount: parseFloat(faker.commerce.price()),
        cs: randomElementFromArray(csOptions),
        cutting: faker.commerce.productMaterial(),
        description: faker.commerce.productName(),
        drilling: faker.commerce.department(),
        finishedQty: faker.number.int({ min: 1, max: 1000 }),
        folding: faker.commerce.productMaterial(),
        inkColor: randomElementFromArray(inkColors),
        other: faker.commerce.productMaterial(),
        pressRun: faker.commerce.productMaterial(),
        quantity: faker.number.int({ min: 1, max: 1000 }),
        size: randomElementFromArray(sizes),
        stockOnHand: faker.datatype.boolean(),
        stockOrdered: faker.datatype.boolean()
          ? faker.commerce.product()
          : null,
      },
    });

    console.log(`Work Order Item created: ${workOrderItem.description}`);
  }
}

// Create work order notes
async function createWorkOrderNotes(workOrderId: string, noteCount: number) {
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

    const workOrderNote = await prismaClient.workOrderNote.create({
      data: {
        workOrderId,
        note: faker.lorem.sentence(),
        userId: randomUser.id, // Correct field based on your schema's relation
        createdAt: faker.date.past(),
      },
    });

    console.log(`Work Order Note created: ${workOrderNote.note}`);
  }
}

// Create a WorkOrderStock record
async function createWorkOrderStock(workOrderId) {
  const stockQty = faker.number.int({ min: 1, max: 1000 });
  const costPerM = faker.number.float({ min: 50, max: 200, precision: 2 });
  const totalCost = stockQty * costPerM;

  return await prismaClient.workOrderStock.create({
    data: {
      workOrderId,
      stockQty,
      costPerM,
      totalCost,
      from: faker.company.name(),
      expectedDate: faker.date.future(),
      orderedDate: faker.date.past(),
      received: faker.datatype.boolean(),
      receivedDate: faker.date.past(),
      notes: faker.lorem.sentence(),
      stockStatus: randomElementFromArray([
        "InStock",
        "OnHand",
        "CS",
        "Ordered",
        "OutOfStock",
        "LowStock",
      ]),
    },
  });
}

async function createWorkOrderVersions(workOrderId) {
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
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function seed() {
  await createRolesAndPermissions();

  await createInternalUsers();

  await createAdminUser();

  for (let i = 0; i < 5; i++) {
    // Create 5 companies
    const company = await createCompany();
    const numOffices = faker.number.int({ min: 1, max: 3 });

    for (let j = 0; j < numOffices; j++) {
      // Create 1-3 offices per company
      const office = await createOffice(company.id);
      const numAddresses = faker.number.int({ min: 1, max: 2 });

      for (let k = 0; k < numAddresses; k++) {
        // Create 1-2 addresses per office
        await createAddress(office.id);
      }

      await createUsers(office.id); // Create users for each office
    }
  }

  // Iterate over offices to create work orders
  const offices = await prismaClient.office.findMany();
  for (const office of offices) {
    const numberOfWorkOrders = faker.number.int({ min: 1, max: 9 });
    for (let j = 0; j < numberOfWorkOrders; j++) {
      // Create a shipping info record for each work order
      const shippingInfoId = await createShippingInfo(office.id);
      const workOrder = await createWorkOrder(office.id, shippingInfoId);
      await createWorkOrderItems(
        workOrder.id,
        faker.number.int({ min: 1, max: 5 }),
      );
      await createWorkOrderNotes(
        workOrder.id,
        faker.number.int({ min: 1, max: 5 }),
      );
      await createWorkOrderVersions(workOrder.id);

      await createWorkOrderStock(workOrder.id);

      const typeSettingID = await createTypesetting(workOrder.id);
      await createTypesettingOption(typeSettingID);

      // Create 1-5 typesetting proofs for each typesetting record
      const numberOfProofs = faker.number.int({ min: 1, max: 5 });
      for (let i = 0; i < numberOfProofs; i++) {
        await createTypesettingProof(typeSettingID, i + 1);
      }

      await createProcessingOptions(workOrder.id);

      const numberOfWorkOrderNotes = faker.number.int({ min: 1, max: 5 });

      // If the order has an approved status, convert it to an order
      if (workOrder.status == "Approved") {
        await convertWorkOrderToOrder(workOrder.id, office.id);
      }
    }
  }

  console.log("Database has been seeded.");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
