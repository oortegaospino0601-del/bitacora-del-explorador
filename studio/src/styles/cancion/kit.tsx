import React from 'react';

// Kit visual de la serie "historias de canciones con reproductor" (referencia:
// «Cosas que no te dije»): ilustración plana cálida, personajes sin rasgos
// (la cara queda en sombra bajo el pelo), luz de lámpara, bokeh y grano.

export const AMBER = '#f2b53a';
export const CREAM = '#fbf1de';
export const INK = '#1e130d';

export const C = {
  skin: '#c9906a',
  skinShade: '#9a6446',
  hair: '#231711',
  jacket: '#c9573b',
  jacketShade: '#a9452e',
  shirt: '#f0e6d4',
  pants: '#2c2224',
  shoes: '#ece4d6',
  herHair: '#8b3c22',
  herSkin: '#dba47c',
  herTop: '#6e9a78',
  herTopShade: '#5a8364',
  herLegs: '#7a4a32',
  black: '#1b171c',
  gold: '#e9b949',
  wall: '#4a2e1f',
  wallDark: '#2e1c13',
  floor: '#3a2418',
  night: '#1f2a4d',
  nightDeep: '#151b36',
  moon: '#fff1cf',
};

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const ease = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------- definiciones compartidas (gradientes y filtros) ----------
export const Defs: React.FC = () => (
  <defs>
    <radialGradient id="glow">
      <stop offset="0" stopColor="#ffd894" stopOpacity={0.55} />
      <stop offset="0.5" stopColor="#ffc670" stopOpacity={0.16} />
      <stop offset="1" stopColor="#ffb860" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="glowWhite">
      <stop offset="0" stopColor="#fff6e2" stopOpacity={0.9} />
      <stop offset="0.35" stopColor="#fff1d6" stopOpacity={0.35} />
      <stop offset="1" stopColor="#fff1d6" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="glowCool">
      <stop offset="0" stopColor="#bcd4ff" stopOpacity={0.5} />
      <stop offset="1" stopColor="#bcd4ff" stopOpacity={0} />
    </radialGradient>
    <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffe2a6" stopOpacity={0.55} />
      <stop offset="1" stopColor="#ffd28a" stopOpacity={0.05} />
    </linearGradient>
    <linearGradient id="spot" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fff1cf" stopOpacity={0.5} />
      <stop offset="1" stopColor="#ffd28a" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2a1f3c" />
      <stop offset="0.6" stopColor="#5a3448" />
      <stop offset="1" stopColor="#8a4a44" />
    </linearGradient>
    <linearGradient id="warmWin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#f7d79a" />
      <stop offset="1" stopColor="#e7a552" />
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" />
    </filter>
    <filter id="dof" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="9" />
    </filter>
  </defs>
);

// ---------- personajes sin rasgos ----------
export type Pose = {
  armL?: number; // grados desde abajo (positivo = hacia afuera)
  armR?: number;
  elbowL?: number; // flexión del antebrazo
  elbowR?: number;
  legL?: number;
  legR?: number;
  sit?: boolean;
  headTilt?: number;
  back?: boolean; // de espaldas
};

type PersonProps = {
  x: number;
  y: number;
  s?: number;
  who: 'him' | 'her';
  t: number;
  pose?: Pose;
  fame?: boolean; // chaqueta negra, cadena dorada y lentes oscuros
  flip?: boolean;
  opacity?: number;
  shadow?: boolean;
  noChain?: boolean;
  phone?: boolean; // celular en la mano delantera
  headphones?: boolean; // audífonos (opcional)
};

const Arm: React.FC<{sx: number; sy: number; a: number; e: number; color: string; shade: string; hand: string; len?: number; phone?: boolean}> = ({sx, sy, a, e, color, hand, len = 150, phone = false}) => {
  const u = len * 0.52;
  const f = len * 0.48;
  return (
    <g transform={`translate(${sx} ${sy}) rotate(${a})`}>
      <rect x={-13} y={-6} width={26} height={u + 10} rx={13} fill={color} />
      <g transform={`translate(0 ${u}) rotate(${e})`}>
        <rect x={-12} y={-8} width={24} height={f + 6} rx={12} fill={color} />
        {phone && (
          <g transform={`translate(0 ${f + 6}) rotate(${-(a + e)})`}>
            <rect x={-17} y={-52} width={34} height={60} rx={7} fill="#151116" />
            <rect x={-13} y={-48} width={26} height={50} rx={5} fill="#cfe6ff" />
            <circle cx={0} cy={-22} r={44} fill="url(#glowCool)" opacity={0.7} />
          </g>
        )}
        <circle cx={0} cy={f + 6} r={13} fill={hand} />
      </g>
    </g>
  );
};

export const Person: React.FC<PersonProps> = ({x, y, s = 1, who, t, pose = {}, fame = false, flip = false, opacity = 1, shadow = true, noChain = false, phone = false, headphones = false}) => {
  const him = who === 'him';
  const skin = him ? C.skin : C.herSkin;
  const top = him ? (fame ? C.black : C.jacket) : C.herTop;
  const topShade = him ? (fame ? '#121014' : C.jacketShade) : C.herTopShade;
  const legs = him ? (fame ? '#141116' : C.pants) : C.herLegs;
  const breathe = Math.sin(t * 2.1) * 2.2;
  const {armL = 8, armR = -8, elbowL = 0, elbowR = 0, legL = 0, legR = 0, sit = false, headTilt = 0, back = false} = pose;
  // sentado: tronco más bajo y piernas hacia delante
  const hipY = sit ? -95 : -135;
  const lift = sit ? 40 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={opacity}>
      {shadow && <ellipse cx={0} cy={4} rx={78} ry={11} fill="#000" opacity={0.22} />}
      {/* piernas */}
      {sit ? (
        <g>
          <rect x={-34} y={hipY + 8} width={28} height={-hipY - 12} rx={12} fill={legs} />
          <rect x={6} y={hipY + 8} width={28} height={-hipY - 12} rx={12} fill={legs} />
          <rect x={-54} y={hipY - 14} width={108} height={40} rx={18} fill={legs} />
          <ellipse cx={-20} cy={-2} rx={him ? 19 : 14} ry={8} fill={him ? C.shoes : '#3a2620'} />
          <ellipse cx={20} cy={-2} rx={him ? 19 : 14} ry={8} fill={him ? C.shoes : '#3a2620'} />
        </g>
      ) : (
        <g>
          <g transform={`translate(-16 ${hipY}) rotate(${legL})`}>
            <rect x={-13} y={0} width={27} height={-hipY - 4} rx={12} fill={legs} />
            <ellipse cx={him ? 2 : 0} cy={-hipY - 2} rx={him ? 19 : 14} ry={8} fill={him ? C.shoes : '#3a2620'} />
          </g>
          <g transform={`translate(16 ${hipY}) rotate(${legR})`}>
            <rect x={-13} y={0} width={27} height={-hipY - 4} rx={12} fill={legs} />
            <ellipse cx={him ? -2 : 0} cy={-hipY - 2} rx={him ? 19 : 14} ry={8} fill={him ? C.shoes : '#3a2620'} />
          </g>
        </g>
      )}
      <g transform={`translate(0 ${lift + breathe * 0.5})`}>
        {/* brazo trasero */}
        <Arm sx={-60} sy={-292} a={armL} e={elbowL} color={topShade} shade={topShade} hand={skin} />
        {/* torso */}
        {him ? (
          <path d="M-70 -300 Q-74 -210 -64 -128 L64 -128 Q74 -210 70 -300 Q0 -318 -70 -300 Z" fill={top} />
        ) : (
          <path d="M-56 -296 Q-62 -210 -70 -118 L70 -118 Q62 -210 56 -296 Q0 -312 -56 -296 Z" fill={top} />
        )}
        {him && !back && <rect x={-15} y={-304} width={30} height={176} fill={fame ? '#2a2630' : C.shirt} />}
        {him && fame && !noChain && !back && (
          <g>
            <path d="M-26 -300 Q0 -236 26 -300" fill="none" stroke={C.gold} strokeWidth={6} />
            <circle cx={0} cy={-248} r={9} fill={C.gold} />
            <circle cx={-4} cy={-252} r={3} fill="#fff6d0" opacity={0.6 + 0.4 * Math.sin(t * 5)} />
          </g>
        )}
        {!him && !back && <path d="M-22 -300 Q0 -282 22 -300" fill="none" stroke={C.herTopShade} strokeWidth={6} />}
        {/* cuello y cabeza */}
        <rect x={-11} y={-326} width={22} height={30} fill={C.skinShade} />
        <g transform={`translate(0 -366) rotate(${headTilt})`}>
          {!him && <path d="M-46 -30 Q-56 40 -44 88 L44 88 Q56 40 46 -30 Z" fill={C.herHair} />}
          <ellipse cx={0} cy={0} rx={40} ry={47} fill={back ? (him ? C.hair : C.herHair) : skin} />
          {!back && <path d="M-40 -6 Q0 18 40 -6 L40 -40 L-40 -40 Z" fill={C.skinShade} opacity={0.55} />}
          {him ? (
            back ? null : (
              <path d="M-42 6 Q-50 -54 0 -54 Q50 -54 42 6 L36 -8 L26 4 L16 -10 L4 4 L-8 -10 L-20 4 L-30 -8 Z" fill={C.hair} />
            )
          ) : back ? (
            <path d="M-44 -10 Q-48 -56 0 -56 Q48 -56 44 -10 L46 80 L-46 80 Z" fill={C.herHair} />
          ) : (
            <g>
              <path d="M-44 30 Q-50 -56 0 -55 Q50 -56 44 30 Q38 -16 6 -26 Q2 -8 -10 6 Q-26 -14 -44 30 Z" fill={C.herHair} />
              <path d="M2 -24 Q-2 4 -8 22" stroke="#f5e3cf" strokeWidth={3} fill="none" opacity={0.55} />
            </g>
          )}
          {him && fame && !back && <rect x={-36} y={-6} width={72} height={15} rx={7} fill="#0c0a0d" />}
          {headphones && (
            <g>
              <path d="M-44 -4 Q-50 -66 0 -66 Q50 -66 44 -4" fill="none" stroke="#2a3134" strokeWidth={9} />
              <rect x={-54} y={-14} width={18} height={34} rx={8} fill="#2f383b" />
              <rect x={36} y={-14} width={18} height={34} rx={8} fill="#2f383b" />
            </g>
          )}
        </g>
        {/* brazo delantero */}
        <Arm sx={60} sy={-292} a={armR} e={elbowR} color={top} shade={topShade} hand={skin} phone={phone} />
      </g>
    </g>
  );
};

// ---------- silueta (cabeza y hombros de perfil) ----------
export const Profile: React.FC<{x: number; y: number; s?: number; who: 'him' | 'her'; flip?: boolean; rim?: number; color?: string}> = ({x, y, s = 1, who, flip = false, rim = 1, color = '#26150d'}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    {who === 'her' && <path d="M60 -330 Q150 -300 150 -120 Q150 40 100 70 L70 70 L70 -200 Z" fill={color} />}
    <path d="M-280 380 Q-270 120 -110 80 L-60 80 L-60 -40 Q-150 -60 -160 -170 Q-170 -330 -20 -340 Q100 -340 120 -230 L150 -160 L128 -150 L132 -120 L122 -108 L130 -88 Q122 -50 70 -50 L50 -48 L50 80 L80 80 Q240 120 260 380 Z" fill={color} />
    <path d="M120 -230 L150 -160 L128 -150 L132 -120 L122 -108 L130 -88 Q122 -50 70 -50" fill="none" stroke="#f6d9a6" strokeWidth={5} opacity={rim} strokeLinejoin="round" />
    <path d="M80 80 Q240 120 260 380" fill="none" stroke="#f6d9a6" strokeWidth={4} opacity={rim * 0.7} />
  </g>
);

// ---------- ambiente ----------
export const Bokeh: React.FC<{t: number; n?: number; y0?: number; y1?: number; seed?: number; color?: string; size?: number}> = ({t, n = 14, y0 = 320, y1 = 1100, seed = 0, color = 'url(#glowWhite)', size = 1}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const k = i + seed * 31;
      const x = rnd(k) * 1080 + Math.sin(t * 0.4 + k) * 22;
      const y = y0 + ((rnd(k + 5) * (y1 - y0) - t * (6 + rnd(k + 2) * 12)) % (y1 - y0) + (y1 - y0)) % (y1 - y0);
      const r = (8 + rnd(k + 9) * 22) * size;
      return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={0.35 + 0.35 * Math.sin(t * 1.3 + k)} />;
    })}
  </g>
);

export const Notes: React.FC<{t: number; x: number; y: number; n?: number; spread?: number; color?: string; rise?: number}> = ({t, x, y, n = 5, spread = 160, color = AMBER, rise = 320}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const p = ((t * 0.35 + i / n) % 1);
      const nx = x + Math.sin(p * 6 + i * 2) * spread * 0.4 + (rnd(i) - 0.5) * spread;
      const ny = y - p * rise;
      const o = Math.sin(p * Math.PI);
      return (
        <g key={i} transform={`translate(${nx} ${ny}) rotate(${Math.sin(t * 2 + i) * 12}) scale(${0.8 + rnd(i + 3) * 0.6})`} opacity={o * 0.9}>
          <ellipse cx={0} cy={0} rx={13} ry={10} fill={color} transform="rotate(-20)" />
          <rect x={10} y={-48} width={5} height={48} fill={color} />
          {i % 2 === 0 && <path d="M15 -48 Q34 -40 30 -20" stroke={color} strokeWidth={5} fill="none" />}
        </g>
      );
    })}
  </g>
);

export const Radio: React.FC<{x: number; y: number; s?: number; t: number; on?: number}> = ({x, y, s = 1, t, on = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={-60} r={170} fill="url(#glow)" opacity={on * (0.75 + 0.15 * Math.sin(t * 4))} />
    <line x1={50} y1={-118} x2={95} y2={-190} stroke="#2a1d16" strokeWidth={5} strokeLinecap="round" />
    <rect x={-95} y={-120} width={190} height={120} rx={16} fill="#8a4a2c" />
    <rect x={-95} y={-120} width={190} height={22} rx={10} fill="#a35c37" />
    <circle cx={-42} cy={-55} r={34} fill="#3a251a" />
    {Array.from({length: 4}).map((_, i) => (
      <circle key={i} cx={-42} cy={-55} r={8 + i * 7} fill="none" stroke="#5a3a28" strokeWidth={2} />
    ))}
    <rect x={10} y={-90} width={66} height={24} rx={5} fill={on > 0.5 ? '#f6cf7a' : '#5a4030'} opacity={0.4 + 0.6 * on} />
    <rect x={38} y={-88} width={4} height={20} fill="#8a3a22" />
    <circle cx={26} cy={-34} r={10} fill="#e9d5b2" />
    <circle cx={60} cy={-34} r={10} fill="#e9d5b2" />
  </g>
);

export const Lamp: React.FC<{x: number; y: number; t: number; on?: number; h?: number}> = ({x, y, t, on = 1, h = 300}) => (
  <g>
    <path d={`M${x - 70} ${y - h + 40} L${x - 210} ${y} L${x + 210} ${y} L${x + 70} ${y - h + 40} Z`} fill="url(#cone)" opacity={on * 0.55} />
    <ellipse cx={x} cy={y - h + 40} rx={220} ry={190} fill="url(#glow)" opacity={on * (0.7 + 0.08 * Math.sin(t * 3))} />
    <rect x={x - 5} y={y - h + 40} width={10} height={h - 40} fill="#2a1a14" />
    <ellipse cx={x} cy={y} rx={55} ry={10} fill="#2a1a14" />
    <path d={`M${x - 45} ${y - h - 50} L${x + 45} ${y - h - 50} L${x + 75} ${y - h + 42} L${x - 75} ${y - h + 42} Z`} fill="#c95b42" />
    <ellipse cx={x} cy={y - h + 42} rx={75} ry={9} fill="#f3dcae" opacity={0.4 + 0.5 * on} />
  </g>
);

export const NightWindow: React.FC<{x: number; y: number; w: number; h: number; t: number; moon?: boolean; city?: boolean; lights?: number}> = ({x, y, w, h, t, moon = true, city = true, lights = 0.5}) => (
  <g>
    <rect x={x - 16} y={y - 16} width={w + 32} height={h + 32} rx={6} fill="#24160f" />
    <rect x={x} y={y} width={w} height={h} fill={C.night} />
    {Array.from({length: 18}).map((_, i) => (
      <circle key={i} cx={x + rnd(i + 40) * w} cy={y + rnd(i + 70) * h * 0.55} r={1.5 + rnd(i) * 1.6} fill="#e8eeff" opacity={0.3 + 0.4 * Math.sin(t * 2 + i)} />
    ))}
    {moon && (
      <g>
        <circle cx={x + w * 0.68} cy={y + h * 0.24} r={Math.min(w, h) * 0.2} fill="url(#glowWhite)" opacity={0.6} />
        <circle cx={x + w * 0.68} cy={y + h * 0.24} r={Math.min(w, h) * 0.075} fill={C.moon} />
      </g>
    )}
    {city &&
      Array.from({length: 6}).map((_, i) => {
        const bw = w / 6;
        const bh = h * (0.22 + rnd(i + 20) * 0.3);
        return (
          <g key={i}>
            <rect x={x + i * bw} y={y + h - bh} width={bw - 3} height={bh} fill={C.nightDeep} />
            {Array.from({length: 4}).map((__, j) => (
              <rect key={j} x={x + i * bw + 8 + (j % 2) * (bw * 0.45)} y={y + h - bh + 12 + Math.floor(j / 2) * 24} width={7} height={9} fill={AMBER} opacity={rnd(i * 5 + j) < lights ? 0.7 : 0} />
            ))}
          </g>
        );
      })}
    <rect x={x + w / 2 - 6} y={y} width={12} height={h} fill="#24160f" />
    <rect x={x} y={y + h * 0.5 - 5} width={w} height={10} fill="#24160f" />
  </g>
);

export const Mattress: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 420}) => (
  <g>
    <rect x={x} y={y - 60} width={w} height={60} rx={14} fill="#d9c7a6" />
    <rect x={x} y={y - 60} width={w} height={16} rx={8} fill="#eadbbd" />
    <rect x={x + w * 0.45} y={y - 66} width={w * 0.55} height={50} rx={14} fill="#b55b3e" opacity={0.9} />
    <rect x={x + 16} y={y - 96} width={110} height={44} rx={20} fill="#f3e8d2" />
  </g>
);

export const Crate: React.FC<{x: number; y: number; w?: number; h?: number}> = ({x, y, w = 150, h = 110}) => (
  <g>
    <rect x={x - w / 2} y={y - h} width={w} height={h} fill="#7a4a2e" />
    {[0.25, 0.55, 0.85].map((k) => (
      <rect key={k} x={x - w / 2} y={y - h + h * k - 6} width={w} height={8} fill="#5e3822" />
    ))}
  </g>
);

export const Skyline: React.FC<{y: number; t: number; color?: string; win?: string; seed?: number; lit?: number; h?: number}> = ({y, t, color = '#1a1730', win = AMBER, seed = 0, lit = 0.35, h = 1}) => (
  <g>
    {Array.from({length: 9}).map((_, i) => {
      const k = i + seed * 13;
      const bw = 100 + rnd(k) * 60;
      const bx = i * 125 - 20;
      const bh = (220 + rnd(k + 3) * 300) * h;
      return (
        <g key={i}>
          <rect x={bx} y={y - bh} width={bw} height={bh} fill={color} />
          {rnd(k + 8) > 0.6 && <rect x={bx + bw / 2 - 3} y={y - bh - 40} width={6} height={40} fill={color} />}
          {Array.from({length: 12}).map((__, j) => {
            const on = rnd(k * 7 + j) < lit;
            return on ? (
              <rect key={j} x={bx + 14 + (j % 3) * (bw / 3.4)} y={y - bh + 24 + Math.floor(j / 3) * 46} width={12} height={16} fill={win} opacity={0.55 + 0.3 * Math.sin(t * 1.5 + j + k)} />
            ) : null;
          })}
        </g>
      );
    })}
  </g>
);

export const House: React.FC<{x: number; y: number; w: number; h: number; color: string; door: string; lit?: number; t: number}> = ({x, y, w, h, color, door, lit = 0, t}) => (
  <g>
    <rect x={x} y={y - h} width={w} height={h} fill={color} />
    <rect x={x - 8} y={y - h - 16} width={w + 16} height={18} fill="#2a1a14" opacity={0.6} />
    <rect x={x + w * 0.14} y={y - h * 0.62} width={w * 0.3} height={h * 0.62} fill={door} />
    <circle cx={x + w * 0.4} cy={y - h * 0.3} r={4} fill="#e9c46a" />
    <rect x={x + w * 0.56} y={y - h * 0.72} width={w * 0.3} height={h * 0.3} fill={lit > 0 ? '#f6cf7a' : '#2a2238'} opacity={lit > 0 ? 0.6 + 0.4 * lit : 1} />
    {lit > 0 && <circle cx={x + w * 0.71} cy={y - h * 0.57} r={w * 0.4} fill="url(#glow)" opacity={lit * (0.8 + 0.1 * Math.sin(t * 3))} />}
  </g>
);

export const StreetLamp: React.FC<{x: number; y: number; t: number; h?: number}> = ({x, y, t, h = 520}) => (
  <g>
    <path d={`M${x + 40} ${y - h + 30} L${x - 150} ${y} L${x + 230} ${y} Z`} fill="url(#cone)" opacity={0.5} />
    <rect x={x - 6} y={y - h} width={12} height={h} fill="#1c1418" />
    <path d={`M${x} ${y - h} Q${x + 10} ${y - h - 40} ${x + 60} ${y - h - 30}`} stroke="#1c1418" strokeWidth={10} fill="none" />
    <rect x={x + 30} y={y - h - 34} width={46} height={18} rx={6} fill="#1c1418" />
    <ellipse cx={x + 53} cy={y - h - 14} rx={20} ry={7} fill="#ffe3a8" />
    <circle cx={x + 53} cy={y - h - 10} r={150} fill="url(#glow)" opacity={0.8 + 0.1 * Math.sin(t * 2)} />
  </g>
);

export const Phone: React.FC<{x: number; y: number; s?: number; rot?: number; lit?: number; children?: React.ReactNode}> = ({x, y, s = 1, rot = 0, lit = 1, children}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-60} y={-110} width={120} height={220} rx={20} fill="#151116" />
    <rect x={-52} y={-100} width={104} height={200} rx={14} fill={lit ? '#fbf1de' : '#2a2430'} />
    {children}
  </g>
);

export const Car: React.FC<{x: number; y: number; s?: number; color?: string; t: number; lights?: number}> = ({x, y, s = 1, color = '#16131a', t, lights = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={260} ry={16} fill="#000" opacity={0.3} />
    <path d="M-250 -30 Q-252 -80 -200 -88 L-120 -96 Q-80 -160 0 -164 Q90 -164 140 -100 L220 -86 Q258 -78 256 -30 L256 -10 L-250 -10 Z" fill={color} />
    <path d="M-100 -98 Q-70 -148 -6 -150 L-6 -98 Z" fill="#3a3550" opacity={0.85} />
    <path d="M8 -150 Q80 -148 120 -98 L8 -98 Z" fill="#3a3550" opacity={0.85} />
    <path d="M-240 -60 L240 -60" stroke={C.gold} strokeWidth={3} opacity={0.5} />
    {[-160, 160].map((wx) => (
      <g key={wx}>
        <circle cx={wx} cy={-8} r={42} fill="#0b0a0d" />
        <circle cx={wx} cy={-8} r={20} fill="#9a8f9a" />
      </g>
    ))}
    <ellipse cx={246} cy={-56} rx={12} ry={9} fill="#fff1c2" opacity={lights} />
    <ellipse cx={330} cy={-50} rx={110} ry={40} fill="url(#glowWhite)" opacity={0.5 * lights * (0.85 + 0.15 * Math.sin(t * 3))} />
  </g>
);

export const Door: React.FC<{x: number; y: number; w?: number; h?: number; open?: number; color?: string}> = ({x, y, w = 170, h = 380, open = 0, color = '#5a3524'}) => (
  <g>
    <rect x={x - 12} y={y - h - 12} width={w + 24} height={h + 12} fill="#24160f" />
    <rect x={x} y={y - h} width={w} height={h} fill="#ffdc9a" opacity={open > 0 ? 1 : 0} />
    {open > 0 && <path d={`M${x} ${y} L${x + w} ${y} L${x + w + 160 * open} ${y + 140} L${x - 80 * open} ${y + 140} Z`} fill="#ffd894" opacity={0.25 * open} />}
    <g transform={`translate(${x} 0) scale(${1 - 0.82 * open} 1)`}>
      <rect x={0} y={y - h} width={w} height={h} fill={color} />
      <rect x={18} y={y - h + 24} width={w - 36} height={h * 0.38} fill="#000" opacity={0.12} />
      <rect x={18} y={y - h * 0.5} width={w - 36} height={h * 0.38} fill="#000" opacity={0.12} />
      <circle cx={w - 26} cy={y - h * 0.48} r={8} fill={C.gold} />
    </g>
  </g>
);
