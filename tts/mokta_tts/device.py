"""Detección de hardware y elección de configuración óptima."""
from __future__ import annotations
import os, platform
import torch


def pick_device(force: str | None = None) -> dict:
    """Devuelve dict con device, dtype, attn e info de hardware."""
    force = force or os.environ.get("MOKTA_DEVICE")
    info = {"platform": platform.platform(), "cpu_threads": os.cpu_count()}
    if (force in (None, "cuda")) and torch.cuda.is_available():
        props = torch.cuda.get_device_properties(0)
        vram = props.total_memory / 1024**3
        bf16 = torch.cuda.is_bf16_supported()
        attn = "sdpa"
        try:
            import flash_attn  # noqa: F401
            if bf16:
                attn = "flash_attention_2"
        except Exception:
            pass
        info.update(gpu=props.name, vram_gb=round(vram, 1))
        return dict(device="cuda:0", dtype=torch.bfloat16 if bf16 else torch.float16,
                    attn=attn, vram_gb=vram, info=info)
    if (force in (None, "mps")) and getattr(torch.backends, "mps", None) and torch.backends.mps.is_available():
        info.update(gpu="Apple Silicon (MPS)")
        # float32 en MPS: bf16 tiene soporte parcial y produce artefactos/errores en algunos ops
        return dict(device="mps", dtype=torch.float32, attn="sdpa", vram_gb=None, info=info)
    torch.set_num_threads(max(1, os.cpu_count() or 1))
    return dict(device="cpu", dtype=torch.float32, attn="sdpa", vram_gb=None, info=info)


def whisper_config(dev: dict) -> dict:
    if dev["device"].startswith("cuda"):
        return dict(device="cuda", compute_type="float16")
    return dict(device="cpu", compute_type="int8")
