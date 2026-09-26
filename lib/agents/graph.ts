import { prisma } from "../prisma";
import { AppChannel, toDbChannel, fromDbChannel } from "../channels/types";
import { analyzeBrief, CampaignSpec } from "./briefAnalyzer";
import { generateChannelContent } from "./contentGenerator";
import { generateImageForChannel } from "./imageAgent";
import { runComplianceCheck, ComplianceFailure } from "./complianceCheck";
import { retrieveRelevantInsights } from "./insightAgent";
import { Language, AssetStatus, AssetType } from "@prisma/client";

export interface PipelineExecutionOptions {
  briefId?: string;
  rawBriefText: string;
  userId: string;
}

export interface PipelineResult {
  briefId: string;
  spec: CampaignSpec;
  retrievedInsights: string[];
  assets: Array<{
    id: string;
    channel: AppChannel;
    copyBn?: string;
    copyEn?: string;
    cta?: string;
    hashtags: string[];
    imageUrl?: string;
    imagePrompt?: string;
    status: AssetStatus;
    compliancePassed: boolean;
    complianceFailures: ComplianceFailure[];
  }>;
}

/**
 * Executes the complete synchronous Generative Studio pipeline:
 * 1. Brief Analyzer Agent -> Campaign Spec
 * 2. Retrieve similar past insights (pgvector)
 * 3. Content Generator Agent (per channel, Bengali + English native)
 * 4. Bengali Nativeness Guardrail (runtime check + auto retry)
 * 5. Image Agent (per channel, distinct prompts & aspect ratios)
 * 6. Deterministic Compliance Check
 * 7. Persist records in Postgres with status PENDING_APPROVAL or REJECTED
 */
export async function runGenerationPipeline(
  options: PipelineExecutionOptions
): Promise<PipelineResult> {
  const { rawBriefText, userId } = options;

  // 1. Brief Analysis
  const spec = await analyzeBrief(rawBriefText);

  // 2. Retrieve past insights via pgvector embeddings (ADR-008, closing the loop)
  const retrievedInsights = await retrieveRelevantInsights(rawBriefText, 3);

  // 3. Persist Brief record in database
  let dbLang: Language = Language.BOTH;
  if (spec.language === "bn") dbLang = Language.BN;
  if (spec.language === "en") dbLang = Language.EN;

  const brief = await prisma.brief.create({
    data: {
      userId,
      rawBriefText,
      genre: spec.genre,
      targetAudience: spec.targetAudience,
      language: dbLang,
      tone: spec.tone,
      targetChannels: spec.targetChannels.map(toDbChannel),
    },
  });

  const createdAssets: PipelineResult["assets"] = [];

  // 4. Generate Content & Visuals per channel
  for (const channel of spec.targetChannels) {
    try {
      // 4a. Copy generation
      const content = await generateChannelContent({
        spec,
        channel,
        retrievedInsights,
      });

      // 4b. Image generation (distinct per channel, ADR-002)
      const visual = await generateImageForChannel(spec, channel);

      // 4c. Deterministic compliance check (ADR-005)
      const compliance = runComplianceCheck({
        channel,
        copy: content.copyBn || content.copyEn || "",
        cta: content.cta,
        hashtags: content.hashtags,
        imageUrl: visual.url,
      });

      const initialStatus: AssetStatus = compliance.passed
        ? AssetStatus.PENDING_APPROVAL
        : AssetStatus.REJECTED;

      // 4d. Persist ContentAsset in Postgres
      const dbChannel = toDbChannel(channel);
      const asset = await prisma.contentAsset.create({
        data: {
          briefId: brief.id,
          channel: dbChannel,
          type: AssetType.COPY, // Contains copy and image
          version: 1,
          copyBn: content.copyBn,
          copyEn: content.copyEn,
          cta: content.cta,
          hashtags: content.hashtags,
          imageUrl: visual.url,
          imagePrompt: visual.prompt,
          bengaliNativenessPassed: content.bengaliNativeness?.passed ?? null,
          bengaliNativenessAttempt: content.bengaliNativenessAttempt,
          status: initialStatus,
          complianceChecks: {
            create: compliance.failures.map((f) => ({
              rule: f.rule,
              passed: false,
              reason: f.reason,
            })),
          },
        },
      });

      createdAssets.push({
        id: asset.id,
        channel,
        copyBn: content.copyBn,
        copyEn: content.copyEn,
        cta: content.cta,
        hashtags: content.hashtags,
        imageUrl: visual.url,
        imagePrompt: visual.prompt,
        status: initialStatus,
        compliancePassed: compliance.passed,
        complianceFailures: compliance.failures,
      });
    } catch (channelErr) {
      console.error(`[Pipeline] Failed generation for channel ${channel}:`, channelErr);
    }
  }

  return {
    briefId: brief.id,
    spec,
    retrievedInsights,
    assets: createdAssets,
  };
}

/**
 * Regenerates an existing asset with reviewer feedback (ADR-009).
 * Increments version, incorporates feedback note into prompt.
 * Capped at 2 automatic regeneration attempts.
 */
export async function regenerateAsset(params: {
  assetId: string;
  feedback?: string;
  target: "copy" | "image" | "both";
}) {
  const asset = await prisma.contentAsset.findUnique({
    where: { id: params.assetId },
    include: { brief: true },
  });

  if (!asset) throw new Error("Asset not found");

  // Regeneration cap check (ADR-009: max 2 automatic attempts before manual editing required)
  if (asset.version >= 3) {
    throw new Error(
      "Regeneration limit reached (max 2 attempts). Manual editing is required to prevent unbounded loops."
    );
  }

  const channel: AppChannel = fromDbChannel(asset.channel);
  const spec: CampaignSpec = {
    genre: asset.brief.genre || "Drama",
    targetAudience: asset.brief.targetAudience || "General",
    language: (asset.brief.language.toLowerCase() as "bn" | "en" | "both") || "both",
    tone: asset.brief.tone || "Engaging",
    targetChannels: [channel],
  };

  let copyBn = asset.copyBn;
  let copyEn = asset.copyEn;
  let cta = asset.cta || "";
  let hashtags = asset.hashtags;
  let imageUrl = asset.imageUrl;
  let imagePrompt = asset.imagePrompt;
  let nativenessPassed = asset.bengaliNativenessPassed;

  if (params.target === "copy" || params.target === "both") {
    const newContent = await generateChannelContent({
      spec,
      channel,
      regenerationFeedback: params.feedback,
    });
    copyBn = newContent.copyBn || copyBn;
    copyEn = newContent.copyEn || copyEn;
    cta = newContent.cta || cta;
    hashtags = newContent.hashtags;
    nativenessPassed = newContent.bengaliNativeness?.passed ?? null;
  }

  if (params.target === "image" || params.target === "both") {
    const newVisual = await generateImageForChannel(spec, channel, params.feedback);
    imageUrl = newVisual.url;
    imagePrompt = newVisual.prompt;
  }

  // Re-run compliance check on regenerated asset
  const compliance = runComplianceCheck({
    channel,
    copy: copyBn || copyEn || "",
    cta,
    hashtags,
    imageUrl: imageUrl || undefined,
  });

  const nextStatus: AssetStatus = compliance.passed
    ? AssetStatus.PENDING_APPROVAL
    : AssetStatus.REJECTED;

  // Update asset with new version
  return prisma.contentAsset.update({
    where: { id: asset.id },
    data: {
      version: asset.version + 1,
      copyBn,
      copyEn,
      cta,
      hashtags,
      imageUrl,
      imagePrompt,
      bengaliNativenessPassed: nativenessPassed,
      status: nextStatus,
      complianceChecks: {
        create: compliance.failures.map((f) => ({
          rule: f.rule,
          passed: false,
          reason: f.reason,
        })),
      },
    },
    include: {
      complianceChecks: true,
      approvals: true,
    },
  });
}
