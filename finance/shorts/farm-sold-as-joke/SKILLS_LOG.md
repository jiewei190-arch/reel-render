# farm-sold-as-joke: skills log

One row per skill in `.claude/skills/` (13 `youtube-*`, 11 `yt-*`). "Used" means it was read and its steps or tool
were run for this Short; the last column is what it concretely changed. Every SKILL.md was read first.
The `yt-*` skills read `~/.claude/youtube/voice.md`; it was filled in for Court Of Weird and copied here as `voice.md`.

## Summary

- **Used: 16.** youtube-outliers, yt-viral, youtube-lane, youtube-shorts, yt-plan, youtube-packaging, yt-package,
  youtube-script, yt-script, yt-shorts, youtube-edit-list, yt-edit, youtube-virality-gate, youtube-description,
  yt-seo, yt-chapters (tool run, output not used).
- **Skipped: 8.** youtube-connect, youtube-channel-audit, yt-audit, youtube-comments-to-ideas, yt-comment,
  youtube-retention, yt-retention, youtube-monetization.

## Topic

| Skill | Used? | What it concretely did |
|---|---|---|
| **yt-viral** (`swipe.py`) | Used | Collected the 40 newest Shorts of 6 channels from their public pages with `yt-dlp --flat-playlist` (no login): LegalEagle, Law By Mike, Ugo Lord, AttorneyTom, The Law Says What?!, Zack D. Films (240 videos). `swipe.py --min 2.5` ranked 26 outliers by multiple of each channel's own median. Formula of the outlier titles: 8 of 26 are "The Question". **Change:** the spoken hook became a question to the viewer; and the case had to be an everyday act with a legal sting (see next row). |
| **youtube-outliers** | Used | Outlier table below. News-driven ones dropped (politics, a streamer's arrest). Kept formats: (a) "an ordinary [neighbour / landlord / tow truck] did [small everyday thing], then the law [did something big]"; (b) "a stunt or joke that became legally real" (the fake-church Short, 16x). Three adaptations ranked: 1. *Lucy v. Zehmer*, the farm sold "as a joke" (format b, tellable with paper + money + gavel); 2. *Hamer v. Sidway*, an uncle's $5,000 promise (format a, weaker picture); 3. *Carlill v. Carbolic Smoke Ball*, an ad's £100 promise (needs a smoke-ball prop the kit lacks). **Pick: #1.** vidIQ's outlier tool was tried first and refused ("Not enough credits"), so the view counts come from the public channel pages. |
| **youtube-lane** | Used | Edge in one line: every claim is read from the court opinion and shown as a 3D story with no real faces. Three lanes scored (edge/demand/sale): "a joke or small act the law took seriously" 4/5/1 = 10; "who really won the famous lawsuit" 4/4/1 = 9; "the law sued an object" 3/3/1 = 7. Sale path: none yet. **Change:** confirmed the pick sits in the top lane; kill test written: 4 Shorts in this lane, beat the channel's best day-one Short (Pearson, 1.2K views, 67% stayed), else move to lane 2. Honest limit: the skill wants 5 outlier titles per lane as proof; this lane has 4 from the table (trees 4.1x, landlord 34.7x, tow truck 21x, fake church 16x), so the lane is "likely", not proven. |
| **youtube-shorts** | Used | Format call: **Short only** (one twist, cold audience, a single ruling). Its hook rule (open on the payoff, in reverse) put the outcome in sentence one ("cost you your farm? It happened.") instead of opening in 1952. Its "but ... then" rule could only be met across the script ("**But** Virginia's highest court reverses"), not inside line 1: the "but he never meant it" version (scored 72) states his claim as fact, so it was cut for fairness. Hashtag step not applied (channel rule: none). A long-form version is a later option; nothing in this Short promises one. |
| **yt-plan** | Used (lightly) | Its two questions answered from the repo: capacity is the fixed schedule (1 Short/day, 2 long/week), half-made items are the gold-rooster and Hawkins Shorts waiting on props. **Change:** this Short is slotted as a spare for the first free day after Nov 25 (owner decides); no calendar was written because the channel's schedule is already fixed by the owner. |

### Outliers: weird / everyday law Shorts (public view counts, read Nov 23, 2026)

| Video | Channel | Views | Channel median (40 newest Shorts) | Multiple | Format |
|---|---|---|---|---|---|
| Landlord has some INTERESTING rules for renting | AttorneyTom | 920,000 | 26,500 | 34.7x | An ordinary [landlord] has [strange rule]; is it allowed? |
| Can tow trucks legally do this?? | The Law Says What?! | 542,000 | 25,500 | 21.3x | Can [everyday actor] legally do [thing you have seen]? |
| John Oliver's Fake Church is His Greatest Legal Stunt | LegalEagle | 3,900,000 | 244,000 | 16.0x | A [joke / stunt] that became legally real |
| Police Handcuff a Child for Drawing With Chalk! | Ugo Lord | 9,200,000 | 949,000 | 9.7x | [Tiny act], [huge legal reaction] |
| Her Neighbor CUT DOWN 9 Trees While She Was Away | LegalEagle | 1,000,000 | 244,000 | 4.1x | [Neighbour] did [small thing]; the bill was [big] |
| Which Scam Fools A Lawyer? | Law By Mike | 53,000,000 | 14,000,000 | 3.8x | Question to the viewer, answer withheld |

Medians are of the 40 newest Shorts only, so the multiples are approximate. The formula label is a judgement
about the title, not proof of why a video worked.

## Packaging

| Skill | Used? | What it concretely did |
|---|---|---|
| **yt-package** (`title.py`) | Used | Twelve titles written and linted (the skill asks for ten). Eight tied at 98/100; four were **rejected by the tool**: "He Sold His Farm as a Joke. The Court Said It Counts." (62: no number, repeats the thumbnail), "A Restaurant Check Sold a Farm. He Said It Was a Joke." (62), "'High as a Georgia Pine': The Joke That Sold a Farm" (80: no number), "He Wrote a Joke Contract in 1952. A Court Enforced It." (80: duplicate word). **Pick:** "The $50,000 Joke a Court Refused to Laugh At" (44 chars, 98). Thumbnail text held to 3 words that are not in the title: SIGNED MEANS SOLD (the tool confirmed "different words"). |
| **youtube-packaging** (+ VISUAL-CHECKS.md) | Used | Viewer promise: "a joke on a restaurant check really did sell a farm, and you will see how a court got there". Five pairs compared among the 98s; one fits the Galloway slot ("How a Whiskey Bet Sold a 471-Acre Farm in 40 Minutes") and was **rejected on the truth gate**: "bet" and "40 minutes" are in the opinion but the title implies the bet itself sold the farm. "Lucy v. Zehmer: ..." rejected for the feed (a case name is a search title). Truth gate also **killed my first thumbnail text "SIGNED. SEALED. SOLD."** (nothing was sealed) and the quoted exhibit tag "JUST A BLUFF" (not his exact words; now IT WAS A BLUFF, no quote marks). Backup pair named per the skill: "Can a Joke Sell Your Farm? In 1954, a Court Said Yes". Object-led thumbnail, no face, with the reason written down. Feed-size preview with real neighbours was not done (no feed to test in): editorial judgement only. |

## Script and hook

| Skill | Used? | What it concretely did |
|---|---|---|
| **yt-script** (`hookscore.py`, `hooks.json`) | Used | Round 1: seven hooks, **all scored WEAK (34-48)**, every one failing ADDRESS (no "you"). That rejected my first instinct, "A man sold his farm as a joke, on the back of a restaurant check..." (35). Round 2, rewritten to speak to the viewer: top two were "What if a joke you wrote on a restaurant check cost you 471 acres? It happened, but he never meant it." (**72 STRONG**, formula: The Question) and "How do you lose a 471-acre farm? One man wrote a joke on a restaurant check, but the buyer was serious." (66 WORKABLE). **Shipped line:** "What if a joke you wrote on a restaurant check cost you your farm? It happened." which scores **55 WORKABLE**: lower than the 72 because "but he never meant it" presents a disputed claim as fact (voice.md: will not claim) and "four hundred seventy-one acres" is a mouthful to speak; the acreage moved to an on-screen tag instead. The tool says of itself that it barely separates real hits from misses, so fairness won. Also from the skill: [ON SCREEN] per beat (each line has its own shot and device), the payoff said outright ("orders the sale"), no ask at the close (the loop is the close), runtime estimate 95 words at 150 wpm = 38 s (recorded: 35.6 s). |
| **youtube-script** | Used | Hook in its three parts: target (you, a joke, a restaurant check), outcome (your farm), stakes ("It happened."). Setup, tension, payoff inside 35 s: bet and check (5-18 s), his defence (19-24 s), the first judge then the reversal (24-34 s). Its "pattern interrupt at 0:25" is where the gavel and the BINDING stamp were placed (0:26.7-0:29). Banned-word list checked: none in the script. Its long-form minute map does not apply. |
| **yt-shorts** | Used (its writing rules; there is no long video to cut from) | "On-screen text for the first two seconds, different words from the spoken line": the hook card says HIS $50,000 JOKE while the voice says "What if a joke you wrote...". "A loop point": the last line "So ask yourself:" runs into line 1. "Ends on a line, not a trail-off": the verdict lands before the loop line. |
| **youtube-edit-list** | Used (on the recipe instead of a rough cut) | First change of state at 1.13 s (rule: by 2.5 s). Longest stretch on one shot is 5.5 s (the witness stand) and it has a face change and an exhibit tag inside it (rule: no 8 s without a change). End frame is the loop, no outro. Caption chunks are 1-3 words (rule: 1-5). No cut was needed. |
| **yt-edit** (`deadair.py`) | Used | Ran on an SRT made from the ElevenLabs timings: **0 cuts**, no gap above the 0.45 s floor between lines; the longest pause inside a line is 0.31 s. So the single take was kept whole. |
| **yt-chapters** (`chapters.py`) | Run, output unused | The tool produced 3 valid chapters (0:00, 0:10, 0:24), but a 35 s Short shows no chapters, so none are in the description. |

## Pre-publish gate and description

| Skill | Used? | What it concretely did |
|---|---|---|
| **youtube-virality-gate** | Used (Shorts gates 1-4 and 6) | 1 Title trigger PASS (opens a gap). 2 Thumbnail adds PASS (SIGNED MEANS SOLD says what the title does not). 3 First 5 seconds PASS (the loss is said by 3.3 s, no greeting). 4 Promise kept PASS (the court's refusal is shown at 0:27). 6 Only you **FAIL**: this is a famous law-school case that many channels tell. **Verdict: FIX (4/5).** Fix, as the skill demands in command form: "Lead with what other tellings skip." Done where one voice pass allowed: the verbatim "high as a Georgia pine", the wife signing, and the description paragraph on what the court found about the drinking. It stays a known limit. Batch check (same template as the channel's other Shorts): the human addition is the owner's review and the sourced claim table; this Short was built by an agent, so the owner should watch it before it ships. |
| **youtube-description** | Used | Surface call: **browse** (a want, not a need; the viewer comes from the feed), so no chapters and no question block. Title check: packaging line kept as is. Wrote the mandatory objection line ("he was drunk, how is that binding?" answered from the opinion) and one comment question; zero subscribe requests in the body. The head/offer line is left out (the channel sells nothing) and the footer is the channel's fixed disclaimer + pitch. Tags skipped (channel rule). |
| **yt-seo** | Used | The first two description lines carry the typed words: "Lucy v. Zehmer", "court case", "joke", "contract", "farm", "$50,000". Query test with three queries is in UPLOAD.md; the title misses "Lucy v. Zehmer" on purpose (feed title), the description covers it. Tags: none (channel rule; a fallback list of 5 is noted). |

## Skipped, and why

| Skill | Why it cannot apply here |
|---|---|
| **youtube-connect** | Needs the owner's browser and Google sign-in. |
| **youtube-channel-audit** | Needs the channel page and upload history numbers; none are available in this container. |
| **yt-audit** | Same: needs the live channel and its videos' first 15 seconds. |
| **youtube-comments-to-ideas** | Needs real viewer comments; none were supplied. |
| **yt-comment** | Same: no comments to reply to. |
| **youtube-retention** | Needs a retention curve for a published video; this one is not published. |
| **yt-retention** (`retention.py`) | Same: needs a YouTube Studio export. |
| **youtube-monetization** | A channel-level revenue plan, not something that changes one Short. |

Nothing was uploaded, posted or scheduled. Ship it, or change it?
