# blueprint kit notes

- **Fonts:** blueprint.js draws its title-block and callout lettering in "Poppins", but no Poppins file is in the repo, so pages without an @font-face for it fall back to a serif (lock and spidersilk rendered that way). Fix used in t_fridge.html: map the family to the repo's Inter:
  `@font-face{font-family:'Poppins';src:url('styles/distilbook/fonts/Inter.ttf');font-weight:100 900}`
- **Batch N layout:** the kit's `B.frame` header (y 104-232), `B.note` (y 1372-1690) and `B.titleBlock` (y 1722) sit in the platform UI bands. t_fridge.js shows one way round it: set `VP.y`/`VP.h` before `createBP`, draw your own header/title block at y 268-370, and a NOTE box at y 1158-1414.
- **Other paper:** `C.ink` and `C.paper` are mutable and read at call time, and `B.begin` can be replaced, so a reel can switch to a sepia/white-print sheet (t_fridge.js: sepia, brown ink, colour-coded refrigerant loop).
