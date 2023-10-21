import { TRPCError, initTRPC } from "@trpc/server";
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create();
const middleware = t.middleware;
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */

const isAuth = middleware(async (opts) => {
  return opts.next({
    ctx: {
      user: 1,
      isLoggedIn: true,
    },
  });
});
export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);
