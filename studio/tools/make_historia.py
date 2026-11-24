#!/usr/bin/env python3
"""Historia de canción: narración (Kokoro em_alex) SOLO VOZ + render Remotion.

Uso:
  python3 -I studio/tools/make_historia.py studio/specs/<slug>.json voice   # voz + props
  python3 -I studio/tools/make_historia.py studio/specs/<slug>.json render  # render + verificación
  python3 -I studio/tools/make_historia.py studio/specs/<slug>.json all

Diferencias con make.py: sin fondo sonoro (la canción se añade en TikTok), la voz
empieza en el segundo 0 (gancho) y las escenas se agrupan por id ("scene": "hook").
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
sys.path.insert(0, str(ROOT / "tools"))
import make  # noqa: E402  (reutiliza modelos, trim, números y find_chrome)

WORK, OUT, PUBLIC = make.WORK, make.OUT, make.PUBLIC
SR = make.SR
VOICE = os.environ.get("VOICE", "em_alex")
SPEED = float(os.environ.get("SPEED", "1.06"))
LEAD = 0.06
TAIL = float(os.environ.get("TAIL", "1.6"))


def word_timings(text, start, end):
    words = text.split()
    weights = []
    for w in words:
        base = len(re.sub(r"[^\w]", "", w)) + 1.2
        if w.endswith((",", ";", ":")):
            base += 2.2
        if w.endswith((".", "?", "!", "…", "»")):
            base += 3.2
        weights.append(base)
    total = sum(weights) or 1
    out, cur = [], start
    for w, wt in zip(words, weights):
        d = (end - start) * wt / total
        out.append({"w": w, "start": round(cur, 3), "end": round(cur + d, 3)})
        cur += d
    return out


def voice(spec):
    from kokoro_onnx import Kokoro

    make.ensure_models()
    k = Kokoro(str(make.KOKORO / "kokoro-v1.0.onnx"), str(make.KOKORO / "voices-v1.0.bin"))
    pieces = [np.zeros(int(LEAD * SR), dtype=np.float32)]
    cursor, timings = LEAD, []
    for i, s in enumerate(spec["sentences"]):
        spoken = s.get("tts") or make.expand_numbers(s["text"])
        samples, sr = k.create(spoken, voice=VOICE, speed=SPEED, lang="es")
        assert sr == SR
        x = make.trim(np.asarray(samples, dtype=np.float32))
        if i == 0:  # el gancho arranca en seco: quita el relleno inicial del recorte
            idx = np.where(np.abs(x) > 0.008)[0]
            x = x[max(0, idx[0] - int(0.01 * SR)):]
        dur = len(x) / SR
        start, end = cursor, cursor + dur
        pieces.append(x)
        nxt = spec["sentences"][i + 1]["scene"] if i + 1 < len(spec["sentences"]) else None
        gap = 0.34 if s["text"].rstrip().endswith("?") else 0.2
        if nxt and nxt != s["scene"]:
            gap += 0.06
        pieces.append(np.zeros(int(gap * SR), dtype=np.float32))
        cursor = end + gap
        timings.append({"start": round(start, 3), "end": round(end, 3), "scene": s["scene"],
                        "words": word_timings(s["text"], start, end)})
        print(f"  frase {i + 1:2d} [{s['scene']:8s}] {start:5.2f}-{end:5.2f}s ({dur:.2f}s)", flush=True)
    total = round(timings[-1]["end"] + TAIL, 3)
    # bloques de escena: [{id, start, end}]
    scenes = []
    for t in timings:
        if scenes and scenes[-1]["id"] == t["scene"]:
            continue
        st = 0.0 if not scenes else round(t["start"] - 0.1, 3)
        if scenes:
            scenes[-1]["end"] = st
        scenes.append({"id": t["scene"], "start": st, "end": total})
    nar = np.concatenate(pieces)
    nar = np.concatenate([nar, np.zeros(max(0, int(total * SR) - len(nar)), dtype=np.float32)])[: int(total * SR)]
    WORK.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    raw = WORK / "narration.wav"
    sf.write(str(raw), nar, SR)
    # solo voz: normaliza a -14 LUFS (volumen alto y claro para móvil), 48 kHz estéreo
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af",
                    "highpass=f=70,aresample=48000,loudnorm=I=-14:TP=-1.2:LRA=9,aresample=48000",
                    "-ac", "2", "-ar", "48000", str(PUBLIC / "audio.wav")], check=True)
    props = {"spec": spec, "timings": timings, "scenes": scenes, "totalSeconds": total, "audioFile": "audio.wav"}
    (WORK / "props.json").write_text(json.dumps(props, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Duración total: {total:.2f}s")
    for sc in scenes:
        print(f"  escena {sc['id']:8s} {sc['start']:6.2f} - {sc['end']:6.2f}")


def render(spec):
    OUT.mkdir(parents=True, exist_ok=True)
    mp4 = OUT / f"{spec['slug']}.mp4"
    cmd = ["npx", "remotion", "render", "src/index.ts", spec["composition"], str(mp4),
           f"--props={WORK / 'props.json'}", f"--browser-executable={make.find_chrome()}",
           "--chrome-mode=chrome-for-testing", "--crf=20", "--audio-codec=aac", "--audio-bitrate=192k",
           f"--concurrency={os.cpu_count() or 2}", "--log=warn"]
    if os.environ.get("FRAMES"):
        cmd.append(f"--frames={os.environ['FRAMES']}")
    subprocess.run(cmd, check=True, cwd=str(ROOT))
    print(f"MP4: {mp4}")


def main():
    spec = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    stage = sys.argv[2] if len(sys.argv) > 2 else "all"
    if stage in ("voice", "all"):
        voice(spec)
    if stage in ("render", "all"):
        render(spec)


if __name__ == "__main__":
    main()
