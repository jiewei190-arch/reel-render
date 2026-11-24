# NOTES: court-of-weird-lawsuit-compilation

## Numbers
- **Final title:** 14 Real Lawsuits That Sounded Like Jokes (40 characters)
- **Words:** 2,056 spoken, 121 lines, 14 cases + cold open.
- **Estimated runtime:** 13 min 59 s at 2.45 words per second (`target_seconds`: 839). Real length depends on the voice; at the top of the 12-14 minute target.
- **Per case:** 46 to 62 seconds, except the hot coffee (79 s) and the pants (76 s), which need the room to be fair and to pay off the cold open.
- **Engine gate:** `tools/longform_gate.mjs` passes 8-12 minutes, so the gate must be widened on the PC before this renders (already noted in CHANNELS.md), or cases 13 and 7 dropped to land near 12 minutes.

## Order (countdown; the two strongest first and last)
Cold open (the judge crying over the pants; plants "how much does the court give him?") → 14 fighter jet → 13 tomato →
12 flu reward → 11 monkey selfie → 10 farm joke → 9 toy heroes → 8 haunted house → 7 burrito → 6 Satan → 5 cash →
4 gold rooster → 3 shotgun trap → 2 hot coffee → 1 the pants (answers the planted question: zero dollars).

## Decisions that differ from the brief, and why
1. **14 cases, not 15.** With 15 the script ran 2,269 words (15.4 min). Getting 15 cases under 2,050 words would have cut each to about 115 words, which turns them into fact lists. One case was cut instead and the title number changed to stay true.
2. **The cold open's answer lands last, not at the two-thirds mark.** `_length_rules` asks for the tease to pay off by about two thirds; the brief asks for an open question that the last case answers. The brief was followed. A callback at 12:40 ("the man who asked for fifty-four of them") bridges it.
3. **"Chapters" are the 15 segments**, not the 4-7 chapters of `_length_rules`, because the format is a compilation and the brief asks for a chapter per case.
4. **`script.json` carries two keys outside `SCRIPT_SCHEMA`** (`format`, `target_seconds`), as the brief asks. `SCRIPT_SCHEMA` has `additionalProperties: false`, so strip them if the file is ever validated against it.
5. **Voice tags:** six in the whole script (cold open x2, cash, shotgun trap, coffee, the Bartnoff ruling). The harm cases get [serious] only.

## Cases cut, and why
| Case | Why |
|---|---|
| Hamer v. Sidway (the $5,000 sober promise) | Written, fact-checked and then cut for length. It was the fourth promise case (with the jet, the flu ad and the farm) and the least "sounds like a joke". Research is in `finance/shorts/hamer-sober-promise/sources.md`; it can go back in as case 9 if a 15-minute cut is wanted. |
| Kelo v. New London | Research exists, but a city taking a woman's home is not a case that "sounded like a joke"; in a countdown of absurd claims it would read as mockery of a real loss. Better as its own video or in a "the law was not on their side" compilation. |
| Moore v. Regents (the patented cells; the spare) | Same tonal problem (a leukemia patient), and the ruling rests on allegations never tried. Kept as the spare. |
| Hawkins v. McGee | A fifth promise case and an injury to a child; its Short is being re-run anyway. |
| Chambers v. God | Too close to Mayo v. Satan; only one "unservable defendant" case is needed. Not researched. |

## Not verified, or deliberately hedged (nothing below is stated as fact in the script)
- **Cash case:** what happened to the $124,700 after the 2006 remand. The narrator says "we could not confirm".
- **Haunted house:** whether Stambovsky actually got his down payment back, and any settlement. The script says he "may seek" it.
- **Gold rooster:** its dollar value, the exact seizure date, and whether or where it went back on display. Only the weight, the karat, the Marshal's custody by September 1960 and the 1962 result are in the opinions.
- **Pepsi jet:** the exact cost of a Harrier in the opinion (commonly quoted as $23 million; the scan read live shows "$28 million", likely an OCR error). Spoken as "more than twenty million dollars".
- **Tomato:** the plaintiffs' first names; whether the decision was unanimous.
- **Hot coffee:** there is no published opinion. The settlement amount is confidential; "reportedly less than six hundred thousand dollars" follows Vox, while Retro Report says less than $500,000. The burn-area percentages differ between sources and are not spoken. Major newspapers (NYT, AP, Britannica) refused automated reads, so the sources are Retro Report, the American Museum of Tort Law, a trial-lawyers' fact sheet, Vox and Wikipedia; two of those lean to the plaintiff's side. Whether McDonald's later changed its coffee temperature is disputed and is not claimed.
- **Burrito:** this was a preliminary-injunction ruling; how the lawsuit finally ended was not checked and is not claimed.
- **Monkey selfie:** "allegedly" is kept for who pressed the shutter (the court's own word; the case ended on the pleadings).
- **Carlill:** exact dates, her first name and the price of the ball (only Wikipedia has them).
- **Five reused cases** (Pearson, cash, Katko, Carlill, Lucy) rely on the channel's Nov 23, 2026 source files; their opinions were not downloaded again today. The Pearson news links (AP, ABC, ABA Journal) were not re-opened.
- **Chapter times** are computed from word counts, not from audio.
- **View and format claims** are only those in docs/FORMAT_RESEARCH_2026-11-23.md; nothing new was measured.

## For the voice and render session
- Spoken brand names: Pepsi, Harrier, Panera, Qdoba, McDonald's, Reader's Digest, X-Men, Toy Biz, PETA. On screen they are plain text at most; no logos, trade dress or character art (see VISUALS.md, case 9 uses original generic figures).
- Run the voice-safety screen as usual; no line reads like a demand or a scam call.
- Say "versus" in the rooster case title; "D.C." as letters; "Qdoba" = "kyoo-DOH-buh"; "Nyack" = "NYE-ack"; "Stambovsky" = "stam-BOV-skee"; "Zehmer" = "ZAY-mer" (pronunciations are best guesses, not verified).
- The on-screen stamp for case 5 is REVERSED, never FORFEITED.
