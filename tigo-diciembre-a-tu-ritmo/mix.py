# Original soundtrack + sound design + voice mix, all synthesized here (no samples, no copyrighted music).
# Reads timeline.json (same file the picture reads) -> out/music.wav (final mix) + out/stem-*.wav
import json, subprocess, os, sys
import numpy as np
from scipy.signal import lfilter, butter, sosfilt, fftconvolve

SR = 48000
TL = json.load(open('timeline.json'))
DUR = TL['DURATION']; BAR = TL['BAR']; BEAT = TL['BEAT']; G0 = TL['GRID0']; EV = TL['ev']
N = int(DUR * SR)
os.makedirs('out', exist_ok=True)
rng = np.random.default_rng(20261207)

def st(): return np.zeros((2, N))
def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def bar_t(b, beat=0.0): return G0 + b * BAR + beat * BEAT
def env_ad(n, a, d):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
    return e
def put(bus, sig, t, pan=0.0, g=1.0):
    i = int(round(t * SR))
    if i >= N: return
    if sig.ndim == 1:
        l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
        sig = np.vstack([sig * l * 1.414, sig * r * 1.414])
    j0 = max(0, i); s0 = j0 - i
    j1 = min(N, i + sig.shape[1])
    if j1 <= j0: return
    bus[:, j0:j1] += g * sig[:, s0:s0 + (j1 - j0)]
def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)

# ---------------- instruments ----------------
def pluck(freq, dur, bright=0.5, decay=0.996):
    """Karplus-Strong string (tiple / guitar) via an IIR comb."""
    n = int(dur * SR); P = SR / freq; D = int(P); frac = P - D
    exc = rng.uniform(-1, 1, D + 2)
    exc = lp(exc, 1500 + 7000 * bright, 1)
    x = np.zeros(n); x[:len(exc)] = exc[:n]
    a = np.zeros(D + 2); a[0] = 1; a[D] = -decay * (1 - frac) * 0.5 - decay * 0.5 * frac * 0 - decay * 0.5 * (1 - frac) * 0
    # simple averaging loop filter split across D and D+1 taps
    a[D] = -decay * 0.5; a[D + 1] = -decay * 0.5
    y = lfilter([1.0], a, x)
    y *= np.minimum(1, (n - np.arange(n)) / (0.03 * SR))
    return y / (np.max(np.abs(y)) + 1e-9)

def bell(freq, dur, partials=((1, 1, 1.0), (2.0, .35, .5), (3.01, .18, .32), (4.16, .1, .2)), att=0.002):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for r, a, d in partials:
        y += a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t / (d * dur))
    return y * np.minimum(1, t / att)

def celesta(freq, dur): return bell(freq, max(dur, 0.9), ((1, 1, .55), (2, .25, .3), (3.0, .12, .18), (4.02, .05, .1)), 0.003)
def glock(freq, dur): return bell(freq, 1.6, ((1, 1, .6), (2.76, .4, .25), (5.4, .2, .12), (8.93, .08, .06)), 0.001)

def saw(freq, t):
    ph = (freq * t) % 1.0
    return 2 * ph - 1

def pad_chord(midis, dur, cutoff=1400, detune=0.12):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for m in midis:
        f = mtof(m)
        for d in (-detune, 0, detune):
            y += saw(f * 2 ** (d / 12), t + rng.uniform(0, 1))
    y = lp(y, cutoff, 2)
    att, rel = 0.6, 0.8
    e = np.minimum(1, t / att) * np.minimum(1, (dur - t) / rel).clip(0, 1)
    return y * e / (len(midis) * 3)

def bass_note(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR; f = mtof(m)
    y = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    e = np.minimum(1, t / 0.008) * np.exp(-t / 0.45) * np.minimum(1, (dur - t) / 0.05).clip(0, 1)
    return lp(y * e, 900)

def kick(g=1.0):
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 48 + 70 * np.exp(-t / 0.03)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return g * np.sin(ph) * np.exp(-t / 0.14)

def shaker(g=1.0, dur=0.07):
    n = int(dur * SR); t = np.arange(n) / SR
    x = rng.uniform(-1, 1, n)
    x = bp(x, 5000, 12000)
    return g * x * np.minimum(1, t / 0.012) * np.exp(-t / 0.025)

def tamb(g=1.0):
    n = int(0.25 * SR); t = np.arange(n) / SR
    x = bp(rng.uniform(-1, 1, n), 6000, 14000)
    jing = sum(np.sin(2 * np.pi * f * t) for f in (6100, 7350, 8800, 10400)) * 0.15
    return g * (x + jing) * np.exp(-t / 0.06)

def sleigh(g=1.0, dur=0.12):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for k in range(5):
        f = rng.uniform(5200, 9800); d = rng.uniform(0, 0.02)
        y += np.sin(2 * np.pi * f * t) * np.exp(-np.maximum(0, t - d) / 0.03) * (t > d)
    y += 0.4 * bp(rng.uniform(-1, 1, n), 7000, 15000) * np.exp(-t / 0.02)
    return g * y * 0.3

def reverb_ir(sec=2.2, damp=4000):
    n = int(sec * SR); t = np.arange(n) / SR
    irs = []
    for c in range(2):
        x = rng.normal(0, 1, n) * np.exp(-t / (sec / 6.5))
        x = lp(x, damp, 1)
        x[:int(0.012 * SR)] = 0
        irs.append(x / np.sqrt(np.sum(x ** 2)))
    return np.array(irs)
IR = reverb_ir()
def reverb(bus, wet):
    out = np.zeros_like(bus)
    mono = bus.mean(axis=0)
    for c in range(2): out[c] = fftconvolve(mono, IR[c])[:N]
    return bus + wet * out

# ---------------- the arrangement (G major, 96 BPM, aguinaldo groove) ----------------
CH = {'G': [55, 59, 62, 67, 71, 74], 'D': [57, 62, 66, 69, 74, 78], 'Em': [59, 64, 67, 71, 76, 79],
      'C': [55, 60, 64, 67, 72, 76]}
ROOT = {'G': 43, 'D': 38, 'Em': 40, 'C': 36}
PROG = {1: 'G', 2: 'G', 3: 'D', 4: 'Em', 5: 'C', 6: 'G', 7: 'D', 8: 'C', 9: 'D',
        10: 'G', 11: 'Em', 12: 'C', 13: 'D', 14: 'C', 15: 'G'}
MEL = {
 2: [(0, 74, 1), (1, 71, .5), (1.5, 74, .5), (2, 79, 1.5), (3.5, 78, .5)],
 3: [(0, 76, 1), (1, 74, .5), (1.5, 78, .5), (2, 81, 1.5), (3.5, 79, .5)],
 4: [(0, 79, 1), (1, 76, .5), (1.5, 79, .5), (2, 83, 1), (3, 81, .5), (3.5, 79, .5)],
 5: [(0, 76, 1.5), (1.5, 79, .5), (2, 76, 1), (3, 74, 1)],
 6: [(0, 74, 1), (1, 71, .5), (1.5, 74, .5), (2, 79, 1.5), (3.5, 78, .5)],
 7: [(0, 76, 1), (1, 74, .5), (1.5, 78, .5), (2, 81, 1.5), (3.5, 79, .5)],
 8: [(0, 76, 1), (1, 72, .5), (1.5, 76, .5), (2, 79, 1), (3, 76, .5), (3.5, 74, .5)],
 9: [(0, 74, 1), (1, 78, .5), (1.5, 81, .5), (2, 78, 1), (3, 74, 1)],
 10: [(0, 79, 1), (1, 83, .5), (1.5, 86, .5), (2, 83, 1.5), (3.5, 81, .5)],
 11: [(0, 83, 1), (1, 79, .5), (1.5, 83, .5), (2, 88, 1.5), (3.5, 86, .5)],
 12: [(0, 84, 1), (1, 79, .5), (1.5, 84, .5), (2, 88, 1), (3, 86, 1)],
 13: [(0, 86, 1), (1, 81, .5), (1.5, 78, .5), (2, 81, 1), (3, 74, 1)],
 14: [(0, 76, 1), (1, 79, 1), (2, 78, 1), (3, 81, 1)],
}
pad, tiple, bass, drums, mel, bells = st(), st(), st(), st(), st(), st()

# intro (before the hook hit): music-box arpeggio + soft pad
for i, m in enumerate([67, 71, 74, 79, 74, 71, 74, 79, 83, 79, 74, 71, 74, 79, 83, 86]):
    t = 0.12 + i * BEAT / 2 * 0.9
    if t < EV['hookHit'] - 0.15:
        put(mel, celesta(mtof(m + 12), 0.9) * 0.35, t, pan=0.25 * np.sin(i))
put(pad, pad_chord([55, 62, 67, 71], EV['hookHit'] + 0.3, 900), 0.0, g=0.5)

for b in range(2, 16):
    ch = PROG[b]; t0 = bar_t(b)
    if b == 14:   # C | D split
        put(pad, pad_chord(CH['C'][:4], BAR / 2 + 0.3, 1600), t0, g=0.6)
        put(pad, pad_chord(CH['D'][:4], BAR / 2 + 0.3, 1600), t0 + BAR / 2, g=0.6)
    elif b < 15:
        put(pad, pad_chord(CH[ch][:4], BAR + 0.3, 1200 if b < 10 else 1900), t0, g=0.55 if b < 10 else 0.75)
    if b == 15:
        # final button: one big strum, bass, bells, then silence
        for k, m in enumerate(CH['G']):
            put(tiple, pluck(mtof(m + 12), 3.0, 0.6, 0.9985) * 0.25, t0 + k * 0.012, pan=-0.3 + 0.12 * k)
        put(bass, bass_note(43, 2.0) * 0.9, t0)
        put(drums, kick(1.0), t0)
        for m in (79, 83, 86, 91):
            put(bells, glock(mtof(m), 1.6) * 0.18, t0, pan=0.2)
        put(pad, pad_chord([55, 59, 62, 67, 71], 2.1, 2200), t0, g=0.7)
        continue
    # tiple strum pattern (8ths): D . D U . U D U
    pat = [(0, 'D', 1.0), (1, 'D', .7), (1.5, 'U', .5), (2.5, 'U', .55), (3, 'D', .8), (3.5, 'U', .5)]
    for beat, dirn, acc in pat:
        ch_here = ch if b != 14 else ('C' if beat < 2 else 'D')
        notes = CH[ch_here][1:]
        order = notes if dirn == 'D' else notes[::-1]
        for k, m in enumerate(order):
            put(tiple, pluck(mtof(m + 12), 0.45, 0.45 + 0.2 * acc, 0.993) * 0.09 * acc,
                bar_t(b, beat) + k * 0.009, pan=-0.35 + 0.14 * k)
    # bass: root on 1, fifth on 3 (+ walk-up pickup on 4&)
    r = ROOT[ch if b != 14 else 'C']
    put(bass, bass_note(r, BEAT * 1.6), bar_t(b, 0))
    put(bass, bass_note(r + 7 if b != 14 else ROOT['D'], BEAT * 1.6), bar_t(b, 2))
    # percussion
    for s16 in range(16):
        acc = 1.0 if s16 % 4 == 0 else (0.6 if s16 % 2 == 0 else 0.35)
        put(drums, shaker(0.22 * acc), bar_t(b, s16 / 4), pan=0.35)
    for bt in (0, 2): put(drums, kick(0.55), bar_t(b, bt))
    for bt in (1, 3): put(drums, tamb(0.25), bar_t(b, bt), pan=-0.3)
    if b >= 10:
        for e8 in range(8): put(bells, sleigh(0.5 if e8 % 2 == 0 else 0.3), bar_t(b, e8 / 2), pan=0.5)
    for beat, m, d in MEL.get(b, []):
        put(mel, celesta(mtof(m), d * BEAT) * 0.33, bar_t(b, beat), pan=-0.15)
        if b >= 10: put(bells, glock(mtof(m), d) * 0.08, bar_t(b, beat), pan=0.25)

# ---------------- sound design ----------------
sfx = st()
def noise(n): return rng.uniform(-1, 1, n)
def S_switch():
    n = int(0.06 * SR); t = np.arange(n) / SR
    c = hp(noise(n), 2500) * np.exp(-t / 0.004) + 0.5 * np.sin(2 * np.pi * 2100 * t) * np.exp(-t / 0.01)
    c2 = np.zeros(n); k = int(0.018 * SR); c2[k:] = 0.6 * c[:n - k]
    return (c + c2) * 0.5
def S_riser(d):
    n = int(d * SR); t = np.arange(n) / SR; p = t / d
    x = noise(n); y = np.zeros(n)
    seg = 2048
    for i in range(0, n, seg):
        f = 300 + 5000 * p[i] ** 2
        y[i:i + seg] = bp(x[i:i + seg], f * 0.7, min(f * 1.4, 20000))
    tone = np.sin(2 * np.pi * np.cumsum(200 + 700 * p ** 2) / SR) * 0.15
    return (y * 0.6 + tone) * p ** 2.2 * 0.6
def S_impact():
    n = int(1.6 * SR); t = np.arange(n) / SR
    thump = np.sin(2 * np.pi * np.cumsum(40 + 60 * np.exp(-t / 0.05)) / SR) * np.exp(-t / 0.35)
    air = lp(noise(n), 2500) * np.exp(-t / 0.12) * 0.4
    return (thump + air) * 0.8
def S_shimmer(d=1.0, base=1567.98):
    y = np.zeros(int((d + 1.2) * SR))
    for i, r in enumerate([1, 1.25, 1.5, 2, 2.5, 3, 4]):
        s = bell(base * r, 1.0, ((1, 1, .4), (2, .2, .2))) * (0.25 - 0.02 * i)
        k = int(i * d / 7 * SR); y[k:k + len(s)] += s[:len(y) - k]
    return y
def S_whoosh(d=0.7, f0=250, f1=3200, up=False):
    n = int(d * SR); t = np.arange(n) / SR; p = t / d
    x = noise(n); y = np.zeros(n); seg = 1024
    for i in range(0, n, seg):
        q = p[i]; f = f0 + (f1 - f0) * (np.sin(np.pi * q) if not up else q)
        y[i:i + seg] = bp(x[i:i + seg], f * 0.6, min(f * 1.6, 20000))
    e = np.sin(np.pi * p) ** 1.5 if not up else p ** 1.5 * np.minimum(1, (1 - p) * 8)
    out = y * e
    l = out * np.cos(p * np.pi / 2); r = out * np.sin(p * np.pi / 2)
    return np.vstack([l, r]) * 1.2
def S_callring():
    y = np.zeros(int(0.9 * SR))
    for i, (f, k) in enumerate([(659.25, 0), (987.77, 0.16), (1318.5, 0.32)]):
        s = bell(f, 0.5, ((1, 1, .3), (2, .2, .15))) * 0.5
        j = int(k * SR); y[j:j + len(s)] += s
    return y
def S_scold():
    y = np.zeros(int(0.6 * SR))
    for k in (0, 0.14, 0.28):
        n = int(0.12 * SR); t = np.arange(n) / SR
        s = np.sin(2 * np.pi * 1250 * t) * np.exp(-t / 0.025) + 0.3 * hp(noise(n), 3000) * np.exp(-t / 0.004)
        j = int(k * SR); y[j:j + n] += s * 0.6
    return y
def S_click():
    n = int(0.04 * SR); t = np.arange(n) / SR
    return (hp(noise(n), 3000) * np.exp(-t / 0.003) + 0.4 * np.sin(2 * np.pi * 3400 * t) * np.exp(-t / 0.006)) * 0.5
def S_goal():
    y = np.zeros(int(1.4 * SR))
    for i, m in enumerate([72, 76, 79, 84, 88]):
        n = int(0.16 * SR if i < 4 else 0.6 * SR); t = np.arange(n) / SR
        sq = np.sign(np.sin(2 * np.pi * mtof(m) * t)) * 0.18 * np.exp(-t / (0.12 if i < 4 else 0.35))
        j = int(i * 0.075 * SR); y[j:j + n] += lp(sq, 6000)
    n = int(1.3 * SR); t = np.arange(n) / SR
    crowd = bp(noise(n), 500, 2500) * np.minimum(1, t / 0.15) * np.exp(-t / 0.6) * (1 + 0.3 * np.sin(2 * np.pi * 7 * t))
    y[:n] += crowd * 0.25
    return y
def S_sizzle(d=4.2):
    n = int(d * SR); t = np.arange(n) / SR
    base = hp(noise(n), 4000) * 0.08
    cr = np.zeros(n); idx = rng.choice(n, int(d * 140), replace=False); cr[idx] = rng.uniform(-1, 1, len(idx))
    cr = bp(cr, 2000, 9000) * 1.6
    e = np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.8).clip(0, 1)
    return (base + cr) * e
def S_tap():
    y = np.zeros(int(0.5 * SR))
    for k, f in ((0, 880), (0.17, 780)):
        n = int(0.15 * SR); t = np.arange(n) / SR
        s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.03) + 0.5 * np.sin(2 * np.pi * f * 2.3 * t) * np.exp(-t / 0.012)
        j = int(k * SR); y[j:j + n] += s * 0.7
    return y
def S_snore():
    y = np.zeros(int(2.6 * SR))
    for k in (0, 1.25):
        n = int(0.85 * SR); t = np.arange(n) / SR; p = t / 0.85
        rattle = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 26 * t))
        s = bp(noise(n), 180, 900) * rattle * np.sin(np.pi * p) ** 1.2
        s += 0.25 * np.sin(2 * np.pi * np.cumsum(70 + 20 * p) / SR) * rattle * np.sin(np.pi * p)
        j = int(k * SR); y[j:j + n] += s
        n2 = int(0.4 * SR); t2 = np.arange(n2) / SR
        wh = np.sin(2 * np.pi * np.cumsum(1100 - 400 * t2 / 0.4) / SR) * np.sin(np.pi * t2 / 0.4) * 0.12
        j2 = j + n; y[j2:j2 + n2] += wh[:len(y) - j2]
    return y * 0.8
def S_step():
    n = int(0.12 * SR); t = np.arange(n) / SR
    return lp(noise(n), 700) * np.exp(-t / 0.025) * 1.4
def S_ding():
    y = np.zeros(int(1.2 * SR))
    for k, f in ((0, 1318.5), (0.11, 1975.5)):
        s = bell(f, 0.9, ((1, 1, .35), (2, .15, .2), (3, .05, .1))) * 0.4
        j = int(k * SR); y[j:j + len(s)] += s
    return y
def S_sparkle():
    y = np.zeros(int(2.0 * SR))
    for i in range(14):
        f = 2000 * 2 ** (rng.integers(0, 24) / 12)
        s = bell(f, 0.5, ((1, 1, .3),)) * 0.12
        j = int(rng.uniform(0, 1.0) * SR); y[j:j + len(s)] += s
    return y
def S_firework():
    n = int(1.6 * SR); t = np.arange(n) / SR
    pop = lp(noise(n), 1800) * np.exp(-t / 0.05) * 0.8
    cr = np.zeros(n); idx = rng.choice(np.arange(int(0.1 * SR), n), 90, replace=False); cr[idx] = rng.uniform(-1, 1, 90)
    cr = bp(cr, 3000, 10000) * np.exp(-t / 0.6) * 2.0
    return pop + cr

for c in TL['sfx']:
    k, t, g = c['kind'], c['t'], c['g']
    if k == 'switch': put(sfx, S_switch(), t, 0.2, g * 0.5)
    elif k == 'riser': put(sfx, S_riser(EV["hookHit"] - t), t, 0, g * 0.2)
    elif k == 'impact': put(sfx, S_impact(), t, 0, g * 0.9)
    elif k == 'shimmer': put(sfx, S_shimmer(), t, 0.3, g * 0.5)
    elif k == 'whoosh': put(sfx, S_whoosh(0.75), t, 0, g * 0.3)
    elif k == 'whooshBig': put(sfx, S_whoosh(1.5, 150, 2400), t, 0, g * 0.35)
    elif k == 'callring': put(sfx, S_callring(), t, 0.3, g * 0.6)
    elif k == 'scold': put(sfx, S_scold(), t, 0.3, g * 0.45)
    elif k == 'click': put(sfx, S_click(), t, -0.2, g * 0.5)
    elif k == 'goal': put(sfx, S_goal(), t, 0, g * 0.6)
    elif k == 'sizzle': put(sfx, S_sizzle(), t, -0.3, g * 0.5)
    elif k == 'tap': put(sfx, S_tap(), t, 0.2, g * 0.45)
    elif k == 'snore': put(sfx, S_snore(), t, 0.1, g * 0.6)
    elif k == 'step': put(sfx, S_step(), t, 0, g * 0.5)
    elif k == 'send': put(sfx, S_whoosh(0.4, 600, 5000, up=True), t, 0, g * 0.3)
    elif k == 'ding': put(sfx, S_ding(), t, 0.25, g * 0.5)
    elif k == 'reveal': put(sfx, S_shimmer(1.6, 1046.5), t, 0, g * 0.5)
    elif k == 'sparkle': put(sfx, S_sparkle(), t, 0, g * 0.6)
    elif k == 'firework': put(sfx, S_firework(), t, (-0.4, 0.4, 0.0)[int(t * 7) % 3], g * 0.35)

# ---------------- voice ----------------
voice = np.zeros(N)
for l in TL['lines']:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', l['file'], '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    v = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    i = int(l['start'] * SR); j = min(N, i + len(v)); voice[i:j] += v[:j - i]
voice = hp(voice, 85)
# gentle presence lift + compression in ffmpeg
def ff_process(x, af):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-',
                        '-af', af, '-f', 'f64le', '-ac', '1', '-'], input=x.astype(np.float64).tobytes(), capture_output=True, check=True)
    y = np.frombuffer(p.stdout, dtype=np.float64)
    out = np.zeros(N); out[:min(N, len(y))] = y[:N]; return out
voice = ff_process(voice, 'equalizer=f=3200:t=q:w=1.2:g=2.5,equalizer=f=220:t=q:w=1:g=-1.5,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=3dB')

# ---------------- mix ----------------
music = 0.9 * pad + 1.0 * tiple + 0.9 * bass + 0.8 * drums + 0.9 * mel + 0.8 * bells
music = reverb(music, 0.22)
sfx = reverb(sfx, 0.18)
# duck the music under the voice (~ -9 dB) with a smooth envelope
env = np.abs(voice)
env = lfilter([1 - np.exp(-1 / (0.03 * SR))], [1, -np.exp(-1 / (0.03 * SR))], env)
env = np.maximum.accumulate(env[::-1])[::-1] * 0 + env
win = int(0.45 * SR)
env = np.convolve(env, np.ones(win) / win, mode='same')
env = np.clip(env / (np.percentile(env[env > 1e-4], 60) + 1e-9), 0, 1)
duck = 1 - 0.7 * env
music *= duck
# tail fade
fade = np.ones(N); k = int((DUR - 0.9) * SR); fade[k:] = np.linspace(1, 0, N - k) ** 1.5
VG, MG, SG = 1.0, 0.125, 0.6
mix = np.vstack([voice, voice]) * VG + music * MG + sfx * SG
mix *= fade
def wav(path, x):
    x = x / max(1.0, np.max(np.abs(x)) / 0.98)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', path],
                   input=x.T.astype(np.float64).tobytes(), check=True)
pre = 'out/premaster.wav'; wav(pre, mix)
if os.environ.get('STEMS'):
    wav('out/stem-voice.wav', np.vstack([voice, voice]) * VG * fade)
    wav('out/stem-music.wav', music * MG * fade)
    wav('out/stem-sfx.wav', sfx * SG * fade)
# two-pass loudness to -14 LUFS, true peak -1.5 dBTP
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', pre, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True).stderr
js = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
      f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,aresample=48000")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', pre, '-af', af, '-c:a', 'pcm_s24le', 'out/music.wav'], check=True)
print('wrote out/music.wav', js['input_i'], '->', '-14 LUFS')
