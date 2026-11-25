import React from 'react';
import {AbsoluteFill, Audio, Easing, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/700.css';
import '@fontsource/fraunces/800.css';

// Historia animada de "YOKO" (Álvaro Díaz). Personajes inventados, sin caras,
// ilustración plana con paleta pastel / rosa / dorado. Solo voz.

type W = {w: string; start: number; end: number};
type T = {start: number; end: number; sceneStart: number; sceneEnd: number; words: W[]};
type YProps = {
  spec: {song?: string; artist?: string; sentences: {text: string; scene: string}[]};
  timings: T[];
  totalSeconds: number;
  audioFile: string;
};

const SERIF = "'Fraunces', Georgia, serif";
const GOLD = '#F2B84B';
const CREAM = '#FFF3E6';
const PINK = '#EC94AC';
const ROSE = '#D9718E';
const LAV = '#B8A2DA';
const PEACH = '#F8C29C';
const PLUM = '#2B1626';
const SIL = '#3A1F35';

// ---------- utilidades ----------
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (x: number) => Easing.inOut(Easing.cubic)(clamp(x));
const eOut = (x: number) => Easing.out(Easing.cubic)(clamp(x));
const eBack = (x: number) => Easing.out(Easing.back(1.8))(clamp(x));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixC = (a: string, b: string, k: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(mix(v, B[i], clamp(k)))).join(',')})`;
};
const rnd = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const cam = (z: number, rot = 0, px = 0, py = 0, cx = 540, cy = 760) =>
  `translate(${cx + px} ${cy + py}) rotate(${rot}) scale(${z}) translate(${-cx} ${-cy})`;

// ---------- piezas reutilizables ----------
const Defs: React.FC = () => (
  <defs>
    {[
      ['gGold', '#FFE3A3'],
      ['gPink', '#FFB8CB'],
      ['gLav', '#D8C6FF'],
      ['gWhite', '#FFFFFF'],
      ['gPeach', '#FFD0B0'],
      ['gMint', '#BFEBD8'],
    ].map(([id, c]) => (
      <radialGradient key={id} id={id}>
        <stop offset="0" stopColor={c} stopOpacity="1" />
        <stop offset="0.45" stopColor={c} stopOpacity="0.5" />
        <stop offset="1" stopColor={c} stopOpacity="0" />
      </radialGradient>
    ))}
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#000" stopOpacity="0" />
      <stop offset="0.55" stopColor="#000" stopOpacity="0" />
      <stop offset="1" stopColor="#12060f" stopOpacity="0.55" />
    </linearGradient>
  </defs>
);

const Glow: React.FC<{x: number; y: number; r: number; g?: string; o?: number}> = ({x, y, r, g = 'gGold', o = 1}) => (
  <circle cx={x} cy={y} r={r} fill={`url(#${g})`} opacity={o} />
);

const Bokeh: React.FC<{t: number; n: number; seed: number; y0?: number; y1?: number; rise?: number; o?: number; grads?: string[]}> = ({
  t,
  n,
  seed,
  y0 = 250,
  y1 = 1500,
  rise = 30,
  o = 0.8,
  grads = ['gGold', 'gPink', 'gWhite', 'gLav'],
}) => {
  const r = rnd(seed);
  const items = Array.from({length: n}, () => ({x: r() * 1080, y: y0 + r() * (y1 - y0), s: 18 + r() * 60, sp: 0.4 + r(), ph: r() * 6.28, g: grads[Math.floor(r() * grads.length)]}));
  return (
    <g>
      {items.map((b, i) => {
        const yy = b.y - ((t * rise * b.sp) % (y1 - y0 + 200));
        const y = yy < y0 - 100 ? yy + (y1 - y0 + 200) : yy;
        return <Glow key={i} x={b.x + Math.sin(t * b.sp + b.ph) * 24} y={y} r={b.s} g={b.g} o={o * (0.55 + 0.45 * Math.sin(t * 2 * b.sp + b.ph))} />;
      })}
    </g>
  );
};

const Heart: React.FC<{x: number; y: number; s: number; fill?: string; o?: number; rot?: number}> = ({x, y, s, fill = PINK, o = 1, rot = 0}) => (
  <path
    transform={`translate(${x} ${y}) rotate(${rot}) scale(${s / 100})`}
    d="M0 30 C -10 10 -50 0 -50 -25 C -50 -50 -15 -60 0 -35 C 15 -60 50 -50 50 -25 C 50 0 10 10 0 30 Z"
    fill={fill}
    opacity={o}
  />
);

const Sparkle: React.FC<{x: number; y: number; s: number; o?: number; c?: string}> = ({x, y, s, o = 1, c = '#FFF6D8'}) => (
  <path transform={`translate(${x} ${y}) scale(${s / 20})`} d="M0 -20 Q2 -2 20 0 Q2 2 0 20 Q-2 2 -20 0 Q-2 -2 0 -20Z" fill={c} opacity={o} />
);

// Personajes inventados: "él" (rizos oscuros, suéter azul) y "ella" (pelo largo cobrizo, abrigo rosa).
type PP = {
  x: number;
  y: number;
  s?: number;
  who: 'el' | 'ella';
  walk?: number; // fase de paso (radianes); amp controla amplitud
  amp?: number;
  armL?: number; // grados, 0 = colgando, positivo = hacia afuera/arriba
  armR?: number;
  tilt?: number; // inclinación de cabeza
  lean?: number; // inclinación del cuerpo
  old?: number; // 0..1 pelo canoso
  sil?: boolean; // silueta
  back?: boolean; // de espaldas
};
const Person: React.FC<PP> = ({x, y, s = 1, who, walk = 0, amp = 0, armL = 0, armR = 0, tilt = 0, lean = 0, old = 0, sil = false, back = false}) => {
  const el = who === 'el';
  const skin = sil ? SIL : el ? '#C68B66' : '#E7B596';
  const hair0 = el ? '#2A1A1F' : '#7B3A2C';
  const hair = sil ? SIL : mixC(hair0, '#ECE6E4', old);
  const top = sil ? SIL : el ? '#6F86B8' : '#E98FA8';
  const pants = sil ? SIL : el ? '#EFE3D3' : '#8A5A7A';
  const shoe = sil ? SIL : '#3B2430';
  const rim = sil ? {stroke: '#FFD58A', strokeWidth: 3, strokeOpacity: 0.75} : {};
  const sw = Math.sin(walk) * amp;
  const bob = Math.abs(Math.cos(walk)) * amp * 0.25;
  return (
    <g transform={`translate(${x} ${y - bob}) scale(${s}) rotate(${lean})`}>
      {/* piernas */}
      <g transform={`rotate(${sw * 22} -18 -125)`}>
        <rect x={-32} y={-130} width={28} height={125} rx={13} fill={pants} {...rim} />
        <ellipse cx={-20} cy={-4} rx={22} ry={10} fill={shoe} />
      </g>
      <g transform={`rotate(${-sw * 22} 18 -125)`}>
        <rect x={4} y={-130} width={28} height={125} rx={13} fill={pants} {...rim} />
        <ellipse cx={20} cy={-4} rx={22} ry={10} fill={shoe} />
      </g>
      {/* pelo largo detrás (ella) */}
      {!el && <path d="M-50 -330 Q-62 -230 -46 -190 L46 -190 Q62 -230 50 -330 Z" fill={hair} {...rim} />}
      {/* brazos */}
      <g transform={`rotate(${armL - sw * 14} -54 -250)`}>
        <rect x={-68} y={-258} width={26} height={128} rx={13} fill={top} {...rim} />
        <circle cx={-55} cy={-128} r={14} fill={skin} />
      </g>
      <g transform={`rotate(${-armR + sw * 14} 54 -250)`}>
        <rect x={42} y={-258} width={26} height={128} rx={13} fill={top} {...rim} />
        <circle cx={55} cy={-128} r={14} fill={skin} />
      </g>
      {/* torso */}
      {el ? (
        <path d="M-58 -248 Q-60 -262 -40 -266 L40 -266 Q60 -262 58 -248 L54 -118 L-54 -118 Z" fill={top} {...rim} />
      ) : (
        <path d="M-50 -250 Q-52 -264 -34 -266 L34 -266 Q52 -264 50 -250 L66 -112 L-66 -112 Z" fill={top} {...rim} />
      )}
      {!sil && el && <path d="M-26 -266 Q0 -246 26 -266" stroke="#5A6E9E" strokeWidth={6} fill="none" />}
      {!sil && !el && <rect x={-4} y={-250} width={8} height={130} fill="#D97C97" />}
      {/* cuello y cabeza */}
      <rect x={-12} y={-292} width={24} height={30} fill={skin} />
      <g transform={`rotate(${tilt} 0 -300)`}>
        <circle cx={0} cy={-318} r={44} fill={back ? hair : skin} {...rim} />
        {el ? (
          <g fill={hair}>
            {[-38, -22, -4, 14, 30, 40].map((dx, i) => (
              <circle key={i} cx={dx} cy={-352 + (i % 2) * 6} r={20} />
            ))}
            <circle cx={-42} cy={-330} r={14} />
            <circle cx={42} cy={-332} r={14} />
          </g>
        ) : (
          <g>
            <path d="M-46 -318 Q-50 -372 0 -366 Q50 -372 46 -318 Q30 -346 0 -342 Q-30 -346 -46 -318Z" fill={hair} />
            {!sil && <circle cx={30} cy={-350} r={7} fill={GOLD} />}
          </g>
        )}
      </g>
    </g>
  );
};

// Teléfono genérico (sin marca)
const Phone: React.FC<{x: number; y: number; w: number; h: number; rot?: number; glow?: number; children?: React.ReactNode; id: string}> = ({x, y, w, h, rot = 0, glow = 1, children, id}) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
    <Glow x={x + w / 2} y={y + h / 2} r={Math.max(w, h) * 0.9} g="gWhite" o={0.35 * glow} />
    <rect x={x - 12} y={y - 12} width={w + 24} height={h + 24} rx={Math.min(w, h) * 0.14} fill="#24161F" />
    <clipPath id={id}>
      <rect x={x} y={y} width={w} height={h} rx={Math.min(w, h) * 0.1} />
    </clipPath>
    <g clipPath={`url(#${id})`}>{children}</g>
    <rect x={x + w / 2 - w * 0.12} y={y + 10} width={w * 0.24} height={Math.max(8, w * 0.035)} rx={6} fill="#24161F" />
  </g>
);

// Burbuja de texto sin texto legible (solo líneas)
const Bubble: React.FC<{x: number; y: number; w: number; h: number; c: string; lines?: number; lc?: string; o?: number}> = ({x, y, w, h, c, lines = 2, lc = 'rgba(0,0,0,0.18)', o = 1}) => (
  <g opacity={o}>
    <rect x={x} y={y} width={w} height={h} rx={h * 0.35} fill={c} />
    {Array.from({length: lines}, (_, i) => (
      <rect key={i} x={x + 18} y={y + 16 + i * 18} width={(w - 36) * (i === lines - 1 ? 0.6 : 1)} height={9} rx={4.5} fill={lc} />
    ))}
  </g>
);

const Floor: React.FC<{y: number; c1: string; c2: string}> = ({y, c1, c2}) => {
  const id = `fl${y}${c1}${c2}`.replace(/[^a-zA-Z0-9]/g, '');
  return (
  <g>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={c1} />
        <stop offset="1" stopColor={c2} />
      </linearGradient>
    </defs>
    <rect x={-400} y={y} width={1880} height={2000 - y + 600} fill={`url(#${id})`} />
  </g>
  );
};

const Sky: React.FC<{id: string; stops: [number, string][]; x?: number; y?: number; w?: number; h?: number}> = ({id, stops, x = -400, y = -400, w = 1880, h = 2800}) => (
  <g>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        {stops.map(([o, c], i) => (
          <stop key={i} offset={o} stopColor={c} />
        ))}
      </linearGradient>
    </defs>
    <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
  </g>
);

const StringLights: React.FC<{t: number; x0: number; x1: number; y: number; sag: number; n: number}> = ({t, x0, x1, y, sag, n}) => {
  const pts = Array.from({length: n}, (_, i) => {
    const k = i / (n - 1);
    return {x: mix(x0, x1, k), y: y + Math.sin(k * Math.PI) * sag};
  });
  return (
    <g>
      <path d={`M${x0} ${y} Q${(x0 + x1) / 2} ${y + sag * 2} ${x1} ${y}`} stroke="#5B3A48" strokeWidth={3} fill="none" />
      {pts.map((p, i) => (
        <g key={i}>
          <Glow x={p.x} y={p.y + 8} r={30} g="gGold" o={0.55 + 0.45 * Math.sin(t * 3 + i * 1.7)} />
          <circle cx={p.x} cy={p.y + 8} r={6} fill="#FFE9B0" />
        </g>
      ))}
    </g>
  );
};

// ---------- ESCENAS ----------
type SP = {t: number; d: number};

// 1. Gancho: dos siluetas se acercan, el celular se enciende
const SHook: React.FC<SP> = ({t, d}) => {
  const k = t / d;
  const z = 1.16 + 0.16 * ease(k);
  const rot = -4 + 4 * ease(k);
  const on = eBack(lin(t, 0.25, 0.7));
  return (
    <g transform={cam(z, rot, 40 - 40 * ease(k), 0, 540, 900)}>
      <Sky id="hookSky" stops={[[0, '#5B3E6E'], [0.35, '#B9708F'], [0.6, '#E8A49A'], [1, '#3A1C30']]} />
      {/* ventana en arco */}
      <path d="M300 900 L300 560 A240 240 0 0 1 780 560 L780 900 Z" fill="#2F1A2C" />
      <clipPath id="hookWin">
        <path d="M318 890 L318 562 A222 222 0 0 1 762 562 L762 890 Z" />
      </clipPath>
      <g clipPath="url(#hookWin)">
        <Sky id="hookWinSky" stops={[[0, '#F4A6B5'], [0.55, '#F7C3A1'], [1, '#FCE1B5']]} x={300} y={300} w={480} h={620} />
        <circle cx={540} cy={800 - t * 18} r={90} fill="#FFE2A0" />
        <Glow x={540} y={800 - t * 18} r={240} g="gGold" o={0.8} />
        <path d="M300 900 L300 820 L380 790 L420 820 L470 780 L540 830 L620 790 L700 815 L780 780 L780 900 Z" fill="#C77C8E" opacity={0.7} />
      </g>
      <rect x={532} y={340} width={16} height={560} fill="#2F1A2C" />
      <rect x={300} y={706} width={480} height={14} fill="#2F1A2C" />
      <StringLights t={t} x0={60} x1={1020} y={330} sag={70} n={14} />
      <Floor y={1000} c1="#6B3550" c2={PLUM} />
      {/* mesa y celular */}
      <ellipse cx={540} cy={1040} rx={160} ry={30} fill="#8E5468" />
      <rect x={528} y={1050} width={24} height={150} fill="#6E3D50" />
      <ellipse cx={540} cy={1200} rx={70} ry={12} fill="#4A2236" />
      <g>
        <Glow x={540} y={1028} r={220 * on} g="gWhite" o={0.8} />
        <path d="M498 1036 L582 1036 L594 1020 L510 1020 Z" fill={mixC('#2A1A22', '#FFF4E4', on)} />
        <g transform={`translate(540 ${960 - 30 * on}) scale(${on})`}>
          <rect x={-80} y={-34} width={160} height={60} rx={22} fill="#FFF4E4" />
          <path d="M-12 26 L0 42 L12 26 Z" fill="#FFF4E4" />
          <Heart x={-44} y={-4} s={34} fill={ROSE} />
          <rect x={-18} y={-14} width={80} height={9} rx={4} fill="#E2C8C0" />
          <rect x={-18} y={2} width={52} height={9} rx={4} fill="#E2C8C0" />
        </g>
      </g>
      {/* siluetas que se acercan */}
      <Person who="el" sil x={mix(170, 360, ease(k * 0.95))} y={1150} s={1.15} walk={t * 7} amp={1 - k * 0.6} armR={10} />
      <Person who="ella" sil x={mix(920, 720, ease(k * 0.95))} y={1150} s={1.08} walk={t * 7 + 1} amp={1 - k * 0.6} armL={10} />
      <Bokeh t={t} n={20} seed={11} rise={40} />
    </g>
  );
};

// 2. El mensaje: vista cenital de la mesa que gira, luego él sonriendo con el celular
const SMensaje: React.FC<SP> = ({t, d}) => {
  const cut = 2.3;
  if (t < cut) {
    const k = t / cut;
    const notif = eBack(lin(t, 0.2, 0.7));
    const hand = ease(lin(t, 1.1, 2.1));
    return (
      <g transform={cam(1.02 + 0.14 * k, 12 * k, 0, 0, 540, 760)}>
        <rect x={-400} y={-400} width={1880} height={2800} fill="#5A2B3D" />
        <circle cx={540} cy={760} r={620} fill="#C98A6A" />
        {[540, 470, 380, 280, 170].map((r, i) => (
          <circle key={i} cx={540} cy={760} r={r} fill="none" stroke="#B57A5C" strokeWidth={4} opacity={0.6} />
        ))}
        <circle cx={250} cy={520} r={70} fill="#F4E6D8" />
        <circle cx={250} cy={520} r={52} fill="#8A5238" />
        <g transform="translate(820 1020)">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={0} cy={-40} rx={22} ry={48} fill="#8FBF9F" transform={`rotate(${a + t * 8})`} />
          ))}
          <circle r={26} fill="#E58A6B" />
        </g>
        <Phone id="mPh" x={390} y={480} w={300} h={560} rot={8} glow={0.4 + notif}>
          <rect x={390} y={480} width={300} height={560} fill={mixC('#2B1D26', '#F7E3E4', notif)} />
          <g transform={`translate(0 ${-120 + 120 * notif})`} opacity={notif}>
            <rect x={406} y={540} width={268} height={92} rx={24} fill="#FFFFFF" />
            <circle cx={446} cy={586} r={24} fill={PINK} />
            <Heart x={446} y={588} s={22} fill="#fff" />
            <rect x={482} y={566} width={160} height={11} rx={5} fill="#DCC6CC" />
            <rect x={482} y={590} width={110} height={11} rx={5} fill="#EAD9DC" />
          </g>
          <circle cx={540} cy={850} r={60 + 10 * Math.sin(t * 6)} fill={PINK} opacity={0.25 * notif} />
          <Heart x={540} y={850} s={70} fill={ROSE} o={notif} />
        </Phone>
        {/* mano de él que entra */}
        <g transform={`translate(${mix(1200, 720, hand)} ${mix(1400, 1040, hand)}) rotate(-35)`}>
          <rect x={-60} y={0} width={120} height={500} rx={50} fill="#6F86B8" />
          <ellipse cx={0} cy={-10} rx={62} ry={70} fill="#C68B66" />
          <rect x={-58} y={-70} width={22} height={60} rx={11} fill="#C68B66" />
        </g>
        <Bokeh t={t} n={8} seed={21} o={0.5} />
      </g>
    );
  }
  const tt = t - cut;
  const dd = d - cut;
  const k = tt / dd;
  const flash = 1 - lin(tt, 0, 0.35);
  return (
    <g>
      <g transform={cam(1.12 - 0.1 * ease(k), 0, 0, -90 + 90 * ease(k), 540, 820)}>
        <Sky id="mRoom" stops={[[0, '#E7A6B6'], [0.6, '#F3C6B2'], [1, '#F6D2B8']]} />
        <rect x={600} y={330} width={380} height={520} rx={20} fill="#7B4A62" />
        <Sky id="mWin" stops={[[0, '#F59DAF'], [1, '#FFD9A6']]} x={620} y={350} w={340} h={480} />
        <circle cx={790} cy={700} r={60} fill="#FFE7B0" />
        <rect x={784} y={350} width={12} height={480} fill="#7B4A62" />
        <Floor y={1000} c1="#9A5A72" c2={PLUM} />
        <rect x={140} y={900} width={600} height={130} rx={40} fill="#C9798F" />
        <rect x={160} y={870} width={160} height={70} rx={30} fill="#F2D3C8" />
        <Person who="el" x={440} y={1120} s={1.2} armL={-28} armR={-34} tilt={-6 + 5 * Math.sin(tt * 3)} />
        <g transform="translate(440 820)">
          <rect x={-40} y={-60} width={80} height={130} rx={14} fill="#24161F" />
          <rect x={-33} y={-52} width={66} height={114} rx={9} fill="#FFF1EA" />
          <Glow x={0} y={0} r={200} g="gWhite" o={0.6} />
        </g>
        {Array.from({length: 7}, (_, i) => {
          const p = (tt * 0.5 + i / 7) % 1;
          return <Heart key={i} x={440 + Math.sin(p * 9 + i) * 70} y={760 - p * 420} s={26 + (i % 3) * 10} fill={i % 2 ? PINK : GOLD} o={Math.sin(p * Math.PI)} />;
        })}
        <Bokeh t={tt} n={14} seed={33} />
      </g>
      <rect x={0} y={0} width={1080} height={1920} fill="#FFF6EA" opacity={flash * 0.8} />
    </g>
  );
};

// 3. Videollamada: pantalla dividida, ambos riendo
const SVideo: React.FC<SP> = ({t, d}) => {
  const k = t / d;
  const sway = Math.sin(t * 2.2);
  const laugh = Math.abs(Math.sin(t * 7)) * 6;
  const PX = 320;
  const PY = 360;
  const PW = 440;
  const PH = 760;
  return (
    <g transform={cam(1.0 + 0.05 * k, -2 + 4 * ease(k), 30 - 60 * ease(k), 0, 540, 760)}>
      <Sky id="vNight" stops={[[0, '#2A2450'], [0.6, '#5B3D6E'], [1, '#2B1626']]} />
      <circle cx={880} cy={300} r={70} fill="#FFF1D0" />
      <Glow x={880} y={300} r={220} g="gGold" o={0.4} />
      {Array.from({length: 26}, (_, i) => {
        const r = rnd(70 + i);
        return <Sparkle key={i} x={r() * 1080} y={200 + r() * 900} s={6 + r() * 8} o={0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))} />;
      })}
      <Floor y={1240} c1="#4A2840" c2="#1E0E1A" />
      <g transform={`rotate(${sway * 2.5} 540 740) translate(0 ${Math.sin(t * 1.6) * 10})`}>
        <Phone id="vPh" x={PX} y={PY} w={PW} h={PH}>
          {/* mitad de él */}
          <rect x={PX} y={PY} width={PW} height={PH / 2} fill="#AFC0E8" />
          <rect x={PX + 300} y={PY + 40} width={110} height={140} rx={10} fill="#7F93C9" />
          <circle cx={PX + 355} cy={PY + 100} r={26} fill="#FFF3D6" />
          <Glow x={PX + 80} y={PY + 120} r={110} g="gGold" o={0.8} />
          <g clipPath="url(#vPh)">
            <Person who="el" x={PX + 210} y={PY + PH / 2 + 250} s={0.95} tilt={sway * 8} lean={sway * 2} />
          </g>
          {/* mitad de ella */}
          <rect x={PX} y={PY + PH / 2} width={PW} height={PH / 2} fill="#F7C1CF" />
          <StringLights t={t} x0={PX} x1={PX + PW} y={PY + PH / 2 + 30} sag={18} n={7} />
          <Person who="ella" x={PX + 230} y={PY + PH + 250 - laugh} s={0.95} tilt={-sway * 8 - 4} lean={-sway * 2} />
          <rect x={PX} y={PY + PH / 2 - 3} width={PW} height={6} fill="#FFFFFF" opacity={0.85} />
          {/* botones genéricos */}
          <circle cx={PX + PW / 2 - 70} cy={PY + PH - 60} r={30} fill="rgba(255,255,255,0.7)" />
          <circle cx={PX + PW / 2} cy={PY + PH - 60} r={34} fill="#E0566A" />
          <rect x={PX + PW / 2 - 16} y={PY + PH - 64} width={32} height={9} rx={4} fill="#fff" />
          <circle cx={PX + PW / 2 + 70} cy={PY + PH - 60} r={30} fill="rgba(255,255,255,0.7)" />
        </Phone>
      </g>
      {Array.from({length: 8}, (_, i) => {
        const p = (t * 0.45 + i / 8) % 1;
        const side = i % 2 ? 1 : -1;
        return <Heart key={i} x={540 + side * (280 + Math.sin(p * 7 + i) * 30)} y={1000 - p * 650} s={24 + (i % 3) * 10} fill={i % 3 ? PINK : GOLD} o={Math.sin(p * Math.PI) * 0.9} />;
      })}
    </g>
  );
};

// 4. Magia: al tocarse, los colores se mezclan, las luces flotan y el mundo gira
const SMagia: React.FC<SP> = ({t, d}) => {
  const k = t / d;
  const touch = ease(lin(t, 0.2, 1.0));
  const burst = lin(t, 0.9, 2.2);
  const colorOn = ease(lin(t, 0.8, 1.8));
  const blobs = [
    ['gPink', 0, 420, 420],
    ['gGold', 72, 380, 380],
    ['gLav', 144, 420, 460],
    ['gPeach', 216, 360, 400],
    ['gMint', 288, 400, 340],
  ] as const;
  return (
    <g transform={cam(1.28 - 0.26 * ease(k), 3 - 6 * ease(k), 0, 0, 540, 860)}>
      <Sky id="mgBase" stops={[[0, '#F6CFD6'], [0.5, '#F9DCC6'], [1, '#E4C4E6']]} />
      <g opacity={colorOn} style={{mixBlendMode: 'multiply'}}>
        <g transform={`rotate(${t * 26} 540 760)`}>
          {blobs.map(([g, a, r, dist], i) => (
            <circle key={i} cx={540 + Math.cos(((a as number) * Math.PI) / 180) * (dist as number) * 0.7} cy={760 + Math.sin(((a as number) * Math.PI) / 180) * (dist as number) * 0.7} r={(r as number) * 1.3} fill={`url(#${g})`} />
          ))}
        </g>
        <g transform={`rotate(${-t * 18} 540 760)`}>
          {blobs.map(([g, a, r], i) => (
            <circle key={i} cx={540 + Math.cos((((a as number) + 36) * Math.PI) / 180) * 300} cy={760 + Math.sin((((a as number) + 36) * Math.PI) / 180) * 300} r={(r as number) * 0.9} fill={`url(#${g})`} />
          ))}
        </g>
      </g>
      {/* el mundo gira alrededor: casitas, árboles y estrellas en un anillo */}
      <g transform={`rotate(${t * 14} 540 980)`} opacity={0.85}>
        {Array.from({length: 14}, (_, i) => {
          const a = (i / 14) * 360;
          const type = i % 3;
          return (
            <g key={i} transform={`rotate(${a} 540 980) translate(540 ${980 - 640})`}>
              {type === 0 && (
                <g>
                  <rect x={-34} y={-50} width={68} height={56} fill="#F3B3C4" />
                  <path d="M-44 -48 L0 -92 L44 -48 Z" fill="#C97894" />
                  <rect x={-10} y={-26} width={20} height={32} fill="#FFE3A3" />
                </g>
              )}
              {type === 1 && (
                <g>
                  <rect x={-6} y={-40} width={12} height={46} fill="#9A6A70" />
                  <circle cx={0} cy={-62} r={38} fill="#9FCFB2" />
                </g>
              )}
              {type === 2 && <Sparkle x={0} y={-40} s={30} c="#FFE7A8" />}
            </g>
          );
        })}
      </g>
      <ellipse cx={540} cy={1170} rx={300} ry={50} fill="#E7A9BF" opacity={0.9} />
      <Person who="el" x={mix(400, 450, touch)} y={1160} s={1.2} armR={mix(10, 62, touch)} tilt={4} />
      <Person who="ella" x={mix(680, 630, touch)} y={1160} s={1.15} armL={mix(10, 62, touch)} tilt={-4} />
      {/* destello en las manos */}
      <Glow x={540} y={850} r={60 + 400 * eOut(burst)} g="gWhite" o={(1 - burst) * 0.9 * touch} />
      <circle cx={540} cy={850} r={40 + 520 * eOut(burst)} fill="none" stroke="#FFE9B5" strokeWidth={8 * (1 - burst)} opacity={1 - burst} />
      {Array.from({length: 26}, (_, i) => {
        const r = rnd(400 + i);
        const p = (t * (0.18 + r() * 0.2) + r()) % 1;
        return <Glow key={i} x={540 + (r() - 0.5) * 900 + Math.sin(t + i) * 30} y={1250 - p * 1000} r={14 + r() * 34} g={['gGold', 'gPink', 'gLav', 'gWhite'][i % 4]} o={Math.sin(p * Math.PI) * colorOn} />;
      })}
    </g>
  );
};

// Set compartido por "errores" y "abrazo" (misma habitación, cambia la luz)
const Room56: React.FC<{t: number; warm: number}> = ({t, warm}) => (
  <g>
    <Sky id={`r56${Math.round(warm * 10)}`} stops={[[0, mixC('#8C86A6', '#F6B8C4', warm)], [0.6, mixC('#A79DB4', '#FAD3B8', warm)], [1, mixC('#6E6683', '#E7A6A8', warm)]]} />
    <g opacity={warm}>
      {Array.from({length: 12}, (_, i) => (
        <path key={i} d={`M540 700 L${540 + Math.cos((i / 12) * 6.28 + t * 0.2) * 1400} ${700 + Math.sin((i / 12) * 6.28 + t * 0.2) * 1400} L${540 + Math.cos((i / 12) * 6.28 + 0.18 + t * 0.2) * 1400} ${700 + Math.sin((i / 12) * 6.28 + 0.18 + t * 0.2) * 1400} Z`} fill="#FFF1C9" opacity={0.25} />
      ))}
      <Glow x={540} y={700} r={600} g="gGold" o={0.7} />
    </g>
    <Floor y={1080} c1={mixC('#5E566F', '#B8687F', warm)} c2={mixC('#2A2433', PLUM, warm)} />
  </g>
);

// 5. Errores: una nube gris sobre él, papeles arrugados, un ovillo enredado
const SErrores: React.FC<SP> = ({t, d}) => {
  const k = t / d;
  const head = ease(lin(t, 0.6, 1.4));
  return (
    <g transform={cam(1.08, 0, 70 - 110 * ease(k), 0, 540, 900)}>
      <Room56 t={t} warm={0} />
      {/* papeles arrugados */}
      {[
        [250, 1180],
        [330, 1240],
        [780, 1200],
        [860, 1260],
        [700, 1290],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${i * 50})`}>
          <path d="M-26 -10 L-8 -28 L20 -22 L28 2 L12 26 L-18 22 Z" fill="#E9E3EC" />
          <path d="M-12 -14 L6 4 M0 -20 L-6 12 M10 -8 L18 10" stroke="#B9AFC2" strokeWidth={3} fill="none" />
        </g>
      ))}
      {/* ovillo que se enreda y rueda */}
      <path d={`M${560 - 0} 1150 C 640 1240, ${700 + t * 40} 1150, ${760 + t * 60} 1230`} stroke={ROSE} strokeWidth={5} fill="none" />
      <g transform={`translate(${760 + t * 60} 1230) rotate(${t * 200})`}>
        <circle r={30} fill={ROSE} />
        <path d="M-24 -10 Q0 10 24 -12 M-22 12 Q0 -8 22 14 M-6 -28 Q8 0 -4 28" stroke="#B4506E" strokeWidth={4} fill="none" />
      </g>
      <Person who="el" x={540} y={1160} s={1.25} armR={mix(-6, 150, head)} armL={-6} tilt={mix(0, 12, head)} lean={mix(0, 3, head)} />
      {/* nube con lluvia */}
      <g transform={`translate(${540 + Math.sin(t * 1.5) * 12} ${650 + Math.sin(t * 2) * 6})`}>
        {Array.from({length: 14}, (_, i) => {
          const p = (t * 1.6 + i / 14) % 1;
          return <rect key={i} x={-110 + (i * 17) % 220} y={30 + p * 200} width={5} height={24} rx={2} fill="#9FB1D6" opacity={1 - p} />;
        })}
        <circle cx={-70} cy={0} r={52} fill="#8D8AA0" />
        <circle cx={0} cy={-26} r={70} fill="#8D8AA0" />
        <circle cx={74} cy={4} r={50} fill="#8D8AA0" />
        <rect x={-120} y={0} width={244} height={50} rx={25} fill="#8D8AA0" />
      </g>
    </g>
  );
};

// 6. Ella llega, cubre la nube con un paraguas, la nube se vuelve luz y lo abraza
const SAbrazo: React.FC<SP> = ({t, d}) => {
  const k = t / d;
  const walkIn = ease(lin(t, 0, 1.3));
  const melt = ease(lin(t, 1.2, 2.2));
  const hug = ease(lin(t, 2.4, 3.2));
  const warm = ease(lin(t, 1.0, 2.6));
  const herX = mix(1080, 690, walkIn) - 60 * hug;
  return (
    <g transform={cam(1.08 + 0.14 * ease(k), 0, -40 + 40 * ease(k), -60 * ease(k), 540, 900)}>
      <Room56 t={t} warm={warm} />
      <Person who="el" x={540 + 30 * hug} y={1160} s={1.25} armR={mix(150, 70, melt) - 40 * hug} armL={-6 + 50 * hug} tilt={mix(12, -6, melt)} />
      <Person who="ella" x={herX} y={1160} s={1.18} walk={t * 7} amp={1 - walkIn} armL={mix(150, 60, hug)} armR={mix(10, 60, hug)} tilt={-8 * hug} />
      {/* paraguas rosa */}
      <g transform={`translate(${herX - 70 + 40 * hug} ${mix(660, 640, walkIn) - 140 * hug}) rotate(${mix(-12, -4, walkIn)})`} opacity={1 - hug * 0.9}>
        <path d="M-200 0 Q-200 -150 0 -160 Q200 -150 200 0 Q150 -30 100 0 Q50 -30 0 0 Q-50 -30 -100 0 Q-150 -30 -200 0Z" fill={PINK} />
        <path d="M0 -160 Q-60 -80 -100 0 M0 -160 Q60 -80 100 0 M0 -160 L0 0" stroke={ROSE} strokeWidth={4} fill="none" />
        <rect x={-4} y={0} width={8} height={190} fill="#6E3D50" />
      </g>
      {/* nube que se convierte en destellos */}
      <g transform={`translate(540 ${650 - 60 * melt}) scale(${1 - 0.7 * melt})`} opacity={1 - melt}>
        <circle cx={-70} cy={0} r={52} fill="#8D8AA0" />
        <circle cx={0} cy={-26} r={70} fill="#8D8AA0" />
        <circle cx={74} cy={4} r={50} fill="#8D8AA0" />
        <rect x={-120} y={0} width={244} height={50} rx={25} fill="#8D8AA0" />
      </g>
      {Array.from({length: 16}, (_, i) => {
        const a = (i / 16) * 6.28;
        const p = melt;
        return <Sparkle key={i} x={540 + Math.cos(a) * 260 * p} y={640 + Math.sin(a) * 200 * p - 80 * p} s={18 + (i % 3) * 8} o={Math.sin(p * Math.PI)} c="#FFE9B0" />;
      })}
      {Array.from({length: 6}, (_, i) => {
        const p = clamp((t - 2.6 - i * 0.18) / 1.4);
        return <Heart key={i} x={560 + (i - 2.5) * 50 + Math.sin(p * 6 + i) * 20} y={700 - p * 300} s={30 + (i % 2) * 14} fill={i % 2 ? PINK : GOLD} o={Math.sin(p * Math.PI)} />;
      })}
    </g>
  );
};

// 7. Live: ella feliz en una transmisión, corazones flotando; los lujos se desvanecen
const SLive: React.FC<SP> = ({t, d}) => {
  const k = t / d;
  const PX = 330;
  const PY = 380;
  const PW = 420;
  const PH = 740;
  const lux = ease(lin(t, 2.2, 3.0)) * (1 - ease(lin(t, 3.8, 4.8)));
  const kiss = ease(lin(t, 3.9, 4.9));
  const wave = Math.sin(t * 6) * 30;
  return (
    <g transform={cam(1.0 + 0.06 * ease(k), 2 - 3 * ease(k), 0, 0, 540, 760)}>
      <Sky id="lvBg" stops={[[0, '#C792B8'], [0.5, '#F0B0B8'], [1, '#5A2B44']]} />
      <Bokeh t={t} n={16} seed={77} o={0.6} />
      <Floor y={1300} c1="#5A2B44" c2="#24101E" />
      {/* lujos que no le importan */}
      <g opacity={lux}>
        {[
          [170, 520, 'diam'],
          [900, 560, 'crown'],
          [150, 960, 'coins'],
          [920, 980, 'car'],
          [540, 290, 'watch'],
        ].map(([x, y, type], i) => {
          const fall = lin(t, 3.8, 4.8) * 160;
          return (
            <g key={i} transform={`translate(${x} ${(y as number) + Math.sin(t * 2 + i) * 10 + fall}) scale(${0.7 + 0.3 * lux})`}>
              <Glow x={0} y={0} r={110} g="gGold" o={0.6} />
              {type === 'diam' && <path d="M-50 -20 L-25 -50 L25 -50 L50 -20 L0 50 Z" fill="#BFE6F2" stroke="#E9C46A" strokeWidth={4} />}
              {type === 'crown' && <path d="M-55 30 L-55 -30 L-28 0 L0 -45 L28 0 L55 -30 L55 30 Z" fill={GOLD} />}
              {type === 'coins' && (
                <g>
                  {[0, 1, 2, 3].map((j) => (
                    <ellipse key={j} cx={0} cy={30 - j * 18} rx={48} ry={16} fill={j % 2 ? '#F5C85A' : '#E3AC3A'} />
                  ))}
                </g>
              )}
              {type === 'car' && (
                <g>
                  <path d="M-70 20 L-70 0 L-40 -10 L-20 -32 L30 -32 L50 -10 L70 -4 L70 20 Z" fill={GOLD} />
                  <circle cx={-40} cy={22} r={14} fill="#6E3D50" />
                  <circle cx={40} cy={22} r={14} fill="#6E3D50" />
                </g>
              )}
              {type === 'watch' && (
                <g>
                  <rect x={-16} y={-60} width={32} height={120} rx={10} fill="#E3AC3A" />
                  <circle r={36} fill={GOLD} />
                  <circle r={26} fill="#FFF3D6" />
                </g>
              )}
            </g>
          );
        })}
      </g>
      {/* manos de él sosteniendo el celular */}
      <rect x={180} y={1020} width={150} height={520} rx={60} fill="#6F86B8" transform="rotate(20 255 1020)" />
      <rect x={750} y={1020} width={150} height={520} rx={60} fill="#6F86B8" transform="rotate(-20 825 1020)" />
      <Phone id="lvPh" x={PX} y={PY} w={PW} h={PH}>
        <Sky id="lvScr" stops={[[0, '#FBD3DC'], [1, '#F2AFC2']]} x={PX} y={PY} w={PW} h={PH} />
        <circle cx={PX + PW / 2} cy={PY + 300} r={150} fill="none" stroke="#FFFFFF" strokeWidth={14} opacity={0.8} />
        <Glow x={PX + PW / 2} y={PY + 300} r={240} g="gWhite" o={0.5} />
        <Person who="ella" x={PX + PW / 2 + Math.sin(t * 2.4) * 10} y={PY + PH + 40} s={1.05} armR={110 + wave} armL={10} tilt={Math.sin(t * 2.4) * 8} lean={Math.sin(t * 2.4) * 3} />
        {/* indicador genérico de en vivo */}
        <rect x={PX + 22} y={PY + 30} width={112} height={44} rx={22} fill="#E33B55" />
        <circle cx={PX + 46} cy={PY + 52} r={9} fill="#fff" opacity={0.6 + 0.4 * Math.sin(t * 8)} />
        <text x={PX + 62} y={PY + 63} fontFamily="Montserrat, sans-serif" fontWeight={800} fontSize={26} fill="#fff">
          LIVE
        </text>
        {/* comentarios sin texto */}
        {Array.from({length: 6}, (_, i) => {
          const p = (t * 0.35 + i / 6) % 1;
          return (
            <g key={i} opacity={Math.sin(p * Math.PI)}>
              <circle cx={PX + 40} cy={PY + PH - 60 - p * 260} r={16} fill={[PINK, LAV, GOLD, PEACH][i % 4]} />
              <rect x={PX + 64} y={PY + PH - 76 - p * 260} width={120 + (i % 3) * 40} height={32} rx={16} fill="rgba(255,255,255,0.75)" />
            </g>
          );
        })}
        {/* corazones flotando */}
        {Array.from({length: 12}, (_, i) => {
          const p = (t * 0.6 + i / 12) % 1;
          return <Heart key={i} x={PX + PW - 60 + Math.sin(p * 8 + i) * 26} y={PY + PH - 80 - p * 560} s={30 + (i % 3) * 10} fill={['#FF5C7A', PINK, GOLD][i % 3]} o={Math.sin(p * Math.PI)} />;
        })}
      </Phone>
      {/* el beso: un corazón grande que sube */}
      <g opacity={kiss} transform={`translate(540 ${560 - 60 * kiss}) scale(${0.4 + 0.6 * eBack(kiss)})`}>
        <Glow x={0} y={0} r={260} g="gPink" o={0.8} />
        <Heart x={0} y={0} s={200} fill="#FF6F8E" />
        <Sparkle x={70} y={-60} s={24} />
      </g>
    </g>
  );
};

// 8. Miedo: noche, él escribe y borra
const SMiedo: React.FC<SP> = ({t, d}) => {
  const zin = ease(lin(t, 0.4, 1.6));
  const typed = Math.floor(clamp((t - 1.4) / 0.9) * 9);
  const del = Math.floor(clamp((t - 2.9) / 0.7) * 9);
  const shown = Math.max(0, typed - del);
  const cursor = Math.sin(t * 12) > 0 ? 1 : 0;
  const PX = 500;
  const PY = 640;
  const PW = 190;
  const PH = 360;
  return (
    <g transform={cam(1 + 1.55 * zin, -3 * zin, 0, 0, PX + PW / 2, PY + PH / 2 + 30 * zin)}>
      <Sky id="nNight" stops={[[0, '#1C1838'], [0.6, '#352A55'], [1, '#160C1A']]} />
      <rect x={90} y={300} width={330} height={420} rx={14} fill="#120E24" />
      <Sky id="nWin" stops={[[0, '#2C2A5E'], [1, '#5B4685']]} x={106} y={316} w={298} h={388} />
      <circle cx={300} cy={420} r={46} fill="#FFF1D0" />
      <circle cx={322} cy={404} r={40} fill="#2C2A5E" />
      {Array.from({length: 9}, (_, i) => (
        <Sparkle key={i} x={130 + ((i * 53) % 260)} y={360 + ((i * 97) % 300)} s={6} o={0.5 + 0.5 * Math.sin(t * 3 + i)} />
      ))}
      <rect x={250} y={1000} width={760} height={200} rx={30} fill="#3E3263" />
      <rect x={250} y={960} width={760} height={70} rx={30} fill="#6B5C9A" />
      <Floor y={1200} c1="#24183A" c2="#0E0712" />
      <Person who="el" x={420} y={1180} s={1.25} armR={-55} armL={-20} tilt={14} lean={4} />
      <Glow x={PX + PW / 2} y={PY + PH / 2} r={420} g="gLav" o={0.55} />
      <Phone id="nPh" x={PX} y={PY} w={PW} h={PH} rot={-6}>
        <rect x={PX} y={PY} width={PW} height={PH} fill="#F3EEF8" />
        <rect x={PX} y={PY} width={PW} height={48} fill="#E0D7EE" />
        <circle cx={PX + 30} cy={PY + 26} r={13} fill={PINK} />
        <rect x={PX + 52} y={PY + 20} width={60} height={10} rx={5} fill="#BFB2D3" />
        <Bubble x={PX + 12} y={PY + 70} w={120} h={50} c="#E2D8EE" lc="#C3B5D8" />
        <Bubble x={PX + 12} y={PY + 132} w={96} h={34} c="#E2D8EE" lines={1} lc="#C3B5D8" />
        <Bubble x={PX + 64} y={PY + 182} w={114} h={50} c="#C9B2E6" lc="#A68BCF" />
        {/* campo de escritura */}
        <rect x={PX + 10} y={PY + PH - 56} width={PW - 64} height={40} rx={20} fill="#FFFFFF" stroke="#D3C7E4" strokeWidth={2} />
        {Array.from({length: shown}, (_, i) => (
          <path key={i} d={`M${PX + 24 + i * 10} ${PY + PH - 34} q2.5 -6 5 0 q2.5 6 5 0`} stroke="#6A5A86" strokeWidth={2.4} fill="none" />
        ))}
        <rect x={PX + 24 + shown * 10 + 2} y={PY + PH - 46} width={2.4} height={20} fill="#6A5A86" opacity={cursor} />
        <circle cx={PX + PW - 30} cy={PY + PH - 36} r={18} fill={shown > 0 ? '#A68BCF' : '#D9D1E6'} />
        <path d={`M${PX + PW - 37} ${PY + PH - 44} L${PX + PW - 22} ${PY + PH - 36} L${PX + PW - 37} ${PY + PH - 28} Z`} fill="#fff" />
      </Phone>
    </g>
  );
};

// 9. Juicio: burbujas grises llegan y se vuelven pétalos al tocar su luz
const SJuicio: React.FC<SP> = ({t, d}) => {
  const k = t / d;
  const shift = t * 140;
  return (
    <g transform={cam(1.04 + 0.04 * k, 0, 0, 30 - 60 * ease(k), 540, 900)}>
      <Sky id="jSky" stops={[[0, '#9C8BD0'], [0.45, '#E7A9C5'], [0.7, '#FAC7A5'], [1, '#FAC7A5']]} />
      <circle cx={760} cy={820} r={110} fill="#FFE1A4" opacity={0.9} />
      {/* colinas en paralaje */}
      <g transform={`translate(${-(shift * 0.3) % 540} 0)`}>
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={i * 540 + 100} cy={1010} rx={380} ry={130} fill="#C994B8" />
        ))}
      </g>
      <g transform={`translate(${-(shift * 0.6) % 600} 0)`}>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <ellipse cx={i * 600 + 300} cy={1080} rx={420} ry={140} fill="#B07AA4" />
            <rect x={i * 600 + 120} y={860} width={10} height={200} fill="#6E4562" />
            <circle cx={i * 600 + 125} cy={860} r={18} fill="#FFE9B0" />
            <Glow x={i * 600 + 125} y={860} r={70} o={0.7} />
          </g>
        ))}
      </g>
      <Floor y={1120} c1="#8A5A80" c2="#2B1626" />
      <g transform={`translate(${-(shift % 200)} 0)`}>
        {Array.from({length: 9}, (_, i) => (
          <rect key={i} x={i * 200} y={1180} width={90} height={14} rx={7} fill="#B98AAE" />
        ))}
      </g>
      <Glow x={540} y={900} r={360} g="gGold" o={0.6} />
      <Person who="el" x={470} y={1160} s={1.15} walk={t * 6} amp={0.7} armR={18} />
      <Person who="ella" x={610} y={1160} s={1.1} walk={t * 6 + 3.14} amp={0.7} armL={18} />
      <circle cx={540} cy={1010} r={14} fill="#E7B596" />
      {/* burbujas de juicio */}
      {Array.from({length: 10}, (_, i) => {
        const r = rnd(900 + i);
        const ang = r() * 6.28;
        const start = r() * 2.6;
        const p = clamp((t - start) / 1.6);
        const R = mix(760, 250, p);
        const x = 540 + Math.cos(ang) * R;
        const y = 820 + Math.sin(ang) * R * 0.8;
        const pop = lin(p, 0.85, 1);
        return (
          <g key={i}>
            {p < 1 && (
              <g opacity={(1 - pop) * Math.min(1, p * 5)} transform={`translate(${x} ${y}) scale(${1 - pop * 0.5})`}>
                <rect x={-70} y={-36} width={140} height={72} rx={30} fill="#9C93A6" />
                <path d="M-20 34 L-34 58 L4 34Z" fill="#9C93A6" />
                <path d="M-40 -8 l12 10 l12 -10 l12 10 l12 -10 l12 10 l12 -10" stroke="#6F6779" strokeWidth={5} fill="none" />
              </g>
            )}
            {Array.from({length: 5}, (_, j) => {
              const q = clamp((t - start - 1.4) / 1.4);
              const a = (j / 5) * 6.28 + i;
              return q > 0 && q < 1 ? (
                <ellipse key={j} cx={540 + Math.cos(ang) * 250 + Math.cos(a) * 120 * q} cy={820 + Math.sin(ang) * 200 + Math.sin(a) * 120 * q + 80 * q} rx={12} ry={7} fill={j % 2 ? PINK : '#FFC7D6'} opacity={1 - q} transform={`rotate(${a * 60 + t * 90} ${540 + Math.cos(ang) * 250 + Math.cos(a) * 120 * q} ${820 + Math.sin(ang) * 200 + Math.sin(a) * 120 * q + 80 * q})`} />
              ) : null;
            })}
          </g>
        );
      })}
    </g>
  );
};

// 10. Foto en la galería que se abre; se aleja la cámara y él le toma las manos
const SFoto: React.FC<SP> = ({t, d}) => {
  const open = ease(lin(t, 0.3, 1.1));
  const pull = ease(lin(t, 2.0, 3.4));
  const hands = ease(lin(t, 3.2, 4.2));
  const PX = 320;
  const PY = 360;
  const PW = 440;
  const PH = 760;
  const tile = {x: PX + 16, y: PY + 90, w: 128, h: 128};
  const fx = mix(tile.x, PX, open);
  const fy = mix(tile.y, PY, open);
  const fw = mix(tile.w, PW, open);
  const fh = mix(tile.h, PH, open);
  const Photo = (
    <g>
      <Sky id="ftPh" stops={[[0, '#F59DAF'], [0.6, '#FFC9A3'], [1, '#FFE2B0']]} x={PX} y={PY} w={PW} h={PH} />
      <circle cx={PX + PW / 2} cy={PY + 520} r={120} fill="#FFE7B0" />
      <Person who="el" x={PX + 170} y={PY + PH + 160} s={1.05} tilt={10} lean={4} />
      <Person who="ella" x={PX + 280} y={PY + PH + 160} s={1.0} tilt={-12} lean={-4} />
      <Heart x={PX + PW / 2} y={PY + 160} s={70} fill="#FF7F9C" />
      <Sparkle x={PX + 120} y={PY + 120} s={20} />
      <Sparkle x={PX + 330} y={PY + 220} s={16} />
    </g>
  );
  // la cámara se aleja: el teléfono se encoge hacia la mano de él
  const ps = mix(1, 0.24, pull);
  const pcx = mix(540, 400, pull);
  const pcy = mix(740, 790, pull);
  return (
    <g>
      <Sky id="ftBase" stops={[[0, '#D9A3C8'], [0.5, '#F4B7B9'], [1, '#5A2B44']]} />
      <Bokeh t={t} n={14} seed={91} o={0.6} />
      <g opacity={pull}>
        <Sky id="ftRoof" stops={[[0, '#C98FC0'], [0.5, '#F7A9A6'], [0.8, '#FFD3A0'], [1, '#FFD3A0']]} />
        <circle cx={540} cy={1000} r={170} fill="#FFE2A0" />
        <Glow x={540} y={1000} r={480} o={0.7} />
        {[80, 200, 330, 720, 850, 960].map((x, i) => (
          <rect key={i} x={x} y={880 - (i % 3) * 90} width={110} height={400} fill="#B47592" opacity={0.7} />
        ))}
        <rect x={-400} y={1080} width={1880} height={1000} fill="#6A3550" />
        <rect x={-400} y={1060} width={1880} height={30} fill="#8E4F6E" />
        <StringLights t={t} x0={-20} x1={1100} y={420} sag={60} n={12} />
        <Person who="el" x={430} y={1220} s={1.25} armR={mix(-40, 55, hands)} armL={mix(-35, -6, hands)} tilt={-6} />
        <Person who="ella" x={660} y={1220} s={1.2} armL={mix(5, 55, hands)} tilt={-6 + 2 * Math.sin(t * 3)} />
        <g opacity={hands}>
          <Glow x={545} y={900} r={130} g="gPink" o={0.9} />
          <Heart x={545} y={820 - 40 * hands} s={60} fill="#FF7F9C" />
        </g>
      </g>
      <g opacity={1 - hands} transform={`translate(${pcx} ${pcy}) scale(${ps}) translate(-540 -740)`}>
        <Phone id="ftPhone" x={PX} y={PY} w={PW} h={PH}>
          <rect x={PX} y={PY} width={PW} height={PH} fill="#FBF3F1" />
          {Array.from({length: 15}, (_, i) => {
            const c = i % 3;
            const r = Math.floor(i / 3);
            const g = [
              ['#F7B2C1', '#FFD9A8'],
              ['#C3B3EA', '#F4C7DD'],
              ['#A9D8C9', '#F7E2B4'],
            ][(i + r) % 3];
            return (
              <g key={i}>
                <rect x={PX + 16 + c * 140} y={PY + 90 + r * 140} width={128} height={128} rx={10} fill={g[0]} />
                <circle cx={PX + 16 + c * 140 + 80} cy={PY + 90 + r * 140 + 50} r={22} fill={g[1]} />
              </g>
            );
          })}
          <rect x={PX + 16} y={PY + 30} width={140} height={14} rx={7} fill="#E5D6D9" />
          <clipPath id="ftClip">
            <rect x={fx} y={fy} width={fw} height={fh} rx={mix(10, 0, open)} />
          </clipPath>
          <g clipPath="url(#ftClip)">{Photo}</g>
        </Phone>
      </g>
    </g>
  );
};

// 11. Vejez: de espaldas en el sofá, pasan los atardeceres y el pelo se vuelve blanco
const SVejez: React.FC<SP> = ({t, d}) => {
  const k = t / d;
  const cyc = (t / d) * 2.2; // ciclos de día
  const ph = cyc % 1;
  const sunY = mix(420, 900, ph);
  const skyTop = mixC('#F4A6B5', '#3B2E6A', Math.sin(ph * Math.PI) ** 2 * 0.6);
  const skyBot = mixC('#FFDDB0', '#E98FA8', ph);
  const old = ease(lin(t, 0.6, d - 0.6));
  return (
    <g transform={cam(1.22 - 0.2 * ease(k), 0, 0, 0, 540, 860)}>
      <rect x={-400} y={-400} width={1880} height={2800} fill="#E7B9B0" />
      <rect x={-400} y={-400} width={1880} height={2800} fill="#C98E9C" opacity={0.35} />
      {/* cuadros que aparecen en la pared */}
      {[
        [60, 360, 110, 140],
        [60, 540, 110, 90],
        [930, 380, 110, 120],
        [930, 540, 110, 150],
      ].map(([x, y, w, h], i) => {
        const a = eBack(lin(t, 0.6 + i * 0.7, 1.1 + i * 0.7));
        return (
          <g key={i} opacity={a} transform={`translate(${x + w / 2} ${y + h / 2}) scale(${a}) translate(${-x - w / 2} ${-y - h / 2})`}>
            <rect x={x} y={y} width={w} height={h} rx={6} fill="#7B4A62" />
            <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} fill={[PEACH, LAV, PINK, '#BFE3D2'][i]} />
            <Heart x={x + w / 2} y={y + h / 2} s={30} fill="#fff" o={0.8} />
          </g>
        );
      })}
      <rect x={190} y={340} width={700} height={600} rx={18} fill="#7B4A62" />
      <clipPath id="vjWin">
        <rect x={210} y={360} width={660} height={560} rx={10} />
      </clipPath>
      <g clipPath="url(#vjWin)">
        <Sky id="vjSky" stops={[[0, skyTop], [1, skyBot]]} x={210} y={360} w={660} h={560} />
        <circle cx={540} cy={sunY} r={80} fill="#FFE2A0" opacity={1 - ph * 0.6} />
        <Glow x={540} y={sunY} r={260} o={0.8 - ph * 0.5} />
        <path d="M210 920 L210 820 Q330 760 450 820 Q560 770 690 820 Q790 780 870 810 L870 920Z" fill="#B47592" />
      </g>
      <rect x={532} y={340} width={16} height={600} fill="#7B4A62" />
      <Floor y={1080} c1="#9A5A72" c2={PLUM} />
      {/* planta que crece */}
      <g transform={`translate(960 1090) scale(${0.55 + 0.55 * old})`}>
        <rect x={-40} y={-70} width={80} height={70} rx={10} fill="#D97C68" />
        {[-50, -20, 10, 40].map((a, i) => (
          <ellipse key={i} cx={0} cy={-150} rx={26} ry={80} fill="#8FBF9F" transform={`rotate(${a} 0 -70)`} />
        ))}
      </g>
      {/* pareja de espaldas */}
      <Person who="el" x={455} y={1290} s={1.2} back old={old} tilt={4} />
      <Person who="ella" x={610} y={1290} s={1.15} back old={old} tilt={-14} lean={-5} />
      {/* sofá (respaldo delante, los vemos de espaldas) */}
      <rect x={240} y={960} width={600} height={170} rx={50} fill="#D2798F" />
      <rect x={200} y={1000} width={90} height={190} rx={40} fill="#BF657E" />
      <rect x={790} y={1000} width={90} height={190} rx={40} fill="#BF657E" />
      <rect x={260} y={1120} width={560} height={80} rx={20} fill="#BF657E" />
      <Bokeh t={t} n={10} seed={55} o={0.4} />
    </g>
  );
};

// 12. Cierre: la casa de noche, linternas de luz que suben; flecha al LIVE
const SCierre: React.FC<SP> = ({t, d}) => {
  const k = t / d;
  return (
    <g transform={cam(1.14 - 0.12 * ease(k), 0, 0, -40 + 120 * ease(k), 540, 760)}>
      <Sky id="ciSky" stops={[[0, '#3A2C6A'], [0.4, '#9C6BA4'], [0.7, '#E99AA6'], [1, '#2A1626']]} />
      {Array.from({length: 30}, (_, i) => {
        const r = rnd(1200 + i);
        return <Sparkle key={i} x={r() * 1080} y={r() * 700} s={5 + r() * 8} o={lin(t, r() * 2, r() * 2 + 1) * (0.5 + 0.5 * Math.sin(t * 3 + i))} />;
      })}
      <circle cx={830} cy={330} r={60} fill="#FFF1D0" />
      <Glow x={830} y={330} r={200} o={0.5} />
      {/* casa */}
      <rect x={210} y={620} width={660} height={560} fill="#5E2E4C" />
      <path d="M170 640 L540 380 L910 640 Z" fill="#46203B" />
      <StringLights t={t} x0={190} x1={890} y={650} sag={30} n={13} />
      <rect x={290} y={740} width={500} height={330} rx={12} fill="#2C1324" />
      <Sky id="ciWin" stops={[[0, '#FFD9A0'], [1, '#F5A98F']]} x={305} y={755} w={470} h={300} />
      <Glow x={540} y={900} r={340} o={0.8} />
      <Person who="el" sil x={470} y={1120} s={0.82} old={1} tilt={6} />
      <Person who="ella" sil x={600} y={1120} s={0.78} old={1} tilt={-14} lean={-5} />
      <rect x={340} y={960} width={400} height={95} rx={30} fill="#3A1F35" />
      <rect x={532} y={740} width={16} height={330} fill="#2C1324" />
      <Floor y={1180} c1="#3A1A30" c2="#160A12" />
      {/* linternas / corazones de luz que suben */}
      {Array.from({length: 14}, (_, i) => {
        const r = rnd(1300 + i);
        const p = (t * (0.12 + r() * 0.1) + r()) % 1;
        const x = 80 + r() * 920 + Math.sin(t + i) * 20;
        const y = 1150 - p * 1000;
        return (
          <g key={i} opacity={Math.sin(p * Math.PI)}>
            <Glow x={x} y={y} r={50} g={i % 2 ? 'gGold' : 'gPink'} />
            {i % 3 === 0 ? <Heart x={x} y={y} s={26} fill="#FFD7A0" /> : <circle cx={x} cy={y} r={9} fill="#FFE9B0" />}
          </g>
        );
      })}
    </g>
  );
};

const SCENES: Record<string, {C: React.FC<SP>; tr: string}> = {
  hook: {C: SHook, tr: 'none'},
  mensaje: {C: SMensaje, tr: 'bloom'},
  videollamada: {C: SVideo, tr: 'slideUp'},
  magia: {C: SMagia, tr: 'iris'},
  errores: {C: SErrores, tr: 'wipeDiag'},
  abrazo: {C: SAbrazo, tr: 'cut'},
  live: {C: SLive, tr: 'zoom'},
  miedo: {C: SMiedo, tr: 'dip'},
  juicio: {C: SJuicio, tr: 'heart'},
  foto: {C: SFoto, tr: 'slideLeft'},
  vejez: {C: SVejez, tr: 'leak'},
  cierre: {C: SCierre, tr: 'bloom'},
};
const TR = 0.5;

// ---------- capas fijas ----------
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const Player: React.FC<{t: number; total: number; song: string; artist: string}> = ({t, total, song, artist}) => {
  const p = clamp(t / total);
  const bars = 14;
  return (
    <div
      style={{
        position: 'absolute',
        left: 220,
        top: 208,
        width: 640,
        height: 117,
        borderRadius: 26,
        background: 'rgba(38,20,14,0.84)',
        border: '2px solid rgba(214,160,70,0.55)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        fontFamily: SERIF,
        color: CREAM,
        boxSizing: 'border-box',
      }}
    >
      <div style={{position: 'absolute', left: 28, top: 48, display: 'flex', alignItems: 'center', gap: 5, height: 24}}>
        {Array.from({length: bars}, (_, i) => {
          const h = 7 + Math.abs(Math.sin(t * (5 + (i % 4)) + i * 1.3)) * 17 * (i < 8 ? 1 : 0.55);
          return <div key={i} style={{width: 6, height: h, borderRadius: 3, background: i % 3 === 1 ? CREAM : GOLD}} />;
        })}
      </div>
      <div style={{position: 'absolute', right: 12, top: 22, fontSize: 33, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: 0.2}}>
        {song} <span style={{color: GOLD}}>· {artist}</span>
      </div>
      <div style={{position: 'absolute', left: 28, top: 76, fontSize: 20, fontWeight: 600}}>{fmt(t)}</div>
      <div style={{position: 'absolute', right: 28, top: 76, fontSize: 20, fontWeight: 600}}>{fmt(total)}</div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 88, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.18)'}}>
        <div style={{width: `${p * 100}%`, height: '100%', borderRadius: 3, background: GOLD}} />
        <div style={{position: 'absolute', left: `calc(${p * 100}% - 7px)`, top: -5, width: 14, height: 14, borderRadius: 7, background: '#fff'}} />
      </div>
    </div>
  );
};

const Captions: React.FC<{t: number; timings: T[]}> = ({t, timings}) => {
  const cur = timings.find((s) => t >= s.start - 0.05 && t <= s.end + 0.2);
  if (!cur) return null;
  // grupos de hasta 3 palabras / ~16 letras
  const groups: W[][] = [];
  let g: W[] = [];
  for (const w of cur.words) {
    const len = g.map((x) => x.w).join(' ').length + w.w.length;
    if (g.length && (g.length >= 3 || len > 16)) {
      groups.push(g);
      g = [];
    }
    g.push(w);
    if (/[.,:?!…]$/.test(w.w)) {
      groups.push(g);
      g = [];
    }
  }
  if (g.length) groups.push(g);
  const grp = groups.find((gr) => t <= gr[gr.length - 1].end) || groups[groups.length - 1];
  const gStart = grp[0].start;
  const a = eOut(clamp((t - gStart + 0.05) / 0.15));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1130, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          background: 'rgba(30,12,24,0.78)',
          borderRadius: 26,
          padding: '14px 34px 22px',
          fontFamily: SERIF,
          fontWeight: 800,
          fontSize: 76,
          color: CREAM,
          whiteSpace: 'nowrap',
          transform: `translateY(${(1 - a) * 14}px) scale(${0.94 + 0.06 * a})`,
          opacity: a,
          textShadow: '0 3px 10px rgba(0,0,0,0.35)',
        }}
      >
        {grp.map((w, i) => (
          <span key={i} style={{color: t >= w.start && t < w.end + 0.02 ? GOLD : CREAM}}>
            {w.w}
            {i < grp.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    </div>
  );
};

const LiveArrow: React.FC<{t: number}> = ({t}) => {
  const a = eOut(clamp(t / 0.3));
  const bob = Math.sin(t * 6) * 16;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: a}}>
      <defs>
        <filter id="arrGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g transform={`translate(${-bob} ${bob}) translate(240 1640) rotate(135) scale(${0.85 + 0.15 * a})`} filter="url(#arrGlow)">
        <path d="M-150 -38 L40 -38 L40 -95 L160 0 L40 95 L40 38 L-150 38 Z" fill="#ECE7EA" stroke={GOLD} strokeWidth={14} strokeLinejoin="round" />
      </g>
    </svg>
  );
};

export const HistoriaYoko: React.FC<YProps> = ({spec, timings, totalSeconds, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const [handle] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    Promise.all([document.fonts.load(`800 76px Fraunces`), document.fonts.load(`700 33px Fraunces`), document.fonts.load(`600 20px Fraunces`)])
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle));
  }, [handle]);

  const n = timings.length;
  const layers: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const s0 = timings[i].sceneStart;
    const s1 = i < n - 1 ? timings[i + 1].sceneStart : totalSeconds + 1;
    const key = spec.sentences[i].scene;
    const sc = SCENES[key];
    const nextTr = i < n - 1 ? SCENES[spec.sentences[i + 1].scene].tr : 'none';
    const tailEnd = nextTr === 'cut' ? s1 : s1 + TR;
    if (t < s0 || t >= tailEnd) continue;
    const lt = t - s0;
    const d = s1 - s0;
    const p = clamp(lt / TR);
    const pe = ease(p);
    let style: React.CSSProperties = {};
    let clip: React.ReactNode = null;
    let clipId: string | undefined;
    let overlay: React.ReactNode = null;
    if (i > 0 && p < 1) {
      switch (sc.tr) {
        case 'bloom':
          style = {opacity: pe};
          overlay = <rect x={0} y={0} width={1080} height={1920} fill="#FFF3E0" opacity={Math.sin(p * Math.PI) * 0.7} />;
          break;
        case 'slideUp':
          style = {transform: `translateY(${(1 - pe) * 1920}px)`};
          break;
        case 'slideLeft':
          style = {transform: `translateX(${(1 - pe) * 1080}px) rotate(${(1 - pe) * 6}deg)`};
          break;
        case 'iris':
          clipId = `clip${i}`;
          clip = (
            <clipPath id={clipId}>
              <circle cx={540} cy={850} r={pe * 1300} />
            </clipPath>
          );
          break;
        case 'heart':
          clipId = `clip${i}`;
          clip = (
            <clipPath id={clipId}>
              <path transform={`translate(540 900) scale(${pe * 30 + 0.01})`} d="M0 30 C -10 10 -50 0 -50 -25 C -50 -50 -15 -60 0 -35 C 15 -60 50 -50 50 -25 C 50 0 10 10 0 30 Z" />
            </clipPath>
          );
          break;
        case 'wipeDiag': {
          clipId = `clip${i}`;
          const x = mix(-1400, 1100, pe);
          clip = (
            <clipPath id={clipId}>
              <polygon points={`${-400},-100 ${x},-100 ${x - 700},2100 ${-400},2100`} />
            </clipPath>
          );
          break;
        }
        case 'zoom':
          style = {opacity: pe, transform: `scale(${0.55 + 0.45 * eOut(p)})`};
          break;
        case 'dip':
          style = {opacity: ease(lin(lt, TR * 0.45, TR))};
          break;
        case 'leak':
          style = {opacity: pe};
          overlay = <rect x={0} y={0} width={1080} height={1920} fill="#FFC9A0" opacity={Math.sin(p * Math.PI) * 0.45} />;
          break;
      }
    }
    // la escena saliente en "dip" se oscurece
    const outgoingDip = nextTr === 'dip' && t > s1 ? 1 - lin(t, s1, s1 + TR * 0.45) : 1;
    layers.push(
      <div key={key} style={{position: 'absolute', inset: 0, transformOrigin: '540px 860px', ...style}}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
          <Defs />
          {clip}
          <g clipPath={clipId ? `url(#${clipId})` : undefined} opacity={outgoingDip}>
            <sc.C t={lt} d={d} />
            <rect x={0} y={0} width={1080} height={1920} fill="url(#vignette)" />
          </g>
          {overlay}
        </svg>
      </div>,
    );
  }
  const cierreStart = timings[n - 1].sceneStart;
  return (
    <AbsoluteFill style={{backgroundColor: '#140810'}}>
      {layers}
      <Player t={t} total={totalSeconds} song={spec.song || 'YOKO'} artist={spec.artist || 'Álvaro Díaz'} />
      <Captions t={t} timings={timings} />
      {t >= cierreStart && <LiveArrow t={t - cierreStart} />}
      <Audio src={staticFile(audioFile)} />
    </AbsoluteFill>
  );
};
