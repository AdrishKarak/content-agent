import { z } from "zod";
import { generateWithGemini } from "../ai/gemini";
import { cleanAndParseJson } from "../guardrails/outputValidation";
import { checkBengaliNativeness, NativenessCheckResult } from "../guardrails/bengaliNativenessCheck";
import { AppChannel } from "../channels/types";
import { CampaignSpec } from "./briefAnalyzer";

export const GeneratedCopySchema = z.object({
  copy: z.string().min(1),
  cta: z.string().min(1),
  hashtags: z.array(z.string()).default([]),
});

export type GeneratedCopy = z.infer<typeof GeneratedCopySchema>;

export interface ChannelContentResult {
  channel: AppChannel;
  copyBn?: string;
  copyEn?: string;
  cta: string;
  hashtags: string[];
  bengaliNativeness?: NativenessCheckResult;
  bengaliNativenessAttempt: number;
}

export interface ContentGenerationOptions {
  spec: CampaignSpec;
  channel: AppChannel;
  retrievedInsights?: string[];
  regenerationFeedback?: string;
  targetLanguage?: "bn" | "en" | "both";
}

function getChannelPromptTemplate(
  channel: AppChannel,
  language: "bn" | "en",
  spec: CampaignSpec,
  insights?: string[],
  feedback?: string
): string {
  const languageInstruction =
    language === "bn"
      ? "Write natively, fluently, and directly in Bengali as a native Kolkata Bengali speaker for social media. Strictly avoid machine-translation calques or unnatural literal English idioms."
      : "Write natively and compellingly in modern conversational English.";

  const insightBlock =
    insights && insights.length > 0
      ? `\nPast campaigns with similar genre/tone found this worked well: "${insights.join(
          "; "
        )}". Consider this pattern, but do not force it if it does not fit this brief.`
      : "";

  const feedbackBlock = feedback
    ? `\nThe previous attempt was rejected with this reviewer feedback: "${feedback}". You MUST address this feedback directly in this attempt.`
    : "";

  if (channel === "instagram") {
    return `Write an Instagram caption for this promotional campaign. Instagram captions are casual, visually-oriented, and use generous relevant hashtags (8-15). Keep the caption itself short (1-3 sentences) since the visual carries most of the message. Include a clear, punchy CTA.

Campaign: ${JSON.stringify(spec)}
Language: ${language} (${languageInstruction})
${insightBlock}
${feedbackBlock}

Return ONLY valid JSON matching:
{
  "copy": string,
  "cta": string,
  "hashtags": string[]
}`;
  }

  if (channel === "facebook") {
    return `Write a Facebook post for this promotional campaign. Facebook posts can be longer and more informative than Instagram — include context a reader unfamiliar with the show/product would need. Use 2-4 hashtags, not more. CTA can be slightly more detailed (e.g. "Watch the trailer now" rather than just "Watch now").

Campaign: ${JSON.stringify(spec)}
Language: ${language} (${languageInstruction})
${insightBlock}
${feedbackBlock}

Return ONLY valid JSON matching:
{
  "copy": string,
  "cta": string,
  "hashtags": string[]
}`;
  }

  // Twitter / X
  return `Write an X (Twitter) post for this promotional campaign. Must fit within 280 characters INCLUDING hashtags and CTA. Be punchy and high-energy — X rewards brevity and a strong hook in the first few words. Use 1-3 hashtags maximum.

Campaign: ${JSON.stringify(spec)}
Language: ${language} (${languageInstruction})
${insightBlock}
${feedbackBlock}

Return ONLY valid JSON matching:
{
  "copy": string,
  "cta": string,
  "hashtags": string[]
}`;
}

async function generateCopyForLanguage(
  channel: AppChannel,
  language: "bn" | "en",
  spec: CampaignSpec,
  insights?: string[],
  feedback?: string
): Promise<GeneratedCopy> {
  const prompt = getChannelPromptTemplate(channel, language, spec, insights, feedback);
  const raw = await generateWithGemini(prompt, {
    temperature: 0.7,
    responseMimeType: "application/json",
  });

  const parsed = cleanAndParseJson(raw, GeneratedCopySchema);
  if (!parsed.success || !parsed.data) {
    throw new Error(`Failed to generate valid copy for ${channel} (${language}): ${parsed.error}`);
  }

  // Normalize hashtags: strip unnecessary # prefixes so we store clean tokens
  const cleanHashtags = (parsed.data.hashtags ?? [])
    .map((h) => h.replace(/^#+/, "").trim())
    .filter(Boolean);

  return {
    ...parsed.data,
    hashtags: cleanHashtags,
  };
}

export async function generateChannelContent(
  options: ContentGenerationOptions
): Promise<ChannelContentResult> {
  const { channel, spec, retrievedInsights, regenerationFeedback } = options;
  const lang = options.targetLanguage ?? spec.language;

  let copyBn: string | undefined;
  let copyEn: string | undefined;
  let finalCta = "";
  let finalHashtags: string[] = [];
  let bengaliNativeness: NativenessCheckResult | undefined;
  let bengaliAttempts = 0;

  // 1. Generate Bengali Copy if requested
  if (lang === "bn" || lang === "both") {
    bengaliAttempts = 1;
    const bnResult = await generateCopyForLanguage(
      channel,
      "bn",
      spec,
      retrievedInsights,
      regenerationFeedback
    );

    copyBn = bnResult.copy;
    finalCta = bnResult.cta;
    finalHashtags = bnResult.hashtags;

    // Runtime Bengali Nativeness Guardrail (agents/GUARDRAILS.md §2)
    bengaliNativeness = await checkBengaliNativeness(copyBn);

    // If guardrail fails, run the automated retry once with feedback
    if (!bengaliNativeness.passed) {
      console.warn(`[ContentGen] Bengali nativeness check failed for ${channel} on attempt 1. Reason: ${bengaliNativeness.reason}. Retrying...`);
      bengaliAttempts = 2;
      const retryFeedback = [
        regenerationFeedback,
        `Nativeness Check Feedback: "${bengaliNativeness.reason}". Strictly write native, idiomatic Bengali without any literal translations or English idioms.`,
      ]
        .filter(Boolean)
        .join(" | ");

      try {
        const retryResult = await generateCopyForLanguage(
          channel,
          "bn",
          spec,
          retrievedInsights,
          retryFeedback
        );
        copyBn = retryResult.copy;
        finalCta = retryResult.cta;
        finalHashtags = retryResult.hashtags;
        bengaliNativeness = await checkBengaliNativeness(copyBn);
      } catch (retryErr) {
        console.error(`[ContentGen] Retry error for ${channel}:`, retryErr);
      }
    }
  }

  // 2. Generate English Copy if requested
  if (lang === "en" || lang === "both") {
    try {
      const enResult = await generateCopyForLanguage(
        channel,
        "en",
        spec,
        retrievedInsights,
        regenerationFeedback
      );
      copyEn = enResult.copy;
      if (!finalCta) finalCta = enResult.cta;
      if (finalHashtags.length === 0) finalHashtags = enResult.hashtags;
    } catch (enErr) {
      console.warn(`[ContentGen] English copy generation failed for ${channel}:`, enErr);
    }
  }

  return {
    channel,
    copyBn,
    copyEn,
    cta: finalCta,
    hashtags: finalHashtags,
    bengaliNativeness,
    bengaliNativenessAttempt: bengaliAttempts,
  };
}
