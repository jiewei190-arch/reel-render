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
QA_BLOCK

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
