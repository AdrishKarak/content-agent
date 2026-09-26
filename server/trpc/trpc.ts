import { initTRPC, TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export interface Context {
  userId: string | null;
  prisma: typeof prisma;
}

export async function createContext(): Promise<Context> {
  let userId: string | null = null;
  try {
    const clerkAuth = await auth();
    userId = clerkAuth.userId;
  } catch {
    // In dev or non-auth environment, fallback to demo user
    userId = "demo_content_manager";
  }

  return {
    userId: userId || "demo_content_manager",
    prisma,
  };
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be signed in." });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
