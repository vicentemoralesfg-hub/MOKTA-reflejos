from pathlib import Path
import os
ROOT = Path(__file__).resolve().parent.parent
MODELS = Path(os.environ.get("MOKTA_MODELS", ROOT / "models"))
VOICES = ROOT / "voices"
