# same-car-more (FORMAT v1, style S4 WOULD-YOU-RATHER): cloud QA notes

- **Composition:** `SameCarMoreV1` / `SameCarMoreV1Sub` in `finance/render-pc/src/fin/v1/samecar.tsx`. 832 frames (27.72 s), 22 shots.
- **Voice:** D2 Chatterbox, exaggeration 0.55, cfg 0.3, normal speed. Seed 11 of 2; it scored 21.9 against seed 7's 20.9 (`vo/takes.md`). Whisper word check: **PASS** (`vo/whisper_check.md`).
- **Audio plan:** the toon3d `upbeat` bed plus the SFX cues exported from the composition (`tools/story_mix.py`). Not mixed in the cloud.
- **PC commands:** `finance/V1_RENDER.md`.

## Cliffhanger rule
- **Open loop: 56 %** (15.4 s, "And behind that door, something is eating his money..."). The covered "? ? ?" shed door rattles with orange light under it, over three shots (S08, S19, S21).
- **Twist: 70 %** (19.44 s of 27.72 s). The door bursts on "8,034", the INTEREST furnace roars and the $8,034 vs $3,347 towers rise. The door stays shut until the burst (`doorOpenAt`).
- **Payoff:** "The cheap payment burns about 4,700 extra" (92 %). It restates the twist's two towers as one number.
- **Ending:** no closing line. The last shot is the S01 lens with the boards dropping again, then a cut to frame 0, "Would you rather pay 926 a month, or just 453?". No "part 2", no "follow".
- **Rewritten for this rule:** the twist used to land at 59 %. The narration gained "Easy choice, right?" and a longer door tease, and dropped "Knowing that, which one would you pick?".

## Hard gates
1. **Ground contact.** No pose sets the hip height. Props are clamped to the floor (bricks, debris and the door slab are ≥ their half size).
2. **No intersections.** `node tools/story_qa.mjs SameCarMoreV1` checks 832 frames x 4 sub-frames. Props are tested against each actor's head, torso, hand and forearm boxes; the cars are oriented boxes. Result: **0 clips**.
3. **Stills.** Rounds 2–3, every shot at 60 %, plus the mid-burst frame. Fixes:
   - S09, the twist: the wide lens showed the cars, not the door. It now looks down from high over the roaring furnace, with debris flying from the burst door behind it. A right-side lens was tried and dropped: a car filled the foreground.
   - S19 and S21: too close (just a glow). Now wider, with the "? ? ?" door readable.
   - S20: Spender's arm hid his face. The camera moved to his other side.
   - S12: the EXTRA label was cropped. The camera pulled back.

## Format checks
- **Hook text from frame 0:** "$926 OR $453 A MONTH?" (5 words). It comes back on the loop shot.
- **"You":** "Would you rather...".
- **Captions:** 1–3 words, the spoken word in red.
- **Pacing:** shots 0.58–1.9 s. S05 is 0.58 s, a grab beat.
- **Length:** 27.72 s.

## Known gaps
- S09: the furnace fills the lower frame, so the door slab mostly flies behind it. The burst reads from the debris, the slam and the furnace appearing, not from the door itself. The furnace's fire window renders as a near-white plate; it's the shared hook-B Furnace, so it was left unchanged.
- S03 and S04: the "SAME CAR · SAME 7%" banner sits partly behind the hook text. S15 shows it full-frame.
- Nobody has listened by ear.

---

## Earlier version (F2, superseded by v1)
STATE: rendered

# same-car-more: render notes (PC, RTX 4060)
- **Final:** `video.mp4` = render **v2**, from render-pc @ 38339896 (= CODE_FINAL), with the voice muxed in.
  - 1080x1920, 30 fps; AAC 256k 48 kHz.
  - Measured **-14.1 LUFS / -1.4 dBFS**.
  - Voice only.
- **Why v2:** v1 was rendered from scene code before the cloud's round-3/4 fixes landed. v1 was superseded and must not be used.
- **Render:** render=127 s, SUB=4.
- **critic.py (v2):**
  - SYNC   20 cuts checked (0 after the end of this video skipped), max offset 0 frame(s)
  - STATIC longest near-still run 12 frames = 0.40 s (from frame 630)
  - EDGES  closest white caption pixel to a side edge: 0.4 % of the width
  - SOUND  1 audio stream(s): 1,aac,audio,30.266792 -> the voice only, 0 sound effects
  - FAIL EDGES  caption text 0.4 % from the edge (< 6 %)
  - 1 FAIL
- **flicker.py:** same-car-more_v2.mp4: 917 frames, 3 spikes; stride pattern: None
- **Eye check:** I checked the shot sheet (`contact_sheet.png`), and every shot reads.
- **EDGES FAIL (0.4 %):** I judge it a false positive. Every caption on the shot sheet is centred, well inside the 12 % margins. The flagged pixels are scene whites at the frame edge (the white CFPB sign in S18, clouds, the road kerbs).
- **Sky:** S14–S18 switch to the night/whisper sky at the interest reveal (a story turn), then go back to day for the loop.
