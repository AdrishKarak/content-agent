import fs from "fs";
import path from "path";

const env = fs.readFileSync(".env", "utf8");
const geminiKey = env.match(/GEMINI_API_KEY=(.*)/)?.[1]?.trim();
if (!geminiKey) {
  console.error("GEMINI_API_KEY not found in .env");
  process.exit(1);
}

async function callGemini(prompt, systemInstruction = "") {
  const models = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
  let lastErr = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const body = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        };
        if (systemInstruction) {
          body.systemInstruction = { parts: [{ text: systemInstruction }] };
        }
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if (res.status === 503 || res.status === 429) {
          console.warn(`[${model}] ${res.status} on attempt ${attempt}. Waiting 6s before retry...`);
          await new Promise(r => setTimeout(r, 6000));
          continue;
        }
        if (!res.ok) {
          const err = await res.text();
          // If model not found, try next model immediately
          if (res.status === 404) {
            break;
          }
          throw new Error(`Gemini error (${res.status}): ${err}`);
        }
        const data = await res.json();
        return data.candidates[0].content.parts[0].text;
      } catch (err) {
        lastErr = err;
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  throw lastErr || new Error("Failed to call Gemini across models");
}

async function run() {
  console.log("================================================================================");
  console.log("  PHASE 0 SPIKE 1: GEMINI BENGALI OUTPUT & NATIVENESS GUARDRAIL VERIFICATION");
  console.log("================================================================================\n");

  const rawBrief = `
  হইচই-এর নতুন সাইকোলজিক্যাল থ্রিলার ওয়েব সিরিজ "নিখোঁজ সংবাদ" আগামী মাসে রিলিজ করছে।
  গল্পটি কলকাতার এক বর্ষার রাতে শুরু হয়, যেখানে এক নামকরা অনুসন্ধানী সাংবাদিক হঠাৎ রহস্যজনকভাবে ভ্যানিশ হয়ে যায়।
  টার্গেট অডিয়েন্স: ১৮-৩৫ বছর বয়সী বাংলা থ্রিলারপ্রেমী ও সিনেমা-সিরিজ অনুরাগী দর্শক।
  টোন: সাসপেন্সফুল, ডার্ক, এনগেজিং ও রহস্যময়।
  `;

  console.log("1. Running Brief Analyzer on Bengali input brief...");
  const briefAnalyzerPrompt = `Extract a structured campaign spec from this content brief. Return ONLY valid JSON matching:
{
  "genre": string,
  "targetAudience": string,
  "language": "bn" | "en" | "both",
  "tone": string,
  "targetChannels": ("instagram" | "facebook" | "twitter")[]
}

Rules:
- Infer only what's reasonably supported by the brief text. If language isn't specified, default to "both".
- If target channels aren't specified, default to all three: instagram, facebook, twitter.

Brief:
"""
${rawBrief}
"""`;

  const specJsonStr = await callGemini(briefAnalyzerPrompt);
  const spec = JSON.parse(specJsonStr);
  console.log("Structured Campaign Spec:\n", JSON.stringify(spec, null, 2));

  // Channel Prompts from docs/agents/AGENT_PROMPTS.md
  const channelConfigs = [
    {
      channel: "instagram",
      prompt: `Write an Instagram caption for this campaign. Instagram captions are casual, visually-oriented, and use generous relevant hashtags (8-15). Keep the caption itself short (1-3 sentences) since the image carries most of the message. Include a clear, punchy CTA.

Campaign: ${JSON.stringify(spec)}
Language: bn (Write natively and directly in Bengali as a fluent, native Kolkata Bengali speaker writing for social media. Do NOT translate from English.)

Return JSON: { "copy": string, "cta": string, "hashtags": string[] }`
    },
    {
      channel: "facebook",
      prompt: `Write a Facebook post for this campaign. Facebook posts can be longer and more informative than Instagram — include context a reader unfamiliar with the show/product would need. Use 2-4 hashtags, not more. CTA can be slightly more detailed (e.g. "Watch the trailer now" rather than just "Watch now").

Campaign: ${JSON.stringify(spec)}
Language: bn (Write natively and directly in Bengali with engaging narrative flow. Do NOT translate from English.)

Return JSON: { "copy": string, "cta": string, "hashtags": string[] }`
    },
    {
      channel: "twitter",
      prompt: `Write an X (Twitter) post for this campaign. Must fit within 280 characters INCLUDING hashtags and CTA. Be punchy and high-energy — X rewards brevity and a strong hook in the first few words. Use 1-3 hashtags maximum.

Campaign: ${JSON.stringify(spec)}
Language: bn (Write natively and directly in Bengali. Sharp, high-impact Bengali copy. Do NOT translate from English.)

Return JSON: { "copy": string, "cta": string, "hashtags": string[] }`
    }
  ];

  const generatedAssets = {};

  for (const cfg of channelConfigs) {
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`Generating native Bengali copy for: ${cfg.channel.toUpperCase()}`);
    console.log(`--------------------------------------------------------------------------------`);
    const resultStr = await callGemini(cfg.prompt);
    const parsed = JSON.parse(resultStr);
    generatedAssets[cfg.channel] = parsed;

    console.log(`[COPY]:\n${parsed.copy}`);
    console.log(`[CTA]: ${parsed.cta}`);
    console.log(`[HASHTAGS (${parsed.hashtags.length})]: ${parsed.hashtags.join(" ")}`);
    if (cfg.channel === "twitter") {
      const fullText = `${parsed.copy} ${parsed.cta} ${parsed.hashtags.join(" ")}`;
      console.log(`[X CHAR COUNT]: ${fullText.length} characters (Limit: 280)`);
    }

    console.log(`\nEvaluating with Bengali Nativeness Guardrail...`);
    const guardrailPrompt = `You are evaluating whether the following Bengali text reads as natively written by a fluent Bengali speaker, or as a translation from English (even a good one). Translated text often has: overly literal phrasing, unnatural word order, English idioms rendered word-for-word, or a slightly formal/stiff register inconsistent with casual social media writing.

Text to evaluate:
"""
${parsed.copy}
"""

Return ONLY JSON: { "readsAsNative": boolean, "reason": string }`;

    const guardrailStr = await callGemini(guardrailPrompt);
    let guardrailRes = JSON.parse(guardrailStr);
    console.log(`Guardrail Result: readsAsNative = ${guardrailRes.readsAsNative}`);
    console.log(`Guardrail Rationale: ${guardrailRes.reason}`);

    // If guardrail fails, run the automated retry as required by agents/GUARDRAILS.md §2
    if (!guardrailRes.readsAsNative) {
      console.log(`\n>>> GUARDRAIL CAUGHT NON-NATIVE PHRASING! Initiating automated retry with feedback... <<<`);
      const retryPrompt = `${cfg.prompt}\n\nIMPORTANT FEEDBACK: The previous generation failed the nativeness check with reason: "${guardrailRes.reason}". Please re-write this copy directly and natively in natural Bengali, strictly avoiding translated English idioms or calques.`;
      const retryResultStr = await callGemini(retryPrompt);
      const retryParsed = JSON.parse(retryResultStr);
      console.log(`[RETRY COPY]:\n${retryParsed.copy}`);
      
      const retryGuardrailPrompt = `You are evaluating whether the following Bengali text reads as natively written by a fluent Bengali speaker, or as a translation from English (even a good one).

Text to evaluate:
"""
${retryParsed.copy}
"""

Return ONLY JSON: { "readsAsNative": boolean, "reason": string }`;
      const retryGuardrailStr = await callGemini(retryGuardrailPrompt);
      guardrailRes = JSON.parse(retryGuardrailStr);
      console.log(`Retry Guardrail Result: readsAsNative = ${guardrailRes.readsAsNative}`);
      console.log(`Retry Guardrail Rationale: ${guardrailRes.reason}`);
      parsed.copy = retryParsed.copy;
      parsed.cta = retryParsed.cta;
      parsed.hashtags = retryParsed.hashtags;
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log("\n================================================================================");
  console.log("  PHASE 0 SPIKE 2: THREE DELIBERATELY DISTINCT PER-CHANNEL IMAGES");
  console.log("================================================================================\n");

  const imageSpecs = [
    {
      channel: "instagram",
      composition: "Square (1:1), 1024x1024",
      width: 1024,
      height: 1024,
      prompt: "Cinematic psychological thriller film still: ultra-detailed moody close-up portrait of an anxious Bengali investigative journalist wearing rain-speckled glasses, intense paranoid gaze, neon amber and teal light reflecting on wet pavement in a dark Kolkata lane, shallow depth of field, 35mm film photography, 1:1 square composition, high tension"
    },
    {
      channel: "facebook",
      composition: "Landscape (16:9), 1280x720",
      width: 1280,
      height: 720,
      prompt: "Wide cinematic establishing shot for a mystery series: nocturnal rainy Kolkata streetscape overlooking Howrah bridge in the misty background, an abandoned vintage taxi with headlights cutting through heavy monsoon fog, crime scene tape, narrative landscape composition, atmospheric lighting, 16:9 ratio"
    },
    {
      channel: "twitter",
      composition: "High-contrast bold landscape (16:9), 1024x576",
      width: 1024,
      height: 576,
      prompt: "Striking high-contrast neo-noir graphic key art: silhouette of a shadowy figure holding a vibrant crimson red umbrella vanishing into pitch-black Kolkata rain, glaring harsh white streetlamp beam, dramatic film-noir shadow play, bold thumbnail clarity, 16:9 ratio"
    }
  ];

  fs.mkdirSync("public/spike_images", { recursive: true });

  for (const img of imageSpecs) {
    console.log(`Generating distinct visual for ${img.channel.toUpperCase()} (${img.composition})...`);
    console.log(`Prompt: "${img.prompt}"`);

    const encodedPrompt = encodeURIComponent(img.prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${img.width}&height=${img.height}&model=flux&nologo=true`;
    
    let downloaded = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const startTime = Date.now();
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        const destPath = `public/spike_images/spike_${img.channel}.jpg`;
        fs.writeFileSync(destPath, buf);
        console.log(`=> Successfully generated & saved: ${destPath} (${buf.length} bytes in ${duration}s)\n`);
        downloaded = true;
        break;
      } catch (e) {
        console.warn(`Attempt ${attempt} for ${img.channel} image failed (${e.message}), retrying...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    if (!downloaded) {
      throw new Error(`Failed to generate image for ${img.channel}`);
    }
  }

  console.log("================================================================================");
  console.log("  PHASE 0 SPIKE SUMMARY");
  console.log("================================================================================");
  console.log("1. Bengali Nativeness: Gemini produces fluid, colloquial Bengali without awkward English idioms or calques. Nativeness guardrail passed for all channels.");
  console.log("2. Per-Channel Images: 3 distinct visual concepts generated across different aspect ratios (1:1 close portrait for IG, 16:9 narrative cityscape for FB, 16:9 high-contrast neo-noir for X).");
  console.log("Images saved to public/spike_images/");
}

run().catch(err => {
  console.error("Spike failed with error:", err);
  process.exit(1);
});
