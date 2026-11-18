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
