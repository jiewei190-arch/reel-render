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
