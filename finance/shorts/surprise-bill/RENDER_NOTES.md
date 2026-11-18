# surprise-bill (FORMAT v1, style S1 STORY): cloud QA notes

- **Composition:** `SurpriseBillV1` / `SurpriseBillV1Sub` in `finance/render-pc/src/fin/v1/surprise.tsx`. 884 frames (29.47 s), 26 shots.
- **Voice:** D2 Chatterbox, exaggeration 0.55, cfg 0.3, normal speed. Seed 5, with line 2 taken from seed 7. The cut is at line starts, inside the 0.25 s gap (`takes/splice57.*`).
  - Every other take had a single wrong word:
    - seeds 3, 5 and 11 said "do now" for "due now";
    - seed 7 said "Saber" for "Saver";
    - seed 11 also ran 30.2 s.
  - In the per-line transcription of the chosen take, every word matches.
  - Full-file Whisper (`vo/whisper_check.md`) still hears 2 words differently: "car" as "card" and "Saver" as "savor". The per-line pass heard the same audio correctly, so it's context, not pronunciation. Worth a listen on the PC.
- **Audio plan:** the toon3d `tense` bed plus the SFX cues exported from the composition (`tools/story_mix.py`). Not mixed in the cloud.
- **PC commands:** `finance/V1_RENDER.md`.

## Cliffhanger rule
- **Open loop: 42 %** (12.3 s, "And the worst part is still coming..."). A sealed red FINAL TOTAL envelope trembles on a pedestal.
- **The loop stays open** through Saver's cut-away (S13, S14, S26, S15): the envelope is sealed (`envOpen` is 0 for beats 13–15). "Spender?" (S24) whips back to him while it's still shaking.
- **Twist: 71 %** (21.0 s of 29.47 s, "plus 257 dollars"). The envelope bursts open to +$257 INTEREST, exactly the total it teased.
- **Ending:** "Could you?" on the S01 lens with the car smoking again, then a cut to frame 0. No "part 2", no "follow".
- The narration was reordered for this: Saver's "Done." used to come after the reveal, which then landed at 60 %.

## Hard gates
1. **Ground contact.** No pose sets the hip height. The flinch, the shock and the slump are arm, head and torso moves only. Props are clamped to the floor or counter tops.
2. **No intersections.** `node tools/story_qa.mjs SurpriseBillV1` checks 884 frames x 4 sub-frames. It tests props against each actor's head, torso, hand and forearm boxes; the car and booth are oriented boxes. Result: **0 clips**.
3. **Stills.** Rounds 3–6, every shot at 60 %. Fixes:
   - S02: smoke hid the bill, so it now thins after the bang.
   - S03 and S04: Spender's arms filled the lens. The camera pulled back and moved to his left, and the shock arms are narrower.
   - S21: the envelope close-up was cropped.
   - S16 and S22: the survey board was cropped and the caption sat on its title. S16 is wider; S22 aims at the 63 % bar.
   - S24: the whip back now frames Spender.
   - Two new shots split the long ones: S26 (the jar label) and S25 (Spender under MONTH 26).

## Format checks
- **Hook text from frame 0:** "A $1,000 BILL FOR 2 YEARS" (6 words).
- **Frame 0 is mid-action:** the bonnet bang, smoke, and the bill mid-air.
- **"You":** "Could you?"
- **Captions:** 1–3 words, the spoken word in red.
- **Pacing:** shots 0.62–1.6 s.
- **Length:** 29.47 s, under 30 s.

## Known gaps
- S11: the opened envelope's letter card is blank (beige) in front of the +$257 sign. The sign reads clearly above it.
- S10: the calendar race is 0.62 s.
- Nobody has listened by ear.

---

## Earlier version (F2, superseded by v1)
STATE: rendered

# surprise-bill: render notes (PC, RTX 4060)
- **Final:** `video.mp4` = render **v2**, from render-pc @ 38339896 (= CODE_FINAL), with the voice muxed in.
  - 1080x1920, 30 fps, h264 crf 16; AAC 256k 48 kHz.
  - Measured I / true peak: **-14.2 LUFS / -1.5 dBFS**.
  - Voice only.
- **Versions:**
  - **v1** (render=120 s): the cloud code as delivered.
  - **v2** (render=121 s): with the PC lens fix below.
- **critic.py (v2):**
  - SYNC   18 cuts checked (0 after the end of this video skipped), max offset 0 frame(s)
  - STATIC longest near-still run 0 frames = 0.00 s (from frame 0)
  - EDGES  closest white caption pixel to a side edge: 2.6 % of the width
  - SOUND  1 audio stream(s): 1,aac,audio,28.288000 -> the voice only, 0 sound effects
  - FAIL EDGES  caption text 2.6 % from the edge (< 6 %)
  - 1 FAIL
- **flicker.py:** surprise-bill_v2.mp4: 849 frames, 13 spikes; stride pattern: None
- **PC fix (v1 → v2):** S14 ("only 63") was an empty light-blue frame. The red car's 2.6 m body overlaps the survey blocks, so the lens was inside the car. The car is now hidden in S14 only, and the shot uses a fitted lens on the 100% / 63% bars and the ten blocks.
- **EDGES FAIL (2.6 %):** I judge it a false positive. Every caption on the sheet is centred; the flagged pixels are scene whites at the frame edge (the EXAMPLE card, clouds, kerbs).

## PC render (Reel creator, 2026-11-18): video.mp4 = PC v1 from CODE_FINAL 6e48331e
`video.mp4` sha256 `131d79ed450b6894cbcff7ab97eccf9086becfa9fb23be82001a1ea76362088a`. 1080x1920, 30 fps, 884 frames (29.47 s), SUB=4 motion blur, 30.0 MB. It replaces the old F2 render.
The scene code is unchanged between 6e48331e and the branch tip (surprise.tsx, kit.tsx and the plan, per `git diff --stat`).

- **Audio:** `story_mix.py` (`tense` bed, 26 SFX) then `mux_voice.sh`, giving **-14.1 LUFS, true peak -1.6 dBFS**.
- **Critic:** 0 FAIL. SYNC 25/25 cuts exact; STATIC 0 s; EDGES captions 16.7 % from the side. frac_still 0.183.
- **Whisper (small) on the final mix:** the line order matches script.txt. It mishears "car" as "card", "due" as "do" and "Saver" as "Sabre"; the cloud's per-line Whisper QA on voice.wav passed, so these are ASR slips on the mixed track.
- **story_qa:** 884 frames x 4 sub-frames, 0 clips.
- **By eye:**
  - Scrubbed at 6 fps (`scrub_6fps_0-12s.jpg`, `scrub_6fps_12-29s.jpg`) and on the impact frames plus 2 (`scrub_impacts.jpg`: 0/1, 74, 534, 629, 782).
  - Feet are on the ground. The FINAL TOTAL card stands on its pedestal in front of the Lender with clear depth between them (not in him). No prop is in a head or body.
- **Pre-post gate, for MAIN** (frame 0 = `frame0.jpg`, first 2 s = `strip_0-2s_6fps.jpg`):
  - **Frame 0 is a MEDIUM shot.** Spender stands by his smoking car at about 45 % of the frame height. That's not the "close-up >= 50 %" the gate asks for.
  - Passes: the hook text "A $1,000 BILL FOR 2 YEARS" is readable at frame 0; the stake is on screen at frame 0; the first word lands at about 0.15 s; music and SFX play at frame 0; the frame is mid-action (smoke) and not dark.
  - If you want frame 0 tighter, it's a one-line lens change on S01 plus a ~3 min re-render on the PC.

Not uploaded. It waits for MAIN QA and a BM GO.

## PC v2 (Reel creator, 2026-11-18): MAIN's frame-0 and hook-audio fix. video.mp4 = PC v2
- `video.mp4` sha256 `1cabd5fbfa359d03c09677276f084e499c2133a4db4ad3e0b5f487f7ce3dfa02`. 1080x1920, 30 fps, 898 frames (29.93 s), SUB=4 motion blur, 30.6 MB. It replaces PC v1 (131d79ed).
- **Line 1 re-voiced** (D2, exaggeration 0.55, cfg 0.3, seed 7): "Spender's car just broke down, and this bill will follow him for two years." It was spliced into voice.wav (every later line +0.462 s), then re-timed: `vo/timings.json`, `src/plan.gen.ts` (DURATION 898), and `render-pc/src/shorts/surprise_bill_v1.plan.gen.ts`.
- **Whisper on "car":**
  - The first 4.5 s of the final mix, on its own: both `small` and `small.en` hear **"Spender's car just broke down"**. That's what a viewer has heard at that point.
  - The whole 30 s file: both models still write "card". Whisper decodes the 30 s window at once, and line 3's "it goes on a card" biases it. The line-1 audio alone transcribes as "car" every time.
  - On screen, the hook text says CAR from frame 0, and the caption shows "SPENDER'S CAR JUST" on that word.
- **Frame 0 / S18 lens (`surprise.tsx`):** a close `creep` lens on Spender's face, fov 52, face 0.52. Spender turns to face the camera (yaw), with hands out and a head turn. S18 (the loop shot) uses the same lens, so the loop still matches.
- **Hook text:** "$1,000 CAR BILL = 2 YEARS OF PAYMENTS" (both places).
- **Audio:** story_mix (music `tense`, 26 SFX) then mux_voice: **-14.2 LUFS, true peak -1.5 dBFS**.
- **Critic:** 0 FAIL. SYNC 25 cuts, max offset 0 frames; STATIC 0 s; EDGES 15.9 %. frac_still 0.168.

### Clipping checks (v2)
- `story_qa`: 898 frames x 4 sub-frames, **0 clips**.
- **By eye:**
  - 6 fps scrub (`scrub_6fps_0-12s.jpg`, `scrub_6fps_12-24s.jpg`, `scrub_6fps_24-30s.jpg`) and the impact frames plus 2 (`scrub_impacts.jpg`: 0/1, 80, 644, 795).
  - Feet on the floor throughout. Spender's raised fist in S01 is beside his head, not in it. The bill, the jar, the FINAL TOTAL card and the boards sit clear of every head and body.

### Pre-post gate (v2; see `frame0.jpg`, `strip_0-2s_6fps.jpg`)
| check | result |
|---|---|
| close-up >= 50 % of the frame, mid-action | yes: Spender's face and torso fill the frame, panicked, his fist mid-raise |
| hook text readable | yes: "$1,000 CAR BILL = 2 YEARS OF PAYMENTS", 2 lines, top third |
| stake on screen by 0.5 s | yes, from frame 0 |
| first word by 0.3 s | yes: "Spender's" at 0.15 s |
| music and SFX at frame 0 | yes |
| emotion change by 1.5 s | yes: shock to worried on "broke down" (about 1.0 s) |
| no dark, empty or wide frame in the first 1 s | yes |

Not uploaded. It waits for MAIN QA and a BM GO.
