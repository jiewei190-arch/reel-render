# PACKAGING: the GTA 6 business video

Made without the YouTube skill packs (BillionDollarBlunders is the comparison channel in the owner's test).

## What the view data says (yt-dlp, 2026-11-24; raw rows in `../research/yt_raw/gta_a.txt`, `gta_b.txt`, `gta_c.txt`)

| Views | Seconds | Channel | Title |
|---|---|---|---|
| 2,164,395 | 681 | Bloomberg Originals | Why the Stakes for GTA VI Are So High |
| 1,820,967 | 1,052 | Zem TV | Why GTA 6 Took 13 Years and Billions of Dollars? |
| 1,083,993 | 862 | CNBC | GTA 6's Billion-Dollar Hype Machine |
| 931,923 | 2,232 | Patrick Boyle | The Made-Up Economics of GTA 6. |
| 853,800 | 1,544 | Nino | The Making of GTA 6 |
| 526,216 | 482 | Sav | GTA 6's $2 Billion Budget Might Be Hiding Something Big |
| 318,823 | 531 | TLDR Business | The Insane Economics of GTA VI |
| 158,699 | 533 | Dandy Andy | How Rockstar Is Spending $2 Billion on GTA 6 |
| 320 | 546 | Venture | Why GTA 6 Took 13 Years: The $2 Billion Bet |
| 241 | 911 | Forkpoint | Why Rockstar Delayed GTA 6 Twice (And Who Pays If It Fails) |
| 109 | 1,396 | Shuttered | GTA 6: Hacked Twice, Delayed Twice, and an $8 Billion Bet |
| 23 | 684 | Rational Wealth | The $2 Billion Bet: The Business Story Behind GTA 6 |
| 24 | 687 | Rich Xposed | GTA 6 Cost $2 Billion — Can Rockstar Make It Back? |
| 6 | 577 | Mister Markup | Why GTA VI Cost $2 Billion to Make (It's Not the Graphics) |

What separates the two groups:
1. **The small-channel pile all states the same thing as fact: "$2 billion" plus "bet" or "most expensive".** At least
   20 of the 30 rows in `gta_b` and 20 in `gta_c` are that title, at 4 to 320 views (a handful reach 1,200 to 15,590).
2. **The winners outside the news brands put a doubt or a turn in the title**: "Made-Up Economics" (931,923, and it
   is 37 minutes long), "Might Be Hiding Something Big" (526,216). They question the number instead of repeating it.
3. News brands win on being the source (Bloomberg, CNBC, CNN). A small channel cannot be the source, but it can be
   the one that actually reads the source.

So the angle: **not "what it cost", but "nobody knows what it cost, and here is where the number you heard came
from".** That is a real question with a turn (the earliest trace is a hacker's unverified claim), a payoff from
primary documents (the balance-sheet line that grew from $442 million to $2.58 billion), and a second turn that is
five days old (a record $3.79 billion day, and the stock closed lower). It is also the one angle the channel's
fact-check rule makes easier rather than harder: every clone states an unverified number; this video's hook is that
it will not.

Limits: three searches, 30 rows each; no upload dates, subscriber counts, thumbnails or retention were seen.

## Five title + thumbnail options, ranked

| # | Title | Thumbnail text (4 words or fewer) | Thumbnail image | Why |
|---|---|---|---|---|
| **1 (chosen)** | **GTA 6 Sold $3.79 Billion In A Day. Nobody Knows Its Cost** (56 characters) | **COST: ???** | A long receipt on a dark table: the top line "DAY 1: $3.79B" in green, the bottom line torn off | Leads with the one huge number that is official and brand new, then opens a gap. "Sold", not "made": the figure is retail sales by company estimate. Not another cost explainer because the promise is the opposite: there is no cost to explain, and the video shows why |
| 2 | Where GTA 6's "$2 Billion Budget" Really Came From | **WHO SAID $2B?** | The "$2 BILLION" headline with a string leading back to a blank, nameless chat bubble | The strongest curiosity gap and fully defensible (it says "came from", and the video shows the earliest trace found). Second because it rides a number the crowd already uses, so it sits closer to the clone pile in search |
| 3 | GTA 6 Had A Record $3.79 Billion Day. The Stock Fell | **RECORD DAY. STOCK DOWN.** | A green bar marked "$3.79B" beside a red line dipping "-3.7%" | The freshest turn. Third because it invites "should I buy" readings; the channel gives no investment advice, and a one-day move is thin to hang a title on |
| 4 | The $8 Billion Promise GTA 6 Kept Two Years Late | **2 YEARS LATE** | A calendar with the circle sliding from "2025" to "NOV 2026" | True and specific (May 2023 outlook vs the fiscal 2027 forecast). Fourth because "$8 billion bet" is already a dead small-channel title, even though this is a different claim |
| 5 | 13 Years, 2 Delays, $3.79 Billion: The Real Math Of GTA 6 | **THE REAL MATH** | Three stacked tags: "13 YRS", "2 DELAYS", "$3.79B" | Safe and searchable. Last because it is a list, not a question, which is what the 100-view videos look like |

Rules for every option: plain props only, no game art, no logos, no characters, no series-style lettering. "$3.79B"
always carries "day one" on the image, never "profit" or "revenue". Custom thumbnails are not enabled on the channel
until phone verification is done (see CHANNELS.md).

Hook text at frame 0 (in script.json): `$3.79B IN. COST: *UNKNOWN*`

## Description (paste as is; no tags, no hashtags)

```
On November 19, 2026, Grand Theft Auto VI did $3.79 billion in day-one retail sales, by its publisher's own estimate. Almost every number around the game is public except one: what it cost. This video traces the famous "$2 billion budget" back to where it first appeared, then follows the numbers that were actually signed: the filings, the two delays, the $8 billion promise, and launch day.

Facts checked on November 24, 2026. Figures published after that date are not included.

Chapters
0:00 A $3.79 billion day
1:05 The $800 Million Day
2:45 Thirteen Years
4:20 The Hacker And The Number
7:15 What The Filings Show
10:00 What The Wait Cost
12:25 One Day In November
15:20 The Number Nobody Signed

Sources
Take-Two Interactive: press releases of Sept 18 and 20, 2013; May 17, 2023; Dec 4, 2023; May 16, 2024; May 2, 2025; Nov 6, 2025; Nov 9, 2026; Nov 20, 2026. Forms 10-K (fiscal 2016, 2020-2026) and Form 10-Q for Sept 30, 2026. Earnings call of Nov 9, 2026.
BBC News (Sept 19, 2022; Aug 23, 2023; Dec 21, 2023). PC Gamer (Feb 4, 2022; Sept 19, 2022; May 8, 2026; Nov 16, 2026). IBTimes UK (Sept 29, 2022). Bloomberg (Nov 7, 2025, and as cited by other outlets). Reuters (April 16 and May 16, 2024). Fortune (May 2, 2025; May 6, 2026; Nov 20, 2026). Variety (Nov 6, 2025). The Hollywood Reporter (May 7, 2025). VGC, Game Informer, GamesRadar, GamesIndustry.biz, IGN, MCV, Aftermath.
Full links: pinned comment.

Educational only: this is a business story, not investment advice. Budget figures are estimates and reports, labelled as such; the company has not disclosed a budget.
Not affiliated with or endorsed by Rockstar Games or Take-Two Interactive. No game footage is used.
Voice is synthetic.

BillionDollarBlunders: true stories of the biggest bets and costliest mistakes in business.
```

Chapter times are estimates at 2.45 words per second; replace them with the real times from the voice-over
(`chapters.txt` from the doc build) before upload. The first chapter must stay at 0:00.

## Chapters (title + first words, as in script.json)

| Chapter | Starts with |
|---|---|
| (cold open) | "On November nineteenth, twenty twenty-six, a video game went on sale." |
| The $800 Million Day | "To see why this game mattered" |
| Thirteen Years | "The studio behind it, Rockstar, did" |
| The Hacker And The Number | "In September twenty twenty-two, dozens of" |
| What The Filings Show | "Here is the part almost nobody" |
| What The Wait Cost | "In May twenty twenty-three, Zelnick made" |
| One Day In November | "The price came first. In June," |
| The Number Nobody Signed | "Go back to the question. What" |
