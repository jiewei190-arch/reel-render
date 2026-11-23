# SKILLS_LOG: moore-patented-cells (Court Of Weird)

Skill packs: `.claude/skills/youtube-*` (ravsau/youtuber-skills) and `.claude/skills/yt-*` (jakeschincariol/youtube-agent-skill).
Voice profile read by the `yt-*` skills: `docs/voice_court_of_weird.md`, copied to `~/.claude/youtube/voice.md`.
All 24 SKILL.md files were read once at the start of the session (Nov 23, 2026).

| Skill | Used? | What it concretely changed |
|---|---|---|
| youtube-shorts | used | Short only. The but/then rule produced line 1: "A cell line grown from his cells was patented, **but** he says nobody told him. **Then** he sued." The draft opened in 1976 at the hospital; the patent was moved to second one. Hashtags from its spec were NOT used (owner rule). |
| yt-viral | used, limited | `swipe.py` needs four or more public videos per channel with view counts; none could be collected from this container (no YouTube listing access, vidIQ connector at 0 credits), so no multiples are claimed. Its formula list named the hook: "The Receipt" (the patent is the artifact shown at 0.4 s). |
| youtube-outliers | used, limited | Public view counts unavailable, stated instead of guessed. Reference is the channel's own Pearson and Pepsi Shorts: "who did what to whom + the money in line 1". Here the money is the hook card ("$3 BILLION?") because the spoken figure has to carry two hedges and sits better in line 5. |
| yt-script | used | Five hooks through `hookscore.py`: 48 ("Do you own your own cells? A court said no in 1990."), 44, 39, 38 (kept), 36; all WEAK. The top one was not used: it gives the ruling away in second three and addresses the viewer's own legal position, which the voice file keeps out. Its STAKES note is why "he sued" closes line 1. |
| youtube-script | used | Setup lines 2-3 (diagnosis, surgery, the Seattle flights), tension lines 4-5 (the cell line, the patent, the forecast), payoff lines 6-7 (no property claim, but the disclosure claim survives). Pattern interrupts: the sample box, the top-down patent paper, the cash forecast, the gavel. None of its banned words appear. |
| yt-package | used | Ten titles through `title.py`: six at 94, two at 80, two at 76 (no number). Two more written to put the year in: **"His Cells Were Patented in 1984. Then He Sued" + "WHO OWNS IT?" scored 98** and is the pick (45 characters; mobile cut keeps "His Cells Were Patented in 1984. Then..."). The 94 "The Patient Who Sued Over His Own Cells in 1990" was dropped: 1990 is the ruling, not the suit. |
| youtube-packaging (+ VISUAL-CHECKS.md) | used | Truth gate dropped "A $3 Billion Forecast, Built on His Spleen" (the forecast was for a product market, not his spleen), "He Gave Samples for 7 Years. Then Found the Patent" (how he found out is not in the opinion) and "He Got Nothing?" (payment unknown). Thumbnail is object-led (the patent paper). |
| youtube-virality-gate | used | Shorts gates 1-4 and 6. 1 Title trigger PASS (gap: did he win). 2 Thumbnail adds PASS ("WHO OWNS IT?" shares no word with the title). 3 First 5 seconds PASS (patent on screen by 0.4 s, "he sued" spoken by 5 s). 4 Promise kept PASS (the ruling answers who owns it, both halves). 6 Only you PASS: the forecast's source and the on-demurrer caveat come from the opinion. SHIP 5/5. Same batch note as the other Shorts: the human addition is the primary-source fact-check. |
| youtube-description | used | Browse surface. Objection line: allegations not findings, the forecast was not earnings, the court's research reason. One comment question. Fixed footer. No tags, hashtags or offer link. |
| yt-seo | used | Queries: "moore v regents", "who owns your cells court case", "patient cells patented lawsuit". The title carries the third; the description opens with the case name and year. "Conversion" appears once in the description, explained. No tags (owner rule). |
| yt-shorts | skipped | It cuts Shorts out of a long video's transcript; this Short is written directly. Its writing rules were still applied: the on-screen hook text differs from the spoken line, and the last line loops into line 1. |
| yt-plan | skipped | The week is already planned by the owner (docs/SKILLS_TEST_WEEK.md). |
| yt-chapters, youtube-edit-list, yt-edit | skipped | No chapters on a Short; no raw recording or rough cut to tighten (the voice is generated line by line). |
| youtube-connect, youtube-retention, yt-retention, youtube-channel-audit, yt-audit, youtube-comments-to-ideas, yt-comment | skipped | Need channel analytics, retention exports or comments that this session does not have. |
| youtube-lane, youtube-monetization | skipped | Channel-level strategy, not a per-Short step. |

Ship it, or change it? (the packs' own closing question; nothing here publishes)
