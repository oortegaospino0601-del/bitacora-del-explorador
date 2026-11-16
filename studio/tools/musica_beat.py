#!/usr/bin/env python3
"""Base musical ORIGINAL (sin samples ni canciones de terceros) para las historias.

Beat triste estilo trap/lo-fi en La menor: piano en arpegio, pad, 808, bombo, clap y hi-hats.
Uso: python3 -I musica_beat.py <salida.wav> <duración_s> '<json de secciones>'
Secciones: {"bpm": 84, "parts": [[ini, fin, "piano,pad,drums,bass"], ...],
            "impacts": [t, ...], "risers": [t, ...]}
"""
import json
import sys
import wave

import numpy as np

SR = 44100
rs = np.random.default_rng(3)


def note(n):  # n: semitonos desde A4
    return 440.0 * 2 ** (n / 12)


# Am - F - C - G (un compás cada acorde). Notas relativas a A4.
CHORDS = [[-12, -9, -5], [-16, -12, -9], [-9, -5, -2], [-14, -10, -7]]
ROOTS = [-36, -40, -33, -38]


def env(n, a, d):
    t = np.arange(n) / SR
    e = np.exp(-t / d)
    k = max(1, int(a * SR))
    e[:k] *= np.linspace(0, 1, k)
    return e


def piano(f, dur, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = sum((1 / k ** 1.6) * np.sin(2 * np.pi * f * k * t * (1 + 0.0007 * k)) for k in range(1, 7))
    return (x * env(n, 0.004, 0.9) * vel).astype(np.float32)


def band(x, lo, hi):
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    X[(fr < lo) | (fr > hi)] = 0
    return np.fft.irfft(X, len(x)).astype(np.float32)


def place(buf, x, at, g=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(x))
    buf[i:j] += x[: j - i] * g


def main(out, dur, cfg):
    bpm = cfg.get("bpm", 84)
    beat = 60 / bpm
    step = beat / 4
    bar = beat * 4
    n = int(dur * SR) + SR
    mus, drums, bass = (np.zeros(n, np.float32) for _ in range(3))

    def on(t, what):
        return any(a <= t < b and what in parts for a, b, parts in cfg["parts"])

    kick = (np.sin(2 * np.pi * np.cumsum(np.linspace(110, 45, int(0.35 * SR))) / SR) * env(int(0.35 * SR), 0.002, 0.09)).astype(np.float32)
    clap = band(rs.standard_normal(int(0.25 * SR)).astype(np.float32), 900, 5000) * env(int(0.25 * SR), 0.001, 0.07)
    clap += (np.sin(2 * np.pi * 190 * np.arange(len(clap)) / SR) * env(len(clap), 0.001, 0.03) * 0.5).astype(np.float32)
    hat = band(rs.standard_normal(int(0.08 * SR)).astype(np.float32), 7000, 16000) * env(int(0.08 * SR), 0.001, 0.018)

    nbars = int(dur / bar) + 2
    for b in range(nbars):
        t0 = b * bar
        ci = b % 4
        ch = CHORDS[ci]
        arp = [ch[0], ch[1], ch[2], ch[1], ch[0] + 12, ch[2], ch[1], ch[2]]
        for k, nn in enumerate(arp):
            tt = t0 + k * beat / 2
            if on(tt, "piano"):
                place(mus, piano(note(nn), 1.6, 0.55 if k % 2 else 0.7), tt)
        if on(t0, "pad"):
            for nn in ch:
                m = int(bar * SR)
                tt = np.arange(m) / SR
                pad = (np.sin(2 * np.pi * note(nn - 12) * tt) + 0.3 * np.sin(2 * np.pi * note(nn) * tt)) * np.sin(np.pi * np.arange(m) / m) ** 1.5
                place(mus, pad.astype(np.float32), t0, 0.07)
        for s in range(16):
            tt = t0 + s * step
            if not on(tt, "drums"):
                continue
            if s in (0, 6, 10):
                place(drums, kick, tt, 0.9)
            if s in (4, 12):
                place(drums, clap, tt, 0.55)
            if s % 2 == 0:
                place(drums, hat, tt, 0.22 if s % 4 else 0.3)
            if b % 2 == 1 and s >= 13:  # redoble de hi-hats al final de cada 2 compases
                for r in range(3):
                    place(drums, hat, tt + r * step / 3, 0.15)
        if on(t0, "bass"):
            for s, ln in ((0, 1.3), (10, 0.9)):
                tt = t0 + s * step
                m = int(ln * SR)
                f = note(ROOTS[ci])
                ph = 2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-np.arange(m) / (0.03 * SR)))) / SR
                x = np.tanh(1.6 * np.sin(ph)) * env(m, 0.003, 0.45)
                place(bass, x.astype(np.float32), tt, 0.5)

    # reverb sencilla para el piano
    ir_n = int(1.6 * SR)
    ir = rs.standard_normal(ir_n).astype(np.float32) * np.exp(-np.arange(ir_n) / (0.45 * SR)).astype(np.float32)
    ir /= np.sqrt(np.sum(ir ** 2))
    L = 1 << int(np.ceil(np.log2(n + ir_n)))
    wet = np.fft.irfft(np.fft.rfft(mus, L) * np.fft.rfft(ir, L), L)[:n].astype(np.float32)
    mus = mus + 0.35 * wet

    fx = np.zeros(n, np.float32)
    for t in cfg.get("impacts", []):
        m = int(2.0 * SR)
        ph = 2 * np.pi * np.cumsum(np.linspace(70, 28, m)) / SR
        boom = np.sin(ph) * env(m, 0.002, 0.6) + band(rs.standard_normal(m).astype(np.float32), 40, 400) * env(m, 0.001, 0.25) * 0.6
        place(fx, boom.astype(np.float32), t, 0.9)
    for t in cfg.get("risers", []):
        m = int(1.2 * SR)
        x = band(rs.standard_normal(m).astype(np.float32), 2000, 12000) * (np.linspace(0, 1, m) ** 3)
        place(fx, x.astype(np.float32), max(0, t - 1.2), 0.35)

    mix = 0.5 * mus + 0.6 * drums + 0.55 * bass + fx
    mix = mix[: int(dur * SR)]
    fade = np.minimum(1, (len(mix) - np.arange(len(mix))) / (SR * 1.5))
    mix *= fade
    mix /= np.max(np.abs(mix)) + 1e-9
    mix *= 0.89
    st = np.stack([mix, np.roll(mix, 120)], axis=1)
    with wave.open(out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(st, -1, 1) * 32767).astype("<i2").tobytes())
    print("ok", out)


if __name__ == "__main__":
    main(sys.argv[1], float(sys.argv[2]), json.loads(sys.argv[3]))
