STATE: ready

# Switzerland Made Owning One Guinea Pig Illegal: status

**Re-voiced with Chatterbox D2** (owner's new narrator, via MAIN, Nov 13) and re-rendered in the cloud. Script, shots, captions, effects and packaging are unchanged; everything is re-timed to the new voiceover.

- `video.mp4`: 1080×1920, 24 fps, **987 frames, 41.125 s**, H.264 + AAC 48 kHz, 19.8 MB (no split needed). sha256 in `video.sha256`.
- Voice: `whatif/voice/chatterbox_d2.py` (exaggeration 0.3, cfg 0.3, `--gap 0.3 --lead 0.15`), script `tts_script.md`. Per-line Whisper QA passed on all 12 lines (seeds in `input/voiceover.lines.json`). **QA: a full Whisper small.en transcript of both the voiceover and the final mixed video matches the script word for word (108 words).**
- Held beats: after "lonely..." (0.85 s) and before "arranged by the government" (0.86 s, held on the blind-date shot). The closer "Subscribe for more." runs 1.14 s, then a hard cut back to frame 1.
- Re-timing: Whisper word timestamps snapped to the measured speech segments (`timeline/words.json`). The 14 shot cuts sit in the silence before each line. Captions and all sfx word cues follow the new words automatically.
- Audio: mix.py mix (music `toon3d:curious` ducked, 47 kit sfx cues), then +0.45 dB through a limiter. Result: **-14.1 LUFS integrated, true peak -1.5 dBFS**, muxed onto the full silent render with `-c:v copy` (987/987 frames).
- Checked on the final: `contact_sheet.png` (magenta = Shorts UI zones) and `preview_540x960.mp4`. Frame 1 is moving, with the hook "OWNING ONE GUINEA PIG IS ILLEGAL HERE". Captions are 1-3 words at y 0.70, clear of the UI. The effects land on their words (gavel on "loud", stamp on "cruelty", thunder on "dies", door burst on "criminal", hearts on "date").
- UPLOAD.md: runtime and the alt cover time updated (41.1 s; alt cover 25.0 s). Title, description and pinned comment are unchanged.

Re-render (e.g. on the PC with `--gl gpu`), from whatif/aitrends-2d-studio:
    node render.mjs --project projects/lonely-guinea-pig --out projects/lonely-guinea-pig/build/video_silent.mp4
    python3 audio/mix.py --project projects/lonely-guinea-pig --video projects/lonely-guinea-pig/build/video_silent.mp4 --out projects/lonely-guinea-pig/build/video.mp4
    # then mux build/mix.wav onto video_silent.mp4 with -c:v copy (keeps all 987 frames)
Voice rebuild: `bash whatif/voice/setup_chatterbox.sh` once, then
    ~/.venvs/chatterbox/bin/python whatif/voice/chatterbox_d2.py projects/lonely-guinea-pig/input/script_d2.md projects/lonely-guinea-pig/input/voiceover.wav projects/lonely-guinea-pig/input/script.txt --gap 0.3 --comma 0.15 --lead 0.15

Nothing was posted, uploaded or logged into.
