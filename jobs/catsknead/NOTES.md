# catsknead: why do cats knead? (Batch N, worker H3)

- Template: **#26 Doodle robot** (demo t26, x.com/garmdotcom, "Headroom"; no source code, built from the demo frames in Canvas2D). Why: the demo explains an invisible process (filling a context window) as things happening in one sketched room, with a side-wall meter, tape labels, flying notes and a red stamp. Kneading is the same kind of story: something invisible (milk, comfort, scent) is going on in a cat's room. The previous H3 reels were #5 Impasto (auroras) and #24 Stop-motion (mpemba).
- Taken from the demo:
  - the one-point room on mottled kraft paper (ceiling, side walls, tiled floor toward a vanishing point at the back-wall centre);
  - wobbly ink outlines over watercolour washes with pooled edges;
  - the pendant lamp, the window with sun and cloud, the framed poster, and the potted spiky plant;
  - the side-wall battery meter, which fills and drains (milk, then comfort; a red outline when empty);
  - handwritten tape labels;
  - notes that fly in over the room (the demo's logs/JSON papers);
  - the red rubber stamp with ink dropout (LIMIT REACHED becomes NEVER STOPPED and MINE!).
- The cat is the star (approval note): 2x camera on the kneading cat at frame 0, one paw already mid-press with claws and press marks, a taped "press, press!" label; the lap cat is drawn 1.18x; all characters use the demo's line weight and fills.
- Length 78.2 s (inside 66-86; the first voice was 66.0 s, so three sourced lines were added: oxytocin, pheromones, the blanket tip); af_heart 0.97; music popup 92 bpm at music_gain 0.7; fx_gain 0.5.
- Code: reels/t_catsknead.js, t_catsknead.html, specs/catsknead.json, ev_catsknead.json, tl_catsknead.js. Fonts: Kalam (styles/fieldbook), JetBrains Mono for the handle.
- Batch N layout: title tape y 278-362; caption note y 1160-1354 (text x 100-890, words light up as spoken, the key words get a marker swipe); badge strip y 1366-1440 on the floor tiles. The wall meter shows only at 1.0x zoom, so its label never reaches the frame edge.
- Loop ending: in the last 0.5 s, the frame-0 room (cat kneading on the lap) dissolves in at most 40%.
- Demand signal: "why do cats knead" / "why do cats make biscuits" is an evergreen pet-behaviour search.
- Structure:
  1. Origin (9-28 s): newborn kittens press their mother's belly; milk and oxytocin; four notes (push, milk, warmth, safety) fly in as the 24 s re-hook.
  2. Twist (28 s): grown-up cats never stopped (the NEVER STOPPED stamp); neoteny.
  3. Three theories on the wall poster, ticked off at the payoff: #1 comfort (purring on a soft lap); #2 scent (43 s re-hook: the room goes dark, the paw-pad note with scent glands releasing pheromones as little letters to another cat, then the MINE! stamp, the wow, ~54 s); #3 wild cats trampling grass into a bed.
  4. Payoff (60.7 s): "a cat that feels safe, and maybe one that's claiming you"; vet clipboard (frantic? nonstop?); blanket tip; "Biscuits?"; end card.

## Approval notes applied
- The cat is bigger at frame 0 (2x camera) and already moving; the knead phase starts mid-press; the lap cat is drawn 1.18x.
- All three explanations are spoken as theories ("The leading theory", "a second, sneakier theory", "A third idea", "may leave").

## Softened / not used
- Cornell Feline Health Center and the ASPCA had no kneading page to cite; the institutional source is the University of Adelaide vet school (Hazel & Henning). No claim that scent marking is proven; the MINE! stamp illustrates theory #2. The vet line follows the sources' "frantic or compulsive" wording.

## QA (python3 -I reels/qa.py catsknead)
```
QA catsknead: WARN   (/home/user/reel-render/jobs/catsknead/catsknead.mp4, 78.2 s)
  PASS  static          longest no-change run 2.50 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  WARN  safe zones      right x>900 y900-1650: content 3.8-13.0s, 24.0-28.2s, 30.8-39.2s, 45.0-56.5s ...; bottom y>1700: content 9.5-17.0s, 19.5-24.2s, 27.8-31.0s, 39.0-43.0s ...; top y<150: content 0.0-3.5s, 13.5-16.8s
  WARN  outer 24 px     content at the frame edge 3.0-5.5s, 19.8-24.2s, 28.0-30.8s, 39.2-43.0s ...
  PASS  loudness        -15.2 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.3 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 15.0 dB above the pauses (15 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          78.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 14.0 (min 1.0), contrast 47.6 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      catsknead.mp4 1080x1920 SAR 1:1; catsknead_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
- WARN safe zones / outer 24 px: room art only (the side walls, ceiling corners, plant and rug of the full-bleed room; the demo's room also runs to the frame edges). No text in those zones: the wall-meter label (the first final's only text at the edge) was moved in and is shown only at 1.0x zoom, then re-rendered.
- Badge: catsknead_ep.mp4 EP 64 at (44, 1366); frames at 6/25/45/77.5 s checked, clear of all text. OVR line in reels/brand.py.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (11-word first line; frame 0 a big kneading cat mid-press with "kneading" tape; "But" at 3.5 s; search question spoken at 3.5-5.0 s)
- [x] Re-hooks at 24 s (four notes) / 28 s (NEVER STOPPED) and 43 s (theory #2, room goes dark); payoff 60.7 s
- [x] 66-86 s (78.2 s); ends on the exact closing line
- [x] One-word question before the closing line ("Biscuits?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (frame-0 room dissolves in, max 40%, in the last 0.5 s)
- [x] pinned_catsknead.md written
- [x] catsknead_ep.mp4 (EP 64, spot (44, 1366))
- [x] Sources: institutional vet-school source + two veterinary sources (sources_catsknead.md)
