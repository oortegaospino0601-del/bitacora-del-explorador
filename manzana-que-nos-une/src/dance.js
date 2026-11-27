import { track, clamp, lerp, fract, EASE, easeOutExpo, easeInOutSine, smooth } from './lib.js';

// Coreografía simplificada de la referencia (estilo salsa caleña) en bloques de 8 tiempos:
//  palmas : pies caleños (patada-toque alterna) + palmas al pecho en cada tiempo; 7-8 brazos arriba
//  cielo  : palmas arriba de la cabeza (1-4), rueda de manos bajando (5-6), golpes de cadera con manos en cintura (7-8)
//  cruce  : brazos en X / abrir (1-4) con rodilla, rueda de antebrazos bajando y subiendo (5-8)
//  puno   : puño arriba en cada tiempo (1-4), palmas empujando abajo con hombros (5-8)
//  giro   : vuelta completa (1-2), palmas arriba (3-4), cruce (5-8)
//  brindis: paso adelante (1-2), brindis al centro (3), botella arriba (4-6), pose final (7-8)

export const STYLES = {
  base: { amp: 1, bounce: 0.045, lag: 0.06, sharp: 0.5, hip: 1, lean: 0.06, head: 1, shimmy: 1 },
  abuela: { amp: 0.72, bounce: 0.032, lag: 0.1, sharp: 0.25, hip: 1.55, lean: 0.1, head: 0.8, shimmy: 1.3 },
  gamer: { amp: 1.08, bounce: 0.055, lag: 0.02, sharp: 1, hip: 0.8, lean: 0.04, head: 1.6, shimmy: 0.8 },
  ofi: { amp: 0.92, bounce: 0.036, lag: 0.05, sharp: 0.7, hip: 1.15, lean: 0.02, head: 0.9, shimmy: 1.5 },
  rock: { amp: 1.18, bounce: 0.06, lag: 0.04, sharp: 0.8, hip: 0.85, lean: 0.08, head: 2.0, shimmy: 0.7 },
};

const L = 0, R = 1;

export function neutral() {
  return {
    rootX: 0, rootZ: 0, rootYaw: 0,
    hipsY: -0.055, hipsX: 0, hipsZ: 0, hipsRX: 0, hipsRY: 0, hipsRZ: 0,
    spineRX: 0.05, spineRY: 0, spineRZ: 0, chestRX: 0, chestRY: 0, chestRZ: 0, headRX: 0, headRY: 0, headRZ: 0,
    handL: [0.24, -0.36, 0.06], handR: [-0.24, -0.36, 0.06], elbowL: [0.7, -0.4, -0.6], elbowR: [-0.7, -0.4, -0.6],
    palmL: [0, 0, 1], palmR: [0, 0, 1], fistL: 0.3, fistR: 0.3,
    footL: [0.12, 0, 0.0], footR: [-0.12, 0, 0.0], footYawL: 0.15, footYawR: -0.15, footPitchL: 0, footPitchR: 0,
    kneeL: [0.3, 0, 1], kneeR: [-0.3, 0, 1],
    mouth: 0.35, smile: 1, brow: 0.3, blink: 0, wink: 0,
  };
}

export function lerpPose(a, b, w) {
  if (w <= 0) return a; if (w >= 1) return b;
  const o = {};
  for (const k in a) {
    const x = a[k], y = b[k];
    if (Array.isArray(x)) o[k] = x.map((v, i) => v + ((y ? y[i] : v) - v) * w);
    else if (typeof x === 'number') o[k] = x + ((y ?? x) - x) * w;
    else o[k] = w < 0.5 ? x : y;
  }
  return o;
}

// ---------- capas ----------
function groove(p, b, st) {
  const ph = fract(b - st.lag);
  const g = Math.pow(0.5 + 0.5 * Math.cos(2 * Math.PI * ph), 1.6); // abajo en el tiempo
  p.hipsY += -st.bounce * g * 1.15 - 0.012;
  p.headRX += 0.07 * st.head * Math.pow(0.5 + 0.5 * Math.cos(2 * Math.PI * fract(b - st.lag - 0.08)), 2);
  p.spineRX += st.lean;
  return g;
}

function hipSway(p, b, st, period = 2, amt = 0.07) {
  const s = Math.sin((2 * Math.PI * (b - 0.25)) / period);
  p.hipsRZ += s * amt * st.hip;
  p.hipsX += s * 0.035 * st.hip;
  p.hipsRY += Math.sin((2 * Math.PI * b) / period) * 0.12 * st.hip;
  p.spineRZ += -s * amt * st.hip * 0.7;
  p.chestRY += -Math.sin((2 * Math.PI * b) / period) * 0.08 * st.hip;
  p.headRZ += -s * 0.04;
}

// pies caleños: en cada tiempo un pie hace patada-toque al frente y vuelve
function caleno(p, b, st, width = 0.13) {
  const k = Math.floor(b), u = b - k;
  const side = k % 2 === 0 ? R : L;
  const a = st.amp;
  const kick = Math.sin(Math.PI * clamp(u / 0.75)) * (u < 0.75 ? 1 : 0);
  const sharpK = Math.pow(kick, lerp(1, 0.6, st.sharp));
  p.footL = [width, 0, 0]; p.footR = [-width, 0, 0];
  const f = side === L ? p.footL : p.footR;
  f[2] += 0.2 * a * sharpK; f[1] += 0.07 * a * sharpK;
  if (side === L) p.footPitchL = -0.5 * sharpK; else p.footPitchR = -0.5 * sharpK;
  p.hipsX += (side === L ? -1 : 1) * 0.03 * kick; // peso sobre el pie de apoyo
  p.hipsRZ += (side === L ? 1 : -1) * 0.05 * kick * st.hip;
  p.spineRZ += (side === L ? -1 : 1) * 0.04 * kick * st.hip;
}

function stepTouch(p, b, st, w = 0.2) {
  const k = Math.floor(b), u = b - k;
  const e = EASE.inout(clamp(u / 0.55));
  const dir = k % 2 === 0 ? -1 : 1; // -1 = hacia la derecha del personaje (-x)
  const from = -dir, to = dir;
  const c = lerp(from, to, e) * w * 0.5 * st.amp; // centro de peso
  const lift = Math.sin(Math.PI * clamp(u / 0.55)) * 0.06 * st.amp;
  // pie que lidera llega a 'to', el otro cierra
  const lead = dir < 0 ? 'R' : 'L';
  const fl = [c + 0.1, 0, 0], fr = [c - 0.1, 0, 0];
  if (lead === 'R') { fr[0] = lerp(from * w * 0.5 - 0.1, to * w * 0.5 * st.amp - 0.12, e); fr[1] = lift; }
  else { fl[0] = lerp(from * w * 0.5 + 0.1, to * w * 0.5 * st.amp + 0.12, e); fl[1] = lift; }
  p.footL = fl; p.footR = fr;
  p.hipsX += c * 0.9;
  p.hipsRZ += -dir * 0.06 * st.hip * Math.sin(Math.PI * clamp(u));
}

// ---------- pasos ----------
const clapTr = (st) => track([[0, 0], [0.45, 1, 'out'], [1, 0, st.sharp > 0.6 ? 'in' : 'inout']]);

export function palmas(b, st) {
  const p = neutral();
  const g = groove(p, b, st);
  caleno(p, b, st);
  p.spineRX += 0.1;
  const k = Math.floor(b), u = b - k;
  const open = (k < 6) ? clapTr(st)(u) : 0; // 0 = manos juntas
  // 7-8 (k=6,7): brazos arriba abiertos "¡eso!"
  const up = smooth(clamp((b - 5.7) / 0.5)) * (1 - smooth(clamp((b - 7.55) / 0.45)));
  const a = st.amp;
  const hx = lerp(0.025, 0.2 * a, open), hy = -0.06 + 0.03 * open, hz = 0.27;
  p.handL = [lerp(hx, 0.38 * a, up), lerp(hy, 0.52, up), lerp(hz, 0.1, up)];
  p.handR = [-p.handL[0], p.handL[1], p.handL[2]];
  p.palmL = [-1 + up, up, 0.3]; p.palmR = [1 - up, up, 0.3];
  p.fistL = p.fistR = 0;
  p.elbowL = [0.8, lerp(-0.6, 0, up), -0.3]; p.elbowR = [-0.8, lerp(-0.6, 0, up), -0.3];
  p.chestRY += (k % 2 ? 1 : -1) * 0.1 * st.shimmy * Math.sin(Math.PI * u);
  p.mouth = 0.15 + 0.6 * up; p.brow = 0.2 + 0.6 * up;
  return p;
}

export function cielo(b, st) {
  const p = neutral();
  groove(p, b, st);
  stepTouch(p, b, st);
  const a = st.amp;
  // 0-4 palmas arriba
  const rise = EASE.back(clamp(b / 0.9));
  const k = Math.floor(b), u = b - k;
  const sep = b < 1 ? 1 - smooth(b) : (b < 4 ? clapTr(st)(u) : 1);
  const ox = lerp(0.03, 0.2 * a, sep);
  let hl = [lerp(0.25, ox, rise), lerp(-0.1, 0.68 * lerp(0.88, 1, a), rise), lerp(0.25, 0.1, rise)];
  let hr = [-hl[0], hl[1], hl[2]];
  p.elbowL = [1, 0.15, -0.2]; p.elbowR = [-1, 0.15, -0.2];
  p.palmL = [-1, 0, 0.2]; p.palmR = [1, 0, 0.2];
  // 4-6 rueda bajando
  if (b >= 3.6) {
    const w = smooth(clamp((b - 3.6) / 0.4));
    const t = clamp((b - 4) / 2);
    const ang = (b - 4) * Math.PI * 2;
    const cy = lerp(0.3, -0.18, t);
    const rl = [0.07 * Math.cos(ang), cy + 0.07 * Math.sin(ang), 0.26];
    const rr = [-0.07 * Math.cos(ang), cy - 0.07 * Math.sin(ang), 0.3];
    hl = hl.map((v, i) => lerp(v, rl[i], w)); hr = hr.map((v, i) => lerp(v, rr[i], w));
    p.elbowL = [lerp(1, 0.8, w), lerp(0.15, -0.6, w), -0.2]; p.elbowR = [lerp(-1, -0.8, w), lerp(0.15, -0.6, w), -0.2];
    p.fistL = p.fistR = w * 0.8;
  }
  // 6-8 manos a la cintura y golpe de cadera
  if (b >= 5.75) {
    const w = smooth(clamp((b - 5.75) / 0.35));
    hl = hl.map((v, i) => lerp(v, [0.17, -0.28, 0.0][i], w)); hr = hr.map((v, i) => lerp(v, [-0.17, -0.28, 0.0][i], w));
    p.elbowL = [1, 0, -0.4]; p.elbowR = [-1, 0, -0.4];
    p.fistL = p.fistR = 0.9;
    const pop = (b < 7 ? 1 : -1) * EASE.hit(clamp((b - (b < 7 ? 6 : 7)) / 0.35)) * (1 - smooth(clamp((b - 7.6) / 0.4)));
    p.hipsX += pop * 0.07 * st.hip; p.hipsRZ += pop * 0.12 * st.hip; p.spineRZ -= pop * 0.08;
    p.mouth = 0.5;
  }
  p.handL = hl; p.handR = hr;
  p.headRX -= 0.15 * rise * (b < 4 ? 1 : 0);
  p.mouth = Math.max(p.mouth, b < 4 ? 0.35 : 0.15);
  p.brow = 0.5;
  return p;
}

export function cruce(b, st) {
  const p = neutral();
  groove(p, b, st);
  hipSway(p, b, st, 2, 0.05);
  const a = st.amp;
  const k = Math.floor(b), u = b - k;
  const ease = st.sharp > 0.6 ? 'hit' : 'out';
  // pies: rodilla en 0 y 2 (izq), 7 (der); 4-6 abiertos y bajando
  p.footL = [0.15, 0, 0]; p.footR = [-0.15, 0, 0];
  const knee = (beat, side) => {
    const x = clamp((b - beat + 0.15) / 0.7);
    const v = Math.sin(Math.PI * x);
    const f = side === L ? p.footL : p.footR;
    f[1] += 0.17 * a * v; f[2] += 0.1 * a * v;
    if (side === L) p.footPitchL = -0.3 * v; else p.footPitchR = -0.3 * v;
    p.hipsX += (side === L ? -1 : 1) * 0.03 * v;
  };
  knee(0, L); knee(2, R); knee(7, L);
  // brazos
  const X = (rOver) => ({ hl: [-0.13, 0.03, rOver ? 0.17 : 0.21], hr: [0.13, 0.0, rOver ? 0.21 : 0.17] });
  const O = { hl: [0.42 * a, -0.16, 0.16], hr: [-0.42 * a, -0.16, 0.16] };
  let hl, hr, pl = [0.9, -0.5, 0], pr = [-0.9, -0.5, 0];
  if (b < 4) {
    const seq = [X(true), O, X(false), O, X(true)];
    // sostiene la forma del tiempo k y viaja a la del k+1 justo antes de que caiga el golpe
    const w = (st.sharp > 0.6 ? EASE.inout : EASE.sine)(clamp((u - 0.62) / 0.38));
    hl = seq[k].hl.map((v, i) => lerp(v, seq[k + 1].hl[i], w));
    hr = seq[k].hr.map((v, i) => lerp(v, seq[k + 1].hr[i], w));
    // pequeño rebote de "golpe" al llegar
    const hitv = Math.exp(-u * 9) * 0.03;
    hl[1] -= hitv; hr[1] -= hitv;
    p.fistL = p.fistR = 0.1;
    p.palmL = [0, 0, 1]; p.palmR = [0, 0, 1];
  } else {
    // rueda de antebrazos bajando (4-6) y subiendo (6-7), X en 7, abre en 8
    const ang = (b - 4) * Math.PI * 2.0;
    const down = b < 6 ? smooth((b - 4) / 2) : 1 - smooth((b - 6) / 1);
    const cy = lerp(-0.02, -0.36, down), cz = lerp(0.26, 0.34, down);
    const r = 0.075;
    hl = [r * Math.cos(ang) + 0.02, cy + r * Math.sin(ang), cz];
    hr = [-r * Math.cos(ang) - 0.02, cy - r * Math.sin(ang), cz + 0.03];
    p.hipsY -= 0.09 * down * a; p.spineRX += 0.25 * down;
    p.headRX -= 0.15 * down;
    p.footL = [0.2, 0, 0]; p.footR = [-0.2, 0, 0];
    knee(7, L);
    p.fistL = p.fistR = 0.85;
    if (b >= 6.8) {
      const w = EASE[ease](clamp((b - 6.8) / 0.25));
      const w2 = smooth(clamp((b - 7.5) / 0.5));
      const x = X(true);
      hl = hl.map((v, i) => lerp(lerp(v, x.hl[i], w), O.hl[i], w2)); hr = hr.map((v, i) => lerp(lerp(v, x.hr[i], w), O.hr[i], w2));
      p.fistL = p.fistR = lerp(0.85, 0.1, w);
    }
  }
  p.handL = hl; p.handR = hr; p.elbowL = pl; p.elbowR = pr;
  p.mouth = 0.25 + 0.3 * Math.sin(Math.PI * u) * (b < 4 ? 1 : 0); p.brow = 0.3;
  return p;
}

export function puno(b, st) {
  const p = neutral();
  groove(p, b, st);
  caleno(p, b, st, 0.14);
  const a = st.amp;
  const k = Math.floor(b), u = b - k;
  if (b < 4) {
    // puño arriba EN el tiempo, abajo al hombro en el "y"
    let upAmt = Math.pow(0.5 + 0.5 * Math.cos(2 * Math.PI * u), lerp(0.9, 0.45, st.sharp));
    if (b > 3.5) upAmt = 0;
    const upPos = [-0.12, 0.72 * lerp(0.9, 1, a), 0.06], shPos = [-0.24, 0.12, 0.16];
    const hr = shPos.map((v, i) => lerp(v, upPos[i], clamp(upAmt)));
    p.handR = hr; p.fistR = 1; p.palmR = [0, 0, 1]; p.elbowR = [-1, -0.2, 0.2];
    p.handL = [0.18, -0.27, 0.0]; p.fistL = 0.9; p.elbowL = [1, 0, -0.4];
    p.chestRZ += -0.08 * upAmt; p.headRX -= 0.1 * upAmt; p.mouth = 0.2 + 0.6 * upAmt;
    p.chestRY += -0.1 * upAmt;
  } else {
    const e = st.sharp > 0.6 ? EASE.hit(clamp(u / 0.25)) : EASE.out(clamp(u / 0.35));
    const sideX = (k % 2 ? 1 : -1) * 0.06;
    const press = 1 - e; // arriba antes del tiempo, abajo en el tiempo
    const y = lerp(-0.3, -0.12, press * (1 - smooth(clamp((b - 4) / 0.3)) * 0) ) ;
    const yy = lerp(-0.32, -0.1, Math.pow(Math.sin(Math.PI * u), 2));
    p.handL = [0.2 + sideX, yy, 0.27]; p.handR = [-0.2 + sideX, yy, 0.27];
    p.palmL = [0, -1, 0.2]; p.palmR = [0, -1, 0.2]; p.fistL = p.fistR = 0;
    p.elbowL = [1, -0.2, -0.3]; p.elbowR = [-1, -0.2, -0.3];
    p.chestRX += 0.05 * Math.sin(Math.PI * u); // hombros
    p.chestRZ += sideX * 0.8;
    p.spineRX += 0.08;
    p.mouth = 0.3;
    void y;
  }
  p.brow = 0.35;
  return p;
}

export function giro(b, st) {
  if (b >= 4) return cruce(b, st);
  const p = neutral();
  groove(p, b, st);
  const a = st.amp;
  const spin = easeInOutSine(clamp(b / 2));
  p.rootYaw = spin * Math.PI * 2;
  const sw = Math.sin(Math.PI * clamp(b / 2));
  p.handL = [lerp(0.25, 0.44 * a, sw), lerp(-0.3, 0.05, sw), 0.1]; p.handR = [-p.handL[0], p.handL[1], p.handL[2]];
  p.footL = [0.1, 0.03 * Math.abs(Math.sin(Math.PI * b * 2)), 0]; p.footR = [-0.1, 0.03 * Math.abs(Math.sin(Math.PI * b * 2 + 1.5)), 0];
  if (b >= 1.85) {
    const w = EASE.back(clamp((b - 1.85) / 0.3));
    const k = Math.floor(b), u = b - k;
    const sep = b < 3 ? 1 : clapTr(st)(u);
    p.handL = p.handL.map((v, i) => lerp(v, [lerp(0.04, 0.3, sep), 0.64, 0.1][i], w));
    p.handR = p.handR.map((v, i) => lerp(v, [-lerp(0.04, 0.3, sep), 0.64, 0.1][i], w));
    p.elbowL = [1, 0.2, -0.2]; p.elbowR = [-1, 0.2, -0.2];
    p.fistL = p.fistR = 0;
    p.mouth = 0.7; p.brow = 0.8;
    stepTouch(p, b, st, 0.16);
  }
  return p;
}

// brindis: toastL/R = punto de brindis en espacio de pecho (lo da la escena)
export function brindis(b, st, opt = {}) {
  const p = neutral();
  groove(p, b, st);
  hipSway(p, b, st, 2, 0.05);
  const a = st.amp;
  const walk = smooth(clamp(b / 2));
  p.rootZ = (opt.walkZ || 0.35) * walk;
  // pies caminando (0-2)
  if (b < 2) {
    const k = Math.floor(b * 2), u = b * 2 - k;
    const lift = Math.sin(Math.PI * u) * 0.08;
    p.footL = [0.12, k % 2 ? lift : 0, 0]; p.footR = [-0.12, k % 2 ? 0 : lift, 0];
  } else stepTouch(p, b, st, 0.14);
  const bottleHand = opt.hand ?? R;
  const toast = opt.toast || [-0.05, 0.15, 0.45];
  // mano de botella: pecho -> brindis (3) -> arriba (4-6) -> pose V (7)
  const toW = EASE.out(clamp((b - 2.1) / 0.85)) * (1 - smooth(clamp((b - 3.35) / 0.5)));
  const upW = EASE.back(clamp((b - 3.6) / 0.6));
  const vW = EASE.back(clamp((b - 6) / 0.4));
  const chestPos = [-0.12, -0.05, 0.28];
  const upPos = [-0.14 + 0.1 * Math.sin(Math.PI * (b - 4)), 0.66, 0.12];
  const vPos = [-0.38, 0.56, 0.12];
  let hb = chestPos.map((v, i) => lerp(v, toast[i], toW));
  hb = hb.map((v, i) => lerp(v, upPos[i], upW));
  hb = hb.map((v, i) => lerp(v, vPos[i], vW));
  // mano libre: aplaude el ritmo / sube en la pose
  const k = Math.floor(b), u = b - k;
  const free0 = [0.26, -0.3 + 0.08 * Math.sin(Math.PI * u), 0.15];
  const freeUp = [0.16 + 0.08 * Math.sin(Math.PI * (b - 4)), 0.62, 0.12];
  const freeV = [0.38, 0.56, 0.12];
  let hf = free0.map((v, i) => lerp(v, freeUp[i], upW)).map((v, i) => lerp(v, freeV[i], vW));
  if (bottleHand === R) { p.handR = hb; p.handL = hf; } else { p.handL = [-hb[0], hb[1], hb[2]]; p.handR = [-hf[0], hf[1], hf[2]]; }
  p.fistL = bottleHand === L ? 0.75 : 0.2; p.fistR = bottleHand === R ? 0.75 : 0.2;
  p.elbowL = [1, lerp(-0.5, 0.2, upW), -0.3]; p.elbowR = [-1, lerp(-0.5, 0.2, upW), -0.3];
  p.mouth = 0.3 + 0.5 * toW + 0.4 * vW; p.brow = 0.4 + 0.4 * vW;
  p.headRX -= 0.12 * upW;
  return p;
}

export const STEPS = { palmas, cielo, cruce, puno, giro, brindis };
export const stepPose = (name, b, st, opt) => STEPS[name](b, st, opt);
