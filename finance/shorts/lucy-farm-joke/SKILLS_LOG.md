# SKILLS_LOG: lucy-farm-joke (Court Of Weird)

Skill packs: `.claude/skills/youtube-*` (ravsau/youtuber-skills) and `.claude/skills/yt-*` (jakeschincariol/youtube-agent-skill).
Voice profile read by the `yt-*` skills: `docs/voice_court_of_weird.md`, copied to `~/.claude/youtube/voice.md`.
All 24 SKILL.md files were read once at the start of the session (Nov 23, 2026).

| Skill | Used? | What it concretely changed |
|---|---|---|
| youtube-shorts | used | Short only. The but/then rule produced line 1: "He sold his farm on the back of a restaurant check, **then** said it was a joke. **But** a court made him sell." The draft opened on the whiskey; that moved to line 2. Hashtags from its spec were NOT used (owner rule). |
| yt-viral | used, limited | `swipe.py` needs four or more public videos per channel with view counts; none could be collected from this container (no YouTube listing access, vidIQ connector at 0 credits), so no multiples are claimed. Its formula list was used to name the hook: "The Impossible" (a joke on a restaurant check becomes a binding sale). |
| youtube-outliers | used, limited | Public view counts unavailable, stated instead of guessed (the skill's own rule). The only measured reference is the channel's own Pearson (1.2K views, 67% stayed) and Pepsi (705) Shorts: "who did what to whom + the money in line 1". This Short repeats that single variable: "[Person] did [binding thing] as a joke, then a court held him to it for $[amount]". |
| yt-script | used | Five hooks through `hookscore.py`: 38 ("Why did a court force a man to sell his farm over a note written on a restaurant check?"), 36 (kept), 34, 34, 34; all WEAK on ADDRESS. The 2-point gap did not justify giving up the outcome-first opening. The tool's SPECIFICITY note is why line 3 names both the buyer and the exact price instead of "a neighbour offers to buy". |
| youtube-script | used | Setup lines 2-4 (whiskey, the offer, the signatures), tension lines 5-7 (the whisper, the lawyer, "high as a Georgia pine"), payoff line 8. Pattern interrupts: the witness-stand orbit on the wife, the stamp on "It orders the sale". None of its banned words appear. |
| yt-package | used | Ten titles through `title.py`: two at 100, five at 94, three without a number at 76. The two 100s were checked against the facts: "A Drunk Joke Cost Him His 471-Acre Farm" fails (not too drunk; he was paid $50,000), so the pick is **"The $50,000 Farm Sale He Swore Was a Joke" + "SIGNED ANYWAY" (98)**. Backup: "The Farm Sold on a Guest Check in 1952" (100 alone). |
| youtube-packaging (+ VISUAL-CHECKS.md) | used | The truth gate overrode the linter (see yt-package). Thumbnail object-led: the guest check. "SIGNED ANYWAY" adds the fact the title leaves out. Comprehension check is an editorial prediction. |
| youtube-virality-gate | used | Shorts gates 1-4 and 6. 1 Title trigger PASS. 2 Thumbnail adds PASS. 3 First 5 seconds PASS ($50,000 on screen at 0.0 s; the outcome spoken by 6 s). 4 Promise kept PASS (his joke claim and the ruling are both in). 6 Only you PASS: the whisper, the Georgia-pine line and the court's finding on intoxication are quoted from the opinion. SHIP 5/5. Batch check: every Short this week shares one structure; the human addition is the primary-source fact-check in sources.md. |
| youtube-description | used | Browse surface. Objection line: he was found not too intoxicated, the talk ran forty minutes, the trial court had ruled the other way, and no sharp practice by Lucy. One comment question. Fixed footer. No tags, hashtags or offer link. |
| yt-seo | used | Queries: "lucy v zehmer", "sold farm as a joke court case", "contract written on a napkin". The title carries the second; the description opens with the case name. "Napkin" was NOT used anywhere: the opinion says a restaurant or guest check. No tags (owner rule). |
| yt-shorts | skipped | It cuts Shorts out of a long video's transcript; this Short is written directly. Its writing rules were still applied: the on-screen hook text differs from the spoken line, and the last line loops into line 1. |
| yt-plan | skipped | The week is already planned by the owner (docs/SKILLS_TEST_WEEK.md). |
| yt-chapters, youtube-edit-list, yt-edit | skipped | No chapters on a Short; no raw recording or rough cut to tighten (the voice is generated line by line). |
| youtube-connect, youtube-retention, yt-retention, youtube-channel-audit, yt-audit, youtube-comments-to-ideas, yt-comment | skipped | Need channel analytics, retention exports or comments that this session does not have. |
| youtube-lane, youtube-monetization | skipped | Channel-level strategy, not a per-Short step. |

Ship it, or change it? (the packs' own closing question; nothing here publishes)
