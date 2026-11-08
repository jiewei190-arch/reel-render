STATE: ready-for-gpu-render

# I.Awaken Short: short-blackhole — "What If You Fell Into a Black Hole?"

- Branch: `iawaken/short-blackhole` (cut from `iawaken/next-episode` @ 798ff38). Worker W4.
- Duration: **24.318 s** (voice ends 23.70 s, 0.6 s hold, hard cut). 9:16, 1080x1920, 24 fps, captions on (y 1330), `fadeIn: 0`, `fadeOut: 0`.
- Shots: **14** (s001-s014, 1.08-2.61 s each), all in `scenes/shots/BH_shots.js`; new set `scenes/sets/space.js`.
- Voice: Kokoro am_fenrir, speed 0.95, sentence gaps 0.30 s / comma gaps 0.15 s / no section breaks (local patched copy of fenrir.py, the shared file is untouched). 70 words. faster-whisper (small) alignment 70/70 = 100 %. 'Scientists' re-timed by hand from the RMS envelope (12.94-13.36; whisper gave it zero length).
- Structure: HOOK 0-2.0 s (title question as line 1, hero already tumbling toward the hole on frame 0, title lock-up visible from frame 0) -> BUILD-UP 2.0-15.4 s (nothing / feet vs head / it gets worse / small hole spaghetti / "spaghettification") -> PAYOFF 15.4-22.8 s (giant one, 4,300,000 suns, cross the event horizon without noticing) -> closer "Which one would you pick?" + hard cut.
- Preview: `preview_short-blackhole.mp4` 540x960, full length, mixed: -14.1 LUFS integrated, true peak -1.2 dBFS.
- QC: `contact_short-blackhole.png` (12 frames + last frame). Frame 0 not blank, hook visible from frame 0, captions inside the band and not clipped, faces/key action above y 1270 and left of x 900, chips <= 6 words, numbers in gold. No SHOT ERROR / MISSING.

## Softened / attributed claims
- "you'd cross the point of no return without even noticing" — follows the source wording "may cross the event horizon without noticing any significant tidal forces" (Wikipedia, textbook citations); not "you survive" (NASA SVS: the camera is destroyed by tidal forces 12.8 s after crossing). On-screen chip says "FELT NOTHING... YET".
- "small black hole" = stellar-mass (5-20 Suns, NASA Imagine); the chip "SMALL: ~10 SUNS" is an example inside that range.
- "4,300,000 SUNS" + "LIKE OUR GALAXY'S CENTER" = the mass NASA SVS used (equal to Sagittarius A*); the narration only says "millions of suns".
- The "TIDAL ∝ M / r³" chalkboard line is the standard tidal-acceleration scaling (shown as a doodle, not read out).

## GPU render commands (Creator session, owner's PC; run from `whatif/aitrends-2d-studio`)
```
git fetch origin iawaken/short-blackhole && git checkout iawaken/short-blackhole
cd whatif/aitrends-2d-studio
npm install
node render.mjs --project projects/short-blackhole --workers 10 --format jpeg
python audio/mix.py --project projects/short-blackhole --video projects/short-blackhole/build/video_silent.mp4
# loudnorm pass (two-pass, -14 LUFS, true peak <= -1 dBFS); the mix lands near -14.8 LUFS / -1.3 dBTP, so this pass matters:
ffmpeg -i "projects/short-blackhole/out/What_If_You_Fell_Into_a_Black_Hole.mp4" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -
#   -> copy input_i, input_tp, input_lra, input_thresh, target_offset into the second pass:
ffmpeg -i "projects/short-blackhole/out/What_If_You_Fell_Into_a_Black_Hole.mp4" -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=<input_i>:measured_TP=<input_tp>:measured_LRA=<input_lra>:measured_thresh=<input_thresh>:offset=<target_offset>:linear=true,aresample=48000 -c:a aac -b:a 192k short-blackhole_final.mp4
# verify:
ffmpeg -i short-blackhole_final.mp4 -af ebur128=peak=true -f null -     # expect I ≈ -14 LUFS, Peak <= -1 dBFS
```
(Windows: use `python`, and the kit's `bin\` + `.venv` PATH from SETUP_NOTES.md. Linux: `python3`.) Expected output 1080x1920, 24 fps, 24.3 s.

## Notes
- Cloud render used Playwright with the preinstalled Chromium (headless shell 1243 linked as 1194 for the kit's playwright 1.56); the PC's own install is unaffected.
- Nothing was posted, uploaded or scheduled.
