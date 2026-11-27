STATE: ready

# Pando: This Forest Is Actually ONE Tree — status

- `video.mp4`: 1080×1920, 24 fps, 1060 frames, 44.17 s (target 40–48), H.264 + AAC. sha256 in `video.sha256`. Rendered in full in the cloud
  (4 workers, 18m11s), then s18–s19 (frames 984–1059, from 41.0 s) were re-rendered after the contact-sheet check and spliced in (head re-encoded CRF 18).
- Audio: final file -14.03 LUFS integrated, true peak -4.29 dBTP. audio/mix.py -14.06 / TP -1.48, then `projects/pando-one-tree/master.py`
  (limiter, measured gain, -2 dBFS limiter, AAC mux: same as fall-into-black-hole). mix.py unchanged. Music: toon3d:warm at -20 dB; kit SFX cues per shot.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py --gap 0.3 --comma 0.15 --lead 0.15. Raw take 48.1 s.
  QA: every part matched except line 4, flagged on all 3 seeds only because Whisper writes the homophone "tons" for "tonnes" (spelling only; seed 7 kept).
  Line 7 kept seed 11 (seed 7 was transcribed "9,000 to 16,000" vs. the TTS text; both say the same words). Tightened by tighten_vo.py: atempo 1.04,
  pauses capped at 0.32 s, 0.2 s gaps, held beats before lines 4 (+0.15), 6 (+0.1), 8 (+0.2), 10 (+0.15) -> 43.88 s of voice + 0.28 s tail.
- QA: Whisper small.en on the final video.mp4 reads the script word for word (it writes the homophones "tons" and "It's age": spelling only).
- Contact sheet (contact_sheet.png, from the final file): frame 1, the middle of all 19 shots, 2 frames under a Shorts-UI mock, and the last frame.
  Checked: frame 1 already moving (aerial glide) with the 2-line top caption; captions (y 0.72) clear the UI; the last frame = frame 1's aerial camera (loop).
  Fixed after the checks: frame 1 had no horizon (camera lifted, sky + hills in), x-ray roots hidden under the ground (s04 rebuilt as a soil diorama),
  counter labels (s05), scientist and hero cropped (s12, s17), overlapping ??? (s12), and the payoff s18: the deer jumped toward the lens and read
  as a blob, so s18 is now a 3/4 view where the deer clearly sails over the fence. The "6,000 TONNES" card's last letter sits near the right action rail
  in the UI mock (the rail is translucent on YouTube; the number itself is clear).
- Rules: line 1 = 10 words, WTF first; top caption 0–3.5 s, 2 lines, centre-top, FOREST gold / ONE TREE red; "But" turns at 13.7, 30.9, 40.6 s plus the
  age turn at 23.8 s; cuts ~1.2–2.8 s (internal hard cuts in s03/s04/s10/s12/s14); insert cards s05 (47,000), s08 (6,000 TONNES), s13 (9,000–16,000);
  reaction FX after reveals; payoff "...but some deer just jump over." 41.0–42.6 s, closer "Subscribe for more." 1.0 s; last frame loops into frame 1.
- Numbers spoken as words for the TTS, digits on screen. Age hedged as the brief asks: the 80,000-year claim is called out as too old, the newer
  9,000–16,000 range is "maybe" (Wikipedia 2024; PLOS ONE caps it at 14,000; USU: no method of firmly fixing its age). See sources.md.
- Fact checks: all lines hold against Wikipedia + USU/PLOS ONE (+ Utah state history). Nothing had to be changed. Card's "≈ 13 million pounds" is USU's figure.
- Tone: gentle; old trees tip over softly and fade, the deer are cute, nobody hurt; no realistic photos, no real logos (the newspaper is made up), no channel name.
- Nothing was posted, uploaded or logged in anywhere.

Re-render, from whatif/aitrends-2d-studio (P=projects/pando-one-tree):
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py           # input/voiceover_raw.wav -> input/voiceover.wav (43.88 s)
    ~/.venvs/chatterbox/bin/python $P/timing.py               # Whisper-aligned words -> story/shots.json
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4 --out $P/out/video_mixpy.mp4
    python3 $P/master.py $P ../../justinclips/shorts/pando-one-tree/video.mp4
    ~/.venvs/chatterbox/bin/python $P/contact_sheet.py ../../justinclips/shorts/pando-one-tree/video.mp4 $P/story/shots.json ../../justinclips/shorts/pando-one-tree/contact_sheet.png 1.0,16.5
  (a full render with the current scenes needs no splice.)

Deliverables: script.md, sources.md, UPLOAD.md, contact_sheet.png, video.mp4, video.sha256, tts_script.md.
