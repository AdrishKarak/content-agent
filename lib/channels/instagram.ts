import { ChannelConstraints, PublishResult } from "./types";

export const instagramConstraints: ChannelConstraints = {
  name: "instagram",
  displayName: "Instagram",
  characterLimit: 2200,
  maxHashtags: 30,
  minHashtags: 5,
  recommendedAspectRatios: ["1:1", "4:5", "9:16"],
  maxImageSizeBytes: 8 * 1024 * 1024, // 8MB
};

export async function mockPublishInstagram(payload: {
  copy: string;
  hashtags: string[];
  imageUrl?: string;
}): Promise<PublishResult> {
  const fullText = `${payload.copy} ${payload.hashtags.map(h => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`.trim();
  
  // Re-validation at publish time (AC 12.2)
  if (fullText.length > instagramConstraints.characterLimit) {
    return {
      success: false,
      error: `Instagram character limit exceeded: ${fullText.length} > ${instagramConstraints.characterLimit}`,
      publishedAt: new Date(),
    };
  }

  if (payload.hashtags.length > instagramConstraints.maxHashtags) {
    return {
      success: false,
      error: `Instagram hashtag limit exceeded: ${payload.hashtags.length} > ${instagramConstraints.maxHashtags}`,
      publishedAt: new Date(),
    };
  }

  const mockPostId = `ig_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return {
    success: true,
    platformPostId: mockPostId,
    publishedUrl: `https://instagram.com/p/${mockPostId}`,
    publishedAt: new Date(),
  };
}
