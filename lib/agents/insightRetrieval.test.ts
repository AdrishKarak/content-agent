import { describe, it, expect } from "vitest";
import { retrieveRelevantInsights } from "./insightAgent";

describe("pgvector Insight Retrieval Loop (ADR-008 & Auto-Disqualifier #3 Safeguard)", () => {
  it("retrieves semantically relevant insights from past campaigns for a new mystery brief", async () => {
    const briefText = "একটি নতুন থ্রিলার এবং রহস্যের গল্প যা উত্তরবঙ্গের কুয়াশার পটভূমিতে রচিত।";
    const insights = await retrieveRelevantInsights(briefText, 3);

    expect(Array.isArray(insights)).toBe(true);
    expect(insights.length).toBeGreaterThan(0);
    // Should match thriller/suspense or mystery related insights seeded earlier
    const joined = insights.join(" ");
    expect(
      joined.includes("suspense") ||
      joined.includes("thriller") ||
      joined.includes("Mystery") ||
      joined.includes("Bengali")
    ).toBe(true);
  });
});
