STATE: ready

# The Green Children of Woolpit — status

- `video.mp4`: 1080×1920, 24 fps, 1021 frames, 42.6 s (target 40–48), H.264 + AAC. sha256 in `video.sha256`. Rendered in full in the cloud (4 workers, ~11 min).
- Audio: master -14.1 LUFS integrated, true peak -2.5 dBTP (ffmpeg ebur128 on the final file).
  mix.py's single-pass loudnorm landed at -15.2 LUFS (it held back to TP -1.5), so a project-local master step was added after mix.py:
  `alimiter=limit=0.6` (peak limiter, no make-up) then `loudnorm=I=-14:TP=-1.5` on build/mix.wav, then remuxed. mix.py itself is unchanged.
  Music: toon3d:mystery at -19 dB; SFX from the kit (48 cues).
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py. Raw take 45.5 s; QA flagged lines 1 and 2:
  line 1 was spelling only ("greenskin"), line 2 was heard as "Wolpert". Both were re-taken with the same voice and settings
  (line 1 seed 31, word-for-word match; line 2 TTS text respelled "Wool-pit" for pronunciation only, seed 59, heard "Wool Pit, Suffolk")
  and spliced into input/voiceover_raw.wav (46.1 s, lines.json updated). Captions and script keep "Woolpit".
  Tightened by projects/green-children-woolpit/tighten_vo.py: atempo 1.04 (pitch kept), pauses capped at 0.32 s, 0.2 s gaps,
  held beats before lines 7 (+0.35 s), 9 (+0.2 s), 11 (+0.3 s) → 41.66 s of voice + 0.94 s payoff hold.
  (bat-bomb's 1.17 would have given ~37 s, under the 40–48 s target.)
- QA: Whisper small.en on the final file reads the script word for word, including "Woolpit, Suffolk, the 12th century"
  (it writes "12th" and "wolfpit" — spelling only).
- Contact sheet (contact_sheet.png): 24 frames at mid-shot times, from the final file. Checked: frame 1 shows the kids + recoiling
  villagers + the 2-line caption; no dead frames; captions readable. Fixed after the first look: villagers out of frame (s01/s07/s12),
  "ZZZ"-looking glyphs (s07), camera inside the girl's back after the s11 cut, a big head blocking the s13 cut, tiny "real event?" text (s15).
- Rules: hook line 12 words, WTF first; top caption 0–3.9 s, 2 lines, centre-top, LEGEND gold / GREEN red; frame 1 already moving;
  "But" turn at line 8; cuts every ~1.4–2.6 s (internal hard cuts in s05/s11/s12/s13/s16); payoff "Nobody knows." in the last ~1.8 s;
  s16 pulls back to frame 1's exact camera on the empty pit → loops into frame 1 (the kids standing there).
- TONE: framed as a legend (line 1, top caption, line 10, storybook vignette on the girl's story). The boy's death is one gentle line;
  nothing is shown (s11 = his sister alone at dusk). No mocking, no gore.
- Wording changes vs the card: card line 1 shortened to 12 words ("...appeared in an English village", language moved to line 4);
  card frame 1 says "mouth of a cave" — the video uses the wolf pit, where Wikipedia says they were found (see sources.md);
  top caption "12th century legend" → "a 12th-century LEGEND / two kids with GREEN skin".
- Nothing was posted, uploaded or logged in anywhere.

Re-render, from whatif/aitrends-2d-studio (P=projects/green-children-woolpit):
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py            # input/voiceover_raw.wav -> input/voiceover.wav (41.66 s)
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4
    ffmpeg -i $P/build/mix.wav -af "alimiter=limit=0.6:attack=3:release=60:level=false,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 $P/build/mix_master.wav
    ffmpeg -i $P/build/video_silent.mp4 -i $P/build/mix_master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest $P/out/The_Green_Children_of_Woolpit.mp4

Deliverables: script.md, sources.md, UPLOAD.md, contact_sheet.png (from the final), video.mp4, video.sha256 (+ tts_script.md, card.md).
