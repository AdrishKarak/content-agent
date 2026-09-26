import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { runGenerationPipeline } from "@/lib/agents/graph";

export const briefRouter = router({
  submit: publicProcedure
    .input(z.object({ rawBriefText: z.string().min(5) }))
    .mutation(async ({ ctx, input }) => {
      const result = await runGenerationPipeline({
        rawBriefText: input.rawBriefText,
        userId: ctx.userId || "demo_content_manager",
      });
      return result;
    }),

  get: publicProcedure
    .input(z.object({ briefId: z.string() }))
    .query(async ({ ctx, input }) => {
      const brief = await ctx.prisma.brief.findUnique({
        where: { id: input.briefId },
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
      return brief;
    }),

  list: publicProcedure
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
