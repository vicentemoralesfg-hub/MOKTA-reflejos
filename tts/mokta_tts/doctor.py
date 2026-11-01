"""Diagnóstico: hardware, configuración elegida y estado de modelos/voz."""
import json
from .device import pick_device
from .paths import MODELS, VOICES

if __name__ == "__main__":
    d = pick_device()
    print("Hardware:", json.dumps(d["info"], ensure_ascii=False))
    print(f"Configuración: device={d['device']} dtype={d['dtype']} atención={d['attn']}")
    if d["device"] == "cpu":
        print("  ⚠ CPU: ~6-20 s de cómputo por segundo de audio. Usa --takes 2 para borradores.")
    elif d.get("vram_gb") and d["vram_gb"] < 8:
        print("  ⚠ VRAM < 8 GB: usa --batch 1")
    for m in ["Qwen3-TTS-12Hz-1.7B-Base", "Qwen3-TTS-12Hz-1.7B-VoiceDesign"]:
        ok = (MODELS / m / "model.safetensors").exists()
        print(f"Modelo {m}: {'OK' if ok else 'FALTA (python -m mokta_tts.descargar)'}")
    for v in sorted(VOICES.glob("*/voice.json")):
        print("Voz disponible:", v.parent.name)
