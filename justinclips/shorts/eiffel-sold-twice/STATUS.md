STATE: ready

# The Con Man Who Sold the Eiffel Tower — status

- `video.mp4`: 1080×1920, 24 fps, 588 frames, 24.50 s, H.264 + AAC, 13.3 MB. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 4 workers, 9m34s).
- Audio: mix.py (music `toon3d:curious`, 33 SFX cues) → mix.wav, then +0.8 dB through a −1.9 dB limiter (`build/mix_final.wav`) and muxed onto the full silent render with `-c:v copy` (588 frames kept): **−14.2 LUFS integrated, true peak −1.7 dBTP**.
- Voice: Chatterbox D2 (exag 0.3, cfg 0.3), 7 lines, all passed Whisper QA (seeds 7/11). 25.5 s take sped up 4.5 % (`atempo=1.045`) to 24.4 s to meet the ±3 s target; raw take in `input/voiceover_raw.wav`. Word alignment 62/65; 4 word times hand-fixed in `timeline/words.json` (Twice, Andre, 2nd Poisson, AGAIN).
- Jail-break rules: checklist at the top of `script.md`. Frame 1 = tiny top-hat Lustig leaning on the whole tower with a SOLD sign + top caption (see `contact_sheet.png`, first tile). "Subscribe for more." dropped (1.3 s > 1 s, hurt the loop).
- **Flags for MAIN (facts, details in `sources.md`):**
  1. "6 scrap dealers" — kept per brief, but Mental Floss says five and Wikipedia/Smithsonian give no number. Easy fix if wanted: re-voice line 3 as "five" or no number.
  2. The second sale is disputed (Wikipedia/Smithsonian: the 2nd deal didn't close) → VO says "reportedly sold it... AGAIN"; the description says "reportedly" too.
  3. "Worried the US Treasury" (PDF) cut: no source names the Treasury.

Re-render, from whatif/aitrends-2d-studio (Linux: `export CHROMIUM_PATH=/opt/pw-browsers/chromium`; mix needs scipy, e.g. `~/.venvs/chatterbox/bin/python`):
    node render.mjs --project projects/eiffel-sold-twice --out projects/eiffel-sold-twice/build/video_silent.mp4 --workers 4
    python audio/mix.py --project projects/eiffel-sold-twice --video projects/eiffel-sold-twice/build/video_silent.mp4 --out projects/eiffel-sold-twice/out/video.mp4
    ffmpeg -i projects/eiffel-sold-twice/build/mix.wav -af "volume=0.8dB,alimiter=limit=0.80:attack=2:release=60:level=disabled" -ar 48000 projects/eiffel-sold-twice/build/mix_final.wav
    ffmpeg -i projects/eiffel-sold-twice/build/video_silent.mp4 -i projects/eiffel-sold-twice/build/mix_final.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart video.mp4

Not posted anywhere.
