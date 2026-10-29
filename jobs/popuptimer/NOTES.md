# NOTES: popuptimer

**Template:** #11 cel-boil (kit_celboil.js, the demo's own animation language), same kit as the approved match reel.
**Why:** the whole topic is one short punchy event (a plug melts, a spring fires, POP). STYLE_FIT says cel-boil suits "short punchy events (ignite, snap, pop)". Recent reels were Distilbook, fieldbook, paper-popup and shadow-puppet; cranberries uses silkscreen.

**Copied from the demo:**
- an exposure sheet (twos for most scenes, ones for the pop, threes for calm titles), with a new boil per drawing;
- off-register colour; paper tooth and graphite dust per drawing;
- camera shakes on the pop and the "too early" beats, and push-ins;
- the FX vocabulary (sparks, star bursts, speed lines, puffs);
- titles drawn as boiled glyphs, and a boiled caption box with crisp type.

**Changes for 9:16 + safe zones:**
- art and titles sit in y 260-1100;
- the caption box is bottom-anchored at y 1420, so it stays inside y 1150-1420, and long captions drop one size to fit three lines;
- no text sits in the right column below y 840 (the 1961 lines moved up to y 580-800).

**Hook (HOOKS v2):** "There's no battery in a turkey pop-up timer. Just a spring, and a blob of metal." (15 words). Frame 0: the roast turkey with the red stick twitching, a crossed-out battery and the title "NO BATTERY"; "spring + metal" lands at 2.6 s. But-turn at 5.7 s: the camera pushes in on the breast, the stick pops, "HOW DOES IT KNOW?" (main-session note: a new frame by about 6 s).
**Re-hooks:**
- 23.5 s POP!;
- 27.7 s the fire-sprinkler origin;
- 37.4 s "THE CATCH";
- 42.9 s "21 TIMERS, 2016" with three popping early.

**Loop:** the end card keeps the hook's turkey with its twitching stick; final dim 30%.
**Voice:** af_heart 0.97, jazz bed at music_gain 0.6, mix2 (fx 0.5, ducked). 76.2 s.
**Storyboard review (main session):**
- the Consumer Reports test is dated and framed as "In one 2016 test" (the CR article is from Nov 22 2016);
- the USDA line is exact: "safe at 165 °F, measured with a food thermometer", with "165°F in the thickest part" on screen;
- the check spots are worded as USDA does: inner thigh, inner wing, thickest part of the breast;
- no melt temperature is spoken.

**Softened claims:** see sources_popuptimer.md.
**Code:** reels/t_popuptimer.js, t_popuptimer.html, specs/popuptimer.json, ev_popuptimer.json, tl_popuptimer.js. Thumbnail: thumb_popuptimer.jpg ("HOW DOES IT KNOW?").
**Build notes:**
- QA's first run warned on voice over bed (4.3 dB): the jazz bed was too loud. Remixed at music_gain 0.6 and remuxed the audio only (video untouched), giving 7.7 dB.
- The AAC encode overshoots true peak, so the audio is re-limited with 4x oversampling (alimiter 0.72, AAC 96k), giving −2.1 dBTP.
- The thumbnail's starburst was moved off the popped stick.

**Badge:** `brand.py popuptimer --ep 49` at (44, 1080), low-left just above the caption box, over art only. Titles fill the top band in every scene. It is hidden 47.3-52.4 s under the "3 popped early" label. OVR line in brand.py; checked at 16 points from 4 s to 75 s.

## GROWTH checklist
- [x] Topic is a searched question; demand signal: assigned from the main session's Thanksgiving list; "how does a turkey pop up timer work" is a classic autocomplete question
- [x] Hook passes HOOKS.md (frame 0 subject moving, title text, search question at 5.7 s)
- [x] 66-86 s (76.2 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Does your family trust the pop-up? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (dim 30%)
- [x] pinned_popuptimer.md written
- [x] popuptimer_ep.mp4 (EP 49)
- [x] Timely window: Thanksgiving (Nov 26); post date set by the main session

## QA (python3 -I reels/qa.py popuptimer, after the remix)
```
QA popuptimer: WARN   (/home/user/reel-render/jobs/popuptimer/popuptimer.mp4, 76.2 s)
  PASS  static          longest no-change run 0.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  WARN  outer 24 px     content at the frame edge 6.0-8.5s
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.1 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 7.7 dB above the pauses (9 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          76.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 15.5 (min 1.0), contrast 42.1 (min 18.0)
  PASS  9:16 frame      popuptimer.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

The outer-24 px WARN (6.0-8.5 s) is the pushed-in turkey filling the frame edge on the but-turn; it is art, not text.
