import * as THREE from 'three';
import { canvasTex, radialTex, mesh, box, std, cloth, emissive, roundedBoxGeo, latheGeo, taperGeo, rng, V, clamp, wobble } from './lib.js';

// ---------- utilidades comunes ----------
const SPH = (r, w = 20, h = 14) => new THREE.SphereGeometry(r, w, h);
function grain(g, w, h, amt = 12, seed = 1) {
  const r = rng(seed); const id = g.getImageData(0, 0, w, h); const d = id.data;
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * amt; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(id, 0, 0);
}
function plane(w, h, mat) { const m = mesh(new THREE.PlaneGeometry(w, h), mat); return m; }
function addShadowLight(scene, color, intensity, pos, target = V(0, 0.8, 0), size = 3, mapSize = 2048) {
  const l = new THREE.DirectionalLight(color, intensity);
  l.position.copy(pos); l.target.position.copy(target);
  l.castShadow = true; l.shadow.mapSize.set(mapSize, mapSize);
  const c = l.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = 0.5; c.far = 20;
  l.shadow.bias = -0.0004; l.shadow.normalBias = 0.02; l.shadow.radius = 4;
  scene.add(l, l.target); return l;
}
// rayos de luz volumétricos falsos
function godRay(w, h, color, opacity = 0.25) {
  const tex = canvasTex(64, 256, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const gx = g.createLinearGradient(0, 0, W, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.3, 'rgba(0,0,0,0)'); gx.addColorStop(0.7, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, W, H);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  return m;
}
// partículas flotantes (polvo / luciérnagas) deterministas
function motes(n, bounds, color, size, seed = 3, opacity = 0.7) {
  const r = rng(seed); const pos = new Float32Array(n * 3); const base = [];
  for (let i = 0; i < n; i++) { const p = [bounds[0] + r() * (bounds[1] - bounds[0]), bounds[2] + r() * (bounds[3] - bounds[2]), bounds[4] + r() * (bounds[5] - bounds[4]), r() * 10]; base.push(p); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ map: radialTex(), color, size, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat);
  pts.userData.update = (t) => {
    for (let i = 0; i < n; i++) { const b = base[i]; pos[i * 3] = b[0] + Math.sin(t * 0.3 + b[3]) * 0.15; pos[i * 3 + 1] = b[1] + Math.sin(t * 0.21 + b[3] * 2) * 0.12 + ((t * 0.04 + b[3]) % 1) * 0.1; pos[i * 3 + 2] = b[2] + Math.cos(t * 0.25 + b[3]) * 0.1; }
    geo.attributes.position.needsUpdate = true;
  };
  return pts;
}
// sprite desenfocado (primer plano / bokeh)
function bokehSprite(color, size, opacity = 0.5) {
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex(null, null, 128, [[0, 'rgba(255,255,255,0.9)'], [0.55, 'rgba(255,255,255,0.6)'], [0.75, 'rgba(255,255,255,0.15)'], [1, 'rgba(255,255,255,0)']]), color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
  m.scale.set(size, size, 1); return m;
}
function blurredCard(w, h, draw, px = 512) {
  const tex = canvasTex(px, Math.round(px * h / w), (g, W, H) => draw(g, W, H));
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
}
function apple(r = 0.06, color = '#d81e3a') {
  const g = new THREE.Group();
  const a = mesh(SPH(r, 18, 14), std(color, 0.35)); a.scale.set(1.05, 0.92, 1.05); g.add(a);
  const st = mesh(new THREE.CylinderGeometry(r * 0.06, r * 0.08, r * 0.5, 6), std('#5a3a1e', 0.8)); st.position.y = r * 0.95; st.rotation.z = 0.3; g.add(st);
  const lf = mesh(SPH(r * 0.3, 8, 6), std('#4caf50', 0.6)); lf.scale.set(1, 0.3, 0.55); lf.position.set(r * 0.25, r * 1.0, 0); lf.rotation.z = -0.5; g.add(lf);
  return g;
}
function plant(scale = 1, potColor = '#c8643c', leaf = '#3f9a52', seed = 5) {
  const g = new THREE.Group(); const r = rng(seed);
  const pot = mesh(latheGeo([[0, 0], [0.1, 0], [0.13, 0.18], [0.14, 0.2], [0, 0.2]]), std(potColor, 0.7)); g.add(pot);
  const lm = std(leaf, 0.55, 0, { side: THREE.DoubleSide });
  for (let i = 0; i < 9; i++) {
    const l = mesh(SPH(0.09, 12, 8), lm); l.scale.set(0.45, 1.5, 0.12);
    const a = r() * Math.PI * 2, tilt = 0.35 + r() * 0.5;
    l.position.set(Math.cos(a) * 0.05, 0.3 + r() * 0.12, Math.sin(a) * 0.05); l.rotation.set(Math.sin(a) * tilt, a, Math.cos(a) * tilt);
    g.add(l);
  }
  g.scale.setScalar(scale); return g;
}

// ====================================================================================
// COCINA (abuela) — atardecer cálido
// ====================================================================================
export function buildKitchen() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#2a1712');
  scene.fog = new THREE.Fog('#3b2219', 7, 16);
  // piso de baldosa
  const floorTex = canvasTex(512, 512, (g, w, h) => {
    const n = 4, s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? '#c2553a' : '#f3e3cc'; g.fillRect(i * s, j * s, s, s); }
    g.strokeStyle = 'rgba(80,40,30,0.5)'; g.lineWidth = 4; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); }
    grain(g, w, h, 14);
  }, { repeat: [5, 5] });
  const floor = plane(10, 10, std('#ffffff', 0.32, 0, { map: floorTex })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  // pared
  const wallTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#f2c9a0'; g.fillRect(0, 0, w, h); grain(g, w, h, 10, 2); });
  const wall = plane(10, 5, std('#ffffff', 0.9, 0, { map: wallTex })); wall.position.set(0, 2.5, -2.0); scene.add(wall);
  const side = plane(6, 5, std('#e8b88e', 0.9)); side.position.set(-2.6, 2.5, 0.5); side.rotation.y = Math.PI / 2; scene.add(side);
  // azulejos decorativos (salpicadero)
  const tileTex = canvasTex(256, 256, (g, w) => {
    g.fillStyle = '#fbf3e4'; g.fillRect(0, 0, w, w);
    g.strokeStyle = '#2f62a8'; g.fillStyle = '#2f62a8'; g.lineWidth = 6;
    g.beginPath(); g.arc(w / 2, w / 2, w * 0.28, 0, Math.PI * 2); g.stroke();
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.save(); g.translate(w / 2, w / 2); g.rotate(a); g.beginPath(); g.ellipse(0, -w * 0.18, w * 0.05, w * 0.12, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
    g.fillStyle = '#f2b632'; g.beginPath(); g.arc(w / 2, w / 2, w * 0.07, 0, Math.PI * 2); g.fill();
    [[0, 0], [w, 0], [0, w], [w, w]].forEach(([x, y]) => { g.fillStyle = '#2f62a8'; g.beginPath(); g.arc(x, y, w * 0.16, 0, Math.PI * 2); g.fill(); g.fillStyle = '#f2b632'; g.beginPath(); g.arc(x, y, w * 0.06, 0, Math.PI * 2); g.fill(); });
    g.strokeStyle = 'rgba(120,110,100,0.6)'; g.lineWidth = 3; g.strokeRect(0, 0, w, w);
  }, { repeat: [14, 3] });
  const splash = plane(5.6, 0.75, std('#ffffff', 0.25, 0, { map: tileTex })); splash.position.set(-0.2, 1.33, -1.99); scene.add(splash);
  // mueble bajo + mesón
  const doorTex = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#7fb59a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) { g.strokeStyle = 'rgba(30,60,45,0.45)'; g.lineWidth = 6; g.strokeRect(i * w / 4 + 12, 14, w / 4 - 24, h - 28); g.fillStyle = '#d9b45a'; g.fillRect(i * w / 4 + w / 8 - 14, 40, 28, 8); }
    grain(g, w, h, 8, 4);
  }, { repeat: [1.4, 1] });
  const base = box(5.6, 0.86, 0.62, std('#ffffff', 0.6, 0, { map: doorTex }), 0.02); base.position.set(-0.2, 0.43, -1.68); scene.add(base);
  const topW = box(5.7, 0.06, 0.68, std('#b07a4e', 0.45), 0.02); topW.position.set(-0.2, 0.89, -1.66); scene.add(topW);
  // gabinetes altos a la izquierda
  const up = box(1.7, 0.75, 0.36, std('#ffffff', 0.6, 0, { map: doorTex }), 0.02); up.position.set(-2.05, 2.25, -1.82); scene.add(up);
  // ventana con atardecer
  const skyTex = canvasTex(512, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ff8d6b'); gr.addColorStop(0.45, '#ffb36b'); gr.addColorStop(0.75, '#ffd59a'); gr.addColorStop(1, '#ffe6b8');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const sg = g.createRadialGradient(w * 0.62, h * 0.66, 0, w * 0.62, h * 0.66, w * 0.35); sg.addColorStop(0, 'rgba(255,255,235,1)'); sg.addColorStop(0.18, 'rgba(255,240,200,0.95)'); sg.addColorStop(1, 'rgba(255,200,140,0)');
    g.fillStyle = sg; g.fillRect(0, 0, w, h);
    g.filter = 'blur(6px)'; g.fillStyle = '#c0694d';
    g.beginPath(); g.moveTo(0, h * 0.82); for (let x = 0; x <= w; x += 32) g.lineTo(x, h * 0.8 - Math.sin(x * 0.012) * 30 - Math.sin(x * 0.05) * 8); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    g.fillStyle = '#8c4a3e'; g.beginPath(); g.moveTo(0, h * 0.9); for (let x = 0; x <= w; x += 24) g.lineTo(x, h * 0.88 - Math.abs(Math.sin(x * 0.03)) * 26); g.lineTo(w, h); g.lineTo(0, h); g.fill();
  });
  const sky = plane(1.3, 1.1, new THREE.MeshBasicMaterial({ map: skyTex, color: new THREE.Color(1.25, 1.15, 1.05) })); sky.position.set(0.1, 1.98, -1.97); scene.add(sky);
  const frameM = std('#fdf8f0', 0.5);
  [[0.1, 2.56, 1.42, 0.07], [0.1, 1.4, 1.42, 0.07], [0.1, 1.98, 0.05, 1.1]].forEach(([x, y, w, h]) => { const f = box(w, h, 0.07, frameM, 0.01); f.position.set(x, y, -1.94); scene.add(f); });
  [-0.6, 0.8].forEach((x) => { const f = box(0.07, 1.22, 0.07, frameM, 0.01); f.position.set(x, 1.98, -1.94); scene.add(f); });
  // cortinas de cuadros
  const ging = canvasTex(128, 128, (g, w) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, w); g.fillStyle = 'rgba(232,70,110,0.55)'; for (let i = 0; i < 8; i += 2) { g.fillRect(i * w / 8, 0, w / 8, w); g.fillRect(0, i * w / 8, w, w / 8); } }, { repeat: [3, 4] });
  [-0.78, 0.98].forEach((x, i) => {
    const geo = new THREE.PlaneGeometry(0.42, 1.25, 12, 1); const pa = geo.attributes.position;
    for (let k = 0; k < pa.count; k++) pa.setZ(k, Math.sin(pa.getX(k) * 30) * 0.025);
    geo.computeVertexNormals();
    const c = mesh(geo, cloth('#ffffff', { map: ging, side: THREE.DoubleSide })); c.position.set(x, 1.95, -1.88); scene.add(c);
  });
  // nevera retro
  const fridge = box(0.85, 1.75, 0.7, std('#9fd8c6', 0.35), 0.12); fridge.position.set(1.65, 0.875, -1.6); scene.add(fridge);
  const handle = box(0.04, 0.35, 0.05, std('#e8e8e8', 0.2, 1), 0.015); handle.position.set(1.33, 1.25, -1.22); scene.add(handle);
  const line = box(0.86, 0.015, 0.02, std('#6aa996', 0.5)); line.position.set(1.65, 1.15, -1.245); scene.add(line);
  // imanes de colores en la nevera
  [['#ff6f91', 0.1, 1.45], ['#ffd54a', -0.12, 1.32], ['#6ec6ff', 0.05, 1.6]].forEach(([c, dx, y]) => { const m = mesh(SPH(0.025, 10, 8), std(c, 0.4)); m.position.set(1.65 + dx, y, -1.24); m.scale.z = 0.5; scene.add(m); });
  // olla con vapor
  const pot = mesh(latheGeo([[0, 0], [0.2, 0], [0.21, 0.2], [0.2, 0.22], [0, 0.22]]), std('#d9362f', 0.3, 0.1)); pot.position.set(-1.25, 0.92, -1.7); scene.add(pot);
  const lid = mesh(latheGeo([[0, 0.06], [0.05, 0.06], [0.06, 0.04], [0.215, 0.0], [0, 0]]), std('#c22e28', 0.3, 0.1)); lid.position.set(-1.25, 1.14, -1.7); scene.add(lid);
  const steam = motes(14, [-1.4, -1.1, 1.25, 1.8, -1.8, -1.6], '#ffffff', 0.12, 9, 0.18); scene.add(steam);
  // frutero con manzanas
  const bowl = mesh(latheGeo([[0, 0], [0.12, 0], [0.2, 0.08], [0.21, 0.1], [0, 0.1]]), std('#f6efe4', 0.25)); bowl.position.set(-0.55, 0.92, -1.62); scene.add(bowl);
  [[-0.06, 0.08, 0.02], [0.06, 0.08, -0.03], [0, 0.16, 0], [0.03, 0.08, 0.08]].forEach(([x, y, z], i) => { const a = apple(0.06, i === 3 ? '#8bc34a' : '#d81e3a'); a.position.set(-0.55 + x, 0.92 + y, -1.62 + z); a.rotation.y = i; scene.add(a); });
  // frascos
  [['#f2b632', -1.85], ['#e06a3b', -1.72], ['#7bb661', -1.98]].forEach(([c, x], i) => { const j = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18 + i * 0.04, 16), std(c, 0.3, 0, { transparent: true, opacity: 0.9 })); j.position.set(x, 1.0 + i * 0.02, -1.78); scene.add(j); const t = mesh(new THREE.CylinderGeometry(0.063, 0.063, 0.03, 16), std('#d9b45a', 0.3, 0.8)); t.position.set(x, 1.1 + i * 0.04, -1.78); scene.add(t); });
  // matas
  const p1 = plant(1.4, '#c8643c', '#3f9a52', 2); p1.position.set(0.95, 0.92, -1.72); scene.add(p1);
  const hang = plant(1.3, '#e9d8c4', '#4fae5c', 8); hang.position.set(-1.6, 2.6, -0.6); hang.rotation.x = Math.PI; scene.add(hang);
  // reloj de pared
  const clock = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 32), std('#ffffff', 0.4)); clock.rotation.x = Math.PI / 2; clock.position.set(-1.3, 2.25, -1.97); scene.add(clock);
  const rim = mesh(new THREE.TorusGeometry(0.2, 0.02, 8, 32), std('#e8466e', 0.4)); rim.position.set(-1.3, 2.25, -1.95); scene.add(rim);
  const hands = [0.12, 0.08].map((l, i) => { const h = box(0.012, l, 0.01, std('#222', 0.5)); h.geometry.translate(0, l / 2, 0); h.position.set(-1.3, 2.25, -1.93); h.rotation.z = -i * 2.1 - 0.4; scene.add(h); return h; });
  // mesa auxiliar (donde espera la botella)
  const table = new THREE.Group();
  const tt = mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 32), std('#a8693e', 0.45)); tt.position.y = 0.9; table.add(tt);
  const doily = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.005, 24), cloth('#ffffff')); doily.position.y = 0.923; table.add(doily);
  const leg = mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.9, 12), std('#8a5530', 0.5)); leg.position.y = 0.45; table.add(leg);
  const foot = mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.03, 24), std('#8a5530', 0.5)); foot.position.y = 0.015; table.add(foot);
  table.position.set(-0.62, 0, 0.12); scene.add(table);
  // luces
  scene.add(new THREE.HemisphereLight('#ffe6cf', '#5b3426', 0.7));
  const key = addShadowLight(scene, '#ffd7b0', 2.3, V(2.4, 4.2, 4.2), V(0, 0.9, 0), 2.6);
  const back = new THREE.PointLight('#ff9152', 4, 6, 1.6); back.position.set(0.1, 2.0, -1.5); scene.add(back);
  const fill = new THREE.PointLight('#ffb0cf', 3, 7, 1.5); fill.position.set(-2.0, 1.6, 2.2); scene.add(fill);
  const rimL = new THREE.SpotLight('#ffb27a', 14, 8, 0.6, 0.8, 1.2); rimL.position.set(0.3, 2.6, -1.6); rimL.target.position.set(0, 1.1, 0.2); scene.add(rimL, rimL.target);
  // rayos desde la ventana
  const rays = [];
  [[-0.25, 0.32], [0.25, 0.22], [0.5, 0.18]].forEach(([dx, op], i) => { const r = godRay(0.5 + i * 0.15, 3.4, '#ffcf98', op * 0.45); r.position.set(0.1 + dx, 1.25, -0.9); r.rotation.set(-0.95, 0, 0.25 + i * 0.08); scene.add(r); rays.push(r); });
  const dust = motes(70, [-1.5, 1.5, 0.3, 2.4, -1.6, 1.5], '#ffe2b8', 0.025, 5, 0.65); scene.add(dust);
  // primer plano desenfocado
  const fg = [];
  [['#ffb37a', 0.5, -0.95, 0.35, 2.4], ['#ff8fb0', 0.35, 0.95, 2.1, 2.3], ['#ffd08a', 0.28, 0.7, 0.2, 2.6]].forEach(([c, s, x, y, z]) => { const b = bokehSprite(c, s, 0.35); b.position.set(x, y, z); scene.add(b); fg.push(b); });

  const anchors = { bottleTable: V(-0.6, 0.925, 0.14) };
  return {
    scene, anchors, rim: '#ff9a5a', table,
    update(t) { dust.userData.update(t); steam.userData.update(t * 1.5); hands[0].rotation.z = -t * 0.2; rays.forEach((r, i) => (r.material.opacity = 0.08 + 0.03 * Math.sin(t * 0.8 + i * 2))); },
  };
}


// ====================================================================================
// CUARTO GAMER — noche, LEDs magenta/cian
// ====================================================================================
export function buildRoom() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#07051a');
  scene.fog = new THREE.Fog('#0b0726', 6, 14);
  const floorTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#2a2140'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.12)'; g.fillRect(0, i * h / 8, w, h / 8 - 3); } grain(g, w, h, 10, 7); }, { repeat: [4, 6] });
  const floor = plane(10, 10, std('#ffffff', 0.4, 0, { map: floorTex })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const rug = mesh(new THREE.CircleGeometry(1.1, 48), cloth('#2fd3d6')); rug.rotation.x = -Math.PI / 2; rug.position.y = 0.006; scene.add(rug);
  const rug2 = mesh(new THREE.RingGeometry(0.75, 0.85, 48), cloth('#ff3fa4')); rug2.rotation.x = -Math.PI / 2; rug2.position.y = 0.008; scene.add(rug2);
  const wallTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#1d1a4a'; g.fillRect(0, 0, w, h); grain(g, w, h, 10, 3); });
  const wall = plane(10, 5, std('#ffffff', 0.85, 0, { map: wallTex })); wall.position.set(0, 2.5, -2.0); scene.add(wall);
  const side = plane(6, 5, std('#17143c', 0.9)); side.position.set(2.6, 2.5, 0.5); side.rotation.y = -Math.PI / 2; scene.add(side);
  // tiras LED
  const ledM = emissive('#ff2fa0', 4), ledC = emissive('#22e6ff', 4);
  const led1 = box(6, 0.025, 0.03, ledM); led1.position.set(0, 2.85, -1.97); scene.add(led1);
  const led2 = box(0.025, 2.9, 0.03, ledC); led2.position.set(-1.9, 1.45, -1.97); scene.add(led2);
  // ventana nocturna con ciudad desenfocada
  const nightTex = canvasTex(512, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#120a3a'); gr.addColorStop(1, '#3b1d6e'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rng(11);
    g.filter = 'blur(2px)';
    for (let i = 0; i < 14; i++) { const bw = 30 + r() * 50, bh = 120 + r() * 260, x = r() * w; g.fillStyle = '#0d0a26'; g.fillRect(x, h - bh, bw, bh); for (let k = 0; k < 18; k++) { if (r() < 0.5) { g.fillStyle = r() < 0.5 ? '#ffd27a' : '#9be7ff'; g.fillRect(x + 4 + r() * (bw - 10), h - bh + 6 + r() * (bh - 12), 5, 6); } } }
    g.filter = 'blur(10px)'; for (let i = 0; i < 25; i++) { g.fillStyle = ['rgba(255,90,170,0.7)', 'rgba(80,220,255,0.7)', 'rgba(255,210,120,0.7)'][i % 3]; g.beginPath(); g.arc(r() * w, h * 0.5 + r() * h * 0.5, 6 + r() * 16, 0, Math.PI * 2); g.fill(); }
  });
  const win = plane(1.2, 1.3, new THREE.MeshBasicMaterial({ map: nightTex, color: new THREE.Color(1.4, 1.4, 1.6) })); win.position.set(1.35, 1.85, -1.98); scene.add(win);
  const wf = std('#2b2660', 0.5);
  [[1.35, 2.52, 1.3, 0.06], [1.35, 1.18, 1.3, 0.06], [1.35, 1.85, 0.04, 1.3]].forEach(([x, y, w, h]) => { const f = box(w, h, 0.06, wf, 0.01); f.position.set(x, y, -1.95); scene.add(f); });
  // escritorio + monitores
  const desk = box(1.9, 0.05, 0.7, std('#121018', 0.35), 0.015); desk.position.set(-1.0, 0.78, -1.55); scene.add(desk);
  [[-1.85, -1.5], [-0.15, -1.5]].forEach(([x, z]) => { const l = box(0.05, 0.78, 0.6, std('#121018', 0.4)); l.position.set(x, 0.39, z); scene.add(l); });
  const gameTex = canvasTex(512, 300, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2b0a5e'); gr.addColorStop(0.55, '#ff3fa4'); gr.addColorStop(0.56, '#130828'); gr.addColorStop(1, '#130828'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffd34a'; g.beginPath(); g.arc(w / 2, h * 0.5, 60, Math.PI, 0); g.fill();
    g.strokeStyle = '#22e6ff'; g.lineWidth = 2; for (let i = 0; i < 12; i++) { const y = h * 0.56 + Math.pow(i / 12, 2) * h * 0.44; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (let i = -10; i <= 10; i++) { g.beginPath(); g.moveTo(w / 2 + i * 8, h * 0.56); g.lineTo(w / 2 + i * 70, h); g.stroke(); }
    g.fillStyle = '#7cff6b'; g.fillRect(w * 0.3, h * 0.72, 26, 26); g.fillStyle = '#ff5e5e'; g.fillRect(w * 0.62, h * 0.66, 18, 18);
  });
  const scr = [];
  [[-1.35, 0.15], [-0.6, -0.2]].forEach(([x, ry], i) => {
    const m = box(0.7, 0.42, 0.04, std('#0a0a0e', 0.3), 0.015); m.position.set(x, 1.15, -1.68); m.rotation.y = ry; scene.add(m);
    const s = plane(0.65, 0.37, new THREE.MeshBasicMaterial({ map: gameTex, color: new THREE.Color(1.8, 1.8, 1.8) })); s.position.set(x, 1.15, -1.655); s.rotation.y = ry; s.translateZ(0.022); scene.add(s); scr.push(s);
    const st = box(0.04, 0.32, 0.04, std('#0a0a0e', 0.3)); st.position.set(x, 0.95, -1.72); scene.add(st);
  });
  const kb = box(0.45, 0.025, 0.15, emissive('#7a5cff', 1.2), 0.01); kb.position.set(-0.95, 0.82, -1.35); scene.add(kb);
  // silla gamer
  const chair = new THREE.Group();
  const seat = box(0.55, 0.12, 0.5, std('#141418', 0.45), 0.05); seat.position.y = 0.5; chair.add(seat);
  const backr = box(0.5, 0.85, 0.12, std('#141418', 0.45), 0.06); backr.position.set(0, 1.0, -0.22); chair.add(backr);
  const stripe = box(0.12, 0.8, 0.13, std('#22e6ff', 0.4), 0.03); stripe.position.set(0, 1.0, -0.215); chair.add(stripe);
  const pole = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 10), std('#333', 0.3, 0.8)); pole.position.y = 0.25; chair.add(pole);
  chair.position.set(-1.65, 0, -0.75); chair.rotation.y = 0.7; scene.add(chair);
  // repisa con figuras geométricas y pósters abstractos
  const shelf = box(1.2, 0.04, 0.25, std('#2b2660', 0.5)); shelf.position.set(1.3, 0.95, -1.85); scene.add(shelf);
  [['#ffd34a', 0.95, 'ico'], ['#22e6ff', 1.25, 'box'], ['#ff3fa4', 1.6, 'tor']].forEach(([c, x, k]) => {
    const geo = k === 'ico' ? new THREE.IcosahedronGeometry(0.09) : k === 'box' ? roundedBoxGeo(0.14, 0.14, 0.14, 0.02) : new THREE.TorusKnotGeometry(0.06, 0.02, 64, 8);
    const m = mesh(geo, std(c, 0.3, 0.2)); m.position.set(x, 1.07, -1.82); scene.add(m);
  });
  const posterTex = (c1, c2, seed) => canvasTex(256, 360, (g, w, h) => { g.fillStyle = c1; g.fillRect(0, 0, w, h); const r = rng(seed); for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? c2 : '#ffffff'; g.globalAlpha = 0.85; g.beginPath(); g.arc(r() * w, r() * h, 20 + r() * 60, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1; g.fillStyle = c2; g.fillRect(20, h - 60, w - 40, 14); });
  [[-0.4, 2.15, posterTex('#ff3fa4', '#22e6ff', 3)], [0.35, 2.05, posterTex('#22e6ff', '#7a5cff', 8)]].forEach(([x, y, tx], i) => { const p = plane(0.5, 0.7, std('#ffffff', 0.5, 0, { map: tx })); p.position.set(x, y, -1.98); p.rotation.z = i ? 0.04 : -0.05; scene.add(p); });
  // cama al fondo derecha (manta)
  const bed = box(1.0, 0.45, 1.6, cloth('#3b2f8a'), 0.12); bed.position.set(2.0, 0.22, -0.7); scene.add(bed);
  const pil = box(0.6, 0.15, 0.35, cloth('#ff8fc8'), 0.07); pil.position.set(2.0, 0.52, -1.3); scene.add(pil);
  // luces
  scene.add(new THREE.HemisphereLight('#6d5cff', '#1a0d2e', 0.9));
  addShadowLight(scene, '#e6dcff', 2.3, V(1.5, 4, 4), V(0, 0.9, 0), 2.6);
  const mag = new THREE.SpotLight('#ff2fa0', 22, 8, 0.7, 0.7, 1.3); mag.position.set(-2.2, 2.4, -1.0); mag.target.position.set(0, 1.0, 0); scene.add(mag, mag.target);
  const cy = new THREE.SpotLight('#22e6ff', 18, 8, 0.7, 0.7, 1.3); cy.position.set(2.2, 2.2, -0.8); cy.target.position.set(0, 1.0, 0); scene.add(cy, cy.target);
  const mon = new THREE.PointLight('#9b7bff', 4, 3, 1.5); mon.position.set(-1.0, 1.2, -1.2); scene.add(mon);
  const front = new THREE.PointLight('#ffd9f0', 2.2, 7, 1.5); front.position.set(0.8, 1.6, 2.5); scene.add(front);
  const dust = motes(60, [-1.5, 1.5, 0.3, 2.5, -1.5, 1.5], '#b9a8ff', 0.03, 12, 0.6); scene.add(dust);
  const fg = [];
  [['#ff3fa4', 0.6, -0.9, 0.5, 2.3], ['#22e6ff', 0.45, 0.85, 1.9, 2.4], ['#7a5cff', 0.35, 0.6, 0.35, 2.6]].forEach(([c, s, x, y, z]) => { const b = bokehSprite(c, s, 0.4); b.position.set(x, y, z); scene.add(b); fg.push(b); });
  return {
    scene, rim: '#ff4fb0', anchors: {},
    update(t) { dust.userData.update(t); const pulse = 3.2 + Math.sin(t * 6.28 / 0.6) * 0.8; ledM.emissiveIntensity = pulse; ledC.emissiveIntensity = 3.2 + Math.cos(t * 6.28 / 0.6) * 0.8; gameTex.offset.x = (t * 0.02) % 1; },
  };
}

// ====================================================================================
// OFICINA — día, ventanal con ciudad
// ====================================================================================
export function buildOffice() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#bcd7f0');
  scene.fog = new THREE.Fog('#cfe3f5', 10, 22);
  const floorTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#9aa3b5'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'; g.fillRect(i * w / 4, j * h / 4, w / 4, h / 4); } grain(g, w, h, 16, 21); }, { repeat: [5, 5] });
  const floor = plane(10, 10, std('#ffffff', 0.8, 0, { map: floorTex })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  // ventanal con skyline de día
  const cityTex = canvasTex(1024, 640, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5aa9f0'); gr.addColorStop(0.7, '#bfe2ff'); gr.addColorStop(1, '#e8f4ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rng(31);
    g.filter = 'blur(1.5px)';
    for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.ellipse(r() * w, r() * h * 0.35, 60 + r() * 80, 14 + r() * 10, 0, 0, Math.PI * 2); g.fill(); }
    // montañas
    g.fillStyle = '#7fa7c9'; g.beginPath(); g.moveTo(0, h * 0.62); for (let x = 0; x <= w; x += 20) g.lineTo(x, h * 0.6 - Math.sin(x * 0.006) * 70 - Math.sin(x * 0.021) * 18); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    for (let layer = 0; layer < 2; layer++) {
      for (let i = 0; i < 16; i++) { const bw = 40 + r() * 80, bh = (layer ? 140 : 80) + r() * (layer ? 300 : 180), x = r() * w; g.fillStyle = layer ? ['#e9eef6', '#c9d6e8', '#f4d9c6', '#b8cbe0'][i % 4] : '#a9bfd6'; g.fillRect(x, h - bh, bw, bh); g.fillStyle = 'rgba(90,140,190,0.45)'; for (let yy = h - bh + 10; yy < h - 8; yy += 16) for (let xx = x + 6; xx < x + bw - 8; xx += 14) g.fillRect(xx, yy, 7, 9); }
    }
  });
  const city = plane(5.8, 3.6, new THREE.MeshBasicMaterial({ map: cityTex, color: new THREE.Color(1.05, 1.05, 1.08) })); city.position.set(0, 2.0, -2.6); scene.add(city);
  const mull = std('#e9edf4', 0.35, 0.3);
  for (let i = -3; i <= 3; i++) { const m = box(0.05, 3.6, 0.08, mull); m.position.set(i * 0.95, 1.8, -2.0); scene.add(m); }
  const sill = box(6, 0.4, 0.3, std('#f4f6fa', 0.5), 0.02); sill.position.set(0, 0.2, -1.95); scene.add(sill);
  const top = box(6, 0.08, 0.3, mull); top.position.set(0, 3.2, -2.0); scene.add(top);
  const glass = plane(6, 3.2, new THREE.MeshPhysicalMaterial({ color: '#dff0ff', transmission: 0, transparent: true, opacity: 0.12, roughness: 0.05, metalness: 0 })); glass.position.set(0, 1.8, -1.98); scene.add(glass);
  // escritorio, portátil, planta, taza
  const desk = box(1.5, 0.05, 0.7, std('#f2efe9', 0.35), 0.015); desk.position.set(-1.15, 0.76, -1.2); scene.add(desk);
  [[-1.85, -1.2], [-0.45, -1.2]].forEach(([x, z]) => { const l = box(0.04, 0.76, 0.6, std('#cfd3da', 0.3, 0.6)); l.position.set(x, 0.38, z); scene.add(l); });
  const lapB = box(0.42, 0.02, 0.3, std('#c9ccd3', 0.25, 0.8), 0.008); lapB.position.set(-1.05, 0.795, -1.15); scene.add(lapB);
  const lapS = box(0.42, 0.28, 0.015, std('#c9ccd3', 0.25, 0.8), 0.008); lapS.position.set(-1.05, 0.94, -1.31); lapS.rotation.x = -0.25; scene.add(lapS);
  const chart = canvasTex(256, 170, (g, w, h) => { g.fillStyle = '#f7f9ff'; g.fillRect(0, 0, w, h); ['#ff4f7b', '#5aa9f0', '#ffd34a', '#46c69b'].forEach((c, i) => { g.fillStyle = c; const bh = 30 + i * 25; g.fillRect(30 + i * 52, h - 20 - bh, 34, bh); }); });
  const scr = plane(0.38, 0.24, new THREE.MeshBasicMaterial({ map: chart, color: new THREE.Color(1.3, 1.3, 1.3) })); scr.position.set(-1.05, 0.94, -1.3); scr.rotation.x = -0.25; scr.translateZ(0.009); scene.add(scr);
  const mug = mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 18), std('#ff4f7b', 0.35)); mug.position.set(-0.65, 0.84, -1.05); scene.add(mug);
  const p1 = plant(1.7, '#f4f6fa', '#3c9a5f', 17); p1.position.set(-1.7, 0.78, -1.35); scene.add(p1);
  const p2 = plant(2.6, '#2d3550', '#3c9a5f', 4); p2.position.set(1.75, 0, -1.4); scene.add(p2);
  // tablero con notas adhesivas
  const board = box(1.2, 0.8, 0.03, std('#ffffff', 0.25), 0.02); board.position.set(1.15, 1.55, -1.72); board.rotation.y = -0.25; scene.add(board);
  const r = rng(4);
  for (let i = 0; i < 10; i++) { const n = box(0.12, 0.12, 0.005, std(['#ffd34a', '#ff8fb0', '#7fe0c2', '#9ec5ff'][i % 4], 0.7)); n.position.set(0.7 + (i % 5) * 0.2, 1.75 - Math.floor(i / 5) * 0.22 + r() * 0.03, -1.7 + (i % 5) * 0.05); n.rotation.y = -0.25; n.rotation.z = (r() - 0.5) * 0.2; scene.add(n); }
  // lámparas colgantes
  [-0.9, 0.9].forEach((x) => { const sh = mesh(latheGeo([[0.02, 0.1], [0.12, 0], [0.18, -0.12], [0.0, -0.12]]), std('#1f2a4a', 0.4, 0.3)); sh.position.set(x, 2.9, -0.4); scene.add(sh); const bulb = mesh(SPH(0.05), emissive('#fff3d6', 3)); bulb.position.set(x, 2.77, -0.4); scene.add(bulb); const cb = box(0.008, 0.6, 0.008, std('#222', 0.5)); cb.position.set(x, 3.3, -0.4); scene.add(cb); });
  // luces
  scene.add(new THREE.HemisphereLight('#eaf4ff', '#7d7368', 1.0));
  addShadowLight(scene, '#fff4e4', 2.4, V(-1.5, 4.5, 3.5), V(0, 0.9, 0), 2.6);
  const win = new THREE.DirectionalLight('#bfe0ff', 1.6); win.position.set(0.5, 2.5, -4); scene.add(win);
  const warm = new THREE.PointLight('#ffd9b8', 2.5, 7, 1.5); warm.position.set(1.5, 1.8, 2.3); scene.add(warm);
  const rays = [];
  [[-0.9, 0.16], [0.4, 0.14]].forEach(([x, op], i) => { const g = godRay(0.9, 3.6, '#fff6e0', op * 0.5); g.position.set(x, 1.4, -0.9); g.rotation.set(-0.7, 0, -0.35); scene.add(g); rays.push(g); });
  const dust = motes(45, [-1.5, 1.5, 0.3, 2.4, -1.6, 1.4], '#ffffff', 0.022, 14, 0.5); scene.add(dust);
  return { scene, rim: '#ffe9c8', anchors: {}, update(t) { dust.userData.update(t); } };
}

// ====================================================================================
// GARAJE DE ENSAYO — rockero, ladrillo, reflectores
// ====================================================================================
export function buildGarage() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0c0606');
  scene.fog = new THREE.Fog('#160909', 5, 13);
  const conc = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#4a4441'; g.fillRect(0, 0, w, h); const r = rng(9); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(${r() < 0.5 ? 0 : 255},${r() < 0.5 ? 0 : 255},${r() < 0.5 ? 0 : 255},0.03)`; g.beginPath(); g.arc(r() * w, r() * h, r() * 30, 0, 7); g.fill(); } grain(g, w, h, 20, 8); }, { repeat: [3, 3] });
  const floor = plane(10, 10, std('#ffffff', 0.55, 0, { map: conc })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const rug = mesh(new THREE.PlaneGeometry(2.4, 1.7), cloth('#7a1d2b')); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.006, 0.1); scene.add(rug);
  const rugB = mesh(new THREE.PlaneGeometry(2.2, 1.5), cloth('#c9a23e')); rugB.rotation.x = -Math.PI / 2; rugB.position.set(0, 0.007, 0.1); rugB.scale.set(1, 1, 1); scene.add(rugB);
  const rugC = mesh(new THREE.PlaneGeometry(2.1, 1.4), cloth('#7a1d2b')); rugC.rotation.x = -Math.PI / 2; rugC.position.set(0, 0.008, 0.1); scene.add(rugC);
  const brick = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#3a2a26'; g.fillRect(0, 0, w, h); const r = rng(2); const bh = 32, bw = 96;
    for (let y = 0; y < h; y += bh) for (let x = -((y / bh) % 2) * bw / 2; x < w; x += bw) { const c = 120 + r() * 60; g.fillStyle = `rgb(${c},${c * 0.42},${c * 0.32})`; g.fillRect(x + 3, y + 3, bw - 6, bh - 6); }
    grain(g, w, h, 18, 4);
  }, { repeat: [4, 2.5] });
  const wall = plane(10, 5, std('#ffffff', 0.85, 0, { map: brick })); wall.position.set(0, 2.5, -2.0); scene.add(wall);
  // amplificadores (sin marca)
  const grille = canvasTex(256, 256, (g, w) => { g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, w, w); g.strokeStyle = '#2c2c2c'; g.lineWidth = 2; for (let i = 0; i < w; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, w); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } });
  [[1.35, 0.45, 0.9], [1.35, 1.2, 0.6]].forEach(([x, y, hgt], i) => {
    const a = box(0.95, hgt, 0.5, std('#141414', 0.6), 0.03); a.position.set(x, y, -1.6); scene.add(a);
    const gr = plane(0.85, hgt - 0.12, std('#ffffff', 0.9, 0, { map: grille })); gr.position.set(x, y, -1.345); scene.add(gr);
    if (i === 1) { for (let k = 0; k < 6; k++) { const kn = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 12), std('#d8d8dc', 0.3, 1)); kn.rotation.x = Math.PI / 2; kn.position.set(x - 0.3 + k * 0.12, y + 0.22, -1.34); scene.add(kn); } }
  });
  const pilot = mesh(SPH(0.015), emissive('#ff2a2a', 6)); pilot.position.set(1.75, 1.42, -1.33); scene.add(pilot);
  // batería
  const drum = new THREE.Group();
  const kick = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.4, 32), std('#9b1c2c', 0.3, 0.3)); kick.rotation.x = Math.PI / 2; kick.position.y = 0.33; drum.add(kick);
  const head = mesh(new THREE.CircleGeometry(0.29, 32), std('#efe8dc', 0.6)); head.position.set(0, 0.33, 0.205); drum.add(head);
  [[-0.35, 0.65, 0.18], [0.3, 0.7, 0.16]].forEach(([x, y, r]) => { const t = mesh(new THREE.CylinderGeometry(r, r, 0.18, 24), std('#9b1c2c', 0.3, 0.3)); t.position.set(x, y, 0); t.rotation.x = 0.4; drum.add(t); });
  [[-0.65, 1.05], [0.6, 1.15]].forEach(([x, y]) => { const c = mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.01, 32), std('#d9b04a', 0.25, 1)); c.position.set(x, y, 0); c.rotation.x = 0.2; drum.add(c); const s = mesh(new THREE.CylinderGeometry(0.01, 0.01, y, 6), std('#999', 0.3, 1)); s.position.set(x, y / 2, 0); drum.add(s); });
  drum.position.set(-1.35, 0, -1.4); drum.rotation.y = 0.35; scene.add(drum);
  // guitarra en atril
  const gtr = new THREE.Group();
  const bodyShape = new THREE.Shape(); bodyShape.moveTo(0, -0.22); bodyShape.bezierCurveTo(0.2, -0.24, 0.22, -0.02, 0.12, 0.04); bodyShape.bezierCurveTo(0.2, 0.12, 0.16, 0.24, 0.06, 0.2); bodyShape.lineTo(-0.06, 0.2); bodyShape.bezierCurveTo(-0.16, 0.24, -0.2, 0.12, -0.12, 0.04); bodyShape.bezierCurveTo(-0.22, -0.02, -0.2, -0.24, 0, -0.22);
  const gb = mesh(new THREE.ExtrudeGeometry(bodyShape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2 }), std('#2fb8c9', 0.25, 0.2)); gtr.add(gb);
  const pg = mesh(new THREE.ShapeGeometry(bodyShape), std('#f3f0ea', 0.4)); pg.scale.set(0.5, 0.5, 1); pg.position.set(0.03, -0.04, 0.062); gtr.add(pg);
  const nk = box(0.05, 0.55, 0.03, std('#6b4226', 0.5)); nk.position.set(0, 0.47, 0.03); gtr.add(nk);
  const hd = box(0.08, 0.14, 0.03, std('#1a1a1a', 0.4)); hd.position.set(0, 0.8, 0.03); gtr.add(hd);
  gtr.position.set(0.75, 0.42, -1.3); gtr.rotation.set(-0.15, -0.3, 0.08); scene.add(gtr);
  // luces de feria colgadas
  const bulbs = [];
  const bulbM = emissive('#ffbe6b', 3.5);
  for (let i = 0; i < 16; i++) { const x = -2.2 + i * 0.3; const y = 2.85 - Math.sin((i / 15) * Math.PI) * 0.35; const bb = mesh(SPH(0.03, 10, 8), bulbM, { shadow: false }); bb.position.set(x, y, -1.9); scene.add(bb); bulbs.push(bb); }
  const wire = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bulbs.map((b) => b.position.clone().add(V(0, 0.03, 0)))), 64, 0.005, 4), std('#111', 0.6)); scene.add(wire);
  // luces
  scene.add(new THREE.HemisphereLight('#ffb48a', '#1a0c0c', 0.6));
  addShadowLight(scene, '#ffd6b0', 1.9, V(1.0, 4.5, 4), V(0, 0.9, 0), 2.6);
  const s1 = new THREE.SpotLight('#ff3b3b', 40, 9, 0.45, 0.6, 1.2); s1.position.set(-1.8, 3.2, -0.6); s1.target.position.set(0, 0.6, 0.2); scene.add(s1, s1.target);
  const s2 = new THREE.SpotLight('#ffb02e', 36, 9, 0.45, 0.6, 1.2); s2.position.set(1.8, 3.2, -0.6); s2.target.position.set(0, 0.6, 0.2); scene.add(s2, s2.target);
  const back = new THREE.PointLight('#ff6a3d', 6, 5, 1.5); back.position.set(0, 2.2, -1.5); scene.add(back);
  const front = new THREE.PointLight('#ffe1c4', 4.5, 7, 1.5); front.position.set(-0.6, 1.6, 2.6); scene.add(front);
  // conos de luz volumétricos
  const cones = [];
  [[-1.8, '#ff3b3b', 0.35], [1.8, '#ffb02e', -0.35]].forEach(([x, c, rz]) => { const g = godRay(1.3, 4.2, c, 0.2); g.position.set(x * 0.55, 1.6, -0.5); g.rotation.set(0, 0, rz); scene.add(g); cones.push(g); });
  const haze = motes(80, [-1.8, 1.8, 0.2, 2.8, -1.6, 1.4], '#ffb38a', 0.035, 22, 0.5); scene.add(haze);
  return {
    scene, rim: '#ff5a3a', anchors: {},
    update(t, B) { haze.userData.update(t); const k = B !== undefined ? Math.exp(-((B % 1)) * 4) : 0; s1.intensity = 30 + 25 * k; s2.intensity = 28 + 22 * k; cones.forEach((c, i) => (c.material.opacity = 0.14 + 0.12 * k)); bulbs.forEach((b, i) => b.scale.setScalar(1 + 0.15 * Math.sin(t * 3 + i))); },
  };
}

// ====================================================================================
// TERRAZA DE NOCHE — final, luces cálidas
// ====================================================================================
export function buildTerrace() {
  const scene = new THREE.Scene();
  const skyTex = canvasTex(512, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0b0b2e'); gr.addColorStop(0.5, '#2a1957'); gr.addColorStop(0.8, '#7a3a7a'); gr.addColorStop(1, '#ff8f7a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rng(77); for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.7})`; g.fillRect(r() * w, r() * h * 0.55, 1.5, 1.5); }
    const mg = g.createRadialGradient(w * 0.75, h * 0.18, 0, w * 0.75, h * 0.18, 70); mg.addColorStop(0, 'rgba(255,250,230,1)'); mg.addColorStop(0.3, 'rgba(255,245,220,0.9)'); mg.addColorStop(0.35, 'rgba(255,230,200,0.25)'); mg.addColorStop(1, 'rgba(255,220,200,0)'); g.fillStyle = mg; g.fillRect(0, 0, w, h);
  });
  scene.background = skyTex;
  scene.fog = new THREE.Fog('#2a1840', 9, 24);
  const plank = canvasTex(512, 512, (g, w, h) => { const r = rng(5); for (let i = 0; i < 8; i++) { const c = 90 + r() * 30; g.fillStyle = `rgb(${c * 1.25},${c * 0.82},${c * 0.55})`; g.fillRect(i * w / 8, 0, w / 8 - 4, h); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(i * w / 8 + w / 8 - 4, 0, 4, h); } grain(g, w, h, 18, 6); }, { repeat: [6, 3] });
  const floor = plane(14, 10, std('#ffffff', 0.5, 0, { map: plank })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  // ciudad lejana
  const cityTex = canvasTex(1024, 512, (g, w, h) => {
    const r = rng(19);
    for (let layer = 0; layer < 3; layer++) {
      g.filter = `blur(${3 - layer}px)`;
      for (let i = 0; i < 22; i++) { const bw = 30 + r() * 70, bh = 60 + r() * (120 + layer * 110), x = r() * w; g.fillStyle = ['#1a1240', '#221650', '#2b1b5e'][layer]; g.fillRect(x, h - bh, bw, bh); for (let k = 0; k < bh / 9; k++) { if (r() < 0.45) { g.fillStyle = ['#ffd27a', '#ffb36b', '#ffe9b0', '#ff8fb0'][Math.floor(r() * 4)]; g.fillRect(x + 4 + r() * (bw - 10), h - bh + 6 + r() * (bh - 12), 4, 5); } } }
    }
    g.filter = 'blur(8px)'; for (let i = 0; i < 40; i++) { g.fillStyle = ['rgba(255,200,120,0.6)', 'rgba(255,120,170,0.5)', 'rgba(255,240,200,0.5)'][i % 3]; g.beginPath(); g.arc(r() * w, h * 0.7 + r() * h * 0.3, 4 + r() * 10, 0, 7); g.fill(); }
  });
  cityTex.wrapS = THREE.RepeatWrapping;
  const city = new THREE.Mesh(new THREE.PlaneGeometry(26, 6.5), new THREE.MeshBasicMaterial({ map: cityTex, transparent: true, color: new THREE.Color(1.5, 1.5, 1.5), fog: false })); city.position.set(0, 1.6, -12); scene.add(city);
  // baranda
  const rail = std('#2a2232', 0.35, 0.6);
  const top = box(10, 0.05, 0.06, rail); top.position.set(0, 1.0, -2.3); scene.add(top);
  for (let i = -16; i <= 16; i++) { const p = box(0.025, 1.0, 0.025, rail); p.position.set(i * 0.3, 0.5, -2.3); scene.add(p); }
  const glass = plane(10, 0.95, new THREE.MeshStandardMaterial({ color: '#9fb6ff', transparent: true, opacity: 0.08, roughness: 0.05 })); glass.position.set(0, 0.5, -2.28); scene.add(glass);
  // luces de guirnalda en zigzag
  const bulbs = []; const bulbM = emissive('#ffc77a', 4.5); const bulbP = emissive('#ff9bc0', 4);
  const strands = [[V(-3.2, 3.0, -2.4), V(3.2, 2.9, 1.2)], [V(3.2, 3.05, -2.4), V(-3.2, 2.95, 1.2)], [V(-3.2, 2.95, -0.6), V(3.2, 3.0, -0.6)]];
  strands.forEach(([a, b], si) => {
    const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24; const p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 0.55; pts.push(p); }
    const curve = new THREE.CatmullRomCurve3(pts);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.006, 4), std('#111', 0.6)));
    for (let i = 1; i < 24; i++) { const bb = mesh(SPH(0.035, 10, 8), (i + si) % 4 === 0 ? bulbP : bulbM, { shadow: false }); bb.position.copy(curve.getPoint(i / 24)).add(V(0, -0.05, 0)); scene.add(bb); bulbs.push(bb); }
  });
  // matas y faroles
  [[-2.1, -1.8, 2.6], [2.2, -1.7, 3.0], [-2.6, 0.4, 2.2]].forEach(([x, z, s], i) => { const p = plant(s, '#c8643c', '#2f8a55', 30 + i); p.position.set(x, 0, z); scene.add(p); });
  const lanterns = [];
  [[-1.3, -1.6], [1.4, -1.5], [2.0, 0.6]].forEach(([x, z]) => {
    const l = new THREE.Group(); const fr = box(0.16, 0.26, 0.16, std('#1b1b1f', 0.4, 0.6), 0.02); l.add(fr);
    const gl = box(0.13, 0.2, 0.13, emissive('#ffb35a', 3), 0.01); l.add(gl); l.position.set(x, 0.13, z); scene.add(l); lanterns.push(l);
    const pl = new THREE.PointLight('#ffaa55', 2.5, 2.5, 1.6); pl.position.set(x, 0.35, z); scene.add(pl);
  });
  // mesa con hielera (botellas sin etiqueta visible: hielo y tapa)
  const table = new THREE.Group();
  const tt = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32), std('#7a4a2c', 0.4)); tt.position.y = 0.75; table.add(tt);
  const tl = mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.75, 12), std('#2a2232', 0.4, 0.5)); tl.position.y = 0.375; table.add(tl);
  const bucket = mesh(latheGeo([[0, 0], [0.13, 0], [0.16, 0.2], [0.165, 0.21], [0, 0.21]]), std('#d8dbe2', 0.2, 1)); bucket.position.y = 0.775; table.add(bucket);
  for (let i = 0; i < 7; i++) { const ice = mesh(roundedBoxGeo(0.06, 0.05, 0.06, 0.015), new THREE.MeshPhysicalMaterial({ color: '#e8f6ff', roughness: 0.1, transmission: 0.3, transparent: true, opacity: 0.85 })); ice.position.set(Math.cos(i) * 0.08, 0.98, Math.sin(i) * 0.08); ice.rotation.set(i, i * 2, 0); table.add(ice); }
  table.position.set(1.55, 0, -1.0); scene.add(table);
  // luces
  scene.add(new THREE.HemisphereLight('#9a8fe0', '#3a1f2a', 0.5));
  addShadowLight(scene, '#ffd2a0', 2.7, V(0.8, 4.5, 3.8), V(0, 0.9, 0), 3.0);
  const warm1 = new THREE.PointLight('#ffb36b', 10, 7, 1.4); warm1.position.set(-1.2, 2.6, 0.5); scene.add(warm1);
  const warm2 = new THREE.PointLight('#ff8fb0', 4, 7, 1.4); warm2.position.set(1.4, 2.5, 0.2); scene.add(warm2);
  const rimB = new THREE.SpotLight('#b49bff', 18, 9, 0.8, 0.8, 1.2);
  const faceFill = new THREE.PointLight('#ffd9b5', 6, 8, 1.3); faceFill.position.set(0, 1.9, 3.2); scene.add(faceFill); rimB.position.set(0, 3, -3); rimB.target.position.set(0, 1, 0); scene.add(rimB, rimB.target);
  const flies = motes(70, [-3, 3, 0.4, 2.8, -2.2, 1.6], '#ffd98a', 0.045, 33, 0.85); scene.add(flies);
  const fg = [];
  [['#ffc77a', 0.7, -1.0, 2.4, 2.6], ['#ff9bc0', 0.5, 1.0, 2.6, 2.4], ['#ffc77a', 0.4, 0.8, 0.5, 2.8], ['#ffe1a8', 0.55, -0.9, 0.6, 2.7]].forEach(([c, s, x, y, z]) => { const b = bokehSprite(c, s, 0.35); b.position.set(x, y, z); scene.add(b); fg.push(b); });
  return {
    scene, rim: '#ffb36b', anchors: {},
    update(t) { flies.userData.update(t); bulbs.forEach((b, i) => { const s = 1 + 0.18 * Math.sin(t * 2.2 + i * 1.3); b.scale.setScalar(s); }); },
  };
}

export const SETS = { kitchen: buildKitchen, room: buildRoom, office: buildOffice, garage: buildGarage, terrace: buildTerrace };
