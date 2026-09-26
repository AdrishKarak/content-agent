import { ChannelConstraints, PublishResult } from "./types";

export const twitterConstraints: ChannelConstraints = {
  name: "twitter",
  displayName: "X / Twitter",
  characterLimit: 280,
  maxHashtags: 4,
  minHashtags: 1,
  recommendedAspectRatios: ["16:9", "1:1"],
  maxImageSizeBytes: 5 * 1024 * 1024, // 5MB
};

export async function mockPublishTwitter(payload: {
  copy: string;
  hashtags: string[];
  imageUrl?: string;
}): Promise<PublishResult> {
  const fullText = `${payload.copy} ${payload.hashtags.map(h => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`.trim();

  // Re-validation at publish time (AC 12.2)
  if (fullText.length > twitterConstraints.characterLimit) {
    return {
      success: false,
      error: `X / Twitter character limit exceeded: ${fullText.length} characters (Limit is ${twitterConstraints.characterLimit}). Trim it before publishing.`,
      publishedAt: new Date(),
    };
  }

  if (payload.hashtags.length > twitterConstraints.maxHashtags) {
    return {
      success: false,
      error: `X / Twitter hashtag limit exceeded: ${payload.hashtags.length} > ${twitterConstraints.maxHashtags}`,
      publishedAt: new Date(),
    };
  }

  const mockPostId = `x_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return {
    success: true,
    platformPostId: mockPostId,
    publishedUrl: `https://x.com/user/status/${mockPostId}`,
    publishedAt: new Date(),
  };
}
