import * as THREE from 'three';
import { Character, hairCap } from './character.js';
import { mesh, std, cloth, taperGeo, roundedBoxGeo, latheGeo, V, clamp } from './lib.js';

const SPH = (r, w = 24, h = 16) => new THREE.SphereGeometry(r, w, h);

// ---------- Abuela: Doña Marina. Cocina, delantal, moño gris, gafas ----------
export function makeAbuela() {
  const hairM = std('#d9d4cf', 0.7);
  const c = new Character({
    name: 'abuela', scale: 0.9, skin: '#a86a46', eyeColor: '#2b1a10', hairColor: '#d9d4cf', browColor: '#bdb6ae', blush: 0.55,
    top: '#b58bd6', bottom: '#2c8c86', shoe: '#7a3b52', soleColor: '#f1e6da', longSleeve: false, sleeveLen: 0.45, legSkin: true,
    body: { waistR: 0.17, chestR: 0.19, belly: 0.03, hipR: 0.2, depth: 0.78, shoulderHalf: 0.185 },
    hair: (ch, h, R) => {
      const cap = hairCap(R, hairM, { bangs: 0.34, back: 0.55, gap: 1.6, puff: 1.06 }); h.add(cap);
      const bun = mesh(SPH(R * 0.42, 24, 16), hairM); bun.position.set(0, R * 0.78, -R * 0.55); bun.scale.set(1, 0.85, 1); h.add(bun);
      // ondas laterales
      [-1, 1].forEach((s) => { const w = mesh(SPH(R * 0.3, 18, 12), hairM); w.position.set(s * R * 0.82, R * 0.28, -R * 0.12); w.scale.set(0.7, 1, 1); h.add(w); });
      // gafas
      const gold = std('#c9a23e', 0.25, 0.9);
      [-1, 1].forEach((s) => { const r = mesh(new THREE.TorusGeometry(R * 0.2, R * 0.022, 8, 28), gold, { shadow: false }); r.position.set(s * R * 0.34, R * 0.03, R * 0.98); r.rotation.y = s * 0.3; h.add(r); });
      const br = mesh(new THREE.CylinderGeometry(R * 0.015, R * 0.015, R * 0.22, 6), gold, { shadow: false }); br.rotation.z = Math.PI / 2; br.position.set(0, R * 0.08, R * 1.02); h.add(br);
      ch.bun = bun;
    },
    extras: (ch) => {
      // falda larga
      const skirt = mesh(latheGeo([[0.2, 0.04], [0.23, -0.05], [0.29, -0.3], [0.33, -0.52], [0.31, -0.55], [0.0, -0.55]]), cloth('#2c8c86'));
      skirt.scale.z = 0.85; ch.hips.add(skirt); ch.skirt = skirt;
      // delantal
      const apronM = cloth('#fff1df', { side: THREE.DoubleSide });
      const apron = mesh(new THREE.CylinderGeometry(0.255, 0.33, 0.5, 24, 1, true, -0.95, 1.9), apronM); apron.position.set(0, -0.25, 0.012); apron.scale.z = 0.9; ch.hips.add(apron);
      const bib = mesh(new THREE.CylinderGeometry(0.186, 0.2, 0.3, 24, 1, true, -0.7, 1.4), apronM); bib.position.set(0, 0.17, 0.0); bib.scale.z = 0.82; ch.spine.add(bib);
      const pocket = mesh(roundedBoxGeo(0.16, 0.1, 0.02, 0.008), cloth('#ff6f91')); pocket.position.set(0, -0.28, 0.3); ch.hips.add(pocket);
      // flores en la blusa (puntos)
      const fl = std('#ffe36e', 0.6);
      [[0.1, 0.32], [-0.12, 0.36], [0.15, 0.2]].forEach(([x, y]) => { const f = mesh(SPH(0.02, 10, 8), fl, { shadow: false }); f.position.set(x, y, 0.135); ch.spine.add(f); });
      // collar de perlas
      const pearl = std('#fbf4ea', 0.2, 0.1);
      for (let i = 0; i < 11; i++) { const a = -1.0 + (i / 10) * 2.0; const pe = mesh(SPH(0.014, 10, 8), pearl, { shadow: false }); pe.position.set(Math.sin(a) * 0.09, 0.4 - Math.cos(a) * 0.05, Math.cos(a) * 0.075 + 0.02); ch.spine.add(pe); }
    },
    secondary: (ch, p) => {
      ch.skirt.rotation.z = -(p.hipsRZ || 0) * 0.6 + (p._swayV || 0) * 0.5;
      ch.skirt.rotation.x = -(p._kick || 0) * 0.2;
    },
  });
  return c;
}

// ---------- Gamer: Tavo. Cuarto con luces LED, hoodie, audífonos al cuello, pelo rizado ----------
export function makeGamer() {
  const hairM = std('#1b1210', 0.9);
  const c = new Character({
    name: 'gamer', scale: 0.97, skin: '#6b3f26', eyeColor: '#1e120b', hairColor: '#1b1210', blush: 0.25,
    top: '#6c3cf0', bottom: '#20222b', shoe: '#f4f4f6', soleColor: '#2de2e6', sockColor: '#ffffff',
    cuffMat: cloth('#5328c8'),
    body: { waistR: 0.14, chestR: 0.175, depth: 0.7, hipR: 0.16, shoulderHalf: 0.2, thigh: 0.43, shin: 0.41 },
    hair: (ch, h, R) => {
      const g = new THREE.Group(); h.add(g);
      const base = hairCap(R, hairM, { bangs: 0.3, back: 0.52, gap: 1.9, puff: 1.04 }); g.add(base);
      // rizos: esferas en la parte alta
      let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 46; i++) {
        const th = rnd() * Math.PI * 0.42, ph = rnd() * Math.PI * 2;
        if (Math.sin(ph) > 0.55 && th > 0.3) continue; // despeja frente
        const r = R * (0.16 + rnd() * 0.08);
        const s = mesh(SPH(r, 12, 10), hairM); const rr = R * 1.05;
        s.position.set(-Math.cos(ph) * Math.sin(th) * rr, Math.cos(th) * rr + R * 0.05, Math.sin(ph) * Math.sin(th) * rr * 0.95 - R * 0.05);
        g.add(s);
      }
    },
    extras: (ch) => {
      // capucha detrás del cuello
      const hood = mesh(new THREE.TorusGeometry(0.13, 0.06, 12, 24), cloth('#5a2fd6')); hood.position.set(0, ch.body.torsoLen * 0.97, -0.06); hood.rotation.x = Math.PI / 2.4; hood.scale.set(1, 1, 0.8); ch.spine.add(hood);
      // bolsillo canguro
      const pk = mesh(roundedBoxGeo(0.24, 0.11, 0.03, 0.012), cloth('#5328c8')); pk.position.set(0, 0.09, 0.12); ch.spine.add(pk);
      // cordones
      [-1, 1].forEach((s) => { const d = mesh(taperGeo(0.16, 0.007, 0.007, 6), std('#ffffff', 0.6)); d.position.set(s * 0.05, 0.25, 0.14); d.rotation.x = Math.PI; ch.spine.add(d); });
      // audífonos al cuello
      const hp = new THREE.Group(); hp.position.set(0, ch.body.torsoLen * 0.3 + 0.03, 0.02); ch.chest.add(hp);
      const band = mesh(new THREE.TorusGeometry(0.11, 0.014, 8, 24, Math.PI), std('#1c1c22', 0.4)); band.rotation.x = Math.PI / 2; band.rotation.z = Math.PI; band.position.z = 0.0; hp.add(band);
      [-1, 1].forEach((s) => {
        const cup = mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 20), std('#1c1c22', 0.35)); cup.rotation.z = Math.PI / 2; cup.position.set(s * 0.11, -0.01, 0.05); cup.rotation.y = s * 0.5; hp.add(cup);
        const ring = mesh(new THREE.TorusGeometry(0.045, 0.008, 8, 20), new THREE.MeshStandardMaterial({ color: '#000', emissive: '#2de2e6', emissiveIntensity: 3 })); ring.position.set(s * 0.131, -0.01, 0.06); ring.rotation.y = Math.PI / 2 + s * 0.5; hp.add(ring);
      });
    },
  });
  return c;
}

// ---------- Oficinista: Valeria. Blazer azul, camisa, bob, carnet ----------
export function makeOfi() {
  const hairM = std('#3a1f16', 0.55);
  const navy = cloth('#24356e');
  const c = new Character({
    name: 'ofi', scale: 0.95, skin: '#e7b996', eyeColor: '#4a6b3a', hairColor: '#3a1f16', blush: 0.5,
    top: '#24356e', topMat: navy, bottom: '#24356e', shoe: '#8c1f3c', soleColor: '#3b0c18',
    cuffMat: cloth('#ffffff'),
    body: { waistR: 0.135, chestR: 0.17, hipR: 0.17, depth: 0.72, shoulderHalf: 0.185 },
    hair: (ch, h, R) => {
      const cap = hairCap(R, hairM, { bangs: 0.38, back: 0.66, gap: 1.5, puff: 1.08 }); h.add(cap);
      // bob: volumen lateral hasta la mandíbula
      [-1, 1].forEach((s) => { const side = mesh(SPH(R * 0.5, 24, 16), hairM); side.position.set(s * R * 0.78, -R * 0.12, -R * 0.15); side.scale.set(0.55, 1.15, 1.1); h.add(side); });
      const back = mesh(SPH(R * 0.95, 28, 18), hairM); back.position.set(0, -R * 0.05, -R * 0.25); back.scale.set(1.05, 1.05, 0.9); h.add(back);
      // pollina lateral
      const fr = mesh(SPH(R * 0.45, 20, 14), hairM); fr.position.set(R * 0.35, R * 0.68, R * 0.5); fr.scale.set(1.4, 0.55, 0.7); fr.rotation.z = -0.35; h.add(fr);
      // aretes
      [-1, 1].forEach((s) => { const e = mesh(SPH(R * 0.06, 10, 8), std('#e6c45a', 0.2, 1)); e.position.set(s * R * 0.98, -R * 0.32, 0); h.add(e); });
      ch.hairBack = back;
    },
    extras: (ch) => {
      // camisa blanca en V y solapas
      const shirt = mesh(new THREE.CylinderGeometry(0.0, 0.09, 0.22, 3, 1), cloth('#f7f7fb')); shirt.rotation.z = Math.PI; shirt.rotation.y = Math.PI / 6; shirt.position.set(0, 0.33, 0.115); shirt.scale.set(1, 1, 0.25); ch.spine.add(shirt);
      [-1, 1].forEach((s) => { const lap = mesh(roundedBoxGeo(0.06, 0.24, 0.02, 0.008), cloth('#1b2856')); lap.position.set(s * 0.075, 0.3, 0.13); lap.rotation.z = s * 0.35; lap.rotation.y = s * 0.25; ch.spine.add(lap); });
      // botones
      [0.12, 0.05].forEach((y) => { const bt = mesh(SPH(0.012, 10, 8), std('#e6c45a', 0.25, 1)); bt.position.set(0, y, 0.155); ch.spine.add(bt); });
      // carnet en cinta (sin marca)
      const lan = mesh(new THREE.TorusGeometry(0.1, 0.006, 6, 24, Math.PI), std('#ff4f7b', 0.5)); lan.rotation.z = Math.PI; lan.position.set(0, 0.34, 0.11); lan.rotation.x = -0.35; ch.spine.add(lan);
      const card = mesh(roundedBoxGeo(0.07, 0.095, 0.01, 0.006), std('#ffffff', 0.35)); card.position.set(0, 0.2, 0.15); ch.spine.add(card);
      const strip = mesh(new THREE.BoxGeometry(0.07, 0.022, 0.012), std('#ff4f7b', 0.5)); strip.position.set(0, 0.23, 0.151); ch.spine.add(strip);
    },
    secondary: (ch, p) => { if (ch.hairBack) ch.hairBack.rotation.z = -(p.headRZ || 0) * 0.5 - (p.hipsRZ || 0) * 0.3; },
  });
  return c;
}

// ---------- Rockero: Memo. Chaqueta de cuero, camiseta roja, melena, botas ----------
export function makeRock() {
  const hairM = std('#2b2320', 0.6);
  const leather = new THREE.MeshPhysicalMaterial({ color: '#16161a', roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.35 });
  const c = new Character({
    name: 'rock', scale: 1.0, skin: '#c98f6a', eyeColor: '#3a2416', hairColor: '#2b2320', blush: 0.3,
    top: '#d62839', topMat: leather, sleeveMat: leather, bottom: '#3a4a66', shoe: '#1d1715', soleColor: '#0d0b0a',
    body: { waistR: 0.155, chestR: 0.2, hipR: 0.17, depth: 0.74, shoulderHalf: 0.205, upperR: [0.064, 0.052], foreR: [0.052, 0.043] },
    hair: (ch, h, R) => {
      const cap = hairCap(R, hairM, { bangs: 0.33, back: 0.7, gap: 1.45, puff: 1.07 }); h.add(cap);
      // melena hacia atrás que cae a los hombros (se balancea)
      const mane = new THREE.Group(); mane.position.set(0, R * 0.2, -R * 0.4); h.add(mane);
      const m1 = mesh(latheGeo([[0.0, 0.05], [R * 0.85, 0.0], [R * 0.92, -R * 0.6], [R * 0.85, -R * 1.25], [R * 0.6, -R * 1.5], [0.0, -R * 1.52]]), hairM); m1.scale.z = 0.55; mane.add(m1);
      ch.mane = mane;
      // barba corta (perilla) y bigote
      const beard = mesh(SPH(R * 0.24, 18, 12), hairM); beard.position.set(0, -R * 0.78, R * 0.62); beard.scale.set(1, 0.7, 0.6); h.add(beard);
      const stache = mesh(taperGeo(R * 0.36, R * 0.05, R * 0.05, 8), hairM); stache.rotation.z = Math.PI / 2; stache.position.set(R * 0.18, -R * 0.3, R * 0.9); h.add(stache);
      // cana elegante
      const gray = mesh(SPH(R * 0.22, 14, 10), std('#a9a2a0', 0.6)); gray.position.set(-R * 0.62, R * 0.62, R * 0.38); gray.scale.set(1, 0.5, 0.7); h.add(gray);
    },
    extras: (ch) => {
      // camiseta roja visible en el frente (chaqueta abierta)
      const bb = ch.body, e = 0.007;
      const tprof = [[bb.waistR + e, 0.0], [bb.waistR + 0.012 + e, 0.1], [bb.chestR - 0.005 + e, 0.24], [bb.chestR + e, bb.torsoLen * 0.8], [bb.chestR * 0.86 + e, bb.torsoLen * 0.95]].map(([r, y]) => new THREE.Vector2(r, y));
      const tee = mesh(new THREE.LatheGeometry(tprof, 16, -0.4, 0.8), cloth('#d62839', { side: THREE.DoubleSide })); tee.scale.z = bb.depth; ch.spine.add(tee);
      const collar = mesh(new THREE.TorusGeometry(0.12, 0.03, 10, 24), leather); collar.rotation.x = Math.PI / 2; collar.position.set(0, ch.body.torsoLen * 0.95, 0); collar.scale.set(1, 0.75, 1); ch.spine.add(collar);
      // cierres
      [-1, 1].forEach((s) => { const z = mesh(new THREE.BoxGeometry(0.01, 0.38, 0.01), std('#c7c7cc', 0.2, 1)); z.position.set(s * 0.105, 0.2, 0.145); z.rotation.y = s * 0.5; ch.spine.add(z); });
      // cinturón
      const belt = mesh(new THREE.TorusGeometry(0.16, 0.022, 8, 28), std('#2a1d17', 0.5)); belt.rotation.x = Math.PI / 2; belt.scale.set(1, 0.74, 1); belt.position.y = 0.06; ch.hips.add(belt);
      const buckle = mesh(roundedBoxGeo(0.06, 0.045, 0.015, 0.006), std('#d8d8dc', 0.2, 1)); buckle.position.set(0, 0.06, 0.125); ch.hips.add(buckle);
      // muñequeras
      ch.wrists = [0, 1].map(() => { const w = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16), std('#0e0e10', 0.4)); ch.limbs.add(w); return w; });
    },
    secondary: (ch, p) => {
      if (ch.mane) ch.mane.rotation.x = -(p.headRX || 0) * 0.6 + (p._headV || 0) * 0.4;
      if (ch.mane) ch.mane.rotation.z = -(p.headRZ || 0) * 0.5;
      if (ch.wrists) ch.wrists.forEach((w, i) => { const a = ch.arm[i]; w.position.copy(a.wrist).addScaledVector(a.dir, -0.04); w.quaternion.setFromUnitVectors(V(0, 1, 0), a.dir); });
    },
  });
  return c;
}

export const CAST = { abuela: makeAbuela, gamer: makeGamer, ofi: makeOfi, rock: makeRock };
