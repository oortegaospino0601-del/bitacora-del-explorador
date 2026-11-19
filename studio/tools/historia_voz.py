#!/usr/bin/env python3
"""Narración, música y línea de tiempo para las historias animadas de canciones.

Uso: python3 -I studio/tools/historia_voz.py studio/historias/<slug>.json

Genera la voz (Kokoro, em_alex) de cada frase, ajusta la duración de cada escena a su frase,
crea la base musical original y la lluvia, y escribe:
  - studio/public/historia/audio-<slug>.wav              (voz + música con ducking + lluvia)
  - studio/src/styles/historia/timeline-<slug>.json      (escenas, tiempos de palabras, canción)

Campos del JSON: slug, hook, song{title,artists,cardLine}, flash[escenas], speed, tail, minScene,
lines[{scene,text,tts?,rain?}], music{bpm, drumsFromLine, dropAtLine, backAtLine} (opcional).
"""
import json
import os
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
spec = json.loads(Path(sys.argv[1]).read_text())
os.environ.setdefault("SPEED", str(spec.get("speed", 0.96)))
os.environ.setdefault("VOICE", spec.get("voice", "em_alex"))
import make  # noqa: E402  (reutiliza voz, números a palabras y tiempos de palabras)

ROOT = HERE.parent
SR = make.SR
MIN_SCENE = spec.get("minScene", 3.4)
LEAD = 0.3
TAIL = spec.get("tail", 0.75)
END_TAIL = 1.9
MAX_TOTAL = 59.5  # Shorts con canción con licencia: 60 s


def gaps(clip):
    """Centros (s) de las pausas internas de la voz (>= 40 ms)."""
    hop = int(0.01 * SR)
    rms = np.array([np.sqrt(np.mean(clip[i:i + hop] ** 2)) for i in range(0, len(clip) - hop, hop)])
    quiet = rms < max(0.006, 0.08 * np.percentile(rms, 90))
    out, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            if i > 5 and j < len(quiet) - 5 and (j - i) >= 4:
                out.append((i + j) / 2 * 0.01)
            i = j
        else:
            i += 1
    return out


def spoken_weight(w):
    """Peso de una palabra según cómo se pronuncia (las cifras pesan lo que se dicen)."""
    import re
    m = re.match(r"^(\d+):(\d+)", w)
    if m:
        from num2words import num2words
        core = num2words(int(m.group(1)), lang="es") + " y " + num2words(int(m.group(2)), lang="es")
    else:
        core = make.expand_numbers(w)
    base = len(re.sub(r"[^\w]", "", core)) + 1.5
    if w.endswith((",", ";", ":")):
        base += 2
    if w.endswith((".", "?", "!", "…")):
        base += 3
    return base


def aligned_timings(text, clip, vs):
    """Tiempos de palabras: reparto por pronunciación y cada signo de puntuación interno anclado a la
    pausa real más cercana a donde se espera (si no hay ninguna a menos de 0,4 s, queda la estimación)."""
    vd = len(clip) / SR
    words = text.split()
    wt = [spoken_weight(w) for w in words]
    tot = sum(wt)
    cum = np.cumsum([0] + wt) / tot * vd
    cuts = [i + 1 for i, w in enumerate(words[:-1]) if w.endswith((",", ".", ":", ";", "…", "?", "!"))]
    g = gaps(clip)
    anchors = {0: 0.0, len(words): vd}
    prev = 0.0
    for c in cuts:
        est = cum[c]
        near = [x for x in g if abs(x - est) < 0.4 and x > prev + 0.15]
        t = min(near, key=lambda x: abs(x - est)) if near else est
        anchors[c] = t
        prev = t
    keys = sorted(anchors)
    out = []
    for k0, k1 in zip(keys, keys[1:]):
        a, b = anchors[k0], anchors[k1]
        sw = sum(wt[k0:k1])
        cur = a
        for i in range(k0, k1):
            d = (b - a) * wt[i] / sw
            out.append({"w": words[i], "start": round(vs + cur, 3), "end": round(vs + cur + d, 3)})
            cur += d
    return out


def main():
    from kokoro_onnx import Kokoro

    slug = spec["slug"]
    make.ensure_models()
    k = Kokoro(str(make.KOKORO / "kokoro-v1.0.onnx"), str(make.KOKORO / "voices-v1.0.bin"))
    clips = []
    for ln in spec["lines"]:
        spoken = ln.get("tts") or make.expand_numbers(ln["text"])
        x, sr = k.create(spoken, voice=make.VOICE, speed=make.SPEED, lang="es")
        assert sr == SR
        clips.append(make.trim(np.asarray(x, dtype=np.float32)))

    n = len(clips)
    durs, lines, start = [], [], 0.0
    for i, c in enumerate(clips):
        vd = len(c) / SR
        lead = 0.25 if i == 0 else LEAD
        d = max(MIN_SCENE, lead + vd + (END_TAIL if i == n - 1 else TAIL))
        vs = start + lead
        ln = spec["lines"][i]
        lines.append({"start": round(vs, 3), "end": round(vs + vd, 3), "text": ln["text"], "scene": ln["scene"],
                      "words": aligned_timings(ln["text"], c, vs) if spec.get("align") else make.word_timings(ln["text"], vs, vs + vd)})
        print(f"  escena {i + 1:2d} {ln['scene']:<16} voz {vd:4.2f}s  escena {d:4.2f}s  «{ln['text']}»", flush=True)
        durs.append(round(d, 3))
        start += d
    total = round(start, 3)
    print(f"  TOTAL {total:.2f}s")
    if total > MAX_TOTAL:
        raise SystemExit(f"Dura {total:.1f}s (>{MAX_TOTAL}s). Acorta frases o sube speed.")

    work = ROOT / "work"
    work.mkdir(exist_ok=True)
    voice = np.zeros(int((total + 1) * SR), dtype=np.float32)
    for ln, c in zip(lines, clips):
        a = int(ln["start"] * SR)
        voice[a:a + len(c)] += c
    sf.write(str(work / "voz.wav"), voice, SR)

    starts = [0.0]
    for d in durs[:-1]:
        starts.append(starts[-1] + d)
    pts = [f"0:{spec['lines'][0].get('rain', 0.3)}"]
    for s, d, ln in zip(starts, durs, spec["lines"]):
        lv = ln.get("rain", 0.3)
        pts += [f"{s + 0.3:.2f}:{lv}", f"{s + d:.2f}:{lv}"]
    pts.append(f"{total + 1:.2f}:0")
    solo_voz = spec.get("ambient") is False  # solo narración: sin música ni lluvia (la canción se pone al subir)
    if not solo_voz:
        subprocess.run([sys.executable, "-I", str(HERE / "ambiente_lluvia.py"), str(work / "lluvia.wav"), f"{total + 1:.2f}", ",".join(pts)], check=True)

    inputs = ["-i", str(work / "voz.wav")] + ([] if solo_voz else ["-i", str(work / "lluvia.wav")])
    m = spec.get("music")
    if solo_voz:
        fc = (
            "[0]aresample=44100,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,pan=stereo|c0=c0|c1=c0,"
            f"apad,atrim=0:{total:.3f}[m]"
        )
    elif m:
        L = lambda i: starts[i] if i < len(starts) else total  # noqa: E731
        parts = [[0, L(m["drumsFromLine"]), "piano,pad"],
                 [L(m["drumsFromLine"]), L(m["dropAtLine"]), "piano,pad,drums,bass"],
                 [L(m["dropAtLine"]), L(m["backAtLine"]), "piano,pad"],
                 [L(m["backAtLine"]), total + 2, "piano,pad,drums,bass"]]
        cfg = {"bpm": m.get("bpm", 84), "style": m.get("style", "trap"), "prog": m.get("prog", "triste"), "transpose": m.get("transpose", 0), "parts": parts, "impacts": [0.05, L(m["dropAtLine"])], "risers": [L(m["drumsFromLine"]), L(m["backAtLine"])]}
        subprocess.run([sys.executable, "-I", str(HERE / "musica_beat.py"), str(work / "musica.wav"), f"{total + 0.5:.2f}", json.dumps(cfg)], check=True)
        inputs += ["-i", str(work / "musica.wav")]
        fc = (
            "[0]aresample=44100,loudnorm=I=-14:TP=-1.5:LRA=9,aresample=44100,pan=stereo|c0=c0|c1=c0,asplit=2[v][sc];"
            f"[2]volume={m.get('gain', 0.32)}[mu];"
            "[mu][sc]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=350[duck];"
            "[1]volume=0.35[r];"
            f"[v][duck][r]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,atrim=0:{total:.3f}[m]"
        )
    else:
        fc = (
            "[0]aresample=44100,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=44100,pan=stereo|c0=c0|c1=c0[v];"
            "[1]volume=0.55[r];"
            f"[v][r]amix=inputs=2:normalize=0:duration=longest,atrim=0:{total:.3f}[m]"
        )
    out = ROOT / "public" / "historia" / f"audio-{slug}.wav"
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", fc, "-map", "[m]", "-ar", "44100", "-ac", "2", str(out)], check=True)

    tl = {"slug": slug, "hook": spec.get("hook", ""), "durations": durs, "lines": lines, "total": total,
          "audio": f"historia/audio-{slug}.wav"}
    if spec.get("song"):
        tl["song"] = spec["song"]
    for key in ("flash", "estilo", "cast", "fecha", "safe"):
        if spec.get(key):
            tl[key] = spec[key]
    (ROOT / "src" / "styles" / "historia" / f"timeline-{slug}.json").write_text(json.dumps(tl, ensure_ascii=False, indent=1))
    # índice de historias para la composición
    hdir = ROOT / "src" / "styles" / "historia"
    slugs = sorted(p.stem[len("timeline-"):] for p in hdir.glob("timeline-*.json"))
    ident = lambda x: "t_" + x.replace("-", "_")  # noqa: E731
    idx = ["// Índice de historias (lo regenera tools/historia_voz.py)."]
    idx += [f"import {ident(x)} from './timeline-{x}.json';" for x in slugs]
    idx += ["", "export const ALL = {"] + [f"  '{x}': {ident(x)}," for x in slugs] + ["};", ""]
    (hdir / "timelines.ts").write_text("\n".join(idx))
    print("ok", out)


if __name__ == "__main__":
    main()
