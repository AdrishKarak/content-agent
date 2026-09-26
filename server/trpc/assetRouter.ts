import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { regenerateAsset } from "@/lib/agents/graph";

export const assetRouter = router({
  getById: publicProcedure
    .input(z.object({ assetId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.contentAsset.findUnique({
        where: { id: input.assetId },
        include: {
          brief: true,
          complianceChecks: true,
          approvals: {
            orderBy: { decidedAt: "desc" },
          },
          scheduledPost: true,
        },
      });
    }),

  regenerate: publicProcedure
    .input(
      z.object({
        assetId: z.string(),
        feedback: z.string().optional(),
        target: z.enum(["copy", "image", "both"]).default("both"),
      })
    )
    .mutation(async ({ input }) => {
      return regenerateAsset({
        assetId: input.assetId,
        feedback: input.feedback,
        target: input.target,
      });
    }),
});
