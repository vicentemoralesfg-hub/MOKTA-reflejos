"""Descarga los modelos necesarios a ./models (gratis, Hugging Face)."""
from huggingface_hub import snapshot_download
from .paths import MODELS

REPOS = ["Qwen/Qwen3-TTS-12Hz-1.7B-Base",          # producción (clonación de la voz MOKTA)
         "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign"]   # diseñar voces nuevas / rehacer casting

if __name__ == "__main__":
    MODELS.mkdir(parents=True, exist_ok=True)
    for r in REPOS:
        print("↓", r)
        snapshot_download(r, local_dir=str(MODELS / r.split("/")[1]))
    # Whisper para el control de calidad (se cachea en ~/.cache/huggingface)
    from faster_whisper import WhisperModel
    print("↓ Whisper large-v3-turbo (control de calidad)")
    WhisperModel("large-v3-turbo", device="cpu", compute_type="int8")
    print("Modelos listos en", MODELS)
