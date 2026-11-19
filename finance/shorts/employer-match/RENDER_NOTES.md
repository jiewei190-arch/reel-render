# employer-match (FORMAT v1, style S3 POV-YOU): cloud render notes

- **Final:** `video.mp4`, rendered in the cloud on CPU (the owner's PC is off), 2026-11-19.
  - 1080x1920, 30 fps, 716 frames (23.87 s).
  - Rendered with `npx remotion render EmployerMatchV1 --gl=swangle --concurrency=2` (771 s).
  - **SUB=1:** the plain composition, no motion blur. The `EmployerMatchV1Sub` (SUB=4) version would take about 4x longer on this CPU.
  - sha256 is in `video.sha256`.
- **Code:** `finance/render-pc/src/fin/v1/employer.tsx` (+ `v1/kit.tsx`), this commit.
- **Voice:** D2 Chatterbox, exaggeration 0.55, cfg 0.3. Seed 7.
  - Seed 11 scored higher (21.5 vs 20.5), but Whisper heard its first word "POV" as "Puff".
  - Line 1 was then re-voiced without the spoken "POV": in the music mix Whisper still heard "POV" as "Puff"/"Huh?". "POV:" stays in the on-screen hook text. The new line 1 (seed 7) is spliced at the line start, inside the 0.25 s gap (`takes/line1_seed7.*`).
- **Mix:** `tools/story_mix.py`: the toon3d `upbeat` bed from 0 s, ducked under the voice, plus 18 SFX. Then `tools/mux_voice.sh` with TPMAX=-1.5: **-14.2 LUFS, true peak -1.5 dBFS**, AAC 256k 48 kHz.
- **critic.py:** 0 FAIL.
  - SYNC: 20 cuts, max offset 0 frames. STATIC: 0.00 s. EDGES: 18.1 %.
  - SOUND says "voice only", but the SFX are inside the one premixed track.
- **flicker.py:** 15 spikes, all on intended motion:
  - the coins dropping onto the stack (5.7–6.2 s);
  - the S20 cut (11.8 s);
  - the envelope thud and burst (15.3–16.0 s);
  - the +$1,500 slam with fov slam and shake (17.0 s).
  I checked those frames by eye.
- **Whisper on the final mix:**
  - Full track: every word matches except the name "Spender" ("Spenda") and "Spender's" ("Spenders", the same sound).
  - The hook line alone (0–2.9 s): "Your boss just offered you $1,500 of free money." All words match.

## PRE-POST GATE (`frame0.jpg`, `strip_0-2s.jpg`)
- **Close shot, mid-action:** frame 0 is a close-up of the boss's face, more than 50 % of the frame, leaning in toward the lens (you).
- **Hook text:** "POV: YOUR BOSS / OFFERS YOU $1,500", 6 words on 2 lines, 92 px, top 250 px. Nothing is behind it: the MATCH board is hidden on the frame-0 and loop shots.
- **Stake by 0.5 s:** "$1,500" is in the hook text from frame 0.
- **First word:** 0.0 s. SFX at frame 0: whoosh and ding. The music starts at 0 s.
- **Emotion change:** joy, then sly at 0.62 s.
- **No dark, empty or wide frame in the first 1 s.**

## Cliffhanger
- **Open loop: 58 %** (13.8 s, "Then the first statements arrive..."). Two sealed STATEMENT envelopes thud down and tremble.
- **Twist: about 71 %** (17.0 s of 23.87 s, "plus 1,500 from your boss"). +$1,500 FROM BOSS slams in beside YOURS $3,000, then Spender's envelope opens to $0.
- **Ending:** "...some make you wait to keep it." It loops to the frame-0 close-up. No "part 2".

## Clipping
`node tools/story_qa.mjs EmployerMatchV1` checks 716 frames x 4 sub-frames: **0 clips**.
- Fixed along the way: Spender's torso and arms in his desk, and the boss's hand in your desk. Both moved back; Spender's desk moved forward.

## Known gaps
- S04: the falling coin passes very close to the lens (big and soft for 3 frames).
- S07: the jar's YOU label is large and reads like a card. S19 adds "YOU: $3,000".
- S14: the PLANS DIFFER sign overlaps the MATCH board behind it.
- S15: the caption sits on the sign's top line.
- Nobody has listened by ear.

---

## Earlier version (F2, superseded by v1)
STATE: rendered

# employer-match: render notes (PC, RTX 4060)
- **Final:** `video.mp4` = render **v2**, from render-pc @ 38339896 (= CODE_FINAL), with the voice muxed in.
  - 1080x1920, 30 fps; AAC 256k 48 kHz.
  - Measured **-14.2 LUFS / -1.5 dBFS**.
  - Voice only.
- **Why v2:** v1 was rendered from scene code before the cloud's round-3/4 fixes landed. v1 was superseded and must not be used.
- **Render:** render=126 s, SUB=4.
- **critic.py (v2):**
  - SYNC   19 cuts checked (0 after the end of this video skipped), max offset 0 frame(s)
  - STATIC longest near-still run 0 frames = 0.00 s (from frame 0)
  - EDGES  closest white caption pixel to a side edge: 15.2 % of the width
  - SOUND  1 audio stream(s): 1,aac,audio,30.464000 -> the voice only, 0 sound effects
  - 0 FAIL
- **flicker.py:** employer-match_v2.mp4: 914 frames, 0 spikes; stride pattern: None
- **Eye check:** I checked the shot sheet (`contact_sheet.png`), and every shot reads.
- **Known gap:** S18 ("24,500 for") is a weak frame, mostly wall with the limit calendar at the edge. The counter carries the $24,500 limit. Left as is.
