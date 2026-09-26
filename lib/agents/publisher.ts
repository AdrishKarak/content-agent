import { prisma } from "../prisma";
import { AppChannel, fromDbChannel, MOCK_PUBLISHERS } from "../channels";
import { runComplianceCheck } from "./complianceCheck";

export interface PublishExecutionResult {
  success: boolean;
  publishedPostId?: string;
  mockPlatformPostId?: string;
  error?: string;
}

/**
 * Publisher Agent — executes mock publication at scheduled time (or triggered).
 * Enforces second-layer constraint re-validation (AC 12.2).
 * Verifies explicit human approval gate (AC 8.1).
 */
export async function publishScheduledAsset(
  scheduledPostId: string
): Promise<PublishExecutionResult> {
  const scheduledPost = await prisma.scheduledPost.findUnique({
    where: { id: scheduledPostId },
    include: {
      asset: {
        include: {
          approvals: {
            orderBy: { decidedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!scheduledPost) {
    return { success: false, error: "Scheduled post not found" };
  }

  const asset = scheduledPost.asset;

  // Strict approval gate check (AC 8.1)
  const latestApproval = asset.approvals[0];
  if (!latestApproval || latestApproval.decision !== "APPROVE") {
    return {
      success: false,
      error: "Cannot publish: Asset has not received an explicit human approval (AC 8.1)",
    };
  }

  const channel: AppChannel = fromDbChannel(asset.channel);

  // Second-layer deterministic constraint check at publish time (AC 12.2)
  const compliance = runComplianceCheck({
    channel,
    copy: asset.copyBn || asset.copyEn || "",
    cta: asset.cta || "",
    hashtags: asset.hashtags,
    imageUrl: asset.imageUrl || undefined,
  });

  if (!compliance.passed) {
    const reasons = compliance.failures.map((f) => `${f.rule}: ${f.reason}`).join("; ");
    // Mark asset as rejected due to publish constraint violation
    await prisma.contentAsset.update({
      where: { id: asset.id },
      data: { status: "REJECTED" },
    });
    return {
      success: false,
      error: `Publisher adapter rejected post due to constraint violation: ${reasons}`,
    };
  }

  // Call channel mock publish adapter
  const publisherFn = MOCK_PUBLISHERS[channel];
  const publishOutcome = await publisherFn({
    copy: asset.copyBn || asset.copyEn || "",
    hashtags: asset.hashtags,
    imageUrl: asset.imageUrl || undefined,
  });

  if (!publishOutcome.success || !publishOutcome.platformPostId) {
    return {
      success: false,
      error: publishOutcome.error || "Channel mock publisher failed",
    };
  }

  // Record PublishedPost in database and update asset status
  const publishedPost = await prisma.publishedPost.create({
    data: {
      scheduledPostId: scheduledPost.id,
      mockPlatformPostId: publishOutcome.platformPostId,
      publishedAt: publishOutcome.publishedAt,
    },
  });

  await prisma.contentAsset.update({
    where: { id: asset.id },
    data: { status: "PUBLISHED" },
  });

  return {
    success: true,
    publishedPostId: publishedPost.id,
    mockPlatformPostId: publishedPost.mockPlatformPostId,
  };
}
