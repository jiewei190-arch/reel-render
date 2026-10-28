# NOTES: crackedphone (EP 87)

**Template:** #26 doodle robot (demo t26, x.com/garmdotcom "Headroom"). Code: reels/t_crackedphone.js, a separate build of the demo's grammar (H3's catsknead, EP 64, is the other #26 reel).
- **Room palette:** cool sage walls, slate-blue floor and cool paper, so it differs from catsknead's warm kraft room (main-session request).
- **Why this template:** its demo topic is gadgets. A cute robot dropping its phone in a hand-inked room makes the stakes personal, and the demo's push-ins let the micro-scale story play out on a whiteboard on the back wall.

**Shots:**
- the robot's phone slips and cracks (frame 0 is the robot holding the phone up; the drop starts at 0.5 s), with the "a scratch" tape label;
- the "short drop" height marker;
- whiteboard: squeeze is strong, pull is weak;
- tiny flaws under a magnifier;
- bending piles the pull at the flaw tip;
- the Griffith 1920 card, the crack running, a red CRACK stamp;
- the salt bath;
- potassium/sodium swap (atoms);
- "squeezed tight";
- "small flaws stay shut";
- the layer is about one hair thick;
- a pavement grain drives a flaw through;
- 70%+ sharp contact (Corning) over a row of cracked phones;
- exposed edge;
- smooth vs grit;
- yes/no;
- end card on the whiteboard.

The demo's battery gauge on the left wall becomes a "pull" gauge that fills as the glass is stressed.

**Batch N layout:**
- the room is clipped to y 280-1150;
- Kalam captions on a cream tape strip, centred at y 1300;
- labels kept out of the right column below y 840.

**Script note (main session):** the hook's second line now reads "Most of the time, it starts at a scratch you can't even see", which matches Corning's "most failures" evidence.

**Audio:** the drop's snap and thud transients overshot after AAC at 88k (+1.3 dBTP, a QA FAIL). I re-muxed this reel's audio at 128k with the same 0.70 limiter: −15.7 LUFS, −2.0 dBTP.

**QA:** no FAIL. The one WARN is the zoomed room's walls touching the frame edge in the close robot shots; no text is there.

**Voice:** af_heart 0.97, crayon bed at music_gain 0.55, 77.0 s; spec `tail` 0.7, so the end card runs 3.0 s.

**Sources:** sources_crackedphone.md.

**Thumbnail:** thumb_crackedphone.jpg ("Why did a short drop / crack my screen?").

**Badge:** `brand.py crackedphone --ep 87` at ("R", 256), no hide needed; checked at 11 points. In the two close robot shots it sits on the top edge of the "ship it!" poster, not on any label.

## GROWTH checklist
- [x] Topic is a searched question (main-session assignment EP 87)
- [x] Hook passes HOOKS.md (first sentence 8 words; frame 0 is a push-in on the robot with its phone, which drops at 0.5 s; search question at 6.5 s)
- [x] 66-86 s (77.0 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Has your phone ever cracked from a short drop? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (dim 40%; frame 0 is the same room and robot)
- [x] pinned_crackedphone.md written
- [x] crackedphone_ep.mp4 (EP 87)
- [x] Evergreen

## QA (python3 -I reels/qa.py crackedphone)
```
QA crackedphone: WARN   (/home/user/reel-render/jobs/crackedphone/crackedphone.mp4, 77.0 s)
  PASS  static          longest no-change run 3.75 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  WARN  outer 24 px     content at the frame edge 0.0-3.0s, 64.8-67.5s, 70.8-74.2s
  PASS  loudness        -15.7 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.0 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 14.1 dB above the pauses (15 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          77.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 10.6 (min 1.0), contrast 40.0 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      crackedphone.mp4 1080x1920 SAR 1:1; crackedphone_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
