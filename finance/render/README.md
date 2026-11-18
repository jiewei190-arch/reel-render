# finance/render: the PC's Remotion project (source only)
This is a copy of `C:\Users\jiewe\blocky-render\` on the PC, without `node_modules/`, `build/`, `out/` or the voice files.
- **Engine:** `src/fin/core.tsx`.
  - Shots: `FinShot` = a lens per shot. `buildShots(plan, lens)`.
  - `FinFilm` is the composition body. `Act` is an actor.
  - Moods: store / whisper / ending / earth / home.
- **Props:** `src/fin/props.tsx`: coins, stacks, piles, plain bills, BigBlock, CashCase, FlipCalendar, Receipt, Stamp, TollBooth, ChartBoard, BigClock, Pedestal, Label, AO, Hall (interior), Ground (outdoor + long road).
- **HUD:** `src/fin/hud.tsx`: the holo Counter, CornerTag, and captions in script.txt casing (`casedChunks`).
- **Shorts:** `src/fin/penny.tsx` and `src/fin/rule72.tsx`. The helper's Shorts live in its own copy and get pushed separately.
- **Registering a Short:** add it in `src/Root.tsx` FIN as `[CompId, SPEC]`. Props go by id because Remotion serialises props to JSON.
- **Plans:** `src/shorts/<slug>.plan.gen.ts` (copied from finance/shorts/<slug>/src/plan.gen.ts). Scripts: `src/fin/scripts/*.ts`.

**Render:**
1. `npm ci`
2. `COMP=<Id> bash tools/stills.sh <tag> <frames…>` for stills.
3. `NAME=<x>_v bash render.sh <N> <Id>Sub` for the full render.
4. `bash tools/mux_voice.sh <muted.mp4> <voice.wav> <out.mp4>`: -14 LUFS, true peak -1.5.
5. Copy the Short's plan to `src/plan.gen.ts`, then run `python tools/critic.py <muted> <voiced>`.
