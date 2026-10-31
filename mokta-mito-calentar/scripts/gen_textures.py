#!/usr/bin/env python3
"""Texturas procedurales (sin material de terceros): grano de película y escarcha de parabrisas."""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "tex")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(11)

# ---------------------------------------------------------------- grano (1600×2440, gris medio ± ruido)
n = rng.normal(0, 1, (2440, 1600))
n = (n - n.min()) / (n.max() - n.min())
g = (n * 255).astype(np.uint8)
Image.fromarray(g, "L").save(os.path.join(OUT, "grain.png"))


# ---------------------------------------------------------------- escarcha (RGBA 1080×1300)
W, H = 1080, 1300


def fbm(w, h, octaves=6, seed=0):
    r = np.random.default_rng(seed)
    acc = np.zeros((h, w))
    amp = 1.0
    tot = 0
    for o in range(octaves):
        s = 2 ** (o + 2)
        small = r.random((s + 1, int(s * w / h) + 2))
        img = Image.fromarray((small * 255).astype(np.uint8), "L").resize((w, h), Image.BICUBIC)
        acc += np.asarray(img, dtype=np.float64) / 255 * amp
        tot += amp
        amp *= 0.55
    return acc / tot


base = fbm(W, H, 7, 3)
base = (base - base.min()) / (base.max() - base.min())

# cristales: árboles ramificados (dendritas) dibujados a mano alzada procedural
layer = Image.new("L", (W, H), 0)
dr = ImageDraw.Draw(layer)


def branch(x, y, ang, length, depth, width):
    if depth == 0 or length < 4:
        return
    x2 = x + np.cos(ang) * length
    y2 = y + np.sin(ang) * length
    dr.line([(x, y), (x2, y2)], fill=int(150 + 80 * rng.random()), width=max(1, int(width)))
    k = 2 + int(rng.random() * 2)
    for i in range(k):
        t = 0.35 + 0.6 * rng.random()
        bx = x + (x2 - x) * t
        by = y + (y2 - y) * t
        side = 1 if i % 2 == 0 else -1
        branch(bx, by, ang + side * (0.6 + 0.5 * rng.random()), length * (0.42 + 0.2 * rng.random()), depth - 1, width * 0.7)
    branch(x2, y2, ang + (rng.random() - 0.5) * 0.5, length * 0.7, depth - 1, width * 0.8)


for _ in range(90):
    x, y = rng.random() * W, rng.random() * H
    a = rng.random() * np.pi * 2
    branch(x, y, a, 40 + rng.random() * 90, 4, 2.2)
for _ in range(900):
    x, y = rng.random() * W, rng.random() * H
    a = rng.random() * np.pi * 2
    l = 4 + rng.random() * 16
    dr.line([(x, y), (x + np.cos(a) * l, y + np.sin(a) * l)], fill=int(120 + 120 * rng.random()), width=1)

cr = np.asarray(layer.filter(ImageFilter.GaussianBlur(0.6)), dtype=np.float64) / 255
glow = np.asarray(layer.filter(ImageFilter.GaussianBlur(5)), dtype=np.float64) / 255

alpha = np.clip(0.50 + 0.38 * base + 0.55 * cr + 0.35 * glow, 0, 1)
lum = np.clip(0.80 + 0.12 * base + 0.25 * cr, 0, 1)
rgb = np.stack([lum * 0.86, lum * 0.95, lum * 1.0], -1)
rgba = np.concatenate([rgb, alpha[..., None]], -1)
Image.fromarray((rgba * 255).astype(np.uint8), "RGBA").save(os.path.join(OUT, "frost.png"), optimize=True)
print("texturas OK")
