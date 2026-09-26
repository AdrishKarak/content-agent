import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { ApprovalDecision, AssetStatus } from "@prisma/client";
import { regenerateAsset } from "@/lib/agents/graph";

export const approvalRouter = router({
  decide: publicProcedure
    .input(
      z.object({
        assetId: z.string(),
        decision: z.enum(["APPROVE", "REJECT", "REGENERATE"]),
        feedback: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.prisma.contentAsset.findUnique({
        where: { id: input.assetId },
      });

      if (!asset) {
        throw new Error("Asset not found");
      }

      const decidedBy = ctx.userId || "demo_content_manager";

      // 1. Record in append-only Approval table
      const approval = await ctx.prisma.approval.create({
        data: {
          assetId: asset.id,
          assetVersion: asset.version,
          decision: input.decision as ApprovalDecision,
          feedback: input.feedback,
          decidedBy,
        },
      });

      // 2. Handle state transitions
      if (input.decision === "APPROVE") {
        await ctx.prisma.contentAsset.update({
          where: { id: asset.id },
          data: { status: AssetStatus.APPROVED },
        });
        return { approval, status: AssetStatus.APPROVED };
      }

      if (input.decision === "REJECT") {
        await ctx.prisma.contentAsset.update({
          where: { id: asset.id },
          data: { status: AssetStatus.REJECTED },
        });
        return { approval, status: AssetStatus.REJECTED };
      }

      // REGENERATE decision
      const regenerated = await regenerateAsset({
        assetId: asset.id,
        feedback: input.feedback,
        target: "both",
      });

      return { approval, regeneratedAsset: regenerated };
    }),

  pendingQueue: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.contentAsset.findMany({
      where: {
        status: {
          in: [AssetStatus.PENDING_APPROVAL, AssetStatus.REJECTED],
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        brief: true,
        complianceChecks: true,
        approvals: {
          orderBy: { decidedAt: "desc" },
        },
      },
    });
  }),
});
