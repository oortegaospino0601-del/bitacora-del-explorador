#!/usr/bin/env python3
"""Genera un Short completo a partir de un guion en JSON.

Uso:  python3 -I studio/tools/make.py studio/specs/<slug>.json

Pasos: voz (Kokoro, em_alex) por frase -> tiempos de palabras -> mezcla con
fondo sonoro -> render con Remotion -> verificación (duración, volumen y hoja
de contacto con fotogramas).
"""
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent  # studio/
WORK = ROOT / "work"
OUT = ROOT / "out"
PUBLIC = ROOT / "public"
KOKORO = Path(os.environ.get("KOKORO_DIR", "/tmp/kokoro"))
SR = 24000
VOICE = os.environ.get("VOICE", "em_alex")
SPEED = float(os.environ.get("SPEED", "1.04"))
MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx"
VOICES_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin"
SCENE_TYPES = {"title", "number", "bars", "list", "statement", "orbit"}
OUTRO_SECONDS = 2.8


def sh(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)


def ensure_models():
    KOKORO.mkdir(parents=True, exist_ok=True)
    for name, url in (("kokoro-v1.0.onnx", MODEL_URL), ("voices-v1.0.bin", VOICES_URL)):
        f = KOKORO / name
        if not f.exists() or f.stat().st_size < 1_000_000:
            print(f"Descargando {name} ...", flush=True)
            sh(["curl", "-sS", "-L", "--retry", "3", "-m", "280", "-o", str(f), url])


def validate(spec):
    assert spec.get("slug") and re.fullmatch(r"[a-z0-9-]+", spec["slug"]), "slug inválido (minúsculas, números y guiones)"
    sents = spec.get("sentences") or []
    assert 3 <= len(sents) <= 14, "usa entre 3 y 14 frases"
    for i, s in enumerate(sents):
        assert s.get("text"), f"frase {i}: falta text"
        sc = s.get("scene") or {}
        if spec.get("composition", "Short") != "Short":
            continue  # composición propia: la escena es libre, la define el componente nuevo
        assert sc.get("type") in SCENE_TYPES, f"frase {i}: scene.type debe ser uno de {sorted(SCENE_TYPES)}"
        t = sc["type"]
        if t == "title":
            assert sc.get("big"), f"frase {i}: title necesita big"
        if t == "number":
            assert isinstance(sc.get("value"), (int, float)), f"frase {i}: number necesita value numérico"
        if t == "bars":
            assert sc.get("items") and all("label" in x and "value" in x for x in sc["items"]), f"frase {i}: bars necesita items con label y value"
        if t == "list":
            assert sc.get("items"), f"frase {i}: list necesita items"
        if t == "statement":
            assert sc.get("text"), f"frase {i}: statement necesita text"
        if t == "orbit":
            assert sc.get("bodies"), f"frase {i}: orbit necesita bodies"


def expand_numbers(text):
    """Convierte cifras a palabras para que la voz las lea bien."""
    from num2words import num2words

    t = text
    t = re.sub(r"(\d{1,3}(?:\.\d{3})+)", lambda m: m.group(1).replace(".", ""), t)  # 1.000 -> 1000
    t = re.sub(r"(\d+(?:,\d+)?)\s*%", lambda m: m.group(1) + " por ciento", t)

    def dec(m):
        ent = num2words(int(m.group(1)), lang="es")
        frac = " ".join(num2words(int(c), lang="es") for c in m.group(2))
        return f"{ent} coma {frac}"

    t = re.sub(r"(\d+),(\d+)", dec, t)
    t = re.sub(r"\d+", lambda m: num2words(int(m.group(0)), lang="es"), t)
    return t


def trim(x, thr=0.008):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    pad = int(0.04 * SR)
    return x[max(0, idx[0] - pad): min(len(x), idx[-1] + pad)]


def word_timings(text, start, end):
    words = text.split()
    weights = []
    for w in words:
        base = len(re.sub(r"[^\w]", "", w)) + 1.5
        if w.endswith((",", ";", ":")):
            base += 2
        if w.endswith((".", "?", "!", "…")):
            base += 3
        weights.append(base)
    total = sum(weights) or 1
    out, cur = [], start
    for w, wt in zip(words, weights):
        d = (end - start) * wt / total
        out.append({"w": w, "start": round(cur, 3), "end": round(cur + d, 3)})
        cur += d
    return out


def build_voice(spec):
    outro_seconds = float(spec.get("outroSeconds", OUTRO_SECONDS))
    from kokoro_onnx import Kokoro

    ensure_models()
    k = Kokoro(str(KOKORO / "kokoro-v1.0.onnx"), str(KOKORO / "voices-v1.0.bin"))
    pieces, timings = [], []
    cursor = 0.35
    lead = np.zeros(int(0.35 * SR), dtype=np.float32)
    pieces.append(lead)
    for i, s in enumerate(spec["sentences"]):
        spoken = s.get("tts") or expand_numbers(s["text"])
        samples, sr = k.create(spoken, voice=VOICE, speed=SPEED, lang="es")
        assert sr == SR, f"sample rate inesperado {sr}"
        x = trim(np.asarray(samples, dtype=np.float32))
        dur = len(x) / SR
        start, end = cursor, cursor + dur
        pieces.append(x)
        gap = 0.46 if s["text"].rstrip().endswith("?") else 0.3
        pieces.append(np.zeros(int(gap * SR), dtype=np.float32))
        cursor = end + gap
        timings.append({"start": round(start, 3), "end": round(end, 3), "words": word_timings(s["text"], start, end)})
        print(f"  frase {i + 1}: {dur:.2f}s  «{spoken[:70]}»", flush=True)
    n = len(timings)
    for i, t in enumerate(timings):
        t["sceneStart"] = 0.0 if i == 0 else round(max(0.0, t["start"] - 0.12), 3)
        t["sceneEnd"] = round(max(timings[i + 1]["start"] - 0.12, t["end"]), 3) if i < n - 1 else round(t["end"] + 0.5, 3)
    narration = np.concatenate(pieces)
    outro_start = timings[-1]["sceneEnd"]
    total = round(outro_start + outro_seconds, 3)
    return narration, timings, outro_start, total


def mix_audio(narration, total):
    WORK.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    nar = WORK / "narration.wav"
    sf.write(str(nar), narration, SR)
    T = f"{total:.3f}"
    fade_out_at = f"{max(0.0, total - 2.5):.3f}"
    tones = [110.0, 130.81, 164.81, 220.0]
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(nar)]
    for f in tones:
        cmd += ["-f", "lavfi", "-t", T, "-i", f"sine=f={f}:r=44100"]
    fc = (
        "[1][2][3][4]amix=inputs=4:normalize=0,volume=0.05,lowpass=f=700,tremolo=f=0.18:d=0.6,"
        f"afade=t=in:st=0:d=2,afade=t=out:st={fade_out_at}:d=2.5[bed];"
        "[0]aresample=44100,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100[voice];"
        f"[voice][bed]amix=inputs=2:normalize=0:duration=longest,atrim=0:{T}[mix]"
    )
    cmd += ["-filter_complex", fc, "-map", "[mix]", "-ac", "2", "-ar", "44100", str(PUBLIC / "audio.wav")]
    sh(cmd)


def find_chrome():
    for c in (os.environ.get("CHROME"), shutil.which("google-chrome"), shutil.which("chromium"), shutil.which("chromium-browser")):
        if c and Path(c).exists():
            return c
    raise SystemExit("No encuentro Chrome/Chromium (define CHROME=/ruta)")


def render(slug, COMPOSITION="Short"):
    OUT.mkdir(parents=True, exist_ok=True)
    mp4 = OUT / f"{slug}.mp4"
    cmd = [
        "npx", "remotion", "render", "src/index.ts", COMPOSITION, str(mp4),
        f"--props={WORK / 'props.json'}",
        f"--browser-executable={find_chrome()}",
        "--chrome-mode=chrome-for-testing",
        "--crf=24",
        f"--concurrency={os.cpu_count() or 2}",
        "--log=warn",
    ]
    sh(cmd, cwd=str(ROOT))
    return mp4


def verify(mp4, total):
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height,duration",
         "-of", "json", str(mp4)], capture_output=True, text=True, check=True)
    streams = json.loads(probe.stdout)["streams"]
    v = next(s for s in streams if s["codec_type"] == "video")
    a = [s for s in streams if s["codec_type"] == "audio"]
    dur = float(v.get("duration") or total)
    vd = subprocess.run(["ffmpeg", "-i", str(mp4), "-af", "volumedetect", "-vn", "-f", "null", "-"],
                        capture_output=True, text=True)
    vol = re.findall(r"(mean_volume|max_volume): (-?[\d.]+) dB", vd.stderr)
    contact = WORK / "contact.png"
    interval = max(0.5, dur / 12)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(mp4), "-vf",
                    f"fps=1/{interval:.3f},scale=270:480,tile=6x2", "-frames:v", "1", str(contact)], check=True)
    size_mb = mp4.stat().st_size / 1e6
    print("\n=== VERIFICACIÓN ===")
    print(f"video: {v['width']}x{v['height']}  duración: {dur:.1f}s  audio: {'sí' if a else 'NO'}  tamaño: {size_mb:.1f} MB")
    print("volumen:", ", ".join(f"{k}={val} dB" for k, val in vol))
    print(f"hoja de contacto: {contact}")
    problems = []
    if (v["width"], v["height"]) != (1080, 1920):
        problems.append("resolución no es 1080x1920")
    if not a:
        problems.append("sin audio")
    if dur > 60:
        problems.append("dura más de 60 s: no será un Short")
    if size_mb > 90:
        problems.append("archivo >90 MB: GitHub lo rechaza")
    if problems:
        print("PROBLEMAS:", "; ".join(problems))
        sys.exit(2)
    print("OK")


def main():
    spec_path = Path(sys.argv[1]).resolve()
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    validate(spec)
    print(f"Short «{spec['title']}» ({spec['slug']}) — {len(spec['sentences'])} frases", flush=True)
    narration, timings, outro_start, total = build_voice(spec)
    if total > 59:
        raise SystemExit(f"El video duraría {total:.1f}s (>59). Acorta el guion.")
    mix_audio(narration, total)
    props = {"spec": spec, "timings": timings, "totalSeconds": total, "outroStart": outro_start, "audioFile": "audio.wav"}
    (WORK / "props.json").write_text(json.dumps(props, ensure_ascii=False), encoding="utf-8")
    print(f"Duración total: {total:.1f}s. Renderizando con Remotion ...", flush=True)
    mp4 = render(spec["slug"], spec.get("composition", "Short"))
    verify(mp4, total)
    print(f"\nMP4: {mp4}")


if __name__ == "__main__":
    main()
