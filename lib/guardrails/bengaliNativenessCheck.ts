import { generateWithGemini } from "../ai/gemini";
import { cleanAndParseJson } from "./outputValidation";
import { z } from "zod";

const NativenessSchema = z.object({
  readsAsNative: z.boolean(),
  reason: z.string(),
});

export interface NativenessCheckResult {
  passed: boolean;
  reason: string;
}

/**
 * Automated runtime Bengali Nativeness Guardrail.
 * Evaluates whether generated Bengali reads natively or like an English translation/calque.
 */
export async function checkBengaliNativeness(
  bengaliText: string
): Promise<NativenessCheckResult> {
  if (!bengaliText || !bengaliText.trim()) {
    return { passed: false, reason: "Text is empty" };
  }

  const prompt = `You are evaluating whether the following Bengali text reads as natively written by a fluent Bengali speaker, or as a translation from English (even a good one). Translated text often has: overly literal phrasing, unnatural word order, English idioms rendered word-for-word, typographical mix of English words, or a slightly formal/stiff register inconsistent with casual social media writing.

Text to evaluate:
"""
${bengaliText}
"""

Return ONLY JSON matching:
{ "readsAsNative": boolean, "reason": string }`;

  try {
    const response = await generateWithGemini(prompt, {
      temperature: 0.2,
      responseMimeType: "application/json",
    });

    const parsed = cleanAndParseJson(response, NativenessSchema);
    if (!parsed.success || !parsed.data) {
      console.warn("Nativeness check parse error, defaulting to manual review:", parsed.error);
      return {
        passed: false,
        reason: `Failed to parse nativeness evaluation: ${parsed.error}`,
      };
    }

    return {
      passed: parsed.data.readsAsNative,
      reason: parsed.data.reason,
    };
  } catch (err: unknown) {
    console.error("Nativeness check execution error:", err);
    return {
      passed: false,
      reason: `Nativeness check API error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
