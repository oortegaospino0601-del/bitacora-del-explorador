#!/usr/bin/env python3
"""Mezcla final: narración + ambiente sintético suave + transiciones discretas.

Uso: python3 -I audio.py work/tiempos.json work/narracion.wav work/mezcla.wav DURACION
Todo el sonido de fondo se genera aquí (senos y ruido filtrado): no hay música con derechos.
"""
import json
import subprocess
import sys

import numpy as np
import soundfile as sf

SR = 44100
tiempos, narr, out, total = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
T = json.load(open(tiempos))
S = T["sentences"]
n = int(total * SR)
t = np.arange(n) / SR
rng = np.random.default_rng(24)


def onepole(x, a):
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc)
        y[i] = acc
    return y


# ambiente: acorde grave y quieto (La menor add9) con respiración lenta
pad = np.zeros(n)
for f, g in ((55.0, .9), (82.41, .55), (110.0, .5), (123.47, .22), (164.81, .3)):
    pad += g * np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * (0.75 + 0.25 * np.sin(2 * np.pi * (0.05 + f / 4000) * t))
pad /= np.max(np.abs(pad))
# textura de aire: ruido rosado suave
wn = rng.standard_normal(n)
air = onepole(onepole(wn, 0.02), 0.05)
air /= np.max(np.abs(air))
bed = 0.055 * pad + 0.025 * air
fade = np.clip(t / 1.2, 0, 1) * np.clip((total - t) / 2.5, 0, 1)
bed *= fade

# transiciones: soplo filtrado que culmina al inicio de cada sección
starts = []
for i, s in enumerate(S):
    if i > 0 and s["sec"] != S[i - 1]["sec"]:
        starts.append((S[i - 1]["end"] + s["start"]) / 2)
starts.append(T["narrationEnd"] + 0.45)  # pantalla de fuentes
fx = np.zeros(n)
for st in starts:
    L = int(0.9 * SR)
    a = int(max(0, (st - 0.6) * SR))
    seg = rng.standard_normal(L)
    tt = np.arange(L) / SR
    env = np.where(tt < 0.6, (tt / 0.6) ** 2, np.exp(-(tt - 0.6) / 0.12))
    # filtro que se abre y se cierra
    cut = 0.02 + 0.10 * np.sin(np.pi * np.clip(tt / 0.9, 0, 1))
    y = np.empty(L)
    acc = 0.0
    for i in range(L):
        acc += cut[i] * (seg[i] - acc)
        y[i] = acc
    y = y / (np.max(np.abs(y)) + 1e-9) * env
    b = min(n, a + L)
    fx[a:b] += 0.11 * y[: b - a]
# golpe grave muy suave en el sello "DESMENTIDO"
def word(si, w):
    for x in S[si]["words"]:
        if x["w"].lower().startswith(w):
            return x["start"]
for when in (word(10, "desmint"),):
    a = int(when * SR); L = int(0.5 * SR); tt = np.arange(L) / SR
    thump = np.sin(2 * np.pi * (70 - 25 * tt) * tt) * np.exp(-tt / 0.09)
    fx[a:a + L] += 0.22 * thump[: max(0, min(L, n - a))]

# voz
v, sr = sf.read(narr)
if v.ndim > 1:
    v = v.mean(axis=1)
# re-muestreo simple a 44.1 kHz
idx = np.arange(int(len(v) * SR / sr)) * sr / SR
v = np.interp(idx, np.arange(len(v)), v)
voice = np.zeros(n)
voice[: min(n, len(v))] = v[:n]
voice = voice / (np.max(np.abs(voice)) + 1e-9) * 0.9
# ducking del fondo bajo la voz
envv = onepole(np.abs(voice), 0.0015)
duck = 1 - 0.55 * np.clip(envv / (np.percentile(envv[envv > 1e-4], 70) + 1e-9), 0, 1)
mix = voice + bed * duck + fx
mix = mix / np.max(np.abs(mix)) * 0.95
sf.write(out + ".raw.wav", np.stack([mix, mix], axis=1), SR)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", out + ".raw.wav", "-af",
                "highpass=f=40,loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "44100", out], check=True)
print("mezcla lista:", out)
