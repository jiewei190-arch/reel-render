STATE: ready

Sticks After Dark #3 "Head Count" — Instagram cut (60-70 s), final render pushed. Replaces the earlier 28.7 s version.
- video.mp4: 1080x1920, 24 fps, 1669 frames, 69.54 s, H.264 + AAC 192k, 36.7 MB (single file, no split needed). sha256 in video.sha256.
- Loudness: -14.1 LUFS integrated, true peak -1.4 dBTP (ebur128 check on the final file).
- Narration: the extended script from Reel Studio MAIN, word for word. Kokoro am_fenrir via kit tools/voice.py (speed 0.88, unchanged).
  It landed at 69.5 s naturally, so no beats were stretched or tightened. '## 2.4' = held silent frame before "And I never count myself."; '## 1.6' before the end card.
- 38 shots, a new visual every 1-2.6 s: hike in with a lantern, no-signal phone, my worried face, the rule, count 1-5, nights one and two,
  teasing, fog rolls in, fire low, ghost story (torch under the chin), the night-three count, the sixth (too tall, head tilted) at the edge of the light,
  laughter, a doubled head ("counted someone twice"), slow recount, Good, my face, walking back to my log, embers with no one round them,
  inside my tent, five shadows on the tent wall, held silent empty log, pull back to six round the fire, one turns its head to the camera, fire out, end card.
- Audio: soft dark drone bed, low wind amb, footsteps on the hike, campfire crackle from 7.0 s until the fire dies (66.15 s), 4 fire pops,
  one stinger + 1-frame jitter on "myself" (64.84 s). Hard cut to "Follow for more." at 66.7 s.
- mix.py's -shortest trims a frame, so build/mix.wav was muxed onto the full silent video with -c:v copy (all 1669 frames kept).
- Captions: story/captions.json, 1-3 words, digits for numbers ("5 of us", "Night 3", "4 friends"), "6" / "5" / "myself" alone; y=1340, clear of the bottom 20%.
  (The debug overlay's green box is drawn at the kit default y=1250; captions sit just below it.)
- Known nit: in the wide counting shots, the 5th friend's seat sits partly inside the right 15% zone. Nothing critical happens there.
- New sets live in project/scenes/shots/_camp.js (woods, fire, fog, people) and head_count.js (hike, phone, close-up face, tent interior). Kit untouched.
- contact_sheet.png: frame 1, 24 timeline frames, last frame, + 5 debug frames with the UI zones.
