# I.Awaken Test & Compare thumbnails (job THUMBS, Nov 8)

12 thumbnails, 3 per video, for YouTube Studio "Test & Compare". Each is 1280x720 JPG, 124-172 KB (the limit is 2 MB).
`contact_sheet_phone.png` shows all 12 at 320 px wide, which is phone size. Every title still reads at that size.

**Nothing was posted, uploaded or changed on YouTube.** The owner or the AI Village does the uploads in Studio.

## How they were made
- Kit: aiTrends 2D Studio. The project is `whatif/aitrends-2d-studio/projects/thumbs/`: 12 one-second "shots", one per thumbnail.
  - `scenes/hoodie/`: the mustard-hoodie hero (cast and sets from `short-blackhole`, including `space.js`). Used for Moon and Black Hole.
  - `scenes/stop/`: the Freeze Time cast and sets (`freeze.js` heroBigFace, `liquidArc` look, `morning.js` kitchen, `freezeGrade`).
  - `scenes/jump/`: the jump-double cast and sets (`sky.js`, `orbit.js`, `skyline.js`).
  - `scenes/thumbkit.js`: `bigText` (Fredoka 700, thick black outline, hard drop shadow, gradient fill), `eyeShine`
    (glowing eyes, as in See in the Dark), `burst` and `rimFrame`.
- Render at 1920x1080, then scale with Lanczos to 1280x720:
  `node render.mjs --project projects/thumbs --stills 0.5,1.5,...,11.5`. The shot at t = k + 0.5 is thumbnail k
  (moon v1-v3, stop v1-v3, jump v1-v3, bh v1-v3).
- Every variant follows the playbook formula: one giant hero face with a strong emotion and eyes catching the light, one big bright
  object that is the topic, and 2-3 huge outlined words.

## What each variant tests
Pick a winner on watch-time share. Then use the winning element on the next upload.

### 1. What If the Moon Disappeared Tomorrow? (`moon-disappeared/`)
This is the fix for the 2-view thumbnail, which had no face, no Moon and no text. All 3 variants add all of them.
| | Image | Text | Tests |
|---|---|---|---|
| v1 | Shocked face on the left, a cracked Moon bursting apart with light, a night town below | NO MOON? | Baseline: the Moon is visibly being destroyed |
| v2 | Terrified face, an empty dashed outline and "?" where the Moon used to be | NO MOON? | Same words. Does an absence (a mystery) beat destruction (spectacle)? |
| v3 | Face in the centre, the Moon crumbling away into dust behind | GONE TOMORROW? | Different words (time pressure, echoes the title) and a different layout |

### 2. What If You Could Freeze Time for 10 Seconds? (`freeze-time/`)
This episode's hero design: cowlick, round tortoiseshell glasses, teal/cream striped tee. The power is only the snap, so there is no
gadget and no clock symbol on the hero. Each variant has one face and one object. This fixes the clutter in the current
thumbnail: its prompt in `iawaken/out/stoptime/UPLOAD.md` asks for a snap ripple, a splash, a cat, a sister and a stopwatch all at once.
| | Image | Text | Tests |
|---|---|---|---|
| v1 | Amazed face, a big frozen juice splash hanging in the air, a blue-grey frozen kitchen | 10 SECONDS | Baseline: the frozen splash as the topic object |
| v2 | Smirking face, a giant snapping hand with the freeze ripple; inside the ring is frozen and blue, outside is warm | 10 SECONDS | Same words. Does the snap (the cause) beat the splash (the effect)? |
| v3 | Shocked face plus the frozen splash | TIME STOPS (white/cyan) | Same picture idea as v1, different words and colour: the concept versus the number |

### 3. What If Every Day Your Jump Doubled? (`jump-doubled/`)
The jump project's hero (mustard hoodie).
| | Image | Text | Tests |
|---|---|---|---|
| v1 | Shocked face up in the stratosphere, the hero leaping with wind streaks, Earth's haze below | x2 EVERY DAY | States the rule (the hook is the doubling) |
| v2 | Worried face at the edge of space, the Earth curving below, the hero lit from behind | NO WAY DOWN? | Danger and stakes (the ending question) |
| v3 | Thrilled face, the hero above the Burj-style supertall at golden hour | TOO HIGH? | Fun and spectacle, the only happy face of the set (does joy beat fear?) |

### 4. What If You Fell Into a Black Hole? (`black-hole/`)
The new episode coming on `iawaken/ep-blackhole`. Hoodie hero, the black hole from `space.js`.
| | Image | Text | Tests |
|---|---|---|---|
| v1 | Terrified face, a black hole, a small hero stretched like a noodle heading into it | SPAGHETTI? | Baseline: the funny, curious word |
| v2 | Shocked face, the black hole with a red dashed event-horizon ring | POINT OF / NO RETURN | Dread and stakes versus the funny word |
| v3 | The giant face itself stretched sideways toward the hole, with speed streaks | SPAGHETTI? | Same words as v1. Does the stretched face beat a normal face plus a tiny figure? |

## Notes for whoever uploads
- Test & Compare needs the video to be public, and it can take up to 2 weeks to pick a winner. Run one test per video at a time.
- Black Hole: if the episode's final hero design changes on `iawaken/ep-blackhole`, re-render with the same project. The look comes
  from `scenes/hoodie/cast.js` and `sets/faces.js`.
- Re-rendering in a cloud container: the kit pins playwright 1.56, so point `PLAYWRIGHT_BROWSERS_PATH` at a folder where
  `chromium_headless_shell-1194/chrome-linux/headless_shell` links to the installed headless shell. On the owner's PC the normal
  `npx playwright install chromium` works.
