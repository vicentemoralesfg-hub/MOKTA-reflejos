#!/usr/bin/env python3
"""
Diseño de efectos con Qwen3 (Qwen/Qwen3-1.7B, pesos abiertos, CPU).

Qwen3 recibe la descripción de cada efecto y devuelve una RECETA de síntesis en JSON
(capas de oscilador/ruido, barridos de frecuencia, envolventes, filtros, distorsión, repeticiones).
scripts/render_sfx.py convierte esas recetas en WAV. El resultado queda en assets/sfx_recipes.json.

Uso: python scripts/qwen_sfx_design.py <ruta_modelo_qwen3>
"""
import json, os, re, sys, time
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = sys.argv[1] if len(sys.argv) > 1 else "Qwen/Qwen3-1.7B"
torch.manual_seed(11)
torch.set_num_threads(os.cpu_count() or 4)

SOUNDS = {
  "impact": "violent car crash impact: deep metallic thud with crunching sheet metal, 1.2 s",
  "glass": "car window glass shattering, bright tinkling shards falling, 1.0 s",
  "whoosh": "fast cinematic swoosh transition, air rushing past, 0.45 s",
  "whoosh_long": "slow reverse-style whoosh rising into a cut, 0.9 s",
  "riser": "tension riser, rising pitch noise and tone building suspense, 1.6 s",
  "boom": "cinematic sub bass drop boom for a big reveal, 1.4 s",
  "cash": "cash register ka-ching with coin bell, bright and happy, 0.8 s",
  "alarm": "danger warning buzzer, harsh pulsing alarm, 0.9 s",
  "scan": "digital x-ray scanner sweep, futuristic hum with a rising sweep, 1.2 s",
  "beep": "short UI confirmation beep, clean electronic, 0.15 s",
  "pop": "short bubbly UI pop for text appearing, 0.12 s",
  "airbag": "airbag deploying: sharp explosive pop followed by air hiss, 0.9 s",
  "water": "water flooding and bubbling, underwater gurgle, 1.5 s",
  "zap": "electrical short circuit spark zap crackle, 0.6 s",
  "creak": "metal frame bending and creaking under stress, low groan, 1.2 s",
  "stamp": "heavy rubber stamp hitting paper, punchy thud, 0.3 s",
  "tick": "tiny mechanical counter tick, 0.04 s",
  "error": "negative buzzer, wrong answer, low descending tone, 0.5 s",
}

SCHEMA = """Return ONLY a JSON object (no prose) with this exact shape:
{"duration": seconds,
 "layers": [
   {"source": "sine"|"square"|"saw"|"triangle"|"noise"|"pink"|"brown"|"fm"|"click",
    "freq_start": Hz, "freq_end": Hz,            // pitch sweep (ignored for noise)
    "fm_ratio": number, "fm_index": number,       // only for "fm"
    "start": seconds, "length": seconds,
    "attack": seconds, "decay": seconds, "curve": "exp"|"lin",
    "filter": {"type": "lowpass"|"highpass"|"bandpass"|"none", "cutoff_start": Hz, "cutoff_end": Hz, "q": number},
    "gain": 0..1, "drive": 0..1,                  // drive = saturation
    "repeat": integer, "repeat_every": seconds,   // for pulsing / crackles
    "jitter": 0..1 }                              // randomness for debris, crackle, bubbles
 ],
 "reverb": 0..1}
Use 2 to 5 layers. Combine layers to make the sound realistic and punchy."""

EXAMPLE_IN = "door slam: solid low thump with a short rattle, 0.5 s"
EXAMPLE_OUT = json.dumps({"duration": 0.5, "layers": [
  {"source": "sine", "freq_start": 90, "freq_end": 45, "start": 0, "length": 0.35, "attack": 0.002, "decay": 0.3, "curve": "exp",
   "filter": {"type": "none", "cutoff_start": 0, "cutoff_end": 0, "q": 0.7}, "gain": 0.9, "drive": 0.3, "repeat": 1, "repeat_every": 0, "jitter": 0},
  {"source": "noise", "freq_start": 0, "freq_end": 0, "start": 0, "length": 0.12, "attack": 0.001, "decay": 0.1, "curve": "exp",
   "filter": {"type": "bandpass", "cutoff_start": 1800, "cutoff_end": 900, "q": 1.2}, "gain": 0.5, "drive": 0, "repeat": 3, "repeat_every": 0.05, "jitter": 0.4}],
  "reverb": 0.15})

MUSIC_PROMPT = """Design a 16-step pattern (one bar of 4/4 at 124 BPM) for a modern, energetic social-media
explainer track about cars (trap/electronic hybrid). Return ONLY JSON:
{"bpm": 124, "key_root_hz": number,
 "kick": [16 values 0/1], "snare": [16 values 0/1], "hat": [16 values 0/1], "open_hat": [16 values 0/1],
 "bass": [16 values: semitone offset from root or null for rest],
 "chords": [4 arrays of semitone offsets, one chord per beat-group of 4 steps],
 "lead": [16 values: semitone offset or null]}"""

tok = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForCausalLM.from_pretrained(MODEL, torch_dtype=torch.bfloat16)
model.eval()


def ask(messages, max_new=700):
    text = tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True, enable_thinking=False)
    ids = tok(text, return_tensors="pt")
    with torch.no_grad():
        out = model.generate(**ids, max_new_tokens=max_new, do_sample=True, temperature=0.7, top_p=0.8, top_k=20)
    return tok.decode(out[0][ids["input_ids"].shape[1]:], skip_special_tokens=True)


def parse(s):
    s = re.sub(r"//.*", "", s)
    m = re.search(r"\{.*\}", s, re.S)
    if not m:
        raise ValueError("sin JSON")
    return json.loads(m.group(0))


OUT = os.path.join(ROOT, "assets", "sfx_recipes.json")
# reanudable: conserva lo ya diseñado
recipes = json.load(open(OUT)) if os.path.exists(OUT) else {"model": MODEL, "generated": time.strftime("%Y-%m-%d %H:%M"), "sounds": {}, "music": None}
save = lambda: json.dump(recipes, open(OUT, "w"), indent=1, ensure_ascii=False)
sys_msg = {"role": "system", "content": "You are an expert sound designer who writes synthesis recipes as strict JSON."}
for name, desc in SOUNDS.items():
    if name in recipes["sounds"]:
        continue
    for attempt in range(4):
        t0 = time.time()
        raw = ask([sys_msg,
                   {"role": "user", "content": SCHEMA + "\n\nSound: " + EXAMPLE_IN},
                   {"role": "assistant", "content": EXAMPLE_OUT},
                   {"role": "user", "content": "Sound: " + desc}])
        try:
            r = parse(raw)
            assert isinstance(r.get("layers"), list) and r["layers"]
            recipes["sounds"][name] = {"prompt": desc, "recipe": r, "raw": raw}
            save()
            print(f"[ok] {name} ({time.time()-t0:.0f}s, {len(r['layers'])} capas)", flush=True)
            break
        except Exception as e:
            print(f"[retry] {name}: {e}", flush=True)
for attempt in range(4 if not recipes.get("music") else 0):
    raw = ask([sys_msg, {"role": "user", "content": MUSIC_PROMPT}], 600)
    try:
        recipes["music"] = {"prompt": MUSIC_PROMPT, "pattern": parse(raw), "raw": raw}
        print("[ok] music", flush=True)
        break
    except Exception as e:
        print(f"[retry] music: {e}", flush=True)
save()
print("DONE")
