STATE: ready

# Toon 3D FX pack: BEANMEN effects ported into the Toon 3D kit
Branch `iawaken/toon3d-fx`. Toon 3D stays the look (3D beans); the effects come from the owner's BEANMEN ANIMATION project,
reimplemented in the kit's engine (no Remotion). No finished Short was re-rendered or changed.

## Deliverables
- **Demo clip:** `demo/fx_demo.mp4`: 1080x1920, 24 fps, 399 frames, 16.6 s, H.264 + AAC, **-14.2 LUFS, true peak -1.4 dBFS**, 11M.
  `demo/fx_demo.sha256`: `650bb9a2092e460bd4a3dee8056c75f1debb679cd4fc9e529062d9a857a9849b  fx_demo.mp4`.
  Contents: sunny sky + clouds + god rays (wide flock) -> **whipBlur** -> the emu general "???" then hearts + heart eyes + sparkle ->
  **iris** -> truck chase (gunner sweat + "!") -> **flash** -> full-screen **"EMU TOP SPEED / 50 KM/H / flat out"** card over the blurred chase ->
  **iris (open)** -> scoreboard: sparkle + stars on "one", "!" + camera shake + flash + sweat on "zero" -> dissolve -> **FINAL SCORE versus card**.
  Audio: upbeat bed (kit music) ducked under the voice, 19 kit sfx cues (several timed to spoken words). Narration = 3 lines sliced from the
  emu-war voiceover (no new TTS). Captions: Toon 3D style.
- **Demo sheet:** `demo/fx_sheet.png`: 15 reaction FX, 9 insert cards, 7 transition frames, old vs new lighting.
- **Kit code:** `react.js`, `insert.js`, `transitions.js`, `sky.js`, `LIGHT.sunny` (toon.js), emu `root.head/eyes` (animals.js),
  `audio/sfx` (54) + `audio/music` (6) as `toon3d:<name>`; usage in README.md "BEANMEN effects".
- **Engine (backwards compatible):** `engine/player.js` kit-transition hook; `audio/mix.py` `toon3d:` names + `"word"` cues.
  Checked: emu-war stills at 1.0/9.0/18.5/31.0 s are pixel-identical before and after these changes.

## Notes for MAIN
- mix.py's single-pass loudnorm left this short clip at -15.8 LUFS; the final master got +2.0 dB through a limiter (ceiling 0.83) to
  -14.2 LUFS / TP -1.4. Longer Shorts land at ~-14.6 as before. Video = full silent render + mixed audio (no -shortest frame loss).
- Rendered in the cloud (SwiftShader, 4 workers, 6m02s). Build frames deleted.
- BEANMEN `references/` videos were not used or copied. Nothing was posted, uploaded or logged into.
