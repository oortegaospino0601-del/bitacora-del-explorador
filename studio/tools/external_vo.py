#!/usr/bin/env python3
"""Prepara un Short cuya voz ya viene grabada (p. ej. ElevenLabs) en un solo archivo.

Uso:  python3 -I studio/tools/external_vo.py studio/specs/<slug>.json [--render]

Corta la locución por sus silencios (debe haber tantos tramos de voz como frases
en el guion), añade las pausas `gapBefore` entre escenas, normaliza el volumen,
escribe public/audio.wav (solo voz, sin música) y work/props.json con los tiempos
de cada frase y palabra. Con --render, renderiza la composición del guion.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORK, PUBLIC, OUT = ROOT / "work", ROOT / "public", ROOT / "out"
SR = 48000


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def speech_segments(src, n):
    for d in (0.18, 0.15, 0.22, 0.12, 0.26):
        err = subprocess.run(["ffmpeg", "-i", str(src), "-af", f"silencedetect=noise=-38dB:d={d}", "-f", "null", "-"],
                             capture_output=True, text=True).stderr
        starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
        ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
        dur = float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(src)]).stdout)
        segs, cur = [], 0.0
        for s, e in zip(starts, ends):
            if s - cur > 0.05:
                segs.append((cur, s))
            cur = e
        if dur - cur > 0.15:
            segs.append((cur, dur))
        if len(segs) == n:
            return segs
    raise SystemExit(f"La locución tiene {len(segs)} tramos y el guion {n} frases: ajusta el guion.")


def word_timings(text, start, end):
    words = text.split()
    wts = [len(re.sub(r"[^\w]", "", w)) + 1.5 + (2 if w.endswith((",", ":", ";")) else 0) for w in words]
    tot = sum(wts) or 1
    out, cur = [], start
    for w, wt in zip(words, wts):
        d = (end - start) * wt / tot
        out.append({"w": w, "start": round(cur, 3), "end": round(cur + d, 3)})
        cur += d
    return out


def main():
    spec_path = Path(sys.argv[1]).resolve()
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    src = (ROOT / spec["voice"]["file"]).resolve()
    sents = spec["sentences"]
    segs = speech_segments(src, len(sents))
    lead, tail = spec.get("lead", 0.4), spec.get("tail", 3.0)
    # Desplazamiento acumulado: se inserta silencio antes de las frases con gapBefore.
    filters, labels, timings, shift = [], [], [], lead
    cut_points = [0.0]
    for i, s in enumerate(sents):
        if i > 0 and s.get("gapBefore"):
            cut = (segs[i - 1][1] + segs[i][0]) / 2
            cut_points.append(cut)
    cut_points.append(1e9)
    pieces = []
    for k in range(len(cut_points) - 1):
        a, b = cut_points[k], cut_points[k + 1]
        trim = f"atrim=start={a}" + (f":end={b}" if b < 1e8 else "")
        pieces.append(f"[0]{trim},asetpts=PTS-STARTPTS[p{k}]")
    gaps = [lead] + [s["gapBefore"] for i, s in enumerate(sents) if i > 0 and s.get("gapBefore")]
    chain = []
    for k, g in enumerate(gaps):
        pieces.append(f"anullsrc=r={SR}:cl=mono,atrim=0:{g}[g{k}]")
        chain += [f"[g{k}]", f"[p{k}]"]
    total = None
    for i, (s, (a, b)) in enumerate(zip(sents, segs)):
        if i > 0 and s.get("gapBefore"):
            shift += s["gapBefore"]
        st, en = round(a + shift, 3), round(b + shift, 3)
        timings.append({"start": st, "end": en, "scene": s["scene"], "words": word_timings(s["text"], st, en)})
    total = round(timings[-1]["end"] + tail, 3)
    for i, t in enumerate(timings):
        t["sceneStart"] = 0.0 if i == 0 else round(t["start"] - 0.1, 3)
        t["sceneEnd"] = round(timings[i + 1]["start"] - 0.1, 3) if i + 1 < len(timings) else total
    fc = ";".join([f"[0]aresample={SR},aformat=channel_layouts=mono[src]"] +
                  [p.replace("[0]", "[s%d]" % k) if p.startswith("[0]") else p for k, p in enumerate(pieces)])
    # el split del origen en tantas copias como trozos
    n_p = len(cut_points) - 1
    fc = fc.replace("[src]", "[src];[src]asplit=%d%s" % (n_p, "".join(f"[s{k}]" for k in range(n_p))), 1)
    fc += ";" + "".join(chain) + f"concat=n={len(chain)}:v=0:a=1,loudnorm=I=-15:TP=-1.5:LRA=9,aresample=44100,apad,atrim=0:{total}[out]"
    PUBLIC.mkdir(parents=True, exist_ok=True)
    WORK.mkdir(parents=True, exist_ok=True)
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-filter_complex", fc, "-map", "[out]", "-ac", "2", "-ar", "44100", str(PUBLIC / "audio.wav")])
    props = {"spec": spec, "timings": timings, "totalSeconds": total, "outroStart": timings[-1]["end"], "audioFile": "audio.wav"}
    (WORK / "props.json").write_text(json.dumps(props, ensure_ascii=False, indent=1), encoding="utf-8")
    for i, t in enumerate(timings):
        print(f"{i:2d} esc{t['scene']} {t['start']:6.2f}-{t['end']:6.2f}  {sents[i]['text'][:60]}")
    print(f"Duración total: {total:.2f}s")
    if "--render" in sys.argv:
        OUT.mkdir(parents=True, exist_ok=True)
        mp4 = OUT / f"{spec['slug']}.mp4"
        subprocess.run(["npx", "remotion", "render", "src/index.ts", spec["composition"], str(mp4),
                        f"--props={WORK / 'props.json'}", "--browser-executable=/opt/pw-browsers/chromium" if Path("/opt/pw-browsers/chromium").exists() else "",
                        "--crf=20", "--log=warn"], check=True, cwd=str(ROOT))
        print(f"MP4: {mp4}")


if __name__ == "__main__":
    main()
