import { PrismaClient } from "@prisma/client";
import { getEmbedding } from "../lib/ai/embeddings";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed database...");

  // Clear existing demo records to ensure clean state
  await prisma.metric.deleteMany({});
  await prisma.publishedPost.deleteMany({});
  await prisma.scheduledPost.deleteMany({});
  await prisma.approval.deleteMany({});
  await prisma.complianceCheck.deleteMany({});
  await prisma.contentAsset.deleteMany({});
  await prisma.$executeRawUnsafe(`DELETE FROM insight_embeddings;`).catch(() => {});
  await prisma.weeklyReport.deleteMany({});
  await prisma.brief.deleteMany({});

  const demoUserId = "user_demo_hoichoi";

  // 1. Seed Historical Completed Campaign Brief
  console.log("Creating historical campaign brief: 'ইন্দুবাala ভাতের হোটেল'...");
  const indubalaBrief = await prisma.brief.create({
    data: {
      userId: demoUserId,
      rawBriefText:
        "ইন্দুবালা ভাতের হোটেল (Indubala Bhaater Hotel) - নস্টালজিয়া, স্মৃতি আর খাবারের স্বাদে জড়িয়ে থাকা এক নারীর জীবনসংগ্রাম। শুভাঙ্কর দে পরিচালিত এবং শুভশ্রী গাঙ্গুলী অভিনীত এই আবেগঘন ওয়েব সিরিজটির প্রমোশন ক্যাম্পেইন।",
      genre: "Emotional Drama / Period Nostalgia",
      targetAudience: "Bengali diaspora, family audience, literature lovers, food enthusiasts (25-55)",
      language: "BOTH",
      tone: "Poetic, emotional, deeply nostalgic, evoking the aroma of traditional home-cooked spices",
      targetChannels: ["INSTAGRAM", "FACEBOOK", "TWITTER"],
    },
  });

  // Assets for Indubala
  const indubalaAssets = [
    {
      channel: "INSTAGRAM" as const,
      type: "COPY" as const,
      copyBn:
        "এক মুঠো স্মৃতির সুবাস আর এক থালা ভালোবাসার গল্প। ইন্দুবালা ভাতের হোটেল-এ শুভশ্রী গাঙ্গুলীর অনবদ্য রূপ আপনাকে ফিরিয়ে নিয়ে যাবে ফেলে আসা দিনে। আপনার সবচেয়ে প্রিয় স্মৃতির স্বাদ কোনটি?",
      copyEn:
        "A plate full of love and a pinch of nostalgic aromas. Indubashree's journey will warm your heart and evoke childhood memories. What is your most cherished nostalgic flavour?",
      cta: "এখনই স্ট্রীম করুন hoichoi-তে",
      hashtags: ["IndubalaBhaaterHotel", "SubhashreeGanguly", "hoichoiOriginals", "BengaliDrama"],
      imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1080&h=1080&fit=crop",
      imagePrompt: "1:1 close-up warm-toned atmospheric portrait of an elderly Bengali woman in a traditional cotton saree plating authentic rice and culinary delicacies in a heritage earthen kitchen, golden hour sunlight streaming through wooden louvers",
      bengaliNativenessPassed: true,
      status: "PUBLISHED" as const,
    },
    {
      channel: "FACEBOOK" as const,
      type: "COPY" as const,
      copyBn:
        "একটি নারীর অদম্য সংগ্রাম, স্মৃতির ঘ্রাণ আর খাঁটি বাঙালির স্বাদের মেলবন্ধন। কল্লোলিনী কলকাতার এক কোণে গড়ে ওঠা ইন্দুবালা ভাতের হোটেল শুধু পেট ভরায় না, মন ভরিয়ে তোলে nostalgie-র আবেশে। পুরো পরিবারের সাথে দেখার মতো এক অসামান্য গল্প।",
      copyEn:
        "A woman's relentless resilience, childhood memories, and traditional culinary heritage. Indubala Bhaater Hotel touches the soul with authentic Bengali emotions.",
      cta: "সম্পূর্ণ সিরিজ দেখুন শুধুমাত্র hoichoi অ্যাপে",
      hashtags: ["IndubalaBhaaterHotel", "hoichoi", "BanglaWebSeries"],
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=675&fit=crop",
      imagePrompt: "16:9 cinematic wide shot of a heritage north Kolkata lane with classic brass tiffin carriers, vintage signage, and rustic wooden dining tables in nostalgic sepia illumination",
      bengaliNativenessPassed: true,
      status: "PUBLISHED" as const,
    },
    {
      channel: "TWITTER" as const,
      type: "COPY" as const,
      copyBn:
        "স্মৃতির রেসিপি কখনো পুরনো হয় না। ইন্দুবালা ভাতের হোটেল এখন স্ট্রিমিং হচ্ছে শুধুমাত্র hoichoi-তে। মিস করবেন না!",
      copyEn:
        "Recipes woven from memories never fade. Indubala Bhaater Hotel is streaming now on hoichoi. Don't miss it!",
      cta: "Watch now on hoichoi",
      hashtags: ["IndubalaBhaaterHotel", "hoichoi"],
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=675&fit=crop",
      imagePrompt: "16:9 high contrast minimalist key art with bold title lettering in Bengali and a solitary vintage steam bowl on textured dark wood",
      bengaliNativenessPassed: true,
      status: "PUBLISHED" as const,
    },
  ];

  // Insert Indubala assets, approvals, schedules, published posts and high engagement metrics
  for (const assetData of indubalaAssets) {
    const asset = await prisma.contentAsset.create({
      data: {
        briefId: indubalaBrief.id,
        ...assetData,
      },
    });

    await prisma.complianceCheck.createMany({
      data: [
        { assetId: asset.id, rule: "character_limit", passed: true },
        { assetId: asset.id, rule: "hashtag_count", passed: true },
        { assetId: asset.id, rule: "cta_requirement", passed: true },
      ],
    });

    await prisma.approval.create({
      data: {
        assetId: asset.id,
        assetVersion: 1,
        decision: "APPROVE",
        feedback: "Perfect Bengali tone and evocative visuals!",
        decidedBy: demoUserId,
      },
    });

    const scheduledPost = await prisma.scheduledPost.create({
      data: {
        assetId: asset.id,
        scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    const publishedPost = await prisma.publishedPost.create({
      data: {
        scheduledPostId: scheduledPost.id,
        mockPlatformPostId: `post_indubala_${assetData.channel.toLowerCase()}`,
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    });

    // Realistic platform metrics (Instagram high likes/views, Facebook high shares)
    const metricsMap = {
      INSTAGRAM: { views: 48500, likes: 6200, comments: 490, shares: 1250 },
      FACEBOOK: { views: 62000, likes: 5100, comments: 820, shares: 3400 },
      TWITTER: { views: 19800, likes: 1450, comments: 160, shares: 620 },
    };

    await prisma.metric.create({
      data: {
        publishedPostId: publishedPost.id,
        ...metricsMap[assetData.channel],
        source: "MOCK",
        ingestedAt: new Date(),
      },
    });
  }

  // 2. Seed Second Campaign: 'নিখোঁজ সংবাদ' (Pending Approval in Studio)
  console.log("Creating active campaign brief: 'নিখোঁজ সংবাদ' (Nikhoj Songbad)...");
  const nikhojBrief = await prisma.brief.create({
    data: {
      userId: demoUserId,
      rawBriefText:
        "নিখোঁজ সংবাদ (Nikhoj Songbad) - কুয়াশাচ্ছন্ন উত্তরবঙ্গে এক বর্ষার রাতে রহস্যজনকভাবে অন্তর্ধান ঘটে এক প্রত্নতাত্ত্বিকের। প্রতি মোড়ে নতুন সন্দেহ আর মিথ্যার জাল। একটি দমবন্ধ করা ডার্ক থ্রিলার সিরিজ।",
      genre: "Psychological Thriller / Noir Crime Mystery",
      targetAudience: "Mystery lovers, youth binge-watchers, thriller aficionados (18-35)",
      language: "BOTH",
      tone: "Suspenseful, gripping, fast-paced, high tension with chilling cliffhangers",
      targetChannels: ["INSTAGRAM", "FACEBOOK", "TWITTER"],
    },
  });

  const nikhojAssets = [
    {
      channel: "INSTAGRAM" as const,
      type: "COPY" as const,
      copyBn:
        "কুয়াশার চাদরে ঢাকা উত্তরবঙ্গ, আর এক বর্ষণমুখর রাতে নিরুদ্দেশ একজন প্রত্নতাত্ত্বিক। আপনি কি পারবেন রহস্যের আসল সত্যটি খুঁজে বের করতে? নিখোঁজ সংবাদ আসছে শীঘ্রই।",
      copyEn:
        "A missing archaeologist, a stormy Himalayan night, and secrets buried deep in mist. Can you solve the puzzle before the trail goes cold?",
      cta: "এখনই আপনার ক্যালেন্ডারে সেভ করুন",
      hashtags: ["NikhojSongbad", "hoichoiOriginals", "BengaliThriller", "ComingSoon"],
      imageUrl: "/spike_images/spike_instagram.jpg",
      imagePrompt: "1:1 close-up moody cinematic portrait of a detective holding an antique brass flashlight in pouring rain",
      bengaliNativenessPassed: true,
      status: "PENDING_APPROVAL" as const,
    },
    {
      channel: "FACEBOOK" as const,
      type: "COPY" as const,
      copyBn:
        "সত্য নাকি গভীর কোনো ষড়যন্ত্র? কুয়াশার ওপারে লুকিয়ে থাকা অন্ধকার সত্য প্রকাশ পেতে চলেছে। নিখোঁজ সংবাদ – একটি শিহরণ জাগানো থ্রিলার ওয়েব সিরিজ আসছে শুধুমাত্র hoichoi-তে। আপনার থ্রিলারপ্রেমী বন্ধুদের ট্যাগ করে জানিয়ে দিন এখনই!",
      copyEn:
        "Truth or an ominous conspiracy? Step into the shadows with Nikhoj Songbad, premiering soon on hoichoi. Tag your thriller binge partner!",
      cta: "hoichoi অ্যাপ ডাউনলোড করে প্রস্তুত থাকুন",
      hashtags: ["NikhojSongbad", "NewRelease", "BengaliSeries"],
      imageUrl: "/spike_images/spike_facebook.jpg",
      imagePrompt: "16:9 wide atmospheric landscape of misty forested hill road with a solitary vintage police jeep at dusk",
      bengaliNativenessPassed: true,
      status: "PENDING_APPROVAL" as const,
    },
    {
      channel: "TWITTER" as const,
      type: "COPY" as const,
      copyBn:
        "প্রতিটি পদক্ষেপে মিথ্যার জাল। নিখোঁজ সংবাদ আসছে hoichoi-তে। আপনি কি প্রস্তুত রহস্য ভেদ করতে?",
      copyEn:
        "Webs of deception at every turn. Nikhoj Songbad is coming soon on hoichoi. Are you ready?",
      cta: "Stream exclusively on hoichoi",
      hashtags: ["NikhojSongbad", "hoichoi"],
      imageUrl: "/spike_images/spike_twitter.jpg",
      imagePrompt: "16:9 high contrast neo-noir graphic key art with crimson umbrella and misty silhouette",
      bengaliNativenessPassed: true,
      status: "PENDING_APPROVAL" as const,
    },
  ];

  for (const assetData of nikhojAssets) {
    const asset = await prisma.contentAsset.create({
      data: {
        briefId: nikhojBrief.id,
        ...assetData,
      },
    });

    await prisma.complianceCheck.createMany({
      data: [
        { assetId: asset.id, rule: "character_limit", passed: true },
        { assetId: asset.id, rule: "hashtag_count", passed: true },
        { assetId: asset.id, rule: "cta_requirement", passed: true },
      ],
    });
  }

  // 3. Seed Weekly AI Report with Real Vector Embeddings (pgvector closed loop)
  console.log("Generating Weekly AI Report with pgvector insight embeddings...");
  const report = await prisma.weeklyReport.create({
    data: {
      periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      summary:
        "Performance analysis across recent hoichoi campaigns revealed massive engagement on nostalgic family drama content, with Facebook driving peak viral shares and Instagram driving 3x higher direct comment discussions when questions are framed in colloquial Bengali.",
      keyInsights: [
        {
          claim:
            "Emotional nostalgic Bengali copy with culinary/family imagery delivers 48% higher share rate on Facebook than generic promotional announcements.",
          citedPostIds: ["post_indubala_facebook"],
        },
        {
          claim:
            "Direct open-ended interactive questions in native Bengali ('আপনার সবচেয়ে প্রিয় স্মৃতির স্বাদ কোনটি?') on Instagram quadruple audience comment depth.",
          citedPostIds: ["post_indubala_instagram"],
        },
        {
          claim:
            "Punchy, high-suspense thriller hooks under 140 characters on Twitter/X generate 2.5x more quote retweets than multi-sentence summaries.",
          citedPostIds: ["post_indubala_twitter"],
        },
      ],
    },
  });

  // Embed the insights into pgvector
  const insightsToEmbed = [
    "Emotional nostalgic Bengali copy with culinary/family imagery delivers 48% higher share rate on Facebook than generic promotional announcements.",
    "Direct open-ended interactive questions in native Bengali ('আপনার সবচেয়ে প্রিয় স্মৃতির স্বাদ কোনটি?') on Instagram quadruple audience comment depth.",
    "Punchy, high-suspense thriller hooks under 140 characters on Twitter/X generate 2.5x more quote retweets than multi-sentence summaries.",
    "Mystery and thriller posters with high-contrast neo-noir color palettes achieve the highest click-through rates across both Facebook and Instagram.",
  ];

  for (const claim of insightsToEmbed) {
    try {
      const vector = await getEmbedding(claim);
      const vectorStr = `[${vector.join(",")}]`;
      const id = `ins_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO insight_embeddings (id, "weeklyReportId", claim, embedding, "createdAt")
         VALUES ($1, $2, $3, $4::vector, NOW())`,
        id,
        report.id,
        claim,
        vectorStr
      );
      console.log(`  ✓ Embedded insight: "${claim.substring(0, 50)}..."`);
    } catch (e) {
      console.warn("  ⚠ Error generating embedding:", e);
    }
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
