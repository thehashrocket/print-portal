import { userRouter } from "~/server/api/routers/user";
import { orderRouter } from "./routers/order";
import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { workOrderRouter } from "./routers/workOrder";
import { workOrderNoteRouter } from "./routers/workOrderNote";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  orders: orderRouter,
  post: postRouter,
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
