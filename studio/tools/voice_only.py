#!/usr/bin/env python3
"""Narración sin música para las historias de canciones.

Uso: python3 -I studio/tools/voice_only.py studio/specs/<slug>.json
Genera studio/public/audio.wav (solo voz Alex, normalizada) y studio/work/props.json.
La voz arranca casi en el segundo 0 y las pausas entre frases son cortas.
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
WORK, PUBLIC = ROOT / "work", ROOT / "public"
KOKORO = Path(os.environ.get("KOKORO_DIR", "/tmp/kokoro"))
SR = 24000
VOICE = os.environ.get("VOICE", "em_alex")
SPEED = float(os.environ.get("SPEED", "1.0"))
LEAD = 0.06
TAIL = float(os.environ.get("TAIL", "2.2"))


def trim(x, thr=0.008):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    pad = int(0.03 * SR)
    return x[max(0, idx[0] - pad): min(len(x), idx[-1] + pad)]


def word_timings(text, start, end):
    words = text.split()
    weights = []
    for w in words:
        b = len(re.sub(r"[^\w]", "", w)) + 1.5
        if w.endswith((",", ";", ":")):
            b += 2
        if w.endswith((".", "?", "!", "…")):
            b += 3
        weights.append(b)
    tot = sum(weights) or 1
    out, cur = [], start
    for w, wt in zip(words, weights):
        d = (end - start) * wt / tot
        out.append({"w": w, "start": round(cur, 3), "end": round(cur + d, 3)})
        cur += d
    return out


def main():
    from kokoro_onnx import Kokoro

    spec = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    k = Kokoro(str(KOKORO / "kokoro-v1.0.onnx"), str(KOKORO / "voices-v1.0.bin"))
    pieces = [np.zeros(int(LEAD * SR), dtype=np.float32)]
    cursor, timings = LEAD, []
    for i, s in enumerate(spec["sentences"]):
        spoken = s.get("tts") or s["text"]
        samples, sr = k.create(spoken, voice=VOICE, speed=SPEED, lang="es")
        x = trim(np.asarray(samples, dtype=np.float32))
        dur = len(x) / SR
        start, end = cursor, cursor + dur
        pieces.append(x)
        gap = 0.32 if s["text"].rstrip().endswith("?") else 0.24
        pieces.append(np.zeros(int(gap * SR), dtype=np.float32))
        cursor = end + gap
        timings.append({"start": round(start, 3), "end": round(end, 3), "words": word_timings(s["text"], start, end)})
        print(f"  {i + 1:2d} {s['scene']:<9} {start:6.2f}-{end:6.2f} ({dur:.2f}s)", flush=True)
    n = len(timings)
    for i, t in enumerate(timings):
        t["sceneStart"] = 0.0 if i == 0 else round(t["start"] - 0.1, 3)
        t["sceneEnd"] = round(timings[i + 1]["start"] - 0.1, 3) if i < n - 1 else None
    total = round(timings[-1]["end"] + TAIL, 3)
    timings[-1]["sceneEnd"] = total
    narr = np.concatenate(pieces)
    narr = np.concatenate([narr, np.zeros(max(0, int(total * SR) - len(narr)), dtype=np.float32)])[: int(total * SR)]
    WORK.mkdir(exist_ok=True)
    PUBLIC.mkdir(exist_ok=True)
    raw = WORK / "narration.wav"
    sf.write(str(raw), narr, SR)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af",
                    "highpass=f=70,aresample=48000,loudnorm=I=-15:TP=-1.5:LRA=9,aresample=48000",
                    "-ac", "2", "-ar", "48000", "-t", f"{total:.3f}", str(PUBLIC / "audio.wav")], check=True)
    props = {"spec": spec, "timings": timings, "totalSeconds": total, "outroStart": timings[-1]["start"], "audioFile": "audio.wav"}
    (WORK / "props.json").write_text(json.dumps(props, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"total {total:.2f}s")


if __name__ == "__main__":
    main()
