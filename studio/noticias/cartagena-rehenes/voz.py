#!/usr/bin/env python3
"""Voz (Kokoro, em_alex: la misma de los Shorts del canal) + tiempos por palabra.

Uso: python3 -I voz.py guion.json salida_dir
Genera salida_dir/narracion.wav y salida_dir/tiempos.json.

Los tiempos por palabra se reparten por sílabas y se alinean con las pausas
reales del audio (cada coma o punto se ancla al silencio detectado más cercano),
para que los subtítulos queden sincronizados con la voz.
"""
import json
import os
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 24000
VOICE = os.environ.get("VOICE", "em_alex")
SPEED = float(os.environ.get("SPEED", "0.98"))  # un poco más pausado: tono sereno
KOKORO = Path(os.environ.get("KOKORO_DIR", "/tmp/kokoro"))
LEAD = 0.12  # la voz arranca casi en el primer fotograma (gancho)


def spoken(tok):
    t = tok
    m = re.fullmatch(r"(\d{1,2}):(\d{2})\W*", t)
    if m:
        return "dos y media" if m.group(2) == "30" else "las horas"
    if re.search(r"\d", t):
        from num2words import num2words
        t = re.sub(r"(\d{1,3}(?:\.\d{3})+)", lambda mm: mm.group(1).replace(".", ""), t)
        t = re.sub(r"\d+", lambda mm: num2words(int(mm.group(0)), lang="es"), t)
    return t


def syllables(tok):
    s = spoken(tok).lower()
    n = len(re.findall(r"[aeiouáéíóúü]+", s))
    return max(1, n)


def trim(x, thr=0.006):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    pad = int(0.03 * SR)
    return x[max(0, idx[0] - pad): min(len(x), idx[-1] + pad)]


def silences(x, min_len=0.09):
    """Devuelve (inicio, fin) en segundos de los silencios internos."""
    hop = int(0.01 * SR)
    frames = len(x) // hop
    e = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) for i in range(frames)])
    thr = max(0.004, np.percentile(e, 60) * 0.08)
    quiet = e < thr
    out, i = [], 0
    while i < frames:
        if quiet[i]:
            j = i
            while j < frames and quiet[j]:
                j += 1
            a, b = i * hop / SR, j * hop / SR
            if b - a >= min_len and a > 0.15 and b < len(x) / SR - 0.15:
                out.append((a, b))
            i = j
        else:
            i += 1
    return out


def distribute(words, a, b):
    w = [syllables(t) + (0.6 if t.endswith((",", ".", ":", "?")) else 0) for t in words]
    tot = sum(w)
    res, cur = [], a
    for t, wt in zip(words, w):
        d = (b - a) * wt / tot
        res.append((cur, cur + d))
        cur += d
    return res


def word_times(text, x, start):
    words = text.split()
    dur = len(x) / SR
    # cortes en signos de puntuación internos
    breaks = [i for i, t in enumerate(words[:-1]) if re.search(r"[,.:;?]$", t)]
    sil = silences(x)
    spans = []
    if breaks and len(sil) >= len(breaks):
        # elegir, en orden, el silencio más cercano a la posición estimada de cada corte
        est = distribute(words, 0, dur)
        chosen, used = [], set()
        for bi in breaks:
            target = est[bi][1]
            cands = [(abs((s[0] + s[1]) / 2 - target), k) for k, s in enumerate(sil) if k not in used and (not chosen or s[0] > chosen[-1][1])]
            if not cands:
                chosen = None
                break
            _, k = min(cands)
            used.add(k)
            chosen.append(sil[k])
        if chosen:
            seg_start, wi = 0.0, 0
            for bi, s in zip(breaks, chosen):
                spans += distribute(words[wi:bi + 1], seg_start, s[0])
                seg_start, wi = s[1], bi + 1
            spans += distribute(words[wi:], seg_start, dur)
    if not spans:
        spans = distribute(words, 0, dur)
    return [{"w": t, "start": round(start + a, 3), "end": round(start + b, 3)} for t, (a, b) in zip(words, spans)]


def mark_keys(words, keys):
    norm = lambda s: re.sub(r"[^\wáéíóúñü:.]", "", s.lower()).strip(".")
    toks = [norm(w["w"]) for w in words]
    for k in keys:
        kt = [norm(t) for t in k.split()]
        for i in range(len(toks) - len(kt) + 1):
            if toks[i:i + len(kt)] == kt:
                for j in range(i, i + len(kt)):
                    words[j]["key"] = True
                break
        else:
            print(f"  AVISO: no encontré la clave «{k}»", flush=True)


def main():
    spec = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    out = Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    from kokoro_onnx import Kokoro
    k = Kokoro(str(KOKORO / "kokoro-v1.0.onnx"), str(KOKORO / "voices-v1.0.bin"))
    pieces = [np.zeros(int(LEAD * SR), dtype=np.float32)]
    cursor = LEAD
    sents = []
    prev_sec = None
    for i, s in enumerate(spec["sentences"]):
        # pausa más larga al cambiar de bloque: da aire a la transición
        if i > 0:
            gap = 0.62 if s["sec"] != prev_sec else 0.32
            pieces.append(np.zeros(int(gap * SR), dtype=np.float32))
            cursor += gap
        prev_sec = s["sec"]
        text_tts = s.get("tts") or s["text"]
        samples, sr = k.create(text_tts, voice=VOICE, speed=SPEED, lang="es")
        assert sr == SR
        x = trim(np.asarray(samples, dtype=np.float32))
        words = word_times(s["text"], x, cursor)
        mark_keys(words, s.get("keys", []))
        dur = len(x) / SR
        sents.append({"sec": s["sec"], "start": round(cursor, 3), "end": round(cursor + dur, 3), "words": words})
        print(f"  {i + 1:2d} [{s['sec']:10s}] {cursor:6.2f}-{cursor + dur:6.2f}s  {s['text'][:60]}", flush=True)
        pieces.append(x)
        cursor += dur
    audio = np.concatenate(pieces)
    sf.write(str(out / "narracion.wav"), audio, SR)
    (out / "tiempos.json").write_text(json.dumps({"sentences": sents, "narrationEnd": round(cursor, 3)}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Narración: {cursor:.2f}s")


if __name__ == "__main__":
    main()
