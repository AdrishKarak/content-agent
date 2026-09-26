import { initTRPC, TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/security/rateLimiter";

export interface Context {
  userId: string | null;
  prisma: typeof prisma;
}

export async function createContext(): Promise<Context> {
  let userId: string | null = null;
  try {
    const clerkAuth = await auth();
    userId = clerkAuth.userId || null;
  } catch (err) {
    console.warn("[tRPC Context] Could not extract Clerk auth:", err);
    userId = null;
  }

  return {
    userId,
    prisma,
  };
}

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    // In production, mask raw database or internal errors to prevent information disclosure
    const isProduction = process.env.NODE_ENV === "production";
    const isInternal = error.code === "INTERNAL_SERVER_ERROR";

    return {
      ...shape,
      message:
        isProduction && isInternal
          ? "An unexpected internal server error occurred. Our engineering team has been alerted."
          : error.message,
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Standard Protected Procedure:
 * Requires authenticated Clerk session.
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required. Please sign in to access this resource.",
    });
  }

  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

/**
 * Rate-Limited Generation Procedure:
 * Enforces strict 6 requests/minute ceiling per user for expensive AI synthesis tasks.
 */
export const generationProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const rateLimit = checkRateLimit({
    key: `generation:${ctx.userId}`,
    limit: 6,
    windowMs: 60000, // 60 seconds
  });

  if (!rateLimit.success) {
    const waitSec = Math.ceil(rateLimit.resetInMs / 1000);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit reached for studio generations. Please wait ${waitSec}s before submitting again.`,
    });
  }

  return next({ ctx });
});

/**
 * Rate-Limited Modification Procedure:
 * Protects mutations (publishing, approvals, CSV ingest) with a 30 req/min limit.
 */
export const rateLimitedProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const rateLimit = checkRateLimit({
    key: `mutation:${ctx.userId}`,
    limit: 30,
    windowMs: 60000,
  });

  if (!rateLimit.success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Request velocity limit exceeded. Please slow down.",
    });
  }

  return next({ ctx });
});
