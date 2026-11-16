# The rats who got a lawyer (Autun, France, early 1500s): script & shot list

**EMOTION: LOL**
**LINE 1:** "Rats once got sued. And they got a lawyer." (9 words in two 4-5 word beats, no setup)
**CAPTION (top, frame 1 → config.topCaptionUntil, ≥ 3.2 s):** "and he took the case / very seriously"

**Slug:** `rats-sued-in-court` · YouTube Short, 9:16, 1080×1920, 24 fps · Toon 3D + BEANMEN FX · Music `toon3d:curious` −19 dB
**Voice:** Chatterbox "D2" (exaggeration 0.3, cfg 0.3), Whisper QA. The narration lives in `lines.json`; shot timing is derived from the voice (STATUS.md has the one-command re-voice).

**Why not the brief's "Rats got sued, and their lawyer won":** the outcome is not firmly recorded. Sky HISTORY says the case "was dismissed", and other retellings say the record just ends. So line 1 makes the fully sourced claim (they were sued and had a lawyer), and the payoff keeps the hedge ("reportedly thrown out").

## Jail-break + vidIQ checklist (IAWAKEN_PLAYBOOK.md)
- [x] Triple hook in the first 2 s: frame 1 = five tiny rats in tiny hats in the dock, the official shocked ("!"), the lawyer pleading · VO line 1 is the claim · top caption adds story, not the title, ≥ 3.2 s.
- [x] Wide way in: "Rats got sued" (no niche knowledge needed); the place and the lawyer's name come later.
- [x] One emotion (LOL). No setup.
- [x] Cuts every ~1.6-2.5 s (13 shots).
- [x] Ends abruptly on the payoff (CASE THROWN OUT stamp, rats cheering); no CTA or end card; hard cut back to frame 1.
- [x] Hedges: "reportedly" (the barley, the outcome; "(reportedly)" also on screen), "the early 1500s".
- [x] No animal hurt: the cats only lounge and stare; a rat peeks out and ducks back.

## Narration (exact VO)
1. Rats once got sued. And they got a lawyer.
2. France, the early 1500s. Rats reportedly ate the barley around Autun.
3. So a court summoned the rats.
4. The rats... did not show up.
5. Their lawyer said that was unfair: his clients lived in lots of villages.
6. Then he said they couldn't come safely... because of the town's cats.
7. He wanted the cats kept indoors. The owners said no.
8. So the case was reportedly thrown out.  *(PAYOFF)*

## Shots (anchors in `project/story/shots.tpl.json`)
| # | starts at | Scene | FX |
|---|---|---|---|
| s01 | 0 | Rats in tiny hats in the dock; the official shocked; the lawyer pleading | "!", top caption |
| s02 | L1 "and" | The lawyer bows to his clients; a rat waves back | THE DEFENSE badge |
| s03 | L2 start | Barley field full of nibbling rats | FRANCE, early 1500s |
| s04 | L2 "rats" | Close on a rat chewing barley | "(reportedly)", AUTUN |
| s05 | L3 start | The town crier reads the summons | SUMMONS stamp |
| s06 | L4 start | The rats' bench, empty; the official waits (held beat) | "...", NO-SHOW stamp |
| s07 | L5 start | Chasseneuz argues, finger raised | nameplate, UNFAIR! stamp |
| s08 | L5 "his" | Map card: villages everywhere, a rat in each | — |
| s09 | L6 start | The lawyer pleads, hand on heart; the official raises a brow (held beat) | "?" |
| s10 | L6 "because" | Three cats lounge in the street; a rat peeks out and ducks back | CATS burst |
| s11 | L7 start | The lawyer appeals to townsfolk holding their cats | KEEP CATS INDOORS? card |
| s12 | L7 2nd "the" | The owners hug their cats and shake their heads | NO. stamp, hearts |
| s13 | L8 "case" | PAYOFF: gavel; the rats cheer; the lawyer bows | CASE THROWN OUT + (reportedly) → cut to s01 |
