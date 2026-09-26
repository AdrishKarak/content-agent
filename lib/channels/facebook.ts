import { ChannelConstraints, PublishResult } from "./types";

export const facebookConstraints: ChannelConstraints = {
  name: "facebook",
  displayName: "Facebook",
  characterLimit: 5000,
  maxHashtags: 6,
  minHashtags: 1,
  recommendedAspectRatios: ["16:9", "1.91:1", "1:1"],
  maxImageSizeBytes: 10 * 1024 * 1024, // 10MB
};

export async function mockPublishFacebook(payload: {
  copy: string;
  hashtags: string[];
  imageUrl?: string;
}): Promise<PublishResult> {
  const fullText = `${payload.copy} ${payload.hashtags.map(h => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`.trim();

  // Re-validation at publish time (AC 12.2)
  if (fullText.length > facebookConstraints.characterLimit) {
    return {
      success: false,
      error: `Facebook character limit exceeded: ${fullText.length} > ${facebookConstraints.characterLimit}`,
      publishedAt: new Date(),
    };
  }

  if (payload.hashtags.length > facebookConstraints.maxHashtags) {
    return {
      success: false,
      error: `Facebook hashtag limit exceeded: ${payload.hashtags.length} > ${facebookConstraints.maxHashtags}`,
      publishedAt: new Date(),
    };
  }

  const mockPostId = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return {
    success: true,
    platformPostId: mockPostId,
    publishedUrl: `https://facebook.com/story.php?id=${mockPostId}`,
    publishedAt: new Date(),
  };
}
