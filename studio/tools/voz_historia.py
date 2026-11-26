#!/usr/bin/env python3
"""Voz sola (sin música) para videos de historia de canciones.
Uso: python3 -I studio/tools/voz_historia.py studio/specs/<slug>.json
Genera studio/public/<slug>-voz.wav (48 kHz, normalizada) y studio/work/<slug>-props.json
"""
import json, re, subprocess, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent
SR = 24000
spec = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
slug = spec["slug"]
k = Kokoro("/tmp/kokoro/kokoro-v1.0.onnx", "/tmp/kokoro/voices-v1.0.bin")

def trim(x, thr=0.008):
    idx = np.where(np.abs(x) > thr)[0]
    pad = int(0.03 * SR)
    return x[max(0, idx[0] - pad): min(len(x), idx[-1] + pad)]

def word_timings(text, start, end):
    words = text.split()
    w8 = []
    for w in words:
        b = len(re.sub(r"[^\w]", "", w)) + 1.5
        if w.endswith((",", ";", ":")): b += 2.5
        if w.endswith((".", "?", "!", "…")): b += 3.5
        w8.append(b)
    tot = sum(w8); cur = start; out = []
    for w, wt in zip(words, w8):
        d = (end - start) * wt / tot
        out.append({"w": w, "start": round(cur, 3), "end": round(cur + d, 3)}); cur += d
    return out

pieces, timings, cursor = [], [], 0.0
for i, s in enumerate(spec["sentences"]):
    x, sr = k.create(s.get("tts", s["text"]), voice="em_alex", speed=float(s.get("speed", 1.04)), lang="es")
    x = trim(np.asarray(x, dtype=np.float32))
    if i == 0:
        # sin colchón al inicio: la voz arranca en el segundo 0
        idx = np.where(np.abs(x) > 0.008)[0]; x = x[max(0, idx[0] - int(0.01 * SR)):]
    dur = len(x) / SR
    timings.append({"start": round(cursor, 3), "end": round(cursor + dur, 3),
                    "words": word_timings(s["text"], cursor, cursor + dur)})
    gap = 0.32 if i < len(spec["sentences"]) - 1 else 0.0
    pieces += [x, np.zeros(int(gap * SR), dtype=np.float32)]
    cursor += dur + gap
    print(f"{i+1}: {dur:.2f}s", flush=True)
tail = float(spec.get("tail", 1.6))
pieces.append(np.zeros(int(tail * SR), dtype=np.float32))
total = round(cursor + tail, 3)
for i, t in enumerate(timings):
    t["sceneStart"] = 0.0 if i == 0 else round(t["start"] - 0.16, 3)
    t["sceneEnd"] = round(timings[i + 1]["start"] - 0.16, 3) if i < len(timings) - 1 else total
(ROOT / "work").mkdir(exist_ok=True); (ROOT / "public").mkdir(exist_ok=True)
raw = ROOT / "work" / f"{slug}-raw.wav"
sf.write(str(raw), np.concatenate(pieces), SR)
out = ROOT / "public" / f"{slug}-voz.wav"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af",
                "aresample=48000,loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "48000", "-ac", "2", str(out)], check=True)
props = {"spec": spec, "timings": timings, "totalSeconds": total, "audioFile": out.name}
(ROOT / "work" / f"{slug}-props.json").write_text(json.dumps(props, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"TOTAL {total:.2f}s")
