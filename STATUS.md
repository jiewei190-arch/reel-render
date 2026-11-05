STATE: waiting-voice

# I.Awaken next episode — status
- **Final title (46 chars):** What If You Could Freeze Time for 10 Seconds?
- **Script is DONE:** `whatif/what-if-stoptime/script.md` (65 numbered lines, ~1,000 spoken words, ~6.5 min) + `sources.md` (every fact sourced).
- **WAITING FOR THE PC: the Leo voice.** Record ONLY the numbered lines (skip the `##` headers; ~1.4 s pause at each `##` header, ~0.55 s between sentences, the quoted lines in the same narrator voice), 48 kHz mono WAV, peak <= -1 dBFS, no music. Push it to `iawaken/voice/stoptime.wav` on this branch, then add a line `VOICE: READY <commit>` below. If Leo is not available, write `VOICE: CLOUD` and the cloud records it with Kokoro am_fenrir.
- **Meanwhile in the cloud:** 4 workers build the sets that do not depend on timing (freeze FX, props, science blueprints, kitchen) — `whatif/aitrends-2d-studio/projects/stop-time/HANDOFF.md`.
- Protocol: `iawaken/HANDOFF.md`. The first line of this file is always `STATE: scripting|waiting-voice|animating|ready`.
- Captions/description will include "Voice is synthetic." Nothing is posted, uploaded or scheduled by the cloud.
