import { z } from "zod";
import { router, protectedProcedure } from "./trpc";
import { AssetStatus } from "@prisma/client";
import { publishScheduledAsset } from "@/lib/agents/publisher";
import { TRPCError } from "@trpc/server";

export const publisherRouter = router({
  schedule: protectedProcedure
    .input(
      z.object({
        assetId: z.string(),
        scheduledAt: z.string(), // ISO string
      })
    )
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.prisma.contentAsset.findFirst({
        where: { id: input.assetId, brief: { userId: ctx.userId } },
      });

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found or access denied.",
        });
      }

      if (asset.status !== AssetStatus.APPROVED) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Auto-disqualifier protection: Cannot schedule an asset that has not been explicitly APPROVED.",
        });
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

  batchSchedule: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            assetId: z.string(),
            scheduledAt: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const results = [];
      for (const item of input.items) {
        const asset = await ctx.prisma.contentAsset.findFirst({
          where: { id: item.assetId, brief: { userId: ctx.userId } },
        });

        if (!asset || asset.status !== AssetStatus.APPROVED) {
          continue;
        }

        const scheduled = await ctx.prisma.scheduledPost.upsert({
          where: { assetId: asset.id },
          create: {
            assetId: asset.id,
            scheduledAt: new Date(item.scheduledAt),
          },
          update: {
            scheduledAt: new Date(item.scheduledAt),
          },
        });

        await ctx.prisma.contentAsset.update({
          where: { id: asset.id },
          data: { status: AssetStatus.SCHEDULED },
        });

        results.push(scheduled);
      }
      return results;
    }),

  publishNow: protectedProcedure
    .input(z.object({ scheduledPostId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const scheduled = await ctx.prisma.scheduledPost.findFirst({
        where: { id: input.scheduledPostId, asset: { brief: { userId: ctx.userId } } },
      });

      if (!scheduled) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Scheduled post not found or access denied.",
        });
      }

      const result = await publishScheduledAsset(input.scheduledPostId);
      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error || "Failed to publish post",
        });
      }
      return result;
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.scheduledPost.findMany({
      where: {
        asset: {
          brief: {
            userId: ctx.userId, // Strict user isolation
          },
        },
      },
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

  approvedAssets: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.contentAsset.findMany({
      where: {
        status: AssetStatus.APPROVED,
        brief: {
          userId: ctx.userId, // Strict user isolation
        },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        brief: true,
      },
    });
  }),
});

