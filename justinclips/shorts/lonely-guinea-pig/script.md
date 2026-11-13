# Switzerland Made Owning One Guinea Pig Illegal: script & shot list

**Slug:** `lonely-guinea-pig` · **Format:** YouTube Short, 9:16, 1080×1920, 24 fps · **Runtime:** 41.1 s (loops) · **Style:** Toon 3D + BEANMEN effects
**Voice:** Chatterbox D2 (owner's pick, Nov 13: built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py` with Shorts gaps (`--gap 0.3 --lead 0.15`). Deadpan. Held beats (`...`) after "lonely" (0.85 s) and before "arranged by the government" (0.86 s). Script for the TTS: `tts_script.md`; per-line timing and the chosen seeds: `projects/lonely-guinea-pig/input/voiceover.lines.json`. Whisper QA passed on every line, and a full-transcript Whisper pass matches the script word for word. No years or numbers are spoken; "2008" is on screen only.
**Owner-sanctioned trim:** line 4 uses "Parrots, even lovebirds." (the owner's brief allows the trim if long).

## Frame-1 hook (big, 3 lines, on screen from frame 1, readable in 1 s)
> OWNING ONE / GUINEA PIG IS / **ILLEGAL HERE**

## Narration (exact VO, see tts_script.md)
1. In Switzerland, owning one guinea pig is basically illegal.
2. Not because they're loud. Because guinea pigs get lonely...
3. and Switzerland decided loneliness is animal cruelty.
4. The law says social pets must live in pairs. Parrots, even lovebirds.
5. If it needs a friend, you are legally required to provide one.
6. But what happens when one of your pair dies?
7. Congrats. You're now a criminal with a grieving rodent.
8. Enter the most Swiss solution ever: rent-a-guinea-pig services.
9. You lease a temporary companion for your widowed pet.
10. Somewhere in Zurich right now, a guinea pig is on a blind date...
11. *(held beat)* arranged by the government.
12. Subscribe for more. *(1.14 s; hard cut back to frame 1)*

## Shots
| # | t (s) | Scene | FX / transition |
|---|---|---|---|
| s01 | 0.00–3.60 | FRAME 1: a sad guinea pig grips thick jail bars of its cage, Swiss flag waving behind, slow push-in | hook text, sunny sky + god rays, sweat, "!" + shake on "illegal" |
| s02 | 3.60–5.15 | Swiss courtroom: judge slams the gavel at the nervous owner (HERO cameo); the guinea pig sits in the witness box | whipBlur in, "???" → "!" + sweat, flash + shake on "loud" |
| s03 | 5.15–7.55 | Close on the witness-box pig: "lonely" | dissolve, spotlight + sweat on "lonely" |
| s04 | 7.55–11.80 | **INSERT document**: ANIMAL PROTECTION ORDINANCE / Switzerland, 2008 slams in; stamp **LONELINESS = CRUELTY** on "cruelty" | flash in, impact + paper + stamp sfx |
| s05 | 11.80–15.00 | Police lineup: guinea pig + rat with "WE NEED FRIENDS" signs, tag SOCIAL PETS | iris in, "!" ×2 + flash on "pairs" |
| s06 | 15.00–17.05 | Lineup cont.: the parrot squawks, two lovebirds snuggle | whipBlur in, heart eyes + hearts |
| s07 | 17.05–18.25 | Two happy guinea pigs share a lettuce leaf | dissolve, hearts + sparkle |
| s08 | 18.25–20.35 | **INSERT bigtext**: THE LEGAL MINIMUM **2** of the same species + stamp REQUIRED | flash in |
| s09 | 20.35–22.90 | Tiny cute funeral at dusk: veiled guinea pig beside a matchbox coffin with flowers | dip in, thunder + bolt + shake on "dies", sweat |
| s10 | 22.90–26.35 | Living room: "Congrats." confetti on the deadpan owner; the door bursts open on "criminal": SWISS PET POLICE, "WHERE'S THE SECOND ONE?"; close on the grieving rodent | hard cut (punchline), flash + crash + shake, speech bubble |
| s11 | 26.35–30.30 | RENT-A-PIG shop on a sunny Swiss street; RETO (tie, name tag, briefcase) steps out; stamp REAL BUSINESS | iris in, sparkle on "Swiss", stars |
| s12 | 30.30–33.30 | RETO arrives at the widow's cage | whipBlur in, "???" → sparkle → "!" |
| s13 | 33.30–37.85 | ZÜRICH, RIGHT NOW: candlelit terrace date over the skyline; RETO slides over his business card | iris open ("meanwhile"), heart eyes + hearts |
| s14 | 37.85–41.125 | The couple watches the sunset over Zurich; stamp GOV'T APPROVED; "Subscribe for more." | dissolve, hearts; hard cut → frame 1 |

## Captions
Toon 3D captions, 1–3 words, y = 0.70 (lower middle, clear of the Shorts UI), auto-chunked from the voice timing. Gold: ONE, ILLEGAL, LONELY, cruelty, PAIRS, criminal, rent-a-guinea-pig, Zurich, government.

## Tone guards
Wholesome comedy. Nobody is hurt. The funeral is cute (matchbox, flowers, veil), and the "police" only shout a question. No photos, no gore, no channel name in the video. Every claim is in `sources.md`.

## Audio
Music `toon3d:curious` ducked under the voice; about 40 kit sfx cues, many on spoken words (gavel knock on "loud", stamp on "cruelty"/"required", thunder on "dies", party horn on "Congrats", crash on "criminal", cash on "services").
