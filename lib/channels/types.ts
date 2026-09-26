import { Channel as PrismaChannel } from "@prisma/client";

export type AppChannel = "instagram" | "facebook" | "twitter";

export interface ChannelConstraints {
  name: AppChannel;
  displayName: string;
  characterLimit: number; // Max total text characters
  maxHashtags: number;
  minHashtags: number;
  recommendedAspectRatios: string[]; // e.g. ["1:1", "4:5"]
  maxImageSizeBytes: number; // e.g. 8 * 1024 * 1024 (8MB)
}

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  publishedUrl?: string;
  publishedAt: Date;
  error?: string;
}

export function toDbChannel(channel: AppChannel): PrismaChannel {
  switch (channel) {
    case "instagram":
      return PrismaChannel.INSTAGRAM;
    case "facebook":
      return PrismaChannel.FACEBOOK;
    case "twitter":
      return PrismaChannel.TWITTER;
    default:
      throw new Error(`Unknown channel: ${channel}`);
  }
}

export function fromDbChannel(channel: PrismaChannel): AppChannel {
  switch (channel) {
    case PrismaChannel.INSTAGRAM:
      return "instagram";
    case PrismaChannel.FACEBOOK:
      return "facebook";
    case PrismaChannel.TWITTER:
      return "twitter";
    default:
      throw new Error(`Unknown DB channel: ${channel}`);
  }
}
