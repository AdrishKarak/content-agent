import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { recordPostMetric, parseAndIngestMetricsCsv } from "@/lib/agents/analyticsAgent";

export const metricsRouter = router({
  generateDemoMetrics: publicProcedure
    .input(z.object({ publishedPostId: z.string() }))
    .mutation(async ({ input }) => {
      return recordPostMetric({
        publishedPostId: input.publishedPostId,
      });
    }),

  uploadCsv: publicProcedure
    .input(z.object({ csvContent: z.string().min(5) }))
    .mutation(async ({ input }) => {
      return parseAndIngestMetricsCsv(input.csvContent);
    }),
});
