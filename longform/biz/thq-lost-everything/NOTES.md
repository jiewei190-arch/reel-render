# NOTES: the THQ video

**Status:** researched, written and fact-checked on 2026-11-24. Not voiced, not rendered, not uploaded. This is the
SECOND script: the owner moved the GTA 6 business video to first (`../gta-6-business/`).

## Length

- **2,989 words, 137 lines, about 20.3 minutes** at 2.45 words per second (`target_seconds` 1260; the brief's range
  was 2,950-3,250 words). The story supports the length without padding: the 2012 slide and the bankruptcy fight each
  carry a chapter on their own.

| Starts (est.) | Words | Chapter |
|---|---|---|
| 0:00 | 155 | Cold open + promise |
| 1:03 | 362 | Toy Headquarters |
| 3:31 | 299 | The Kids Leave |
| 5:33 | 365 | The Hollywood Bet |
| 8:02 | 603 | The Tablet |
| 12:08 | 376 | Forty-Five Cents |
| 14:41 | 492 | Thirty Days |
| 18:02 | 337 | What Was Left |

- Structure check: cold open about 63 s including the promise line (trim the two price lines if the editor wants it
  under 40 s). The cold open's tease (a children's drawing tablet pushed it over) is paid off in chapter 4, from about
  40% to 60% of the runtime, and gets 26 lines. The auction the video opens on returns in full in chapter 6.
- Voice tags: 5 lines carry one tag each. No whispering.

## Could not verify (full table in `sources.md`)

1. **A stated peak market value.** "$2 billion" in the title is defended two ways: about $2.4 billion computed from
   THQ's own filings (66.9 million shares x a $36.39 high), and a company-stated float of about $1.9 billion in
   September 2006. The narration says how the number is built.
2. **Who approved the Xbox 360 / PlayStation 3 tablets, and who objected.** Not on record. The script says "THQ said
   yes" and quotes the division head's public reasoning as his. It does not say he made the decision, and it reports
   his termination with "It gave no reason." **Do not let a later edit turn that into blame.**
3. **The HD tablets' launch date, price and production run.** Left out.
4. **The February 2, 2012 call transcript.** Farrell's quotes ("Unfortunately, we were wrong", "a plank that we walked
   off of", "would have doubled the profitability") come from Engadget's and Gamasutra's reports of the call.
5. **Petition schedules, auction venue, Vigil's headcount.** Assets and debts are GamesBeat's figures.
6. **The creditors' claim about management keeping their jobs.** Presented as an allegation, "never proven".
7. **Final creditor recovery, the securities settlement, Saints Row IV's first week.** Each carries "expected",
   "reportedly" or "according to press reports".
8. **Quotes in general** were extracted through a fetch tool; re-read each at its URL before it is put on screen.

Corrections the research made to common versions of this story: THQ was founded in **April 1990**, not 1989;
Homefront's launch-day drop was **21% at the close** (26% was the intraday low); the uDraw "$100 million" was a
**revenue** shortfall (the operating hit was about $33 million); THQ's EDGAR CIK is **0000865570**.

## Editorial choices worth knowing

- Named people are executives named in filings and major news: Jack Friedman, Brian Farrell, Danny Bilson, Martin
  Good, Jason Rubin, Judge Mary Walrath. The Vigil designer whose goodbye is quoted is not named in the narration
  (Engadget names him; `sources.md` has the link). The analyst who said "50-50" is not named in the narration.
- The script is fair to the decision: the first tablet beat its forecast, and the script says the mistake was the
  inference, not recklessness (channel rule: "people made reasonable-looking calls").
- No crimes are alleged. The securities suit is described only as dismissed, revived and reportedly settled.
- No investment advice.

## Before this can render

- **The engine's long-form gate is 8-12 minutes** (`finance/render-pc/tools/longform_gate.mjs`, the check
  `length 8-12 min`, `dur >= 480 && dur <= 720`). At about 20.3 minutes this video fails it. The gate must be widened
  on the PC (for example to 8-25 minutes) before a video this long can render. KIT_DOC.md is also written for 9-12
  minute videos; expect to raise the chapter count (7 here) and re-check the 30% budget rules at this length.
- **Props:** the kit has no tablet. VISUALS.md asks for a generic white slate with a stylus (new prop) or a flat white
  `block` labelled "DRAW". Game boxes are the `box` prop with generic labels.
- **Pronunciations:** "uDraw" = "YOU-draw"; "THQ" = the three letters; "Wii" = "we"; "Bilson" (BIL-sun); "Walrath"
  (WALL-rath); "Farrell" (FAIR-ul); "Koch Media" (the company said "kotch").
- script.json has two keys beyond `SCRIPT_SCHEMA`, as the brief asked: `"format": "landscape"` and `"target_seconds"`.
  The schema has `additionalProperties: false`, so strip or allow them if the file goes through the bot's validator.
