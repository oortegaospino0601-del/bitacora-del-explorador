import { clamp, easeOutBack, easeOutCubic, easeInCubic, smooth, easeOutElastic } from './lib.js';

// Tipografía cinética en DOM (se captura junto al canvas). Todo es función pura del beat global.
const PINK = '#ff2a7f';
const ui = () => document.getElementById('ui');

export class KText {
  // spec: { text, x, y (centro, px), size, font, color, stroke, inBeat, outBeat, mode, align, rot, letterStagger }
  constructor(spec) {
    this.s = { font: 'Dela', size: 110, color: '#ffffff', stroke: PINK, strokeW: 16, shadow: true, mode: 'drop', stagger: 0.05, rot: 0, align: 'center', ...spec };
    const el = this.el = document.createElement('div');
    el.className = 'word';
    el.style.left = '0px'; el.style.top = '0px';
    el.style.font = `${this.s.weight || 400} ${this.s.size}px ${this.s.font}`;
    el.style.letterSpacing = (this.s.tracking ?? 0) + 'px';
    el.style.lineHeight = '0.95';
    this.letters = [];
    [...this.s.text].forEach((ch) => {
      const sp = document.createElement('span');
      sp.textContent = ch === ' ' ? ' ' : ch;
      sp.style.display = 'inline-block';
      sp.style.color = this.s.color;
      if (this.s.stroke) { sp.style.webkitTextStroke = `${this.s.strokeW}px ${this.s.stroke}`; sp.style.paintOrder = 'stroke fill'; }
      if (this.s.shadow) sp.style.textShadow = `0 10px 0 rgba(60,0,30,0.35), 0 18px 30px rgba(0,0,0,0.35)`;
      el.appendChild(sp); this.letters.push(sp);
    });
    ui().appendChild(el);
    this.w = null;
  }
  update(B) {
    const s = this.s;
    if (this.w === null) {
      this.w = this.el.offsetWidth; this.h = this.el.offsetHeight;
      const maxW = s.maxW || 840;
      if (this.w > maxW) { const k = maxW / this.w; this.el.style.fontSize = (s.size * k) + 'px'; this.letters.forEach((sp) => { sp.style.webkitTextStroke = `${s.strokeW * k}px ${s.stroke}`; }); this.w = this.el.offsetWidth; this.h = this.el.offsetHeight; }
    }
    const vis = B >= s.inBeat - 0.01 && B <= s.outBeat + 0.6;
    this.el.style.display = vis ? 'block' : 'none';
    if (!vis) return;
    const x = s.x - (s.align === 'center' ? this.w / 2 : 0), y = s.y - this.h / 2;
    let gs = 1, gy = 0, go = 1;
    const out = clamp((B - s.outBeat) / 0.35);
    if (out > 0) { gs = 1 - 0.35 * easeInCubic(out); go = 1 - out; gy = -40 * easeInCubic(out); }
    // pulso en cada beat mientras está en pantalla
    const pulse = Math.exp(-((B - Math.floor(B)) * 6)) * (s.pulse ?? 0.04) * (B > s.inBeat + 0.5 ? 1 : 0);
    this.el.style.transform = `translate(${x}px, ${y + gy}px) rotate(${s.rot}deg) scale(${gs * (1 + pulse)})`;
    this.el.style.opacity = go;
    const n = this.letters.length;
    this.letters.forEach((sp, i) => {
      const t0 = s.inBeat + i * s.stagger;
      const u = clamp((B - t0) / (s.dur || 0.45));
      let tr = '', op = u > 0 ? 1 : 0;
      if (s.mode === 'drop') { const e = easeOutBack(u, 2.2); tr = `translateY(${(1 - e) * -160}px) scale(${0.4 + 0.6 * e}, ${0.4 + 0.6 * e})`; }
      else if (s.mode === 'slam') { const e = easeOutBack(u, 3); tr = `scale(${2.6 - 1.6 * e}) rotate(${(1 - e) * (i % 2 ? 12 : -12)}deg)`; op = clamp(u * 3); }
      else if (s.mode === 'rise') { const e = easeOutCubic(u); tr = `translateY(${(1 - e) * 90}px)`; op = clamp(u * 2); }
      else if (s.mode === 'pop') { const e = easeOutElastic(u); tr = `scale(${e})`; }
      sp.style.transform = tr; sp.style.opacity = op;
    });
  }
}

// Etiqueta de paso: píldora + contador de 8 tiempos
export class StepTag {
  constructor({ num, name, inBeat, outBeat, x = 70, y = 250 }) {
    this.s = { num, name, inBeat, outBeat, x, y };
    const el = this.el = document.createElement('div');
    el.className = 'word';
    el.style.transformOrigin = '0% 50%';
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:16px;">
        <div style="background:${PINK};color:#fff;font:400 34px Dela;padding:14px 22px 12px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.35)">PASO ${num}</div>
        <div style="background:rgba(255,255,255,.95);color:#2a0b2a;font:800 40px Baloo;padding:6px 24px 2px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.3)">${name}</div>
      </div>
      <div class="dots" style="display:flex;gap:12px;margin:16px 0 0 10px">${'<div style="width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.45);box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>'.repeat(8)}</div>`;
    ui().appendChild(el);
    this.dots = [...el.querySelectorAll('.dots > div')];
  }
  update(B) {
    const s = this.s;
    const vis = B >= s.inBeat && B < s.outBeat + 0.3;
    this.el.style.display = vis ? 'block' : 'none';
    if (!vis) return;
    const u = clamp((B - s.inBeat) / 0.5), o = clamp((B - s.outBeat) / 0.3);
    const e = easeOutBack(u, 2);
    this.el.style.transform = `translate(${s.x - (1 - e) * 500}px, ${s.y}px) scale(${1 - 0.2 * o})`;
    this.el.style.opacity = 1 - o;
    const cur = Math.floor(B - s.inBeat);
    this.dots.forEach((d, i) => {
      const on = i === cur, past = i < cur;
      const k = on ? Math.exp(-(B - s.inBeat - cur) * 5) : 0;
      d.style.background = on ? '#ffe14a' : past ? PINK : 'rgba(255,255,255,.45)';
      d.style.transform = `scale(${1 + 0.6 * k})`;
    });
  }
}

export class HashTag {
  constructor({ text, x, y, inBeat }) {
    this.s = { text, x, y, inBeat };
    const el = this.el = document.createElement('div');
    el.className = 'word';
    el.innerHTML = `<div style="background:#fff;color:${PINK};font:800 52px Baloo;padding:12px 34px 4px;border-radius:999px;box-shadow:0 12px 30px rgba(0,0,0,.35)">${text}</div>`;
    ui().appendChild(el);
    this.w = null;
  }
  update(B) {
    const s = this.s;
    const vis = B >= s.inBeat; this.el.style.display = vis ? 'block' : 'none'; if (!vis) return;
    if (this.w === null) this.w = this.el.offsetWidth;
    const e = easeOutBack(clamp((B - s.inBeat) / 0.5), 2.5);
    this.el.style.transform = `translate(${s.x - this.w / 2}px, ${s.y}px) scale(${e})`;
    this.el.style.transformOrigin = '50% 50%';
  }
}
