#!/usr/bin/env bash
# MOKTA TTS — instalador para macOS / Linux. Uso:  bash instalar.sh
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v uv >/dev/null 2>&1; then
  echo "→ Instalando uv (gestor de Python, gratuito)…"
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
fi

echo "→ Creando entorno Python 3.12 en .venv"
uv venv -p 3.12 .venv
source .venv/bin/activate

OS="$(uname -s)"
if command -v nvidia-smi >/dev/null 2>&1 && nvidia-smi >/dev/null 2>&1; then
  echo "→ GPU NVIDIA detectada: $(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader | head -1)"
  uv pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu128
  HW=cuda
elif [ "$OS" = "Darwin" ]; then
  echo "→ macOS detectado (Apple Silicon usa aceleración MPS)"
  uv pip install torch torchaudio
  HW=mps
else
  echo "→ Sin GPU compatible: modo CPU (funciona, pero más lento)"
  uv pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
  HW=cpu
fi

uv pip install -r requirements.txt

if [ "$HW" = "cuda" ] && [ "$OS" = "Linux" ]; then
  echo "→ Intentando instalar FlashAttention 2 (opcional; si falla se usa SDPA)…"
  MAX_JOBS=4 uv pip install flash-attn --no-build-isolation || echo "   (flash-attn no disponible, se continúa con SDPA)"
fi

echo "→ Descargando modelos Qwen3-TTS (≈ 9 GB, una sola vez)…"
python -m mokta_tts.descargar

echo "→ Verificación"
python -m mokta_tts.doctor
echo
echo "Listo. Prueba:  source .venv/bin/activate && python -m mokta_tts.generate guiones/ejemplo.md"
