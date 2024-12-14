import {
  AddressType,
  BindingType,
  InvoicePrintEmailOptions,
  type OrderItem,
  OrderItemStatus,
  OrderStatus,
  PaymentMethod,
  Prisma,
  PrismaClient,
  ProofMethod,
  type RoleName,
  ShippingMethod,
  StockStatus,
  TypesettingStatus,
  type WorkOrderItem,
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

// Create roles and permissions
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

// Utility function to hash passwords
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function seed() {
  try {
    await createRolesAndPermissions();
    await createAdminUser();

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
