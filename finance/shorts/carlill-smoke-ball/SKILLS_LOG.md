# SKILLS_LOG: carlill-smoke-ball (Court Of Weird)

Skill packs: `.claude/skills/youtube-*` (ravsau/youtuber-skills) and `.claude/skills/yt-*` (jakeschincariol/youtube-agent-skill).
Voice profile read by the `yt-*` skills: `docs/voice_court_of_weird.md`, copied to `~/.claude/youtube/voice.md`.
All 24 SKILL.md files were read once at the start of the session (Nov 23, 2026).

| Skill | Used? | What it concretely changed |
|---|---|---|
| youtube-shorts | used | Short only. The but/then rule produced line 1: "A company promised a hundred pounds to anyone who caught the flu while using its product. **Then** a customer did, **but** it refused to pay." The draft opened on "In eighteen ninety-two". Hashtags from its spec were NOT used (owner rule). |
| yt-viral | used, limited | `swipe.py` needs four or more public videos per channel with view counts; none could be collected from this container (no YouTube listing access, vidIQ connector at 0 credits), so no multiples are claimed. Its formula list was used to name the hook: "The Impossible" (an ad pays you for getting sick). |
| youtube-outliers | used, limited | Public view counts unavailable, stated instead of guessed (the skill's own rule). The only measured reference is the channel's own Pearson (1.2K views, 67% stayed) and Pepsi (705) Shorts: "who did what to whom + the money in line 1". This Short repeats that single variable: "[Company] promised [money] if [its product failed]; a customer claimed it; the company refused". |
| yt-script | used | Five hooks through `hookscore.py`: 39 ("What happens when an ad promises money and a customer actually claims it?"), 37, 35 (kept), 34, 34; all WEAK on ADDRESS. The 39 hook drops the two specifics the story lives on (the flu, the hundred pounds), which the skill's own rule ("specific beats big") argues against; the 37 hook says "bet", and the court said it was not a bet. The tool's SPECIFICITY note put the sum in line 1. |
| youtube-script | used | Setup lines 2-4 (the ad, the directions, the bank deposit), tension lines 5-6 (she gets the flu; "a mere puff"), payoff line 7. Pattern interrupts: the counter landing on "one hundred pounds", the deposit slip, the stamp on "Pay her". None of its banned words appear. |
| yt-package | used | Ten titles through `title.py`: two at 100, eight at 94. With thumbnail text, **"Catch the Flu, Win £100: The Ad That Backfired" + "PAY HER" scored 98** and is the pick: it carries the offer in the first 24 characters, where the mobile cut cannot lose it. Backup: "The Smoke Ball That Cost Its Maker £100" (100 alone, but "smoke ball" means nothing to a cold viewer). |
| youtube-packaging (+ VISUAL-CHECKS.md) | used | Truth gate: "The 1892 Flu Cure That Owed a Customer £100" dropped ("cure" is the company's claim, not ours). "Win" in the pick is the ad's reward, shown at 2 s and 12 s. Thumbnail object-led (the stamp). Comprehension check is an editorial prediction. |
| youtube-virality-gate | used | Shorts gates 1-4 and 6. 1 Title trigger PASS. 2 Thumbnail adds PASS. 3 First 5 seconds PASS (£100 on screen at 0.0 s; the refusal spoken by 7 s). 4 Promise kept PASS. 6 Only you PASS narrowly: a law-school staple; what is added is the ad quoted from the judgment and the company's arguments given straight. SHIP 5/5. Batch check: every Short this week shares one structure; the human addition is the primary-source fact-check in sources.md. |
| youtube-description | used | Browse surface. Objection line: the company's four arguments, and that the video does not judge the product. One comment question. Fixed footer. No tags, hashtags or offer link. |
| yt-seo | used | Queries: "carlill v carbolic smoke ball", "company refused to pay reward court case", "100 pound flu reward ad". The title carries the third; the description opens with the full case name. No tags (owner rule). |
| yt-shorts | skipped | It cuts Shorts out of a long video's transcript; this Short is written directly. Its writing rules were still applied: the on-screen hook text differs from the spoken line, and the last line loops into line 1. |
| yt-plan | skipped | The week is already planned by the owner (docs/SKILLS_TEST_WEEK.md). |
| yt-chapters, youtube-edit-list, yt-edit | skipped | No chapters on a Short; no raw recording or rough cut to tighten (the voice is generated line by line). |
| youtube-connect, youtube-retention, yt-retention, youtube-channel-audit, yt-audit, youtube-comments-to-ideas, yt-comment | skipped | Need channel analytics, retention exports or comments that this session does not have. |
| youtube-lane, youtube-monetization | skipped | Channel-level strategy, not a per-Short step. |

Ship it, or change it? (the packs' own closing question; nothing here publishes)
