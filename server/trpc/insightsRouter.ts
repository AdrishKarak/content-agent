import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { generateWeeklyReport } from "@/lib/agents/insightAgent";

export const insightsRouter = router({
  crossPlatformComparison: publicProcedure
    .input(z.object({ briefId: z.string() }))
    .query(async ({ ctx, input }) => {
      const brief = await ctx.prisma.brief.findUnique({
        where: { id: input.briefId },
        include: {
          assets: {
            include: {
              scheduledPost: {
                include: {
                  publishedPost: {
                    include: {
                      metrics: {
                        orderBy: { ingestedAt: "desc" },
                        take: 1,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!brief) return null;

      // Group metrics side by side by channel (AC 14.1)
      const comparison = brief.assets.map((asset) => {
        const pub = asset.scheduledPost?.publishedPost;
        const metric = pub?.metrics[0] ?? null;
        return {
          channel: asset.channel,
          assetId: asset.id,
          copy: asset.copyBn || asset.copyEn || "",
          imageUrl: asset.imageUrl,
          publishedPostId: pub?.mockPlatformPostId,
          metrics: metric
            ? {
                views: metric.views,
                likes: metric.likes,
                shares: metric.shares,
                comments: metric.comments,
                source: metric.source,
                engagementRate:
                  metric.views > 0
                    ? Number(
                        (((metric.likes + metric.shares + metric.comments) / metric.views) * 100).toFixed(2)
                      )
                    : 0,
              }
            : null,
        };
      });

      return {
        brief,
        comparison,
      };
    }),

  weeklyReports: publicProcedure
    .input(
      z
        .object({
          limit: z.number().default(10),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      return ctx.prisma.weeklyReport.findMany({
        take: limit,
        orderBy: { generatedAt: "desc" },
        include: {
          insightEmbeddings: true,
        },
      });
    }),

  generateReport: publicProcedure
    .input(
      z.object({
        periodStart: z.string(),
        periodEnd: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return generateWeeklyReport({
        periodStart: new Date(input.periodStart),
        periodEnd: new Date(input.periodEnd),
      });
    }),
});
