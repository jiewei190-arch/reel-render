# thousand-four-ways (S8b, stacked lanes): render notes (cloud CPU)

## v1 (2026-11-19): CURRENT
- sha256 2798a10628f01ee35e7d6a63c0f79ab6cd619dff874f8362db8d32f13cb871b2; 849 frames, 28.30 s video and 28.30 s audio, 1080x1920 30 fps h264. Audio: -14.2 LUFS integrated, TP -1.8 dBFS (AAC 256k 48 kHz).
- Rendered on the cloud machine's CPU (SwiftShader, `--gl=swangle`) because the PC renderer was offline. There is no motion blur (no SUB).
  It was rendered in 7 chunks of 122 frames with `--timeout=240000` and `--crf=16` (about 8.7 min per chunk), then joined with ffmpeg concat (stream copy).
  Chunks 4-5 (frames 488-731) were re-rendered after the payoff-framing fix.
  The mux used `LIMIT=0.72 TPMAX=-1.5 tools/mux_voice.sh`, because the default limiter left the true peak at -0.8 dBFS.
- The voice is untouched: voice.wav (Christopher, 28.3 s, final) is only gained in the mix. No ElevenLabs characters were used.

## How it is built (reusing the four-money-minds engine)
- The new composition is `ThousandFourWays` / `ThousandFourWaysSub` in `finance/render-pc/src/fin/s8/thousand.tsx`, registered in `src/fin/recipe/root.tsx`.
  It imports the engine from `fourminds.tsx` instead of copying it: the world layout (`P`, `laneY`, `FRONT`...), the `NEON` mood, the easing helpers, `project`, the HUD style (`FONT`, `STROKE`, `usd`), and the cast looks.
  It also uses the props from `props.tsx`: haters, coupons, envelopes, the box, the line chart, gold bricks and bills.
- The parameterisation is additive, and every default is unchanged:
  - `makeCamAt(moves, shakes, start)`: the elevator camera factory. FourMoneyMinds' `camAt` is now `makeCamAt(MOVES, SHAKES, W0)`.
  - `FundBox` takes optional `label` and `cols`, used here for the green BANK / SAVINGS box.
  - `LineChart` takes an optional `redDrops`, which turns falling segments red.
  - `Hater` signs can wrap onto 2 lines with `\n` ("BANKS ARE / SCAMS").
  - `tools/s8_cues.mjs` takes the module and export names. `tools/s8_mix.py` passes extra args through and reads the VO segments from the module.
  - `tools/s8_music.py` takes an optional variant.
- **FourMoneyMinds still renders identically.** I rendered frames 0, 300, 560 and 700 before and after the change: there are 0 differing pixels.
  The default `s8_music.py` output is byte-identical (cmp), and so is the default `s8_cues.mjs` JSON.
- Story: each lane replays Oct 2016 -> Oct 2026 in its own focus shot. The year ticker under the title (a 2016 to 2026 track, with the year pill in the lane's colour) follows the focused lane.
  - 0-1 s: wide. Envelopes land on frame 0 (the loop point), title only.
  - 1.0 s: push-in, envelopes open, cash into hands.
  - 2.0 s: MATTRESS (Spender): stuffs the cash under the mattress and sits on it. The counter stays $1,000 while "BUYS: $1,000 -> $X" ticks down to $716. The bills under the mattress shrink, and the lane dims from 5.0 s. Haters: SAFE!, BANKS ARE SCAMS, CASH IS KING.
  - 5.4 s: SAVINGS (Saver): tosses the cash into a green BANK / SAVINGS box. Tiny coin drips, $1,000 -> $1,021, then "+$21 IN 10 YEARS". Haters: BORING, 0.06%?!, SNOOZE.
  - 8.6 s: GOLD (the Debt Killer rig recoloured gold, with the headband): the cash becomes 3 gold bars, and bars drop onto the stack (floor(value / $300)) up to 11 at the $3,349 peak.
    At 12.2 s the lane flashes red, two bars tumble off, and the counter drops to $2,918 with "PEAK $3,349 / -$431 FROM PEAK". The haters jump with SELL NOW!. Haters: IT'S A ROCK, SELL NOW!, BUBBLE!.
  - 13.5 s: S&P 500 (Investor): a line chart draws 2016 -> 2026. The 2020 crash and the 2022 drop draw red, with a red lane flash, a camera shake, the counter label "2020 CRASH" / "2022 DROP", the investor in shock and the haters jumping.
    Then it climbs to $4,166. The payoff (18.7 s): floor flare, gold confetti, a shockwave that knocks the 4 haters back, and the GAMBLING sign flips to OK FINE.
  - 20.15 s: the wide scoreboard. The haters run off, and the chips pop at 20.75 s + 0.3 s each: MATTRESS $1,000 (BUYS $716), SAVINGS $1,021, GOLD $2,918, S&P 500 $4,166* (*DIVIDENDS REINVESTED).
    The mattress chip pulses on "mattress", and the footnote lights up on "Past results aren't a promise".
  - 26.55 s ("Which"): "WHICH ONE WOULD YOU PICK?" with a drawn arrow, and all 4 turn to the camera.
  - 27.85-28.3 s: loop reset. The props clear and new envelopes fall, landing on frame 0.
- On-screen footnote, from 1.0 s: "HISTORICAL, OCT 2016-OCT 2026. PAST ≠ FUTURE. NOT ADVICE." It sits under the title. During the end question it moves to just under the captions (y about 1462-1495), so the arrow has room.
- There are no ticker symbols, fund names or logos on screen. "S&P 500" is the index name, as in the BRIEF.

## Data honesty
- The labelled numbers all come from sources.md:
  - $4,166 (S&P 500, dividends reinvested), $2,918 (gold) and the ~$3,349 gold peak;
  - $1,021 (savings);
  - $1,000 that buys what $716 did (CPI).
- The in-between points that animate the counters and the chart are my approximate yearly or monthly anchors. They are not in sources.md:
  - Gold: 997, 958, 1162, 1457, 1359, 1246, 1503, 2080, ~3000 (Oct 2017-2025), then the peak in about Aug 2026.
  - S&P 500 (dividends reinvested): about 1675 (Jan 2020) -> 1350 (Mar 2020, about -19%) and 2530 (Dec 2021) -> 1920 (Sep 2022, about -24%), with yearly anchors 1285 ... 3740.
  - Buying power per year from CPI-U, Oct to Oct.
  - Savings: a near-flat path, then faster after 2022.

  No percentage for the drops is printed on screen, only "2020 CRASH" / "2022 DROP" and the dollar counter, so the anchors only shape the motion. They should be checked against the real monthly series before anyone quotes them.

## Audio
- Music: an ORIGINAL beat from `tools/s8_music.py music.wav 28.3 b` (a copy is in music.wav), synthesised in numpy with nothing downloaded.
  The "b" variant is 98 BPM, a 4-chord loop Dm / Bb / F / C, seed 2016, with the same kick / hat / clap / sub-bass kit as S8.
- Mix: `tools/s8_mix.py voice.wav music.wav <toon3d sfx> premix.wav ./src/fin/s8/thousand S8B_CUES S8B_DURATION S8B_VO_SEGS`.
  - VO is normalised to -14 LUFS.
  - The beat is at -24 LUFS, ducked a further 5 dB under the VO (0-4.3 s and 20.4-27.9 s) and lifted 4 dB in the no-VO middle.
  - 98 SFX cues come from the toon3d procedural library (`origin/iawaken/toon3d-fx`): impact + thud on frame 0, swooshes on moves and throws, paper + thud for the mattress, ticks as the buying power falls, coin drips, metal clinks per gold bar, drops when the bars fall off, fail on each crash, a riser into the payoff, then success + sparkle + boom, pops on the chips.
- Final loudness: `tools/mux_voice.sh` with TPMAX -1.5.

## QA (by eye: frame0.jpg and the 6 fps scrubs scrub_6fps_*.jpg; I can't hear audio, only measure it)
- Frame 0: title only, 4 wide lanes, and the envelopes landing (impact + shake). The ticker, footnote, labels and counters fade in at 1.0 s and out again before the loop point.
- I looked at frame0.jpg and all 3 scrubs, plus full-size frames at 4.8, 19.1 and 27.0 s and a 6 fps strip of the payoff.
  There are no overlaps or cropped text. Counters and chips stay inside their lanes, below the title band (y >= 252) and above the caption band while captions show.
  The footnote never collides with a caption: it sits at y 192, and at y 1462-1495 during the end question.
- Dead lanes: every lane moves in the wide shots (sign bobs, a tag throw about every 2-3 s). The mattress lane is intentionally dimmed after its run, but still visible.
  The S&P focus is framed low, with the gold lane above it, so there is no dead floor.
- Honest drops: the gold lane flashes red at the peak -> $2,918 drop and two bars tumble off the stack ("PEAK $3,349 / -$431 FROM PEAK" stays on its counter).
  The S&P chart draws the 2020 crash and the 2022 drop as red segments, with red lane flashes and "2020 CRASH" / "2022 DROP" labels.
- Fixed after the first look and after the full-render review:
  - Gold and S&P focus framing cropped the characters, so I moved the camera.
  - The ticker showed 2025 at the Aug 2026 gold peak; it now shows the calendar year.
  - "-$0 FROM PEAK" flashed on the first drop frame.
  - The payoff camera pushed the knocked-back haters (and the OK FINE flip) off the right edge. It is now a wider, lower pull-back, and chunks 4-5 were re-rendered.
  - The confetti faded to dark specks; it is now opaque gold that shrinks away.
- The haters run off at the scoreboard (20.55 s) and are back for the loop. Every character turns to the camera at "Which" (26.55 s).

## Known deviations
- As in four-money-minds, the opener is a wide 4-lane shot (no close shot at frame 0). The hook is the frame-0 envelope impact and the 1.0 s push.
- Each lane replays the 10 years in its own focus shot rather than all 4 lanes running at once, so the year ticker restarts at 2016 for each lane.
- In wide shots the hater signs are too small to read. They are readable in the focus shots.
