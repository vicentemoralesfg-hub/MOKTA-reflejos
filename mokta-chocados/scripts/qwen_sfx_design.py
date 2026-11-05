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
  "impact": "violent car crash impact, 1.2 s. Layers: a heavy low sine thump sweeping 130 Hz down to 45 Hz with strong drive; a loud noise crunch band-passed sweeping 3000 Hz down to 900 Hz; metallic debris: noise band-passed around 4500 Hz repeated 8 times every 0.06 s with high jitter.",
  "glass": "car window glass shattering, 1.0 s. Layers: a sharp click transient; bright high noise band-passed 6000-9000 Hz decaying; many tiny glass shards: sine pings between 3000 and 7000 Hz repeated 12 times every 0.05 s with high jitter.",
  "whoosh": "fast cinematic swoosh transition, 0.45 s. Layers: noise band-passed with cutoff sweeping from 400 Hz up to 3500 Hz, slow attack (0.15 s) and quick decay; a softer pink noise low-passed sweep underneath.",
  "whoosh_long": "slow reverse-style whoosh rising into a cut, 0.9 s. Layers: noise band-passed sweeping 200 Hz up to 5000 Hz with long attack (0.7 s) and very short decay; a sine rising 80 Hz to 300 Hz with long attack.",
  "riser": "tension riser, 1.6 s. Layers: saw wave rising 110 Hz to 880 Hz low-passed opening 800 to 6000 Hz with long attack; noise high-passed rising cutoff 1000 to 8000 Hz with long attack; both end abruptly.",
  "boom": "cinematic sub bass drop boom for a big reveal, 1.4 s. Layers: sine sweeping 90 Hz down to 32 Hz long decay with drive; brown noise low-passed at 200 Hz short; a click transient for punch; reverb 0.3.",
  "cash": "cash register ka-ching, bright and happy, 0.8 s. Layers: a mechanical click and short noise burst (band-pass 2000 Hz) at start; then at 0.08 s two bell tones (sine) at 2637 Hz and 3520 Hz with long decay 0.6 s; light reverb.",
  "alarm": "danger warning buzzer, 0.9 s. Layers: square wave at 440 Hz pulsing (repeat 4 times every 0.22 s, length 0.14 s) low-passed at 3000 Hz; a second square at 554 Hz pulsing in the same rhythm, quieter.",
  "scan": "digital x-ray scanner sweep, 1.2 s. Layers: sine sweeping 300 Hz up to 1800 Hz with fm modulation (ratio 3, index 2); a soft triangle hum at 120 Hz; high-passed noise shimmer at 6000 Hz quiet.",
  "beep": "short UI confirmation beep, 0.15 s. Layers: sine at 1760 Hz with very fast attack and 0.12 s decay; a quieter sine at 2640 Hz.",
  "pop": "short bubbly UI pop for text appearing, 0.12 s. Layers: sine sweeping 300 Hz up to 900 Hz very short; a click transient.",
  "airbag": "airbag deploying, 0.9 s. Layers: explosive click and noise burst band-passed 800-2500 Hz with drive, very short; a low thump sine 100 Hz down to 50 Hz; then air hiss: noise high-passed at 4000 Hz from 0.05 s lasting 0.7 s decaying.",
  "water": "water flooding and bubbling, 1.5 s. Layers: brown noise low-passed at 600 Hz for the whole duration (rushing water); bubbles: sine sweeping 300 Hz up to 900 Hz very short (0.04 s) repeated 18 times every 0.07 s with high jitter.",
  "zap": "electrical short circuit spark, 0.6 s. Layers: crackle: click source repeated 14 times every 0.035 s with high jitter, high-passed at 2000 Hz; a buzzing saw at 120 Hz with drive, band-passed 1500 Hz, short.",
  "creak": "metal frame bending and creaking under stress, 1.2 s. Layers: saw wave sweeping 70 Hz to 55 Hz band-passed at 900 Hz with high q 6 and drive; fm tone 180 Hz to 140 Hz (ratio 1.41, index 4) slow attack; noise band-passed 2000 Hz quiet.",
  "stamp": "heavy rubber stamp hitting a table, punchy, 0.3 s. Layers: sine sweeping 160 Hz down to 60 Hz short with drive; noise burst low-passed 1500 Hz very short; click transient.",
  "tick": "tiny mechanical counter tick, 0.05 s. Layers: click transient high-passed at 3000 Hz; a very short sine at 4000 Hz.",
  "error": "negative buzzer, wrong answer, 0.5 s. Layers: two square waves at 220 Hz and 233 Hz sweeping down 15 percent, low-passed 2500 Hz, played twice (repeat 2, every 0.2 s).",
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

EXAMPLES = [
 ("explosion, 1.5 s. Layers: sub sine 70->30 Hz with drive; brown noise low-passed 400 Hz; crackling debris click repeated 10 times with jitter.",
  {"duration": 1.5, "layers": [
   {"source": "sine", "freq_start": 70, "freq_end": 30, "start": 0, "length": 1.2, "attack": 0.003, "decay": 1.0, "curve": "exp", "filter": {"type": "none", "cutoff_start": 0, "cutoff_end": 0, "q": 0.7}, "gain": 1.0, "drive": 0.6, "repeat": 1, "repeat_every": 0, "jitter": 0},
   {"source": "brown", "freq_start": 0, "freq_end": 0, "start": 0, "length": 1.4, "attack": 0.005, "decay": 1.2, "curve": "exp", "filter": {"type": "lowpass", "cutoff_start": 400, "cutoff_end": 150, "q": 0.7}, "gain": 0.8, "drive": 0.3, "repeat": 1, "repeat_every": 0, "jitter": 0},
   {"source": "click", "freq_start": 0, "freq_end": 0, "start": 0.1, "length": 0.02, "attack": 0.0005, "decay": 0.02, "curve": "exp", "filter": {"type": "highpass", "cutoff_start": 1500, "cutoff_end": 1500, "q": 0.7}, "gain": 0.4, "drive": 0, "repeat": 10, "repeat_every": 0.08, "jitter": 0.8}],
   "reverb": 0.35}),
 ("phone notification ding, 0.4 s. Layers: two bell sines at 1320 Hz and 1980 Hz with long decay.",
  {"duration": 0.4, "layers": [
   {"source": "sine", "freq_start": 1320, "freq_end": 1320, "start": 0, "length": 0.4, "attack": 0.002, "decay": 0.35, "curve": "exp", "filter": {"type": "none", "cutoff_start": 0, "cutoff_end": 0, "q": 0.7}, "gain": 0.8, "drive": 0, "repeat": 1, "repeat_every": 0, "jitter": 0},
   {"source": "sine", "freq_start": 1980, "freq_end": 1980, "start": 0.06, "length": 0.34, "attack": 0.002, "decay": 0.3, "curve": "exp", "filter": {"type": "none", "cutoff_start": 0, "cutoff_end": 0, "q": 0.7}, "gain": 0.5, "drive": 0, "repeat": 1, "repeat_every": 0, "jitter": 0}],
   "reverb": 0.1}),
]
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
        shots = [{"role": "user", "content": SCHEMA + "\n\nSound: " + EXAMPLE_IN}, {"role": "assistant", "content": EXAMPLE_OUT}]
        for q, a in EXAMPLES:
            shots += [{"role": "user", "content": "Sound: " + q}, {"role": "assistant", "content": json.dumps(a)}]
        raw = ask([sys_msg] + shots + [{"role": "user", "content": "Sound: " + desc + " Follow the listed layers and use audible frequencies."}])
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
