# Hook prototypes A/B/C: PC render notes

Each `<H>/opening.mp4`: 1080x1920, 30 fps, 150 frames (5.00 s), SUB=4 motion blur, AAC 256k 48 kHz.
The code is in `finance/render-pc`: `src/fin/hooks.tsx` (compositions HookA/B/C plus Sub), word times in
`src/shorts/hooks.timings.gen.ts` (from `<H>/vo/timings.json` via `tools/hook_timings.py`), and audio via
`tools/hook_mix.py` then `tools/mux_voice.sh`.

| hook | loudness | true peak | music bed | SFX | near-still frames | Whisper on the final mix |
|---|---|---|---|---|---|---|
| A "TV" | -14.1 LUFS | -1.6 dBFS | toon3d:upbeat | 15 | 5.3 % | Spender just bought a TV. He'll be paying for it for 19 years. |
| B "burn" | -14.2 LUFS | -1.7 dBFS | toon3d:upbeat | 16 | 6.7 % | This guy is about to pay $8,000 for nothing. |
| C "warning" | -14.1 LUFS | -1.7 dBFS | toon3d:tense | 14 | 5.3 % | Never pay the minimum watch what happens |

Style rules applied:
- Frame 0 is action: A, the TV is mid-fall; B, a cash brick is mid-air into the INTEREST furnace; C, Saver is mid-sprint.
- No HUD or counter. Captions are 2–4 word pop-ins, and the last one clears 0.6 s after the line ends.
- Every shot moves:
  - slam zooms (fov punch plus shake) on the hook word;
  - whips into each cut;
  - lenses keep creeping and rolling after each slam.
- Audio:
  - the toon3d bed (procedural, licence-clean per AUDIO.md) ducks under the voice by sidechain;
  - every cut gets an SFX (whoosh), and the hook word gets an impact hit;
  - A: impact, thud, card slide, beep, cash ding, boom and paper.
  - B: thuds, fire, coins, cash, a record scratch into "for nothing", then impact and fail.
  - C: punch, record scratch into the slow-mo, impact on "Watch", a riser, then drop, fail and gasp.

The voices are 3.1–4.3 s, so each opening runs a 5.0 s minimum and the action carries on after the line. In C, the card
lands at Spender's feet after "happens" and he grabs his head.
Contact sheets: `<H>/contact_sheet.jpg` (6 fps, 0–5 s).
