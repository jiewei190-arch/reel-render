STATE: ready

# The Devil's Footprints — status

- `video.mp4`: 1080×1920, 24 fps, 1026 frames, 42.75 s, H.264 + AAC, 16 MB. sha256 in `video.sha256`. Rendered in full in the cloud (SwiftShader, 4 workers, ~8.5 min).
- Audio: mix.py master **-14.3 LUFS** integrated, true peak **-1.4 dBTP** (ffmpeg ebur128 on the final file). Music `toon3d:mystery` at -19 dB, 59 kit SFX cues.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py (raw take 49.5 s, kept as input/voiceover_raw.wav; QA OK on all 11 lines, line 11 took seed 11 because seed 7 said "doubles footprints"), tightened by projects/devils-footprints/tighten_vo.py 1.10 (pauses capped at 0.3 s, atempo with pitch kept, extra beats before lines 5, 8, 10, 11) → 42.3 s.
- QA: Whisper small.en on the final video.mp4 reads the script word for word (only spelling differences: "hoof prints", "four").
- Contact sheet (`contact_sheet.png`, 29 frames from the final file every 1.5 s, exact seeks) checked by eye: no dead/black frames, no clipped text, captions readable on every frame.
  Fixes made after the first full render's sheet: the iris into s12 hit a full-black midpoint → whipBlur; a kangaroo "?" overlapped the SUSPECTS stamp → removed. Earlier still passes fixed framing (9:16 cameras far too tight), prints hidden on roofs (slope sign), river ice under the snow floor, hook text spacing.
- Batch rules: line 1 = 11 words, WTF first; frame 1 already moving (prints appearing over the roof) with top caption "1855 / it walked over the roof" (gold + red) held 0–3.9 s; "But here's the part..." turn at line 5 and "But none of it..." at line 10; cuts every ~1.1–2.5 s with punch-ins (s01, s04) and word-synced tracking (s08, s14); payoff in the last ~2 s; the last shot returns to frame 1's exact framing → loop.
- Wording vs the card: the card's first line ("One snowy night in 1855, something reportedly walked an estimated 40 to 100 miles across Devon, straight over houses and rivers, and left only hoofprints") was split: line 1 keeps "reportedly ... over houses ... only hoofprints", the 40–100 miles is line 7 with "estimated", rivers line 6. "Satan" is attributed ("Some people said"); explanations are "blamed"; "none ... confirmed" and "some reports have been questioned" keep the card's mystery framing. Wikipedia says "the night of 8–9 February 1855 and one or two later nights": the video says the prints were found after "One February night" and never says the whole trail was made in one night (sources.md).
- Tone: no devil imagery (reaction + stamp only), nobody hurt, newspaper is an invented generic "Weekly Gazette", map stylised.
- Nothing was posted, uploaded or logged in anywhere.

Re-render, from whatif/aitrends-2d-studio:
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project projects/devils-footprints --workers 4 --out projects/devils-footprints/build/video_silent.mp4
    python3 audio/mix.py --project projects/devils-footprints --video projects/devils-footprints/build/video_silent.mp4   # -> out/The_Devils_Footprints.mp4 (1026 frames)
Voice (Chatterbox venv): chatterbox_d2.py projects/devils-footprints/tts_script.md input/voiceover_raw.wav input/script.txt --gap 0.3 --comma 0.15 --lead 0.15, then tighten_vo.py, then tools/transcribe.py --model small.en.

Deliverables: script.md, sources.md, UPLOAD.md, STATUS.md, contact_sheet.png (from the final), video.mp4, video.sha256.
