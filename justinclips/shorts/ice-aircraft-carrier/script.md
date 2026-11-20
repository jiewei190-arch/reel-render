# The Ice Aircraft Carrier (Project Habakkuk) — script & shot list

**EMOTION:** LOL / WTF
**LINE 1:** "Britain planned to fight U-boats with an aircraft carrier made of ice." (12 words)
**CAPTION (top, frame 1 → ~3.8 s):** "an aircraft carrier / MADE OF ICE" (2 lines, centre-top, "MADE OF ICE" gold)
**Frame 1:** the glowing ice carrier at sea, a plane already racing down the ice deck to take off, sparkles; cut at 1.75 s to two
baffled sailors on the deck staring, "???" over their heads. Already moving.

**Slug:** `ice-aircraft-carrier` · YouTube Short, 9:16, 1080×1920, 24 fps · **42.62 s** (target 40–48) · Toon 3D + BEANMEN effects
**Voice:** Chatterbox "D2" (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py`, two parts re-taken
(see STATUS.md), then `projects/ice-aircraft-carrier/tighten_vo.py 1.08` (pauses capped at 0.3 s, atempo 1.08 with pitch kept,
+0.25 s beat before line 6, +0.2 s before line 11). Numbers as digits; the TTS says them; captions keep digits.

## Narration (exact VO, 130 words)
1. Britain planned to fight U-boats with an aircraft carrier made of ice.          *(hook, ≤ 12 words)*
2. World War Two. U-boats were hunting convoys where planes couldn't reach.
3. Inventor Geoffrey Pyke's fix: a floating airfield, made of ice.
4. Not plain ice. Pykrete: wood pulp mixed with water, then frozen.
5. Code name: Habakkuk. 600 metres long. It would have been the biggest ship ever.   *("would have been": it was never built)*
6. But here's the part... at a 1943 conference, Mountbatten reportedly fired his pistol at a block of it.   *(the turn; "reportedly" kept from the card)*
7. The bullet bounced off... and ricocheted around the room.
8. A prototype was built on Patricia Lake, Canada, chilled by a one-horsepower motor.
9. But costs ballooned, and longer-range planes closed the gap.
10. By the end of 1943, the ice ship was shelved.                                     *(plain)*
11. The real ship was never built. The prototype took three summers to melt.           *(payoff, last ~2 s → loop)*

Loop: the payoff ends on the last sliver of the prototype's ice sinking into blue water under a big sky; frame 1 opens on the
giant ice ship on blue water under the same kind of sky, and line 11 ("…three summers to melt.") runs into line 1 ("Britain
planned to fight U-boats with an aircraft carrier made of ice.").

## Shots (each has a hard camera cut/punch-in inside it, so cuts land every ~1.5–2.6 s)
| # | t (s) | Scene | FX |
|---|---|---|---|
| s01 | 0.00–2.94 | Ice carrier at sea, plane takes off (cut 1.75 s) → two baffled sailors on deck | 2-line top caption, sparkles, "???" |
| s02 | 2.94–6.47 | Convoy freighters, a U-boat surfaces (cut on "convoys") → map: plane ranges from both coasts, red "THE GAP" | whipBlur in, "WWII", "U-BOATS" stamps, top caption held to ~3.8 s |
| s03 | 6.47–9.80 | Office: inventor at a chalkboard, idea (cut on "floating") → he holds a sketch "FLOATING AIRFIELD / MADE OF ICE" | iris in, "GEOFFREY PYKE" stamp, sparkles |
| s04 | 9.80–13.67 | Lab: plain ice block crossed out (cut on "Pykrete") → speckled pykrete block | "NOT PLAIN ICE" ✗, "PYKRETE", "WOOD PULP + WATER", "= FROZEN" + frost flash |
| s05 | 13.67–18.56 | Ice carrier with planes on deck → top-down with a yellow length ruler + a normal ship for scale → wide | "CODE NAME: HABAKKUK", "600 m (~1,969 ft)", "WOULD-BE BIGGEST SHIP EVER" |
| s06 | 18.56–24.30 | 1943 conference room: an ice block + a pykrete block on the table, generals; cut on "Mountbatten" → he aims a toy-like pistol, muzzle flash on "block" | "BUT HERE'S THE PART...", "1943 CONFERENCE", "REPORTEDLY" |
| s07 | 24.30–26.83 | Cartoon dashed tracer bounces off the pykrete (cut on "ricocheted") → zig-zags around the room, generals jump, sweat | "BOUNCED OFF", PING!/ZING!, speedlines, shake |
| s08 | 26.83–31.38 | Mountain lake, the small ice-and-wood prototype (cut on "chilled") → its little motor + fan | "PATRICIA LAKE", "CANADA", "PROTOTYPE", "1 HP" tag |
| s09 | 31.38–34.90 | Worried clerk under a swelling £ price tag (cut on "longer-range") → long-range plane with drop tanks over the convoy | "COSTS", "LONGER RANGE", "GAP CLOSED" |
| s10 | 34.90–38.28 | Folder "PROJECT HABAKKUK / THE ICE SHIP" stamped "SHELVED 1943"; push-in | plain, cool tint |
| s11 | 38.28–42.62 | Prototype on the lake (cut on "prototype") → it sinks/melts as three suns tick SUMMER 1-2-3 | "NEVER BUILT", "SUMMER n", "MELTED" → loop |

## Captions (burned, 1–3 words, from the VO; gold on ice / U-boats / Pyke's / Pykrete / Habakkuk / 600 / biggest / 1943 / Mountbatten / pistol / ricocheted / Patricia / one-horsepower / ballooned / shelved / never / three / melt)

## TONE GUARD — checked
- Nobody is hurt: the ricochet is a cartoon tracer with "PING!"; the generals jump and sweat. No blood, no injury shown.
- No national flags or insignia on planes, ships or uniforms; no real logos.
- Mountbatten's demonstration keeps "reportedly" (spoken) and a "REPORTEDLY" stamp on screen.
- "Biggest ship ever" is said as "would have been" and shown as "WOULD-BE".
- The people (Pyke, Mountbatten, generals, sailors) are generic Toon 3D beans, not likenesses.
