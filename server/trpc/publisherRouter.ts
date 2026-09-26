import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { AssetStatus } from "@prisma/client";
import { publishScheduledAsset } from "@/lib/agents/publisher";

export const publisherRouter = router({
  schedule: publicProcedure
    .input(
      z.object({
        assetId: z.string(),
        scheduledAt: z.string(), // ISO string
      })
    )
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.prisma.contentAsset.findUnique({
        where: { id: input.assetId },
      });

      if (!asset) throw new Error("Asset not found");
      if (asset.status !== AssetStatus.APPROVED) {
        throw new Error(
          "Auto-disqualifier protection: Cannot schedule an asset that has not been explicitly APPROVED."
        );
      }

      // Upsert scheduled post
      const scheduled = await ctx.prisma.scheduledPost.upsert({
        where: { assetId: asset.id },
        create: {
          assetId: asset.id,
          scheduledAt: new Date(input.scheduledAt),
        },
        update: {
          scheduledAt: new Date(input.scheduledAt),
        },
      });

      await ctx.prisma.contentAsset.update({
        where: { id: asset.id },
        data: { status: AssetStatus.SCHEDULED },
      });

      return scheduled;
    }),

  publishNow: publicProcedure
    .input(z.object({ scheduledPostId: z.string() }))
    .mutation(async ({ input }) => {
      const result = await publishScheduledAsset(input.scheduledPostId);
      if (!result.success) {
        throw new Error(result.error || "Failed to publish post");
      }
      return result;
    }),

  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.scheduledPost.findMany({
      orderBy: { scheduledAt: "desc" },
      include: {
        asset: {
          include: {
            brief: true,
          },
        },
        publishedPost: {
          include: {
            metrics: {
              orderBy: { ingestedAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });
  }),
});
