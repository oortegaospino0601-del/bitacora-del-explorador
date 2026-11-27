import * as THREE from 'three';
import { Engine, W, H } from './engine.js';
import { SETS } from './sets.js';
import { CAST } from './cast.js';
import { STYLES, stepPose, neutral, lerpPose } from './dance.js';
import { Bottle, loadBottleTexture } from './bottle.js';
import { timeToBeat, beatToTime, clamp, lerp, smooth, smoother, easeOutCubic, easeInCubic, easeInOutCubic, easeOutExpo, easeOutBack, easeInExpo, wobble, V, fract } from './lib.js';
import { KText, StepTag, HashTag } from './text.js';

const engine = new Engine(document.getElementById('c'));
await loadBottleTexture();
await document.fonts.load('400 100px Dela'); await document.fonts.load('800 40px Baloo'); await document.fonts.load('900 40px Rubik');

// ------------------------------------------------------------------------------------
// MUNDOS
// ------------------------------------------------------------------------------------
const L = 0, R = 1;
function makeCam() { return new THREE.PerspectiveCamera(36, W / H, 0.05, 60); }

function world(setName, chars) {
  const set = SETS[setName]();
  const actors = chars.map(([key, x, z, yaw]) => {
    const ch = CAST[key](); set.scene.add(ch.root);
    return { key, ch, x, z, yaw: yaw || 0, style: STYLES[{ abuela: 'abuela', gamer: 'gamer', ofi: 'ofi', rock: 'rock' }[key]], bottle: null };
  });
  return { set, scene: set.scene, actors, cam: makeCam() };
}

const WK = world('kitchen', [['abuela', 0, 0]]);
const WR = world('room', [['gamer', 0, 0]]);
const WO = world('office', [['ofi', 0, 0]]);
const WG = world('garage', [['rock', 0, 0]]);
const WT = world('terrace', [['abuela', -0.3, 0.25], ['gamer', -0.74, -0.45], ['ofi', 0.3, 0.25], ['rock', 0.74, -0.45]]);
WK.set.table.visible = false;
[WK, WR, WO, WG].forEach((w) => { w.bottle = new Bottle({ rim: w.set.rim }); w.scene.add(w.bottle.group); });
WT.bottles = WT.actors.map(() => { const b = new Bottle({ rim: '#ffb36b' }); WT.scene.add(b.group); return b; });

// ------------------------------------------------------------------------------------
// TIEMPOS (en beats). 1 bloque = 8 tiempos. Corte exactamente en el golpe.
// ------------------------------------------------------------------------------------
const HOOK = 0, SOLO = [8, 16, 24, 32], FIN1 = 40, FIN2 = 48;

// ---------- utilidades de pose ----------
function setHand(p, i, v, w) { if (w <= 0) return; const k = i === L ? 'handL' : 'handR'; p[k] = p[k].map((x, j) => lerp(x, v[j], w)); }

function idlePose(key, B) {
  const p = neutral();
  const br = Math.sin(B * Math.PI * 0.5);
  p.hipsY = -0.02 + br * 0.006; p.chestRX = br * 0.02;
  if (key === 'abuela') { p.handR = [-0.12, 0.0, 0.26]; p.fistR = 0.8; p.handL = [0.16, -0.27, 0.02]; p.elbowL = [1, 0, -0.4]; p.fistL = 0.9; p.headRY = 0.25; p.headRZ = 0.08; p.mouth = 0.1; p.hipsRZ = 0.04 * Math.sin(B * Math.PI); }
  if (key === 'gamer') { p.handL = [0.08, -0.12, 0.3]; p.handR = [-0.08, -0.12, 0.3]; p.fistL = p.fistR = 0.7; p.headRX = 0.28; p.spineRX = 0.15; p.mouth = 0.0; p.elbowL = [0.9, -0.6, -0.3]; p.elbowR = [-0.9, -0.6, -0.3]; }
  if (key === 'ofi') { p.handL = [-0.1, -0.02, 0.22]; p.handR = [0.1, -0.05, 0.25]; p.fistL = p.fistR = 0.6; p.elbowL = [0.9, -0.5, 0]; p.elbowR = [-0.9, -0.5, 0]; p.headRY = -0.2; p.brow = -0.2; p.mouth = 0.0; p.smile = 0.3; }
  if (key === 'rock') { p.handL = [0.24, -0.34, 0.06]; p.handR = [-0.05, -0.1, 0.3]; p.fistR = 0.9; p.headRX = 0.15 + 0.12 * Math.max(0, Math.sin(B * Math.PI * 2)); p.footL = [0.17, 0, 0]; p.footR = [-0.17, 0, 0]; p.mouth = 0.05; }
  return p;
}

// pose del actor en un mundo solista (con manejo de botella)
function soloPose(a, B, step, blockStart, opts = {}) {
  const b = B - blockStart;
  let p = stepPose(step, b, a.style);
  // agarre / atrapada
  if (opts.catch) {
    const w = b < 0.18 ? 1 : 1 - smooth((b - 0.18) / 0.55);
    setHand(p, R, [-0.46, 0.06, 0.26], w); if (w > 0) { p.elbowR = [-1, -0.3, -0.2]; p.fistR = lerp(p.fistR, 0.2 + 0.6 * clamp(b / 0.18), w); p.chestRY += -0.15 * w; p.headRY += -0.25 * w; }
  }
  if (opts.toss) {
    // cambio de mano (6.0-6.6) y lanzamiento a la derecha (6.6-7.5)
    const sw = smooth(clamp((b - 5.9) / 0.4)) * (1 - smooth(clamp((b - 6.55) / 0.3)));
    setHand(p, R, [-0.03, -0.02, 0.3], sw); setHand(p, L, [0.06, -0.02, 0.3], sw);
    const wind = smooth(clamp((b - 6.5) / 0.4));
    const ext = easeOutCubic(clamp((b - 7.05) / 0.4));
    const rel = smooth(clamp((b - 7.6) / 0.4));
    const tossPos = [lerp(lerp(0.12, 0.5, ext), 0.3, rel), lerp(lerp(-0.12, 0.22, ext), 0.0, rel), lerp(0.22, 0.24, ext)];
    setHand(p, L, tossPos, wind);
    if (wind > 0) { p.elbowL = [1, -0.3, -0.2]; p.fistL = lerp(p.fistL, 0.8 * (1 - rel), wind); p.chestRY += 0.2 * ext * (1 - rel); p.headRY += 0.35 * ext; p.mouth = Math.max(p.mouth, 0.6 * ext); }
  }
  if (opts.thrust) {
    const w = easeInOutCubic(clamp((b - 6.4) / 1.2));
    setHand(p, R, [-0.08, 0.12, 0.5], w); if (w > 0) { p.elbowR = [-1, -0.5, -0.3]; p.fistR = 0.85; p.mouth = Math.max(p.mouth, 0.8 * w); p.brow = 0.8; p.spineRX += 0.1 * w; }
  }
  if (opts.holding !== undefined) {
    const hk = opts.holding(b) === L ? 'L' : 'R';
    p['fist' + hk] = Math.max(p['fist' + hk], 0.75);
    p['palm' + hk] = [0, 0, 1];
    if (p['hand' + hk][2] < 0.2) p['hand' + hk][2] = lerp(p['hand' + hk][2], 0.2, 0.8);
  }
  // parpadeo
  const bl = fract(B / 3.3 + a.x * 0.37 + a.key.length * 0.13);
  p.blink = bl < 0.045 ? Math.sin((bl / 0.045) * Math.PI) : 0;
  return p;
}

function applyActor(a, poseFn, B, cam) {
  const p = poseFn(B);
  const q = poseFn(B - 0.12);
  p._headV = (p.headRX - q.headRX) * 3; p._swayV = (p.hipsRZ - q.hipsRZ) * 3; p._kick = Math.max(p.footL[2], p.footR[2]) * 2;
  p.rootX = (p.rootX || 0) + a.x; p.rootZ = (p.rootZ || 0) + a.z; p.rootYaw = (p.rootYaw || 0) + a.yaw;
  a.ch.apply(p, cam);
  return p;
}

// ---------- botella en la mano ----------
const _v = V(), _v2 = V();
function gripPoint(a, hand, out = V()) {
  const arm = a.ch.arm[hand];
  out.copy(arm.hand.g.position).addScaledVector(arm.dir, 0.05 * 1).applyMatrix4(a.ch.root.matrixWorld);
  return out;
}
function rollFor(a, hand, cam) {
  const d = a.ch.arm[hand].dir.clone().transformDirection(a.ch.root.matrixWorld).transformDirection(cam.matrixWorldInverse);
  return clamp(-Math.atan2(d.x, Math.max(0.2, d.y)) * 0.45, -0.38, 0.38);
}
function camRight(cam) { return V(1, 0, 0).applyQuaternion(cam.quaternion); }
function camUp(cam) { return V(0, 1, 0).applyQuaternion(cam.quaternion); }
const arc = (p0, p1, u, h) => p0.clone().lerp(p1, u).add(V(0, Math.sin(Math.PI * u) * h, 0));

// ------------------------------------------------------------------------------------
// CÁMARAS
// ------------------------------------------------------------------------------------
function setCam(cam, pos, look, fov = 36, roll = 0, t = 0, shake = 0.004) {
  cam.position.set(pos[0] + wobble(t, 1, 0.6) * shake, pos[1] + wobble(t, 2, 0.7) * shake, pos[2]);
  cam.fov = fov; cam.updateProjectionMatrix();
  cam.up.set(Math.sin(roll), Math.cos(roll), 0);
  cam.lookAt(look[0] + wobble(t, 3, 0.5) * shake * 0.6, look[1] + wobble(t, 4, 0.5) * shake * 0.6, look[2]);
  cam.updateMatrixWorld();
}
const punch = (B, beats, amt = 0.06) => { let k = 0; beats.forEach((x) => { if (B >= x) k = Math.max(k, Math.exp(-(B - x) * 3.5) * amt); }); return k; };

// whip: desplazamiento angular de la cámara al salir/entrar (rad), y blur horizontal para el panel
function whipOut(b) { const u = clamp((b - 7.62) / 0.38); return easeInExpo(u) * 0.9; }
function whipIn(b) { const u = clamp(b / 0.32); return (1 - easeOutExpo(u)) * -0.9; }

// cada solista: cámara base
const SOLOCAM = {
  kitchen: (b, t) => ({ pos: [lerp(0.35, -0.25, smooth(b / 8)), 1.0 + 0.05 * Math.sin(b * 0.4), lerp(4.25, 3.75, smoother(b / 8))], look: [0, 1.04, 0], fov: 37, roll: 0.0 }),
  room: (b, t) => ({ pos: [lerp(-0.5, 0.3, smooth(b / 8)), 0.8, lerp(4.0, 3.6, smooth(b / 8))], look: [0, 1.06, 0], fov: 38, roll: -0.06 }),
  office: (b, t) => ({ pos: [lerp(-0.7, 0.7, smoother(b / 8)), 1.12, 3.95], look: [lerp(-0.15, 0.15, smoother(b / 8)), 1.04, 0], fov: 36, roll: 0 }),
  garage: (b, t) => ({ pos: [lerp(0.4, -0.1, smooth(b / 8)), 0.6, lerp(3.8, 3.4, smooth(b / 6))], look: [0, 1.12, 0], fov: 39, roll: 0.04 }),
};

// ------------------------------------------------------------------------------------
// RENDER DE CADA MUNDO
// ------------------------------------------------------------------------------------
const STEP_OF = { kitchen: 'cielo', room: 'cruce', office: 'puno', garage: 'palmas' };
const SOLO_START = { kitchen: SOLO[0], room: SOLO[1], office: SOLO[2], garage: SOLO[3] };
const W_OF = { kitchen: WK, room: WR, office: WO, garage: WG };

// estado de la botella en mundos solistas
function bottleSolo(w, name, B, cam) {
  const a = w.actors[0], bt = w.bottle;
  const s = SOLO_START[name], b = B - s;
  const first = name === 'kitchen';
  const last = name === 'garage';
  bt.group.visible = true;
  // antes del solo (gancho): la abuela ya la tiene en la mano derecha; los demás no la tienen
  if (B < s) {
    if (first) { bt.place(cam, gripPoint(a, R), rollFor(a, R, cam), 1, 0.2); bt.setGlint(fract(B / 4) * 2.2 - 0.6, 0.7); }
    else bt.group.visible = false;
    return;
  }
  const holdHand = (b < 6.42 || last) ? R : L;
  // llegada (vuela desde la izquierda del cuadro)
  if (!first && b < 0.18) {
    const end = gripPoint(a, R);
    const start = end.clone().addScaledVector(camRight(cam), -1.3).addScaledVector(camUp(cam), 0.25);
    const u = easeOutCubic(clamp((b + 0.12) / 0.3));
    bt.place(cam, arc(start, end, u, 0.15), (1 - u) * 3.5, 1, 0.2); bt.setGlint(0.4, 0.8);
    return;
  }
  // salida (lanzada a la derecha)
  if (!last && b >= 7.5) {
    // punto de liberación = agarre de la mano izquierda en b=7.5 (se calcula re-posando: función pura del tiempo)
    a.ch.apply(w._poseFn(s + 7.5), cam); const start = gripPoint(a, L); a.ch.apply(w._poseFn(B), cam);
    const end = start.clone().addScaledVector(camRight(cam), 1.9).addScaledVector(camUp(cam), 0.35);
    const u = easeInCubic(clamp((b - 7.5) / 0.5)) * 0.65 + clamp((b - 7.5) / 0.5) * 0.35;
    bt.place(cam, arc(start, end, u, 0.35), -u * 4.5, 1, 0.2); bt.setGlint(0.5, 0.6);
    return;
  }
  const gp = gripPoint(a, holdHand);
  bt.place(cam, gp, rollFor(a, holdHand, cam), 1, 0.2);
  // destello: al atrapar y en tiempos fuertes
  const g = b < 1.2 ? lerp(-0.4, 1.8, clamp(b / 1.2)) : fract((b - 1.2) / 3) * 2.6 - 0.6;
  bt.setGlint(g, b < 1.2 ? 1.0 : 0.6);
}

function renderSolo(name, B, t, rt, camOverride) {
  const w = W_OF[name]; const a = w.actors[0]; const cam = w.cam;
  const s = SOLO_START[name];
  const b = B - s;
  w.set.update(t, B);
  // cámara
  const c = SOLOCAM[name](clamp(b, -8, 8), t);
  let pos = c.pos.slice(), look = c.look.slice(), fov = c.fov, roll = c.roll;
  if (B >= s) {
    fov *= 1 - punch(b, [0, 4], 0.05) - (name === 'room' ? punch(b, [1, 2, 3, 5, 6, 7], 0.025) : 0);
    // whip-pan de entrada/salida
    const yaw = (name !== 'kitchen' ? whipIn(b) : 0) + (name !== 'garage' ? whipOut(b) : 0);
    if (yaw !== 0) { const dx = look[0] - pos[0], dz = look[2] - pos[2]; const cs = Math.cos(-yaw), sn = Math.sin(-yaw); look = [pos[0] + dx * cs - dz * sn, look[1], pos[2] + dx * sn + dz * cs]; }
    if (name === 'garage') { const k = easeInCubic(clamp((b - 6.4) / 1.6)); pos[2] = lerp(pos[2], 1.25, k); pos[1] = lerp(pos[1], 1.2, k); look[1] = lerp(look[1], 1.3, k); fov = lerp(fov, 30, k); }
  }
  if (camOverride) ({ pos, look, fov, roll } = camOverride(pos, look, fov, roll));
  setCam(cam, pos, look, fov, roll, t, name === 'garage' ? 0.012 : 0.005);
  // pose
  const poseFn = (BB) => {
    if (BB < s) { // gancho
      const idle = idlePose(a.key, BB);
      if (BB < 3.7) return idle;
      const pal = soloPose(a, BB, 'palmas', HOOK, { holding: a.key === 'abuela' ? () => R : undefined });
      return lerpPose(idle, pal, smooth((BB - 3.7) / 0.3));
    }
    return soloPose(a, BB, STEP_OF[name], s, {
      catch: name !== 'kitchen', toss: name !== 'garage', thrust: name === 'garage',
      holding: (bb) => (bb < 6.42 || name === 'garage') ? R : L,
    });
  };
  w._poseFn = (BB) => { const p = poseFn(BB); p.rootX = (p.rootX || 0) + a.x; p.rootZ = (p.rootZ || 0) + a.z; return p; };
  applyActor(a, poseFn, B, cam);
  bottleSolo(w, name, B, cam);
  engine.renderShot(w.scene, cam, rt);
  return cam;
}

// ---------- terraza final ----------
const TOAST_W = V(0, 1.47, 0.12);
function renderFinale(B, t, rt) {
  const w = WT, cam = w.cam;
  w.set.update(t, B);
  const b = B - FIN1;
  // cámara: match cut desde la botella del rockero -> retroceso rápido -> grúa
  let pos, look, fov;
  const back = easeOutExpo(clamp(b / 1.6));
  if (b < 8) {
    pos = [lerp(0.62, 0.0, back), lerp(1.35, 1.3, back), lerp(0.75, 4.6, back)];
    look = [lerp(0.62, 0, back), lerp(1.3, 1.12, back), lerp(-0.45, 0, back)];
    fov = lerp(30, 42, back) * (1 - punch(b, [2, 4], 0.05));
    const orb = smooth(clamp((b - 1.5) / 6.5));
    pos[0] += Math.sin(orb * 0.6) * 0.8; pos[2] -= orb * 0.3;
  } else {
    const bb = b - 8;
    const k = smoother(clamp(bb / 3));
    pos = [lerp(0.35, 0, k), lerp(1.3, 1.22, k), lerp(4.7, 4.1, k)];
    look = [0, lerp(1.25, 1.6, k), 0];
    fov = 42 * (1 - punch(bb, [3], 0.09));
    const rise = smooth(clamp((bb - 4) / 3));
    pos[2] += rise * 0.25; look[1] += rise * 0.06;
  }
  setCam(cam, pos, look, fov, 0, t, 0.006);
  // actores
  w.actors.forEach((a, i) => {
    const bottleHand = a.x < 0 ? L : R;
    const poseFn = (BB) => {
      const bb = BB - FIN1;
      let p;
      if (bb < 8) {
        p = stepPose('giro', bb, a.style);
        const hk = bottleHand === L ? 'L' : 'R';
        p['fist' + hk] = 0.8;
      } else {
        const b2 = bb - 8;
        const walkX = [0.06, 0.3, -0.06, -0.3][i], walkZ = [0.1, 0.3, 0.1, 0.3][i];
        // punto de brindis en coords. del pecho (mano derecha); para mano izquierda se espeja
        const sc = a.ch.root.scale.x;
        const chestY = (a.ch.standH + 0.06 + a.ch.body.torsoLen * 0.7) * sc;
        let tx = (TOAST_W.x - (a.x + walkX)) / sc, ty = (TOAST_W.y - chestY) / sc, tz = (TOAST_W.z - (a.z + walkZ)) / sc;
        if (bottleHand === L) tx = -tx;
        p = stepPose('brindis', b2, a.style, { hand: bottleHand, toast: [tx + (bottleHand === L ? 0.06 : 0.06), ty, tz], walkZ });
        p.rootX = walkX * smooth(clamp(b2 / 2));
        // 7-8 se quedan en la pose (el audio termina en 7.06)
      }
      const bl = fract(BB / 3.1 + i * 0.29);
      p.blink = bl < 0.045 ? Math.sin((bl / 0.045) * Math.PI) : 0;
      if (a.key === 'abuela' && bb > 13.5) p.wink = smooth(clamp((bb - 13.5) / 0.3));
      return p;
    };
    applyActor(a, poseFn, B, cam);
    const bt = w.bottles[i];
    bt.place(cam, gripPoint(a, bottleHand), rollFor(a, bottleHand, cam), 1, 0.2);
    const bb = b - 8;
    const g = bb > 2.6 && bb < 4 ? lerp(-0.5, 2, (bb - 2.6) / 1.4) : fract(b / 4 + i * 0.25) * 2.6 - 0.6;
    bt.setGlint(g, bb > 2.6 && bb < 4 ? 1.2 : 0.55);
  });
  // destellos del brindis
  sparkle.update(B, cam);
  engine.renderShot(w.scene, cam, rt);
  return cam;
}

// chispas del brindis
const sparkle = (() => {
  const n = 60; const geo = new THREE.BufferGeometry(); const pos = new Float32Array(n * 3); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const tex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,220,240,0.8)'); gr.addColorStop(1, 'rgba(255,120,180,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t; })();
  const mat = new THREE.PointsMaterial({ map: tex, size: 0.06, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(3, 2.4, 2.6) });
  const pts = new THREE.Points(geo, mat); WT.scene.add(pts);
  const dirs = []; let s = 5; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) { const th = r() * Math.PI * 2, ph = r() * Math.PI; dirs.push([Math.cos(th) * Math.sin(ph), Math.cos(ph) * 0.8 + 0.3, Math.sin(th) * Math.sin(ph), 0.5 + r()]); }
  return {
    update(B) {
      const u = (B - (FIN2 + 3)) * 0.6; // segundos aprox.
      pts.visible = u > 0 && u < 1.6;
      if (!pts.visible) return;
      for (let i = 0; i < n; i++) { const d = dirs[i]; const k = (1 - Math.exp(-u * 4)) * 0.6 * d[3]; pos[i * 3] = TOAST_W.x + d[0] * k; pos[i * 3 + 1] = TOAST_W.y + 0.12 + d[1] * k - u * u * 0.25; pos[i * 3 + 2] = TOAST_W.z + d[2] * k; }
      geo.attributes.position.needsUpdate = true; mat.opacity = 1 - clamp((u - 0.6) / 1.0); mat.size = 0.07 * (1 - u * 0.3);
    },
  };
})();

// ------------------------------------------------------------------------------------
// COMPOSICIÓN
// ------------------------------------------------------------------------------------
const P = engine.panels;
const GUT = 14, CW = (W - 3 * GUT) / 2, CH = (H - 3 * GUT) / 2;
const CELLS = [[GUT + CW / 2, GUT + CH / 2], [2 * GUT + 1.5 * CW, GUT + CH / 2], [GUT + CW / 2, 2 * GUT + 1.5 * CH], [2 * GUT + 1.5 * CW, 2 * GUT + 1.5 * CH]];
const HOOK_ORDER = ['kitchen', 'room', 'office', 'garage'];
const PINK = new THREE.Color('#ff2a7f');

function resetPanels() {
  P.forEach((p) => { p.mesh.visible = false; const u = p.mat.uniforms; u.radius.value = 0; u.border.value = 0; u.opacity.value = 1; u.blur.value.set(0, 0); u.zoomBlur.value = 0; u.uvScale.value.set(1, 1); u.uvOffset.value.set(0, 0); u.bright.value = 1; u.tintAmt.value = 0; p.mesh.rotation.z = 0; });
}

// textos
const texts = [
  new KText({ text: 'DIFERENTES,', x: 505, y: 905, size: 112, maxW: 820, inBeat: 0.15, outBeat: 3.7, mode: 'drop', stagger: 0.06, rot: -3 }),
  new KText({ text: 'PERO AL', x: 505, y: 860, size: 92, inBeat: 4.0, outBeat: 7.55, mode: 'slam', stagger: 0.03, rot: -3, color: '#ffffff' }),
  new KText({ text: 'MISMO PASO', x: 505, y: 985, size: 118, maxW: 840, inBeat: 4.25, outBeat: 7.55, mode: 'slam', stagger: 0.035, rot: -3, color: '#ffe14a', stroke: '#ff2a7f' }),
  new KText({ text: '¿TE LE MIDES', x: 505, y: 360, size: 104, inBeat: FIN2 + 1.0, outBeat: 99, mode: 'drop', stagger: 0.045, rot: -2 }),
  new KText({ text: 'AL PASO?', x: 505, y: 480, size: 128, inBeat: FIN2 + 1.6, outBeat: 99, mode: 'drop', stagger: 0.05, rot: -2, color: '#ffe14a' }),
];
const tags = [
  new StepTag({ num: 2, name: 'MANOS AL CIELO', inBeat: SOLO[0], outBeat: SOLO[0] + 7.6 }),
  new StepTag({ num: 3, name: 'CRUCE', inBeat: SOLO[1], outBeat: SOLO[1] + 7.6 }),
  new StepTag({ num: 4, name: 'PUÑO ARRIBA', inBeat: SOLO[2], outBeat: SOLO[2] + 7.6 }),
  new StepTag({ num: 1, name: 'PALMAS CALEÑAS', inBeat: SOLO[3], outBeat: SOLO[3] + 7.6 }),
];
const hash = new HashTag({ text: '#LaManzanaQueNosUne', x: 505, y: 548, inBeat: FIN2 + 4.2 });

export function renderFrame(t) {
  const B = timeToBeat(t);
  resetPanels();
  let flash = 0;
  const g = engine.grade.uniforms;
  g.vignette.value = 0.32; g.lift.value.setRGB(0.0, 0.0, 0.0);
  engine.compBg.material.color.set('#16051a');

  if (B < 8.0) {
    // ---- GANCHO: pantalla dividida ----
    const expand = easeInOutCubic(clamp((B - 7.72) / 0.28));
    HOOK_ORDER.forEach((name, i) => {
      const full = i === 0 && B >= 7.6;
      const rt = full ? engine.rts[0] : engine.rtsSmall[i];
      renderSolo(name, B, t, rt);
      const p = P[i]; p.mesh.visible = true; p.mat.uniforms.tex.value = rt.texture;
      const on = clamp((B - i) / 0.12), k = Math.exp(-Math.max(0, B - i) * 5);
      // antes de su golpe: apagado y desaturado
      p.mat.uniforms.bright.value = lerp(0.35, 1, on) + k * 0.9 * on;
      p.mat.uniforms.tint.value.set('#2a0f2e'); p.mat.uniforms.tintAmt.value = (1 - on) * 0.55;
      const all = Math.exp(-Math.max(0, B - 4) * 4) * (B >= 4 ? 1 : 0);
      const sc = 1 + 0.06 * k * on + 0.03 * all;
      let [cx, cy] = CELLS[i]; let w = CW * sc, h = CH * sc;
      p.mat.uniforms.radius.value = 26; p.mat.uniforms.border.value = 6 + 6 * all; p.mat.uniforms.borderColor.value.copy(B >= 4 ? PINK : new THREE.Color('#ffffff'));
      if (i === 0 && expand > 0) { cx = lerp(cx, W / 2, expand); cy = lerp(cy, H / 2, expand); w = lerp(w, W, expand); h = lerp(h, H, expand); p.mat.uniforms.radius.value = 26 * (1 - expand); p.mat.uniforms.border.value *= 1 - expand; p.mesh.renderOrder = 10; p.mat.uniforms.zoomBlur.value = Math.sin(Math.PI * expand) * 0.06; }
      else { p.mesh.renderOrder = i + 1; }
      if (i > 0 && expand > 0) { p.mat.uniforms.opacity.value = 1 - expand; const d = [[0, 0], [1, -0.3], [-0.3, 1], [1, 1]][i]; cx += d[0] * expand * 300; cy += d[1] * expand * 300; }
      p.set(cx, cy, w, h, 0);
    });
    flash = Math.exp(-Math.max(0, B - 4) * 6) * (B >= 4 ? 0.35 : 0) + Math.exp(-Math.max(0, B - 8) * 8) * 0;
  } else if (B < FIN1) {
    // ---- SOLOS ----
    const idx = Math.floor((B - 8) / 8);
    const name = HOOK_ORDER[idx];
    const b = B - SOLO[idx];
    renderSolo(name, B, t, engine.rts[0]);
    const p = P[0]; p.mesh.visible = true; p.mat.uniforms.tex.value = engine.rts[0].texture; p.set(W / 2, H / 2, W, H);
    // blur del whip
    let blur = 0;
    if (name !== 'kitchen') blur += (1 - easeOutCubic(clamp(b / 0.32))) * 0.12;
    if (name !== 'garage') blur += easeInCubic(clamp((b - 7.62) / 0.38)) * 0.12;
    p.mat.uniforms.blur.value.set(blur, 0);
    if (name === 'kitchen') flash = Math.exp(-b * 9) * 0.25;
    if (name === 'garage') { p.mat.uniforms.zoomBlur.value = easeInCubic(clamp((b - 7.3) / 0.7)) * 0.05; flash = easeInExpo(clamp((b - 7.7) / 0.3)) * 0.85; }
  } else {
    // ---- FINAL EN LA TERRAZA ----
    const b = B - FIN1;
    renderFinale(B, t, engine.rts[0]);
    const p = P[0]; p.mesh.visible = true; p.mat.uniforms.tex.value = engine.rts[0].texture; p.set(W / 2, H / 2, W, H);
    p.mat.uniforms.zoomBlur.value = (1 - easeOutCubic(clamp(b / 0.8))) * 0.08;
    flash = Math.exp(-b * 5) * 0.85 + Math.exp(-Math.max(0, b - 11) * 7) * (b >= 11 ? 0.3 : 0);
    g.vignette.value = 0.38;
  }
  g.flash.value = clamp(flash);
  g.flashColor.value.set('#fff0f6');
  texts.forEach((x) => x.update(B));
  tags.forEach((x) => x.update(B));
  hash.update(B);
  engine.final(t);
}

window.renderFrame = renderFrame;
window.timeToBeat = timeToBeat;
window.__ready = true;
