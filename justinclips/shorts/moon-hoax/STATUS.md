STATE: ready

# Justin clips Short: moon-hoax ("A Newspaper Said Bat-People Lived on the Moon 🦇")
- **Final video:** `video.mp4`: 1080x1920, 24 fps, **1106 frames, 46.08 s** (audio 46.07 s), H.264 + AAC, **-14.6 LUFS, true peak -1.1 dBFS**, 24.6 MB (no split needed).
- `video.sha256`: `2ba32076f816f6dd59b8dfd35998d0347be3d10e8a343c6f96299a5121f2cfa1  video.mp4` (`sha256sum -c video.sha256`).
- `video.mp4` = the full silent render with mix.py's audio stream copied in (`-c copy`); no frames were trimmed.
- **Upload package:** `UPLOAD.md` (title, description + sources + "Voice is synthetic." + hashtags, pinned "Would you have believed it: yes or no?", cover frame 0.1 s).
- **Script / sources:** `script.md` (human-readable), `voice_script.md` (exact TTS input), `sources.md` (Linda Hall Library + Museum of Hoaxes; LOC Folklife as background). "According to one account" for the 60,000 pamphlets; the script never claims "everyone believed it" (topic-bank tone guard).
- **Preview checked:** `preview/moon_hoax_preview_540x960.mp4` + `preview/contact_sheet.png` (Shorts UI zones in red): frame 1 = a bat-person already flapping over the Moon with the Earth in the sky (Line 1 at 0.2 s), twist "And people bought it." at 3.3 s, a new visual every 1-3.5 s (20 shots), a reaction FX after every reveal, the bison/unicorn/beaver/bat-people beats shown through a telescope-lens mask, 1 counter card (60,000) + a NEVER ADMITTED stamp, iris/whipBlur/flash transitions, captions 1-3 words at 66 % height, payoff "It never admitted it was fake." at 42.7-44.1 s, closer "Subscribe for more." 1.0 s, last frame == frame 1 (loop). After the preview: wider camera on the astronomer at the eyepiece (m06), and hearts instead of "zzz" while he stargazes at the Cape (m14). The full render includes both.
- **Voice:** Kokoro am_fenrir 0.95, gaps 0.3 / commas 0.15, 0.75 s beats before punchlines. "eighteen thirty-five" and "sixty thousand" spelled out in the TTS, digits in captions; Whisper confirms both.
- **Look:** Toon 3D kit + BEANMEN FX. Moonlit "hoax Moon" (stars, Earth, craters, odd trees) instead of the sunny preset (night story), a sunny 1835 New York street, a candle-lit writer's desk. Original bean characters + the HERO cameo. Music: kit `mystery` ducked under the voice; 52 kit sfx cues.
- **Project:** `whatif/aitrends-2d-studio/projects/moon-hoax`. Re-render from `whatif/aitrends-2d-studio`: `node render.mjs --project projects/moon-hoax --out projects/moon-hoax/build/video_silent.mp4` (add `--gl gpu` on the PC), then `python audio/mix.py --project projects/moon-hoax`, then mux as above.
- Rendered in the cloud (SwiftShader, 4 workers, 14m06s). Build frames are not committed.
- Nothing was posted, uploaded or logged into.
