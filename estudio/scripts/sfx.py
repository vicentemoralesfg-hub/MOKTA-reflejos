"""MOKTA · biblioteca de síntesis de sonido (numpy/scipy). Todo generado: libre de licencias."""
import numpy as np
from scipy import signal

SR = 48000
_rng = np.random.default_rng(1)


def _sos(kind, f, order=2):
    return signal.butter(order, f, btype=kind, fs=SR, output="sos")


def lp(x, fc, order=2):
    return signal.sosfilt(_sos("low", fc, order), x, axis=0)


def hp(x, fc, order=2):
    return signal.sosfilt(_sos("high", fc, order), x, axis=0)


def bp(x, lo, hi, order=2):
    hi = min(hi, SR / 2 - 100)
    return signal.sosfilt(_sos("band", [lo, hi], order), x, axis=0)


def brown(n, g=None):
    g = g or _rng
    b = np.cumsum(g.standard_normal(n))
    b = hp(b, 20, 2)
    return b / (np.std(b) + 1e-9)


def env(n, a, r, curve=1.0):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    na, nr = min(na, n), min(nr, n)
    if na > 0:
        e[:na] = np.linspace(0, 1, na) ** curve
    if nr > 0:
        e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e


def place(buf, x, at, gain=1.0, pan=0.0):
    i = int(round(at * SR))
    if x.ndim == 1:
        x = np.stack([x * np.sqrt(1 - pan), x * np.sqrt(1 + pan)], 1)
    if i < 0:
        x = x[-i:]
        i = 0
    j = min(len(buf), i + len(x))
    if j > i:
        buf[i:j] += x[: j - i] * gain


def soft_clip(x):
    return np.tanh(x)


def tick(f=2400, dur=0.05, dec=0.012):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    return np.sin(2 * np.pi * f * ts) * np.exp(-ts / dec)


def pop_in():
    """Notificación entrante: dos notas suaves ascendentes."""
    a = tick(880, 0.09, 0.03) * 0.8
    b = tick(1320, 0.14, 0.045)
    out = np.zeros(int(0.2 * SR))
    out[: len(a)] += a
    k = int(0.055 * SR)
    out[k : k + len(b)] += b
    return lp(out, 6000)


def pop_out():
    """Envío propio: barrido corto + clic."""
    n = int(0.16 * SR)
    ts = np.arange(n) / SR
    f = 600 + 2400 * (ts / ts[-1])
    sw = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-ts / 0.05) * 0.5
    sw += bp(_rng.standard_normal(n), 2000, 8000) * np.exp(-ts / 0.02) * 0.3
    return sw


def vibrate(dur=0.3):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    x = signal.square(2 * np.pi * 165 * ts) * 0.5 + np.sin(2 * np.pi * 82 * ts)
    x = lp(x, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 28 * ts)) * env(n, 0.01, 0.05)
    return x * 0.6


def thump(dur=0.6, f0=60, dec=0.15):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    f = f0 * 0.55 + f0 * np.exp(-ts * 18)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-ts / dec)
    x += lp(_rng.standard_normal(n), 400) * np.exp(-ts / 0.02) * 0.4
    return x


def whoosh(dur=0.5, up=True):
    n = int(dur * SR)
    w = _rng.standard_normal(n)
    out = np.zeros(n)
    blocks = 24
    for b in range(blocks):
        a, z = b * n // blocks, (b + 1) * n // blocks
        c = 300 * (10 ** (b / blocks if up else 1 - b / blocks))
        seg = bp(w[max(0, a - 2000) : z], c * 0.6, min(c * 1.8, 20000))[-(z - a) :]
        out[a:z] = seg
    return out * np.sin(np.linspace(0, np.pi, n)) ** 1.5


def riser(dur=1.0, f0=200, f1=1200):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (ts / dur)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + bp(_rng.standard_normal(n), 500, 6000) * 0.25
    return x * (ts / dur) ** 2


def stamp(f0=90):
    """Golpe de "sello" (para MITO / VERDAD)."""
    x = thump(0.5, f0, 0.09)
    n = len(x)
    ts = np.arange(n) / SR
    x += bp(_rng.standard_normal(n), 800, 5000) * np.exp(-ts / 0.012) * 0.7
    return soft_clip(x * 1.5)


def save_wav(path, x):
    from scipy.io import wavfile

    x = np.asarray(x)
    wavfile.write(path, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))
