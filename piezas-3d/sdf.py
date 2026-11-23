"""Mini-librería de modelado por campos de distancia (SDF).

Todas las formas se combinan con uniones suaves (smin), así las partes del
animal se funden de forma progresiva en lugar de verse como figuras pegadas.
Unidades: milímetros. Ejes: x derecha, y hacia adelante (cara), z arriba.
"""
import numpy as np


def smin(a, b, k):
    if k <= 0:
        return np.minimum(a, b)
    h = np.maximum(k - np.abs(a - b), 0.0) / k
    return np.minimum(a, b) - h * h * k * 0.25


def smax(a, b, k):
    return -smin(-a, -b, k)


def rot(axis, deg):
    t = np.radians(deg)
    c, s = np.cos(t), np.sin(t)
    if axis == "x":
        return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
    if axis == "y":
        return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


class Field:
    """Rejilla de puntos donde se evalúan las distancias."""

    def __init__(self, lo, hi, step):
        self.lo = np.array(lo, float)
        self.step = step
        axes = [np.arange(l, h + step, step, dtype=np.float32) for l, h in zip(lo, hi)]
        self.shape = tuple(len(a) for a in axes)
        self.x, self.y, self.z = np.meshgrid(*axes, indexing="ij")

    def local(self, c, R=None):
        x, y, z = self.x - c[0], self.y - c[1], self.z - c[2]
        if R is None:
            return x, y, z
        Rt = np.asarray(R).T
        return (Rt[0, 0] * x + Rt[0, 1] * y + Rt[0, 2] * z,
                Rt[1, 0] * x + Rt[1, 1] * y + Rt[1, 2] * z,
                Rt[2, 0] * x + Rt[2, 1] * y + Rt[2, 2] * z)

    # --- primitivas -------------------------------------------------------
    def sphere(self, c, r):
        x, y, z = self.local(c)
        return np.sqrt(x * x + y * y + z * z) - r

    def ellipsoid(self, c, r, R=None):
        x, y, z = self.local(c, R)
        rx, ry, rz = r
        k0 = np.sqrt((x / rx) ** 2 + (y / ry) ** 2 + (z / rz) ** 2)
        k1 = np.sqrt((x / rx**2) ** 2 + (y / ry**2) ** 2 + (z / rz**2) ** 2)
        return k0 * (k0 - 1.0) / np.maximum(k1, 1e-6)

    def capsule(self, a, b, ra, rb=None):
        rb = ra if rb is None else rb
        a, b = np.asarray(a, float), np.asarray(b, float)
        ba = b - a
        px, py, pz = self.x - a[0], self.y - a[1], self.z - a[2]
        h = np.clip((px * ba[0] + py * ba[1] + pz * ba[2]) / ba.dot(ba), 0, 1)
        dx, dy, dz = px - ba[0] * h, py - ba[1] * h, pz - ba[2] * h
        return np.sqrt(dx * dx + dy * dy + dz * dz) - (ra + (rb - ra) * h)

    def tube(self, pts, radii, k=0.8):
        """Tubo suave que pasa por varios puntos con radio variable."""
        d = None
        for i in range(len(pts) - 1):
            s = self.capsule(pts[i], pts[i + 1], radii[i], radii[i + 1])
            d = s if d is None else smin(d, s, k)
        return d

    def torus(self, c, R_, r, R=None):
        x, y, z = self.local(c, R)
        q = np.sqrt(x * x + y * y) - R_
        return np.sqrt(q * q + z * z) - r

    def base(self, radius=15.0, height=4.0, taper=1.4, round_=0.8):
        """Base de ficha: disco levemente cónico con borde superior redondeado."""
        rr = np.sqrt(self.x ** 2 + self.y ** 2)
        rad = radius - taper * np.clip(self.z / height, 0, 1) - round_
        qx = rr - rad
        qz = self.z - (height - round_)
        outside = np.sqrt(np.maximum(qx, 0) ** 2 + np.maximum(qz, 0) ** 2)
        inside = np.minimum(np.maximum(qx, qz), 0)
        d = outside + inside - round_
        return np.maximum(d, -self.z)  # fondo plano en z = 0


def bezier(p0, p1, p2, p3, n):
    t = np.linspace(0, 1, n)[:, None]
    p0, p1, p2, p3 = map(np.asarray, (p0, p1, p2, p3))
    return ((1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1
            + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3)


# --- ruido y utilidades extra ------------------------------------------------
def _hash(ix, iy, iz, seed):
    h = (ix.astype(np.int64) * 374761393 + iy.astype(np.int64) * 668265263
         + iz.astype(np.int64) * 1274126177 + seed * 144665) & 0xFFFFFFFF
    h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
    h = h ^ (h >> 16)
    return (h & 0xFFFF).astype(np.float32) / 65535.0


def vnoise(x, y, z, seed=0):
    """Ruido de valor 3D suave en [-1, 1]."""
    fx, fy, fz = np.floor(x), np.floor(y), np.floor(z)
    tx, ty, tz = x - fx, y - fy, z - fz
    tx, ty, tz = tx * tx * (3 - 2 * tx), ty * ty * (3 - 2 * ty), tz * tz * (3 - 2 * tz)
    ix, iy, iz = fx.astype(np.int64), fy.astype(np.int64), fz.astype(np.int64)
    acc = 0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                w = (tx if dx else 1 - tx) * (ty if dy else 1 - ty) * (tz if dz else 1 - tz)
                acc = acc + w * _hash(ix + dx, iy + dy, iz + dz, seed)
    return acc * 2 - 1


def fbm(F, scale, seed=0, octaves=2):
    v, a, f = 0, 1.0, 1.0 / scale
    for o in range(octaves):
        v = v + a * vnoise(F.x * f, F.y * f, F.z * f, seed + o * 17)
        a *= 0.5
        f *= 2.1
    return v


def view(F, pivot, R=None, move=(0, 0, 0), scale=1.0):
    """Copia del campo con coordenadas giradas/movidas/escaladas alrededor de 'pivot'.
    Lo que se modele en la copia aparece transformado; si scale != 1 hay que
    multiplicar la distancia resultante por 'scale'."""
    import copy
    G = copy.copy(F)
    p = np.asarray(pivot, float)
    x, y, z = F.local(p + np.asarray(move, float), R)
    G.x, G.y, G.z = x / scale + p[0], y / scale + p[1], z / scale + p[2]
    return G


def frame_ellipsoid(F, a, b, width, thick, normal):
    """Elipsoide alargado de a hacia b (una pluma, una oreja...), aplanado según 'normal'."""
    a, b, n = np.asarray(a, float), np.asarray(b, float), np.asarray(normal, float)
    t = b - a
    L = np.linalg.norm(t)
    t /= L
    n = n - t * n.dot(t)
    n /= np.linalg.norm(n)
    w = np.cross(n, t)
    R = np.column_stack([w, n, t])
    return F.ellipsoid((a + b) / 2, (width, thick, L / 2), R)
