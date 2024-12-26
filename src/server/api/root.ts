import { addressRouter } from "./routers/shared/address";
import { companyRouter } from "./routers/companies/company";
import { contactRouter } from "./routers/contacts/contact";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { invoiceRouter } from "./routers/invoices/invoice";
import { officeRouter } from "./routers/offices/office";
import { orderItemRouter } from "./routers/orderItems/orderItem";
import { orderNoteRouter } from "./routers/orders/orderNotes";
import { orderPaymentRouter } from "./routers/orderPayments/orderPayment";
import { orderRouter } from "./routers/orders/order";
import { postRouter } from "~/server/api/routers/post";
import { rolesRouter } from "./routers/roles/roles";
import { orderItemStockRouter } from "./routers/orderItemStocks/orderItemStock";
import { paperProductsRouter } from "./routers/shared/paperProducts/paperProducts";
import { qbAuthRouter } from "./routers/quickbooks/qbAuth";
import { qbCompanyRouter } from "./routers/quickbooks/qbCompany";
import { qbCustomerRouter } from "./routers/quickbooks/qbCustomer";
import { qbInvoiceRouter } from "./routers/quickbooks/qbInvoice";
import { qbSyncCustomerRouter } from "./routers/quickbooks/qbSyncCustomer";
import { processingOptionsRouter } from "./routers/shared/processingOptions";
import { shippingInfoRouter } from "./routers/shared/shippingInfo";
import { shippingPickupRouter } from "./routers/shared/shippingPickup";
import { typesettingOptionsRouter } from "./routers/shared/typesetting/typesettingOptions";
import { typesettingProofsRouter } from "./routers/shared/typesetting/typesettingProofs";
import { typesettingRouter } from "./routers/shared/typesetting/typesetting";
import { userManagementRouter } from "./routers/userManagement/userManagement";
import { userRouter } from "~/server/api/routers/user";
import { workOrderItemStockRouter } from "./routers/workOrderItemStocks/workOrderItemStock";
import { workOrderItemRouter } from "./routers/workOrderItems/workOrderItem";
import { workOrderNoteRouter } from "./routers/workOrders/workOrderNote";
import { workOrderRouter } from "./routers/workOrders/workOrder";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  addresses: addressRouter,
  companies: companyRouter,
  contacts: contactRouter,
  invoices: invoiceRouter,
  offices: officeRouter,
  orders: orderRouter,
  orderItems: orderItemRouter,
  orderItemStocks: orderItemStockRouter,
  orderNotes: orderNoteRouter,
  orderPayments: orderPaymentRouter,
  paperProducts: paperProductsRouter,
  post: postRouter,
  processingOptions: processingOptionsRouter,
  qbAuth: qbAuthRouter,
  qbCompany: qbCompanyRouter,
  qbCustomers: qbCustomerRouter,
  qbInvoices: qbInvoiceRouter,
  qbSyncCustomers: qbSyncCustomerRouter,
  roles: rolesRouter,
  shippingInfo: shippingInfoRouter,
  shippingPickups: shippingPickupRouter,
  typesettings: typesettingRouter,
  typesettingOptions: typesettingOptionsRouter,
  typesettingProofs: typesettingProofsRouter,
  userManagement: userManagementRouter,
  users: userRouter,
  workOrderNotes: workOrderNoteRouter,
  workOrders: workOrderRouter,
  workOrderItems: workOrderItemRouter,
  workOrderItemStocks: workOrderItemStockRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
