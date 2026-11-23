# FORMAT v1 rebuild: render on the PC

The story Shorts live in `finance/render-pc/src/fin/v1/`:
- `kit.tsx`: shared pieces on top of `hooks.tsx` v1: the hook text, the 1–3 word red-word captions, Squash, Debris, burst, jar, block, the pay box, and the QA boxes.
- `<short>.tsx`: one file per Short.
- `index.ts`: registers each Short. Compositions are `<Id>` and `<Id>Sub`.

Each Short exports its own audio plan: the toon3d music bed from 0 s, ducked under the voice, plus SFX cues.
Before rendering, wait for a Short's `finance/shorts/<slug>/CODE_FINAL` and check out that sha.

| slug | composition | frames @30 | voice | music |
|---|---|---|---|---|
| minimum-payment-trap | `MinimumPaymentTrapV1` / `MinimumPaymentTrapV1Sub` | 699 | `finance/shorts/minimum-payment-trap/voice.wav` | toon3d `upbeat` |

## Commands (Git Bash, from the repo root)
```bash
cd finance/render-pc
git checkout <sha from CODE_FINAL>          # the frozen scene
npm ci && npx --no-install tsc --noEmit     # 0 errors
node tools/story_qa.mjs                     # clip gate: 0 clip(s) (props vs heads and bodies, nothing below the floor)
S=minimum-payment-trap; C=MinimumPaymentTrapV1; N=1
AUD=<path to the toon3d audio dir with music/ and sfx/>   # origin/iawaken/toon3d-fx: whatif/aitrends-2d-studio/kits/toon3d/audio
NAME=${S}_v bash render.sh $N ${C}Sub > out/renders/${S}_v${N}_render.txt 2>&1
python tools/story_mix.py $C ../shorts/$S/voice.wav "$AUD" out/renders/${S}_v${N}_premix.wav
bash tools/mux_voice.sh out/renders/${S}_v${N}.mp4 out/renders/${S}_v${N}_premix.wav out/renders/${S}_v${N}_final.mp4
cp src/shorts/${S//-/_}.plan.gen.ts src/plan.gen.ts && python tools/shot_sheet.py out/renders/${S}_v${N}.mp4 out/renders/${S}_v${N}_shots.jpg
```
Then write `finance/shorts/$S/RENDER_NOTES.md`: the loudness, critic and flicker results, and an eye check of every shot for
feet below the floor or props through faces.
