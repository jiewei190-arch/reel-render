STATE: ready

Sticks After Dark #3 "Head Count" — final render pushed.
- video.mp4: 1080x1920, 24 fps, 688 frames, 28.67 s, H.264 + AAC 192k, 17.3 MB (single file, no split needed). sha256 in video.sha256.
- Loudness: -14.0 LUFS integrated, true peak -1.3 dBTP (ebur128 check on the final file).
- Audio: Kokoro am_fenrir via kit tools/voice.py (slow 0.88), soft dark drone bed (-24 dB), low wind amb, project-local campfire
  crackle + 4 fire pops (project/audio/make_fire_sfx.py), one stinger on "myself" (23.98 s) + 1-frame jitter. Fire dies at 25.3 s, hard cut to end card at 25.9 s.
- mix.py's -shortest dropped the last frame, so build/mix.wav was muxed onto the full silent video with -c:v copy (all 688 frames kept).
- Timing: voice.py chunk/syllable times (transcribe.py --model base cross-check: 41/41 words matched, sentence starts agree within ~0.3 s; voice.py kept, per kit README).
- Captions: story/captions.json (1-3 words, digits for numbers, "6" / "5" / "myself" alone), y=1340 (config stickCaptions), clear of the bottom 20%.
  Note: the debug overlay's green box is drawn at the kit default y=1250; captions sit just under it, still well above the red zone.
- Known nit: the 5th friend (seat on the right) sits partly in the right-15% zone in the wide count shots; nothing critical there.
- New set (night woods, log ring, campfire, tents, my pointing hand, turning head) lives in project/scenes/shots/_camp.js. Kit untouched.
- contact_sheet.png: frame 1, 15 timeline frames, last frame, + 5 debug frames with UI zones.
