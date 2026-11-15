STATE: ready
# immortal-jellyfish-v2: "jail break" re-cut of Immortal Jellyfish (EMOTION: WOW). v1 is untouched in ../immortal-jellyfish/
- **Final:** `video.mp4` 1080x1920, 24 fps, 534 frames, **22.25 s** (target ~22 s), H.264 + AAC 192k, 17 MB. **-14.3 LUFS, true peak -1.4 dBFS.**
  `video.sha256`: `24bb818fa28297bbfde76cefc73584e27182d3615ef96a3df5d0d7997ed4a0de  video.mp4`. The full silent render and mix.wav were muxed with `-c:v copy`; all 534 frames were kept.
- **Triple hook:** frame 1 is the RESET smack, already moving; line 1 is "This jellyfish can't die of old age." (7 words); the top caption "it just turns back / into a BABY" is up for 0-3.25 s, separate from the word captions.
- **One emotion (WOW):** cut "Ever.", the transdifferentiation line (now only an on-screen stamp), the butterfly comparison, the brain line and the closer.
  Kept: injured or starving -> reset -> blob -> baby -> grows up again and again, pinky nail (4.5 mm + Latin name chips), "in theory... forever", payoff "Fish and turtles eat it. Immortal, but also... lunch."
- **Loop:** "Subscribe for more." was dropped. Chatterbox says it in ~1.2 s, over the 1 s limit, and it would break the loop. The LUNCH card (21.45 s) hard-cuts into frame 1.
- **Voice:** Chatterbox D2, every part passed Whisper QA (seed 7; "lunch" seed 11). On the final video, Whisper small.en hears the v2 script word for word.
- **Checked:** `contact_sheet.png` (15 frames of the final; red = Shorts UI zones) and `preview_540x960.mp4` (scaled from the final). Word captions sit at 70 %, clear of the UI.
  Note: the hook's first line starts ~4.5 % from the top, so its top edge touches the Shorts top bar (search icon area). It stays readable. If MAIN wants it lower, move `topHook` y from 0.075 to 0.09 in `scenes/sea.js` and re-render the first 3.3 s.
- Sources and facts are unchanged from v1 (`sources.md` copied). UPLOAD.md: new title = the claim "This Jellyfish Can't Die of Old Age 🪼" (v1 title as alt); cover 1.6 s.
- **Rendered in the cloud:** SwiftShader, 4 workers, 7m46s. Project: `whatif/aitrends-2d-studio/projects/immortal-jellyfish-v2` (voiceover.wav force-added).
  Re-render: `node render.mjs --project projects/immortal-jellyfish-v2 --out projects/immortal-jellyfish-v2/build/video_silent.mp4`, then mix.py and mux with `-c:v copy`.
- Nothing was posted, uploaded or logged into.
