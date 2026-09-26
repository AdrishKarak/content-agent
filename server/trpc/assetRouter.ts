import { z } from "zod";
import { router, protectedProcedure, generationProcedure } from "./trpc";
import { regenerateAsset } from "@/lib/agents/graph";
import { sanitizePromptText } from "@/lib/security/sanitize";
import { TRPCError } from "@trpc/server";

export const assetRouter = router({
  getById: protectedProcedure
    .input(z.object({ assetId: z.string().min(1).max(100) }))
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

  regenerate: generationProcedure
    .input(
      z.object({
        assetId: z.string().min(1).max(100),
        feedback: z.string().max(1000).trim().optional(),
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

      const sanitizedFeedback = input.feedback
        ? sanitizePromptText(input.feedback, 1000)
        : undefined;

      return regenerateAsset({
        assetId: input.assetId,
        feedback: sanitizedFeedback,
        target: input.target,
      });
    }),
});
