import { z } from "zod";
import { generateWithGemini } from "../ai/gemini";
import { cleanAndParseJson } from "../guardrails/outputValidation";
import { AppChannel } from "../channels/types";

export const CampaignSpecSchema = z.object({
  genre: z.string().min(1),
  targetAudience: z.string().min(1),
  language: z.enum(["bn", "en", "both"]),
  tone: z.string().min(1),
  targetChannels: z.array(z.enum(["instagram", "facebook", "twitter"])).min(1),
});

export interface CampaignSpec {
  genre: string;
  targetAudience: string;
  language: "bn" | "en" | "both";
  tone: string;
  targetChannels: AppChannel[];
}

export async function analyzeBrief(rawBriefText: string): Promise<CampaignSpec> {
  const prompt = `Extract a structured campaign spec from this content brief. Return ONLY valid JSON matching:
{
  "genre": string,
  "targetAudience": string,
  "language": "bn" | "en" | "both",
  "tone": string,
  "targetChannels": ("instagram" | "facebook" | "twitter")[]
}

Rules:
- Infer only what's reasonably supported by the brief text. If language isn't specified, default to "both".
- If target channels aren't specified, default to all three: instagram, facebook, twitter.

Brief:
"""
${rawBriefText}
"""`;

  let lastError = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await generateWithGemini(prompt, {
        temperature: 0.2,
        responseMimeType: "application/json",
      });

      const validation = cleanAndParseJson(response, CampaignSpecSchema);
      if (validation.success && validation.data) {
        return validation.data;
      }
      lastError = validation.error ?? "Unknown validation error";
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  // Fallback safe default if parsing failed twice per AC 2.1
  console.warn("Brief analysis required fallback spec due to error:", lastError);
  return {
    genre: "Entertainment",
    targetAudience: "Digital streaming audience",
    language: "both",
    tone: "Engaging and promotional",
    targetChannels: ["instagram", "facebook", "twitter"],
  };
}
