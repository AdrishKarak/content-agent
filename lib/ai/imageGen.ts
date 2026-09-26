import fs from "fs";
import path from "path";
import { AppChannel } from "../channels/types";

export interface ImageGenOptions {
  channel: AppChannel;
  prompt: string;
  width?: number;
  height?: number;
}

export interface GeneratedImageResult {
  url: string;
  prompt: string;
  width: number;
  height: number;
  localPath?: string;
}

const CHANNEL_DIMENSIONS: Record<AppChannel, { width: number; height: number }> = {
  instagram: { width: 1024, height: 1024 }, // 1:1
  facebook: { width: 1280, height: 720 },   // 16:9
  twitter: { width: 1024, height: 576 },    // 16:9
};

/**
 * Generate a channel-tailored visual asset.
 * Writes to public/generated_assets/ so Next.js can serve it immediately.
 */
export async function generateChannelImage(
  options: ImageGenOptions
): Promise<GeneratedImageResult> {
  const { channel, prompt } = options;
  const dims = CHANNEL_DIMENSIONS[channel] || { width: 1024, height: 1024 };
  const width = options.width ?? dims.width;
  const height = options.height ?? dims.height;

  const encodedPrompt = encodeURIComponent(prompt);
  // Free, high quality direct endpoint with nologo
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true`;

  const publicDir = path.join(process.cwd(), "public", "generated_assets");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const filename = `${channel}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
  const filePath = path.join(publicDir, filename);
  const relativeUrl = `/generated_assets/${filename}`;

  let downloaded = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(pollinationsUrl);
      if (!res.ok) {
        throw new Error(`Pollinations HTTP ${res.status}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      downloaded = true;
      break;
    } catch (err: unknown) {
      console.warn(`[ImageGen] Attempt ${attempt} failed for ${channel}:`, err instanceof Error ? err.message : String(err));
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  return {
    url: downloaded ? relativeUrl : pollinationsUrl,
    prompt,
    width,
    height,
    localPath: downloaded ? filePath : undefined,
  };
}
