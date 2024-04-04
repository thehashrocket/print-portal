import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { orderNoteRouter } from "./routers/orders/orderNotes";
import { orderRouter } from "./routers/orders/order";
import { postRouter } from "~/server/api/routers/post";
import { userRouter } from "~/server/api/routers/user";
import { workOrderNoteRouter } from "./routers/workOrders/workOrderNote";
import { workOrderRouter } from "./routers/workOrders/workOrder";
import { processingOptionsRouter } from "./routers/shared/processingOptions";
import { typesettingRouter } from "./routers/shared/typesetting/typesetting";
import { typesettingOptionsRouter } from "./routers/shared/typesetting/typesettingOptions";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  orders: orderRouter,
  orderNotes: orderNoteRouter,
  post: postRouter,
  processingOptions: processingOptionsRouter,
  typesetting: typesettingRouter,
  typesettingOptions: typesettingOptionsRouter,
  users: userRouter,
  workOrderNotes: workOrderNoteRouter,
  workOrders: workOrderRouter,
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
