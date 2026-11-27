import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

export const W = 1080, H = 1920;

// Panel compuesto: textura de una toma + desenfoque direccional/zoom + esquinas redondeadas + borde
const panelVert = `varying vec2 vUv; void main(){ vUv=uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const panelFrag = `
uniform sampler2D tex; uniform vec2 size; uniform float radius; uniform float border; uniform vec3 borderColor; uniform float opacity;
uniform vec2 blur; uniform float zoomBlur; uniform vec2 uvScale; uniform vec2 uvOffset; uniform float bright; uniform vec3 tint; uniform float tintAmt;
varying vec2 vUv;
float sdRound(vec2 p, vec2 b, float r){ vec2 q = abs(p)-b+r; return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r; }
void main(){
  vec2 uv = (vUv-0.5)*uvScale+0.5+uvOffset;
  vec3 c = vec3(0.0);
  float n = 0.0;
  for(int i=0;i<16;i++){
    float f = float(i)/15.0-0.5;
    vec2 u2 = uv + blur*f;
    u2 = (u2-0.5)*(1.0 - zoomBlur*(f+0.5)) + 0.5;
    c += texture2D(tex, clamp(u2, 0.001, 0.999)).rgb; n += 1.0;
  }
  c /= n;
  c *= bright;
  c = mix(c, tint, tintAmt);
  vec2 p = (vUv-0.5)*size;
  float d = sdRound(p, size*0.5, radius);
  float a = 1.0 - smoothstep(-1.0, 1.0, d);
  float bd = smoothstep(-border-1.0, -border+1.0, d);
  c = mix(c, borderColor, bd * step(0.01, border));
  gl_FragColor = vec4(c, a*opacity);
}`;

export class Panel {
  constructor(tex) {
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        tex: { value: tex }, size: { value: new THREE.Vector2(W, H) }, radius: { value: 0 }, border: { value: 0 }, borderColor: { value: new THREE.Color('#ffffff') },
        opacity: { value: 1 }, blur: { value: new THREE.Vector2() }, zoomBlur: { value: 0 }, uvScale: { value: new THREE.Vector2(1, 1) }, uvOffset: { value: new THREE.Vector2() },
        bright: { value: 1 }, tint: { value: new THREE.Color('#ffffff') }, tintAmt: { value: 0 },
      },
      vertexShader: panelVert, fragmentShader: panelFrag, transparent: true, depthTest: false, depthWrite: false,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.mat);
  }
  // rect en px de pantalla: centro (cx, cy) desde arriba-izquierda, ancho w, alto h
  set(cx, cy, w, h, rot = 0) {
    this.mesh.position.set(cx - W / 2, H / 2 - cy, 0); this.mesh.scale.set(w, h, 1); this.mesh.rotation.z = rot;
    this.mat.uniforms.size.value.set(w, h);
  }
}

const gradeShader = {
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, vignette: { value: 0.35 }, grainAmt: { value: 0.035 }, ca: { value: 0.0015 }, flash: { value: 0 }, flashColor: { value: new THREE.Color('#ffffff') }, lift: { value: new THREE.Color(0.0, 0.0, 0.0) }, sat: { value: 1.06 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float time, vignette, grainAmt, ca, flash, sat; uniform vec3 flashColor, lift; varying vec2 vUv;
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + time*7.31)*43758.5453); }
  void main(){
    vec2 d = vUv-0.5;
    vec3 c;
    c.r = texture2D(tDiffuse, vUv - d*ca).r; c.g = texture2D(tDiffuse, vUv).g; c.b = texture2D(tDiffuse, vUv + d*ca).b;
    float l = dot(c, vec3(0.299,0.587,0.114)); c = mix(vec3(l), c, sat);
    c = c + lift*(1.0-c);
    float v = smoothstep(0.95, 0.25, length(d*vec2(1.0,0.75))); c *= mix(1.0-vignette, 1.0, v);
    c += (h(vUv*vec2(1080.0,1920.0))-0.5)*grainAmt;
    c = mix(c, flashColor, flash);
    gl_FragColor = vec4(c,1.0);
  }`,
};

export class Engine {
  constructor(canvas) {
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    r.setPixelRatio(1); r.setSize(W, H, false);
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
    r.outputColorSpace = THREE.SRGBColorSpace;
    const rtOpts = { type: THREE.HalfFloatType, samples: 4, colorSpace: THREE.LinearSRGBColorSpace };
    this.rts = [0, 1, 2, 3].map(() => new THREE.WebGLRenderTarget(W, H, rtOpts));
    this.rtsSmall = [0, 1, 2, 3].map(() => new THREE.WebGLRenderTarget(W / 2, H / 2, rtOpts));
    this.panels = [0, 1, 2, 3, 4, 5].map(() => new Panel(null));
    this.comp = new THREE.Scene(); this.comp.background = new THREE.Color('#000');
    this.compBg = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ color: '#000' })); this.compBg.position.z = -1; this.comp.add(this.compBg);
    this.panels.forEach((p, i) => { p.mesh.renderOrder = i + 1; this.comp.add(p.mesh); });
    this.ortho = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -10, 10);
    const target = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
    this.composer = new EffectComposer(r, target);
    this.composer.setPixelRatio(1); this.composer.setSize(W, H);
    this.composer.addPass(new RenderPass(this.comp, this.ortho));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.5, 0.55, 1.05);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.grade = new ShaderPass(gradeShader);
    this.composer.addPass(this.grade);
    this.extraComp = new THREE.Group(); this.comp.add(this.extraComp);
  }
  renderShot(scene, camera, rt) { const r = this.renderer; r.setRenderTarget(rt); r.clear(); r.render(scene, camera); r.setRenderTarget(null); }
  final(time) { this.grade.uniforms.time.value = time; this.composer.render(); }
}
