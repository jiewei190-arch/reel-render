# Batch N: the next 30 reels (from Nov 3; 5 a day on TikTok and YouTube)

Owner, Oct 28: "make more reels for the coming weeks and follow the guide you created". The main session runs this batch and approves storyboards itself (HANDOFF rule 18). Topics come from the main session's search-demand research (handoff/topics_next30.md). Each worker gets about 7-8 topics.

## Read first (branch claude/reel-studio-handoff-f70dcj; pull it before every reel)
HANDOFF.md rules 1-18, LESSONS.md (all of it), GROWTH.md (checklist), HOOKS.md (v2 checklist at the bottom), research/RETENTION.md (second-by-second template), STYLE_FIT.md (incl. REJECTED), TEMPLATES.md (29 approved styles), QA.md.

## Per reel, in order (rule 17)
1. **Pick the template** whose storytelling engine *is* the explanation (STYLE_FIT). Don't use the same template on two consecutive reels of yours. Reproduce the real demo; a loose look counts as a fail.
2. **Script** to the RETENTION.md template:
   - the exact search question spoken in the first sentence or two;
   - a hook from HOOKS_V2's patterns; first line of 12 words or fewer; "but" by 5 s;
   - re-hooks at about 25 s and 45-50 s; payoff at 50-65 s;
   - a one-word question, then exactly "Follow for more of how it really works.";
   - 66-86 s (aim 70-78);
   - every claim in sources_<n>.md, with at least one primary or institutional source; soften or cut anything unverified;
   - years written so voice2.py reads them right.
3. **Storyboard**: push jobs/<n>/storyboard_<n>.jpg (6 stills: hook, but-turn, ~25 s re-hook, wow moment, ~48 s re-hook, end card) plus hooks_<n>.md (3 opening lines, your pick marked), then message the main session one line. Don't wait for a reply: keep going on the build unless the main session says stop or change.
4. **Build**:
   - captions at y about 1150-1420;
   - text out of the top 250 px, the bottom 480 px and the right column (x > 900 from y 840);
   - a visible change at least every 4 s;
   - the ending fades at most 50% and loops into frame 0;
   - the standard end card: the main line + "A new 'wait, really?' every day." + @howitreallyworkstudio;
   - pinned_<n>.md;
   - a thumbnail (thumb.py).
5. **QA**: `python3 -I reels/qa.py <n>` must have no FAIL; paste the summary into NOTES.md, with the GROWTH checklist ticked.
6. **Episode badge (you do it)**: the main session gives your reel an episode number when it approves the storyboard. After qa.py passes, run `python3 -I reels/brand.py <n> --ep <number>`, then check frames at 6 s, 25 s, 45 s and near the end. The badge must not touch any title, label or caption, must stay out of the top 250 px, the bottom 480 px and the right column at y >= 840. If it collides, add an OVR entry in brand.py (a spot plus hide windows). Push `<n>_ep.mp4` and your OVR line.
7. **Push** the final set (mp4, preview, thumb, caption, sources, pinned, NOTES, code, STYLE_FIT row), then message the main session. The main session assigns a peer reviewer, adds the episode number, runs brand.py and schedules.

## Assignments
Filled in by the main session in handoff/topics_next30.md (column "worker").
