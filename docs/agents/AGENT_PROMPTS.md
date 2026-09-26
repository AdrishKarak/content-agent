# Agent Prompts

## Brief Analyzer Agent

```
Extract a structured campaign spec from this content brief. Return ONLY valid JSON matching:

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
{{rawBriefText}}
"""
```

## Content Generator Agent — per-channel templates

Each channel gets a genuinely distinct template, not one generic prompt with a channel name swapped in.

**Instagram** (visual-first, casual, hashtag-heavy):
```
Write an Instagram caption for this campaign. Instagram captions are casual, visually-oriented,
and use generous relevant hashtags (8-15). Keep the caption itself short (1-3 sentences) since
the image carries most of the message. Include a clear, punchy CTA.

Campaign: {{spec}}
Language: {{language}}
{{#if retrievedInsights}}
Past campaigns with similar genre/tone found this worked well: {{retrievedInsights}}
Consider this pattern, but don't force it if it doesn't fit this specific brief.
{{/if}}
{{#if regenerationFeedback}}
The previous attempt was rejected with this feedback: "{{regenerationFeedback}}" — address it directly.
{{/if}}

Return JSON: { "copy": string, "cta": string, "hashtags": string[] }
```

**Facebook** (more informative, longer-form, fewer hashtags):
```
Write a Facebook post for this campaign. Facebook posts can be longer and more informative than
Instagram — include context a reader unfamiliar with the show/product would need. Use 2-4
hashtags, not more. CTA can be slightly more detailed (e.g. "Watch the trailer now" rather than
just "Watch now").

Campaign: {{spec}}
Language: {{language}}
[... same conditional insight/feedback blocks as above ...]

Return JSON: { "copy": string, "cta": string, "hashtags": string[] }
```

**X/Twitter** (compact, high-energy, character-constrained):
```
Write an X (Twitter) post for this campaign. Must fit within 280 characters INCLUDING hashtags
and CTA. Be punchy and high-energy — X rewards brevity and a strong hook in the first few words.
Use 1-3 hashtags maximum.

Campaign: {{spec}}
Language: {{language}}
[... same conditional insight/feedback blocks as above ...]

Return JSON: { "copy": string, "cta": string, "hashtags": string[] }
```

**Bengali generation note:** when `language` includes `"bn"`, the prompt is sent to the model with the instruction to write **directly in Bengali** — never "write in English then translate to Bengali" as a two-step process. The model receiving one prompt in the target language, asked to produce output in that language, is what "native generation" means here; a translation step of any kind defeats the purpose regardless of how it's dressed up.

## Bengali Nativeness Guardrail

```
You are evaluating whether the following Bengali text reads as natively written by a fluent
Bengali speaker, or as a translation from English (even a good one). Translated text often has:
overly literal phrasing, unnatural word order, English idioms rendered word-for-word, or a
slightly formal/stiff register inconsistent with casual social media writing.

Text to evaluate:
"""
{{generatedBengaliText}}
"""

Return ONLY JSON: { "readsAsNative": boolean, "reason": string }
```

See `agents/GUARDRAILS.md` §2 for how this result is used (retry logic, escalation to Sarvam AI).

## Image Agent — per-channel prompt composition

```
Generate an image prompt for {{channel}}'s specific visual style, based on this campaign:

Campaign: {{spec}}

{{#if channel == "instagram"}}
Style: cinematic, close/intimate framing, character or mood-focused, minimal or no text overlay
(Instagram audiences respond to strong visuals over text-heavy images), square or portrait
composition.
{{/if}}
{{#if channel == "facebook"}}
Style: wider composition, can include release date/title text overlay since Facebook audiences
engage with more informative visuals, landscape composition.
{{/if}}
{{#if channel == "twitter"}}
Style: high-contrast, bold, attention-grabbing at small thumbnail size (X's feed shows images
small), landscape or square composition.
{{/if}}

Return a single, detailed image generation prompt (not JSON — plain text prompt for the image model).
```

Three separate calls to this template (one per channel) is what produces three genuinely different generation prompts — see `architecture/DECISIONS.md` ADR-002.

## Insight Agent — weekly report

```
Write a weekly content performance summary based on this structured data. Every specific claim
(a number, a comparison, a "performed better") MUST cite the post ID(s) it's based on. Do not
state anything not directly supported by the data below.

Metrics data: {{structuredMetricsData}}
Cross-platform comparisons: {{comparisonData}}

If there is insufficient data for a meaningful comparison, say so explicitly rather than
generating a plausible-sounding but unsupported summary.

Return JSON: {
  "summary": string,
  "keyInsights": [{ "claim": string, "citedPostIds": string[] }]
}
```

The `keyInsights` array (not just the prose `summary`) is what gets embedded into `InsightEmbedding` for retrieval by future briefs (`architecture/AGENT_DESIGN.md` stage 10) — embedding structured, citation-backed insights rather than free-form prose keeps what's retrieved later grounded and specific.

## General conventions

- Every prompt requesting JSON specifies the exact shape inline.
- Every prompt that includes retrieved past-insight context or regeneration feedback treats it as *context to consider*, not an instruction to blindly follow — the model should still adapt to the current brief's specifics.
- Bengali and English generation use the same template structure per channel, differing only in the language instruction — this keeps the two languages' tailoring logic (tone/length/hashtags per channel) consistent, so a channel doesn't get systematically worse treatment in one language than the other.
