import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-500-italic.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/cormorant-garamond/latin-600-italic.css';
import '@fontsource/courier-prime/latin-400.css';
import {Props} from '../../types';

// Paleta de la era «mosca»: tonos tierra, texturas crudas, luz cálida de lámpara.
const C = {
  earth: '#17120c',
  soil: '#2a2117',
  mud: '#3a2d1f',
  clay: '#6b4f33',
  ochre: '#c08a45',
  amber: '#e2b169',
  bone: '#ebdfc8',
  rust: '#9c4a2a',
  olive: '#5f5a3c',
  ink: '#0d0a07',
};
const SERIF = "'Cormorant Garamond', Georgia, serif";
const MONO = "'Courier Prime', 'Courier New', monospace";

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = (t: number) => t * t * (3 - 2 * t);

// ---------- Elementos comunes ----------

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.32, pointerEvents: 'none'}}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 9} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="1080" height="1920" filter="url(#grain)" />
    </svg>
  );
};

const Vignette: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(8,6,3,0.75) 100%)', pointerEvents: 'none'}} />
);

const FlyShape: React.FC<{x: number; y: number; s?: number; rot?: number; flap: boolean; color?: string}> = ({x, y, s = 1, rot = 0, flap, color = C.ink}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={-7} cy={-6} rx={11} ry={flap ? 4 : 7} fill={C.bone} opacity={0.38} transform="rotate(-25)" />
    <ellipse cx={7} cy={-6} rx={11} ry={flap ? 4 : 7} fill={C.bone} opacity={0.38} transform="rotate(25)" />
    <ellipse cx={0} cy={2} rx={6} ry={10} fill={color} />
    <circle cx={0} cy={-9} r={5.5} fill={color} />
    <circle cx={-3} cy={-10} r={2} fill={C.rust} />
    <circle cx={3} cy={-10} r={2} fill={C.rust} />
  </g>
);

// Moscas que zumban alrededor de un punto. leave: 0..1 se van volando fuera del cuadro.
const Flies: React.FC<{cx: number; cy: number; spread: number; n: number; seed?: number; leave?: number; s?: number}> = ({cx, cy, spread, n, seed = 1, leave = 0, s = 1.4}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const k = i * 12.9898 + seed * 78.233;
        const r1 = Math.abs(Math.sin(k) * 43758.5453) % 1;
        const r2 = Math.abs(Math.sin(k * 1.7) * 24634.6345) % 1;
        const sp = 0.6 + r1 * 1.2;
        let x = cx + Math.sin(t * sp * 1.3 + r2 * 9) * spread * (0.35 + r1 * 0.65) + Math.sin(t * 5.1 + i) * 9;
        let y = cy + Math.cos(t * sp * 0.9 + r1 * 7) * spread * 0.55 * (0.35 + r2 * 0.65) + Math.cos(t * 6.3 + i) * 7;
        const ang = r1 * Math.PI * 2;
        const go = ease(Math.min(1, Math.max(0, leave * 1.3 - r2 * 0.3)));
        x += Math.cos(ang) * 1300 * go;
        y += Math.sin(ang) * 1300 * go - 300 * go;
        const rot = Math.sin(t * 3 + i) * 40 + (go > 0 ? (ang * 180) / Math.PI + 90 : 0);
        return <FlyShape key={i} x={x} y={y} s={s * (0.8 + r2 * 0.5)} rot={rot} flap={(frame + i) % 2 === 0} />;
      })}
    </g>
  );
};

// Silueta de espaldas (como en las ilustraciones de referencia): cabeza + hombros.
const Back: React.FC<{x: number; y: number; s?: number; color?: string; hair?: string; phones?: boolean}> = ({x, y, s = 1, color = C.ink, hair, phones}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-120 260 C-120 120 -90 70 0 70 C90 70 120 120 120 260 Z" fill={color} />
    <rect x={-24} y={30} width={48} height={50} fill={color} />
    <circle cx={0} cy={0} r={56} fill={color} />
    {hair && <path d="M-56 4 C-58 -20 -50 -38 -40 -46 M56 4 C58 -20 50 -38 40 -46" stroke={hair} strokeWidth={14} strokeLinecap="round" fill="none" />}
    {phones && (
      <>
        <path d="M-60 -6 C-60 -80 60 -80 60 -6" stroke={C.clay} strokeWidth={12} fill="none" />
        <rect x={-74} y={-18} width={24} height={46} rx={10} fill={C.clay} />
        <rect x={50} y={-18} width={24} height={46} rx={10} fill={C.clay} />
      </>
    )}
  </g>
);

// Persona de frente, muy simple (estilo ilustración plana).
const Front: React.FC<{x: number; y: number; s?: number; skin: string; shirt: string; hair: string; old?: boolean}> = ({x, y, s = 1, skin, shirt, hair, old}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-110 330 C-110 150 -80 110 0 110 C80 110 110 150 110 330 Z" fill={shirt} />
    <path d="M-26 110 L0 150 L26 110 Z" fill={skin} />
    <rect x={-20} y={60} width={40} height={56} fill={skin} />
    <ellipse cx={0} cy={0} rx={58} ry={66} fill={skin} />
    {old ? (
      <>
        <path d="M-60 0 C-66 -40 -54 -58 -40 -60 M60 0 C66 -40 54 -58 40 -60" stroke={hair} strokeWidth={16} strokeLinecap="round" fill="none" />
        <circle cx={-22} cy={2} r={15} stroke={C.ink} strokeWidth={4} fill="none" opacity={0.75} />
        <circle cx={22} cy={2} r={15} stroke={C.ink} strokeWidth={4} fill="none" opacity={0.75} />
        <line x1={-7} y1={2} x2={7} y2={2} stroke={C.ink} strokeWidth={4} opacity={0.75} />
        <path d="M-20 34 Q0 46 20 34" stroke={C.ink} strokeWidth={4} fill="none" opacity={0.6} />
      </>
    ) : (
      <>
        <path d="M-58 -10 C-60 -70 60 -70 58 -10 C40 -40 -40 -40 -58 -10 Z" fill={hair} />
        <circle cx={-20} cy={4} r={5} fill={C.ink} />
        <circle cx={20} cy={4} r={5} fill={C.ink} />
        <path d="M-16 32 Q0 42 16 32" stroke={C.ink} strokeWidth={4} fill="none" opacity={0.6} />
      </>
    )}
  </g>
);

const Glow: React.FC<{cx: number; cy: number; r: number; color?: string; o?: number}> = ({cx, cy, r, color = C.amber, o = 0.55}) => (
  <circle cx={cx} cy={cy} r={r} fill={`url(#glow-${color.slice(1)})`} opacity={o} />
);
const GlowDefs: React.FC = () => (
  <defs>
    {[C.amber, C.ochre, C.rust, C.bone].map((c) => (
      <radialGradient key={c} id={`glow-${c.slice(1)}`}>
        <stop offset="0%" stopColor={c} stopOpacity={0.9} />
        <stop offset="45%" stopColor={c} stopOpacity={0.25} />
        <stop offset="100%" stopColor={c} stopOpacity={0} />
      </radialGradient>
    ))}
  </defs>
);

const Svg: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg = C.earth}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
    <GlowDefs />
    <rect width={1080} height={1920} fill={bg} />
    {children}
  </svg>
);

// ---------- Escenas ----------

type SceneProps = {t: number; dur: number; sc: any};

const Studio: React.FC<SceneProps> = ({t}) => {
  const rec = Math.floor(t * 1.6) % 2 === 0;
  const buzz = Math.floor(t * 2.2) % 3 === 0;
  const jx = buzz ? Math.sin(t * 90) * 4 : 0;
  return (
    <Svg bg={C.soil}>
      <rect x={0} y={0} width={1080} height={1240} fill={C.mud} />
      <rect x={640} y={240} width={330} height={420} fill={C.ink} />
      {Array.from({length: 26}).map((_, i) => (
        <rect key={i} x={660 + ((i * 53) % 290)} y={300 + ((i * 97) % 340)} width={8} height={10} fill={C.amber} opacity={0.35 + ((i * 7) % 5) / 10} />
      ))}
      <rect x={630} y={230} width={350} height={440} fill="none" stroke={C.clay} strokeWidth={14} />
      <rect x={300} y={560} width={480} height={300} rx={10} fill={C.ink} />
      <rect x={316} y={576} width={448} height={268} fill={C.soil} />
      <path d={Array.from({length: 40}).map((_, i) => `${i ? 'L' : 'M'}${330 + i * 10.8} ${710 + Math.sin(i * 0.9 + t * 6) * (20 + (i % 7) * 7)}`).join(' ')} stroke={C.amber} strokeWidth={4} fill="none" />
      <circle cx={350} cy={605} r={11} fill={rec ? C.rust : C.mud} />
      <text x={370} y={614} fontFamily={MONO} fontSize={26} fill={C.bone} opacity={0.75}>REC</text>
      <Glow cx={540} cy={710} r={420} o={0.35} />
      <rect x={120} y={600} width={150} height={260} rx={12} fill={C.ink} />
      <circle cx={195} cy={780} r={50} fill={C.mud} />
      <rect x={810} y={600} width={150} height={260} rx={12} fill={C.ink} />
      <circle cx={885} cy={780} r={50} fill={C.mud} />
      <rect x={60} y={1180} width={960} height={60} fill={C.clay} />
      <rect x={60} y={1240} width={960} height={680} fill={C.soil} />
      {Array.from({length: 14}).map((_, i) => (
        <g key={i}>
          <rect x={250 + i * 42} y={1110} width={6} height={60} fill={C.ink} />
          <rect x={243 + i * 42} y={1120 + ((i * 13) % 34)} width={20} height={12} fill={C.bone} />
        </g>
      ))}
      <g transform={`translate(${830 + jx} 1150)`}>
        <rect x={0} y={0} width={110} height={34} rx={8} fill={C.ink} />
        <rect x={6} y={4} width={98} height={26} rx={5} fill={buzz ? C.amber : C.mud} />
        {buzz && <Glow cx={55} cy={17} r={110} o={0.6} />}
      </g>
      <Back x={540} y={1010} s={1.25} phones />
      <Flies cx={540} cy={520} spread={260} n={5} seed={2} />
    </Svg>
  );
};

const TitleCard: React.FC<SceneProps> = ({t, sc}) => {
  const a = interpolate(t, [0.1, 1.2], [0, 1], clamp);
  const land = ease(interpolate(t, [0.2, 1.8], [0, 1], clamp));
  return (
    <Svg>
      <Glow cx={540} cy={860} r={620} color={C.ochre} o={0.28} />
      <text x={540} y={880} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontWeight={500} fontSize={196} fill={C.bone} opacity={a} letterSpacing={2}>
        {sc.big || 'santurce'}
      </text>
      <line x1={340} x2={740} y1={950} y2={950} stroke={C.ochre} strokeWidth={2} opacity={a} />
      <text x={540} y={1020} textAnchor="middle" fontFamily={MONO} fontSize={40} fill={C.ochre} letterSpacing={14} opacity={a}>
        {sc.sub || 'NSQK'}
      </text>
      <text x={540} y={1080} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize={46} fill={C.bone} opacity={a * 0.7}>
        {sc.sub2 || 'del álbum mosca'}
      </text>
      <FlyShape x={interpolate(land, [0, 1], [1100, 786])} y={interpolate(land, [0, 1], [500, 770]) + Math.sin(land * 12) * 40 * (1 - land)} s={2.1} rot={land < 1 ? -60 : 10} flap={land < 1 && Math.floor(t * 30) % 2 === 0} />
    </Svg>
  );
};

const Book: React.FC<SceneProps> = ({t}) => {
  const n = Math.min(12, 2 + Math.floor(t * 3));
  return (
    <Svg bg={C.soil}>
      <Glow cx={540} cy={900} r={700} color={C.amber} o={0.22} />
      <g transform="translate(540 960) rotate(-3)">
        <rect x={-330} y={-470} width={660} height={940} fill={C.ink} opacity={0.5} transform="translate(18 22)" />
        <rect x={-330} y={-470} width={660} height={940} fill={C.bone} />
        <rect x={-330} y={-470} width={36} height={940} fill={C.clay} opacity={0.4} />
        <text x={0} y={-340} textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize={76} fill={C.ink} letterSpacing={3}>la metamorfosis</text>
        <text x={0} y={-285} textAnchor="middle" fontFamily={MONO} fontSize={30} fill={C.clay} letterSpacing={10}>FRANZ KAFKA</text>
        <rect x={-240} y={-220} width={480} height={600} fill={C.clay} opacity={0.35} />
        <rect x={40} y={-120} width={150} height={360} fill={C.amber} />
        <Glow cx={115} cy={60} r={260} o={0.5} />
        <path d="M-120 240 C-150 150 -140 60 -100 40 C-60 60 -50 150 -80 240 Z" fill={C.ink} opacity={0.8} />
        <circle cx={-100} cy={20} r={30} fill={C.ink} opacity={0.8} />
        <line x1={-240} x2={240} y1={240} y2={240} stroke={C.ink} strokeWidth={4} opacity={0.4} />
      </g>
      <Flies cx={655} cy={700} spread={330} n={n} seed={5} />
    </Svg>
  );
};

const Shadow: React.FC<SceneProps> = ({t, dur}) => {
  const p = ease(interpolate(t, [0.4, Math.max(1, dur * 0.85)], [0, 1], clamp));
  const sway = Math.sin(t * 1.4) * 4;
  return (
    <Svg bg={C.mud}>
      <line x1={300 + sway} y1={0} x2={300} y2={360} stroke={C.ink} strokeWidth={4} />
      <circle cx={300} cy={385} r={26} fill={C.amber} />
      <Glow cx={300} cy={390} r={700} o={0.55} />
      <rect x={0} y={1420} width={1080} height={500} fill={C.soil} />
      <g transform="translate(700 850) scale(2.1)" opacity={0.85}>
        <path d="M-90 280 C-90 120 -70 80 0 80 C70 80 90 120 90 280 Z" fill={C.ink} />
        <circle cx={0} cy={20} r={50} fill={C.ink} />
        <g opacity={p} stroke={C.ink} strokeWidth={9} fill="none" strokeLinecap="round">
          <path d="M-20 -26 C-40 -80 -70 -100 -100 -110" />
          <path d="M20 -26 C40 -80 70 -100 100 -110" />
          <path d="M-85 140 L-170 100 L-200 150" />
          <path d="M-88 190 L-180 200 L-210 260" />
          <path d="M-90 240 L-160 290 L-170 350" />
          <path d="M85 140 L170 100 L200 150" />
          <path d="M88 190 L180 200 L210 260" />
          <path d="M90 240 L160 290 L170 350" />
        </g>
      </g>
      <Back x={330} y={1180} s={1} color={C.ink} />
      <rect x={210} y={1440} width={240} height={480} fill={C.ink} />
    </Svg>
  );
};

const Stage: React.FC<SceneProps> = ({t, dur}) => {
  const off = interpolate(t, [dur * 0.25, dur * 0.95], [1, 0], clamp);
  return (
    <Svg bg={C.ink}>
      <path d="M440 0 L640 0 L860 1500 L220 1500 Z" fill={C.amber} opacity={0.12 + 0.12 * off} />
      <ellipse cx={540} cy={1500} rx={330} ry={60} fill={C.amber} opacity={0.18 + 0.2 * off} />
      <line x1={540} y1={1500} x2={540} y2={1000} stroke={C.clay} strokeWidth={10} />
      <path d="M540 1500 L460 1540 M540 1500 L620 1540 M540 1500 L540 1550" stroke={C.clay} strokeWidth={10} />
      <rect x={522} y={930} width={36} height={80} rx={18} fill={C.bone} opacity={0.85} />
      {Array.from({length: 140}).map((_, i) => {
        const x = (i * 97.3) % 1080;
        const y = 1580 + ((i * 41) % 320);
        const o = off * (0.4 + ((i * 13) % 6) / 10) * (0.7 + 0.3 * Math.sin(t * 3 + i));
        return <rect key={i} x={x} y={y} width={10} height={16} rx={2} fill={C.amber} opacity={o} />;
      })}
    </Svg>
  );
};

const Photo: React.FC<SceneProps> = ({t}) => {
  const a = interpolate(t, [0, 1.4], [0, 1], clamp);
  return (
    <Svg bg={C.soil}>
      <Glow cx={540} cy={900} r={700} color={C.ochre} o={0.3} />
      <g transform={`translate(540 940) rotate(${-5 + a * 2})`}>
        <rect x={-360} y={-470} width={720} height={900} fill={C.ink} opacity={0.5} transform="translate(16 20)" />
        <rect x={-360} y={-470} width={720} height={900} fill={C.bone} />
        <defs>
          <linearGradient id="sep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d7b98a" />
            <stop offset="0.55" stopColor="#c99e64" />
            <stop offset="0.56" stopColor="#a7814f" />
            <stop offset="1" stopColor="#8a6a40" />
          </linearGradient>
          <clipPath id="ph"><rect x={-310} y={-420} width={620} height={660} /></clipPath>
        </defs>
        <rect x={-310} y={-420} width={620} height={660} fill="url(#sep)" />
        <g clipPath="url(#ph)" opacity={0.25 + 0.75 * a}>
          <Front x={-100} y={-140} s={1.15} skin="#c49a6c" shirt="#e8dcc3" hair="#f2efe6" old />
          <Front x={150} y={-10} s={0.85} skin="#a77a50" shirt="#e9e2d0" hair="#2a2117" />
        </g>
        <rect x={-310} y={-420} width={620} height={660} fill={C.bone} opacity={0.25 * (1 - a)} />
      </g>
    </Svg>
  );
};

const Chair: React.FC<SceneProps> = ({t, dur}) => {
  const fade = interpolate(t, [0, dur], [1, 0.35], clamp);
  const ang = t * 120;
  return (
    <Svg bg={C.mud}>
      <rect x={120} y={360} width={340} height={520} fill={C.amber} opacity={fade} />
      <line x1={290} y1={360} x2={290} y2={880} stroke={C.clay} strokeWidth={14} />
      <line x1={120} y1={620} x2={460} y2={620} stroke={C.clay} strokeWidth={14} />
      <rect x={110} y={350} width={360} height={540} fill="none" stroke={C.clay} strokeWidth={18} />
      <Glow cx={290} cy={620} r={560} o={0.45 * fade} />
      <rect x={0} y={1350} width={1080} height={570} fill={C.soil} />
      <path d={`M120 1350 L460 1350 L${700} 1800 L${260} 1800 Z`} fill={C.amber} opacity={0.22 * fade} />
      <g transform="translate(800 400)">
        <circle r={90} fill={C.bone} />
        <circle r={90} fill="none" stroke={C.clay} strokeWidth={10} />
        <line x1={0} y1={0} x2={0} y2={-60} stroke={C.ink} strokeWidth={8} strokeLinecap="round" transform={`rotate(${ang})`} />
        <line x1={0} y1={0} x2={0} y2={-40} stroke={C.ink} strokeWidth={10} strokeLinecap="round" transform={`rotate(${ang / 12})`} />
      </g>
      <g transform="translate(700 1100)" fill={C.ink}>
        <rect x={-110} y={-330} width={22} height={600} />
        <rect x={88} y={-330} width={22} height={600} />
        <rect x={-110} y={-330} width={220} height={22} />
        <rect x={-110} y={-210} width={220} height={18} />
        <rect x={-130} y={30} width={260} height={30} />
        <rect x={-130} y={60} width={20} height={240} />
        <rect x={110} y={60} width={20} height={240} />
      </g>
    </Svg>
  );
};

const Beach: React.FC<SceneProps> = ({t}) => (
  <Svg bg={C.soil}>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.soil} />
        <stop offset="0.5" stopColor={C.rust} />
        <stop offset="0.85" stopColor={C.amber} />
      </linearGradient>
    </defs>
    <rect width={1080} height={1100} fill="url(#sky)" />
    <circle cx={540} cy={1100} r={150} fill={C.bone} opacity={0.9} />
    <Glow cx={540} cy={1100} r={600} color={C.amber} o={0.6} />
    <rect y={1100} width={1080} height={300} fill={C.clay} />
    {Array.from({length: 9}).map((_, i) => (
      <line key={i} x1={300 + Math.sin(t * 0.8 + i) * 60 - i * 10} x2={780 + Math.sin(t * 0.8 + i) * 60 + i * 10} y1={1120 + i * 30} y2={1120 + i * 30} stroke={C.amber} strokeWidth={4} opacity={0.5 - i * 0.04} />
    ))}
    <path d={`M0 ${1290 + Math.sin(t) * 10} C300 ${1260 + Math.sin(t) * 10} 700 ${1320} 1080 1280 L1080 1920 L0 1920 Z`} fill={C.mud} />
    <Back x={430} y={1150} s={1.05} color={C.ink} hair={C.bone} />
    <Back x={680} y={1225} s={0.68} color={C.ink} />
    <rect x={300} y={1400} width={480} height={520} fill={C.mud} />
  </Svg>
);

const Piano: React.FC<SceneProps> = ({t}) => {
  const pressed = [3, 7, 5, 10, 8, 12, 9, 4];
  const cur = pressed[Math.floor(t * 1.4) % pressed.length];
  return (
    <Svg bg={C.ink}>
      <Glow cx={540} cy={700} r={760} color={C.amber} o={0.3} />
      <path d={Array.from({length: 90}).map((_, i) => `${i ? 'L' : 'M'}${i * 12.2} ${520 + Math.sin(i * 0.35 + t * 3) * Math.sin(i * 0.07) * 90}`).join(' ')} stroke={C.bone} strokeWidth={3} fill="none" opacity={0.6} />
      <g transform="translate(540 980) rotate(-8) translate(-700 0)">
        {Array.from({length: 18}).map((_, i) => (
          <rect key={i} x={i * 78} y={0} width={74} height={480} rx={6} fill={i === cur ? C.amber : C.bone} transform={i === cur ? 'translate(0 8)' : undefined} />
        ))}
        {Array.from({length: 18}).map((_, i) => ([0, 1, 3, 4, 5].includes(i % 7) ? <rect key={i} x={i * 78 + 52} y={0} width={46} height={290} rx={4} fill={C.ink} /> : null))}
      </g>
    </Svg>
  );
};

const Silence: React.FC<SceneProps> = ({t, dur}) => {
  const leave = interpolate(t, [0.3, dur * 0.8], [0, 1], clamp);
  const a = interpolate(t, [dur * 0.45, dur * 0.85], [0, 1], clamp);
  return (
    <Svg>
      <Glow cx={540} cy={880} r={520} color={C.ochre} o={0.18} />
      <Flies cx={540} cy={880} spread={300} n={26} seed={9} leave={leave} />
      <text x={540} y={900} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize={110} fill={C.bone} opacity={a}>
        silencio.
      </text>
    </Svg>
  );
};

const Statement: React.FC<SceneProps & {final?: boolean}> = ({t, sc}) => {
  const lines: string[] = (sc.text || '').split('\n');
  const hl: string[] = (sc.highlight || []).map((w: string) => w.toLowerCase());
  return (
    <Svg>
      <Glow cx={540} cy={860} r={560} color={C.ochre} o={0.2} />
      <foreignObject x={80} y={420} width={920} height={900}>
        <div style={{height: 900, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
          {lines.map((ln, i) => {
            const a = interpolate(t, [0.15 + i * 0.35, 0.9 + i * 0.35], [0, 1], clamp);
            return (
              <div key={i} style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: sc.size || 108, lineHeight: 1.08, color: C.bone, opacity: a, transform: `translateY(${(1 - a) * 18}px)`}}>
                {ln.split(' ').map((w, j) => (
                  <span key={j} style={{color: hl.includes(w.toLowerCase().replace(/[^\wáéíóúñ]/g, '')) ? C.amber : C.bone}}>{w} </span>
                ))}
              </div>
            );
          })}
          {sc.sub && (
            <div style={{marginTop: 48, fontFamily: MONO, fontSize: 32, letterSpacing: 10, color: C.ochre, opacity: interpolate(t, [1.2, 2], [0, 1], clamp)}}>{sc.sub}</div>
          )}
        </div>
      </foreignObject>
      {sc.fly && <FlyShape x={820} y={1230} s={1.8} rot={20} flap={false} />}
    </Svg>
  );
};

const SCENES: Record<string, React.FC<SceneProps>> = {
  studio: Studio,
  title: TitleCard,
  book: Book,
  shadow: Shadow,
  stage: Stage,
  photo: Photo,
  chair: Chair,
  beach: Beach,
  piano: Piano,
  silence: Silence,
  statement: Statement,
};

// ---------- Composición ----------

export const ShortMosca: React.FC<Props> = ({spec, timings, outroStart, audioFile}) => {
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
  const fadeIn = idx === 0 && !inOutro ? 1 : interpolate(local, [0, 0.45], [0, 1], clamp);
  const zoom = interpolate(local, [0, dur], [1.0, 1.06], clamp);
  const meta = (spec as any).meta || {};

  return (
    <AbsoluteFill style={{background: C.earth}}>
      <Audio src={staticFile(audioFile)} />
      <AbsoluteFill style={{opacity: fadeIn, transform: `scale(${zoom})`}}>
        <View t={local} dur={dur} sc={sc} />
      </AbsoluteFill>
      <Vignette />
      <Grain />
      {/* Marco de impresión y cabecera */}
      <div style={{position: 'absolute', inset: 34, border: `2px solid ${C.bone}33`, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', left: 74, top: 78, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 54, color: C.bone, display: 'flex', alignItems: 'center', gap: 14}}>
        <svg width={40} height={40} viewBox="-20 -20 40 40"><FlyShape x={0} y={2} s={1.3} flap={false} color={C.bone} /></svg>
        {meta.album || 'mosca'}
      </div>
      <div style={{position: 'absolute', right: 74, top: 96, fontFamily: MONO, fontSize: 28, letterSpacing: 6, color: C.ochre, textAlign: 'right', whiteSpace: 'pre-line', lineHeight: 1.3}}>
        {meta.tag || 'DETRÁS DE LA CANCIÓN'}
      </div>
      {/* Subtítulos */}
      {!inOutro && sc.kind !== 'statement' && (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 620, background: `linear-gradient(to top, ${C.earth}f2 35%, ${C.earth}00)`}} />
          <div style={{position: 'absolute', left: 96, right: 96, bottom: 250, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 62, lineHeight: 1.2, color: C.bone}}>
            {tm.words.map((w, i) => {
              const act = now >= w.start && now < w.end + 0.05;
              const said = now >= w.start - 0.02;
              return (
                <span key={i} style={{opacity: said ? 1 : 0.28, color: act ? C.amber : C.bone, fontStyle: act ? 'italic' : 'normal'}}>
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
