STATE: code frozen (cloud stills verified), awaiting the PC render

# minimum-payment-trap (FORMAT v1 story): cloud QA notes

- **Composition:** `MinimumPaymentTrapV1` / `MinimumPaymentTrapV1Sub` in `finance/render-pc/src/fin/v1/mintrap.tsx`. 699 frames (23.30 s).
- **Voice:** D2 Chatterbox, exaggeration 0.55, cfg 0.3, normal speed. Seed 7 of 2. The Whisper word check passes (`vo/whisper_check.md`). Seed 11 was 0.04 punchier but Whisper heard "Paid 200" in it (`vo/takes.md`).
- **Audio plan:** the toon3d `upbeat` bed from 0 s, ducked under the voice, plus 37 SFX cues exported from the composition (`tools/story_mix.py`). Not mixed in the cloud.
- **PC commands:** `finance/V1_RENDER.md`.

## Hard gates (MAIN, after the owner rejected v2 for clipping)
1. **Ground contact.** No pose changes the hip height (`pose.y` is never set, and there is no kneel or collapse). `bob` only lowers the upper body into the hips. Leg swings (`legL`/`legR`, ±0.35 rad) pivot at the hip, so the soles only rise.
   - The despair beat (S16) is a slump: head pitch, torso pitch and drooped antennae. The legs and hips don't change, so the soles stay on the floor.
   - Squash (kit) scales about y = 0, so the soles stay at 0. It isn't used in this Short.
   - Every prop's y is clamped above the floor or counter top: coins ≥ 0.12 m, burst cubes ≥ their rotated half size, debris ≥ y0.
2. **No intersections.** `node tools/story_qa.mjs` checks every output frame and 4 sub-frames per frame (2,796 samples). It tests every moving and static prop box against each actor's head and torso box (from the rig spec, plus a 2 cm pad), and every prop bottom against the floor. Moving props: 19 calendar pages, 10 rain pages, 9 split coins, 24 crash coins, 22 burst cubes, the price tag, the bill, three labels, the DONE stamp, the TV. Static props: the counter, pay box, jar, block and pile. Result: **0 clips**.
   - The paths are built to stay clear. Pages fly up and LEFT, away from Spender. Rain pages pass ≥ 0.5 m in front of the head centre; the head's half depth is 0.14 m. Saver's block bursts backwards and to the sides, never toward him.
   - Fixed along the way: Spender's torso in the counter corner (S12), coins and cubes dipping below the floor while spinning, and the burst starting from a single point.
3. **Stills.** `stills_sheet.png` has every shot at 60 %. `stills_motion_sheet.png` has 17 mid-motion frames: the frame-0 fall, the landing, the page burst, the rain, the tag slam, the stamp, the coin split, the crash, Saver's slam and burst, and the loop's last frame. Rounds 1–4 plus the final round each fixed:
   - Spender and Saver facing away; the face slams too close (S04, S16, S21); the caption over faces (faces moved under the caption band).
   - The OWE block shots hidden behind the TV, counter and pay box (the block scene moved to the open left of the set).
   - The bill and DONE stamp off frame; washed-out labels.
   - Frame 0: the falling TV is now in frame under the hook text, and the loop shot ends with the next TV at the same height.

## Format checks (FORMAT_V1.md)
- **Frame 0 is mid-action:** the TV is mid-fall and Spender cheers.
- **Hook text from frame 0:** "19 YEARS TO PAY OFF A TV" (6 words).
- **Stakes and "you":** the stakes ("nineteen years") are spoken by 3.1 s. "You" is in line 7.
- **Captions:** 1–3 words, the spoken word in red, in the upper-middle band. They stay clear of the bottom 420 px and the right rail.
- **Pacing:** shots 0.6–1.56 s (median about 1.0 s). There are no flashes and no heavy blur. Impacts get a fov slam and a camera shake.
- **Length and loop:** 23.3 s, ending on the payoff, with no CTA.

## Known gaps
- S11: the INTEREST jar's coin fill reads a bit like a cake. The label and the coins on top carry it.
- S13: Spender pushes the block with his back three-quarters to the lens. The push reads; his face doesn't.
- Nobody has listened by ear. The PC render, mix and loudness are still to do.

## PC render (Reel creator, 2026-11-18): video.mp4 = v2
`video.mp4` sha256 `b4adbee95d242cea79d3ddc3f8055ed0fda88f1614895b8ca43832c81801c5ab`. It is 1080x1920, 30 fps, 699 frames (23.30 s), with SUB=4 motion blur, 22.0 MB.
The code it was rendered from is in this commit (`finance/render-pc/src/fin/v1/mintrap.tsx`, PC fixes on top of CODE_FINAL 469356f9).

**Audio:** `tools/story_mix.py` (toon3d `upbeat` bed from 0 s, ducked by sidechain, 34 SFX cues) then `tools/mux_voice.sh`. **-14.2 LUFS integrated, true peak -1.5 dBFS**, AAC 256k/48 kHz.
**Whisper (small) on the final mix:** every word of script.txt, in order. Numbers come out as digits ("19", "$5,000", "22%", "$8,000", "200", "3").
**Critic (`tools/critic.py`):** 0 FAIL.
- SYNC: 21/21 cuts exact (0 frames off).
- STATIC: longest near-still run 0 s.
- EDGES: captions 15.6 % from the side.
**Pacing / flicker:** frac_still 0.077; the flicker spikes sit on the impact frames (page burst, coin crash, block burst).

### Fixes made on the PC before the final render
1. **S16** (MAIN's item 1): his head and antennae sat over the red OWE block and the PAY BILL box (the depth was separate, but it read as clipping).
   - The lens moved to his right with a longer focal length (slam fov 38 → 31).
   - The +$8,100 EXTRA sign now shows in S15 only; on the S16 slam an antenna crossed its edge.
   - S16 is now his face against the dark wall, with the coin pile below.
2. **S14** (item 2): the wall calendar now lands on 19 by the end of "later" (tYears1 = "later" + 0.18 s; it was the end of S14, so it still read 13 on "later").
3. **S18** (item 3): it was a near-empty frame of flying cubes, and the wall calendar showed "19 STILL PAYING" on Saver's route.
   - Now a frontal wide holds Saver, his bursting block and the $200/MO tag.
   - The wall calendar reads "YEAR 3, $200 A MONTH" (green) through S17–S19.
4. **S13 clip found in the PC scrub:** Spender's hands went about 0.25 m INTO the OWE block. He stood at x -2.75 against the block face at -2.42, and the arms (1.55) plus the lean reach about 0.68 m.
   - P_PUSH moved to x -3.12, so the palms land on the face.
   - The clip gate missed this because it only modelled heads and torsos. `MINTRAP_QA` now adds a `Spender.hands` box in S13.
5. **S19:** the DONE: UNDER 3 YEARS stamp was half-hidden behind Saver's raised arm and the burst. It now sits clear, at his right at waist height (w 0.62); its QA box moved with it.

### Clipping checks (all on the final v2)
- **`node tools/story_qa.mjs`:** 699 frames x 4 sub-frames, **0 clips** (now including the S13 hands box).
- **6 fps scrub, every frame by eye** (`scrub_6fps_0-12s.jpg`, `scrub_6fps_12-23s.jpg`).
  - Feet: soles on the floor in every shot.
  - Pushing (S13): the palms are on the block's face.
  - Despair (S14–S16): he droops but doesn't sink.
  - Saver: on the floor.
- **Impact frames (hit + 2 frames), `scrub_impacts.jpg`:**
  - frames 9/11: the TV lands on the counter, on top of it;
  - 55/57: card swipe;
  - 81/83: page burst, pages away from Spender;
  - 127/129: rain pages in front of the face, not in it;
  - 173/175: $5,000 tag on the TV, above Spender;
  - 288/290: the "Wrong" coin split, coins clear of Spender;
  - 356/358/380: chip, then push (palms on the face);
  - 439/441 and 450/452: coin crash, coins land on the floor and pile, clear of Spender;
  - 502/504: Saver's $200 slam;
  - 519/521: burst, cubes go behind and to the sides, clear of Saver;
  - 538/545: DONE stamp, clear of Saver;
  - 610: "you" slam.
  - **No prop inside a head or body, and nothing below the floor.**

Not uploaded. It waits for MAIN QA and a BM GO.
