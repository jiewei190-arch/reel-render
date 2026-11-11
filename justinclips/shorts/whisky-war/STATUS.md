STATE: ready

# Justin clips Short: whisky-war ("Canada and Denmark Fought a War With Whisky 🥃")
- **Final video:** `video.mp4`: 1080x1920, 24 fps, **1104 frames, 46.0 s** (audio 45.99 s), H.264 + AAC, **-14.5 LUFS, true peak -1.2 dBFS**, 24.6 MB (no split needed).
- `video.sha256`: `97ea1282c4648ae2a26c47d4c27c9a8026c0b9df8eff2c3cf28fe07615d3fa93  video.mp4` (`sha256sum -c video.sha256`).
- mix.py's own mux dropped 3 frames (1101), so `video.mp4` = the full silent render with the mixed audio stream copied in (`-c copy`).
- **Upload package:** `UPLOAD.md` (title, description + sources + "Voice is synthetic." + hashtags, pinned "Whisky or schnapps?", cover frame 1.6 s).
- **Script / sources:** `script.md` (human-readable), `voice_script.md` (exact TTS input), `sources.md` (LOC Law Blog + Canadian Geographic; CBC returned 403).
- **Preview checked:** `preview/whisky_war_preview_540x960.mp4` + `preview/contact_sheet.png` (Shorts UI zones in red): frame 1 = the face-off already moving (Line 1 at 0.1 s), twist at 3.3-6.1 s, a new visual every 1-3 s (21 shots), a reaction FX after every reveal, 4 insert cards (~50 YEARS, map, the 1984 note, DECADES), iris/whipBlur/flash transitions, captions 1-3 words at 66 % height (clear of the bottom title zone and the right-hand buttons), payoff "They split the island in two... and swapped bottles." at 40.7-44.1 s, closer "Subscribe for more." 1.1 s, last frame == frame 1 (loop). After the preview, captions were capped at 14 characters per chunk (was 16) to stay clear of the right-hand buttons; the full render includes this.
- **Voice:** Kokoro am_fenrir 0.95, gaps 0.3 / commas 0.15, 0.75 s beats before punchlines. Years spelled out in the TTS ("nineteen seventy-three", "nineteen eighty-four", "twenty twenty-two"), digits in captions; Whisper word timestamps confirm the years were read as years.
- **Look:** Toon 3D kit + BEANMEN FX: sunny Arctic sky + clouds + god rays, sea with ice floes and snowy cliffs, Hans Island rock, waving Canada/Denmark flags, whisky + schnapps bottles (shown, never drunk), original bean characters + the HERO cameo. Music: kit `upbeat` ducked under the voice; 52 kit sfx cues (beats + spoken words).
- **Project:** `whatif/aitrends-2d-studio/projects/whisky-war`. Re-render from `whatif/aitrends-2d-studio`: `node render.mjs --project projects/whisky-war --out projects/whisky-war/build/video_silent.mp4` (add `--gl gpu` on the PC), then `python audio/mix.py --project projects/whisky-war`, then mux as above.
- Rendered in the cloud (SwiftShader, 4 workers, 16m20s). Build frames are not committed.
- Nothing was posted, uploaded or logged into.
