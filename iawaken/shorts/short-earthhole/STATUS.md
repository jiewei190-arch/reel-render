STATE: ready-for-gpu-render
# short-earthhole: "What If You Jumped Into a Hole Through the Earth?" (W1)

- Duration: **28.50 s** (voice 0.00-27.66 s, then "Would you jump?" holds to a hard cut at 28.50; fadeIn 0, fadeOut 0, no end card).
- Shots: **18** (1.05-2.48 s each), 1080x1920, 24 fps, style dusk (classic I.Awaken look), captions on (y 1330).
- Voice: Kokoro am_fenrir, speed 0.95, sentence gaps 0.3 s, section breaks 0 (patched local copy: `voice/fenrir_short.py`, input `voice/narration_numbered.md`). 70 words. Alignment: 83/86 tokens matched (97 %).
- Preview: `preview_short-earthhole.mp4` (540x960, full length, mixed): -14.5 LUFS integrated, -1.4 dBFS peak.
- QC: `contact_short-earthhole.png` (12 frames + last frame). Frame 0 shows the hero mid-jump over the hole (hook from frame 1), captions inside the frame, chips above the caption band, nothing important below y 1440 or right of x 900.
- Project: `whatif/aitrends-2d-studio/projects/short-earthhole/` (config, input/voiceover.wav, timeline/, story/shots.json, scenes/sets/earth.js + copied acting/faces/actors/creatures, scenes/shots/earthhole.js).

## Softened / attributed claims
- "about thirty-eight minutes": Klotz (2015) gets 38 min 11 s with a realistic Earth model (PREM); a uniform Earth gives 42 min. Narration says "about".
- "eight kilometers per second": rounded peak speed at the center (Klotz: ~8 km/s; uniform model 7.9 km/s).
- "about as hot as the surface of the Sun": core estimates range ~5,000-6,000 °C; chip says "~5,400 °C".
- "× 3,600,000 AIR PRESSURE" chip: ~360 GPa at the center (Britannica / Wikipedia), shown as an approximate multiple of sea-level air pressure.
- "Forever": only in the ideal case; narration says "With no air to stop you", the hook chip says "POLE TO POLE · NO AIR" (no Earth-rotation sideways push, walls survive the heat).

## GPU render commands (Creator session, PC). Run from `whatif/aitrends-2d-studio` with the kit PATH set (see SETUP_NOTES.md)
    git fetch origin iawaken/short-earthhole && git checkout iawaken/short-earthhole
    cd whatif/aitrends-2d-studio
    node render.mjs --project projects/short-earthhole --gl auto --workers 10
    python audio/mix.py --project projects/short-earthhole --video projects/short-earthhole/build/video_silent.mp4 --out projects/short-earthhole/out/short-earthhole.mp4
    # mix.py already loudness-normalises to -14 LUFS (loudnorm TP -1.5). Verify:
    ffmpeg -hide_banner -i projects/short-earthhole/out/short-earthhole.mp4 -af ebur128=peak=true -f null - 2>&1 | findstr /C:"I:" /C:"Peak:"
    # (Git Bash: | grep -E "I:|Peak:")  Target: I = -14 ±0.5 LUFS, true peak <= -1 dBFS. If off, re-normalise the audio only:
    ffmpeg -y -i projects/short-earthhole/out/short-earthhole.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k projects/short-earthhole/out/short-earthhole_ln.mp4

Expected: 684 frames, 1080x1920, 28.5 s. Cloud preview render at 0.5 scale took 1m41s on 4 CPUs.

## Cloud notes
- Linux cloud: the kit pins playwright 1.56 (chromium rev 1194) but the container ships chromium 1243; the local `node_modules/playwright(-core)` was symlinked to the global playwright 1.63 (node_modules is gitignored, nothing committed). Not needed on the PC.
- NOT posted, uploaded or scheduled. The full-resolution render was not done in the cloud.

## Fix 1 (main-session review: "wrong animals on the exit side")
The geography was already right: the hero jumps in at the NORTH Pole (s001) and pops out at the SOUTH Pole (s014-s016), where penguins live.
The entry sign used to read "SOUTH POLE ↓" (meaning "this way down to the South Pole"), which made it look like the entry was the South Pole.
Fixed the ambiguity instead of the animals: the entry sign now reads "NORTH POLE" (moved left, out of the right-side UI zone), and s014 gets a
"SOUTH POLE" chip at the top. Penguins stay on the south side only (none on the north side). No polar bears or Arctic foxes, since there are none in
Antarctica. Voice, captions and timing are unchanged. Preview and contact sheet re-rendered (-14.5 LUFS, -1.4 dBFS peak).
