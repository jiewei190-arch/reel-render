# Nuke the Moon (Project A119) — script & shot list

**EMOTION:** WTF
**LINE 1 (11 words):** "In 1958, the U.S. Air Force planned to nuke the Moon."
  (shortened from the card's first line; same idea: a real Air Force plan to detonate a nuclear bomb on the Moon)
**TOP CAPTION (frame 1 → 3.6 s held across the first cut, 2 lines, centre-top):** "PROJECT A119" (gold) / "NUKE THE MOON" (red)
**Frame 1:** night rooftop, a 1950s Air Force general (blue uniform, cap) jabs a pointer stick at a giant toon Moon; a cartoon
starburst flash ("BOOM?") already popping on the Moon, the Moon gasping and sweating. Already moving.

**Slug:** `nuke-the-moon` · YouTube Short, 9:16, 1080×1920, 24 fps · **42.5 s** (target 40-48) · Toon 3D + BEANMEN effects
**Voice:** Chatterbox "D2" (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py`
(TTS text: `whatif/aitrends-2d-studio/projects/nuke-the-moon/input/tts_script.md`, "A119" spoken as "A one-nineteen"),
then `projects/nuke-the-moon/tighten_vo.py 1.0` (pauses capped at 0.3 s, no speed-up, +0.25 s beat before line 7, +0.2 s before line 11).

## Narration (exact VO, 129 words)
1. In 1958, the U.S. Air Force planned to nuke the Moon.                      *(hook, ≤ 12 words)*
2. A top-secret study, called Project A119.
3. The Soviet Union had taken an early lead in the Space Race.
4. So the idea was a show of force, to boost morale back home.
5. Fire a small nuclear warhead at the Moon... and set it off on impact.
6. The flash would have been faintly visible from Earth, with the naked eye.
7. But here's the wild part... a young Carl Sagan was on the team.             *("But..." turn, ~22 s)*
8. His job: working out how the dust cloud would spread.
9. A hydrogen bomb was too heavy, so they picked a 1.7 kiloton warhead.
10. In January 1959, the Air Force canceled it. The risks outweighed the benefits.
11. The reports were destroyed in 1987... and the Moon remains un-nuked.        *(payoff, last ~2.3 s → loop)*

## Shots (cuts every ~1.7-3.5 s; s03, s04, s09 have a hard camera punch-in inside the shot)
| # | t (s) | Scene | FX |
|---|---|---|---|
| s01 | 0.00–3.62 | Rooftop at night: general points the stick at the giant Moon; cartoon flash pops on the Moon; Moon gasps | top caption, starburst "BOOM?", sweat |
| s02 | 3.62–6.90 | War room (dimmed), manila folder "PROJECT A119 / A Study of Lunar Research Flights / U.S. AIR FORCE · 1958" | "TOP SECRET" stamp; caption held to 4.4 s |
| s03 | 6.90–10.36 | Two generals with binoculars watch a tiny satellite beep across the stars | "SOVIET EARLY LEAD", "SPACE RACE" stamps, sweat, "!" |
| s04 | 10.36–13.96 | War room: general slams the table; the others cheer | "SHOW OF FORCE", "BOOST MORALE", shake |
| s05 | 13.96–16.62 | Cartoon rocket lifts off a pad at night, Moon watching nervously | "SMALL NUCLEAR WARHEAD", speedlines |
| s06 | 16.62–18.55 | Space: rocket closes on the Moon; cartoon flash "KA-POW" on "impact" | flash, shake |
| s07 | 18.55–20.20 | Moon close-up, little starburst at its edge, Moon unimpressed | "VISIBLE FROM EARTH" |
| s08 | 20.20–22.05 | Dad + kid on a porch look up at a faint twinkle on the distant Moon | "NAKED EYE", "!", "?" |
| s09 | 22.05–25.60 | Lab: a young scientist at the chalkboard turns to camera on "young" | "WAIT, WHAT?", "CARL SAGAN / doctoral student, 1958" |
| s10 | 25.60–28.60 | Chalkboard: dashed dust rings spreading around a chalk Moon | "DUST CLOUD MATH" |
| s11 | 28.60–30.45 | General strains at a giant crate stencilled "H-BOMB" | "TOO HEAVY", sweat |
| s12 | 30.45–33.05 | Counter card "W25 WARHEAD · 1.7 kt · small · lightweight" | |
| s13 | 33.05–36.05 | Folder "PROJECT A119 · MAY 1958 – JAN 1959" | "JAN 1959", "CANCELED" stamps |
| s14 | 36.05–37.90 | Balance: RISKS sinks, BENEFITS rises | "RISKS > BENEFITS" |
| s15 | 37.90–40.15 | Clerk feeds the A119 reports into a shredder | "DESTROYED 1987" |
| s16 | 40.15–42.50 | Same rooftop + framing as frame 1: general shrugs, Moon smiles intact; he raises the pointer again → loop | "STILL UN-NUKED", sparkle |

## TONE GUARD — checked
- The only blast is a 2D cartoon starburst, and only on the Moon. No mushroom cloud anywhere, nothing explodes over Earth, nobody is hurt.
- The people on Earth (s08) only look up at a faint twinkle.
- No flags, emblems or logos (generic satellite, plain blue uniforms).
- Carl Sagan is a generic toon scientist with a name label, not a likeness.
