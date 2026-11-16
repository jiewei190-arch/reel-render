sticksafterdark job from the owner (Reel Studio MAIN). The owner asked for horror stories for the sticksafterdark account and picked the STICK-FIGURE HORROR look, more original scares (the owner: "Make 4 more reels for stick after dark"). Owner's PC is off: do the full render here in the cloud. Build ONE story, start to finish.

Base: origin/horror/sticks-kit (git fetch it; start your branch from it). Read `sticksafterdark/KIT.md`, the kit README at `whatif/aitrends-2d-studio/kits/sticks/README.md` + DEMO_sheet.png, and copy the reference projects for `sticksafterdark/mirror-lag/` (story #1) and look at the finished stories on origin/horror/sticks-two-texts, -head-count, -hall-light, -voicemail (their extended 60-70 s cuts are the target). Setup: `whatif/aitrends-2d-studio/SETUP_NOTES.md` (python3, npm install, PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers, export CHROMIUM_PATH=/opt/pw-browsers/chromium, never `playwright install`). Kokoro model files kokoro-v1.0.onnx + voices-v1.0.bin go in /home/user/reel-render/tts/ (kokoro-onnx GitHub release model-files-v1.0; pip install kokoro-onnx soundfile faster-whisper). If faster-whisper errors on `av`, decode audio with wave + numpy. Voice = the kit's tools/voice.py (Fenrir, slow, beats at '## ' headers, [WHISPER] character lines). Timing via tools/transcribe.py + tools/beats.py.

Look rules (from the kit): white stick figures, near-black chalk-line rooms, ONE accent colour, grain/vignette/flicker; the scary thing never fully shown; no gore/blood/injury. 9:16 1080x1920 24 fps; captions 1-3 words, lower-middle in the kit's safe zones, the punch word alone. Frame 1 already unsettling and moving; new visual every 1.5-3 s; a held silent beat before the twist; hard cut to the end card "Follow for more.". If you need a set the kit lacks, add it inside your own project (not the kit). Soft ambience + one sting on the twist; audio/mix.py to -14 LUFS, TP <= -1 (if mix.py trims frames, mux the final audio onto the full silent video with -c copy). Numbers/times: the voice says them in words, the captions show digits.

LENGTH (owner rule): Instagram Reels must be 60-70 s total, end card included. The narration below is written for that at the kit's slow voice; if your first voice pass lands outside 60-70 s, adjust the held beats/pacing first, and only add or trim a line of atmosphere if that is not enough (keep every story beat and the exact twist lines).

YOUR STORY: #9 (slug `baby-monitor`), accent: green baby-monitor glow. Narration exactly (lines after 'Narration:'; '## ' = long beat, '## 2.4' = held silent frame of 2.4 s before the twist):
Narration:
We put a baby monitor in our daughter's room when she turned two.
Last night, around three, it crackled on.
Someone was humming. Soft. Slow. A lullaby.
I shook my wife awake. She heard it too.
We ran down the hall and opened the door.
Our daughter was sitting up in her crib. Wide awake.
Nobody else in the room. The window locked.
"Who was singing to you?" I asked.
She pointed at the corner of the ceiling.
[CHILD] The tall lady. She stopped when you came.
We brought her to sleep in our bed.
##
It's quiet now. Everyone's asleep but me.
##
The monitor is still on the nightstand.
Her room is empty.
## 2.4
And it just started humming again.
##
Follow for more.
Visuals: Frame 1: the green monitor on the nightstand, its sound-level lights bouncing, green glow on two sleeping stick figures. Clock "3:00" (caption digits). Hallway run, door swings open. Nursery: the crib, my small daughter sitting up, wide dot-eyes, the window locked. She points up: the top corner of the ceiling, pure black, held (nothing visible, or just the hint of something long folded into it). [CHILD] = a soft small child voice line (another Kokoro voice, sped up slightly / pitched up; nothing scary in the voice itself). Our bed: three figures, the child safe between us (she is never harmed). Close on the monitor: green lights flat. Cut to the empty nursery: crib empty, the corner dark. Back to the monitor: the green lights start bouncing again, a faint hum; final frame = the empty crib with a long stick arm reaching down from the ceiling corner, rocking the mobile (never the face). 1-frame jitter + sting. Hard cut to end card.

Deliver in `sticksafterdark/baby-monitor/`: script.md, the project, a contact sheet (check frame 1, captions vs UI zones, last frame), the FULL 1080x1920 render as `video.mp4` (byte-split parts < 95 MB + reassembly note if needed) + `video.sha256`, POST.md (hook caption <= 1 line + 2-line story tease, "Voice is synthetic.", 5-8 hashtags incl. #horror #scarystories #stickfigure, pinned comment question, cover frame time that does NOT spoil the twist), and STATUS.md whose FIRST LINE is exactly `STATE: ready` when the final video is pushed (before that `STATE: building` / `STATE: rendering`). `git add -f` any .wav/.mp4.

Branch: `horror/sticks-baby-monitor`. Rules: original story only; NEVER post, upload or log in anywhere; never enter passwords/tokens. Don't touch the kit or other stories' folders. Reel Studio MAIN picks the result up from your branch.
