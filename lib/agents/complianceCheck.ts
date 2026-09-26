import { AppChannel, CHANNEL_CONSTRAINTS } from "../channels";

export interface ComplianceFailure {
  rule: string;
  reason: string;
}

export interface ComplianceCheckOutcome {
  passed: boolean;
  failures: ComplianceFailure[];
}

export interface AssetToValidate {
  channel: AppChannel;
  copy?: string;
  hashtags?: string[];
  cta?: string;
  imageUrl?: string;
  imageSizeBytes?: number;
}

/**
 * Deterministic Compliance Checker (ADR-005).
 * Validates generated copy and media strictly according to channel rules.
 * Fails closed: never allows invalid assets through to the approval queue.
 */
export function runComplianceCheck(asset: AssetToValidate): ComplianceCheckOutcome {
  const constraints = CHANNEL_CONSTRAINTS[asset.channel];
  const failures: ComplianceFailure[] = [];

  if (!constraints) {
    return {
      passed: false,
      failures: [{ rule: "channel_validity", reason: `Unsupported channel: ${asset.channel}` }],
    };
  }

  // 1. Text & Character Limit Check
  const copyText = asset.copy ?? "";
  const ctaText = asset.cta ?? "";
  const hashtagText = (asset.hashtags ?? [])
    .map((h) => (h.startsWith("#") ? h : `#${h}`))
    .join(" ");

  const combinedText = [copyText, ctaText, hashtagText].filter(Boolean).join(" ").trim();

  if (!copyText.trim()) {
    failures.push({
      rule: "copy_presence",
      reason: "Asset copy text is empty or missing.",
    });
  }

  if (combinedText.length > constraints.characterLimit) {
    failures.push({
      rule: "character_limit",
      reason: `Total length is ${combinedText.length} characters. ${constraints.displayName} allows maximum ${constraints.characterLimit} characters. Trim ${combinedText.length - constraints.characterLimit} characters.`,
    });
  }

  // 2. Hashtag Count Rules
  const hashtagCount = asset.hashtags?.length ?? 0;
  if (hashtagCount > constraints.maxHashtags) {
    failures.push({
      rule: "max_hashtags",
      reason: `Asset includes ${hashtagCount} hashtags, exceeding ${constraints.displayName}'s maximum limit of ${constraints.maxHashtags}.`,
    });
  }

  if (hashtagCount < constraints.minHashtags) {
    failures.push({
      rule: "min_hashtags",
      reason: `Asset includes ${hashtagCount} hashtags, which is below ${constraints.displayName}'s recommended minimum of ${constraints.minHashtags}.`,
    });
  }

  // 3. CTA Requirement
  if (!ctaText.trim()) {
    failures.push({
      rule: "cta_requirement",
      reason: "A clear call-to-action (CTA) is required for promotional content.",
    });
  }

  // 4. Image Size Check (if metadata available)
  if (asset.imageSizeBytes && asset.imageSizeBytes > constraints.maxImageSizeBytes) {
    failures.push({
      rule: "file_size",
      reason: `Image file size ${(asset.imageSizeBytes / (1024 * 1024)).toFixed(1)}MB exceeds maximum allowed ${(constraints.maxImageSizeBytes / (1024 * 1024)).toFixed(0)}MB for ${constraints.displayName}.`,
    });
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}
