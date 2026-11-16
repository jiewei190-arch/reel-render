# Poyais, the country that didn't exist (1820s): script & shot list

**EMOTION: WTF**
**LINE 1:** "A man sold a country that didn't exist." (8 words, no setup)
**CAPTION (top, frame 1 → config.topCaptionUntil, ≥ 3.2 s):** "and London / paid him for it"

**Slug:** `poyais-fake-country` · YouTube Short, 9:16, 1080×1920, 24 fps · Toon 3D + BEANMEN FX · Music `toon3d:mystery` −19 dB
**Voice:** Chatterbox "D2" (exaggeration 0.3, cfg 0.3), Whisper QA. The narration lives in `lines.json`; shot timing is derived from the voice (STATUS.md has the one-command re-voice).

## Jail-break + vidIQ checklist (IAWAKEN_PLAYBOOK.md)
- [x] Triple hook in the first 2 s: frame 1 = MacGregor mid-sale on a podium, banknotes already raining, the crowd cheering, SOLD! stamp · VO line 1 is the claim (8 words) · top caption adds story ("and London paid him for it"), not the title, ≥ 3.2 s.
- [x] Wide way in: "sold a country that didn't exist", a con anyone gets; the name comes after the claim.
- [x] One emotion (WTF). No setup, no second example.
- [x] Cuts every ~1-2.7 s (17 shots).
- [x] Ends abruptly on the payoff ("...and acquitted." + ACQUITTED stamp); no CTA or end card; hard cut back into frame 1 (loop).
- [x] TONE GUARD (brief): the settlers' deaths are not shown, named or joked about in the video. The VO says only "It went very badly." over an empty, grey, rainy shore with no people, no gag and no comic SFX (a rain bed only). The description states the deaths once, plainly, with the source's wording.
- [x] Hedges: "about" on the £200,000 and the 250 settlers; "ruler" in quotes on screen.

## Narration (exact VO)
1. A man sold a country that didn't exist.
2. In 1822, Gregor MacGregor told London he ruled a land called Poyais.
3. He printed a guidebook, its own money... and sold its government bonds.
4. Investors bought about 200,000 pounds of them.
5. Then about 250 settlers sailed there.
6. They found... jungle. No towns. No capital. No country.
7. It went very badly.
8. MacGregor was later tried for fraud in France... and acquitted.  *(PAYOFF)*

## Shots (anchors in `project/story/shots.tpl.json`)
| # | starts at | Scene | FX |
|---|---|---|---|
| s01 | 0 | MacGregor sells POYAIS off a gold-framed map on a podium, notes raining, crowd cheering | SOLD! stamp, top caption |
| s02 | L1 "that" | Close on the map: the country turns into a dotted outline | "?" burst, NOT REAL stamp |
| s03 | L2 start | He struts down a London street, raising his plumed hat | LONDON + 1822 badges, nameplate |
| s04 | L2 "told" | Presenting the map from the podium | '"ruler" of Poyais' |
| s05 | L3 start | He shows off his guidebook | "Sketch of the Mosquito Shore…" card |
| s05b | L3 "its" | Close on fanned Poyais banknotes | BANK OF POYAIS |
| s06 | L3 "and" | Top-hatted investors grab the bonds | POYAIS BONDS stamp |
| s07 | L4 start | Coins pile up; counter runs to ~£200,000 | counter |
| s07b | L4 "pounds" | MacGregor alone, grinning, money raining | sparkle |
| s08 | L5 start | Ship under sail, hopeful settlers waving | ~250 SETTLERS |
| s08b | L5 "sailed" | The ship, small on the open sea | — |
| s09 | L6 start | Settlers on an empty beach look around (held beat) | "?" |
| s10 | L6 1st "no" | Empty jungle; brochure promises crossed off on each "No" | checklist |
| s10b | L6 3rd "no" | Wide empty jungle | NO COUNTRY stamp |
| s11 | L7 start | The same shore in grey rain, nobody there (dip in) | rain only |
| s12 | L8 start | French courtroom: MacGregor in the dock, judge | FRANCE, 1826 + ON TRIAL |
| s13 | L8 "and" | PAYOFF: gavel; MacGregor grins and raises his hat | ACQUITTED stamp → cut to s01 |
