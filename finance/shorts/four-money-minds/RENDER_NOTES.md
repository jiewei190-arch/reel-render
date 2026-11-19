# four-money-minds (S8 STACKED-LANES): render notes (cloud CPU)


## v2 (2026-11-19, MAIN's fixes) — CURRENT
- sha256 0b387864461838dc025ca000288e7085af27d4fd3c40eb9f8bd8385fac3b7ca9; 840 frames, 28.00 s video and audio, -14.2 LUFS, TP -1.5 dBFS.
  Rendered on CPU without SUB (as before), in 7 chunks; chunks 3-5 were re-rendered after the Debt Killer framing fix.
- Wide shots:
  - The lane pitch is 2.08 m (was 2.6) and the haters stand closer, so characters are about 1.6x bigger on screen.
  - At 0-1 s and the 11.75 s year flip, the 4 lanes fill y 200-1650.
  - The 1.0 s push frames lanes 0-2 at y 200-1380.
  - The scoreboard wide keeps the lanes at y 205-1370, so the bottom-centre captions never sit on the Debt Killer while the crown lands (about 1.3x bigger than v1 there).
- Scoreboard:
  - The score chips are about 1.3x bigger.
  - The haters lose and run off to the right at 21.15 s (they are back for the loop), so the big chips never cover them.
- Focus shots: the lane band is centred between the title band and the caption band. The last lane (Debt Killer) sits low, with the Investor's payoff above it, so there is no dead floor.
- The 1 YEAR LATER calendar flips DAY 1 -> DAY 365 at 12.1-12.3 s and holds DAY 365.
- Captions use the recipe Shorts' RecipeCaptions style: bold caps, outline, the spoken word in red, 1-2 words, centre y about 1411, from 1.0 s.
- The audio mix is unchanged from v1.
- QA: I looked at frame0.jpg and all three 6 fps scrubs. I found no overlaps or cropped HUD, and the counters stay inside their lanes. Lane props stay under the 1.9 m lane ceiling (hammer windup capped, shard and crown heights clamped).

## v1 (2026-11-19, superseded)
- sha256 d0108a2b721cf38788a485d3c8d442857aa06f6012dc39357abe9095ec1fa05d; 840 frames, 28.00 s video and audio, 1080x1920 30 fps h264.
  Audio: -14.2 LUFS integrated, TP -1.5 dBFS (AAC 256k 48 kHz).
- Rendered on the cloud machine's CPU (SwiftShader) because the PC renderer was offline. There is no motion blur: SUB=4 would have taken about 4.5 h at ~4.6 s/frame.
  It was rendered in 7 chunks of 120 frames with `--timeout=240000` (the first single-pass try died on Remotion's default 33 s frame timeout), then concatenated.
- The voice is untouched (voice.wav, Tyler, final; it is only gained in the mix). No ElevenLabs characters were used.

## How it is built
- This is a NEW hand-built composition, not a recipe, because recipes can't run 4 simultaneous lanes: `FourMoneyMinds` / `FourMoneyMindsSub` in
  `finance/render-pc/src/fin/s8/fourminds.tsx` (timeline, camera, HUD) + `src/fin/s8/props.tsx` (envelope, haters, jar, fund box, chart,
  debt board, shards and gold bricks, money hammer, crown, coupons). It is registered in the toolkit entry (`src/fin/recipe/root.tsx`).
  `tsc` passes and `src/index.toolkit.ts` bundles with every other recipe, so the shared bundle is not broken. I did not re-render another Short's still after the Blocky change.
- One 3D world: 4 stacked stages, dark, with a neon floor line per lane. The camera is a vertical "elevator" (per MAIN's brief update):
  - 0-1 s: wide;
  - 1.0 s: push-in, envelopes open;
  - 2.0 s: dive to SPENDER;
  - 6.0 s: SAVER;
  - 10.0 s: INVESTOR;
  - 11.75 s: wide for the 1 YEAR LATER calendar flip;
  - 13.2 s: back to INVESTOR (the chart and the dip);
  - 15.2 s: DEBT KILLER;
  - 21.1 s: wide scoreboard.
  Each move is a ~0.4 s ease, so it reads like a scroll.
- Cast: the existing Spender and Saver, plus 2 NEW original looks on the same rig: INVESTOR (blue, cap) and DEBT KILLER (orange, headband).
  `src/blocky/Blocky.tsx` gains optional `acc.cap` / `acc.headband` fields (additive; other looks are unchanged).
- Haters: faceless grey/white blocky figures with signs (JUST BUY IT, YOLO, BORING, YOU'LL MISS OUT, CASH IS TRASH, SELL NOW!, ...). They throw sale tags and coupons.
  The Debt Killer's gold wall (the shattered 22% card board) knocks them back, and one sign flips to OK FINE.
- Escalation:
  - Spender buys 4 things (counter 1000 -> 0), slumps on the boxes, and his lane goes dark.
  - Saver: the jar fills, and the counter ticks to $1,040 at the year flip.
  - Investor: the line chart has a scary dip with a red lane flash, then recovers to $1,070.
  - Debt Killer: 3 hammer hits, then a shatter with a heavy boom and a camera shake. The shards become a gold wall, the floor flares, a shockwave hits the haters, and the counter shows INTEREST AVOIDED +$220.
- End: scoreboard $0 / +$40 / +$70* / +$220. The crown and the BORING = WINNER banner land on "boring" (24.62 s, from the word timings, not 23.8 s).
  "WHICH ONE ARE YOU?" with a drawn arrow replaces the title at 26.2 s, and all 4 turn to the camera.
  27.3-28.0 s is a loop reset: props clear and new envelopes fall, landing exactly on frame 0.

## Audio
- Music: an ORIGINAL beat synthesized in numpy (`render-pc/tools/s8_music.py`, a copy is in music.wav):
  - 104 BPM, a 2-chord pad (Am / F), kick on the beat, hats on the offbeats, a clap on 2 and 4, and a sub bass. Nothing was downloaded.
- Mix (`render-pc/tools/s8_mix.py`, cues from `S8_CUES` via `tools/s8_cues.mjs`):
  - VO is normalised to -14 LUFS.
  - The beat is at -24 LUFS, ducked a further 5 dB under the VO, and lifted 4 dB in the no-VO middle.
  - 87 SFX cues come from the toon3d procedural library (`origin/iawaken/toon3d-fx`): impact + thud at 0.00, swooshes on every move and throw, cash on each Spender buy, coins into the jar, fail on the dip, glass + boom on the shatter, ding on the crown.
  - Final loudness: `tools/mux_voice.sh` with TPMAX -1.5.

## QA (checked by eye: frame0.jpg, strip_0-2s_6fps.jpg, scrub_6fps_*.jpg; I can't hear audio, only measure it)
- Hook: the envelopes hit on frame 0 (impact SFX + camera shake), the push-in is at 1.0 s, and the first elevator move is at 2.0 s.
- Frame 0: title only (4 words). Labels, counters and the disclaimer appear from 1.0 s and fade out again before the loop point.
- Counters and labels are projected from each lane and clamped inside it with a 16 px margin. They are kept below the title band (y >= 252) and above the caption band (y <= 1356); a lane that can't fit them hides them.
- Captions: bottom centre (centre y about 1436, nothing below 1480), 1-3 words, VO only. They start at 1.0 s per FORMAT_V1's clean-first-second rule.
- Fixed during build:
  - the year-flip card (mirrored text);
  - pale gold bricks;
  - the BORING = WINNER banner over the lane label;
  - scoreboard chips over the haters;
  - a counter colliding with a caption.
  0 clips were seen in the scrubs; the hammer hits from in front of the board.
- Dead lanes: in wide shots every lane moves (sign bobs, a coupon throw roughly every 2-2.5 s, idle actions). During a lane's focus the other lanes are mostly off screen.
  The Spender's lane is intentionally "dead" (dark, slumped) after 6 s, with a sigh and a coupon hitting him about every 2 s.

## Known deviations
- BRIEF puts lanes at y 260-1660 with captions below them. FORMAT_V1 forbids anything below y 1500, so the wide layout is lanes at y 250-1390 with captions at about 1436.
- The pre-post gate's "close shot >= 50 % at frame 0" conflicts with this format's wide 4-lane opener (BRIEF + MAIN update). The hook relies on the frame-0 impact and the 1.0 s push.
- In wide shots the hater signs are too small to read; they are readable during the lane focus shots.
