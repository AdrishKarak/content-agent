import { AppChannel, ChannelConstraints, PublishResult } from "./types";
import { instagramConstraints, mockPublishInstagram } from "./instagram";
import { facebookConstraints, mockPublishFacebook } from "./facebook";
import { twitterConstraints, mockPublishTwitter } from "./twitter";

export * from "./types";
export * from "./instagram";
export * from "./facebook";
export * from "./twitter";

export const CHANNEL_CONSTRAINTS: Record<AppChannel, ChannelConstraints> = {
  instagram: instagramConstraints,
  facebook: facebookConstraints,
  twitter: twitterConstraints,
};

export const MOCK_PUBLISHERS: Record<
  AppChannel,
  (payload: { copy: string; hashtags: string[]; imageUrl?: string }) => Promise<PublishResult>
> = {
  instagram: mockPublishInstagram,
  facebook: mockPublishFacebook,
  twitter: mockPublishTwitter,
};
