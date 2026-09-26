import { z } from "zod";
import { router, protectedProcedure } from "./trpc";
import { regenerateAsset } from "@/lib/agents/graph";
import { TRPCError } from "@trpc/server";

export const assetRouter = router({
  getById: protectedProcedure
    .input(z.object({ assetId: z.string() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.prisma.contentAsset.findFirst({
        where: {
          id: input.assetId,
          brief: { userId: ctx.userId }, // Strict user isolation
        },
        include: {
          brief: true,
          complianceChecks: true,
          approvals: {
            orderBy: { decidedAt: "desc" },
          },
          scheduledPost: true,
        },
      });

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found or access denied.",
        });
      }

      return asset;
    }),

  regenerate: protectedProcedure
    .input(
      z.object({
        assetId: z.string(),
        feedback: z.string().optional(),
        target: z.enum(["copy", "image", "both"]).default("both"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.prisma.contentAsset.findFirst({
        where: {
          id: input.assetId,
          brief: { userId: ctx.userId }, // Strict user isolation
        },
      });

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found or access denied.",
        });
      }

      return regenerateAsset({
        assetId: input.assetId,
        feedback: input.feedback,
        target: input.target,
      });
    }),
});
