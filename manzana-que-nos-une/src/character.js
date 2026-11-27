import * as THREE from 'three';
import { mesh, taperGeo, latheGeo, roundedBoxGeo, solveIK, placeSegment, cloth, skinMat, std, V, clamp, lerp, radialTex, FlexTube } from './lib.js';

// Personaje original estilizado (proporción ~4.4 cabezas), rig procedural con IK en brazos y piernas.
const SPH = (r, w = 32, h = 20) => new THREE.SphereGeometry(r, w, h);
const blobTex = radialTex(null, null, 128, [[0, 'rgba(0,0,0,0.55)'], [0.5, 'rgba(0,0,0,0.25)'], [1, 'rgba(0,0,0,0)']]);

export const DEFAULT_BODY = {
  thigh: 0.41, shin: 0.39, ankle: 0.075, upper: 0.3, fore: 0.285,
  hipHalf: 0.095, shoulderHalf: 0.19, torsoLen: 0.43, headR: 0.19, neck: 0.07,
  waistR: 0.15, chestR: 0.185, depth: 0.72, belly: 0, hipR: 0.17,
  thighR: [0.085, 0.072], shinR: [0.066, 0.05], upperR: [0.058, 0.048], foreR: [0.048, 0.04],
};

export class Character {
  constructor(spec) {
    this.spec = spec;
    const b = this.body = { ...DEFAULT_BODY, ...(spec.body || {}) };
    this.root = new THREE.Group();
    this.root.name = spec.name;
    if (spec.scale) this.root.scale.setScalar(spec.scale);
    const skin = skinMat(spec.skin);
    this.mats = { skin };
    const top = spec.topMat || cloth(spec.top);
    const bottom = spec.bottomMat || cloth(spec.bottom);
    const shoe = std(spec.shoe || '#222', 0.5);
    this.mats.top = top; this.mats.bottom = bottom;

    // ----- cuerpo jerárquico -----
    this.hips = new THREE.Group(); this.root.add(this.hips);
    this.standH = (b.thigh + b.shin) * 0.975 + b.ankle;
    const pelvis = mesh(latheGeo([[0, 0.12], [b.waistR * 0.98, 0.12], [b.waistR + 0.008, 0.06], [Math.max(b.hipR * 0.82, b.waistR + 0.01), -0.02], [b.hipR * 0.72, -0.08], [b.hipR * 0.4, -0.115], [0, -0.12]]), bottom); pelvis.scale.z = b.depth + 0.06; this.hips.add(pelvis); this.pelvis = pelvis;
    this.spine = new THREE.Group(); this.spine.position.y = 0.06; this.hips.add(this.spine);
    const prof = [[0, -0.02], [b.waistR, 0], [b.waistR + 0.012 + b.belly, 0.1], [b.chestR - 0.005 + b.belly * 0.5, 0.24], [b.chestR, b.torsoLen * 0.8], [b.chestR * 0.86, b.torsoLen * 0.95], [b.chestR * 0.45, b.torsoLen + 0.02], [0, b.torsoLen + 0.03]];
    const torso = mesh(latheGeo(prof), top); torso.scale.z = b.depth; this.spine.add(torso);
    this.torso = torso;
    this.chest = new THREE.Group(); this.chest.position.y = b.torsoLen * 0.7; this.spine.add(this.chest);
    const neck = mesh(new THREE.CylinderGeometry(0.055, 0.062, b.neck + 0.1, 16), skin); neck.position.y = b.torsoLen * 0.3 + b.neck / 2; this.chest.add(neck);
    this.neck = neck;
    this.head = new THREE.Group(); this.head.position.y = b.torsoLen * 0.3 + b.neck + b.headR * 0.86; this.chest.add(this.head);
    this.shoulderPts = [V(b.shoulderHalf, b.torsoLen * 0.22, 0), V(-b.shoulderHalf, b.torsoLen * 0.22, 0)];
    this.hipPts = [V(b.hipHalf, -0.02, 0), V(-b.hipHalf, -0.02, 0)];

    this.buildHead(spec, skin);

    // ----- extremidades en espacio de mundo (hijos de root para heredar escala) -----
    this.limbs = new THREE.Group(); this.root.add(this.limbs);
    const sleeve = spec.sleeveMat || top;
    const longSleeve = spec.longSleeve !== false;
    const foreMat = longSleeve ? sleeve : skin;
    const shinMat = spec.shorts ? skin : bottom;
    const sleeveDS = sleeve.clone(); sleeveDS.side = THREE.DoubleSide;
    const lerp3 = (a, b2, c, sp) => (u) => (u < sp ? lerp(a, b2, u / sp) : lerp(b2, c, (u - sp) / (1 - sp)));
    const armR = (u) => { const sp = b.upper / (b.upper + b.fore); return lerp3(b.upperR[0], (b.upperR[1] + b.foreR[0]) / 2, b.foreR[1], sp)(u) * (1 + 0.12 * Math.exp(-Math.pow((u - 0.22) / 0.12, 2))); };
    const legR = (u) => { const sp = b.thigh / (b.thigh + b.shin); return lerp3(b.thighR[0], (b.thighR[1] + b.shinR[0]) / 2 * 0.95, b.shinR[1], sp)(u) * (1 + 0.1 * Math.exp(-Math.pow((u - 0.68) / 0.1, 2))); };
    this.arm = [0, 1].map((i) => {
      const side = i === 0 ? 1 : -1;
      const tubes = [];
      if (longSleeve) tubes.push(new FlexTube(sleeve, (u) => armR(u) + 0.006));
      else { tubes.push(new FlexTube(skin, armR)); tubes.push(new FlexTube(sleeveDS, (u) => armR(u) + 0.014, { u0: 0, u1: spec.sleeveLen || 0.36 })); }
      tubes.forEach((t) => this.limbs.add(t.mesh));
      const sh = mesh(SPH(b.upperR[0] * 1.02, 20, 14), sleeve);
      const hand = this.makeHand(skin, side);
      let cuff = null;
      if (spec.cuffMat) { cuff = mesh(new THREE.CylinderGeometry(b.foreR[1] * 1.3, b.foreR[1] * 1.38, 0.05, 16), spec.cuffMat); }
      [sh, hand.g].forEach((m) => this.limbs.add(m));
      if (cuff) this.limbs.add(cuff);
      return { tubes, sh, hand, cuff };
    });
    const legMat = spec.legMat || (spec.shorts || spec.legSkin ? skin : bottom);
    this.leg = [0, 1].map(() => {
      const tubes = [new FlexTube(legMat, legR)];
      if (spec.shorts) tubes.push(new FlexTube(bottom, (u) => legR(u) + 0.02, { u0: 0, u1: 0.42 }));
      tubes.forEach((t) => this.limbs.add(t.mesh));
      const shoeG = new THREE.Group();
      const s = mesh(SPH(0.07, 24, 16), shoe); s.scale.set(0.78, 0.62, 1.55); s.position.set(0, -0.03, 0.055); shoeG.add(s);
      const heel = mesh(SPH(0.055, 18, 12), shoe); heel.scale.set(0.95, 0.85, 1); heel.position.set(0, -0.025, -0.02); shoeG.add(heel);
      if (spec.soleColor) { const sole = mesh(roundedBoxGeo(0.11, 0.025, 0.24, 0.011), std(spec.soleColor, 0.6)); sole.position.set(0, -0.07, 0.05); shoeG.add(sole); }
      if (spec.sockColor) { const sock = mesh(new THREE.CylinderGeometry(b.shinR[1] * 1.12, b.shinR[1] * 1.15, 0.09, 14), cloth(spec.sockColor)); sock.position.y = 0.035; shoeG.add(sock); }
      this.limbs.add(shoeG);
      return { tubes, shoe: shoeG };
    });

    // sombra de contacto suave
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.85 }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.position.y = 0.004; this.blob.renderOrder = 1;
    this.root.add(this.blob);

    if (spec.extras) spec.extras(this);
    this.tmp = { A: V(), T: V(), M: V(), E: V(), pole: V() };
    this.held = [null, null];
  }

  makeHand(skin, side) {
    const g = new THREE.Group();
    const k = 1.12;
    const palm = mesh(SPH(0.044 * k, 18, 14), skin); palm.scale.set(1.08, 1.0, 0.6); palm.position.y = 0.045 * k; g.add(palm);
    const fingers = [-0.026, -0.009, 0.009, 0.026].map((x, n) => {
      const f = new THREE.Group(); f.position.set(x * k, 0.078 * k, 0); g.add(f);
      const len = [0.04, 0.05, 0.048, 0.038][n] * k;
      const m = mesh(taperGeo(len, 0.0125 * k, 0.0115 * k, 10), skin); f.add(m);
      return f;
    });
    const thumb = new THREE.Group(); thumb.position.set(side * 0.034 * k, 0.03 * k, 0.012); g.add(thumb);
    const tm = mesh(taperGeo(0.04 * k, 0.014 * k, 0.015 * k, 10), skin); thumb.add(tm);
    return { g, palm, fingers, thumb, side };
  }

  buildHead(spec, skin) {
    const R = this.body.headR;
    const h = this.head;
    const skull = mesh(SPH(R, 40, 28), skin); skull.scale.set(1, 1.0, 0.95); h.add(skull);
    const jaw = mesh(SPH(R * 0.78, 32, 20), skin); jaw.position.set(0, -R * 0.32, R * 0.1); jaw.scale.set(1.04, 0.8, 0.9); h.add(jaw);
    const onSurf = (yaw, pitch, r = R, push = 0) => V(Math.sin(yaw) * Math.cos(pitch) * (r + push), Math.sin(pitch) * (r + push), Math.cos(yaw) * Math.cos(pitch) * (r + push) * 0.95);
    // orejas
    [-1, 1].forEach((s) => { const e = mesh(SPH(R * 0.17, 16, 12), skin); e.position.set(s * R * 0.97, -R * 0.08, -R * 0.02); e.scale.set(0.55, 1, 0.8); h.add(e); });
    // nariz
    const nose = mesh(SPH(R * 0.1, 16, 12), skin); nose.position.copy(onSurf(0, -0.16, R, R * 0.04)); nose.scale.set(1, 0.85, 0.9); h.add(nose);
    // ojos
    const white = new THREE.MeshStandardMaterial({ color: '#fbf7f2', roughness: 0.25 });
    const irisM = new THREE.MeshStandardMaterial({ color: spec.eyeColor || '#3a2416', roughness: 0.3 });
    const pupilM = new THREE.MeshStandardMaterial({ color: '#0b0706', roughness: 0.2 });
    const hiM = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    this.eyes = [-1, 1].map((s) => {
      const pivot = new THREE.Group(); pivot.position.copy(onSurf(s * 0.36, 0.04, R, -R * 0.06));
      pivot.lookAt(pivot.position.clone().multiplyScalar(3)); h.add(pivot);
      const ball = new THREE.Group(); pivot.add(ball);
      const sc = mesh(SPH(R * 0.2, 24, 16), white, { shadow: false }); sc.scale.set(0.95, 1.12, 0.55); ball.add(sc);
      const look = new THREE.Group(); ball.add(look);
      const iris = mesh(SPH(R * 0.125, 20, 14), irisM, { shadow: false }); iris.scale.set(1, 1.05, 0.4); iris.position.z = R * 0.085; look.add(iris);
      const pup = mesh(SPH(R * 0.07, 16, 10), pupilM, { shadow: false }); pup.scale.set(1, 1.05, 0.4); pup.position.z = R * 0.1; look.add(pup);
      const hi = new THREE.Mesh(SPH(R * 0.032, 10, 8), hiM); hi.position.set(R * 0.045, R * 0.055, R * 0.125); look.add(hi);
      const hi2 = new THREE.Mesh(SPH(R * 0.016, 8, 6), hiM); hi2.position.set(-R * 0.04, -R * 0.04, R * 0.12); look.add(hi2);
      // párpado (piel) para parpadear
      const lid = mesh(new THREE.SphereGeometry(R * 0.215, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), skin, { shadow: false });
      lid.scale.set(0.98, 1.14, 0.6); ball.add(lid);
      return { pivot, ball, look, lid, s };
    });
    // cejas
    const browM = std(spec.browColor || spec.hairColor || '#2a1a12', 0.8);
    this.brows = [-1, 1].map((s) => {
      const g = new THREE.Group(); g.position.copy(onSurf(s * 0.36, 0.34, R, R * 0.01)); h.add(g);
      const m = mesh(taperGeo(R * 0.2, R * 0.032, R * 0.026, 8), browM, { shadow: false }); m.rotation.z = -s * Math.PI / 2; m.position.x = -s * R * 0.1; g.add(m);
      g.userData.s = s; return g;
    });
    // boca
    const mouthG = new THREE.Group(); mouthG.position.copy(onSurf(0, -0.4, R, R * 0.005)); mouthG.lookAt(mouthG.position.clone().multiplyScalar(3).setY(mouthG.position.y * 2.2)); h.add(mouthG);
    const lipM = std('#5a1a22', 0.5);
    const smile = mesh(new THREE.TorusGeometry(R * 0.2, R * 0.034, 10, 24, Math.PI), lipM, { shadow: false }); smile.rotation.z = Math.PI; smile.position.y = R * 0.05; smile.scale.set(1, 0.7, 1); mouthG.add(smile);
    const open = new THREE.Group(); mouthG.add(open);
    const cav = new THREE.Mesh(new THREE.CircleGeometry(R * 0.2, 32, Math.PI, Math.PI), new THREE.MeshStandardMaterial({ color: '#3b0d16', roughness: 0.7 })); cav.position.y = R * 0.06; open.add(cav);
    const teeth = new THREE.Mesh(new THREE.PlaneGeometry(R * 0.3, R * 0.05), new THREE.MeshStandardMaterial({ color: '#fffaf2', roughness: 0.3 })); teeth.position.set(0, R * 0.035, 0.002); open.add(teeth);
    const tongue = new THREE.Mesh(new THREE.CircleGeometry(R * 0.1, 20, 0, Math.PI), new THREE.MeshStandardMaterial({ color: '#e05a6b', roughness: 0.5 })); tongue.scale.set(1.15, 0.7, 1); tongue.position.set(0, -R * 0.12, 0.002); open.add(tongue);
    this.mouth = { g: mouthG, smile, open };
    // mejillas
    const blushTex = radialTex(null, null, 64, [[0, 'rgba(255,120,130,0.55)'], [1, 'rgba(255,120,130,0)']]);
    [-1, 1].forEach((s) => {
      const c = new THREE.Mesh(new THREE.PlaneGeometry(R * 0.36, R * 0.24), new THREE.MeshBasicMaterial({ map: blushTex, transparent: true, depthWrite: false, opacity: spec.blush ?? 0.6 }));
      c.position.copy(onSurf(s * 0.55, -0.2, R, R * 0.012)); c.lookAt(c.position.clone().multiplyScalar(3)); h.add(c);
    });
    if (spec.hair) spec.hair(this, h, R);
  }

  // ----- aplicar pose -----
  // pose: ver dance.js
  apply(p, camera) {
    const b = this.body;
    this.root.position.set(p.rootX || 0, 0, p.rootZ || 0);
    this.root.rotation.y = p.rootYaw || 0;
    this.hips.position.set(p.hipsX || 0, this.standH + (p.hipsY || 0), p.hipsZ || 0);
    this.hips.rotation.set(p.hipsRX || 0, p.hipsRY || 0, p.hipsRZ || 0, 'YXZ');
    this.spine.rotation.set(p.spineRX || 0, p.spineRY || 0, p.spineRZ || 0, 'YXZ');
    this.chest.rotation.set(p.chestRX || 0, p.chestRY || 0, p.chestRZ || 0, 'YXZ');
    this.head.rotation.set(p.headRX || 0, p.headRY || 0, p.headRZ || 0, 'YXZ');
    this.root.updateMatrixWorld(true);

    const inv = new THREE.Matrix4().copy(this.root.matrixWorld).invert();
    const toRoot = (v, obj) => v.applyMatrix4(obj.matrixWorld).applyMatrix4(inv); // a espacio de root (limbs vive en root)
    const { A, T, M, E, pole } = this.tmp;

    // brazos
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? 1 : -1; // 0 = izquierda (+x)
      const arm = this.arm[i];
      A.copy(this.shoulderPts[i]); toRoot(A, this.chest);
      const hp = i === 0 ? p.handL : p.handR;
      T.set(hp[0], hp[1], hp[2]); toRoot(T, this.chest);
      const pl = (i === 0 ? p.elbowL : p.elbowR) || [side * 0.6, -0.5, -0.6];
      pole.set(pl[0], pl[1], pl[2]).normalize();
      solveIK(A, T, b.upper, b.fore, pole, M, E);
      arm.tubes.forEach((tb) => tb.update(A, M, E, pole, 0.55));
      arm.sh.position.copy(A);
      // mano
      const hand = arm.hand;
      hand.g.position.copy(E);
      const dir = E.clone().sub(M).normalize();
      const palmN = (i === 0 ? p.palmL : p.palmR) || [0, 0, 1];
      const z = V(palmN[0], palmN[1], palmN[2]).normalize();
      z.addScaledVector(dir, -z.dot(dir)); if (z.lengthSq() < 1e-6) z.set(0, 0, 1); z.normalize();
      const x = V().crossVectors(dir, z).normalize();
      hand.g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, dir, z));
      const fist = (i === 0 ? p.fistL : p.fistR) || 0;
      hand.palm.scale.set(1.08, lerp(1.0, 0.92, fist), lerp(0.6, 0.85, fist));
      hand.fingers.forEach((f, n) => { f.rotation.x = lerp(0.12, 1.75, fist) + n * 0.03 * fist; f.rotation.z = (n - 1.5) * 0.07 * (1 - fist); });
      hand.thumb.rotation.set(lerp(0.2, 0.9, fist), 0, -side * lerp(0.75, 0.25, fist));
      if (arm.cuff) { arm.cuff.position.copy(E).addScaledVector(dir, -0.03); arm.cuff.quaternion.setFromUnitVectors(V(0, 1, 0), dir); }
      arm.handWorld = hand.g; arm.dir = dir; arm.wrist = E.clone();
    }
    // piernas
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? 1 : -1;
      const leg = this.leg[i];
      A.copy(this.hipPts[i]); toRoot(A, this.hips);
      const fp = i === 0 ? p.footL : p.footR;
      const yaw = (i === 0 ? p.footYawL : p.footYawR) ?? side * 0.12;
      const pitch = (i === 0 ? p.footPitchL : p.footPitchR) || 0;
      T.set(fp[0], fp[1] + b.ankle, fp[2]);
      const kp = (i === 0 ? p.kneeL : p.kneeR) || [side * 0.25, 0, 1];
      pole.set(kp[0], kp[1], kp[2]).normalize();
      solveIK(A, T, b.thigh, b.shin, pole, M, E);
      leg.tubes.forEach((tb) => tb.update(A, M, E, pole, 0.4));
      leg.shoe.position.copy(E);
      leg.shoe.rotation.set(pitch, yaw, 0, 'YXZ');
    }
    // sombra
    const fl = p.footL, fr = p.footR;
    const lift = Math.max(0, (p.hipsY || 0));
    this.blob.position.set(((fl[0] + fr[0]) / 2) * 0.6 + (p.hipsX || 0) * 0.4, 0.004, (fl[2] + fr[2]) / 2 + 0.03);
    const spread = Math.abs(fl[0] - fr[0]);
    this.blob.scale.set(0.75 + spread * 1.2, 0.5, 1).multiplyScalar(1 - lift * 1.5);

    // cara
    const blink = p.blink || 0;
    this.eyes.forEach((e) => {
      e.lid.visible = false;
      e.ball.scale.y = lerp(1, 0.1, blink);
    });
    if (p.wink) { this.eyes[1].ball.scale.y = lerp(1, 0.1, p.wink); }
    // mirada hacia la cámara
    if (camera) {
      const camLocal = camera.position.clone();
      this.eyes.forEach((e) => {
        const lp = e.pivot.worldToLocal(camLocal.clone());
        const yaw = clamp(Math.atan2(lp.x, lp.z), -0.35, 0.35), pit = clamp(Math.atan2(lp.y, Math.hypot(lp.x, lp.z)), -0.3, 0.3);
        e.look.rotation.set(-pit * 0.9, yaw * 0.9, 0);
      });
    }
    const brow = p.brow || 0;
    this.brows.forEach((g) => { g.position.y = this.body.headR * (0.33 + brow * 0.06); g.rotation.z = -g.userData.s * (0.12 + brow * 0.16 + (p.browTilt || 0)); });
    const mo = clamp(p.mouth || 0);
    this.mouth.open.visible = mo > 0.08;
    this.mouth.smile.visible = mo <= 0.08;
    this.mouth.open.scale.set(lerp(0.85, 1.05, mo), lerp(0.45, 1.3, mo), 1);
    this.mouth.smile.scale.set(1, 0.6 + (p.smile ?? 1) * 0.4, 1);

    if (this.spec.secondary) this.spec.secondary(this, p);
  }

  handWorldPos(i, out = V()) { return out.copy(this.arm[i].hand.g.position).applyMatrix4(this.root.matrixWorld); }
}

// ---------- utilidades de pelo ----------
export function hairCap(R, mat, { front = 0.3, back = 0.62, gap = 1.25, bangs = 0.36, puff = 1.07 } = {}) {
  const g = new THREE.Group();
  const top = mesh(new THREE.SphereGeometry(R * puff, 36, 18, 0, Math.PI * 2, 0, Math.PI * bangs), mat); top.rotation.x = -0.18; g.add(top);
  // banda trasera/laterales: deja abierta la cara (phi centrado en +z)
  const phiLen = Math.PI * 2 - gap;
  const band = mesh(new THREE.SphereGeometry(R * (puff - 0.01), 36, 18, Math.PI / 2 + gap / 2, phiLen, Math.PI * 0.2, Math.PI * (back - 0.2)), mat);
  band.rotation.y = 0; g.add(band);
  return g;
}
