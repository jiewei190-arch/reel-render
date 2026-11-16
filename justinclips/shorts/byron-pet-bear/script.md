# Lord Byron's college bear (Cambridge, around 1807): script & shot list

**EMOTION: LOL**
**LINE 1:** "College banned dogs, so he brought a bear." (8 words, no setup)
**CAPTION (top, frame 1 → config.topCaptionUntil, ≥ 3.2 s):** "and the college / couldn't stop him"

**Slug:** `byron-pet-bear` · YouTube Short, 9:16, 1080×1920, 24 fps · Toon 3D + BEANMEN FX · Music `toon3d:upbeat` −19 dB
**Voice:** Dia #8 (Dia-1.6B-0626, Kokoro am_puck voice prompt, seed 7; settings in `voice_dia8.json`), Whisper QA. The narration lives in `lines.json`; shot timing is derived from the voice (see STATUS.md for the one-command re-voice).

## Jail-break + vidIQ checklist (IAWAKEN_PLAYBOOK.md)
- [x] Triple hook in the first 2 s: frame 1 = the bear in a gown and mortarboard already strolling through the college quad on a ribbon lead, the porter's jaw dropping · VO line 1 is the claim, ≤ 8 words · top caption adds story ("and the college couldn't stop him"), not the title, up ≥ 3.2 s.
- [x] Wide way in: "College banned dogs" (anyone's been told "no pets"); Byron's name comes only after the claim.
- [x] One emotion (LOL). No setup, no second example, no "hey guys".
- [x] Cuts every ~1-2.4 s (14 shots), fastest in the hook.
- [x] Ends abruptly on the payoff ("...it should sit for a fellowship.") with the FELLOW badge; no CTA, no "subscribe", no end card; the high-table frame hard-cuts back to frame 1 (loop).
- [x] Hedges kept: "reportedly" (the no-dogs rule), "around 1807".
- [x] Nobody hurt; the bear is tame and happy; no realistic photos; all characters original.

## Narration (exact VO; times come from `lines.timing.json` after each voice render)
1. College banned dogs, so he brought a bear.
2. This is Lord Byron, the poet, at Cambridge, around 1807.
3. His college reportedly had a rule: no dogs.
4. But the rules said nothing... about bears.
5. So he got a tame bear.
6. He wrote to a friend that it was the finest in the world.
7. Asked what the bear was for... he said it should sit for a fellowship.  *(PAYOFF)*

## Shots (anchors in `project/story/shots.tpl.json`)
| # | starts at (voice anchor) | Scene | FX |
|---|---|---|---|
| s01 | 0 | Bear in gown + mortarboard strolls down the quad path on a red ribbon, Byron beside it, NO DOGS sign, porter shocked | top caption, "!" |
| s02 | L1 "so" | Porter's double take as the bear walks past and waves | "A BEAR?!" burst, sweat |
| s03 | L2 start | Byron poses dramatically with a quill | LORD BYRON nameplate, sparkle |
| s04 | L2 "at" | Wide college quad with the gate tower | CAMBRIDGE + c. 1807 badges |
| s05 | L3 start | The porter holds up the rulebook | "(reportedly)" |
| s05b | L3 "no" | Close on the NO DOGS sign | no-dogs symbol, NOPE stamp |
| s06 | L3 end | Byron hunts through the rulebook with a magnifying glass (held beat) | "?" |
| s07 | L4 "about" | Rulebook page: Dogs: NO. Cats: no. Bears: ........ | "(nothing!)" |
| s08 | L5 start | Byron presents the tame bear, which waves | hearts, TAME badge |
| s09 | L6 start | Byron writes a letter by candlelight, the bear peering over | sparkle |
| s10 | L6 "finest" | The bear; his 1807 letter, quoted word for word | sparkle |
| s11 | L7 start | Two dons in gowns, baffled (held beat) | "?" "?" |
| s12 | L7 "he" | Byron deadpan presents the bear like a candidate | sparkle |
| s13 | L7 2nd "for" | PAYOFF: the bear at the high table between two horrified dons | FELLOW badge, "(a fellow = a college teacher)" → cut to s01 |
