import { z } from "zod";
import { router, protectedProcedure } from "./trpc";
import { ApprovalDecision, AssetStatus } from "@prisma/client";
import { regenerateAsset } from "@/lib/agents/graph";
import { TRPCError } from "@trpc/server";

export const approvalRouter = router({
  decide: protectedProcedure
    .input(
      z.object({
        assetId: z.string(),
        decision: z.enum(["APPROVE", "REJECT", "REGENERATE"]),
        feedback: z.string().optional(),
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

      const decidedBy = ctx.userId;

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

  pendingQueue: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.contentAsset.findMany({
      where: {
        status: {
          in: [AssetStatus.PENDING_APPROVAL, AssetStatus.REJECTED],
        },
        brief: {
          userId: ctx.userId, // Strict user isolation
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
