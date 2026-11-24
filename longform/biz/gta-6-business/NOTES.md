# NOTES: the GTA 6 business video

**Status:** researched, written and fact-checked on 2026-11-24. Not voiced, not rendered, not uploaded.

## Length

- **2,405 words, 114 lines, about 16.4 minutes** at 2.45 words per second (`target_seconds` 960).
- That is the length the story supports. The brief allowed 12 to 20 minutes; padding to 20 would have meant repeating
  estimates or adding gameplay and rumour material the channel cannot source. Per chapter:

| Starts (est.) | Words | Chapter |
|---|---|---|
| 0:00 | 164 | Cold open + promise |
| 1:07 | 237 | The $800 Million Day |
| 2:44 | 230 | Thirteen Years |
| 4:17 | 440 | The Hacker And The Number |
| 7:18 | 397 | What The Filings Show |
| 10:00 | 354 | What The Wait Cost |
| 12:23 | 419 | One Day In November |
| 15:15 | 164 | The Number Nobody Signed |

- Structure check: cold open about 67 s including the one-sentence promise (the cold open itself is about 55 s; the
  rule says 20-40 s, so the editor may want to trim "The price. The pre-orders. The launch." if it drags). The
  question the cold open teases (where the $2 billion came from, and what the cost really is) is paid off in chapters
  3 and 4, between about 27% and 61% of the runtime, before the two-thirds mark; consequences follow.
- Voice tags: 5 lines carry one tag each (the hook, the hacker's number, the $2.58 billion reveal, the stock twist,
  the takeaway). No whispering.

## The situation the script is written for (as of 2026-11-24)

The game **is out**: released November 19, 2026. Standard edition $79.99, Ultimate $99.99. The only official sales
number is Take-Two's day-one estimate ($3.79 billion in retail sales, 32.5 million units sold pre-release). **No
budget has ever been disclosed**, which the parent session suspected and the research confirmed first-hand: on the
November 9, 2026 earnings call the CEO said "We haven't spoken about budgets at all."

## Could not verify (see `sources.md` for the wording used around each)

1. **Any budget figure.** All are estimates or unsourced; the script attributes every one.
2. **That the hacker's message is the true origin of "$2 billion".** It is the earliest trace this research found
   (IBTimes UK, Sept 29, 2022, citing Dexerto, "appeared to have claimed"). The script says "the earliest trace".
   If the owner wants a harder claim in the title (option 2 in PACKAGING.md), keep "came from" in quotes-free,
   hedged form.
3. **Bloomberg's own articles** (paywalled). The October 2026 interview is confirmed only through the analyst's
   question on the earnings call and one secondary site.
4. **The start of development** (2014 "in some form" vs 2020 "in earnest"): both attributed; the 2020 quote reached
   us through one secondary site.
5. **Rockstar's headcount** (UK average 1,744; about a dozen offices): secondary reports of filings.
6. **Film budgets:** Forbes was blocked; read through Wikipedia. The script uses a range and names no film.
7. **The May 2, 2025 closing move (-6.66%)**: one source.
8. **The "no recurrent consumer spending... with regard to this launch" remark**: one fan site. Hedged "reportedly".
9. **The hacker's sentence**: reported as due November 23, 2026; no outcome found. Not stated.
10. **Tribunal ruling and union vote**: pending on the day of the check.

## Must be re-checked on the day the voice is recorded

This video is tied to a launch that was five days old when it was written. Before voicing:
- Look for a new official sales figure and update the cold open and chapter 6 if one exists.
- "this month", "last month", "last week", "three days before the game came out": all assume a November 2026 upload.
  The lines are listed in `sources.md` ("Check again before voicing").
- Confirm the union vote result (closes November 26) and whether the tribunal has ruled; update or cut those lines.
- Re-pull the share price for the launch-day line.

## Editorial choices worth knowing

- **Names:** only Strauss Zelnick is named (an executive quoted in filings and on the call). The hacker (a minor at
  the time), the analysts and the Rockstar executive are not named. Bloomberg, the BBC and the companies are named as
  sources.
- **No crime labels beyond the record:** "a jury later found that he had carried out the hack", the hospital order,
  and the guilty plea.
- **No investment advice:** chapter 6 says so on screen and in the narration, and gives no reason for the share move
  as fact.
- **Nothing from the leak is described** beyond what the BBC reported (that about 90 videos and images of the
  unfinished game appeared).
- **Not affiliated** line is in the description. No footage, logos, characters or box art anywhere in VISUALS.md.

## Before this can render

- **The engine's long-form gate is 8-12 minutes** (`finance/render-pc/tools/longform_gate.mjs`, the check
  `length 8-12 min`, `dur >= 480 && dur <= 720`). At about 16.4 minutes this video fails it. The gate has to be
  widened on the PC (for example to 8-25 minutes) before rendering. KIT_DOC.md also describes the kit as "9-12 minute"
  videos, so the variety and budget rules should be re-read at this length.
- The kit has no receipt or tablet hero prop. VISUALS.md uses the `letter` prop laid out as a receipt, and plain
  `box` props labelled "GAME 6" / "GAME 5".
- Pronunciations for the narrator: "Zelnick" (ZEL-nik), "Take-Two", "Grand Theft Auto Six" (the script never says
  "GTA" aloud).
- The script.json has two keys beyond `SCRIPT_SCHEMA`, as the brief asked: `"format": "landscape"` and
  `"target_seconds"`. The schema has `additionalProperties: false`, so strip or allow them if the file is passed
  through the bot's validator.
