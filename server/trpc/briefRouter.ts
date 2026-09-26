import { z } from "zod";
import { router, protectedProcedure, generationProcedure } from "./trpc";
import { runGenerationPipeline } from "@/lib/agents/graph";
import { sanitizePromptText } from "@/lib/security/sanitize";
import { TRPCError } from "@trpc/server";

export const briefRouter = router({
  submit: generationProcedure
    .input(z.object({ rawBriefText: z.string().min(5).max(4000).trim() }))
    .mutation(async ({ ctx, input }) => {
      const sanitizedText = sanitizePromptText(input.rawBriefText, 4000);
      const result = await runGenerationPipeline({
        rawBriefText: sanitizedText,
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
