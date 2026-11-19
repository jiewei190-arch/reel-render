# coffee-could-be (FORMAT v1, style S2 RICH-VS-POOR, split screen): cloud render notes

- **Final:** `video.mp4`, rendered in the cloud on CPU (the owner's PC is off), 2026-11-19.
  - 1080x1920, 30 fps, 844 frames (28.13 s).
  - Split screen (`FinSpec.split`): two 1080x960 views of one world. Spender's cafe is on top, Saver's vault at the bottom.
  - Rendered with `npx remotion render CoffeeCouldBeV1 --gl=swangle --concurrency=2` (867 s).
  - **SUB=1:** the plain composition, no motion blur, because SUB=4 is about 4x slower on this CPU.
  - sha256 is in `video.sha256`.
- **Code:** `finance/render-pc/src/fin/v1/coffeesplit.tsx` (+ `v1/kit.tsx`), this commit.
- **Script:** rewritten for S2 (the old F2 story script was superseded).
- **Voice:** D2 Chatterbox, exaggeration 0.55, cfg 0.3. Seed 7, the top score at 28.10 s; seed 11 ran 29.9 s.
  - Chatterbox's per-line QA flagged "Saver" at a line start ("Savor", "Safer"). The full-file Whisper check passes: `vo/whisper_check.md`.
- **Mix:** the toon3d `upbeat` bed from 0 s, ducked under the voice, plus 20 SFX. Then `mux_voice.sh` with TPMAX=-1.5: **-14.1 LUFS, true peak -1.5 dBFS**.
  - The frame-0 whoosh, coin and pop are turned down, because they masked "five" in the hook line ("same hot dollars").
- **critic.py:** 0 FAIL.
  - SYNC: 21 cuts, max offset 0 frames. STATIC: 0.00 s. EDGES: 17.0 %.
  - SOUND says "voice only", but the SFX are inside the one premixed track.
- **flicker.py:** 3 spikes: the coin into the jar (3.0 s), the cloth flying off and the pile erupting (19.4 s), and the $186,000 slam (20.3 s). All are intended.
- **Whisper on the final mix:**
  - Full track: every word matches.
  - The hook line alone (0–3.3 s): "Same $5 a day, spender buys a coffee, saver saves it." All words match.

## PRE-POST GATE (`frame0.jpg`, `strip_0-2s.jpg`)
- **Close shot, mid-action:** both halves are close at frame 0.
  - Top: Spender's face, mid-sip.
  - Bottom: Saver's face and hand, with the $5 coin in mid-air over the jar.
- **Hook text:** "$5 COFFEE OR / $186,000?", 4 words on 2 lines, 92 px, top 70 px. Nothing is behind it at frame 0: the SPENDER SPENT board is hidden on the frame-0 and loop shots.
- **Stake by 0.5 s:** "$5" and "$186,000" are in the hook from frame 0.
- **First word:** 0.0 s. SFX at frame 0. The music starts at 0 s.
- **Emotion change:** Spender goes joy to love (hearts) at 0.7 s; Saver goes happy to joy.
- **No dark, empty or wide frame in the first 1 s.**

## Cliffhanger
- **Open loop: 44 %** (12.5 s, "But wait till you see year thirty..."). A YEAR 30 board under a purple cloth trembles. It stays covered through "Ten years: about 26,000" and "That's it?".
- **Twist: 72 %** (20.3 s of 28.1 s). The cloth flies off, the coin pile erupts, and the board slams ≈ $186,000.
- **Payoff:** "He only put in 54,750. Time did the rest." It's exactly what the board teased.
- **Ending:** "So what's your five dollars doing?" It loops to frame 0, "Same five dollars a day."
- **Two racing counters:** SPENDER SPENT ($1,825 a year) vs SAVER (a made-up 7 %), shown as in-world boards counting up with the years.

## Clipping
`node tools/story_qa.mjs CoffeeCouldBeV1` checks 844 frames x 4 sub-frames, both halves in one world: **0 clips**.
- Fixed along the way: Saver's hand in the jar. The jar moved and got shorter.

## Known gaps
- S02 and S19: the hook text stays up until 3.5 s. The SPENDER SPENT board shows faintly behind it on the S02 lens (not at frame 0).
- S09: the twist's bottom half is a wide; the board reads small until the S10 slam.
- S12: the spinning clock sits close in front of Saver's head.
- Spender's cup in his hand is barely visible at frame 0. The sip reads from his pose and face.
- Nobody has listened by ear.

---

## Earlier version (F2, superseded by v1)
STATE: rendered

# coffee-could-be: render notes (PC, RTX 4060)
- **Final:** `video.mp4` = render **v2**, from render-pc @ 38339896 (= CODE_FINAL), with the voice muxed in.
  - 1080x1920, 30 fps, h264 crf 16; AAC 256k 48 kHz.
  - Measured I / true peak: **-14.2 LUFS / -1.5 dBFS**.
  - Voice only.
- **Versions:**
  - **v1** (render=125 s): the cloud code as delivered.
  - **v2** (render=125 s): with the PC lens fix below.
- **critic.py (v2):**
  - SYNC   19 cuts checked (0 after the end of this video skipped), max offset 0 frame(s)
  - STATIC longest near-still run 0 frames = 0.00 s (from frame 0)
  - EDGES  closest white caption pixel to a side edge: 10.7 % of the width
  - SOUND  1 audio stream(s): 1,aac,audio,30.503917 -> the voice only, 0 sound effects
  - 0 FAIL
- **flicker.py:** coffee-could-be_v2.mp4: 917 frames, 33 spikes; stride pattern: None
- **PC fix (v1 → v2):** in S04, the lens sat beside Spender's shoulder, so half the frame was his red bag and body. The lens yaw went from 8 to -25: the cup now reads with the Teller behind it.
- **Flicker spikes (33):** they all sit in two intended fast-motion beats: the S06 calendar riffle (frames 224–256) and the S15 spinning clock hands (frames 663–705). There's no tab stride.
