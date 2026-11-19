#!/usr/bin/env python3
"""Short "Starboy vs Stargirl": voz -> tiempos -> render Remotion (Short-starboy).

Uso:
  python3 -I studio/tools/starboy.py studio/specs/starboy-stargirl.json
      voz local provisional (Kokoro em_alex), una pieza por frase con pausas del spec.
  python3 -I studio/tools/starboy.py studio/specs/starboy-stargirl.json --audio voz_elevenlabs.mp3
      usa una locución externa completa (p. ej. ElevenLabs): detecta los silencios
      entre frases y re-sincroniza escenas y subtítulos con esa voz.

Entrega SOLO voz (sin música), normalizada a -14 LUFS.
"""
import argparse
import json
import os
import re
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
SPEED = float(os.environ.get("SPEED", "0.88"))
LEAD = 0.12  # la voz entra casi en el primer fotograma


def word_timings(text, start, end):
    words = text.split()
    weights = []
    for w in words:
        base = len(re.sub(r"[^\w]", "", w)) + 1.5
        if w.endswith((",", ";", ":", "…")):
            base += 2.5
        if w.endswith((".", "?", "!", "»")):
            base += 2
        weights.append(base)
    total = sum(weights) or 1
    out, cur = [], start
    for w, wt in zip(words, weights):
        d = (end - start) * wt / total
        out.append({"w": w, "start": round(cur, 3), "end": round(cur + d, 3)})
        cur += d
    return out


def aligned_words(text, start, end, x, sr):
    """Reparte palabras usando las pausas internas reales de la voz: cada palabra
    que termina en puntuación se ancla a una pausa detectada en el audio."""
    words = text.split()
    cuts = [i for i, w in enumerate(words[:-1]) if re.search(r"[,.;:…?!»]$", w)]
    hop = int(0.01 * sr)
    seg = x[int(start * sr): int(end * sr)]
    if not cuts or len(seg) < hop * 10:
        return word_timings(text, start, end)
    rms = np.array([np.sqrt(np.mean(seg[i:i + hop] ** 2) + 1e-12) for i in range(0, len(seg) - hop, hop)])
    db = 20 * np.log10(rms / (rms.max() + 1e-9))
    quiet = db < -32
    gaps, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            if j - i >= 9 and i > 5 and j < len(quiet) - 5:
                gaps.append((start + i * hop / sr, start + j * hop / sr))
            i = j
        else:
            i += 1
    if len(gaps) < len(cuts):
        return word_timings(text, start, end)
    gaps = sorted(sorted(gaps, key=lambda g: g[1] - g[0], reverse=True)[: len(cuts)])
    out, lo, wi = [], start, 0
    for c, (g0, g1) in zip(cuts + [len(words) - 1], gaps + [(end, end)]):
        out += word_timings(" ".join(words[wi: c + 1]), lo, g0)
        lo, wi = g1, c + 1
    return out


def trim(x, thr=0.008):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    pad = int(0.03 * SR)
    return x[max(0, idx[0] - pad): min(len(x), idx[-1] + pad)]


def local_voice(spec):
    from kokoro_onnx import Kokoro

    k = Kokoro(str(KOKORO / "kokoro-v1.0.onnx"), str(KOKORO / "voices-v1.0.bin"))
    pieces = [np.zeros(int(LEAD * SR), dtype=np.float32)]
    spans, cursor = [], LEAD
    for i, s in enumerate(spec["sentences"]):
        spoken = s.get("tts") or s["text"]
        samples, sr = k.create(spoken, voice=VOICE, speed=SPEED, lang="es")
        assert sr == SR
        x = trim(np.asarray(samples, dtype=np.float32))
        dur = len(x) / SR
        spans.append((cursor, cursor + dur))
        gap = float(s.get("gap", 0.35))
        pieces += [x, np.zeros(int(gap * SR), dtype=np.float32)]
        cursor += dur + gap
        print(f"  frase {i + 1}: {dur:.2f}s  «{spoken}»", flush=True)
    return np.concatenate(pieces), SR, spans


def external_voice(path, n):
    """Lee una locución completa y la divide en n frases por sus n-1 silencios más largos."""
    WORK.mkdir(parents=True, exist_ok=True)
    wav = WORK / "external.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), str(wav)], check=True)
    x, sr = sf.read(str(wav), dtype="float32")
    hop = int(0.02 * sr)
    rms = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2) + 1e-12) for i in range(0, len(x) - hop, hop)])
    db = 20 * np.log10(rms / (rms.max() + 1e-9))
    voiced = db > -38
    idx = np.where(voiced)[0]
    first, last = idx[0], idx[-1]
    runs, i = [], first
    while i <= last:
        if not voiced[i]:
            j = i
            while j <= last and not voiced[j]:
                j += 1
            runs.append((i, j))
            i = j
        else:
            i += 1
    runs = sorted(sorted(runs, key=lambda r: r[1] - r[0], reverse=True)[: n - 1])
    assert len(runs) == n - 1, f"solo encontré {len(runs)} silencios para {n} frases"
    t = lambda k: k * hop / sr  # noqa: E731
    bounds = [t(first)] + [v for r in runs for v in (t(r[0]), t(r[1]))] + [t(last + 1)]
    spans = [(bounds[2 * k], bounds[2 * k + 1]) for k in range(n)]
    shift = LEAD - spans[0][0]  # alinea el arranque de la voz con el primer fotograma
    x = np.concatenate([np.zeros(int(max(0, shift) * sr), dtype=np.float32), x[int(max(0, -shift) * sr):]])
    spans = [(a + shift, b + shift) for a, b in spans]
    for k, (a, b) in enumerate(spans):
        print(f"  frase {k + 1}: {a:6.2f}–{b:6.2f}s", flush=True)
    return x, sr, spans


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("--audio", help="locución externa completa (mp3/wav)")
    ap.add_argument("--no-render", action="store_true")
    a = ap.parse_args()
    spec = json.loads(Path(a.spec).read_text(encoding="utf-8"))
    sents = spec["sentences"]
    voice, sr, spans = external_voice(a.audio, len(sents)) if a.audio else local_voice(spec)

    timings = []
    for i, (s, (st, en)) in enumerate(zip(sents, spans)):
        timings.append({"start": round(st, 3), "end": round(en, 3), "words": aligned_words(s["text"], st, en, voice, sr)})
    for i, t in enumerate(timings):
        t["sceneStart"] = 0.0 if i == 0 else round(max(0.0, t["start"] - 0.1), 3)
        t["sceneEnd"] = round(timings[i + 1]["start"] - 0.1, 3) if i < len(timings) - 1 else round(t["end"] + spec.get("tailSeconds", 2.5), 3)
    total = timings[-1]["sceneEnd"]
    limit = float(spec.get("maxSeconds", 45))
    print(f"Duración total: {total:.2f}s (límite {limit:.0f}s)")
    if total > 50 or total > limit + 0.5:
        raise SystemExit("Demasiado largo: acorta pausas o el guion.")

    WORK.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    raw = WORK / "voice_raw.wav"
    sf.write(str(raw), voice, sr)
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af",
        f"highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,loudnorm=I=-14:TP=-1.5:LRA=9,apad,atrim=0:{total:.3f}",
        "-ac", "2", "-ar", "48000", str(PUBLIC / "audio.wav")], check=True)

    props = {"spec": spec, "timings": timings, "totalSeconds": total, "outroStart": total, "audioFile": "audio.wav"}
    (WORK / "props.json").write_text(json.dumps(props, ensure_ascii=False), encoding="utf-8")
    if a.no_render:
        return
    OUT.mkdir(parents=True, exist_ok=True)
    mp4 = OUT / f"{spec['slug']}.mp4"
    subprocess.run([
        "npx", "remotion", "render", "src/index.ts", spec["composition"], str(mp4),
        f"--props={WORK / 'props.json'}", "--browser-executable=/opt/pw-browsers/chromium",
        "--crf=18", f"--concurrency={os.cpu_count() or 2}", "--log=warn"], check=True, cwd=str(ROOT))
    contact = WORK / "contact.png"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(mp4), "-vf",
                    f"fps=1/{total / 12:.3f},scale=270:480,tile=6x2", "-frames:v", "1", str(contact)], check=True)
    print(f"MP4: {mp4}\nHoja de contacto: {contact}")


if __name__ == "__main__":
    main()
