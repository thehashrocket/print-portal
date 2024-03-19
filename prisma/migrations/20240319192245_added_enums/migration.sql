-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('Billing', 'Shipping', 'Mailing', 'Other');

-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('Admin', 'Bindery', 'Customer', 'Finance', 'Manager', 'Prepress', 'Production', 'Sales', 'User');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Draft', 'Proofing', 'Approved', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('Cash', 'Check', 'CreditCard', 'DebitCard', 'PayPal', 'Venmo', 'Zelle');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Paid', 'Unpaid', 'Partial', 'Pending', 'Overdue', 'Refunded');

-- CreateEnum
CREATE TYPE "PermissionName" AS ENUM ('CreateAddress', 'CreateApiKey', 'CreateCompany', 'CreateInvitation', 'CreateOffice', 'CreateOrder', 'CreateOrderItem', 'CreatePasswordReset', 'CreateProcessingOptions', 'CreateRole', 'CreateShippingInfo', 'CreateTypesetting', 'CreateUser', 'CreateWorkOrder', 'DeleteAddress', 'DeleteApiKey', 'DeleteCompany', 'DeleteInvitation', 'DeleteOffice', 'DeleteOrder', 'DeleteOrderItem', 'DeletePasswordReset', 'DeleteProcessingOptions', 'DeleteRole', 'DeleteShippingInfo', 'DeleteTypesetting', 'DeleteUser', 'DeleteWorkOrder', 'UpdateAddress', 'UpdateApiKey', 'UpdateCompany', 'UpdateInvitation', 'UpdateOffice', 'UpdateOrder', 'UpdateOrderItem', 'UpdatePasswordReset', 'UpdateProcessingOptions', 'UpdateRole', 'UpdateShippingInfo', 'UpdateTypesetting', 'UpdateUser', 'UpdateWorkOrder');

-- CreateEnum
CREATE TYPE "ProofType" AS ENUM ('Digital', 'HardCopy', 'PDF', 'Other');

-- CreateEnum
CREATE TYPE "ShippingMethod" AS ENUM ('Courier', 'Deliver', 'DHL', 'FedEx', 'Other', 'UPS', 'USPS');

-- CreateEnum
CREATE TYPE "ShippingType" AS ENUM ('Residential', 'Commercial', 'Other');

-- CreateEnum
CREATE TYPE "StaticRoles" AS ENUM ('ADMIN', 'BINDERY', 'CUSTOMER', 'FINANCE', 'MANAGER', 'PREPRESS', 'PRODUCTION', 'SALES', 'USER');

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('InStock', 'OnHand', 'CS', 'Ordered', 'OutOfStock', 'LowStock');

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "Post_name_idx" ON "Post"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
