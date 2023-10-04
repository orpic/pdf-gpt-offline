import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
export const appRouter = router({
  // ...
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = getUser();

    if (!user.id || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" });

    // check database if not create them
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      // create a user in database
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return { success: true };
  }),
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
