import * as THREE from 'three';

// ---------- tiempo musical (medido del audio de referencia) ----------
// 100.02 BPM. beat 0 = inicio del bloque 0 (t = -0.0265 s). Bloques de 8 tiempos.
export const BEAT = 0.59985;
export const T0 = -0.0265;
export const beatToTime = (b) => T0 + b * BEAT;
export const timeToBeat = (t) => (t - T0) / BEAT;
export const DURATION = 33.0;

// ---------- matemática ----------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const smoother = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
export const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInCubic = (t) => Math.pow(clamp(t), 3);
export const easeInOutCubic = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const easeOutExpo = (t) => { t = clamp(t); return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); };
export const easeInExpo = (t) => { t = clamp(t); return t === 0 ? 0 : Math.pow(2, 10 * t - 10); };
export const easeOutBack = (t, s = 1.70158) => { t = clamp(t) - 1; return t * t * ((s + 1) * t + s) + 1; };
export const easeInOutSine = (t) => -(Math.cos(Math.PI * clamp(t)) - 1) / 2;
export const easeOutElastic = (t) => { t = clamp(t); if (t === 0 || t === 1) return t; return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1; };
export const range = (t, a, b) => clamp((t - a) / (b - a));
export const fract = (x) => x - Math.floor(x);

export const EASE = {
  linear: (t) => t, smooth, smoother, sine: easeInOutSine, out: easeOutCubic, in: easeInCubic,
  inout: easeInOutCubic, hit: (t) => easeOutExpo(t), back: (t) => easeOutBack(t, 1.4), elastic: easeOutElastic,
  hold: (t) => (t < 1 ? 0 : 1),
};

// pista de keyframes: [[beat, valor(number|array), ease?], ...]  (ease aplica al tramo que LLEGA a ese key)
export function track(keys) {
  return (b) => {
    if (b <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [b1, v1, e] = keys[i];
      if (b <= b1) {
        const [b0, v0] = keys[i - 1];
        const u = (EASE[e || 'sine'])((b - b0) / (b1 - b0 || 1));
        if (Array.isArray(v0)) return v0.map((x, k) => x + (v1[k] - x) * u);
        return v0 + (v1 - v0) * u;
      }
    }
    return keys[keys.length - 1][1];
  };
}
// pista periódica: repite cada `period` beats
export const loop = (tr, period) => (b) => tr(((b % period) + period) % period);

// ---------- ruido determinista ----------
export function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const wobble = (t, seed = 0, f = 1) =>
  Math.sin(t * 1.7 * f + seed * 3.1) * 0.5 + Math.sin(t * 2.9 * f + seed * 1.7) * 0.3 + Math.sin(t * 5.3 * f + seed * 0.7) * 0.2;

// ---------- texturas de canvas ----------
export function canvasTex(w, h, draw, opts = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = opts.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (opts.repeat) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(opts.repeat[0], opts.repeat[1]); }
  return tex;
}
export function radialTex(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)', size = 128, stops) {
  return canvasTex(size, size, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    if (stops) stops.forEach(([o, c]) => gr.addColorStop(o, c)); else { gr.addColorStop(0, inner); gr.addColorStop(1, outer); }
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
}

export const col = (c) => new THREE.Color(c);
export function std(color, rough = 0.6, metal = 0, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
}
export function cloth(color, extra = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.78, sheen: 0.25, sheenRoughness: 0.7, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.4), ...extra });
}
export function skinMat(color) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.48, sheen: 0.35, sheenColor: new THREE.Color('#ffd7c4'), sheenRoughness: 0.5, clearcoat: 0.08, clearcoatRoughness: 0.6 });
}
export function emissive(color, intensity = 2) {
  return new THREE.MeshStandardMaterial({ color: '#000000', emissive: color, emissiveIntensity: intensity, roughness: 1 });
}

export function mesh(geo, mat, { shadow = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, mat); m.castShadow = shadow; m.receiveShadow = receive; return m;
}
export function box(w, h, d, mat, r = 0) {
  const geo = r > 0 ? roundedBoxGeo(w, h, d, r) : new THREE.BoxGeometry(w, h, d);
  return mesh(geo, mat);
}
export function roundedBoxGeo(w, h, d, r, seg = 3) {
  // caja redondeada simple vía extrusión de una forma redondeada
  const shape = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  shape.moveTo(x + r, y); shape.lineTo(x + w - r, y); shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r); shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h); shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.98, bevelSegments: seg, curveSegments: 6 });
  geo.translate(0, 0, -(d - 2 * r) / 2);
  geo.computeVertexNormals();
  return geo;
}

// cápsula afilada a lo largo de +Y desde 0 hasta len (radio r0 abajo, r1 arriba)
export function taperGeo(len, r0, r1, radial = 18) {
  const pts = [];
  const n = 8;
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + (i / n) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.cos(a) * r0, Math.sin(a) * r0)); }
  for (let i = 0; i <= n; i++) { const a = (i / n) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.cos(a) * r1, len + Math.sin(a) * r1)); }
  const geo = new THREE.LatheGeometry(pts, radial);
  geo.computeVertexNormals();
  return geo;
}
export function latheGeo(profile, radial = 28) {
  const geo = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), radial);
  geo.computeVertexNormals(); return geo;
}

// ---------- IK de dos huesos ----------
const _d = new THREE.Vector3(), _p = new THREE.Vector3(), _n = new THREE.Vector3();
export function solveIK(A, T, l1, l2, pole, outMid, outEnd) {
  _d.subVectors(T, A);
  let dist = _d.length();
  const maxR = l1 + l2 - 1e-4, minR = Math.abs(l1 - l2) + 1e-3;
  _d.normalize();
  dist = clamp(dist, minR, maxR);
  outEnd.copy(A).addScaledVector(_d, dist);
  const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  _p.copy(pole).addScaledVector(_d, -pole.dot(_d));
  if (_p.lengthSq() < 1e-8) _p.set(0, 0, 1).addScaledVector(_d, -_d.z);
  _n.copy(_p).normalize();
  outMid.copy(A).addScaledVector(_d, a).addScaledVector(_n, h);
}

const _Y = new THREE.Vector3(0, 1, 0), _dir = new THREE.Vector3();
export function placeSegment(obj, from, to) {
  obj.position.copy(from);
  _dir.subVectors(to, from).normalize();
  obj.quaternion.setFromUnitVectors(_Y, _dir);
}

export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// ---------- extremidad flexible: tubo de radio variable que sigue una curva suave (hombro-codo-muñeca) ----------
export class FlexTube {
  constructor(mat, radiusFn, { seg = 26, radial = 14, u0 = 0, u1 = 1, open = false } = {}) {
    this.seg = seg; this.radial = radial; this.radiusFn = radiusFn; this.u0 = u0; this.u1 = u1;
    const nv = (seg + 1) * (radial + 1);
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2);
    const idx = [];
    for (let i = 0; i < seg; i++) for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j, b = (i + 1) * (radial + 1) + j;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    for (let i = 0; i <= seg; i++) for (let j = 0; j <= radial; j++) { const k = i * (radial + 1) + j; uv[k * 2] = j / radial; uv[k * 2 + 1] = i / seg; }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    this.geo = g; this.pos = pos; this.nor = nor;
    this.mesh = new THREE.Mesh(g, mat); this.mesh.castShadow = true; this.mesh.receiveShadow = true; this.mesh.frustumCulled = false;
    this._p = new THREE.Vector3(); this._t = new THREE.Vector3(); this._n = new THREE.Vector3(); this._b = new THREE.Vector3();
  }
  // pts: [A, M, E] puntos (espacio del padre). ref: vector de referencia para el marco
  update(A, M, E, ref, bend = 0.55) {
    // curva: bezier cuadrática por tramos suavizada; pasa por A, cerca de M, por E
    const P = this._p, T = this._t, N = this._n, Bn = this._b;
    const seg = this.seg, radial = this.radial, pos = this.pos, nor = this.nor;
    const l1 = A.distanceTo(M), l2 = M.distanceTo(E), L = l1 + l2;
    const sp = l1 / L;
    // puntos de control: rodilla/codo redondeado con radio proporcional a "bend"
    const ca = new THREE.Vector3().lerpVectors(M, A, bend * 0.5);
    const cb = new THREE.Vector3().lerpVectors(M, E, bend * 0.5);
    const evalP = (s, out) => {
      // s en [0,1] a lo largo de la longitud
      const d = s * L;
      const dA = l1 * (1 - bend * 0.5), dB = l1 + l2 * bend * 0.5;
      if (d <= dA) return out.lerpVectors(A, ca, d / dA);
      if (d >= dB) return out.lerpVectors(cb, E, (d - dB) / (L - dB));
      const u = (d - dA) / (dB - dA);
      // bezier cuadrática ca -> M -> cb
      const a = (1 - u) * (1 - u), b2 = 2 * (1 - u) * u, c = u * u;
      return out.set(ca.x * a + M.x * b2 + cb.x * c, ca.y * a + M.y * b2 + cb.y * c, ca.z * a + M.z * b2 + cb.z * c);
    };
    const prev = new THREE.Vector3(), next = new THREE.Vector3();
    N.copy(ref);
    for (let i = 0; i <= seg; i++) {
      const s = this.u0 + (this.u1 - this.u0) * (i / seg);
      evalP(s, P);
      evalP(Math.min(1, s + 0.01), next); evalP(Math.max(0, s - 0.01), prev);
      T.subVectors(next, prev).normalize();
      // marco: N ortogonal a T (transporte aproximado desde ref)
      N.addScaledVector(T, -N.dot(T)); if (N.lengthSq() < 1e-6) N.set(1, 0, 0).addScaledVector(T, -T.x); N.normalize();
      Bn.crossVectors(T, N);
      const r = this.radiusFn(s);
      for (let j = 0; j <= radial; j++) {
        const th = (j / radial) * Math.PI * 2, cs = Math.cos(th), sn = Math.sin(th);
        const nx = N.x * cs + Bn.x * sn, ny = N.y * cs + Bn.y * sn, nz = N.z * cs + Bn.z * sn;
        const k = (i * (radial + 1) + j) * 3;
        pos[k] = P.x + nx * r; pos[k + 1] = P.y + ny * r; pos[k + 2] = P.z + nz * r;
        nor[k] = nx; nor[k + 1] = ny; nor[k + 2] = nz;
      }
    }
    this.geo.attributes.position.needsUpdate = true; this.geo.attributes.normal.needsUpdate = true;
    this.geo.computeBoundingSphere();
  }
}
