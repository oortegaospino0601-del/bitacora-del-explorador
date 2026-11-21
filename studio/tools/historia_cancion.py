#!/usr/bin/env python3
"""Historias de canciones (serie del reproductor): voz Alex + tiempos + render.

Uso:  python3 -I studio/tools/historia_cancion.py studio/specs/<slug>.json [--audio-only]

Mismo formato que "Cosas que no te dije": voz masculina Kokoro em_alex a 0,96,
frases separadas por ~1 s, solo voz (sin música, la canción se pone en TikTok),
volumen integrado de -14 LUFS, 1080x1920 a 30 fps y composición Historia-cancion.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import make  # noqa: E402  (expand_numbers, trim, word_timings, find_chrome, ensure_models)

ROOT = make.ROOT
WORK, OUT, PUBLIC = make.WORK, make.OUT, make.PUBLIC
SR = make.SR
LEAD = 0.29     # la voz entra casi de inmediato (como en la referencia)
GAP = 0.85      # pausa entre frases (~0,95 s medidos en la referencia)
TAIL = 1.25     # cola tras la última frase


def internal_pauses(x):
    """Centros (s) de las pausas internas de la voz (>= 90 ms)."""
    hop = int(0.01 * SR)
    rms = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)])
    quiet = rms < max(0.006, 0.08 * np.percentile(rms, 90))
    out, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            if i > 8 and j < len(quiet) - 8 and (j - i) >= 9:
                out.append((i, j))
            i = j
        else:
            i += 1
    return [(a * 0.01, b * 0.01) for a, b in out]


def aligned(text, x, start):
    """Reparto proporcional, anclando cada pausa de puntuación a la pausa real más cercana."""
    dur = len(x) / SR
    words = text.split()
    base = make.word_timings(text, 0, dur)
    pauses = internal_pauses(x)
    marks = [i for i, w in enumerate(words[:-1]) if re.search(r"[,;:.…?!]$", w)]
    anchors = []
    for i in marks:
        est = base[i]["end"]
        if not pauses:
            break
        a, b = min(pauses, key=lambda p: abs((p[0] + p[1]) / 2 - est))
        if abs((a + b) / 2 - est) < 0.6:
            anchors.append((i, a, b))
    # tramos entre anclas: se reparte por peso de pronunciación dentro de cada tramo
    out = [None] * len(words)
    seg_start_word, seg_t = 0, 0.0
    for i, a, b in anchors + [(len(words) - 1, dur, dur)]:
        if i < seg_start_word:
            continue
        sub = " ".join(words[seg_start_word:i + 1])
        tm = make.word_timings(sub, seg_t, a)
        for k, w in enumerate(tm):
            out[seg_start_word + k] = w
        seg_start_word, seg_t = i + 1, b
    return [{"w": w["w"], "start": round(start + w["start"], 3), "end": round(start + w["end"], 3)} for w in out]


def build(spec):
    from kokoro_onnx import Kokoro

    make.ensure_models()
    k = Kokoro(str(make.KOKORO / "kokoro-v1.0.onnx"), str(make.KOKORO / "voices-v1.0.bin"))
    voice, speed = spec.get("voice", "em_alex"), float(spec.get("speed", 0.96))
    pieces = [np.zeros(int(LEAD * SR), dtype=np.float32)]
    cursor, timings = LEAD, []
    for i, s in enumerate(spec["sentences"]):
        spoken = s.get("tts") or make.expand_numbers(s["text"])
        samples, sr = k.create(spoken, voice=voice, speed=speed, lang="es")
        assert sr == SR
        x = make.trim(np.asarray(samples, dtype=np.float32))
        st, en = cursor, cursor + len(x) / SR
        timings.append({"start": round(st, 3), "end": round(en, 3), "words": aligned(s["text"], x, st)})
        pieces += [x, np.zeros(int(GAP * SR), dtype=np.float32)]
        cursor = en + GAP
        print(f"  frase {i + 1}: {len(x) / SR:.2f}s  «{s['text'][:60]}»", flush=True)
    for i, t in enumerate(timings):
        prev_end = timings[i - 1]["end"] if i else 0
        t["sceneStart"] = 0.0 if i == 0 else round((prev_end + t["start"]) / 2 - 0.45, 3)
    total = round(timings[-1]["end"] + TAIL, 3)
    for i, t in enumerate(timings):
        t["sceneEnd"] = timings[i + 1]["sceneStart"] if i < len(timings) - 1 else total
    nar = np.concatenate(pieces)[: int(total * SR)]
    nar = np.pad(nar, (0, max(0, int(total * SR) - len(nar))))
    WORK.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    sf.write(WORK / "narration.wav", nar, SR)
    # solo voz, dos pasadas de loudnorm a -14 LUFS
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(WORK / "narration.wav"), "-af",
                           "loudnorm=I=-14:TP=-1.5:LRA=7:print_format=json", "-f", "null", "-"],
                          capture_output=True, text=True).stderr
    m = json.loads(meas[meas.rindex("{"):meas.rindex("}") + 1])
    af = (f"loudnorm=I=-12.7:TP=-1.2:LRA=7:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,volume=1.0dB,"
          f"aresample=48000,apad,atrim=0:{total}")
    make.sh(["ffmpeg", "-y", "-loglevel", "error", "-i", str(WORK / "narration.wav"), "-af", af,
             "-ac", "2", "-ar", "48000", str(PUBLIC / "audio.wav")])
    return timings, total


def main():
    spec = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    timings, total = build(spec)
    print(f"Duración total: {total:.2f}s")
    if total > 59.5:
        raise SystemExit("Demasiado largo: acorta el guion")
    props = {"spec": spec, "timings": timings, "totalSeconds": total, "outroStart": timings[-1]["sceneStart"], "audioFile": "audio.wav"}
    (WORK / "props.json").write_text(json.dumps(props, ensure_ascii=False), encoding="utf-8")
    if "--audio-only" in sys.argv:
        return
    OUT.mkdir(parents=True, exist_ok=True)
    mp4 = OUT / f"{spec['slug']}.mp4"
    make.sh(["npx", "remotion", "render", "src/index.ts", spec.get("composition", "Historia-cancion"), str(mp4),
             f"--props={WORK / 'props.json'}", f"--browser-executable={make.find_chrome()}",
             "--chrome-mode=chrome-for-testing", "--crf=18", "--pixel-format=yuv420p", "--concurrency=6", "--log=warn"], cwd=str(ROOT))
    print(mp4)


if __name__ == "__main__":
    main()
