"""ComfyUI custom node: first-AND-last-frame conditioning for Wan 2.2 TI2V-5B.

The stock Wan22ImageToVideoLatent only pins the start image. This node encodes a guide video
(start image, a crossfade, then the end image on the last 4 frames) with the Wan 2.2 VAE and pins
latent frame 0 AND the last latent frame (noise_mask = 0 there), so the sampler only invents the
in-between motion. Same latent layout and normalisation as the stock node.
"""
import torch
import comfy.utils
import comfy.latent_formats
import comfy.model_management


class Wan22FirstLastLatent:
    @classmethod
    def INPUT_TYPES(cls):
        return {"required": {
            "vae": ("VAE",),
            "width": ("INT", {"default": 640, "min": 32, "max": 4096, "step": 32}),
            "height": ("INT", {"default": 640, "min": 32, "max": 4096, "step": 32}),
            "length": ("INT", {"default": 73, "min": 9, "max": 1024, "step": 4}),
            "start_image": ("IMAGE",),
            "end_image": ("IMAGE",),
        }}

    RETURN_TYPES = ("LATENT",)
    FUNCTION = "build"
    CATEGORY = "model/conditioning/wan"

    def build(self, vae, width, height, length, start_image, end_image):
        dev = comfy.model_management.intermediate_device()
        up = lambda im: comfy.utils.common_upscale(im[:1].movedim(-1, 1), width, height, "bilinear", "center").movedim(1, -1)
        s, e = up(start_image), up(end_image)
        w = torch.linspace(0, 1, length).view(-1, 1, 1, 1)
        guide = s * (1 - w) + e * w
        guide[-4:] = e
        guide[0] = s[0]
        lat = vae.encode(guide[:, :, :, :3])                      # [1, 48, T, h, w]
        T = ((length - 1) // 4) + 1
        latent = torch.zeros([1, 48, T, height // 16, width // 16], device=dev)
        mask = torch.ones([1, 1, T, height // 16, width // 16], device=dev)
        latent[:, :, 0] = lat[:, :, 0].to(dev)
        latent[:, :, -1] = lat[:, :, -1].to(dev)
        mask[:, :, 0] = 0.0
        mask[:, :, -1] = 0.0
        latent = comfy.latent_formats.Wan22().process_out(latent) * mask + latent * (1.0 - mask)
        return ({"samples": latent, "noise_mask": mask},)


NODE_CLASS_MAPPINGS = {"Wan22FirstLastLatent": Wan22FirstLastLatent}
NODE_DISPLAY_NAME_MAPPINGS = {"Wan22FirstLastLatent": "Wan 2.2 First+Last Frame Latent (5B)"}
