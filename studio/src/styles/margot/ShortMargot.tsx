import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/metal-mania/400.css';
import '@fontsource/anton/latin-400.css';
import '@fontsource/rubik/latin-500.css';
import '@fontsource/rubik/latin-700.css';
import '@fontsource/rubik/latin-800.css';
import '@fontsource/rubik/latin-800-italic.css';
import {Props} from '../../types';

// Paleta de los diseños del álbum «mosca»: azul rey de portada, dálmata blanco y negro,
// letras rojas con contorno amarillo, amarillo ácido del póster grunge y los grises/malva
// de la tarjeta del tracklist.
const C = {
  blue: '#0b2fa6',
  blueDeep: '#06176a',
  blueNight: '#040f45',
  blueLight: '#2a5cf0',
  ink: '#0a0a0d',
  white: '#f4f2ee',
  red: '#e8381a',
  yellow: '#ffd400',
  acid: '#e6f000',
  grey: '#c9c9c7',
  greyLight: '#e4e3df',
  mauve: '#9b8589',
  brown: '#5d4744',
};
const SPIKY = "'Metal Mania', 'Anton', sans-serif";
const BLOCK = "'Anton', 'Impact', sans-serif";
const SANS = "'Rubik', 'Helvetica', sans-serif";

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = (t: number) => t * t * (3 - 2 * t);
const pop = (t: number, at: number, d = 0.35) => {
  const p = interpolate(t, [at, at + d], [0, 1], clamp);
  return p === 0 ? 0 : 1 + Math.sin(p * Math.PI) * 0.18 * (1 - p) + (p - 1) * 0.0;
};
const rnd = (i: number, s = 1) => Math.abs(Math.sin(i * 12.9898 + s * 78.233) * 43758.5453) % 1;

// ---------- Elementos comunes ----------

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.38, pointerEvents: 'none'}}>
      <filter id="mgrain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 7} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="1080" height="1920" filter="url(#mgrain)" />
    </svg>
  );
};

// Semitono de póster serigrafiado.
const Halftone: React.FC<{o?: number}> = ({o = 0.12}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: o}}>
    <defs>
      <pattern id="ht" width={16} height={16} patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
        <circle cx={8} cy={8} r={3.2} fill={C.ink} />
      </pattern>
      <radialGradient id="htmask-g" cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.35" stopColor="#000" />
        <stop offset="1" stopColor="#fff" />
      </radialGradient>
      <mask id="htmask"><rect width={1080} height={1920} fill="url(#htmask-g)" /></mask>
    </defs>
    <rect width={1080} height={1920} fill="url(#ht)" mask="url(#htmask)" />
  </svg>
);

// Estrella de brocha con puntas irregulares (como las del alfabeto de Nsqk).
const starPath = (n: number, R: number, r: number, seed = 1) => {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2 + (rnd(i, seed) - 0.5) * 0.22;
    const rad = i % 2 === 0 ? R * (0.78 + rnd(i + 3, seed) * 0.4) : r * (0.85 + rnd(i + 7, seed) * 0.3);
    pts.push(`${(Math.cos(a) * rad).toFixed(1)} ${(Math.sin(a) * rad).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
};
const Star: React.FC<{x: number; y: number; s?: number; rot?: number; color?: string; seed?: number; stroke?: string; n?: number}> = ({x, y, s = 1, rot = 0, color = C.ink, seed = 1, stroke, n = 5}) =>
  s <= 0 ? null : (
    <path d={starPath(n, 60, 20, seed)} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} fill={color} stroke={stroke} strokeWidth={stroke ? 7 / s : 0} strokeLinejoin="round" paintOrder="stroke" />
  );

const FlyShape: React.FC<{x: number; y: number; s?: number; rot?: number; flap: boolean; color?: string; wing?: string}> = ({x, y, s = 1, rot = 0, flap, color = C.ink, wing = C.white}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={-7} cy={-6} rx={11} ry={flap ? 4 : 7} fill={wing} opacity={0.55} transform="rotate(-25)" />
    <ellipse cx={7} cy={-6} rx={11} ry={flap ? 4 : 7} fill={wing} opacity={0.55} transform="rotate(25)" />
    <ellipse cx={0} cy={2} rx={6} ry={10} fill={color} />
    <circle cx={0} cy={-9} r={5.5} fill={color} />
    <circle cx={-3} cy={-10} r={2} fill={C.red} />
    <circle cx={3} cy={-10} r={2} fill={C.red} />
  </g>
);

const Flies: React.FC<{cx: number; cy: number; spread: number; n: number; seed?: number; s?: number}> = ({cx, cy, spread, n, seed = 1, s = 1.5}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const r1 = rnd(i, seed);
        const r2 = rnd(i + 50, seed);
        const sp = 0.6 + r1 * 1.2;
        const x = cx + Math.sin(t * sp * 1.3 + r2 * 9) * spread * (0.35 + r1 * 0.65) + Math.sin(t * 5.1 + i) * 9;
        const y = cy + Math.cos(t * sp * 0.9 + r1 * 7) * spread * 0.55 * (0.35 + r2 * 0.65) + Math.cos(t * 6.3 + i) * 7;
        return <FlyShape key={i} x={x} y={y} s={s * (0.8 + r2 * 0.5)} rot={Math.sin(t * 3 + i) * 40} flap={(frame + i) % 2 === 0} />;
      })}
    </g>
  );
};

const Svg: React.FC<{children: React.ReactNode; bg?: string; glow?: string}> = ({children, bg = C.blue, glow = C.blueLight}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
    <defs>
      <radialGradient id="bgglow" cx="0.5" cy="0.42" r="0.7">
        <stop offset="0" stopColor={glow} stopOpacity={0.75} />
        <stop offset="1" stopColor={glow} stopOpacity={0} />
      </radialGradient>
      <radialGradient id="yglow">
        <stop offset="0" stopColor={C.yellow} stopOpacity={0.85} />
        <stop offset="0.45" stopColor={C.yellow} stopOpacity={0.22} />
        <stop offset="1" stopColor={C.yellow} stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill={bg} />
    <rect width={1080} height={1920} fill="url(#bgglow)" />
    {children}
  </svg>
);

// Texto «sticker»: relleno con contorno grueso (como las pegatinas del álbum).
const Sticker: React.FC<{x: number; y: number; size: number; text: string; fill?: string; stroke?: string; sw?: number; font?: string; anchor?: 'middle' | 'start' | 'end'; o?: number; ls?: number; rot?: number}> = ({
  x, y, size, text, fill = C.ink, stroke = C.white, sw = 18, font = SPIKY, anchor = 'middle', o = 1, ls = 0, rot = 0,
}) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontSize={size} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" paintOrder="stroke" opacity={o} letterSpacing={ls} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>
    {text}
  </text>
);

// Dálmata (mascota del álbum) en dos poses: «bark» (de pie ladrando) y «rest» (echado).
const SPOTS = Array.from({length: 26}).map((_, i) => ({x: -160 + rnd(i, 4) * 320, y: -70 + rnd(i, 9) * 140, r: 9 + rnd(i, 13) * 14}));
const Dalmatian: React.FC<{x: number; y: number; s?: number; pose: 'bark' | 'rest'; t: number}> = ({x, y, s = 1, pose, t}) => {
  const O = 14; // grosor del contorno
  if (pose === 'bark') {
    const jaw = 14 + Math.abs(Math.sin(t * 7)) * 22;
    const wag = Math.sin(t * 9) * 12;
    const parts = (outline: boolean) => {
      const st = outline ? {stroke: C.ink, strokeWidth: O * 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const} : {};
      const f = outline ? C.ink : C.white;
      return (
        <g>
          <path d={`M-160 -30 Q-230 ${-110 + wag} -250 ${-170 + wag}`} fill="none" stroke={outline ? C.ink : C.white} strokeWidth={outline ? 22 + O * 2 : 22} strokeLinecap="round" />
          {[-135, -85, 85, 135].map((lx, i) => (
            <rect key={i} x={lx - 18} y={20} width={36} height={190} rx={14} fill={f} {...st} />
          ))}
          <ellipse cx={0} cy={0} rx={175} ry={82} fill={f} {...st} />
          <path d="M110 -40 L170 -170 L250 -150 L190 30 Z" fill={f} {...st} />
          <ellipse cx={230} cy={-170} rx={72} ry={58} fill={f} {...st} />
          <path d="M260 -200 L350 -190 Q368 -170 350 -152 L270 -150 Z" fill={f} {...st} />
          <g transform={`rotate(${jaw} 270 -150)`}>
            <path d="M262 -150 L340 -146 Q350 -132 336 -124 L270 -128 Z" fill={f} {...st} />
          </g>
        </g>
      );
    };
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {parts(true)}
        {/* boca abierta */}
        <path d={`M270 -150 L352 -152 L${340 - jaw * 0.6} ${-130 + jaw * 1.2} Z`} fill={C.red} />
        {parts(false)}
        <g transform={`rotate(${jaw} 270 -150)`}>
          <path d="M268 -146 L336 -142 Q344 -134 332 -128 L272 -132 Z" fill={C.white} />
          <path d="M290 -142 l6 -10 l6 10 M310 -141 l6 -10 l6 10" fill={C.white} stroke={C.ink} strokeWidth={2} />
        </g>
        <path d="M268 -196 l6 12 l6 -12 M292 -196 l6 12 l6 -12" fill={C.white} stroke={C.ink} strokeWidth={2} />
        <clipPath id="dbody"><ellipse cx={0} cy={0} rx={175} ry={82} /></clipPath>
        <g clipPath="url(#dbody)">{SPOTS.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={C.ink} />)}</g>
        {[[-135, 80], [-85, 140], [85, 100], [135, 160]].map(([lx, ly], i) => <circle key={i} cx={lx} cy={ly} r={10} fill={C.ink} />)}
        {[[205, -195, 9], [250, -140, 7], [190, -150, 11], [150, -60, 12], [175, -110, 9]].map(([a, b, r], i) => <circle key={i} cx={a} cy={b} r={r} fill={C.ink} />)}
        <ellipse cx={200} cy={-160} rx={26} ry={58} fill={C.ink} transform="rotate(18 200 -160)" />
        <circle cx={250} cy={-188} r={10} fill={C.ink} />
        <path d="M236 -204 L262 -196" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        <ellipse cx={350} cy={-186} rx={15} ry={12} fill={C.ink} />
      </g>
    );
  }
  // Echado, cabeza sobre las patas, ojos cerrados.
  const breath = 1 + Math.sin(t * 2) * 0.02;
  const parts = (outline: boolean) => {
    const st = outline ? {stroke: C.ink, strokeWidth: O * 2, strokeLinejoin: 'round' as const} : {};
    const f = outline ? C.ink : C.white;
    return (
      <g>
        <path d="M-170 40 Q-260 70 -300 40" fill="none" stroke={outline ? C.ink : C.white} strokeWidth={outline ? 22 + O * 2 : 22} strokeLinecap="round" />
        <ellipse cx={-120} cy={50} rx={80} ry={50} fill={f} {...st} />
        <g transform={`scale(1 ${breath})`}>
          <ellipse cx={0} cy={0} rx={185} ry={78} fill={f} {...st} />
        </g>
        <rect x={110} y={50} width={220} height={40} rx={20} fill={f} {...st} />
        <rect x={100} y={84} width={240} height={40} rx={20} fill={f} {...st} />
        <ellipse cx={240} cy={20} rx={78} ry={58} fill={f} {...st} />
        <path d="M280 0 L370 22 Q380 46 360 60 L290 64 Z" fill={f} {...st} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {parts(true)}
      {parts(false)}
      <clipPath id="dbody2"><ellipse cx={0} cy={0} rx={185} ry={78} /></clipPath>
      <g clipPath="url(#dbody2)">{SPOTS.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={C.ink} />)}</g>
      {[[-140, 40, 12], [-100, 70, 9], [160, 70, 9], [230, 104, 8], [300, 70, 8]].map(([a, b, r], i) => <circle key={i} cx={a} cy={b} r={r} fill={C.ink} />)}
      <ellipse cx={210} cy={10} rx={26} ry={56} fill={C.ink} transform="rotate(-24 210 10)" />
      <path d="M262 4 Q276 14 290 4" stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
      <ellipse cx={366} cy={30} rx={14} ry={11} fill={C.ink} />
      <circle cx={268} cy={44} r={7} fill={C.ink} />
    </g>
  );
};

// Silueta simple de persona sentada o de pie, de espaldas.
const Person: React.FC<{x: number; y: number; s?: number; color?: string; bun?: boolean; slump?: number}> = ({x, y, s = 1, color = C.ink, bun, slump = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-110 260 C-110 120 -80 80 0 80 C80 80 110 120 110 260 Z" fill={color} />
    <rect x={-24} y={36} width={48} height={50} fill={color} />
    <g transform={`translate(0 ${slump * 22}) rotate(${slump * 8})`}>
      <circle cx={0} cy={0} r={54} fill={color} />
      {bun && <circle cx={0} cy={-58} r={26} fill={color} />}
    </g>
  </g>
);

// ---------- Escenas ----------

type SceneProps = {t: number; dur: number; sc: any};

// 1. Cuarto de hotel en Buenos Aires: el jabón huele a su abuelo.
const Hotel: React.FC<SceneProps> = ({t, dur}) => {
  const memory = ease(interpolate(t, [dur * 0.45, dur * 0.95], [0, 1], clamp));
  const draw = (k: number) => ({pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - interpolate(memory, [k * 0.25, k * 0.25 + 0.6], [0, 1], clamp)});
  return (
    <Svg bg={C.blueDeep} glow={C.blue}>
      {/* ventana con el Obelisco */}
      <rect x={70} y={250} width={400} height={560} fill={C.blueNight} />
      {Array.from({length: 22}).map((_, i) => (
        <circle key={i} cx={90 + rnd(i, 2) * 360} cy={270 + rnd(i, 5) * 260} r={2 + rnd(i, 8) * 3} fill={C.white} opacity={0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i))} />
      ))}
      <path d="M262 470 L282 440 L302 470 L310 810 L254 810 Z" fill={C.ink} />
      {[[80, 640, 90], [170, 690, 70], [330, 610, 80], [400, 700, 70]].map(([bx, by, bw], i) => (
        <g key={i}>
          <rect x={bx} y={by} width={bw} height={810 - by} fill={C.ink} />
          {Array.from({length: 6}).map((_, j) => (
            <rect key={j} x={bx + 12 + (j % 3) * 24} y={by + 20 + Math.floor(j / 3) * 40} width={12} height={16} fill={C.yellow} opacity={rnd(i * 9 + j, 3) > 0.45 ? 0.9 : 0.15} />
          ))}
        </g>
      ))}
      <rect x={70} y={250} width={400} height={560} fill="none" stroke={C.white} strokeWidth={14} />
      <line x1={270} y1={250} x2={270} y2={810} stroke={C.white} strokeWidth={10} />
      <text x={270} y={870} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={30} letterSpacing={8} fill={C.yellow}>BUENOS AIRES</text>
      {/* espejo empañado */}
      <rect x={560} y={240} width={430} height={700} rx={24} fill="#7f97de" />
      <rect x={560} y={240} width={430} height={700} rx={24} fill={C.white} opacity={0.18 + memory * 0.25} />
      <g opacity={1 - memory * 0.7}><Person x={775} y={600} s={1.05} color={C.blueDeep} slump={1} /></g>
      {/* recuerdo del abuelo dibujándose en el vaho */}
      <g transform="translate(775 540)" stroke={C.white} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.95}>
        <circle cx={0} cy={0} r={118} {...draw(0)} />
        <circle cx={-44} cy={-8} r={30} {...draw(1)} />
        <circle cx={44} cy={-8} r={30} {...draw(1)} />
        <path d="M-14 -8 L14 -8" {...draw(1)} />
        <path d="M-50 52 Q-25 36 0 48 Q25 36 50 52" {...draw(2)} />
        <path d="M-30 80 Q0 96 30 80" {...draw(2)} />
        <path d="M-118 -30 Q-110 -110 -40 -116 M118 -30 Q110 -110 40 -116" {...draw(3)} />
      </g>
      <rect x={560} y={240} width={430} height={700} rx={24} fill="none" stroke={C.white} strokeWidth={14} />
      {/* lavabo y jabón */}
      <rect x={500} y={1020} width={560} height={46} rx={10} fill={C.white} />
      <path d="M560 1066 L1000 1066 L960 1220 L600 1220 Z" fill={C.grey} />
      <rect x={758} y={940} width={30} height={84} rx={8} fill={C.grey} />
      <ellipse cx={660} cy={1020} rx={90} ry={16} fill={C.grey} />
      <rect x={605} y={968} width={112} height={54} rx={24} fill={C.mauve} stroke={C.ink} strokeWidth={6} />
      {[0, 1, 2].map((i) => {
        const ph = (t * 0.6 + i / 3) % 1;
        return (
          <path key={i} d={`M${640 + i * 22} ${960 - ph * 260} q 22 -30 0 -60 q -22 -30 0 -60`} stroke={C.yellow} strokeWidth={7} fill="none" strokeLinecap="round" opacity={Math.sin(ph * Math.PI) * 0.9} />
        );
      })}
      {/* maleta */}
      <rect x={110} y={1090} width={300} height={200} rx={18} fill={C.ink} />
      <rect x={200} y={1060} width={120} height={40} rx={14} fill="none" stroke={C.ink} strokeWidth={14} />
      <rect x={110} y={1170} width={300} height={16} fill={C.yellow} />
      <Star x={360} y={1130} s={0.35} color={C.white} seed={7} />
      <rect y={1290} width={1080} height={630} fill={C.blueNight} />
    </Svg>
  );
};

// 2. Título de la canción, estilo pegatina.
const Title: React.FC<SceneProps> = ({t, sc}) => {
  const a = ease(interpolate(t, [0.05, 0.6], [0, 1], clamp));
  const land = ease(interpolate(t, [0.6, 2.0], [0, 1], clamp));
  return (
    <Svg>
      <circle cx={540} cy={860} r={620} fill="url(#yglow)" opacity={0.35} />
      {[[170, 560, 0.9, 1, 0.2], [900, 610, 0.7, 2, 0.35], [210, 1120, 0.6, 3, 0.5], [880, 1090, 1.0, 4, 0.65], [560, 470, 0.5, 5, 0.8]].map(([x, y, s, seed, at], i) => (
        <Star key={i} x={x} y={y} s={s * pop(t, at)} rot={t * 20 * (i % 2 ? 1 : -1)} color={i % 2 ? C.yellow : C.white} seed={seed} stroke={C.ink} />
      ))}
      <g transform={`translate(540 880) scale(${0.85 + 0.15 * a}) rotate(${-4 + 2 * a})`} opacity={a}>
        <Sticker x={0} y={0} size={sc.size || 250} text={sc.big || 'MARGOT'} fill={C.ink} stroke={C.white} sw={26} />
      </g>
      <text x={540} y={1010} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={64} letterSpacing={22} fill={C.yellow} opacity={interpolate(t, [0.6, 1.1], [0, 1], clamp)}>
        {sc.sub || 'NSQK'}
      </text>
      <text x={540} y={1080} textAnchor="middle" fontFamily={SANS} fontWeight={500} fontSize={40} fill={C.white} opacity={interpolate(t, [0.9, 1.4], [0, 1], clamp)}>
        {sc.sub2 || 'track 17 · mosca · 2026'}
      </text>
      <FlyShape x={interpolate(land, [0, 1], [1150, 838])} y={interpolate(land, [0, 1], [420, 720]) + Math.sin(land * 12) * 50 * (1 - land)} s={2.4} rot={land < 1 ? -60 : 15} flap={land < 1 && Math.floor(t * 30) % 2 === 0} />
    </Svg>
  );
};

// 3. SAMSA: el ego. Estallido amarillo, letras rojas, dálmata ladrando.
const Samsa: React.FC<SceneProps> = ({t, sc}) => {
  const a = pop(t, 0.1, 0.45);
  const word = (sc.big || 'SAMSA') as string;
  const n = word.length;
  return (
    <Svg bg={C.blue}>
      <g transform={`translate(540 820) rotate(${t * 8})`}>
        {Array.from({length: 18}).map((_, i) => (
          <path key={i} d="M0 0 L-60 -1100 L60 -1100 Z" fill={i % 2 ? C.yellow : C.acid} opacity={0.9} transform={`rotate(${i * 20})`} />
        ))}
      </g>
      <circle cx={540} cy={820} r={230} fill={C.yellow} />
      <Sticker x={540} y={470} size={110} text={sc.num || '01'} fill={C.ink} stroke={C.yellow} sw={14} />
      <g transform={`translate(540 880) scale(${a})`}>
        {word.split('').map((ch, i) => {
          const off = i - (n - 1) / 2;
          const ang = off * 6;
          return (
            <g key={i} transform={`rotate(${ang} 0 1400)`}>
              <text x={0} y={0} textAnchor="middle" fontFamily={BLOCK} fontSize={sc.size || 230} fill={C.red} stroke={C.ink} strokeWidth={34} strokeLinejoin="round" paintOrder="stroke">{ch}</text>
              <text x={0} y={0} textAnchor="middle" fontFamily={BLOCK} fontSize={sc.size || 230} fill={C.red} stroke={C.yellow} strokeWidth={12} strokeLinejoin="round" paintOrder="stroke">{ch}</text>
            </g>
          );
        })}
      </g>
      <Dalmatian x={430} y={1250} s={1.05} pose="bark" t={t} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={340 + i * 82} y={1505} width={74} height={56} fill={C.greyLight} stroke={C.ink} strokeWidth={5} />
      ))}
      <defs>
        <linearGradient id="samsafade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.blueNight} stopOpacity={0} />
          <stop offset="0.45" stopColor={C.blueNight} stopOpacity={0.85} />
          <stop offset="1" stopColor={C.blueNight} stopOpacity={1} />
        </linearGradient>
      </defs>
      <rect y={1380} width={1080} height={540} fill="url(#samsafade)" />
    </Svg>
  );
};

// 4. Tarjeta del tracklist: de la 1 (SAMSA) a la 17 (MARGOT).
const TRACKS = ['SAMSA', 'Tuffluv', 'Dientes de Fierro', 'Canonizado', 'Santurce', 'Lo tuvimos pero ya no está', '¿Qué Tan Cerca es Cerca?', 'Mil problemas', 'Hombre de bien', 'SANGRE', 'Estar Así Siempre', 'Peces muertos', 'No Basta Con Querernos Más', 'Ghost In The Sell', 'Circo', 'Atrapado y libre', 'MARGOT'];
const Tracklist: React.FC<SceneProps> = ({t, dur}) => {
  const arrow = ease(interpolate(t, [0.1, Math.min(dur * 0.55, 1.0)], [0, 1], clamp));
  const end = interpolate(arrow, [0.85, 1], [0, 1], clamp);
  const y0 = 560;
  const lh = 50;
  return (
    <Svg bg={C.blueDeep} glow={C.blue}>
      <g transform="rotate(-2 540 960)">
        <rect x={110} y={300} width={860} height={1260} rx={30} fill={C.ink} opacity={0.4} transform="translate(16 20)" />
        <rect x={110} y={300} width={860} height={1260} rx={30} fill={C.grey} />
        <rect x={150} y={340} width={780} height={70} fill={C.blue} />
        <text x={160} y={480} fontFamily={BLOCK} fontSize={54} fill={C.ink} letterSpacing={4}>MOSCA</text>
        {[C.blue, C.greyLight, C.mauve, C.brown, C.white].map((c, i) => (
          <rect key={i} x={560 + i * 74} y={440} width={64} height={64} fill={c} />
        ))}
        {TRACKS.map((name, i) => {
          const first = i === 0;
          const last = i === TRACKS.length - 1;
          const y = y0 + i * lh;
          const on = first ? 1 - end * 0.6 : last ? end : 0;
          return (
            <g key={i}>
              {(first || last) && <rect x={170} y={y - 38} width={first ? 230 : 280} height={50} rx={8} fill={first ? C.red : C.blue} opacity={on} />}
              <text x={180} y={y} fontFamily={SANS} fontWeight={700} fontSize={34} fill={(first || last) && on > 0.5 ? C.white : C.ink} opacity={first || last ? 1 : 0.55}>
                {i + 1}. {name}
              </text>
            </g>
          );
        })}
        <path
          d={`M420 ${y0 - 14} C 860 ${y0 + 80} 860 ${y0 + 16 * lh - 80} 470 ${y0 + 16 * lh - 14}`}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - arrow}
          stroke={C.red}
          strokeWidth={12}
          fill="none"
          strokeLinecap="round"
        />
        {end > 0 && <Star x={500} y={y0 + 16 * lh - 14} s={0.5 * pop(t, 1.0)} color={C.yellow} stroke={C.ink} seed={11} />}
      </g>
    </Svg>
  );
};

// 5. La metamorfosis: Grete le deja comida a Gregor, ya convertido en insecto.
const Kafka: React.FC<SceneProps> = ({t, dur}) => {
  const open = ease(interpolate(t, [0.0, 0.8], [0, 1], clamp));
  const walk = ease(interpolate(t, [0.8, dur * 0.6], [0, 1], clamp));
  const legs = Math.sin(t * 6);
  return (
    <Svg bg={C.blueNight} glow={C.blueDeep}>
      <rect y={1300} width={1080} height={620} fill="#030a30" />
      {/* luz de la puerta */}
      <path d={`M740 420 L${740 - 40 * open} 1300 L${180 - 420 * open} 1920 L1080 1920 L1080 1300 L960 1300 L960 420 Z`} fill={C.yellow} opacity={0.16 * open} />
      <rect x={740} y={420} width={220} height={880} fill={C.yellow} opacity={0.9 * open} />
      <path d={`M740 420 L${740 + 220 * (1 - open * 0.82)} ${420 - 30 * open} L${740 + 220 * (1 - open * 0.82)} ${1300 + 40 * open} L740 1300 Z`} fill="#16255e" />
      {/* Grete */}
      <g transform={`translate(${880 - 160 * walk} 0)`} opacity={open}>
        <path d="M-60 1300 L-45 1060 Q0 1020 45 1060 L60 1300 Z" fill={C.ink} />
        <rect x={-34} y={920} width={68} height={150} rx={30} fill={C.ink} />
        <circle cx={0} cy={880} r={46} fill={C.ink} />
        <circle cx={-6} cy={826} r={22} fill={C.ink} />
        <path d="M30 980 L90 1090" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
        <ellipse cx={104} cy={1096} rx={46} ry={14} fill={C.white} />
        <ellipse cx={104} cy={1090} rx={34} ry={8} fill={C.greyLight} />
        {[0, 1].map((i) => {
          const ph = (t * 0.8 + i / 2) % 1;
          return <path key={i} d={`M${94 + i * 20} ${1080 - ph * 120} q12 -20 0 -40`} stroke={C.white} strokeWidth={5} fill="none" opacity={Math.sin(ph * Math.PI) * 0.7} strokeLinecap="round" />;
        })}
      </g>
      {/* Gregor-insecto */}
      <g transform="translate(330 1210) scale(1.25)">
        {[-1, 1].map((side) =>
          [0, 1, 2].map((k) => (
            <path key={`${side}${k}`} d={`M${-50 + k * 50} 0 L${-70 + k * 60 + legs * 8 * (k % 2 ? 1 : -1)} ${side * 70} L${-90 + k * 70} ${side * 110}`} stroke={C.ink} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          )),
        )}
        <ellipse cx={0} cy={0} rx={150} ry={80} fill={C.ink} />
        {[-60, -10, 40].map((sx) => <path key={sx} d={`M${sx} -74 Q${sx + 14} 0 ${sx} 74`} stroke="#1a2a70" strokeWidth={6} fill="none" />)}
        <circle cx={160} cy={-10} r={48} fill={C.ink} />
        <path d={`M190 -40 Q240 ${-130 + legs * 10} 300 ${-150 + legs * 14} M175 -50 Q200 ${-140 - legs * 10} 250 ${-190 - legs * 10}`} stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
        <circle cx={176} cy={-20} r={7} fill={C.white} opacity={0.85} />
      </g>
      <text x={110} y={330} fontFamily={SPIKY} fontSize={64} fill={C.white} opacity={0.9}>la metamorfosis</text>
      <text x={112} y={380} fontFamily={SANS} fontWeight={700} fontSize={28} letterSpacing={8} fill={C.yellow}>FRANZ KAFKA · 1915</text>
    </Svg>
  );
};

// 6. Grete y Margot vienen de Margarita (la flor).
const Names: React.FC<SceneProps> = ({t, dur}) => {
  const petals = 14;
  const shown = interpolate(t, [0.1, 1.2], [0, petals], clamp);
  const branch = ease(interpolate(t, [dur * 0.3, dur * 0.6], [0, 1], clamp));
  const rot = Math.sin(t * 0.8) * 4;
  return (
    <Svg>
      <g transform={`translate(540 640) rotate(${rot})`}>
        {Array.from({length: petals}).map((_, i) => (
          <ellipse key={i} cx={0} cy={-120} rx={42} ry={110} fill={C.white} stroke={C.ink} strokeWidth={8} transform={`rotate(${(i * 360) / petals}) scale(${Math.min(1, Math.max(0, shown - i))})`} />
        ))}
        <circle r={78} fill={C.yellow} stroke={C.ink} strokeWidth={8} />
        {Array.from({length: 12}).map((_, i) => <circle key={i} cx={Math.cos(i * 2.4) * (10 + i * 4)} cy={Math.sin(i * 2.4) * (10 + i * 4)} r={6} fill={C.ink} opacity={0.5} />)}
      </g>
      <Sticker x={540} y={950} size={120} text="margarita" fill={C.yellow} stroke={C.ink} sw={16} o={interpolate(t, [0.4, 0.9], [0, 1], clamp)} />
      <path d="M540 990 C 540 1080 300 1080 290 1170" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - branch} stroke={C.white} strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d="M540 990 C 540 1080 780 1080 790 1170" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - branch} stroke={C.white} strokeWidth={10} fill="none" strokeLinecap="round" />
      <g opacity={interpolate(branch, [0.7, 1], [0, 1], clamp)}>
        <Sticker x={290} y={1290} size={120} text="grete" fill={C.white} stroke={C.ink} sw={16} />
        <text x={290} y={1350} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={28} letterSpacing={6} fill={C.white} opacity={0.75}>ALEMÁN</text>
        <Sticker x={790} y={1290} size={120} text="margot" fill={C.ink} stroke={C.white} sw={16} />
        <text x={790} y={1350} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={28} letterSpacing={6} fill={C.yellow}>FRANCÉS</text>
        <Star x={960} y={1180} s={0.5 * pop(t, dur * 0.65)} color={C.yellow} stroke={C.ink} seed={3} />
      </g>
    </Svg>
  );
};

// 7. No habla de ganar: GANAR tachado y tiras de cinta con lo que pesa.
const Loss: React.FC<SceneProps> = ({t, dur}) => {
  const items: string[] = ['el cansancio', 'las dudas', 'lo que se pierde'];
  const cross = ease(interpolate(t, [0.6, 1.2], [0, 1], clamp));
  const ganarOut = interpolate(t, [dur * 0.3, dur * 0.38], [1, 0.35], clamp);
  const ats = [0.36, 0.56, 0.76].map((k) => dur * k);
  return (
    <Svg bg={C.blue}>
      <Flies cx={540} cy={1000} spread={420} n={7} seed={3} />
      <g opacity={ganarOut} transform="rotate(-6 540 420)">
        <Sticker x={540} y={480} size={190} text="GANAR" font={BLOCK} fill={C.red} stroke={C.yellow} sw={16} />
        <path d="M290 330 L790 500 M300 500 L780 340" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cross} stroke={C.ink} strokeWidth={26} strokeLinecap="round" fill="none" />
      </g>
      {items.map((txt, i) => {
        const p = pop(t, ats[i], 0.3);
        if (p <= 0) return null;
        const y = 780 + i * 230;
        const r = [-4, 3, -2][i];
        const peel = i === 2 ? interpolate(t, [ats[2] + 0.8, dur], [0, 1], clamp) : 0;
        return (
          <g key={i} transform={`translate(540 ${y}) rotate(${r + peel * 8}) scale(${p})`} opacity={1 - peel * 0.55}>
            <rect x={-420} y={-90} width={840} height={150} fill={C.white} />
            <rect x={-440} y={-104} width={110} height={40} fill={C.yellow} opacity={0.85} transform="rotate(-20 -385 -84)" />
            <text x={0} y={22} textAnchor="middle" fontFamily={SPIKY} fontSize={104} fill={C.ink}>{txt}</text>
          </g>
        );
      })}
    </Svg>
  );
};

// 8. Cuidarse: el dálmata descansa, alguien se sienta a su lado; la estrella (la grandeza) puede esperar.
const Care: React.FC<SceneProps> = ({t, dur}) => {
  const sit = ease(interpolate(t, [0.4, dur * 0.55], [0, 1], clamp));
  const pulse = 1 + Math.sin(t * 2.4) * 0.06;
  return (
    <Svg bg={C.blueNight} glow={C.blueDeep}>
      {Array.from({length: 40}).map((_, i) => (
        <circle key={i} cx={rnd(i, 21) * 1080} cy={rnd(i, 22) * 1000} r={1.5 + rnd(i, 23) * 3} fill={C.white} opacity={0.3 + 0.5 * Math.abs(Math.sin(t * 1.5 + i))} />
      ))}
      <circle cx={830} cy={420} r={260} fill="url(#yglow)" opacity={0.7} />
      <Star x={830} y={420} s={1.6 * pulse} rot={t * 6} color={C.yellow} stroke={C.ink} seed={8} />
      <path d="M0 1260 Q540 1180 1080 1260 L1080 1920 L0 1920 Z" fill={C.blue} />
      <path d="M520 1920 L600 1240 L660 1240 L900 1920 Z" fill={C.blueDeep} opacity={0.6} />
      <g opacity={sit}>
        <Person x={230} y={1010 + (1 - sit) * 40} s={1.1} color={C.ink} bun />
        <path d="M300 1150 Q380 1170 430 1215" stroke={C.ink} strokeWidth={30} strokeLinecap="round" fill="none" />
      </g>
      <Dalmatian x={600} y={1300} s={0.9} pose="rest" t={t} />
      <g opacity={sit}>
        <path d="M330 1160 Q400 1180 440 1222" stroke={C.ink} strokeWidth={30} strokeLinecap="round" fill="none" />
        <circle cx={446} cy={1226} r={20} fill={C.ink} />
      </g>
    </Svg>
  );
};

// Frase grande final (pregunta y cierre).
const Statement: React.FC<SceneProps> = ({t, sc}) => {
  const lines: string[] = (sc.text || '').split('\n');
  const hl: string[] = (sc.highlight || []).map((w: string) => w.toLowerCase());
  return (
    <Svg>
      <circle cx={540} cy={880} r={600} fill="url(#yglow)" opacity={0.18} />
      <Star x={190} y={560} s={0.7 * pop(t, 0.3)} rot={t * 15} color={C.white} stroke={C.ink} seed={2} />
      <Star x={900} y={1230} s={0.9 * pop(t, 0.6)} rot={-t * 15} color={C.yellow} stroke={C.ink} seed={6} />
      <foreignObject x={60} y={420} width={960} height={900}>
        <div style={{height: 900, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
          {lines.map((ln, i) => {
            const a = interpolate(t, [0.1 + i * 0.3, 0.6 + i * 0.3], [0, 1], clamp);
            return (
              <div key={i} style={{fontFamily: SPIKY, fontSize: sc.size || 128, lineHeight: 1.12, color: C.white, opacity: a, transform: `translateY(${(1 - a) * 20}px)`, WebkitTextStroke: `14px ${C.ink}`, paintOrder: 'stroke fill'} as React.CSSProperties}>
                {ln.split(' ').map((w, j) => (
                  <span key={j} style={{color: hl.includes(w.toLowerCase().replace(/[^\wáéíóúñ]/g, '')) ? C.yellow : C.white}}>{w} </span>
                ))}
              </div>
            );
          })}
          {sc.sub && (
            <div style={{marginTop: 56, fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: 12, color: C.yellow, opacity: interpolate(t, [1.0, 1.6], [0, 1], clamp)}}>{sc.sub}</div>
          )}
        </div>
      </foreignObject>
      {sc.fly && <FlyShape x={820} y={1330} s={2} rot={20} flap={false} />}
    </Svg>
  );
};

const SCENES: Record<string, React.FC<SceneProps>> = {
  hotel: Hotel,
  title: Title,
  samsa: Samsa,
  tracklist: Tracklist,
  kafka: Kafka,
  names: Names,
  loss: Loss,
  care: Care,
  statement: Statement,
};

// ---------- Composición ----------

export const ShortMargot: React.FC<Props> = ({spec, timings, outroStart, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const now = frame / fps;
  let idx = 0;
  timings.forEach((tm, i) => {
    if (now >= tm.sceneStart) idx = i;
  });
  const inOutro = now >= outroStart;
  const tm = timings[idx];
  const sc = inOutro ? {kind: 'statement', ...((spec as any).outroScene || {text: 'mosca'})} : ((spec.sentences[idx] as any).scene || {kind: 'statement'});
  const start = inOutro ? outroStart : tm.sceneStart;
  const end = inOutro ? outroStart + 4 : tm.sceneEnd;
  const local = now - start;
  const dur = Math.max(0.5, end - start);
  const View = SCENES[sc.kind] || Statement;
  const fadeIn = idx === 0 && !inOutro ? 1 : interpolate(local, [0, 0.3], [0, 1], clamp);
  const zoom = interpolate(local, [0, dur], [1.0, 1.05], clamp);
  const meta = (spec as any).meta || {};
  const captions = !inOutro && sc.kind !== 'statement';

  return (
    <AbsoluteFill style={{background: C.blue}}>
      <Audio src={staticFile(audioFile)} />
      <AbsoluteFill style={{opacity: fadeIn, transform: `scale(${zoom})`}}>
        <View t={local} dur={dur} sc={sc} />
      </AbsoluteFill>
      <Halftone />
      <Grain />
      {/* Marco y cabecera de la serie */}
      <div style={{position: 'absolute', inset: 34, border: `3px solid ${C.white}55`, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', left: 70, top: 66, fontFamily: SPIKY, fontSize: 64, color: C.white, display: 'flex', alignItems: 'center', gap: 14, WebkitTextStroke: `8px ${C.ink}`, paintOrder: 'stroke fill'} as React.CSSProperties}>
        <svg width={44} height={44} viewBox="-20 -20 40 40"><FlyShape x={0} y={2} s={1.3} flap={false} color={C.white} wing={C.yellow} /></svg>
        {meta.album || 'mosca'}
      </div>
      <div style={{position: 'absolute', right: 74, top: 86, fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: C.yellow, textAlign: 'right', whiteSpace: 'pre-line', lineHeight: 1.3, textShadow: `0 0 10px ${C.blueNight}, 0 3px 0 ${C.ink}`}}>
        {meta.tag || 'DETRÁS DE LA CANCIÓN'}
      </div>
      {/* Subtítulos */}
      {captions && (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 640, background: `linear-gradient(to top, ${C.blueNight}f0 38%, ${C.blueNight}00)`}} />
          <div style={{position: 'absolute', left: 90, right: 90, bottom: 240, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 60, lineHeight: 1.22, color: C.white, textShadow: `0 4px 0 ${C.ink}, 0 0 26px ${C.blueNight}, 0 0 12px ${C.blueNight}`}}>
            {tm.words.map((w, i) => {
              const act = now >= w.start && now < w.end + 0.05;
              const said = now >= w.start - 0.02;
              return (
                <span key={i} style={{opacity: said ? 1 : 0.3, color: act ? C.yellow : C.white, fontStyle: act ? 'italic' : 'normal'}}>
                  {w.w}{' '}
                </span>
              );
            })}
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
