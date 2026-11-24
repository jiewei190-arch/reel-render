# Which industry BillionDollarBlunders should own (view data pulled 2026-11-24)

Format (owner decision, `docs/FORMAT_RESEARCH_2026-11-23.md`): "From $N To Nothing: How [Company] Lost Everything"
(sister: "[Company] Is Losing Everything: The $N Mistake"), 20 minutes or more, inside ONE industry.

**Pick: video games (publishers, studios, consoles), which is also the owner's stated preference. Runner-up: theme parks.**

## Method and limits

- `yt-dlp` flat search, 30 results per query, 32 search queries + 4 channel upload lists = 36 calls, plus 3 GTA 6 searches later (39 in all). YouTube began
  answering HTTP 403 on call 34, so I stopped. Three planned queries returned nothing or a partial page (Midway, the
  theme-park sister pattern, 38 Studios got 13 rows).
- Every number below is the `view_count | duration (seconds)` exactly as returned. Raw output of every query is in
  `longform/biz/research/yt_raw/` (file name in the first column).
- Not available: upload dates (video pages are blocked), so "recent" is inferred from the format's age (it started
  around Nov 3, per the format research) and from tiny view counts. Subscriber counts were not seen, so "small
  channel" is judged from the channel's other view counts. Two queries (`games_a`, `games_f`, `air_a`) came back
  with `NA` views; where a later query returned the same video with views, that number is used.
- Search results are YouTube's relevance ranking, not a census. Counts are minimums.

## The numbers

"Format uploads" = long videos (8 min or more) whose title uses the "$N To Nothing / Lost Everything / Is Losing
Everything / The $N Mistake" pattern about a company in that industry, from channels that are not established.

| Industry | Format uploads found (views, seconds) | Does one channel own it? | Demand: established-channel videos on these companies | Read |
|---|---|---|---|---|
| **Video games** (`games_a`-`games_j`) | 2 in the title pattern: "From 12 Million Subs to Nothing: How Machinima Lost Everything" 247,401 / 878 s (The Philosophy Of Mark); "How Xbox Lost Its Empire — The $69 Billion Mistake?" 64 / 520 s. Nearby "rise and fall" clones cluster on two companies only: Atari (150 / 640 s; 793 / 1,264 s; 2,016 / 1,075 s; 583 / 1,959 s) and Sega (4 / 659 s; 51 / 971 s; 598 / 766 s; 300 / 506 s; 696 / 446 s; 2,370 / 587 s) | No. TheCollapseCo covers big tech and games mixed (uploads 962 to 533,000; "60 Minutes That Destroyed Xbox's Empire" 2,313,310 / 1,478 s) and does not use this format | Saberspark "What RUINED Sega?" 2,869,468 / 1,580 s; ColdFusion "From $2 Billion to Nothing - The Rise and Fall of Atari" 1,857,982 / 1,243 s; Company Man "The Decline of Atari" 591,770 / 817 s; planet clue "ATARI is addicted to failure." 526,844 / 1,583 s; The Golden Bolt "The Death of THQ: From Billions to Bankrupt in 5 Years" 484,694 / 1,973 s; Mauro "The downfall of THQ" 375,571 / 2,067 s; Matt Draper "The Rise and Fall of SEGA" 404,690 / 2,402 s; ProbablyAlex "Nintendo's $40,000,000 Mistake" 224,812 / 811 s | **Strong demand, format nearly unused, nobody owns it.** Atari and Sega are crowded with clones; the other companies are open |
| **Theme parks** (`park_a`-`park_c`) | 0 in the title pattern. Nearby: "Six Flags: How a $3.5B Park Empire Totally Collapsed" 27,601 / 861 s (JunkBondInvestor); 471 / 613 s; 183 / 1,057 s; 14 / 650 s | No | Bright Sun Films "Bankrupt - Six Flags" 2,619,593 / 1,877 s; Company Man "Six Flags - The Rise and Fall...And Rise Again" 912,106 / 724 s; Bright Sun Films "Bankrupt - Discovery Zone" 785,915 / 808 s; The Infographics Show 358,966 / 1,050 s; Michael Girdley 227,635 / 1,304 s | Open and in demand, but the demand found is mostly one company (Six Flags), and few park collapses have filings and a clean dollar figure |
| **Toys and games** (`toys_a`-`toys_d`) | At least 14 on Toys "R" Us alone, almost all dead: 5 / 577 s; 25 / 712 s; 180 / 830 s; 3 / 627 s; 5 / 489 s; 378 / 871 s; 72 / 670 s; 64 / 483 s; 1 / 1,298 s; 8 / 1,093 s; 71 / 942 s; 22 / 660 s; 0 / 1,257 s; 868 / 1,390 s. Other toy companies: "From $2 Billion To Nothing: How Labubu Lost Everything" 178 / 902 s; 70 / 540 s | No | WSJ "How Toys 'R' Us Went Bankrupt" 1,257,106 / 756 s; Company Man 2,824,028 / 736 s; Michael Girdley 327,298 / 983 s; Lost Industries "Matchbox" 44,990 / 2,965 s and 24,057 / 2,885 s; Old Money Documentaries "The Hasbro Brothers" 21,929 / 3,634 s | Demand is one story (Toys "R" Us) and that story is saturated; our own Toys R Us Short already covers it |
| **Airlines** (`air_a`-`air_d`) | At least 12 on Pan Am: 14 / 1,102 s; 80 / 559 s; 92 / 608 s; 8 / 678 s; 11 / 904 s; 226 / 550 s; 55 / 789 s; 21 / 741 s; 22 / 519 s; 154 / 827 s; 9 / 678 s; 17 / 650 s. Spirit: 53 / 573 s; "From $4 Billion To Nothing: How Spirit Airlines Lost Everything" NA / 468 s; "The $525 Million Airline That Lost Everything" 10 / 1,061 s | Yes, partly: Vanished Airways posts only airlines, using the sister pattern ("American Airlines Is Losing Everything" 14,000 / 1,247 s; "WestJet Is Losing Everything" 6,600 / 1,285 s; JetBlue 9,900 / 1,849 s; others 160 to 7,100) | Bright Sun Films "Bankrupt - Pan Am" 3,854,797 / 1,113 s; "Bankrupt - TWA" 1,933,326 / 1,091 s; Business Insider 1,308,133 / 666 s; Sean Munger 1,236,130 / 7,172 s | Big demand, but crowded and a specialist is already there |
| **Restaurants and fast food** (`rest_a`, `rest_b`) | The Franchise Formula (with Build Inc.) has the exact format: Chi-Chi's 403 / 2,084 s; TGI Fridays 276 / 2,152 s; Red Lobster 627 / 2,208 s; Quiznos 858 / 2,207 s; Sbarro 2,050 / 1,994 s | Yes: The Franchise Formula, a Build Inc. sister channel | Michael Bordenaro "McDonald's is PANICKING" 630,726 / 1,208 s (only one found) | Taken, and even the owner of the format gets under 2,100 views here |
| **Retail and mall brands** (`retail_a`, `retail_b`) | At least 20: Forever 21 x6 (24 / 2,052 s; 7 / 508 s; 133 / 920 s; 1 / 251 s; NA / 774 s), Sears x4 (2 / 356 s; 29 / 322 s; 9 / 564 s; 184 / 1,133 s), Kmart x4 (96 / 1,149 s; 5 / 665 s; 16 / 501 s; 42 / 1,316 s), Target 17 / 1,278 s; Saks 486 / 487 s; Victoria's Secret 155 / 1,962 s; Montgomery Ward 2 / 631 s; Kohl's 736 / 1,097 s | Build Inc. owns fashion (Aéropostale 111,348 / 1,949 s; uploads 8,500 to 437,000) | Modern Society "The Fall of America's Malls" 336,215 / 613 s | Crowded and dead for newcomers |
| **Snacks and drinks** (`snack_a`-`snack_d`) | 0 in the title pattern. Nearby Hostess: 87 / 1,081 s; 1 / 728 s; 568 / 4,035 s | No | The Food Theorists "How Pepsi Became Irrelevant..." 1,208,926 / 751 s; Crunchy History "The Most Dangerous Sodas Ever Sold" 302,520 / 1,661 s; Old Money Documentaries "Dr Pepper" 96,980 / 3,062 s; America's Lost Brands "Faygo" 20,929 / 2,546 s | Open, but demand is for product nostalgia more than company collapses, and few snack companies went "to nothing" |
| **Consumer gadgets** (`gadget_a`) | At least 22, almost all Nokia and BlackBerry: 317 / 1,080 s; 226 / 1,106 s; 665 / 841 s; 53 / 446 s; 4 / 960 s; 0 / 819 s; 191 / 320 s; 698 / 1,323 s and more | No | (not searched; the format research already called tech crowded) | Crowded |
| **Sneakers** (`sneak_a`) | Build Inc.: Yeezy 554,902 / 2,012 s; L.A. Gear 491,412 / 2,110 s; TOMS 434,988 / 1,757 s; British Knights 24,519 / 1,962 s; Airwalk 22,503 / 1,968 s. Clones: Lisa Divers 197 to 1,218; others 11 to 572 | Yes: Build Inc. | (the owner's own numbers) | Taken |
| **Streaming and media** (`media_a`) | 0 found | No | none found by this query | One query only; not enough to judge |

## Why video games

1. **Demand is proven on the less-famous companies too**, not just the two household names. Two different gaming
   channels got 484,694 and 375,571 views with roughly 33-minute videos on THQ, a publisher most non-gamers never
   heard of. That is the same length this format wants.
2. **The format is nearly unused here.** One title-pattern video found (Machinima, 247,401 views, which itself
   suggests the pattern works on a games audience), against 14+ for Toys "R" Us, 12+ for Pan Am and 20+ for retail.
3. **Nobody owns it.** Airlines has Vanished Airways, restaurants has The Franchise Formula, fashion and sneakers have
   Build Inc. Games has general gaming essayists (who use different titles) and TheCollapseCo (mixed tech).
4. **A deep slate of true collapses with filings.** Many of these companies were public, went through Chapter 11, or
   were sued by the SEC, so the dollar figures come from primary records.
5. **It suits the 3D kit.** Consoles, cartridges, a drawing tablet, warehouses of unsold stock, an auction room.

Risks: Atari and Sega are crowded with low-view "rise and fall" clones, so they should not be the first uploads.
Gaming audiences punish factual slips, so the fact-check standard matters more here than anywhere. The format
research called "tech" crowded; games sits next to it, and the split I measured (2 format uploads) may be undercounted.

## Runner-up: theme parks

Zero title-pattern uploads and the highest single demand number outside airlines (2,619,593). It loses because the
demand I could measure is concentrated on Six Flags, most park failures were private or one-park stories without a
defensible "$N", and Six Flags itself came out of bankruptcy, so "to nothing" would overclaim.

## First slate: 8 titles (updated after the owner's change, relayed by the parent session on 2026-11-24)

The owner asked for video games as the preferred industry and for the first video to be the business story of GTA 6.
The evidence check above agrees with video games; nothing in the data argues against it. GTA 6 is not a collapse, so
title 1 is a business story in the same industry and the "From $N To Nothing" format starts at title 2.

| # | Working title | The story in one line | Where the figures come from | Status |
|---|---|---|---|---|
| 1 | **GTA 6 Sold $3.79 Billion In A Day. Nobody Knows Its Cost** | The famous "$2 billion budget" traced to its earliest appearance, then the numbers that were actually signed | Take-Two press releases, 10-K / 10-Q, the November 9, 2026 earnings call, BBC court reporting | Written: `gta-6-business/` |
| 2 | **From $2 Billion To Nothing: How THQ Lost Everything** | A top publisher bets a record quarter on a drawing tablet, is left with 1.4 million unsold, and is auctioned in pieces | THQ 10-K / 8-K filings, bankruptcy record | Written: `thq-lost-everything/` |
| 3 | From $1 Billion To $100,000: How Midway Lost Everything | The Mortal Kombat publisher; its controlling owner sells his stake for a reported $100,000 | Midway SEC filings, bankruptcy record | To fact-check |
| 4 | From $75 Million To Nothing: How 38 Studios Lost Everything | A baseball star's game studio, a state loan guarantee, and a missed payment | SEC complaint against Rhode Island's agency and its banker, state court record | To fact-check |
| 5 | From $380 Million To Nothing: How Gizmondo Lost Everything | A handheld console that sold in tiny numbers while losses ran to hundreds of millions | Tiger Telematics SEC filings, UK liquidation reports | To fact-check |
| 6 | From $500 Million To Nothing: How Acclaim Lost Everything | The Turok and NBA Jam publisher ends in Chapter 7 | Acclaim 10-K filings, bankruptcy record | To fact-check |
| 7 | From 400 Employees To Nothing In One Day: How Telltale Lost Everything | The Walking Dead studio closes with most staff let go at once | Company statement, WARN Act suit, press | To fact-check |
| 8 | Concord: The $400 Million Game That Lasted Two Weeks | A big-budget shooter pulled from sale days after launch (a failed game, not a company; budget figures are reported, not official) | Sony statements, major press | To fact-check |

Every dollar figure in rows 3 to 8 is a working figure from memory of the public story and **must be fact-checked from
primary sources before use**; the titles will change to match what the sources support.

Reserves: Atari's 1983 crash and Sega's console exit (both crowded with low-view clones: hold until the channel has an
audience), Embracer's collapsed $2 billion deal (sister pattern, still unfolding), Commodore, 3DO, Interplay, Ouya,
Google Stadia, GameStop (sister pattern, not "nothing").

## GTA 6 view check (added for title 1; raw rows in `research/yt_raw/gta_a.txt`, `gta_b.txt`, `gta_c.txt`)

Big and mid-size channels on the business of GTA 6: 2,164,395 / 681 s (Bloomberg Originals), 1,820,967 / 1,052 s
(Zem TV), 1,083,993 / 862 s (CNBC), 931,923 / 2,232 s (Patrick Boyle, "The Made-Up Economics of GTA 6."),
526,216 / 482 s (Sav, "GTA 6's $2 Billion Budget Might Be Hiding Something Big"). Small channels stating the budget as
fact ("The $2 Billion Bet", "Why GTA 6 Cost $2 Billion"): 4 to 320 views across at least 20 uploads. The winners that
are not news brands question the number; the losers repeat it. The chosen angle is in `gta-6-business/PACKAGING.md`.
