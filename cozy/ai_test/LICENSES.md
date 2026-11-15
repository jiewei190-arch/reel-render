# Licenses for the AI motion test (checked 2026-11-15)
Everything here is free and runs locally on the owner's PC: no paid API, no cloud credits, no logins.
I found all of the models below already installed on the PC (Comfy Desktop), so nothing new was downloaded for this test.

| Component | Where it is on the PC | License | Commercial use | How it was checked |
|---|---|---|---|---|
| ComfyUI 0.42.3 (app / engine) | `%LOCALAPPDATA%\Comfy-Desktop\ComfyUI-Installs\Horror Factory\ComfyUI` | GPL-3.0 | Yes. GPL covers the software, not the videos it outputs | `LICENSE` file in the install |
| Wan 2.2 TI2V-5B weights `wan2.2_ti2v_5B_fp16.safetensors` | `ComfyUI-Shared\models\diffusion_models` | Apache-2.0 | Yes | Hugging Face model cards: Wan-AI/Wan2.2-TI2V-5B (`license: apache-2.0`) and the Comfy-Org/Wan_2.2_ComfyUI_Repackaged card (`license: apache-2.0`) |
| Wan 2.2 VAE `wan2.2_vae.safetensors` | `ComfyUI-Shared\models\vae` | Apache-2.0 | Yes | Same Comfy-Org Wan 2.2 repackage card |
| Text encoder `umt5_xxl_fp8_e4m3fn_scaled.safetensors` | `ComfyUI-Shared\models\text_encoders` | Apache-2.0 (Comfy-Org Wan 2.1 repackage; Google UMT5 is Apache-2.0) | Yes | HF API tags for Comfy-Org/Wan-2.1: `license:apache-2.0` |
| DINOv2 ViT-L/14 reg4 (drift scoring only, not in the video) | `~\.cache\torch\hub` | Apache-2.0 | Yes | `LICENSE` in `facebookresearch_dinov2_main` |
| PyTorch, NumPy, SciPy, Pillow | ComfyUI venv / system Python | BSD-style / HPND | Yes | standard package licenses |
| FFmpeg 9.0.2 (Gyan full build, encoding only) | WinGet package | GPL-3 build | Yes. The tool's license doesn't cover its output | package name |
| youtube-transcript-api 1.2.5 (research only) | scratch venv | MIT | Yes | `pip show` |
| `tools/comfy_nodes/wan22_first_last.py` and `tools/*.py` | this repo | written for this project | n/a | — |

Not used:
- **ToonCrafter**: skipped. Its weights aren't on the PC, and their license would need checking first.
- **Real-ESRGAN**: not on the PC; the 640 px AI layer is scaled up with Lanczos instead. If wanted, Real-ESRGAN anime (BSD-3) would be a ~17 MB download that needs the owner's OK.
- **Wan 2.2 I2V-14B / Wan 2.1 FLF2V-14B**: not on the PC (~20 GB download). The 5B model plus the custom first+last-frame node did the job without it.

Owner's art: `cozy/owner_character/*` belongs to the owner and is used with their permission (README in that folder).
