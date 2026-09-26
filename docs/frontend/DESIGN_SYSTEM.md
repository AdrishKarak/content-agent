# Design System — "Sticker Studio" Neobrutalism

## Brief

Neobrutalism: thick black borders, hard offset shadows, flat bold colors, white background. This version is also **funny** — the internet-native, meme-literate kind of funny, not a joke slapped on top. The joke is baked into the actual visual grammar: this is a tool for making social content, so the UI treats every asset like a **sticker slapped onto a page** — slightly rotated, taped-on, a little chaotic — which is exactly the aesthetic vocabulary of the content it's producing. The "match" in "funny and matching" is that a social-media content tool looking like a scrapbook of stickers isn't decoration, it's the actual subject matter wearing its own aesthetic.

## Color

| Name | Hex | Role |
|---|---|---|
| Paper | `#FFFFFF` | Background — required for hard shadows to read, same reasoning as any neobrutalist system |
| Ink | `#161616` | Borders, text, shadows |
| Hot Pink | `#FF2E93` | Instagram-tagged content |
| Electric Blue | `#2F6FFF` | Facebook-tagged content |
| Jet (chip) | `#161616` fill / `#FFFFFF` text | X-tagged content — X's real brand identity is monochrome, so it's the one "quiet," black-and-white chip among two loud colors, which itself reads as a small joke once you notice it |
| Lime Yes | `#B6FF3C` | Approve / passed / published |
| Sunshine Maybe | `#FFD23C` | Regenerate / pending |
| Tomato No | `#FF4D3C` | Reject / compliance failure |

Same principle as before: channel color = which platform, status color = where in the pipeline, and they're never conflated. What's new is the palette is louder and more saturated than a "light pastel" neobrutalism — full, confident, poster-paint colors, because the brief this time called for funny, and funny reads as bold, not muted.

## Typography

| Role | Typeface | Why |
|---|---|---|
| Display / headings / sticker labels | **Bungee** | A chunky, rounded-block display face built for exactly this energy — sign-painting/poster-sticker vibes. Doing double duty as both page headings AND the "sticker" badge text keeps the joke consistent instead of introducing a fourth typeface just to be funny. |
| Body / UI | **Inter** | Everything functional — labels, tables, forms — stays completely legible. The joke lives in the layout and the stickers, not in illegible novelty body text. |
| Data (metrics, post IDs, dates) | **JetBrains Mono** | Reserved narrowly for the Analytics/Insights views where numbers need to align in columns — same justification as the prior design system, unchanged because the reasoning still holds regardless of theme. |

Two personality-carrying families (Bungee for voice, Inter for legibility), one narrow functional exception — same discipline as before, just a louder Bungee doing more visual work this time since it's also the sticker font.

## Voice & microcopy — where the "funny" actually lives

A neobrutalist skin alone isn't funny; the copy has to carry it. This is the one place this theme differs structurally from a typical design system doc, because tone-of-voice is part of the design here, not separate from it.

| Moment | Generic version | This system's version |
|---|---|---|
| Empty Studio state | "No campaigns yet." | "Nothing cooking yet. Feed me a brief." |
| Compliance rejection | "Character limit exceeded." | "That's 312 characters. X gives you 280. Trim it or it's not going anywhere." |
| Approve button | "Approve" | "Ship It" |
| Reject button | "Reject" | "Nope" |
| Regenerate button | "Regenerate" | "Take Two" |
| Bengali nativeness check failed | "Nativeness check failed." | "Reads like it went through Google Translate. Try again — natively, this time." |
| High-performing post badge (Insights) | "Top performer" | "🔥 Certified Banger" |
| Weekly report, no data | "Insufficient data." | "Not enough posts to say anything smart yet. Ask again next week." |

**Rule for writing this copy:** funny, never mean — the target of the joke is always the *situation* (a broken rule, an empty queue, a slow week), never the user. A rejection message that makes the reviewer feel dumb is a bad rejection message regardless of how the border-radius looks. Keep every line short enough to fit in a sticker.

## Layout

Same sidebar-plus-content shell as a standard neobrutalist dashboard, with one specific addition: **every `ContentAsset` card is rendered as a literal sticker** — slightly rotated (-2° to 3°, randomized per card but stable per asset ID so it doesn't jitter on re-render), with a hard offset shadow that stays unrotated so it still reads as "resting flat on the page" beneath a tilted sticker.

- Cards get a small random rotation seeded by asset ID — this is the single visual gesture that makes the "sticker" metaphor read immediately, and it should not be applied to anything else (buttons, nav, charts stay perfectly square) or the effect dilutes into generic messiness.
- The status badge on each card doubles as the "sticker's" caption — set in Bungee, in the status color, e.g. a Lime "Ship It 🔥" or Tomato "Nope ❌" — this is where the microcopy table above becomes visible UI, not just copy in a spec doc.
- **The Approval queue is a literal corkboard/scrapbook layout** — cards scattered (gently, not chaotically) across a Paper background, rather than a rigid list — reinforcing the "you're curating a scrapbook of content" framing the whole system leans into.
- Everywhere else (nav, forms, charts, the comparison table) stays perfectly square and unrotated — the fun is concentrated in the one place it means something (the content itself), per the same "spend your one bold gesture deliberately" principle as before.

## Component patterns

**Buttons** — same signature neobrutalist press interaction as before (shadow collapses, button shifts into it on click), now paired with the funnier labels from the voice table: Ship It (Lime fill), Nope (Tomato outline), Take Two (Sunshine outline, reveals a feedback text field on click).

**Sticker cards** — Paper background, 2–3px Ink border, hard offset shadow, slight seeded rotation (content cards only, per Layout above). Corner treatment stays minimal-radius, matching every bordered element for consistency.

**Compliance failure "torn ticket"** — instead of a plain error banner, render a compliance failure as a small torn-edge ticket stub (a jagged bottom edge via CSS `clip-path`, Tomato fill) with the specific rule + reason in Inter — a small, on-theme visual joke ("this got rejected at the door") that still satisfies the hard requirement of showing a clear, specific reason (`product/ACCEPTANCE_CRITERIA.md` AC 6.1).

**Charts** — flat fills in the three channel colors, Ink axis lines, no gradients, no shadows on individual chart elements — restrained, same reasoning as the prior system: the joke lives in the cards and the copy, not in every pixel.

## Accessibility

- **Never white text on Lime or Sunshine** — both are light/bright enough to fail contrast; use Ink text on both. Tomato is dark enough to carry white text safely.
- **Rotation is capped small (max ±3°)** and only ever applied to non-critical decorative framing — never to text that needs to stay easily readable, and never to the Approve/Reject/Regenerate buttons themselves, which must stay perfectly legible and precisely clickable given how consequential a misclick is here.
- **`prefers-reduced-motion`**: disable the button press-shift transition; the seeded card rotation is static (not animated) so it's unaffected either way.
- Status and channel are still never color-only — every sticker card carries its status as Bungee text, not just a color.

## Implementation notes (Tailwind + shadcn/ui)

- Same override pattern as any neobrutalist build on shadcn: near-zero `--radius`, a shared `neo-shadow` utility, palette as Tailwind theme colors (`paper`, `ink`, `pink`, `blue`, `jet`, `lime`, `sunshine`, `tomato`).
- Card rotation: derive a small deterministic rotation value from the asset's `id` (e.g. hash the id, map to a `-3deg`–`3deg` range) rather than `Math.random()` on every render — this is what keeps it "stable per asset" rather than distractingly re-randomizing on every page load.
- The torn-ticket compliance shape: a single reusable `clip-path` utility class, not a bespoke SVG per instance — one implementation, reused everywhere a compliance failure renders.
- `statusColorMap` and `channelColorMap` stay exactly as structured in the prior version of this doc — the underlying data-to-color mapping logic doesn't change with the theme, only the actual hex values and the copy layered on top.

## Restraint check

The rotated sticker card is this system's one big, memorable gesture — resist adding it anywhere else (don't rotate nav items, buttons, or charts "for consistency," since a rotated button is just harder to click, not funnier). The jokes in the copy table are the other half of "funny" — keep adding one-liners in that voice as new UI surfaces get built, but keep the rule from that section: funny about the situation, never at the user's expense.
