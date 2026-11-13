STATE: ready

# Switzerland Made Owning One Guinea Pig Illegal: status

Final video rendered in the cloud and pushed (the owner's PC "Creator" was off).

- `video.mp4`: 1080×1920, 24 fps, 968 frames, 40.3 s, H.264 + AAC 48 kHz, 20 MB (no split needed). sha256 in `video.sha256`.
- Audio: mix.py mix (Kokoro am_fenrir voice, music `toon3d:curious` ducked, 47 kit sfx cues, many on spoken words), then +0.65 dB through a limiter (as the FX demo was mastered). Result: **-14.1 LUFS integrated, true peak -1.5 dBFS**. mix.py's own mux dropped 1 frame, so the mix was muxed onto the full silent render with `-c:v copy` (968/968 frames).
- Checked on the final (`contact_sheet.png`, magenta = Shorts UI zones; `preview_540x960.mp4`): frame 1 is moving (push-in, trembling pig, waving flag) with the 3-line hook "OWNING ONE GUINEA PIG IS ILLEGAL HERE". Captions are 1-3 words at y 0.70, clear of the top bar, the bottom title area and the action buttons. There are reaction FX after every reveal, 2 insert cards (the 2008 ordinance + LONELINESS = CRUELTY stamp; THE LEGAL MINIMUM 2), and whipBlur, iris, flash and dip transitions. The last frame is the sunset couple + GOV'T APPROVED, with a hard cut back to frame 1.
- Voice: Whisper word timestamps snapped to the measured speech segments. No years or numbers are spoken ("2008" is on screen only). The closer "Subscribe for more." runs 1.06 s.
- Tone: wholesome comedy. Nobody is hurt, and the funeral is cute (matchbox, flowers, veil). No photos, no channel name.
- Script trim: "Parrots, even lovebirds." (the owner's sanctioned trim). Every claim is in `sources.md`.

Re-render (e.g. on the PC with `--gl gpu`), from whatif/aitrends-2d-studio:
    node render.mjs --project projects/lonely-guinea-pig --out projects/lonely-guinea-pig/build/video_silent.mp4
    python3 audio/mix.py --project projects/lonely-guinea-pig --video projects/lonely-guinea-pig/build/video_silent.mp4 --out projects/lonely-guinea-pig/build/video.mp4
    # then mux build/mix.wav onto video_silent.mp4 with -c:v copy (keeps all 968 frames)
Voice rebuild: `python3 projects/lonely-guinea-pig/input/make_voice.py` (Kokoro files in /home/user/reel-render/tts/).

Nothing was posted, uploaded or logged into.
