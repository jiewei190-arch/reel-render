STATE: ready

# The Octopus Has 9 Brains and Blue Blood — status

- `video.mp4`: 1080×1920, 24 fps, 1008 frames, **41.98 s** (target 40–48), H.264 + AAC. sha256 in `video.sha256`. Rendered in full in the cloud
  (Toon 3D, 4 workers, 11m42s; then s01 0–2.0 s and s21 40.0 s–end re-rendered to fix a frame-1 blink, spliced by frame number and re-encoded once at CRF 16).
- Audio: master **-14.1 LUFS** integrated, **true peak -3.2 dBTP** (ffmpeg ebur128 on the final file). audio/mix.py (music `toon3d:curious` -21 dB,
  59 kit SFX cues on words) then the same project master step as green-children-woolpit: `alimiter=limit=0.6` + `loudnorm=I=-14:TP=-1.5`.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py. Raw take: every line passed Whisper QA (line 9 on seed 23).
  Line 9 was then re-taken as "But in cold water..." (seed 7, word-for-word) to add a "But" turn at ~30 s, and spliced into input/voiceover_raw.wav.
  Tightened by tighten_vo.py: atempo 1.0, pauses capped 0.32 s, 0.2 s gaps, held beats before lines 3/5/7/10/11 → 41.76 s of voice + 0.5 s tail.
- QA: Whisper small.en on the final video.mp4 reads the script word for word ("nine brains, three hearts" for the digits; "two-thirds", "mini-brain" spelling only).
- Contact sheet (contact_sheet.png, made from the final file by justinclips/tools/contact_sheet.py): frame 1 / 1.5 s / 3.3 s with the Shorts UI zones drawn in red,
  the last frame next to frame 1, and one frame per shot. Checked: frame 1 is moving with the 2-line caption on top; captions (y 0.72) and the top caption sit
  outside the top bar, right buttons and bottom title area; the last frame is frame 1's camera + pose (loop).
  Fixed after looking: s05 dog/octopus cut off, s07 stamp unreadable, s09 clam/fish off-frame + clipped chip, s11 crown cropped, s16 tube too big,
  s20 squeeze didn't read, the x-ray body went muddy brown (outline hulls showed through; now hidden in x-ray), frame 1 caught mid-blink.
- Rules: line 1 = 10 words, WTF first; top caption 0–3.5 s, 2 lines, centre-top, BRAINS gold / HEARTS red; "But" turns at 8.7 / 16.9 / 23.4 / 30.3 s;
  21 shots + 3 internal hard cuts (avg ~1.7 s); reaction FX after reveals; 2 insert cards (500,000,000 NEURONS counter, COPPER); payoff "...and zero bones."
  38.6–40.2 s; closer "Subscribe for more." 1.23 s; s21 lands on frame 1's framing → loop. Digits in captions, spoken as words.
- Fact checks / wording changes (see sources.md):
  - "Nine brains" is used as the NHM uses it (central brain + a "mini brain" in each arm), not as a formal count.
  - Wikipedia says the systemic heart "becomes inactive" while swimming → the VO says "goes quiet" (not "stops beating").
  - Copper beats iron only in cold, low-oxygen water (hemocyanin is ~1/4 as efficient per blood volume in general) → line 9 keeps that condition.
  - Line 5 (the main brain can take control): NHM + Scientific American; Wikipedia has no direct sentence.
  - Left out on purpose: the severed-arm fact (no gore), a sucker count (no source gave one), "related to snails and clams" (only same phylum).
- Nothing was posted, uploaded or logged in anywhere.

Re-render, from whatif/aitrends-2d-studio (P=projects/octopus-nine-brains; Chatterbox venv from whatif/voice/setup_chatterbox.sh):
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py 1.0            # input/voiceover_raw.wav -> input/voiceover.wav (41.76 s)
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    python3 $P/make_shots.py                                        # story/shots.json from the word timings
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P
    ffmpeg -i $P/build/mix.wav -af "alimiter=limit=0.6:attack=3:release=60:level=false,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 $P/build/mix_master.wav
    ffmpeg -i $P/build/video_silent.mp4 -i $P/build/mix_master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest ../../justinclips/shorts/octopus-nine-brains/video.mp4

Deliverables: script.md, sources.md, UPLOAD.md, contact_sheet.png (from the final), video.mp4, video.sha256.
