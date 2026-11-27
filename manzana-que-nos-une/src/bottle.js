import * as THREE from 'three';

// Botella real de Manzana Postobón (imagen recortada, sin redibujar). Siempre de frente a la cámara
// (billboard) con escala uniforme: el logo nunca se deforma. Integración: sombra proyectada,
// brillo especular que barre la botella, halo de luz de la escena por detrás.
const ASPECT = 366 / 1259; // ancho / alto del recorte
export const BOTTLE_H = 0.33;

let TEX = null;
export function loadBottleTexture() {
  return new Promise((res) => {
    new THREE.TextureLoader().load('../assets/bottle_pet.png', (t) => {
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
      TEX = t; res(t);
    });
  });
}

const vert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const frag = `
uniform sampler2D map; uniform float glint; uniform float glintAmt; uniform float opacity; uniform vec3 rimColor; uniform float rimAmt; uniform float exposure;
varying vec2 vUv;
void main(){
  vec4 c = texture2D(map, vUv);
  if (c.a < 0.02) discard;
  vec3 col = c.rgb * exposure;
  // barrido especular diagonal (luz que pasa por el plástico)
  float d = (vUv.x * 0.55 + vUv.y) - glint;
  float band = exp(-d*d*260.0) * glintAmt;
  float band2 = exp(-(d+0.06)*(d+0.06)*900.0) * glintAmt * 0.6;
  col += vec3(1.0, 0.97, 0.98) * (band + band2) * c.a;
  // luz de borde (rim) del color de la escena en los bordes del recorte
  float edge = smoothstep(0.75, 0.15, c.a);
  float side = smoothstep(0.35, 0.0, vUv.x) + smoothstep(0.65, 1.0, vUv.x);
  col += rimColor * rimAmt * (side * 0.5);
  gl_FragColor = vec4(col, c.a * opacity);
}`;

export class Bottle {
  constructor(opts = {}) {
    this.group = new THREE.Group();
    this.h = opts.height || BOTTLE_H;
    const geo = new THREE.PlaneGeometry(this.h * ASPECT, this.h);
    this.mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: TEX }, glint: { value: -1 }, glintAmt: { value: 0.0 }, opacity: { value: 1 }, rimColor: { value: new THREE.Color(opts.rim || '#ffb38a') }, rimAmt: { value: 0.0 }, exposure: { value: 1 } },
      vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: true,
    });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: TEX, alphaTest: 0.5 });
    this.mesh.renderOrder = 2;
    this.group.add(this.mesh);
    this.roll = 0;
  }
  // pos = punto de agarre (mano). El agarre queda en la parte baja de la botella para no tapar la etiqueta.
  place(camera, pos, roll = 0, scale = 1, gripFrac = 0.27) {
    this.group.visible = true;
    this.group.quaternion.copy(camera.quaternion);
    const rq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll);
    this.group.quaternion.multiply(rq);
    // desplazar: el agarre está a gripFrac desde abajo; un poco detrás de la mano respecto a la cámara
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.group.quaternion);
    const back = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    this.group.position.copy(pos).addScaledVector(up, (0.5 - gripFrac) * this.h * scale).addScaledVector(back, 0.035 * scale);
    this.group.scale.setScalar(scale);
  }
  setGlint(phase, amt = 1) { this.mat.uniforms.glint.value = phase; this.mat.uniforms.glintAmt.value = amt; }
}
