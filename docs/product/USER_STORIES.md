# User Stories

Format: *As a [user], I want [capability], so that [benefit].*

## Brief & Generation

1. As a content manager, I want to submit a plain-text campaign brief, so that I don't have to manually write structured metadata for every campaign.
2. As a content manager, I want the system to infer genre, target audience, language, and tone from my brief, so that generation is grounded in something more specific than the raw text.
3. As a content manager, I want distinct copy generated for Instagram, Facebook, and X — not the same text reused — so that each post reads naturally on its platform.
4. As a content manager, I want Bengali content generated natively, not translated from English, so that it doesn't read awkwardly to Bengali-speaking audiences.
5. As a content manager, I want a genuinely different image generated per channel, so that each platform's visual actually fits that platform's format and audience expectation (e.g. square/visual-first for Instagram vs. wide/informative for Facebook).

## Compliance

6. As a content manager, I want the system to check every asset against its target channel's character limit, aspect ratio, and file size before I ever see it for approval, so that I'm not the one manually verifying platform rules.
7. As a content manager, I want a clear reason when an asset is rejected for a compliance violation, so that I understand what needs to change, whether I'm regenerating or fixing it myself.

## Approval

8. As a content manager, I want to review every generated asset before it can be scheduled, so that nothing goes out that I haven't personally checked.
9. As a content manager, I want to Approve, Reject, or Regenerate each asset individually, so that one bad image doesn't block an otherwise-good campaign.
10. As a content manager, I want Regenerate to actually incorporate my rejection feedback, so that the second attempt isn't just a random re-roll of the same prompt.

## Publishing & Scheduling

11. As a content manager, I want to schedule approved content for a specific time per channel, so that I control campaign timing without needing real platform access during a hackathon demo.
12. As a content manager, I want to see a realistic mock "published" state (platform, post ID, timestamp) after scheduling fires, so that the demo convincingly shows the full lifecycle without needing real API keys.

## Analytics & Insights

13. As a content manager, I want to see performance metrics per published post, so that I can judge what's working.
14. As a content manager, I want to compare the same campaign's performance across channels side by side, so that I can tell which channel or which creative approach is actually working — not just see three unrelated numbers.
15. As a content manager, I want a weekly AI-written summary of what performed well, so that I don't have to manually pore over every metric myself.
16. As a content manager, I want every claim in that summary to cite the actual post(s) it's based on, so that I can trust and verify the AI's conclusions rather than taking them on faith.
17. As a content manager, I want past insights to actually influence how my next brief is analyzed and generated, so that the system demonstrably learns from what's worked before, not just archives reports nobody reopens.

## Non-functional / trust stories

18. As a content manager, I want to be certain nothing gets published without my explicit approval, even if I forget to check for a while, so that the system never acts autonomously on my behalf.
19. As a judge/reviewer, I want to be able to submit a deliberately non-compliant test asset and watch it get rejected, so that I can verify the compliance layer is real and not just for show.
