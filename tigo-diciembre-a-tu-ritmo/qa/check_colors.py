# Samples frames of the rendered video and flags red / purple pixels:
# hue in [0,15] or [260,360] degrees with medium/high saturation (HSV S >= 0.35) and visible brightness (V >= 0.2).
import sys, subprocess, numpy as np
vid = sys.argv[1]; step = float(sys.argv[2]) if len(sys.argv) > 2 else 0.25
W, H = 540, 960
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', vid, '-vf', f'fps={1/step},scale={W}:{H}:flags=area', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.float32) / 255
worst = []
for i, f in enumerate(fr):
    mx = f.max(-1); mn = f.min(-1); d = mx - mn
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    h = np.zeros_like(mx)
    m = d > 1e-6
    rm = m & (mx == r); gm = m & (mx == g) & ~rm; bm = m & ~rm & ~gm
    h[rm] = (60 * ((g - b)[rm] / d[rm])) % 360
    h[gm] = 60 * ((b - r)[gm] / d[gm]) + 120
    h[bm] = 60 * ((r - g)[bm] / d[bm]) + 240
    bad = ((h <= 15) | (h >= 260)) & (s >= 0.35) & (mx >= 0.2) & m
    n = int(bad.sum())
    worst.append((n, i * step, np.argwhere(bad)[:3].tolist()))
tot = sum(w[0] for w in worst); px = len(fr) * W * H
print(f'frames checked: {len(fr)}  flagged pixels: {tot} ({100*tot/px:.4f}% of all sampled pixels)')
for n, t, where in sorted(worst, reverse=True)[:8]:
    print(f'  t={t:6.2f}s  flagged={n:6d}  ({100*n/(W*H):.3f}% of frame)  e.g. (y,x) {where}')
