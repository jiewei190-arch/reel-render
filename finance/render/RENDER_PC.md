# Render the 5 finance Shorts on the PC (Creator)

Everything is in this folder: the blocky-shorts template engine, the finance cast (`src/library/characters.ts`), the
new props and sets (`src/fin/`), one staging per Short (`src/shorts/<slug>/stage.tsx`), the word-anchored plans
(`src/shorts/<slug>/plan.gen.ts`), and the voices (`public/vo/<slug>.wav`). Each Short has two compositions:
`<Comp>` (30 fps, sharp, for stills) and `<Comp>Sub` (4 sub-frames per frame, for motion blur; `render.sh` averages them).

| slug | composition | frames @30 | voice |
|---|---|---|---|
| penny-doubles | `PennyDoublesSub` | 857 | `public/vo/penny-doubles.wav` |
| rule-of-72 | `RuleOf72Sub` | 714 | `public/vo/rule-of-72.wav` |
| minimum-payment-trap | `MinimumPaymentTrapSub` | 800 | `public/vo/minimum-payment-trap.wav` |
| dollar-1970 | `Dollar1970Sub` | 736 | `public/vo/dollar-1970.wav` |
| ten-beats-thirty | `TenBeatsThirtySub` | 897 | `public/vo/ten-beats-thirty.wav` |

Needs: Node 18+, ffmpeg + ffprobe on PATH, Python 3 with numpy (Pillow for compare). Run in **Git Bash**.

## Once

```bash
cd finance/render
npm ci
npx --no-install tsc --noEmit          # 0 errors expected
bash tools/fin_checks.sh               # numeric framing/lens/facing/overlap/motion checks: "0 FAIL" expected
bash render.sh 1 BlockyTestSub 0-89    # 3 s smoke test of the engine on this GPU (out/renders/v1.mp4)
```

## Per Short (example: penny-doubles; replace the slug and the composition from the table)

```bash
cd finance/render
S=penny-doubles; C=PennyDoublesSub; N=1     # N = version number (render.sh never overwrites a version)

# 1) render (motion blur, GPU lock, contact sheet, flicker + pacing QA); full log kept, never piped through grep
NAME=${S}_v bash render.sh $N $C > out/renders/${S}_v${N}_render.txt 2>&1
#    -> out/renders/${S}_v${N}.mp4 (silent), ${S}_v${N}_contact_sheet.jpg, ${S}_v${N}_qa.txt

# 2) voice mux at -14 LUFS, true peak <= -1 dBTP (video stream copied)
bash tools/mux_voice.sh out/renders/${S}_v${N}.mp4 public/vo/$S.wav out/renders/${S}_v${N}_voiced.mp4

# 3) the critic loop: every shot on one sheet, then SYNC / STATIC / EDGES / SOUND
PLAN=src/shorts/$S/plan.gen.ts python tools/shot_sheet.py out/renders/${S}_v${N}.mp4 out/renders/${S}_v${N}_shots.jpg
PLAN=src/shorts/$S/plan.gen.ts python tools/critic.py out/renders/${S}_v${N}.mp4 out/renders/${S}_v${N}_voiced.mp4
```

All five in one go (sequential; the GPU lock keeps one render at a time):

```bash
cd finance/render
for pair in penny-doubles:PennyDoublesSub rule-of-72:RuleOf72Sub minimum-payment-trap:MinimumPaymentTrapSub \
            dollar-1970:Dollar1970Sub ten-beats-thirty:TenBeatsThirtySub; do
  S=${pair%%:*}; C=${pair#*:}; N=1
  NAME=${S}_v bash render.sh $N $C > out/renders/${S}_v${N}_render.txt 2>&1 || { echo "render failed: $S (see the _render.txt)"; continue; }
  bash tools/mux_voice.sh out/renders/${S}_v${N}.mp4 public/vo/$S.wav out/renders/${S}_v${N}_voiced.mp4
  PLAN=src/shorts/$S/plan.gen.ts python tools/shot_sheet.py out/renders/${S}_v${N}.mp4 out/renders/${S}_v${N}_shots.jpg
  PLAN=src/shorts/$S/plan.gen.ts python tools/critic.py out/renders/${S}_v${N}.mp4 out/renders/${S}_v${N}_voiced.mp4 | tee out/renders/${S}_v${N}_critic.txt
done
```

The upload file is `out/renders/<slug>_v<N>_voiced.mp4`. Titles, descriptions, pinned comments and hashtags are in
`finance/shorts/<slug>/UPLOAD.md`. Don't post or upload anything from here: the owner does that.

## What to look at
- `*_qa.txt`: flicker spikes (exit 3 = a broken tab; trace each spike on full frames), pacing (a cut every ~1.3 s).
- `*_critic.txt`: SYNC must show every cut within 1 frame of its word (the plan anchors cuts to words); STATIC < 2 s;
  EDGES: captions ≥ 6 % from the sides.
- The shot sheet: does every shot read muted? Each shot's intent is in `finance/shorts/<slug>/plan/SHOTS.md`.

## If something changes
- New voice: in `finance/shorts/<slug>/` run `vo/transcribe.py` and `plan/plan_src.py` (see `finance/tools/post_voice.sh`),
  then `bash finance/tools/sync_render.sh` to copy the plan and the voice in here. Lenses are fitted to the actors
  automatically (`fitLens`), so re-timed shots stay framed; re-run `bash tools/fin_checks.sh`.
- Stills for a look check: `SLUG=<slug> bash tools/fin_stills.sh <Comp> <new-tag> <frame> ...`
  (`GL=angle` on the PC; the cloud used `--gl=swangle` on CPU).

## Notes
- The on-screen counter is a 2D panel high in the frame (top ~9–22 %, clear of the caption band at 68 %). Captions use
  the script's casing, with one yellow accent word per sentence where the plan marks one.
- No brands, logos or real currency art: bills are plain green blocks labelled `$1`, and cards and statements carry
  plain text only.
