# MOKTA TTS — instalador para Windows (PowerShell). Uso:
#   powershell -ExecutionPolicy Bypass -File instalar.ps1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
  Write-Host "→ Instalando uv (gestor de Python, gratuito)…"
  powershell -ExecutionPolicy Bypass -c "irm https://astral.sh/uv/install.ps1 | iex"
  $env:Path = "$env:USERPROFILE\.local\bin;$env:Path"
}

Write-Host "→ Creando entorno Python 3.12 en .venv"
uv venv -p 3.12 .venv
. .\.venv\Scripts\Activate.ps1

$hasNvidia = $false
try { nvidia-smi | Out-Null; $hasNvidia = $LASTEXITCODE -eq 0 } catch {}
if ($hasNvidia) {
  Write-Host "→ GPU NVIDIA detectada"
  uv pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu128
} else {
  Write-Host "→ Sin GPU NVIDIA: modo CPU (funciona, pero más lento)"
  uv pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
}
uv pip install -r requirements.txt

Write-Host "→ Descargando modelos Qwen3-TTS (≈ 9 GB, una sola vez)…"
python -m mokta_tts.descargar
python -m mokta_tts.doctor
Write-Host "`nListo. Prueba:  .\.venv\Scripts\Activate.ps1; python -m mokta_tts.generate guiones\ejemplo.md"
