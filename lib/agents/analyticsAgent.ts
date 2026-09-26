import { prisma } from "../prisma";
import { MetricSource } from "@prisma/client";

export interface DemoMetricPayload {
  publishedPostId: string;
  source?: MetricSource;
  views?: number;
  likes?: number;
  shares?: number;
  comments?: number;
}

export interface CsvMetricRow {
  mockPlatformPostId: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
}

export async function recordPostMetric(payload: DemoMetricPayload) {
  const publishedPost = await prisma.publishedPost.findUnique({
    where: { id: payload.publishedPostId },
  });

  if (!publishedPost) {
    throw new Error(`Published post ${payload.publishedPostId} not found`);
  }

  // Generate plausible metrics if not explicitly passed
  const views = payload.views ?? Math.floor(Math.random() * 45000 + 5000);
  const likes = payload.likes ?? Math.floor(views * (Math.random() * 0.08 + 0.02));
  const shares = payload.shares ?? Math.floor(likes * (Math.random() * 0.15 + 0.05));
  const comments = payload.comments ?? Math.floor(likes * (Math.random() * 0.08 + 0.02));

  return prisma.metric.create({
    data: {
      publishedPostId: publishedPost.id,
      views,
      likes,
      shares,
      comments,
      source: payload.source ?? MetricSource.MOCK,
    },
  });
}

export async function parseAndIngestMetricsCsv(csvContent: string): Promise<{
  imported: number;
  errors: string[];
}> {
  const lines = csvContent
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { imported: 0, errors: ["CSV file is empty or missing headers"] };
  }

  const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const postIdIdx = headers.indexOf("post_id") !== -1 ? headers.indexOf("post_id") : headers.indexOf("id");
  const viewsIdx = headers.indexOf("views");
  const likesIdx = headers.indexOf("likes");
  const sharesIdx = headers.indexOf("shares");
  const commentsIdx = headers.indexOf("comments");

  if (postIdIdx === -1 || viewsIdx === -1 || likesIdx === -1) {
    return {
      imported: 0,
      errors: ["CSV must contain at least 'post_id', 'views', and 'likes' columns"],
    };
  }

  let imported = 0;
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const mockPostId = cols[postIdIdx];
    const views = parseInt(cols[viewsIdx], 10) || 0;
    const likes = parseInt(cols[likesIdx], 10) || 0;
    const shares = sharesIdx !== -1 ? parseInt(cols[sharesIdx], 10) || 0 : 0;
    const comments = commentsIdx !== -1 ? parseInt(cols[commentsIdx], 10) || 0 : 0;

    const post = await prisma.publishedPost.findFirst({
      where: { mockPlatformPostId: mockPostId },
    });

    if (!post) {
      errors.push(`Row ${i}: Post with ID '${mockPostId}' not found in published records.`);
      continue;
    }

    await prisma.metric.create({
      data: {
        publishedPostId: post.id,
        views,
        likes,
        shares,
        comments,
        source: MetricSource.CSV_UPLOAD,
      },
    });

    imported++;
  }

  return { imported, errors };
}
