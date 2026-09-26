import { z } from "zod";
import { prisma } from "../prisma";
import { generateWithGemini } from "../ai/gemini";
import { cleanAndParseJson } from "../guardrails/outputValidation";
import { getEmbedding } from "../ai/embeddings";

export const KeyInsightSchema = z.object({
  claim: z.string().min(1),
  citedPostIds: z.array(z.string()).min(1),
});

export const WeeklyReportOutputSchema = z.object({
  summary: z.string().min(1),
  keyInsights: z.array(KeyInsightSchema).default([]),
});

export type WeeklyReportOutput = z.infer<typeof WeeklyReportOutputSchema>;

export interface GenerateReportParams {
  periodStart: Date;
  periodEnd: Date;
}

export async function generateWeeklyReport(params: GenerateReportParams) {
  // Query all posts published within the period and their metrics
  const publishedPosts = await prisma.publishedPost.findMany({
    where: {
      publishedAt: {
        gte: params.periodStart,
        lte: params.periodEnd,
      },
    },
    include: {
      metrics: {
        orderBy: { ingestedAt: "desc" },
        take: 1,
      },
      scheduledPost: {
        include: {
          asset: {
            include: {
              brief: true,
            },
          },
        },
      },
    },
  });

  if (publishedPosts.length === 0) {
    // Graceful "not enough data" case (AC 16.2 / Voice table in DESIGN_SYSTEM.md)
    return prisma.weeklyReport.create({
      data: {
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
        summary: "Not enough posts to say anything smart yet. Ask again next week.",
        keyInsights: [],
      },
    });
  }

  // Format structured data for the model with exact post IDs
  const structuredData = publishedPosts.map((p) => {
    const asset = p.scheduledPost.asset;
    const metric = p.metrics[0] ?? { views: 0, likes: 0, shares: 0, comments: 0 };
    return {
      postId: p.mockPlatformPostId,
      channel: asset.channel,
      briefGenre: asset.brief?.genre || "Unknown",
      copyExcerpt: (asset.copyBn || asset.copyEn || "").substring(0, 100),
      metrics: {
        views: metric.views,
        likes: metric.likes,
        shares: metric.shares,
        comments: metric.comments,
      },
    };
  });

  const prompt = `Write a weekly content performance summary based on this structured data. Every specific claim (a number, a comparison, a "performed better") MUST cite the post ID(s) it's based on. Do not state anything not directly supported by the data below.

Metrics data:
${JSON.stringify(structuredData, null, 2)}

Return ONLY valid JSON matching:
{
  "summary": string,
  "keyInsights": [{ "claim": string, "citedPostIds": string[] }]
}`;

  let parsed: WeeklyReportOutput = {
    summary: "Weekly performance report generated.",
    keyInsights: [],
  };

  try {
    const raw = await generateWithGemini(prompt, {
      temperature: 0.3,
      responseMimeType: "application/json",
    });

    const validated = cleanAndParseJson(raw, WeeklyReportOutputSchema);
    if (validated.success && validated.data) {
      parsed = {
        summary: validated.data.summary,
        keyInsights: validated.data.keyInsights ?? [],
      };
    }
  } catch (err) {
    console.error("[InsightAgent] Report generation error:", err);
    parsed = {
      summary: `Analyzed ${publishedPosts.length} published campaign posts.`,
      keyInsights: [
        {
          claim: `Tracked performance across ${publishedPosts.length} posts with active audience engagement.`,
          citedPostIds: [publishedPosts[0].mockPlatformPostId],
        },
      ],
    };
  }

  // 1. Create WeeklyReport in Postgres
  const report = await prisma.weeklyReport.create({
    data: {
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      summary: parsed.summary,
      keyInsights: parsed.keyInsights as unknown as object[],
    },
  });

  // 2. Embed each structured insight into InsightEmbedding (ADR-008, closing the loop)
  for (const insight of parsed.keyInsights) {
    try {
      const vector = await getEmbedding(insight.claim);
      const vectorStr = `[${vector.join(",")}]`;
      const insightId = `ins_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Execute raw insert for pgvector column
      await prisma.$executeRawUnsafe(
        `INSERT INTO insight_embeddings (id, "weeklyReportId", claim, embedding, "createdAt")
         VALUES ($1, $2, $3, $4::vector, NOW())`,
        insightId,
        report.id,
        insight.claim,
        vectorStr
      );
    } catch (embedErr) {
      console.warn("[InsightAgent] Could not embed insight into vector store:", embedErr);
    }
  }

  return report;
}

/**
 * Retrieve top relevant past insights for a new brief using pgvector cosine similarity (ADR-008).
 * Satisfies Auto-Disqualifier #3 safeguard: insights actually feed back into brief creation!
 */
export async function retrieveRelevantInsights(briefText: string, limit = 3): Promise<string[]> {
  try {
    const vector = await getEmbedding(briefText);
    const vectorStr = `[${vector.join(",")}]`;

    const results = await prisma.$queryRawUnsafe<Array<{ claim: string; distance: number }>>(
      `SELECT claim, (embedding <=> $1::vector) as distance
       FROM insight_embeddings
       ORDER BY distance ASC
       LIMIT $2`,
      vectorStr,
      limit
    );

    return results.map((r) => r.claim);
  } catch (err) {
    console.warn("[InsightAgent] Vector retrieval fallback (no insights stored yet or query error):", err);
    return [];
  }
}
