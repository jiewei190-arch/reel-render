STATE: ready

# Justin 3D: status

All deliverables are in `justinclips/justin3d/` on branch `justinclips/justin3d`:

| Deliverable | Status |
|---|---|
| `justin.blend` | Rigged character (body + 24 face controls), camera, lights. Rebuild: `blender -b --factory-startup --python build_justin.py` |
| `turnaround.png` | Front, 3/4, side |
| `expressions.png` | Smile, smirk, shock, cringe, skeptical, angry, sad, laugh |
| `test.mp4` | 1080x1920, 8 s. Pop-in, double take, lip-synced line "Two cities went to war over a bucket.", shrug, smirk |
| `render_justin.py` | Headless pose/expression sequence + audio lip sync. Green, transparent (ProRes 4444) or studio background |
| `concept_vs_render.png` | Concept D next to the 3D render, wave pose |
| `preview_exploding_whale.mp4` | The exploding-whale Short with four Justin reaction cut-ins. 25.8 s, 1080x1920, 24 fps. Original audio copied (-14.1 LUFS measured). Justin stays in the lower third, clear of all captions. Hard cut at the end so the loop works |
| `README.md` | Usage, sequence format, rig, licenses (all free for commercial use) |

## QA done
- Checked at phone size: poses and expressions read clearly (shock, brows up, cringe, smirk, all 8 sheet expressions).
- Lip sync follows the voice line.
- Fixed earlier: sleeve candy-wrap, jacket streaks, hidden open mouths, crossed-arm pose drift, washed-out colours.
- Nothing was posted or uploaded anywhere. Files are only committed to this branch.

## Known differences from concept D (worth a follow-up pass)
- **Hair.** Reads as a tall, smooth "crown" of clumps. The concept has a looser, tousled quiff with separate strands.
- **Jacket.** A lighter sage-olive than the concept's deep olive, and the hem rib is subtle.
- **Ears.** Slightly boxy.
- **Lining.** Small orange specks can show at the elbows in strong bends.
- **Shoes.** The laces are grey knit-style. The concept has a dark upper with white laces.

## Voice
`test_line.wav` is a placeholder (Kokoro TTS, Apache-2.0). Swap in the channel's chosen voice: `--audio vo.wav`.
