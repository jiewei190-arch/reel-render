# Style guide: picking the right look for each topic

This is for howitreallyworkstudio. Reels are vertical (1080×1920), 66–86 s long, and beginner-friendly.
The user rule still applies: **propose a style, show stills, and render only after the user agrees.**
The house constraint never changes: the look stays cute, animated and illustrated, with no realistic photos and nothing crude or budget-looking.

## 1. How to choose (in about 60 seconds)

1. **What is the topic's "thing"?** It is one of: a creature, a process or machine, a number or scale, a place or event, or a myth versus the truth.
2. **What does the payoff look like?** Choose the medium whose native move *is* that payoff:
   - Something is hidden inside → a cutaway or "opens up" medium (iso-infographic, paper-popup).
   - Something grows or builds → a medium that draws or builds itself (crayon-book, lowpoly-island).
   - A number is shocking → a medium that counts with objects (data-physical, iso Isotype rows).
   - It is weird or funny → a toon medium with reactions (scifi-toon, midcentury-toon).
   - It is tiny → a scale-dive medium (microscope look, done cute).
3. **Mood check:** cozy, curious, spooky or hype? Pick the palette and the music family from that.
4. **Cost check on 2 CPUs.** Heavy WebGL shaders render at about 20 s per frame in swiftshader. Stay within our three.js engine, or use a 2D canvas look.
5. Never use the same style two posts in a row on the grid. Rotate between 3 or 4 house looks.

## 2. Topic type → recommended styles

| Topic type | First choice | Alternatives | Why |
|---|---|---|---|
| Animal facts (wombat, octopus, flamingo) | **Cute 3D diorama** (our engine: Sketchfab toon models plus Fluent Emoji) | crayon-book, lowpoly-island | The creature *is* the star. A cute rig with idle animations sells the "aww". |
| Animal body or inside facts (3 hearts, cube poop) | **iso-infographic cutaway** with a cute mascot | paper-popup | The body opens up to show the inside, and labels sit on leader lines. |
| How a machine or system works (DST, internet, fridge) | **iso-infographic** | blueprint (cute palette), lowpoly-island | A system diagram that opens up. Isotype numbers. |
| Nature or why-X-happens (leaves, sky blue, onions cry) | **crayon-book** (picture book) | watercolor, paper-popup | "Colouring is an action": leaves turning colour IS the explanation. |
| Space or sky (Leonids, moon) | **paper-lantern / night diorama** (our cozy-night palette) | lowpoly-island at night | Glow, layered depth, a dark sky that makes stars pop. |
| Myths vs truth (turkey sleepy, honey) | **midcentury-toon** "follow-along" film | scifi-toon duo | A presenter character who reacts, with a big MYTH stamp and then the reveal. |
| Holidays or awareness days (Cat Day) | **Cute 3D diorama** with the cozy-night or pastel palette (approved) | paper-popup | Already approved by the user and on-brand. |
| Big numbers or scale | **data-physical** (cute blocks or coins stacked) | iso Isotype | The count becomes a physical pile, which is understood instantly. |
| Food or chemistry | **watercolor journal** | crayon-book | Soft, appetising, with handwritten notes. |
| Gaming or tech culture | **pixel-rpg** or **game-show** | lowpoly-island | The medium matches the audience. |

**Off-brand (avoid):** realistic photo or scan styles (caption-news, satellite, lidar, teardown, archive-lighttable, newsreel, kino-montage, visual-investigation, tilt-shift) and dark or creepy styles (backrooms).

## 3. Execution notes per house style

### A. Cute 3D diorama (our engine: t_cdcore.js)
- **Models:** Sketchfab CC BY or CC0 toon or cartoon GLBs that have animations, plus Microsoft Fluent Emoji 3D PNG sprites for props and icons. Credit every CC BY author in the caption.
- **Palettes:** cozy night (bg #16132e, accent #FFB547) or pastel (bg #fdf0e0, accent #FF6F59).
- **Type:** chunky rounded sans. Large numbers use a count-up.
- **Motion:** squash-and-stretch pops (back-out ease), idle bob, and clip changes on beats.
- **Native move:** a model plays a reaction animation exactly on the punch line.
- **Sound:** pizzicato, celesta and soft kick.
- **Pitfalls:**
  - Use MeshBasicMaterial for canvas textures, or they wash out.
  - Hide all icons every frame.
  - Never call iconAt twice on one sprite.
  - Turn castShadow off on flat cards.

### B. iso-infographic (cute variant)
- **Look:** orthographic camera at 35.26° / 45° with flat three-tone blocks (top, left and right faces at 100%, 80% and 65% value). Use a pastel paper background and thin ink labels on leader lines.
- **Native moves:** a block lifts its lid or cuts away to show the inside. Isotype rows fill one icon per sound.
- **Build:** three.js OrthographicCamera plus box and extrude geometry with MeshBasicMaterial per face. This is cheap on CPU.
- **Music:** kalimba, marimba, woodblock, and one note per icon.
- **Pitfalls:**
  - Labels must not cross block edges.
  - Keep 3 tones per hue, no gradients.
  - Make the subject at least 1/3 of the frame height in a vertical frame.

### C. crayon-book (picture book)
- **Look:** warm paper (#f4efe3), wax strokes that stick to the paper tooth, colour that overshoots outlines, and dark outlines that are never black. Use a box of about a dozen crayons and at most one watercolour wash.
- **Motion:** drawn elements step at 12 fps and boil every 2 frames. Lines draw on in 0.4–0.9 s.
- **Native moves:** colouring is an action, and wax resist reveals a hidden message.
- **Type:** handwriting (Patrick Hand) written on.
- **Sound:** ukulele, music box, glockenspiel, plus crayon scribble foley.
- **Build:** a 2D canvas with a stroke ribbon function and a paper-tooth noise mask. This is cheap.
- **Pitfalls:**
  - The wash muddies light colouring.
  - Never use a dark subtitle box. Use a paper knock-out patch instead.

### D. midcentury-toon (myth-busting presenter)
- **Look:** 1950s flat colour printed slightly off its broken ink line, bean-headed presenter, limited animation (body holds, hands act), and geometric sets.
- **Native move:** a presenter points, and the diagram springs up beside them.
- **Music:** cool jazz (vibraphone, walking pizzicato bass, brushes, flute).
- **Build:** 2D canvas or SVG shapes. Cheap.

### E. lowpoly-island (tiny world)
- **Look:** an orthographic isometric faceted world. Everything arrives with a bounce and a note, and the music is event-driven: each growth event is a marimba or kalimba note.
- **Build:** three.js with flatShading.
- **Cost:** about 20 s per frame at 1080×1920 in swiftshader with the reference post-processing. Drop the post-processing and use MeshLambert for our engine.

### F. scifi-toon (weird facts)
- **Look:** thick boiling outlines, flat colour, a duo who react differently, and a glowing portal transition.
- **Sound:** theremin lead plus retro drum machine.
- **Use for:** truly bizarre facts, such as octopus blue blood.

### G. paper-popup
- **Look:** a pop-up book on a desk, with cut-paper actors that have white borders and sets that spring up when a page turns.
- **Sound:** paper foley (snap, crinkle, page swish).
- **Use for:** step-by-step "how it happens" stories, such as how a leaf changes.

## 3b. Practice findings (Oct 26)
- The Lemo demo engines are **hard-wired to 16:9**. Rendered at 1080×1920, the picture fills only the top band and leaves the rest black. Never render a Lemo demo directly for a reel. Port the *technique* (materials, colour logic, motion rules) into our vertical modules under reels/styles/<name>/.
- They work headless once three is installed in repos/lemo-opuscar/node_modules and playwright is symlinked as playwright-core. Missing gitignored fonts can be stubbed with core/fonts/*.woff2. WebGL demos take about 20 s per still on swiftshader.
- Vertical ports so far: reels/styles/crayon/ and reels/styles/iso/ (see each folder's STYLE_NOTES.md).

## 4. Rules from the Lemo DIRECTOR (apply to every reel)
- Pick a benchmark reference per reel: what to learn and what not to take.
- Hook in the first 3 s, one native move at the emotional peak, and an ending that echoes the opening.
- Use at least 4 different camera moves, each with a reason. Transitions happen inside the medium, never with default fades.
- **Sound is half the film:** ambience, foley and music layers, at least 2 near-silences before the turn, and 2 J- or L-cuts.
- Subtitle hold of at least max(1.8 s, line + 0.6 s). Subtitles never cover the subject.
- **Review loop:** contact sheet, a 0.2 s strip of the key action, and a full viewing. Make one fix round.
- Optional jury pass: a separate agent scores style fidelity, concept wow, motion, design, finish, sound and technical quality on a 1–10 scale and gives 5–10 fixes.

## 5. Proposal template (send to the user before building)
```
Topic: <title>
Style: <style>. Why: <one line linking the native move to the payoff>
Palette: <2–3 swatches>    Narrator: <voice>    Music: <instrument family>
Signature shot: <one sentence>
Stills: 3 attached (hook, signature, end card)
```

## 6. Style experiment (user plan, Oct 26)
Make a reel in every style, then study which performs best, and use the winner more often.
- tracking.csv now has `style` and `voice` columns. Fill them for every reel.
- Keep it fair: same 3 daily slots, rotate the style across slots and days so no style always gets the 8 AM slot.
- Compare on: 3-sec hold, average watch time, completion, shares and saves per reach (not raw views).
- Topic confounds style, so test each style on 2 different topics before calling a winner, and read results as directional (small sample).
- Styles built so far: cute3d (Cat Day), crayon (flamingo), iso (octopus), plus the legacy 3D look used Oct 27-31.

## 7. Rule update (user, Oct 26 evening)
Styles are no longer limited to cartoony. Mature illustrated looks are allowed (engraving, blueprint, ink-wash, woodcut, silkscreen, risograph, etc.). Still true: no realistic photos, no crude or budget-looking work, every claim sourced, stills approved before a new format is built.

## 8. VOICE RULE (user, Oct 26): ALWAYS use the female voice af_heart for every reel, with the exact settings of the approved leaf reel (specs/leaf.json: voice af_heart, speed and breath handling as in voice2.py). Never change the female voice settings. The user liked the leaf and clocks-go-back reels (both female) and disliked the male-voice turkey and wombat reels.
