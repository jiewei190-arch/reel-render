"""Queue Wan 2.2 TI2V-5B first+last-frame takes on a local ComfyUI server and collect the frames.

python run_wan.py --server http://127.0.0.1:8190 --first key_first.png --last key_last.png \
    --prompt "..." --seeds 11 22 33 44 --length 73 --size 640 --steps 24 --out work/takes
Input images must already be in ComfyUI's --input-directory (pass the file names).
Writes work/takes/seed<N>/frame_00000.png ... and timing.json.
"""
import argparse, json, os, time, urllib.request, uuid, shutil

NEG = ("blurry, low quality, distorted, deformed, extra limbs, extra fingers, melting, morphing, changing character, "
       "different character, realistic, 3d render, photo, text, watermark, background objects, scenery, shadow on background, "
       "camera movement, zoom, color shift")


def post(server, path, data):
    req = urllib.request.Request(server + path, data=json.dumps(data).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


def get(server, path):
    with urllib.request.urlopen(server + path) as r:
        return json.loads(r.read())


def graph(a, seed, prefix):
    return {
        "1": {"class_type": "UNETLoader", "inputs": {"unet_name": "wan2.2_ti2v_5B_fp16.safetensors", "weight_dtype": "default"}},
        "2": {"class_type": "CLIPLoader", "inputs": {"clip_name": "umt5_xxl_fp8_e4m3fn_scaled.safetensors", "type": "wan", "device": "default"}},
        "3": {"class_type": "VAELoader", "inputs": {"vae_name": "wan2.2_vae.safetensors"}},
        "4": {"class_type": "CLIPTextEncode", "inputs": {"text": a.prompt, "clip": ["2", 0]}},
        "5": {"class_type": "CLIPTextEncode", "inputs": {"text": NEG, "clip": ["2", 0]}},
        "6": {"class_type": "LoadImage", "inputs": {"image": a.first}},
        "7": {"class_type": "LoadImage", "inputs": {"image": a.last}},
        "8": {"class_type": "Wan22FirstLastLatent", "inputs": {"vae": ["3", 0], "width": a.size, "height": a.size,
                                                               "length": a.length, "start_image": ["6", 0], "end_image": ["7", 0]}},
        "9": {"class_type": "ModelSamplingSD3", "inputs": {"model": ["1", 0], "shift": a.shift}},
        "10": {"class_type": "KSampler", "inputs": {"model": ["9", 0], "seed": seed, "steps": a.steps, "cfg": a.cfg,
                                                    "sampler_name": "uni_pc", "scheduler": "simple", "positive": ["4", 0],
                                                    "negative": ["5", 0], "latent_image": ["8", 0], "denoise": 1.0}},
        "11": {"class_type": "VAEDecode", "inputs": {"samples": ["10", 0], "vae": ["3", 0]}},
        "12": {"class_type": "SaveImage", "inputs": {"images": ["11", 0], "filename_prefix": prefix}},
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--server", default="http://127.0.0.1:8190")
    ap.add_argument("--comfy-out", required=True, help="ComfyUI --output-directory")
    ap.add_argument("--first", required=True); ap.add_argument("--last", required=True)
    ap.add_argument("--prompt", required=True)
    ap.add_argument("--seeds", type=int, nargs="+", default=[11, 22, 33, 44])
    ap.add_argument("--length", type=int, default=73); ap.add_argument("--size", type=int, default=640)
    ap.add_argument("--steps", type=int, default=24); ap.add_argument("--cfg", type=float, default=5.0)
    ap.add_argument("--shift", type=float, default=8.0)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    timing = {}
    for seed in a.seeds:
        prefix = f"stir_s{seed}_{uuid.uuid4().hex[:6]}"
        t0 = time.time()
        pid = post(a.server, "/prompt", {"prompt": graph(a, seed, prefix), "client_id": "cozy"})["prompt_id"]
        while True:
            h = get(a.server, f"/history/{pid}")
            if pid in h:
                st = h[pid].get("status", {})
                if st.get("status_str") == "error":
                    raise SystemExit(f"seed {seed} failed: {json.dumps(st)[:1500]}")
                if st.get("completed"):
                    break
            time.sleep(3)
        dt = time.time() - t0
        imgs = sorted(i["filename"] for o in h[pid]["outputs"].values() for i in o.get("images", []))
        d = os.path.join(a.out, f"seed{seed}")
        os.makedirs(d, exist_ok=True)
        for k, f in enumerate(imgs):
            shutil.move(os.path.join(a.comfy_out, f), os.path.join(d, f"frame_{k:05d}.png"))
        timing[seed] = round(dt, 1)
        print(f"seed {seed}: {len(imgs)} frames in {dt:.0f} s", flush=True)
    json.dump({"seconds_per_take": timing, "length": a.length, "size": a.size, "steps": a.steps, "cfg": a.cfg,
               "shift": a.shift, "prompt": a.prompt}, open(os.path.join(a.out, "timing.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
