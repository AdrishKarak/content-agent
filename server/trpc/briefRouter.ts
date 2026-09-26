import { z } from "zod";
import { router, protectedProcedure } from "./trpc";
import { runGenerationPipeline } from "@/lib/agents/graph";
import { TRPCError } from "@trpc/server";

export const briefRouter = router({
  submit: protectedProcedure
    .input(z.object({ rawBriefText: z.string().min(5) }))
    .mutation(async ({ ctx, input }) => {
      const result = await runGenerationPipeline({
        rawBriefText: input.rawBriefText,
        userId: ctx.userId,
      });
      return result;
    }),

  get: protectedProcedure
    .input(z.object({ briefId: z.string() }))
    .query(async ({ ctx, input }) => {
      const brief = await ctx.prisma.brief.findFirst({
        where: { id: input.briefId, userId: ctx.userId },
        include: {
          assets: {
            include: {
              complianceChecks: true,
              approvals: {
                orderBy: { decidedAt: "desc" },
              },
            },
          },
        },
      });

      if (!brief) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign brief not found or access denied.",
        });
      }

      return brief;
    }),

  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      return ctx.prisma.brief.findMany({
        where: { userId: ctx.userId },
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          assets: {
            select: {
              id: true,
              channel: true,
              status: true,
              imageUrl: true,
            },
          },
        },
      });
    }),
});
