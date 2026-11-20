# London's Corpse Train (London Necropolis Railway) — script & shot list

**EMOTION:** WTF / LOL
**LINE 1:** "London ran a train line just for dead people." (9 words; the card's long first line shortened, same idea)
**CAPTION (top, frame 1 → 3.5 s):** "the corpse train" (2 lines: "the **corpse**" red / "**train**" gold)
**Frame 1:** a green Victorian steam train already chugging along, its open wagons loaded with closed coffins, side boards
"COFFINS ONLY", steam rolling over the top. Already moving.

**Slug:** `necropolis-railway` · YouTube Short, 9:16, 1080×1920, 24 fps · **41.25 s** (target 40-48) · Toon 3D + BEANMEN effects
**Voice:** Chatterbox "D2" (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py`, then
`projects/necropolis-railway/tighten_vo.py` (pauses capped at 0.3 s, line gaps 0.26 s, atempo 1.0, +0.25 s beat before
line 7, +0.3 s before line 10). Raw 43.4 s take kept as `input/voiceover_raw.wav`. Numbers spelled for the TTS; captions keep digits.

## Narration (exact VO, 128 words)
1. London ran a train line just for dead people.                                   *(hook)*
2. From 1854, it carried coffins and mourners 23 miles out to Brookwood Cemetery.
3. London's graveyards were so full, every new grave cut into an old one.          *(why: the burial crisis)*
4. So the dead got train tickets. One way, of course.                              *(coffins: one-way tickets; mourners: returns)*
5. And the carriages were split by religion and by class... for the living AND the dead.
6. No corpse had to share a compartment with the wrong crowd.
7. But here's the part... golfers dressed up as mourners to ride it to a golf course.   *("But" turn)*
8. And in 1867, the driver got so drunk at the cemetery bar, the fireman had to drive the train home.
9. It ran for 87 years... until a 1941 air raid wrecked its London station.
10. The corpse train never ran again.                                               *(payoff, last ~2.7 s → loop)*

## Shots (cuts every ~1.5–4 s, hard punch-ins inside s02 / s04 / s08 / s10 / s13)
| # | t (s) | Scene | FX |
|---|---|---|---|
| s01 | 0.00–2.40 | Steam train with coffin wagons ("COFFINS ONLY"), camera rides alongside | top caption, "LONDON, 1854" stamp |
| s02 | 2.40–5.40 | London platform: porters carry a coffin to the wagon, mourners in top hats wait; punch-in on "coffins" | caption held to 3.5 s, "1854" stamp |
| s03 | 5.40–7.85 | Route map card London → Brookwood, train icon chugs along the dashed line | "23 MILES" |
| s04 | 7.85–12.05 | Packed churchyard; punch-in: the digger's spade clunks on an older (closed) coffin lid | "FULL", "!", "NO ROOM" |
| s05 | 12.05–15.25 | Ticket clerk + coffin on a trolley → ticket card "COFFIN · FIRST CLASS · LONDON → BROOKWOOD" | "ONE WAY" stamp |
| s06 | 15.25–19.55 | Blueprint: ANGLICAN / NONCONFORMIST × 1st/2nd/3rd; mourner icons, then coffins fill their boxes | word-timed |
| s07 | 19.55–22.55 | Hearse-van cutaway: polished 1ST coffin / plain 3RD coffin, partition; top-hat mourner peeks, turns up his nose | "NO MIXING" |
| s08 | 22.55–26.05 | Three mourners on the platform; punch-in: the middle one has a golf bag, shifty eyes | spotlight, sweat, "GOLFERS?!" |
| s09 | 26.05–27.55 | Same "mourner" tees off on a green beside the cemetery fence | "FORE!", speedlines |
| s10 | 27.55–30.95 | Engine driver at the station bar, beer mug, swaying; punch-in on "drunk" | "1867", stars |
| s11 | 30.95–33.15 | Engine cab: the fireman grips the regulator, sweating; the driver dozes | zzz, "FIREMAN DRIVING" |
| s12 | 33.15–35.30 | Train streams past | counter "87 YEARS · 1854 - 1941" |
| s13 | 35.30–38.55 | Night: the empty London terminus, searchlights, fire + smoke; flash + shake on "wrecked" | "APRIL 1941", "AIR RAID" |
| s14 | 38.55–41.25 | Same train, same countryside, parked; steam thins; camera settles on frame 1's framing → loop | "NEVER RAN AGAIN" |

"Subscribe for more." is dropped: the payoff ends on frame 1's framing, so the last frame cuts straight back into frame 1.

## Captions (burned, 1–3 words, from the VO; gold on dead / coffins / 1854 / 23 / full / one way / religion / class / golfers / 1867 / drunk / 87 / 1941 / never)

## TONE GUARD — checked
- Closed coffins only; no bodies, bones or gore. The spade hits a wooden lid, nothing more.
- Mourners are drawn sad and dignified; the jokes are on the railway's rules, the golfers and the drunk driver, never on the dead.
- The 1941 raid is shown on an empty building at night (fire, smoke, searchlights); nobody is shown hurt.
- No real logos or company crests.
