import { generateWithGemini } from "../ai/gemini";
import { generateChannelImage, GeneratedImageResult } from "../ai/imageGen";
import { AppChannel } from "../channels/types";
import { CampaignSpec } from "./briefAnalyzer";

export interface ChannelImageResult {
  channel: AppChannel;
  prompt: string;
  url: string;
  width: number;
  height: number;
}

/**
 * Compose a channel-specific image prompt tailored to that platform's visual culture (ADR-002).
 */
export async function composeImagePrompt(
  spec: CampaignSpec,
  channel: AppChannel,
  feedback?: string
): Promise<string> {
  let styleGuide = "";
  if (channel === "instagram") {
    styleGuide =
      "Style: Cinematic, intimate close-up or character-focused portrait, moody atmospheric lighting, minimal or no text overlay (Instagram audiences respond to strong visuals over text-heavy images), 1:1 square composition, high drama.";
  } else if (channel === "facebook") {
    styleGuide =
      "Style: Wider cinematic landscape composition, rich environmental storytelling context (e.g. city skyline, rainy crime scene, streetscape), space for titles or key promotional framing, landscape 16:9 composition.";
  } else {
    // twitter
    styleGuide =
      "Style: High-contrast, bold, punchy graphic key art with extreme thumbnail clarity, dramatic silhouette or stark focal element that pops when scrolling rapidly on mobile feeds, 16:9 composition.";
  }

  const feedbackInstruction = feedback
    ? `\nAddress this revision feedback on the visual: "${feedback}".`
    : "";

  const promptBuilder = `Generate an image generation prompt for ${channel}'s specific visual style, based on this campaign:

Campaign: ${JSON.stringify(spec)}
${styleGuide}
${feedbackInstruction}

Return a single, detailed image generation prompt (plain text only, describing the scene visually with photographic and lighting details, no JSON).`;

  try {
    const prompt = await generateWithGemini(promptBuilder, {
      temperature: 0.7,
    });
    return prompt.trim().replace(/^["']|["']$/g, "");
  } catch (err) {
    console.warn(`[ImageAgent] Gemini prompt composition fallback for ${channel}:`, err);
    return `Cinematic promotional key art for ${spec.genre} series, ${spec.tone} mood, highly detailed 35mm film still`;
  }
}

/**
 * Generate distinct visual asset for a channel.
 */
export async function generateImageForChannel(
  spec: CampaignSpec,
  channel: AppChannel,
  feedback?: string
): Promise<ChannelImageResult> {
  const prompt = await composeImagePrompt(spec, channel, feedback);
  const result: GeneratedImageResult = await generateChannelImage({
    channel,
    prompt,
  });

  return {
    channel,
    prompt: result.prompt,
    url: result.url,
    width: result.width,
    height: result.height,
  };
}
