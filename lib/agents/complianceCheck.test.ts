import { describe, it, expect } from "vitest";
import { runComplianceCheck } from "./complianceCheck";

describe("Deterministic Compliance Checker (ADR-005)", () => {
  it("passes compliant Twitter/X post under 280 characters with 1-4 hashtags and CTA", () => {
    const outcome = runComplianceCheck({
      channel: "twitter",
      copy: "রহস্যের নতুন অধ্যায় শুরু হতে চলেছে। নিখোঁজ সংবাদ আসছে hoichoi-তে।",
      cta: "এখনই দেখুন hoichoi-তে",
      hashtags: ["NikhojSongbad", "hoichoi"],
    });

    expect(outcome.passed).toBe(true);
    expect(outcome.failures).toHaveLength(0);
  });

  it("fails Twitter/X post exceeding 280 characters", () => {
    const longCopy = "রহস্যের নতুন অধ্যায় শুরু হতে চলেছে। ".repeat(15);
    const outcome = runComplianceCheck({
      channel: "twitter",
      copy: longCopy,
      cta: "এখনই দেখুন",
      hashtags: ["hoichoi"],
    });

    expect(outcome.passed).toBe(false);
    expect(outcome.failures.some((f) => f.rule === "character_limit")).toBe(true);
    expect(outcome.failures.find((f) => f.rule === "character_limit")?.reason).toContain("Trim");
  });

  it("fails Twitter/X post with more than 4 hashtags", () => {
    const outcome = runComplianceCheck({
      channel: "twitter",
      copy: "টুইটার পোস্ট",
      cta: "দেখুন",
      hashtags: ["tag1", "tag2", "tag3", "tag4", "tag5"],
    });

    expect(outcome.passed).toBe(false);
    expect(outcome.failures.some((f) => f.rule === "max_hashtags")).toBe(true);
  });

  it("fails when copy text is empty or missing", () => {
    const outcome = runComplianceCheck({
      channel: "instagram",
      copy: "   ",
      cta: "Watch now on hoichoi",
      hashtags: ["hoichoi", "series"],
    });

    expect(outcome.passed).toBe(false);
    expect(outcome.failures.some((f) => f.rule === "copy_presence")).toBe(true);
  });

  it("fails when CTA is missing", () => {
    const outcome = runComplianceCheck({
      channel: "facebook",
      copy: "একটি চমৎকার দৃশ্য আসছে শীঘ্রই।",
      cta: "",
      hashtags: ["hoichoi"],
    });

    expect(outcome.passed).toBe(false);
    expect(outcome.failures.some((f) => f.rule === "cta_requirement")).toBe(true);
  });

  it("fails when image size exceeds channel limits", () => {
    // Twitter max is 5MB = 5 * 1024 * 1024
    const outcome = runComplianceCheck({
      channel: "twitter",
      copy: "Short copy",
      cta: "Click here",
      hashtags: ["hoichoi"],
      imageSizeBytes: 6 * 1024 * 1024, // 6MB
    });

    expect(outcome.passed).toBe(false);
    expect(outcome.failures.some((f) => f.rule === "file_size")).toBe(true);
  });

  it("fails closed for unknown channel", () => {
    const outcome = runComplianceCheck({
      // @ts-expect-error Testing invalid channel
      channel: "tiktok",
      copy: "Some copy",
      cta: "CTA",
      hashtags: ["test"],
    });

    expect(outcome.passed).toBe(false);
    expect(outcome.failures.some((f) => f.rule === "channel_validity")).toBe(true);
  });
});
