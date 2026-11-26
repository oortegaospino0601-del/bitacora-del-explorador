"""Mini libreria SDF (campos de distancia) en numpy para modelar figuras organicas."""
import numpy as np

def rot(axis, deg):
    a = np.radians(deg); c, s = np.cos(a), np.sin(a)
    if axis == 'x': return np.array([[1,0,0],[0,c,-s],[0,s,c]], np.float32)
    if axis == 'y': return np.array([[c,0,s],[0,1,0],[-s,0,c]], np.float32)
    return np.array([[c,-s,0],[s,c,0],[0,0,1]], np.float32)

def length(v):
    return np.sqrt((v * v).sum(-1))

def smin(a, b, k):
    if k <= 0: return np.minimum(a, b)
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)

def smax(a, b, k):
    return -smin(-a, -b, k)

def sub(a, b, k=0.0):
    return smax(a, -b, k) if k > 0 else np.maximum(a, -b)

def local(P, c, R=None):
    q = P - np.asarray(c, np.float32)
    if R is not None:
        q = q @ R  # R: local->world; q@R == R^T q (world->local)
    return q

def sphere(P, c, r):
    return length(P - np.asarray(c, np.float32)) - r

def ellipsoid(P, c, r, R=None):
    q = local(P, c, R); r = np.asarray(r, np.float32)
    k0 = length(q / r); k1 = length(q / (r * r))
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-6)

def rounded_cyl(P, z0, z1, r, rr, c=(0, 0)):
    q = P - np.array([c[0], c[1], 0], np.float32)
    dr = np.sqrt(q[:, 0]**2 + q[:, 1]**2) - (r - rr)
    zc = (z0 + z1) / 2; hz = (z1 - z0) / 2 - rr
    dz = np.abs(q[:, 2] - zc) - hz
    out = np.sqrt(np.maximum(dr, 0)**2 + np.maximum(dz, 0)**2)
    return out + np.minimum(np.maximum(dr, dz), 0) - rr

def torus_z(P, c, R, r):
    q = P - np.asarray(c, np.float32)
    d = np.sqrt(q[:, 0]**2 + q[:, 1]**2) - R
    return np.sqrt(d * d + q[:, 2]**2) - r

def bezier(ctrl, n):
    ctrl = np.asarray(ctrl, np.float32); t = np.linspace(0, 1, n)[:, None, None]
    pts = np.repeat(ctrl[None], n, 0)
    while pts.shape[1] > 1:
        pts = pts[:, :-1] * (1 - t) + pts[:, 1:] * t
    return pts[:, 0]

def tube(P, pts, radii, scale=None, margin=4.0):
    """Tubo de radio variable a lo largo de una polilinea (union de conos redondeados).
    scale: escala (sx,sy,sz) aplicada al espacio local (p.ej. aplanar un pico)."""
    pts = np.asarray(pts, np.float32); radii = np.asarray(radii, np.float32)
    lo = pts.min(0) - radii.max() - margin; hi = pts.max(0) + radii.max() + margin
    if scale is not None:
        s = np.asarray(scale, np.float32); lo2 = np.minimum(lo, lo * s); hi2 = np.maximum(hi, hi * s)
        lo, hi = lo2 - margin, hi2 + margin
    m = np.all((P >= lo) & (P <= hi), 1)
    out = np.full(len(P), margin, np.float32)
    Q = P[m]
    if scale is not None:
        cen = pts.mean(0); Q = (Q - cen) * np.asarray(scale, np.float32) + cen
    d = np.full(len(Q), 1e3, np.float32)
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]; ra, rb = radii[i], radii[i + 1]
        ba = b - a; L2 = float(ba @ ba)
        t = np.clip(((Q - a) @ ba) / L2, 0, 1)
        dd = length(Q - (a + t[:, None] * ba)) - (ra + (rb - ra) * t)
        d = np.minimum(d, dd)
    out[m] = np.minimum(d, margin)
    return out
