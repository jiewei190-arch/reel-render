sticksafterdark job from the owner (Reel Studio MAIN). The owner asked for horror stories for the sticksafterdark account and picked the STICK-FIGURE HORROR look, more original scares (the owner: "Make 4 more reels for stick after dark"). Owner's PC is off: do the full render here in the cloud. Build ONE story, start to finish.

Base: origin/horror/sticks-kit (git fetch it; start your branch from it). Read `sticksafterdark/KIT.md`, the kit README at `whatif/aitrends-2d-studio/kits/sticks/README.md` + DEMO_sheet.png, and copy the reference projects for `sticksafterdark/mirror-lag/` (story #1) and look at the finished stories on origin/horror/sticks-two-texts, -head-count, -hall-light, -voicemail (their extended 60-70 s cuts are the target). Setup: `whatif/aitrends-2d-studio/SETUP_NOTES.md` (python3, npm install, PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers, export CHROMIUM_PATH=/opt/pw-browsers/chromium, never `playwright install`). Kokoro model files kokoro-v1.0.onnx + voices-v1.0.bin go in /home/user/reel-render/tts/ (kokoro-onnx GitHub release model-files-v1.0; pip install kokoro-onnx soundfile faster-whisper). If faster-whisper errors on `av`, decode audio with wave + numpy. Voice = the kit's tools/voice.py (Fenrir, slow, beats at '## ' headers, [WHISPER] character lines). Timing via tools/transcribe.py + tools/beats.py.

Look rules (from the kit): white stick figures, near-black chalk-line rooms, ONE accent colour, grain/vignette/flicker; the scary thing never fully shown; no gore/blood/injury. 9:16 1080x1920 24 fps; captions 1-3 words, lower-middle in the kit's safe zones, the punch word alone. Frame 1 already unsettling and moving; new visual every 1.5-3 s; a held silent beat before the twist; hard cut to the end card "Follow for more.". If you need a set the kit lacks, add it inside your own project (not the kit). Soft ambience + one sting on the twist; audio/mix.py to -14 LUFS, TP <= -1 (if mix.py trims frames, mux the final audio onto the full silent video with -c copy). Numbers/times: the voice says them in words, the captions show digits.

LENGTH (owner rule): Instagram Reels must be 60-70 s total, end card included. The narration below is written for that at the kit's slow voice; if your first voice pass lands outside 60-70 s, adjust the held beats/pacing first, and only add or trim a line of atmosphere if that is not enough (keep every story beat and the exact twist lines).

YOUR STORY: #7 (slug `snow-tracks`), accent: cold blue moonlight on white snow. Narration exactly (lines after 'Narration:'; '## ' = long beat, '## 2.4' = held silent frame of 2.4 s before the twist):
Narration:
Our cabin is six miles from the nearest road.
Last night, it snowed for the first time this winter.
This morning, I looked out my bedroom window.
Footprints. Bare feet.
They started right under my window and walked away into the woods.
No tracks coming toward the cabin. Only away.
My window was locked. From the inside.
I checked it twice.
So whatever made them was in here with me.
In my room. While I slept.
And then it left.
I told myself that was the good part. It left.
I locked every door. I didn't sleep.
##
It snowed again tonight.
I just checked the window.
## 2.4
There's a new set of tracks.
##
Coming back.
##
Follow for more.
Visuals: Frame 1: snow falling past the cabin window at night, moon-blue, something already moving at the treeline. Morning: the window view of a clean white field with one line of bare footprints (long, too-long toes, wide stride) leading from the wall below the window to the dark woods. Close on the window latch, locked, my stick hand testing it twice. The bedroom behind me: the bed, the dark corner (slow push). Me at the door locks, sitting up awake. Night again: snow, moon-blue. Final: look out the window: a NEW line of tracks coming from the woods toward the window, the last prints right under the glass; held, then on "Coming back." a long stick hand rests on the outside of the window frame (never the face), 1-frame jitter + sting. Hard cut to end card.

Deliver in `sticksafterdark/snow-tracks/`: script.md, the project, a contact sheet (check frame 1, captions vs UI zones, last frame), the FULL 1080x1920 render as `video.mp4` (byte-split parts < 95 MB + reassembly note if needed) + `video.sha256`, POST.md (hook caption <= 1 line + 2-line story tease, "Voice is synthetic.", 5-8 hashtags incl. #horror #scarystories #stickfigure, pinned comment question, cover frame time that does NOT spoil the twist), and STATUS.md whose FIRST LINE is exactly `STATE: ready` when the final video is pushed (before that `STATE: building` / `STATE: rendering`). `git add -f` any .wav/.mp4.

Branch: `horror/sticks-snow-tracks`. Rules: original story only; NEVER post, upload or log in anywhere; never enter passwords/tokens. Don't touch the kit or other stories' folders. Reel Studio MAIN picks the result up from your branch.
