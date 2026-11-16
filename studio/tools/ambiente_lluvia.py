"""Genera un fondo sonoro suave de lluvia (sin música) para las historias animadas.
Uso: python3 -I ambiente_lluvia.py <salida.wav> <duración_s> "<inicio:nivel,...>"
Ejemplo de niveles: "0:0.6,4.6:0.35,17.6:0.05" (se interpolan entre puntos)."""
import sys, wave
import numpy as np

out, dur, pts = sys.argv[1], float(sys.argv[2]), sys.argv[3]
SR = 44100
n = int(SR * dur)
rs = np.random.default_rng(7)

def lowpass(x, a):
    # filtro IIR de un polo
    from itertools import accumulate
    return np.array(list(accumulate(x, lambda p, v: p + a * (v - p))), dtype=np.float32)

white = rs.standard_normal(n).astype(np.float32)
hiss = lowpass(white, 0.35) - lowpass(white, 0.02)          # banda media: "shhh" de lluvia
rumble = lowpass(rs.standard_normal(n).astype(np.float32), 0.004) * 6  # fondo grave
drops = np.zeros(n, dtype=np.float32)
for i in rs.integers(0, n - 2000, int(dur * 25)):            # gotas sueltas
    k = np.arange(800)
    drops[i:i + 800] += (rs.uniform(0.2, 1.0) * np.exp(-k / 90) * np.sin(k * rs.uniform(0.3, 0.9))).astype(np.float32)
rain = hiss + 0.25 * rumble + 0.35 * drops
rain /= np.max(np.abs(rain)) + 1e-9

tt = np.array([float(p.split(':')[0]) for p in pts.split(',')])
lv = np.array([float(p.split(':')[1]) for p in pts.split(',')])
env = np.interp(np.arange(n) / SR, tt, lv).astype(np.float32)
fade = np.minimum(1, np.minimum(np.arange(n) / (SR * 0.8), (n - np.arange(n)) / (SR * 1.2)))
sig = rain * env * fade * 10 ** (-20 / 20)                   # pico a -20 dBFS: queda por debajo de la canción
st = np.stack([sig, np.roll(sig, 331)], axis=1)
pcm = (np.clip(st, -1, 1) * 32767).astype('<i2')
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', out, round(dur, 2), 's')
