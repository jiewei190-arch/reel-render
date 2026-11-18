# Finance channel cast (recurring, all 5 Shorts)

Code: `cast/src/library/characters.ts` is the blocky-shorts skill's `src/library/characters.ts` with the finance cast
appended (`SAVER`, `SPENDER`, `PENNY`, `TELLER`, `LENDER`, `FIN_CAST`, `FIN_SCALE`, `FIN_PAL`). In a Short's project
(a copy of `skills/blocky-shorts/template/`), copy it over `src/library/characters.ts`. Typechecked against the
template (`npm ci && npx tsc --noEmit`: 0 errors).

Rule: **one main colour + one accessory each**, never swapped, so viewers learn them. Original characters of the blocky
family only; no game avatars, no real people, no brands or logos on clothes, props, cards or bills.

| name | main colour | accessory | print | scale | role in stories |
|---|---|---|---|---|---|
| SAVER | cash green `#1f9e4f` (skin `#3fc46a`) | round glasses (black) | ring (coin) | 1.0 | patient one: jars, calendars, explains the maths |
| SPENDER | hot red `#d62a2a` (skin `#ff5a4f`) | shoulder bag (gold) | heart | 1.0 | impulsive one: shopping, cards, "later" |
| PENNY | copper `#c4642a` (skin `#e08a4a`) | rocket backpack | star | 0.72 | the kid / the coin courier / the penny that grows |
| TELLER | violet `#7a4ad8` (skin `#a07af0`) | apron (pale lilac) | bow | 0.9 | behind the counter: statements, receipts, price tags |
| LENDER | navy blue `#2a4fb0` (skin `#4f7fe8`) | hat (navy, gold band) | bolt | 1.15 | card lender / interest collector in debt stories (never a real bank) |

Shared trims: dark pants `#2a2a3a`, white or dark shoes, gold cuffs. Palette for props: `FIN_PAL` (cash green,
debt red, coin gold, copper, ink, paper, night).

Who appears where:

| Short | cast |
|---|---|
| penny-doubles | PENNY, SPENDER, TELLER, SAVER |
| rule-of-72 | SAVER, PENNY, SPENDER, LENDER |
| minimum-payment-trap | SPENDER, LENDER, TELLER, SAVER |
| dollar-1970 | SPENDER, TELLER, SAVER |
| ten-beats-thirty | SAVER, SPENDER, PENNY |

Props: from `src/library/props.tsx` (Jar, Tag, HoloTag, Sign, NeonSign, Counter, Card, Podium, ShelfUnit). New props
the scenes need (to build on the PC side, same blocky style): a coin (copper/gold disc), coin stacks, a plain bill
block (green, no portrait or seal), a wall calendar with flipping pages, a toll booth, a chart board with a block line,
a big blocky clock.
