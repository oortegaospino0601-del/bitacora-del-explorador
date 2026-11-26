// Piezas compartidas de "Historia: Luciérnagas" (ilustración plana, personajes sin rostro).
import React from 'react';

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (x: number) => {
  x = clamp(x);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const easeIn = (x: number) => Math.pow(clamp(x), 2.2);
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const rnd = (i: number, k = 0) => {
  const x = Math.sin(i * 127.1 + k * 311.7 + 0.123) * 43758.5453;
  return x - Math.floor(x);
};

export const C = {
  night0: '#060D22',
  night1: '#0B1633',
  night2: '#13244F',
  night3: '#1F3A6E',
  night4: '#2E5288',
  hill1: '#0F1F3F',
  hill2: '#0A1630',
  grass: '#0B2027',
  grass2: '#12313A',
  ffCore: '#FFFBD6',
  ffGreen: '#C8EC5E',
  warm: '#F7C66A',
  sun1: '#F6B26B',
  sun2: '#E9834E',
  sun3: '#C65F6A',
  skin: '#C98B66',
  hair: '#22181C',
  jacket: '#D2603A',
  jacketD: '#AE4A2D',
  shirt: '#EDE5D6',
  pants: '#272231',
  shoe: '#EFE6D2',
  wood: '#5A3A2A',
  woodD: '#3E271E',
  shawl: '#B9646C',
  gold: '#F4B942',
  cream: '#FFF6E6',
};

// Definiciones globales (gradientes reutilizados por todas las escenas)
export const Defs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <radialGradient id="ffGlow">
        <stop offset="0" stopColor="#F6FFB0" stopOpacity={0.95} />
        <stop offset="0.3" stopColor="#D6F06A" stopOpacity={0.45} />
        <stop offset="1" stopColor="#9ED04A" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="warmGlow">
        <stop offset="0" stopColor="#FFD889" stopOpacity={0.9} />
        <stop offset="0.45" stopColor="#F7B060" stopOpacity={0.35} />
        <stop offset="1" stopColor="#F08A4B" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="moonGlow">
        <stop offset="0" stopColor="#FFF4D8" stopOpacity={0.55} />
        <stop offset="0.4" stopColor="#BFD2FF" stopOpacity={0.14} />
        <stop offset="1" stopColor="#8FB0FF" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="screenGlow">
        <stop offset="0" stopColor="#CFE3FF" stopOpacity={0.55} />
        <stop offset="0.5" stopColor="#9DB9FF" stopOpacity={0.16} />
        <stop offset="1" stopColor="#7C9CFF" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.55} />
      </radialGradient>
      <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.night0} />
        <stop offset="0.45" stopColor={C.night1} />
        <stop offset="0.8" stopColor={C.night2} />
        <stop offset="1" stopColor={C.night3} />
      </linearGradient>
      <linearGradient id="sunsetSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1E2A60" />
        <stop offset="0.35" stopColor="#55407A" />
        <stop offset="0.62" stopColor="#C46572" />
        <stop offset="0.82" stopColor="#EE8A50" />
        <stop offset="1" stopColor="#F8C06E" />
      </linearGradient>
      <linearGradient id="duskSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.night0} />
        <stop offset="0.5" stopColor={C.night2} />
        <stop offset="0.78" stopColor="#3D4C86" />
        <stop offset="0.9" stopColor="#B4677A" />
        <stop offset="1" stopColor="#F29A57" />
      </linearGradient>
      <linearGradient id="woodTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4A3026" />
        <stop offset="1" stopColor="#38241D" />
      </linearGradient>
      <linearGradient id="photoWarm" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F3A86A" />
        <stop offset="0.7" stopColor="#F7CB82" />
        <stop offset="1" stopColor="#E9A564" />
      </linearGradient>
      <linearGradient id="liveSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#081230" />
        <stop offset="0.7" stopColor="#173068" />
        <stop offset="1" stopColor="#24457E" />
      </linearGradient>
    </defs>
  </svg>
);

// Luciérnaga: halo verde-amarillo + núcleo
export const ff = (key: string | number, x: number, y: number, r: number, a: number) =>
  a <= 0.01 ? null : (
    <g key={key} opacity={Math.min(1, a)}>
      <circle cx={x} cy={y} r={r * 5.2} fill="url(#ffGlow)" />
      <circle cx={x} cy={y} r={r} fill={C.ffCore} />
    </g>
  );

export const blink = (i: number, t: number) => 0.62 + 0.38 * Math.sin(t * (2.2 + rnd(i, 9) * 2.6) + rnd(i, 3) * 6.28);

export const Stars: React.FC<{t: number; n?: number; x0?: number; x1?: number; y0?: number; y1?: number; seed?: number; o?: number}> = ({
  t, n = 90, x0 = -300, x1 = 1380, y0 = -400, y1 = 1200, seed = 1, o = 1,
}) => (
  <g opacity={o}>
    {Array.from({length: n}).map((_, i) => {
      const x = lerp(x0, x1, rnd(i, seed));
      const y = lerp(y0, y1, rnd(i, seed + 1));
      const r = 1.2 + rnd(i, seed + 2) * 2.4;
      const a = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.6 + rnd(i, seed + 3)) + i));
      return <circle key={i} cx={x} cy={y} r={r} fill="#E8EEFF" opacity={a} />;
    })}
  </g>
);

export const Moon: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 54}) => (
  <g>
    <circle cx={x} cy={y} r={r * 5} fill="url(#moonGlow)" />
    <circle cx={x} cy={y} r={r} fill="#FFF3D6" />
    <circle cx={x - r * 0.3} cy={y - r * 0.2} r={r * 0.16} fill="#EFDFC0" />
    <circle cx={x + r * 0.28} cy={y + r * 0.3} r={r * 0.1} fill="#EFDFC0" />
  </g>
);

export const Grass: React.FC<{t: number; n: number; x0: number; x1: number; y: number; h: number; color: string; seed?: number}> = ({
  t, n, x0, x1, y, h, color, seed = 4,
}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const x = lerp(x0, x1, (i + rnd(i, seed) * 0.8) / n);
      const hh = h * (0.5 + rnd(i, seed + 1) * 0.7);
      const sway = Math.sin(t * 1.3 + i * 0.7) * 10 + (rnd(i, seed + 2) - 0.5) * 30;
      return (
        <path key={i} d={`M${x - 7},${y} Q${x + sway * 0.3},${y - hh * 0.5} ${x + sway},${y - hh} Q${x + sway * 0.2 + 4},${y - hh * 0.45} ${x + 7},${y} Z`} fill={color} />
      );
    })}
  </g>
);

// Mate (calabaza con bombilla)
export const Mate: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1={4} y1={-52} x2={30} y2={-112} stroke="#CFD3DA" strokeWidth={7} strokeLinecap="round" />
    <rect x={24} y={-118} width={14} height={8} rx={3} fill="#E6E9EE" transform="rotate(-24 31 -114)" />
    <path d="M-38,-48 C-50,-10 -40,26 0,30 C40,26 50,-10 38,-48 Z" fill="#8A5A3C" />
    <path d="M-44,-20 C-30,-12 30,-12 44,-20 L42,-8 C28,0 -28,0 -42,-8 Z" fill="#6E4430" />
    <ellipse cx={0} cy={-48} rx={38} ry={10} fill="#A8734F" />
    <ellipse cx={0} cy={-48} rx={30} ry={6} fill="#4E6B32" />
  </g>
);

// Termo
export const Termo: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-30} y={-190} width={60} height={190} rx={16} fill="#3F6B5C" />
    <rect x={-30} y={-150} width={60} height={14} fill="#355A4E" />
    <rect x={-22} y={-214} width={44} height={30} rx={8} fill="#2E2A2A" />
    <path d="M30,-150 C58,-150 58,-60 30,-60" fill="none" stroke="#2E2A2A" strokeWidth={10} />
  </g>
);

// Mecedora con chal (la silla vacía)
export const Chair: React.FC<{x: number; y: number; s?: number; shawl?: boolean; dark?: boolean}> = ({x, y, s = 1, shawl = true, dark}) => {
  const w = dark ? '#3A2620' : C.wood;
  const wd = dark ? '#2A1B16' : C.woodD;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-120,0 Q0,30 120,0" fill="none" stroke={wd} strokeWidth={14} strokeLinecap="round" />
      <rect x={-95} y={-140} width={14} height={140} fill={wd} />
      <rect x={70} y={-140} width={14} height={140} fill={wd} />
      <rect x={-110} y={-160} width={210} height={26} rx={8} fill={w} />
      <rect x={-104} y={-420} width={16} height={270} rx={6} fill={w} />
      <rect x={76} y={-420} width={16} height={270} rx={6} fill={w} />
      <rect x={-106} y={-430} width={200} height={26} rx={10} fill={w} />
      {[-58, -18, 22].map((sx) => (
        <rect key={sx} x={sx} y={-404} width={18} height={244} rx={6} fill={wd} />
      ))}
      {shawl ? (
        <g>
          <path d="M-112,-418 C-60,-380 50,-380 100,-418 L96,-250 C40,-220 -50,-220 -108,-250 Z" fill={dark ? '#7E4651' : C.shawl} />
          <path d="M-108,-250 C-50,-220 40,-220 96,-250" fill="none" stroke={dark ? '#5F343D' : '#94505A'} strokeWidth={6} />
          {Array.from({length: 11}).map((_, i) => {
            const fx = -100 + i * 19;
            return <line key={i} x1={fx} y1={-236 + Math.abs(i - 5) * 2.4} x2={fx} y2={-206 + Math.abs(i - 5) * 2.4} stroke={dark ? '#7E4651' : C.shawl} strokeWidth={4} strokeLinecap="round" />;
          })}
          {[-60, -10, 40].map((px) => (
            <path key={px} d={`M${px},-360 l12,14 l12,-14`} fill="none" stroke={dark ? '#A9606C' : '#D98A90'} strokeWidth={4} />
          ))}
        </g>
      ) : null}
    </g>
  );
};

type Arm = [number, number];
const armPts = (sx: number, sy: number, side: number, a: number, e: number, L1 = 70, L2 = 64) => {
  const r = (a * Math.PI) / 180;
  const ex = sx + side * Math.sin(r) * L1;
  const ey = sy + Math.cos(r) * L1;
  const r2 = ((a + e) * Math.PI) / 180;
  return {ex, ey, hx: ex + side * Math.sin(r2) * L2, hy: ey + Math.cos(r2) * L2};
};

// Personaje sin rostro (mismo estilo que los videos anteriores: cabello cubriendo, chaqueta naranja)
export const Boy: React.FC<{
  x: number;
  y: number;
  s?: number;
  view?: 'front' | 'back' | 'side';
  armL?: Arm;
  armR?: Arm;
  legL?: number;
  legR?: number;
  sit?: boolean;
  lookUp?: number;
  headDown?: number;
  flip?: boolean;
  hold?: React.ReactNode; // objeto en la mano derecha (side) o entre manos
  holdAt?: 'R' | 'mid';
  glowFace?: number;
}> = ({x, y, s = 1, view = 'front', armL = [8, 0], armR = [8, 0], legL = 0, legR = 0, sit, lookUp = 0, headDown = 0, flip, hold, holdAt = 'R', glowFace = 0}) => {
  const hipY = sit ? -95 : -150;
  const shY = hipY - 108;
  const headY = shY - 46 + lookUp * 6 + headDown * 6;
  const side = view === 'side';
  const W = side ? 66 : 108;
  const torso = `M${-W / 2},${shY + 20} Q${-W / 2},${shY} ${-W / 2 + 20},${shY} L${W / 2 - 20},${shY} Q${W / 2},${shY} ${W / 2},${shY + 20} L${W * 0.42},${hipY + 14} L${-W * 0.42},${hipY + 14} Z`;
  const legs = () => {
    if (sit) {
      if (side)
        return (
          <g>
            <line x1={0} y1={hipY} x2={78} y2={hipY} stroke={C.pants} strokeWidth={30} strokeLinecap="round" />
            <line x1={78} y1={hipY} x2={80} y2={-8} stroke={C.pants} strokeWidth={26} strokeLinecap="round" />
            <ellipse cx={92} cy={-4} rx={24} ry={10} fill={C.shoe} />
          </g>
        );
      return (
        <g>
          {[-20, 20].map((lx) => (
            <g key={lx}>
              <line x1={lx} y1={hipY} x2={lx * 1.3} y2={hipY + 18} stroke={C.pants} strokeWidth={32} strokeLinecap="round" />
              <line x1={lx * 1.3} y1={hipY + 18} x2={lx * 1.3} y2={-8} stroke={C.pants} strokeWidth={26} strokeLinecap="round" />
              <ellipse cx={lx * 1.3} cy={-4} rx={20} ry={10} fill={C.shoe} />
            </g>
          ))}
        </g>
      );
    }
    const leg = (lx: number, ang: number, k: string) => {
      const r = (ang * Math.PI) / 180;
      const fx = lx + Math.sin(r) * 150;
      const fy = hipY + Math.cos(r) * 150;
      return (
        <g key={k}>
          <line x1={lx} y1={hipY} x2={fx} y2={fy - 4} stroke={C.pants} strokeWidth={28} strokeLinecap="round" />
          <ellipse cx={fx + (side ? 10 : 0)} cy={fy - 4} rx={side ? 24 : 20} ry={10} fill={C.shoe} />
        </g>
      );
    };
    return side ? (
      <g>
        {leg(-4, legL, 'l')}
        {leg(4, legR, 'r')}
      </g>
    ) : (
      <g>
        {leg(-20, legL, 'l')}
        {leg(20, legR, 'r')}
      </g>
    );
  };
  const arm = (sideSign: number, ang: Arm, k: string) => {
    const sx = side ? 0 : sideSign * (W / 2 - 8);
    const p = armPts(sx, shY + 14, sideSign, ang[0], ang[1]);
    return (
      <g key={k}>
        <line x1={sx} y1={shY + 14} x2={p.ex} y2={p.ey} stroke={C.jacket} strokeWidth={26} strokeLinecap="round" />
        <line x1={p.ex} y1={p.ey} x2={p.hx} y2={p.hy} stroke={C.jacket} strokeWidth={24} strokeLinecap="round" />
        <circle cx={p.hx} cy={p.hy} r={13} fill={C.skin} />
      </g>
    );
  };
  const pR = armPts(side ? 0 : W / 2 - 8, shY + 14, 1, armR[0], armR[1]);
  const pL = armPts(side ? 0 : -(W / 2 - 8), shY + 14, -1, armL[0], armL[1]);
  const holdX = holdAt === 'mid' ? (pR.hx + pL.hx) / 2 : pR.hx;
  const holdY = holdAt === 'mid' ? (pR.hy + pL.hy) / 2 : pR.hy;
  const head = () => {
    if (view === 'back')
      return (
        <g>
          <rect x={-12} y={headY + 22} width={24} height={26} fill={C.skin} />
          <circle cx={0} cy={headY} r={37} fill={C.hair} />
          <path d={`M-37,${headY + 4} Q0,${headY + 24 - lookUp * 10} 37,${headY + 4}`} fill="none" stroke="#2E2226" strokeWidth={4} opacity={0.6} />
        </g>
      );
    if (side)
      return (
        <g>
          <rect x={-8} y={headY + 22} width={20} height={26} fill={C.skin} />
          <circle cx={6} cy={headY} r={35} fill={C.skin} />
          <path d={`M-30,${headY + 22} C-46,${headY - 10} -24,${headY - 44} 10,${headY - 38} C34,${headY - 34} 44,${headY - 20} 42,${headY - 6} C26,${headY - 14} 18,${headY - 6} 14,${headY + 6} C4,${headY + 4} -6,${headY + 16} -30,${headY + 22} Z`} fill={C.hair} />
        </g>
      );
    return (
      <g>
        <rect x={-12} y={headY + 22} width={24} height={26} fill={C.skin} />
        <circle cx={0} cy={headY} r={36} fill={C.skin} />
        <path d={`M-38,${headY + 6} C-44,${headY - 34} -12,${headY - 46} 6,${headY - 42} C32,${headY - 40} 44,${headY - 20} 38,${headY + 6} C30,${headY - 10} 12,${headY - 14} 0,${headY - 4} C-14,${headY - 14} -30,${headY - 8} -38,${headY + 6} Z`} fill={C.hair} />
      </g>
    );
  };
  const headRot = side ? -lookUp * 22 + headDown * 18 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {glowFace > 0 ? <circle cx={side ? 40 : 0} cy={headY + 10} r={150} fill="url(#screenGlow)" opacity={glowFace} /> : null}
      {legs()}
      {view === 'back' || side ? arm(-1, armL, 'al') : null}
      <path d={torso} fill={C.jacket} />
      {view === 'front' ? (
        <g>
          <path d={`M-14,${shY} L14,${shY} L12,${hipY + 10} L-12,${hipY + 10} Z`} fill={C.shirt} />
          <path d={`M-14,${shY} L-26,${shY + 40} M14,${shY} L26,${shY + 40}`} stroke={C.jacketD} strokeWidth={5} />
        </g>
      ) : null}
      {view === 'back' ? <path d={`M-22,${shY + 2} Q0,${shY + 14} 22,${shY + 2}`} fill="none" stroke={C.jacketD} strokeWidth={6} /> : null}
      <g transform={`rotate(${headRot} 0 ${shY})`}>{head()}</g>
      {view === 'front' ? arm(-1, armL, 'al') : null}
      {arm(1, armR, 'ar')}
      {hold ? <g transform={`translate(${holdX} ${holdY})`}>{hold}</g> : null}
    </g>
  );
};

// Perfil de la abuela (contorno) para la constelación de luciérnagas. Caja ~400x500, mira a la derecha.
const PROFILE: [number, number][][] = [
  // moño
  Array.from({length: 15}).map((_, i) => {
    const a = (i / 15) * Math.PI * 2;
    return [110 + Math.cos(a) * 44, 92 + Math.sin(a) * 40] as [number, number];
  }),
  [
    [150, 64], [190, 52], [232, 56], [270, 74], [298, 104], [312, 140], [316, 176], [332, 204], [346, 226],
    [330, 240], [324, 252], [332, 264], [322, 278], [326, 298], [312, 318], [284, 330], [256, 334], [252, 362], [258, 392],
    [300, 412], [344, 440], [376, 476], [396, 510],
  ],
  [
    [140, 130], [128, 170], [126, 210], [136, 250], [154, 290], [170, 330], [168, 372], [130, 402], [84, 430], [44, 466], [16, 510],
  ],
  // chal: pliegue
  [[170, 440], [210, 470], [250, 486], [290, 478]],
];
export const profilePoints = (n: number): [number, number][] => {
  const segs: [number, number, number, number][] = [];
  PROFILE.forEach((poly) => {
    for (let i = 0; i < poly.length - 1; i++) segs.push([poly[i][0], poly[i][1], poly[i + 1][0], poly[i + 1][1]]);
  });
  const lens = segs.map(([a, b, c, d]) => Math.hypot(c - a, d - b));
  const total = lens.reduce((p, q) => p + q, 0);
  const out: [number, number][] = [];
  for (let k = 0; k < n; k++) {
    let d = (k / n) * total;
    let j = 0;
    while (j < segs.length - 1 && d > lens[j]) {
      d -= lens[j];
      j++;
    }
    const f = lens[j] ? d / lens[j] : 0;
    const [a, b, c, e] = segs[j];
    out.push([lerp(a, c, f), lerp(b, e, f)]);
  }
  return out;
};

export const Hills: React.FC<{y: number; c1?: string; c2?: string; x0?: number; x1?: number}> = ({y, c1 = C.hill1, c2 = C.hill2, x0 = -800, x1 = 1900}) => (
  <g>
    <path d={`M${x0},${y + 40} C${x0 + 400},${y - 90} ${x0 + 800},${y - 40} ${x0 + 1100},${y - 20} C${x0 + 1500},${y + 10} ${x0 + 1800},${y - 120} ${x1},${y - 30} L${x1},${y + 900} L${x0},${y + 900} Z`} fill={c1} />
    <path d={`M${x0},${y + 120} C${x0 + 500},${y + 40} ${x0 + 900},${y + 70} ${x0 + 1300},${y + 60} C${x0 + 1700},${y + 50} ${x0 + 2100},${y + 10} ${x1},${y + 80} L${x1},${y + 900} L${x0},${y + 900} Z`} fill={c2} />
  </g>
);

export const House: React.FC<{x: number; y: number; s?: number; lit?: number; color?: string}> = ({x, y, s = 1, lit = 1, color = '#0C1730'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={-120} r={260} fill="url(#warmGlow)" opacity={0.35 * lit} />
    <rect x={-150} y={-200} width={300} height={200} fill={color} />
    <path d="M-180,-196 L0,-330 L180,-196 Z" fill={color} />
    <rect x={92} y={-310} width={34} height={80} fill={color} />
    <rect x={-100} y={-150} width={80} height={80} rx={6} fill={C.warm} opacity={0.4 + 0.6 * lit} />
    <rect x={30} y={-120} width={60} height={120} rx={4} fill="#1A243F" />
    <line x1={-60} y1={-150} x2={-60} y2={-70} stroke={color} strokeWidth={6} />
    <line x1={-100} y1={-110} x2={-20} y2={-110} stroke={color} strokeWidth={6} />
  </g>
);

export const Tree: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#08122A'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
    <rect x={-18} y={-260} width={36} height={260} />
    <circle cx={0} cy={-330} r={120} />
    <circle cx={-100} cy={-270} r={90} />
    <circle cx={100} cy={-270} r={95} />
    <circle cx={-40} cy={-430} r={90} />
    <circle cx={60} cy={-420} r={85} />
  </g>
);

export const Heart: React.FC<{x: number; y: number; s?: number; c?: string; o?: number}> = ({x, y, s = 1, c = '#FF4D6D', o = 1}) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} opacity={o} fill={c} d="M0,10 C-14,-2 -24,-8 -24,-18 C-24,-28 -12,-32 0,-22 C12,-32 24,-28 24,-18 C24,-8 14,-2 0,10 Z" />
);
