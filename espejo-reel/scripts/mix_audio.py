#!/usr/bin/env python3
"""
MOKTA · Palanca del espejo — diseño sonoro y mezcla.

Entradas:
  public/audio/vo.wav            locución editada (scripts/prep_vo.py)
  source/musica_tomaB.mp3        música (ElevenLabs Music, instrumental)
  src/vo_words.json              tiempos por palabra (misma fuente que el video)

Salida:
  public/audio/soundtrack.wav    mezcla final 48 kHz estéreo (sin normalizar)
  public/audio/stems/*.wav       voz, música, efectos

Los efectos se sintetizan aquí (sin samples de terceros). Cada efecto se ancla a la
misma palabra que su animación en src/scenes/*, así la sincronía es exacta.
"""
import json
import os
import subprocess
import tempfile

import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
FPS = 30
rng = np.random.default_rng(11)

W = json.load(open(os.path.join(ROOT, "src", "vo_words.json")))["words"]


def wf(i):
    return round(W[i]["start"] * FPS)


def we(i):
    return round(W[i]["end"] * FPS)


TOTAL_F = we(len(W) - 1) + 48
N = int(TOTAL_F / FPS * SR)
MUSIC_OFFSET_S = 1.0  # la música arranca en su segundo 1: su final cae al cierre del CTA

# Cortes de escena (idénticos a src/timeline.ts)
CUTS = {
    "tab": wf(20) - 3,
    "error": wf(35) - 3,
    "fix": wf(50) - 5,
    "how": wf(68) - 5,
    "ec": wf(115) - 3,
    "day": wf(125) - 3,
    "cta": wf(134) - 4,
}


# ---------------------------------------------------------------- utilidades
def decode(path, ch):
    with tempfile.TemporaryDirectory() as td:
        out = os.path.join(td, "a.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-ac", str(ch), "-ar", str(SR),
                        "-c:a", "pcm_f32le", out], check=True)
        _, x = wavfile.read(out)
    x = x.astype(np.float64)
    return x if x.ndim == 2 else x[:, None]


def t(n):
    return np.arange(n) / SR


def env_exp(n, tau):
    return np.exp(-t(n) / tau)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, btype="low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, btype="high", fs=SR, output="sos"), x)


def norm(x, peak=1.0):
    m = np.max(np.abs(x)) + 1e-12
    return x / m * peak


def stereo(x, pan=0.0):
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    return np.stack([x * l * 1.414, x * r * 1.414], axis=1)


# ---------------------------------------------------------------- efectos
def sweep_noise(n, fc_of_k, width=0.9):
    """Ruido con una banda que se desplaza en el tiempo (máscara en STFT, sin clics)."""
    x = rng.standard_normal(n + 4096)
    f, tt, Z = signal.stft(x, fs=SR, nperseg=1024, noverlap=768)
    k = np.linspace(0, 1, Z.shape[1])
    fc = np.array([fc_of_k(v) for v in k])
    lf = np.log2(np.maximum(f, 20))[:, None]
    mask = np.exp(-((lf - np.log2(fc)[None, :]) / width) ** 2)
    _, y = signal.istft(Z * mask, fs=SR, nperseg=1024, noverlap=768)
    return y[:n]


def whoosh(dur=0.5, rising=True, bright=1.0):
    n = int(dur * SR)
    tt = np.linspace(0, 1, n)
    if rising:
        out = sweep_noise(n, lambda k: 300 + 3500 * bright * k ** 1.5)
        shape = np.clip(tt / 0.85, 0, 1) ** 2.2 * np.clip((1 - tt) / 0.15, 0, 1)
    else:
        out = sweep_noise(n, lambda k: 200 + 3800 * bright * (1 - k) ** 1.3)
        shape = np.clip(tt / 0.06, 0, 1) * (1 - tt) ** 1.6
    return norm(lp(out * shape, 10000), 1.0)


def swish(dur=0.32):
    """Barrido corto y simétrico para cortes de escena."""
    n = int(dur * SR)
    tt = np.linspace(0, 1, n)
    out = sweep_noise(n, lambda k: 500 + 4200 * np.sin(np.pi * k), 1.0)
    return norm(out * np.sin(np.pi * tt) ** 2, 1.0)


def impact(dur=1.2):
    n = int(dur * SR)
    tt = t(n)
    f0 = 58 * np.exp(-tt / 0.25) + 40
    sub = np.sin(2 * np.pi * np.cumsum(f0) / SR) * env_exp(n, 0.35)
    burst = lp(rng.standard_normal(n), 2500) * env_exp(n, 0.05)
    click = hp(rng.standard_normal(n), 3000) * env_exp(n, 0.006)
    return norm(sub * 1.0 + burst * 0.5 + click * 0.35, 1.0)


def mech_click(strength=1.0):
    """Clic mecánico de la palanca: ataque seco + cuerpo plástico + rebote."""
    n = int(0.16 * SR)
    tt = t(n)
    x = np.zeros(n)
    for delay, amp in ((0.0, 1.0), (0.028, 0.45)):
        d = int(delay * SR)
        m = n - d
        noise = bp(rng.standard_normal(m), 1800, 7500, 2) * env_exp(m, 0.0035)
        body = (np.sin(2 * np.pi * 1150 * t(m)) * 0.6 + np.sin(2 * np.pi * 2350 * t(m)) * 0.35) * env_exp(m, 0.012)
        knock = np.sin(2 * np.pi * 240 * t(m)) * env_exp(m, 0.02) * 0.5
        x[d:] += amp * (noise * 1.2 + body + knock)
    return norm(x, strength)


def pop(f0=900, f1=480, dur=0.09):
    n = int(dur * SR)
    tt = t(n)
    fr = f0 + (f1 - f0) * (tt / dur)
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * env_exp(n, dur / 3.5)
    x[: int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    return norm(x, 1.0)


def ding(base=1318.5, dur=1.1):
    n = int(dur * SR)
    tt = t(n)
    x = (np.sin(2 * np.pi * base * tt) + 0.5 * np.sin(2 * np.pi * base * 1.5 * tt) + 0.25 * np.sin(2 * np.pi * base * 2.0 * tt + 0.3)) * env_exp(n, 0.28)
    x += 0.4 * np.sin(2 * np.pi * base * 0.5 * tt) * env_exp(n, 0.12)
    x[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    return norm(x, 1.0)


def wrong_buzz(dur=0.42):
    n = int(dur * SR)
    tt = t(n)
    sq = signal.square(2 * np.pi * 98 * tt) * 0.6 + signal.square(2 * np.pi * 146.8 * tt) * 0.4
    x = lp(sq, 1400) * np.clip(1 - tt / dur, 0, 1) ** 0.7
    thud = np.sin(2 * np.pi * 70 * tt) * env_exp(n, 0.09)
    return norm(x * 0.7 + thud, 1.0)


def shimmer(dur=1.2, bright=1.0):
    n = int(dur * SR)
    tt = np.linspace(0, 1, n)
    x = hp(rng.standard_normal(n), 6000) * 0.5
    for fr in (2637, 3136, 3951, 5274):
        x += 0.18 * np.sin(2 * np.pi * fr * t(n) + rng.uniform(0, 6)) * (0.6 + 0.4 * np.sin(2 * np.pi * (7 + fr % 5) * t(n)))
    envl = np.clip(tt / 0.35, 0, 1) * np.clip((1 - tt) / 0.65, 0, 1)
    return norm(x * envl, bright)


def riser(dur=0.85):
    n = int(dur * SR)
    tt = np.linspace(0, 1, n)
    fr = 220 * (2 ** (tt * 3))
    tone = np.sin(2 * np.pi * np.cumsum(fr) / SR) * 0.4
    noise = hp(rng.standard_normal(n), 2000) * 0.5
    x = (tone + noise) * tt ** 2.4
    return norm(x, 1.0)


def beam_zap(dur=0.5):
    n = int(dur * SR)
    tt = np.linspace(0, 1, n)
    fr = 900 + 2200 * tt
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * tt) ** 1.5 * 0.6
    x += hp(rng.standard_normal(n), 5000) * np.sin(np.pi * tt) * 0.3
    return norm(x, 1.0)


def whoom_down(dur=0.7):
    n = int(dur * SR)
    tt = np.linspace(0, 1, n)
    fr = 500 * np.exp(-tt * 2.2) + 60
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * (1 - tt) ** 1.5
    x += lp(rng.standard_normal(n), 1200) * (1 - tt) ** 2 * 0.4
    return norm(x, 1.0)


def tick():
    n = int(0.03 * SR)
    x = bp(rng.standard_normal(n), 2500, 6000) * env_exp(n, 0.004)
    return norm(x, 1.0)


# ---------------------------------------------------------------- pista de efectos
sfx = np.zeros((N, 2))


def place(sound, frame, gain_db, pan=0.0, align="start"):
    """align: 'start' (empieza en el fotograma), 'end' (termina en él) o 'peak'."""
    x = sound if sound.ndim == 2 else stereo(sound, pan)
    i = int(frame / FPS * SR)
    if align == "end":
        i -= len(x)
    elif align == "peak":
        i -= int(np.argmax(np.abs(x).sum(axis=1)))
    a = max(0, i)
    b = min(N, i + len(x))
    if b <= a:
        return
    sfx[a:b] += x[a - i:b - i] * 10 ** (gain_db / 20)


# Gancho
place(shimmer(1.6, 1.0), 0, -21, 0.1)
place(whoosh(0.6, rising=False, bright=0.8), 0, -20)
place(shimmer(0.7), wf(6) - 2, -24, -0.3)
place(shimmer(0.7), wf(10) - 2, -24, 0.3)
place(impact(), wf(13) - 1, -9)
place(whoosh(0.5, rising=True), wf(18) + 4, -14, align="end")
place(pop(1200, 700, 0.12), wf(18), -20)

# Cortes de escena
for name, fr in CUTS.items():
    if name == "how":
        continue
    place(swish(0.34), fr, -17, 0.0, align="peak")

# Palanca (macro) y "¿y si no tiene?"
place(pop(), wf(20) + 4, -22)
place(mech_click(0.7), wf(21), -20, 0.1)
place(mech_click(0.6), wf(23) + 2, -21, -0.1)
place(swish(0.3), wf(24) - 4, -19, align="peak")
place(pop(), wf(25), -22)
place(pop(700, 400, 0.12), wf(28), -21)
place(pop(), wf(31) - 2, -23)

# El error
place(pop(), wf(38) - 2, -22)
place(whoosh(0.45, rising=False, bright=0.7), wf(40) - 2, -16, -0.4)
place(wrong_buzz(), wf(44), -15)
place(pop(), wf(47), -23)

# Lo correcto
place(pop(1000, 600), wf(51) - 4, -21)
place(whoosh(0.4, rising=True, bright=0.5), wf(52) + 8, -23, align="end")
click = we(56) - 2
place(mech_click(1.0), click, -7, 0.0)
place(whoom_down(0.8), click + 1, -16)
place(ding(1318.5), wf(58) - 1, -17)
place(swish(0.34), wf(59) - 3, -18, align="peak")
place(pop(), wf(59) + 2, -23)
place(pop(), wf(59) + 6, -23)
place(ding(1760, 0.6), wf(62), -22)

# ¿Cómo funciona?
place(riser(0.85), CUTS["how"], -15, align="end")
place(impact(0.9), wf(68), -14)
place(pop(), wf(70) + 4, -22)
place(swish(0.45), wf(77) + 6, -21, align="peak")
place(beam_zap(0.55), wf(80), -19, 0.3)
place(pop(), wf(83), -23)
place(shimmer(0.9, 1.0), wf(87), -20, 0.4)
place(mech_click(0.8), wf(94), -12)
place(whoosh(0.9, rising=True, bright=0.6), we(96), -22, align="end")
place(ding(2093, 0.8), wf(98) + 10, -21, 0.4)
place(pop(), wf(108), -23)
for k in range(0, 16, 2):
    place(tick(), wf(111) - 2 + k, -22)
place(ding(1568, 1.0), wf(111) + 14, -17)

# Electrocrómico
place(pop(), wf(115) - 1, -22)
place(pop(1500, 1500, 0.08), wf(120), -24)
place(pop(), wf(121) - 2, -22)
place(whoom_down(1.0), wf(122), -17)
place(pop(1800, 1800, 0.06), wf(123), -25)
place(pop(), wf(123) + 2, -23)

# De día
place(pop(), wf(125) - 1, -22)
place(shimmer(0.9, 0.7), wf(127) - 2, -24)
push = we(131) - 2
place(mech_click(1.0), push, -9)
place(ding(1318.5), push + 4, -18)
place(pop(), push + 6, -23)

# CTA
place(pop(900, 500, 0.12), wf(134) - 2, -17)
place(pop(1100, 650, 0.12), wf(136) - 2, -17)
place(whoosh(0.4, rising=True, bright=0.6), wf(136) + 16, -22, 0.4, align="end")
place(pop(700, 700, 0.1), we(142) - 6, -21)

# ---------------------------------------------------------------- voz y música
vo = decode(os.path.join(ROOT, "public", "audio", "vo.wav"), 1)[:, 0]
vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]
vo_st = stereo(vo, 0.0)

music = decode(os.path.join(ROOT, "source", "musica_tomaB.mp3"), 2)
m0 = int(MUSIC_OFFSET_S * SR)
music = music[m0:m0 + N]
music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))
# despejar la banda de la voz (1–4 kHz) para que se entienda mejor
music_eq = music - 0.35 * np.stack([bp(music[:, c], 1000, 4000) for c in range(2)], axis=1)

# ducking: la música baja cuando habla la voz
hop = 480
venv = np.array([np.sqrt(np.mean(vo[i:i + hop] ** 2)) for i in range(0, N, hop)])
active = (venv > 0.02).astype(float)
# ataque 40 ms, relajación 350 ms
sm = np.zeros_like(active)
for i in range(1, len(active)):
    a = 0.6 if active[i] > sm[i - 1] else 0.03
    sm[i] = sm[i - 1] + a * (active[i] - sm[i - 1])
duck_db = -6.0 * sm
gain = 10 ** (np.repeat(duck_db, hop)[:N] / 20)
music_bed_db = -13.5
fade_in = np.clip(t(N) / 0.05, 0, 1)
fade_out = np.clip((N / SR - t(N)) / 0.35, 0, 1)
music_out = music_eq * (10 ** (music_bed_db / 20)) * (gain * fade_in * fade_out)[:, None]
# al terminar la voz la música sube para el cierre
tail = np.clip((t(N) - (W[-1]["end"] + 0.05)) / 0.4, 0, 1)
music_out *= (1 + 0.6 * tail)[:, None]

vo_gain = 10 ** (-1.0 / 20)
mix = vo_st * vo_gain + music_out + sfx

# limitador suave de picos
peak = np.max(np.abs(mix))
if peak > 0.97:
    mix = np.tanh(mix / peak * 1.2) / np.tanh(1.2) * 0.97

out_dir = os.path.join(ROOT, "public", "audio")
os.makedirs(os.path.join(out_dir, "stems"), exist_ok=True)
wavfile.write(os.path.join(out_dir, "soundtrack.wav"), SR, (mix * 32767).astype(np.int16))
wavfile.write(os.path.join(out_dir, "stems", "voz.wav"), SR, (np.clip(vo_st * vo_gain, -1, 1) * 32767).astype(np.int16))
wavfile.write(os.path.join(out_dir, "stems", "musica.wav"), SR, (np.clip(music_out, -1, 1) * 32767).astype(np.int16))
wavfile.write(os.path.join(out_dir, "stems", "efectos.wav"), SR, (np.clip(sfx, -1, 1) * 32767).astype(np.int16))
print(f"OK  {N / SR:.2f}s  ({TOTAL_F} fotogramas)  pico {peak:.2f}")
