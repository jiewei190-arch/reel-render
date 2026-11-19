# CC0 prop library: licences

Everything in this folder is **CC0 1.0 Universal** (public domain dedication, https://creativecommons.org/publicdomain/zero/1.0/).
No CC-BY, no "personal use only", no attribution requirement. Credit is given here as a courtesy.

- **Props and sets only.** Each pack's characters, mannequins, figurines and animals were left out. The cast stays our own `src/blocky/Blocky.tsx` characters.
- **Formats.** Only glTF binary (`.glb`) files are shipped.
- **Kenney GLBs.** These reference `Textures/colormap.png` (or `variation-*.png`) in their own pack folder, so keep each pack folder intact.
- **OBJ-only packs.** The OBJ-only packs (Kenney Furniture, Quaternius Furniture Vol.2 and Car Pack) were converted to GLB with our own `tools/obj2glb.py`.

**Rebuild:**
- Run `bash tools/fetch_cc0.sh`. It downloads the same zips, checks their sha256, unzips them and runs `tools/cc0_build.py`.
- Then run `bash tools/asset_sheet.sh` to check facing and scale.

**Licence check (2026-11-18):**
- Every Kenney zip contains `License.txt`, which reads "License: (Creative Commons Zero, CC0) http://creativecommons.org/publicdomain/zero/1.0/". A copy sits in each `kenney-*/` folder.
- Each OpenGameArt page lists the licence as **CC0**.
- The two Quaternius zips have no licence file inside. Their OGA pages say CC0, and quaternius.com marks every pack page "CC0" with a link to the CC0 deed (https://quaternius.com/license.html).

| Folder | Pack (author) | Source downloaded | Author site | Licence evidence | Assets used |
|---|---|---|---|---|---|
| `kenney-mini-shop/` | Mini Shop 2.1 (Kenney) | https://opengameart.org/content/mini-shop | https://kenney.nl | OGA: CC0; License.txt: CC0 | registers, shelves, displays, freezers, cart, basket, walls, floor |
| `kenney-mini-arcade/` | Mini Arcade 1.0 (Kenney) | https://opengameart.org/content/mini-arcade | https://kenney.nl | OGA: CC0; License.txt: CC0 | slot machine, prize wheel, claw machine, vending machine, register |
| `kenney-platformer/` | Platformer Kit (Kenney) | https://opengameart.org/content/platformer-kit | https://kenney.nl | OGA: CC0; License.txt: CC0 | gold/silver/bronze coins, jewel, key, crates, flag, sign |
| `kenney-survival/` | Survival Kit (Kenney) | https://opengameart.org/content/survival-kit | https://kenney.nl | OGA: CC0; License.txt: CC0 | chest, boxes, bucket, signpost, workbench |
| `kenney-car/` | Car Kit 3.1 (Kenney) | https://opengameart.org/content/car-kit | https://kenney.nl | OGA: CC0; License.txt: CC0 | sedan, sports, SUV, taxi, van, truck, cone, debris |
| `kenney-city-commercial/` | City Kit (Commercial) 2.1 (Kenney) | https://opengameart.org/content/city-kit-commercial | https://kenney.nl | OGA: CC0; License.txt: CC0 | shop buildings, office towers, awning, parasol |
| `kenney-city-suburban/` | City Kit (Suburban) 2.0 (Kenney) | https://opengameart.org/content/city-kit-suburban | https://kenney.nl | OGA: CC0; License.txt: CC0 | houses, trees, fence, planter |
| `kenney-city-roads/` | City Kit (Roads) 2.2 (Kenney) | https://opengameart.org/content/city-kit-roads | https://kenney.nl | OGA: CC0; License.txt: CC0 | road tiles, street/traffic lights, barrier, dumpster |
| `kenney-food/` | Food Kit (Kenney) | https://opengameart.org/content/food-kit | https://kenney.nl | OGA: CC0; License.txt: CC0 | coffee, burger, fries, pizza box, soda, donut, cake |
| `kenney-prototype/` | Prototype Kit (Kenney) | https://opengameart.org/content/prototype-kit | https://kenney.nl | OGA: CC0; License.txt: CC0 | plinth, ramp, stairs |
| `kenney-furniture/` | Furniture Kit, 2017 OBJ release (Kenney), converted to GLB | https://opengameart.org/content/furniture-kit | https://kenney.nl | OGA: CC0; License.txt: CC0 | TV, desk, monitor, laptop, beds, sofa, kitchen, washer, lamps |
| `quaternius-furniture2/` | Furniture Pack Vol.2 (Quaternius), converted to GLB | https://opengameart.org/content/low-poly-furniture-1 | https://quaternius.com | OGA: CC0; quaternius.com: CC0 | big sofa, stool |
| `quaternius-cars/` | Car Pack (Quaternius), converted to GLB | https://opengameart.org/content/lowpoly-cars | https://quaternius.com/packs/cars.html | OGA: CC0; quaternius.com: CC0 | taxi, basic car, short car, race car |

The exact zip files and their sha256 are listed in `tools/fetch_cc0.sh`. The full per-asset list (id, tags, size in metres) is in `catalog.json`.
