// Piezas ilustradas propias de "Si en tu mente estuve": nubes que cambian de forma,
// mariposa, vehículos, ventanas y un personaje con poses nuevas (sentado, mirando arriba,
// respirando). Mismo estilo plano y sin caras que los videos anteriores.
import React from 'react';
import {random} from 'remotion';
import {C as BASE, clamp, easeInOut, lerp, mix} from '../mundo/kit';

export {Avatar, Bubble, Cam, Glow, Heart, LiveDot, Phone, SkyGrad} from '../mundo/kit';
export {back, clamp, easeIn, easeInOut, easeOut, lerp, mix, mixMany, ramp} from '../mundo/kit';
export const W = 1080;
export const H = 1920;

export const C = {
  ...BASE,
  skyTop: '#8fa8e0',
  skyBlue: '#a9c4f0',
  pink: '#f4b8c8',
  rose: '#e98fa6',
  peach: '#ffd3a8',
  apricot: '#ffb98a',
  lavender: '#b8a6e3',
  lilac: '#8e7cc9',
  dusk: '#3d3a78',
  night: '#1f2650',
  deep: '#151a3a',
  room: '#2c3263',
  wall: '#363d73',
  wallLit: '#4a4f8a',
  windowLight: '#ffe2a8',
  mint: '#bfe8d4',
  grass: '#7cc492',
  grassDark: '#4f9a72',
  grassDeep: '#346f58',
  cloud: '#fff7f2',
  cloudShade: '#f0d9e4',
  screen: '#f6f3ff',
  ui: '#7b82c9',
};

// ───────────────────── nubes que cambian de forma ─────────────────────
type Circ = [number, number, number];
export const CLOUD_SHAPES: Record<string, Circ[]> = {
  puff: [[-125, 15, 52], [-62, -18, 68], [8, -40, 80], [80, -14, 64], [135, 18, 44], [-78, 32, 46], [0, 28, 56], [70, 32, 46], [-160, 34, 28]],
  rabbit: [[10, 30, 74], [-86, -18, 48], [-112, -78, 20], [-118, -116, 17], [-74, -86, 20], [-70, -124, 17], [88, 22, 26], [48, 88, 26], [-48, 84, 22]],
  whale: [[-82, 8, 68], [0, 0, 84], [82, 16, 60], [142, 2, 38], [186, -36, 25], [214, -60, 20], [-60, -104, 13], [-82, -134, 15], [-40, -136, 15]],
  cat: [[0, 42, 72], [-6, -14, 54], [-8, -86, 48], [-44, -130, 17], [28, -130, 17], [80, 70, 22], [116, 40, 20], [126, 0, 17], [-38, 106, 22]],
  butterfly: [[-78, -48, 62], [78, -48, 62], [-56, 46, 44], [56, 46, 44], [0, -22, 15], [0, 8, 15], [0, 38, 13], [-26, -104, 9], [26, -104, 9]],
  bird: [[0, 0, 55], [52, -8, 44], [-62, -38, 34], [18, -62, 40], [62, -84, 30], [110, 10, 26], [142, -2, 19], [-96, -34, 13], [0, 40, 30]],
  heart: [[-46, -30, 54], [46, -30, 54], [0, 8, 56], [-30, 42, 40], [30, 42, 40], [0, 72, 30], [0, 98, 17], [-72, -4, 34], [72, -4, 34]],
};

/**
 * Nube que pasa por una secuencia de formas. `keys` = [[segundo, forma], ...];
 * entre dos claves se transforma suavemente durante `morph` segundos.
 */
export const MorphCloud: React.FC<{
  x: number; y: number; s?: number; t: number; keys: [number, string][]; morph?: number;
  fill?: string; shade?: string; o?: number; wobble?: number;
}> = ({x, y, s = 1, t, keys, morph = 0.9, fill = C.cloud, shade = C.cloudShade, o = 1, wobble = 1}) => {
  let a = keys[0][1];
  let b = keys[0][1];
  let k = 0;
  for (let i = 0; i < keys.length; i++) {
    if (t >= keys[i][0]) {
      a = keys[i][1];
      b = keys[i][1];
      k = 0;
      const nx = keys[i + 1];
      if (nx && t > nx[0] - morph) {
        b = nx[1];
        k = easeInOut((t - (nx[0] - morph)) / morph);
      }
    }
  }
  const A = CLOUD_SHAPES[a];
  const B = CLOUD_SHAPES[b];
  const cs = A.map((ca, i) => {
    const cb = B[i];
    const w = Math.sin(t * 1.3 + i * 1.7) * 3 * wobble;
    return [lerp(ca[0], cb[0], k) + w, lerp(ca[1], cb[1], k) + w * 0.6, lerp(ca[2], cb[2], k)] as Circ;
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      {cs.map((c, i) => <circle key={`s${i}`} cx={c[0] + 6} cy={c[1] + 14} r={c[2]} fill={shade} />)}
      {cs.map((c, i) => <circle key={`c${i}`} cx={c[0]} cy={c[1]} r={c[2]} fill={fill} />)}
    </g>
  );
};

/** Nube simple que se desplaza en bucle horizontal. */
export const DriftCloud: React.FC<{seed: string; t: number; y: number; s?: number; speed?: number; x0?: number; x1?: number; fill?: string; shade?: string; o?: number}> = ({
  seed, t, y, s = 1, speed = 20, x0 = -400, x1 = 1480, fill = C.cloud, shade = C.cloudShade, o = 0.9,
}) => {
  const span = x1 - x0;
  const x = x0 + ((random(seed) * span + t * speed) % span);
  return <MorphCloud x={x} y={y} s={s} t={t + random(seed + 'w') * 10} keys={[[0, 'puff']]} fill={fill} shade={shade} o={o} />;
};

// ───────────────────── mariposa ─────────────────────
export const Butterfly: React.FC<{x: number; y: number; s?: number; t: number; r?: number; c1?: string; c2?: string; rest?: number}> = ({
  x, y, s = 1, t, r = 0, c1 = '#f6a6c1', c2 = '#b8a6e3', rest = 0,
}) => {
  const flap = lerp(Math.abs(Math.cos(t * 16)), 0.35 + 0.15 * Math.sin(t * 2), rest);
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <g transform={`scale(${0.2 + 0.8 * flap} 1)`}>
        <path d="M0 -4 C-30 -50 -78 -52 -70 -14 C-66 6 -30 8 0 0 Z" fill={c1} />
        <path d="M0 -4 C30 -50 78 -52 70 -14 C66 6 30 8 0 0 Z" fill={c1} />
        <path d="M0 2 C-24 8 -54 26 -40 44 C-28 56 -8 30 0 6 Z" fill={c2} />
        <path d="M0 2 C24 8 54 26 40 44 C28 56 8 30 0 6 Z" fill={c2} />
        <circle cx={-44} cy={-22} r={9} fill="#fff7f2" opacity={0.8} />
        <circle cx={44} cy={-22} r={9} fill="#fff7f2" opacity={0.8} />
      </g>
      <rect x={-4} y={-20} width={8} height={50} rx={4} fill="#3b2c4a" />
      <path d="M-2 -18 Q-12 -40 -20 -46 M2 -18 Q12 -40 20 -46" stroke="#3b2c4a" strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  );
};

// ───────────────────── vehículos (planos, sin marcas) ─────────────────────
export const Car: React.FC<{x: number; y: number; s?: number; color?: string; t?: number; dir?: 1 | -1}> = ({x, y, s = 1, color = '#e98fa6', t = 0, dir = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`}>
    <ellipse cx={0} cy={6} rx={150} ry={12} fill="#000" opacity={0.15} />
    <path d="M-150 -20 Q-150 -60 -110 -64 L-70 -66 Q-40 -116 20 -116 L60 -116 Q100 -112 120 -66 L140 -62 Q160 -58 160 -28 L160 -14 Q160 0 146 0 L-136 0 Q-150 0 -150 -20 Z" fill={color} />
    <path d="M-52 -70 Q-30 -104 10 -104 L10 -70 Z" fill="#dff0ff" opacity={0.85} />
    <path d="M24 -104 L56 -104 Q88 -100 104 -70 L24 -70 Z" fill="#dff0ff" opacity={0.85} />
    <rect x={140} y={-52} width={16} height={12} rx={4} fill="#fff3c4" />
    {[-90, 90].map((wx) => (
      <g key={wx} transform={`translate(${wx} -2) rotate(${t * 400})`}>
        <circle r={30} fill="#2c2a40" />
        <circle r={13} fill="#d9d4e8" />
        <rect x={-2} y={-13} width={4} height={26} fill="#2c2a40" />
      </g>
    ))}
  </g>
);

export const Bus: React.FC<{x: number; y: number; s?: number; color?: string; t?: number; dir?: 1 | -1}> = ({x, y, s = 1, color = '#8fb8e8', t = 0, dir = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`}>
    <ellipse cx={0} cy={6} rx={300} ry={14} fill="#000" opacity={0.15} />
    <rect x={-300} y={-230} width={600} height={226} rx={34} fill={color} />
    <rect x={-300} y={-70} width={600} height={30} fill="#fff7f2" opacity={0.5} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={-270 + i * 104} y={-200} width={86} height={90} rx={14} fill="#dff0ff" opacity={0.88} />
    ))}
    <rect x={250} y={-200} width={36} height={180} rx={10} fill="#dff0ff" opacity={0.7} />
    {[-190, 190].map((wx) => (
      <g key={wx} transform={`translate(${wx} -4) rotate(${t * 300})`}>
        <circle r={36} fill="#2c2a40" />
        <circle r={15} fill="#d9d4e8" />
        <rect x={-2} y={-15} width={4} height={30} fill="#2c2a40" />
      </g>
    ))}
  </g>
);

// ───────────────────── ventana con marco ─────────────────────
export const WindowFrame: React.FC<{x: number; y: number; w: number; h: number; frame?: string; bar?: number; sill?: string; children?: React.ReactNode; id: string; cross?: boolean}> = ({
  x, y, w, h, frame = '#2a2f5c', bar = 22, sill = '#4b5193', children, id, cross = true,
}) => (
  <g>
    <defs>
      <clipPath id={id}>
        <rect x={x} y={y} width={w} height={h} rx={10} />
      </clipPath>
    </defs>
    <g clipPath={`url(#${id})`}>{children}</g>
    <rect x={x - bar} y={y - bar} width={w + bar * 2} height={h + bar * 2} rx={18} fill="none" stroke={frame} strokeWidth={bar * 2} />
    {cross && <rect x={x + w / 2 - bar / 2} y={y} width={bar} height={h} fill={frame} />}
    {cross && <rect x={x} y={y + h * 0.42 - bar / 2} width={w} height={bar} fill={frame} />}
    <rect x={x - bar * 2.2} y={y + h + bar * 0.6} width={w + bar * 4.4} height={bar * 1.6} rx={8} fill={sill} />
  </g>
);

// ───────────────────── personaje con poses nuevas ─────────────────────
export type Pose = 'stand' | 'walk' | 'sit' | 'phoneLow' | 'sitPhone' | 'point' | 'reach' | 'cup';
/**
 * Personaje plano sin cara. (x,y) = pies (o asiento + 138 cuando está sentado).
 * s=1 => ~400px. `tilt` inclina la cabeza (negativo = mira arriba), `breath` 0..1.
 */
export const Figure: React.FC<{
  x: number; y: number; s?: number; who: 'him' | 'her'; pose?: Pose; phase?: number; facing?: 1 | -1;
  tilt?: number; breath?: number; lean?: number; slump?: number; shade?: number; tint?: string; screen?: string; screenO?: number; seated?: boolean;
}> = ({x, y, s = 1, who, pose = 'stand', phase = 0, facing = 1, tilt = 0, breath = 0, lean = 0, slump = 0, shade = 0, tint = '#1f2650', screen = '#dfe6ff', screenO = 1, seated = false}) => {
  const her = who === 'her';
  const sh = (c: string) => mix(c, tint, shade);
  const jacket = sh(her ? BASE.herTop : BASE.hisJacket);
  const jacketD = sh(her ? BASE.herTopDark : BASE.hisJacketDark);
  const hair = sh(her ? BASE.herHair : BASE.hisHair);
  const skin = sh(her ? BASE.herSkin : BASE.hisSkin);
  const pants = sh(BASE.pants);
  const pantsB = sh('#22161c');
  const shoe = sh(BASE.shoe);
  const walking = pose === 'walk';
  const sitting = seated || pose === 'sit' || pose === 'sitPhone';
  const legA = walking ? Math.sin(phase) * 18 : 0;
  const armA = walking ? -Math.sin(phase) * 16 : 0;
  const bounce = walking ? -Math.abs(Math.sin(phase)) * 4 : 0;
  const br = Math.sin(breath * Math.PI * 2) * 0.012;
  const hipY = -150;
  const legStraight = (ang: number, key: string, back = false) => (
    <g key={key} transform={`translate(0 ${hipY}) rotate(${ang})`}>
      <rect x={-13} y={0} width={26} height={140} rx={12} fill={back ? pantsB : pants} />
      <ellipse cx={8} cy={146} rx={22} ry={10} fill={shoe} />
    </g>
  );
  const legSit = (key: string, back = false, dx = 0) => (
    <g key={key} transform={`translate(${dx} ${hipY})`}>
      <rect x={-6} y={-13} width={128} height={28} rx={13} fill={back ? pantsB : pants} />
      <rect x={104} y={-4} width={26} height={132} rx={12} fill={back ? pantsB : pants} />
      <ellipse cx={126} cy={132} rx={22} ry={10} fill={shoe} />
    </g>
  );
  const arm = (ang: number, key: string, back = false, len = 118) => (
    <g key={key} transform={`translate(0 -282) rotate(${ang})`}>
      <rect x={-14} y={0} width={28} height={len} rx={14} fill={back ? jacketD : jacket} />
      <circle cx={0} cy={len + 4} r={13} fill={skin} />
    </g>
  );
  let frontArm: React.ReactNode = arm(walking ? -armA : -6 - slump * 4, 'af');
  let backArm: React.ReactNode = arm(walking ? armA : 6, 'ab', true);
  let prop: React.ReactNode = null;
  if (pose === 'phoneLow' || pose === 'sitPhone') {
    // los dos brazos sostienen el teléfono a la altura del pecho
    const py = -196 + slump * 10;
    frontArm = (
      <g>
        <g transform="translate(0 -282) rotate(-14)"><rect x={-14} y={0} width={28} height={74} rx={14} fill={jacket} /></g>
        <g transform={`translate(18 -214) rotate(-78)`}><rect x={-14} y={0} width={28} height={58} rx={14} fill={jacket} /></g>
        <circle cx={74} cy={py - 4} r={13} fill={skin} />
      </g>
    );
    backArm = (
      <g>
        <g transform="translate(0 -282) rotate(4)"><rect x={-14} y={0} width={28} height={74} rx={14} fill={jacketD} /></g>
        <g transform={`translate(-4 -212) rotate(-72)`}><rect x={-14} y={0} width={28} height={66} rx={14} fill={jacketD} /></g>
      </g>
    );
    prop = (
      <g transform={`translate(70 ${py - 22}) rotate(-12)`}>
        <rect x={-16} y={-28} width={32} height={56} rx={7} fill="#141833" />
        <rect x={-12} y={-24} width={24} height={48} rx={5} fill={screen} opacity={screenO} />
      </g>
    );
  } else if (pose === 'point') {
    frontArm = arm(-150 + Math.sin(phase) * 8, 'af', false, 122);
  } else if (pose === 'reach') {
    frontArm = arm(-78 + lean * 0.5, 'af', false, 128);
  } else if (pose === 'cup') {
    frontArm = (
      <g>
        <g transform="translate(0 -282) rotate(-20)"><rect x={-14} y={0} width={28} height={72} rx={14} fill={jacket} /></g>
        <g transform="translate(24 -216) rotate(-92)"><rect x={-14} y={0} width={28} height={60} rx={14} fill={jacket} /></g>
        <circle cx={84} cy={-218} r={13} fill={skin} />
      </g>
    );
    prop = (
      <g transform="translate(92 -232)">
        <path d="M-18 -26 L18 -26 L14 22 Q0 28 -14 22 Z" fill="#fff7f2" />
        <rect x={-19} y={-6} width={38} height={14} fill="#c98f6a" />
      </g>
    );
  }
  const headTilt = tilt + slump * 14;
  return (
    <g transform={`translate(${x} ${y + bounce}) scale(${s * facing} ${s}) rotate(${lean})`}>
      {!sitting && <ellipse cx={0} cy={6} rx={70} ry={12} fill="#000" opacity={0.18} />}
      {backArm}
      {sitting ? legSit('lb', true, -14) : legStraight(-legA, 'lb', true)}
      {sitting ? legSit('lf', false, 6) : legStraight(legA, 'lf')}
      <g transform={`translate(0 ${hipY}) rotate(${slump * 8}) scale(1 ${1 + br}) translate(0 ${-hipY})`}>
        {her ? (
          <path d="M-44 -290 Q0 -306 44 -290 L52 -150 Q0 -138 -52 -150 Z" fill={jacket} />
        ) : (
          <path d="M-48 -292 Q0 -306 48 -292 L50 -146 L-50 -146 Z" fill={jacket} />
        )}
        {!her && <path d="M-8 -296 L8 -296 L4 -150 L-4 -150 Z" fill={sh('#f3e3cf')} opacity={0.9} />}
        <g transform={`translate(0 -300) rotate(${headTilt}) translate(0 300)`}>
          <rect x={-12} y={-318} width={24} height={30} fill={skin} />
          {her && <path d="M-40 -340 Q-46 -268 -30 -250 L30 -250 Q46 -268 40 -340 Z" fill={hair} />}
          <circle cx={4} cy={-352} r={38} fill={skin} />
          {her ? (
            <path d="M-40 -350 Q-38 -398 4 -398 Q44 -398 44 -352 Q30 -372 6 -370 Q-16 -368 -26 -342 Q-32 -318 -40 -306 Z" fill={hair} />
          ) : (
            <path d="M-36 -346 Q-38 -396 4 -396 Q44 -396 42 -350 Q36 -362 20 -364 Q-2 -366 -18 -356 Q-28 -350 -36 -346 Z" fill={hair} />
          )}
        </g>
        {frontArm}
        {prop}
      </g>
    </g>
  );
};

/** Figura vista de espaldas (pelo cubre toda la cabeza), útil frente a ventanas. */
export const BackFigure: React.FC<{x: number; y: number; s?: number; who: 'him' | 'her'; tilt?: number; breath?: number; shade?: number; tint?: string; phone?: boolean; glow?: number; sway?: number}> = ({
  x, y, s = 1, who, tilt = 0, breath = 0, shade = 0, tint = '#1f2650', phone = false, glow = 0, sway = 0,
}) => {
  const her = who === 'her';
  const sh = (c: string) => mix(c, tint, shade);
  const jacket = sh(her ? BASE.herTop : BASE.hisJacket);
  const jacketD = sh(her ? BASE.herTopDark : BASE.hisJacketDark);
  const hair = sh(her ? BASE.herHair : BASE.hisHair);
  const skin = sh(her ? BASE.herSkin : BASE.hisSkin);
  const br = Math.sin(breath * Math.PI * 2) * 0.014;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${sway})`}>
      <rect x={-40} y={-150} width={34} height={150} rx={14} fill={sh(BASE.pants)} />
      <rect x={6} y={-150} width={34} height={150} rx={14} fill={sh('#22161c')} />
      <g transform={`translate(0 -150) scale(1 ${1 + br}) translate(0 150)`}>
        <path d="M-58 -296 Q0 -312 58 -296 L60 -146 L-60 -146 Z" fill={jacket} />
        <rect x={-74} y={-290} width={30} height={124} rx={15} fill={jacketD} transform="rotate(8 -60 -290)" />
        <rect x={44} y={-290} width={30} height={110} rx={15} fill={jacketD} transform="rotate(-14 60 -290)" />
        {phone && (
          <>
            {/* brazo doblado hacia delante y el teléfono asomando a un lado, con su luz */}
            <ellipse cx={92} cy={-262} rx={150 * glow + 1} ry={120 * glow + 1} fill="#cfe0ff" opacity={0.2 * glow} />
            <g transform="translate(96 -258) rotate(14)">
              <rect x={-20} y={-38} width={40} height={76} rx={8} fill="#141833" />
              <rect x={-22} y={-40} width={44} height={80} rx={9} fill="none" stroke="#dfe8ff" strokeWidth={3} opacity={0.5 + 0.5 * glow} />
            </g>
            <circle cx={78} cy={-232} r={14} fill={skin} />
            <rect x={44} y={-292} width={30} height={84} rx={15} fill={jacket} transform="rotate(-24 60 -292)" />
          </>
        )}
        <g transform={`translate(0 -310) rotate(${tilt}) translate(0 310)`}>
          <rect x={-14} y={-326} width={28} height={36} fill={skin} />
          {her && <path d="M-44 -360 Q-50 -270 -34 -250 L34 -250 Q50 -270 44 -360 Z" fill={hair} />}
          {/* cabeza de espaldas: orejas, nuca y pelo con forma */}
          <ellipse cx={-40} cy={-356} rx={9} ry={14} fill={skin} />
          <ellipse cx={40} cy={-356} rx={9} ry={14} fill={skin} />
          <ellipse cx={0} cy={-358} rx={40} ry={44} fill={skin} />
          {her ? (
            <path d="M-42 -352 Q-44 -406 0 -406 Q44 -406 42 -352 Q40 -318 30 -300 L-30 -300 Q-40 -318 -42 -352 Z" fill={hair} />
          ) : (
            <path d="M-42 -350 Q-46 -408 0 -408 Q46 -408 42 -350 Q40 -330 28 -322 Q14 -330 0 -328 Q-14 -330 -28 -322 Q-40 -330 -42 -350 Z" fill={hair} />
          )}
          <path d="M-22 -392 Q0 -402 22 -392" stroke={sh(her ? '#b05a3a' : '#4a3a4a')} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
        </g>
      </g>
    </g>
  );
};

/** Hierba que se mece (franja de hojas). */
export const Grass: React.FC<{seed: string; x0: number; x1: number; y: number; h: number; t: number; color: string; n?: number; wind?: number}> = ({
  seed, x0, x1, y, h, t, color, n = 60, wind = 1,
}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const x = lerp(x0, x1, (i + random(`${seed}${i}`)) / n);
      const hh = h * (0.6 + 0.6 * random(`${seed}h${i}`));
      const bend = Math.sin(t * 1.6 + x * 0.008) * 18 * wind;
      return <path key={i} d={`M${x - 9} ${y} Q${x + bend * 0.4} ${y - hh * 0.6} ${x + bend} ${y - hh} Q${x + 4} ${y - hh * 0.5} ${x + 9} ${y} Z`} fill={color} />;
    })}
  </g>
);

/** Luciérnagas / motas de luz. */
export const Motes: React.FC<{seed: string; n: number; x0: number; x1: number; y0: number; y1: number; t: number; color?: string; size?: number; rise?: number}> = ({
  seed, n, x0, x1, y0, y1, t, color = '#fff3c4', size = 1, rise = 0,
}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const ph = (random(`${seed}p${i}`) + t * rise * (0.6 + random(`${seed}v${i}`) * 0.8)) % 1;
      const x = lerp(x0, x1, random(`${seed}x${i}`)) + Math.sin(t * 0.8 + i) * 20;
      const y = rise ? lerp(y1, y0, ph) : lerp(y0, y1, random(`${seed}y${i}`)) + Math.cos(t * 0.7 + i) * 14;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (1 + random(`${seed}f${i}`) * 2) + i));
      const r = (2.5 + random(`${seed}r${i}`) * 4) * size;
      return (
        <g key={i} opacity={tw * (rise ? Math.sin(ph * Math.PI) : 1)}>
          <circle cx={x} cy={y} r={r * 3} fill={color} opacity={0.18} />
          <circle cx={x} cy={y} r={r} fill={color} />
        </g>
      );
    })}
  </g>
);

/** Estrellas tenues. */
export const Stars: React.FC<{seed: string; n: number; x0: number; x1: number; y0: number; y1: number; t: number; o?: number}> = ({seed, n, x0, x1, y0, y1, t, o = 1}) => (
  <g opacity={o}>
    {Array.from({length: n}).map((_, i) => {
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(t * (0.8 + random(`${seed}f${i}`) * 2) + i * 2));
      return <circle key={i} cx={lerp(x0, x1, random(`${seed}x${i}`))} cy={lerp(y0, y1, random(`${seed}y${i}`))} r={1.5 + random(`${seed}r${i}`) * 2.5} fill="#fff7f2" opacity={tw} />;
    })}
  </g>
);

/** Marcas de "visto" (doble check), sin texto. */
export const Checks: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#7b82c9'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M0 8 L7 15 L20 0" />
    <path d="M10 13 L13 15 L26 0" />
  </g>
);

/** Ojo (indicador de visto) y reloj sin números. */
export const EyeIcon: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#7b82c9'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-18 0 Q0 -16 18 0 Q0 16 -18 0 Z" fill="none" stroke={color} strokeWidth={3.5} />
    <circle r={5.5} fill={color} />
  </g>
);
export const ClockIcon: React.FC<{x: number; y: number; s?: number; color?: string; t?: number}> = ({x, y, s = 1, color = '#7b82c9', t = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth={3.5} fill="none" strokeLinecap="round">
    <circle r={13} />
    <path d={`M0 0 L0 -8`} transform={`rotate(${t * 40})`} />
    <path d={`M0 0 L6 0`} transform={`rotate(${t * 4})`} />
  </g>
);

/** Indicador de "escribiendo" (tres puntos en burbuja). */
export const TypingDots: React.FC<{x: number; y: number; t: number; s?: number; o?: number; fill?: string; dot?: string}> = ({
  x, y, t, s = 1, o = 1, fill = '#e7e3f7', dot = '#8e7cc9',
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={0} y={0} width={96} height={50} rx={25} fill={fill} />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={26 + i * 22} cy={25 - Math.max(0, Math.sin(t * 7 - i * 0.9)) * 7} r={7} fill={dot} />
    ))}
  </g>
);

/** Teléfono pequeño reflejado (para cristales). */
export const clampN = clamp;
