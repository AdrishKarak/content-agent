import { z } from "zod";
import { router, protectedProcedure, rateLimitedProcedure } from "./trpc";
import { recordPostMetric, parseAndIngestMetricsCsv } from "@/lib/agents/analyticsAgent";
import { TRPCError } from "@trpc/server";

export const metricsRouter = router({
  generateDemoMetrics: rateLimitedProcedure
    .input(z.object({ publishedPostId: z.string().min(1).max(100).trim() }))
    .mutation(async ({ ctx, input }) => {
      const pub = await ctx.prisma.publishedPost.findFirst({
        where: {
          mockPlatformPostId: input.publishedPostId,
          scheduledPost: {
            asset: {
              brief: { userId: ctx.userId }, // Strict user isolation
            },
          },
        },
      });

      if (!pub) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Published post not found or access denied.",
        });
      }

      return recordPostMetric({
        publishedPostId: input.publishedPostId,
      });
    }),

  uploadCsv: rateLimitedProcedure
    .input(z.object({ csvContent: z.string().min(5).max(100000) }))
    .mutation(async ({ input }) => {
      return parseAndIngestMetricsCsv(input.csvContent);
    }),
});
