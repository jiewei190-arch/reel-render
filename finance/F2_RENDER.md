# F2: render on the PC

Everything is built: the 5 F2 compositions are in `finance/render-pc/src/fin/` on top of the shared engine
(`core.tsx`, `props.tsx`, `hud.tsx`) and are registered in `src/Root.tsx`. The PC only has to run the final GPU render.

| slug | composition (sharp / motion blur) | source | frames @30 | voice |
|---|---|---|---|---|
| coffee-could-be | `CoffeeCouldBe` / `CoffeeCouldBeSub` | `src/fin/coffee.tsx` | 917 | `finance/shorts/coffee-could-be/voice.wav` |
| same-car-more | `SameCarMore` / `SameCarMoreSub` | `src/fin/samecar.tsx` | 917 | `finance/shorts/same-car-more/voice.wav` |
| surprise-bill | `SurpriseBill` / `SurpriseBillSub` | `src/fin/surprise.tsx` | 849 | `finance/shorts/surprise-bill/voice.wav` |
| employer-match | `EmployerMatch` / `EmployerMatchSub` | `src/fin/match.tsx` | 914 | `finance/shorts/employer-match/voice.wav` |
| prices-double | `PricesDouble` / `PricesDoubleSub` | `src/fin/doubling.tsx` | 772 | `finance/shorts/prices-double/voice.wav` |

Shared F2 helpers live in `src/fin/f2kit.tsx`:
- numeric lens fitting, so every lens frames its subjects below the counter until the end of its push-in;
- new props: the car, smoke, the cup, the payslip sheet and the coffee bar.

Plans are in `src/shorts/<slug_>.plan.gen.ts` and scripts in `src/fin/scripts/<slug_>.ts`. Both are copied from
`finance/shorts/<slug>/` by `finance/tools/sync_render_pc.sh`. Cloud stills sheets are in
`finance/shorts/<slug>/stills_sheet.png`.

## Commands (Git Bash, from the repo root)

Once:
```bash
cd finance/render-pc
npm ci
npx --no-install tsc --noEmit            # 0 errors
```

Per Short (this example is coffee-could-be; change `S` and `C` from the table):
```bash
cd finance/render-pc
S=coffee-could-be; C=CoffeeCouldBe; N=1
NAME=${S}_v bash render.sh $N ${C}Sub > out/renders/${S}_v${N}_render.txt 2>&1
bash tools/mux_voice.sh out/renders/${S}_v${N}.mp4 ../shorts/$S/voice.wav out/renders/${S}_v${N}_voiced.mp4
cp src/shorts/${S//-/_}.plan.gen.ts src/plan.gen.ts       # critic.py / shot_sheet.py read src/plan.gen.ts
python tools/shot_sheet.py out/renders/${S}_v${N}.mp4 out/renders/${S}_v${N}_shots.jpg
python tools/critic.py out/renders/${S}_v${N}.mp4 out/renders/${S}_v${N}_voiced.mp4
```

All five in a row:
```bash
cd finance/render-pc
for pair in coffee-could-be:CoffeeCouldBe same-car-more:SameCarMore surprise-bill:SurpriseBill \
            employer-match:EmployerMatch prices-double:PricesDouble; do
  S=${pair%%:*}; C=${pair#*:}; N=1
  NAME=${S}_v bash render.sh $N ${C}Sub > out/renders/${S}_v${N}_render.txt 2>&1 || { echo "render failed: $S"; continue; }
  bash tools/mux_voice.sh out/renders/${S}_v${N}.mp4 ../shorts/$S/voice.wav out/renders/${S}_v${N}_voiced.mp4
  cp src/shorts/${S//-/_}.plan.gen.ts src/plan.gen.ts
  python tools/shot_sheet.py out/renders/${S}_v${N}.mp4 out/renders/${S}_v${N}_shots.jpg
  python tools/critic.py out/renders/${S}_v${N}.mp4 out/renders/${S}_v${N}_voiced.mp4 | tee out/renders/${S}_v${N}_critic.txt
done
```

Upload text is in `finance/shorts/<slug>/UPLOAD.md` (title and description only). Nothing gets posted from here.

## Stills (look check)
On the PC: `COMP=<Id> bash tools/stills.sh <tag> <frames…>` (GPU, `--gl=angle`).
In the cloud: `bash tools/cloud_stills.sh <Id> <slug> <tag> [frames…]` (CPU `--gl=swangle`, about 60 s a still). This writes
the labelled sheet.
