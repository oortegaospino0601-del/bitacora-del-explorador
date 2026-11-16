#!/usr/bin/env python3
"""Narración para las historias animadas de canciones.

Uso: python3 -I studio/tools/historia_voz.py studio/historias/<slug>.json

Genera la voz (Kokoro, em_alex) de cada frase, ajusta la duración de cada escena a su
frase y escribe:
  - studio/public/historia/audio-<slug>.wav  (voz + lluvia suave de fondo)
  - studio/src/styles/historia/timeline.json (duraciones de escena y tiempos de palabras)
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import os  # noqa: E402
os.environ.setdefault("SPEED", "0.96")
import make  # noqa: E402  (reutiliza voz, números a palabras y tiempos de palabras)

ROOT = HERE.parent
SR = make.SR
MIN_SCENE = 3.4   # s mínimos por escena (para que la animación respire)
LEAD = 0.35       # la voz entra un poco después de que empieza el fundido de la escena
TAIL = 0.75        # silencio tras la frase antes de la siguiente escena
END_TAIL = 1.9    # cola final para el fundido a negro
MAX_TOTAL = 59.5  # el tramo de canción con licencia en Shorts es de 60 s como máximo
# Nivel de lluvia por escena (0 = nada, 1 = máximo), en el orden de las escenas.
RAIN = [0.55, 0.3, 0.25, 0.04, 0.04, 0.2, 1.0, 1.0, 0.8, 1.0, 0.25, 0.15, 0.0]


def main(spec_path):
    from kokoro_onnx import Kokoro

    spec = json.loads(Path(spec_path).read_text())
    slug = spec["slug"]
    make.ensure_models()
    k = Kokoro(str(make.KOKORO / "kokoro-v1.0.onnx"), str(make.KOKORO / "voices-v1.0.bin"))

    clips = []
    for i, ln in enumerate(spec["lines"]):
        spoken = ln.get("tts") or make.expand_numbers(ln["text"])
        x, sr = k.create(spoken, voice=make.VOICE, speed=make.SPEED, lang="es")
        assert sr == SR
        clips.append(make.trim(np.asarray(x, dtype=np.float32)))

    n = len(clips)
    durs, lines, start = [], [], 0.0
    for i, c in enumerate(clips):
        vd = len(c) / SR
        lead = 0.45 if i == 0 else LEAD
        d = max(MIN_SCENE, lead + vd + (END_TAIL if i == n - 1 else TAIL))
        vs = start + lead
        text = spec["lines"][i]["text"]
        lines.append({"start": round(vs, 3), "end": round(vs + vd, 3), "text": text, "words": make.word_timings(text, vs, vs + vd)})
        print(f"  escena {i + 1:2d}: voz {vd:4.2f}s  escena {d:4.2f}s  «{text}»", flush=True)
        durs.append(round(d, 3))
        start += d
    total = round(start, 3)
    print(f"  TOTAL {total:.2f}s")
    if total > MAX_TOTAL:
        raise SystemExit(f"Dura {total:.1f}s (>{MAX_TOTAL}s). Acorta frases o sube SPEED.")

    voice = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for ln, c in zip(lines, clips):
        a = int(ln["start"] * SR)
        voice[a:a + len(c)] += c
    work = ROOT / "work"
    work.mkdir(exist_ok=True)
    sf.write(str(work / "voz.wav"), voice, SR)

    starts = np.cumsum([0] + durs[:-1])
    pts = []
    for s, d, lv in zip(starts, durs, RAIN + [0] * (n - len(RAIN))):
        pts += [f"{s + 0.3:.2f}:{lv}", f"{s + d:.2f}:{lv}"]
    pts = ["0:" + str(RAIN[0])] + pts + [f"{total + 1:.2f}:0"]
    subprocess.run([sys.executable, "-I", str(HERE / "ambiente_lluvia.py"), str(work / "lluvia.wav"), f"{total + 1:.2f}", ",".join(pts)], check=True)

    out = ROOT / "public" / "historia" / f"audio-{slug}.wav"
    out.parent.mkdir(parents=True, exist_ok=True)
    fc = (
        "[0]aresample=44100,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=44100,pan=stereo|c0=c0|c1=c0[v];"
        "[1]volume=0.55[r];"
        f"[v][r]amix=inputs=2:normalize=0:duration=longest,atrim=0:{total:.3f}[m]"
    )
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(work / "voz.wav"), "-i", str(work / "lluvia.wav"),
                    "-filter_complex", fc, "-map", "[m]", "-ar", "44100", "-ac", "2", str(out)], check=True)

    tl = {"slug": slug, "hook": spec.get("hook", ""), "durations": durs, "lines": lines, "total": total, "audio": f"historia/audio-{slug}.wav"}
    (ROOT / "src" / "styles" / "historia" / "timeline.json").write_text(json.dumps(tl, ensure_ascii=False, indent=1))
    print("ok", out)


if __name__ == "__main__":
    main(sys.argv[1])
