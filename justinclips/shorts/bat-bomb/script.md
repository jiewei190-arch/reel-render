# The Bat Bomb — script & shot list

**EMOTION:** WTF
**LINE 1:** "The U.S. military built a bomb out of bats."
**CAPTION (top, frame 1 → 3.4 s):** "it burned down their own base"
**Frame 1:** one proud cartoon bat, tiny olive bomb strapped on its back, flapping down onto a crate at a 1943 desert airfield; red stamp "AMERICA'S BAT BOMB". Already moving.

**Slug:** `bat-bomb` · YouTube Short, 9:16, 1080×1920, 24 fps · **24.75 s** (target ~22 ±3) · Toon 3D + BEANMEN effects
**Voice:** Chatterbox "D2" (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py`, then
`projects/bat-bomb/tighten_vo.py` (pauses capped at 0.3 s, atempo 1.17 with pitch kept, +0.3 s beat before line 6).
Raw 30.7 s take kept as `input/voiceover_raw.wav`. Numbers spelled for the TTS; captions keep digits.

## Narration (exact VO)
1. The U.S. military built a bomb out of bats.                        *(hook, flat)*
2. World War Two. Project X-Ray.
3. The plan: a million bats, each carrying a tiny timed firebomb.   *("the plan": a million was the plan, tests used thousands)*
4. Drop them over Japan. They'd roost in attics... and then ignite.  *(still the plan; shown only as a chalk diagram)*
5. In May 1943, armed bats escaped during a test...
6. and set their own air base on fire.                               *(held beat before; comedic peak)*
7. About two years. About 2 million dollars.
8. It was canceled in 1944. The atomic bomb project took priority.   *(PLAIN, no joke, no image of the bomb)*
9. The bat bomb was never used in combat.                            *(payoff, last ~1.9 s → loop)*

"Subscribe for more." is **dropped** (allowed by the jail rules): the payoff bat hops up off the crate in the same framing
as frame 1, where it flaps down onto the crate, so the last frame cuts straight back into frame 1.

## Shots (cut every ~1.6–2.5 s; s05/s06/s09 have a hard camera punch-in inside the shot)
| # | t (s) | Scene | FX |
|---|---|---|---|
| s01 | 0.00–2.45 | Hero bat with tiny bomb lands on a crate, puffs chest; hangar + tower behind | top caption + "AMERICA'S BAT BOMB" stamp, sparkle |
| s02 | 2.45–4.38 | War room: three generals nod gravely over a bat on the map table | caption held to 3.6 s, "WWII" + "PROJECT X-RAY" stamps |
| s03 | 4.38–6.18 | Cave roost: rows of sleeping bats hanging | counter "THE PLAN 1,000,000 BATS", zzz |
| s04 | 6.18–7.82 | Close: a bat glances back at the bomb on its back, then at us | "TIMED" stamp, "?" |
| s05 | 7.82–11.42 | Chalk blueprint: bat path → attic → cartoon spark ("DROP OVER JAPAN") | diagram only — no city, no people |
| s06 | 11.42–14.78 | Airfield test: crate lids pop, armed bats burst out, punch-in | "MAY 1943", speedlines, shake |
| s07 | 14.78–16.66 | Empty hangar + tower roofs burning (toon fire/smoke); GI with bucket deadpan, unhurt; bat looks away | "THEIR OWN BASE" stamp, sweat |
| s08 | 16.66–19.06 | Clerk with ledger, general shrugs | "ABOUT 2 YEARS" → "ABOUT $2,000,000" |
| s09 | 19.06–22.90 | Folder "PROJECT X-RAY 1942–1944" stamped "CANCELED 1944"; calm push-in | plain; cool tint |
| s10 | 22.90–24.75 | Same bat, same crate, bomb off, medal on; hops up out of frame → loop | "NEVER USED IN COMBAT", sparkle |

## Captions (burned, 1–3 words, from the VO; gold on bats / million / 1943 / 1944 / fire / X-Ray / never / combat)

## TONE GUARD (MAIN) — checked
- No mushroom cloud, no atomic-bomb image, no "plan B was bigger" joke. Line 8 is said plainly over a stamped folder.
- "A million bats" is said as **the plan** (tests used thousands).
- Fire only on an empty hangar and tower roof; nobody is shown hurt. Japan appears only as a word on a chalk diagram.
