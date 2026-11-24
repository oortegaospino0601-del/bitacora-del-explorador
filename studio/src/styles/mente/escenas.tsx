// Escenas de "Si en tu mente estuve". Cada escena recibe t (s desde que empieza),
// d (duración) y at(palabra) => segundo local en que el narrador dice esa palabra.
import React from 'react';
import {random} from 'remotion';
import {
  Avatar, BackFigure, Bubble, Bus, Butterfly, C, Cam, Car, Checks, ClockIcon, DriftCloud, EyeIcon, Figure, Glow, Grass, H,
  Heart, LiveDot, MorphCloud, Motes, Phone, SkyGrad, Stars, TypingDots, W, WindowFrame, back, clamp, easeIn, easeInOut,
  easeOut, lerp, mix, mixMany, ramp,
} from './kit';

export type SceneProps = {t: number; d: number; at: (word: string, fallback?: number) => number};

const Svg: React.FC<{children: React.ReactNode; bg?: string; style?: React.CSSProperties}> = ({children, bg = C.night, style}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, background: bg, ...style}}>
    {children}
  </svg>
);

/** Deriva suave de cámara en mano (muy leve, distinta al temblor de otros videos). */
const drift = (t: number, a = 6) => ({x: Math.sin(t * 0.7) * a + Math.sin(t * 1.9) * a * 0.3, y: Math.cos(t * 0.6) * a * 0.8});
/** Zoom continuo en escala logarítmica. */
const zlerp = (a: number, b: number, k: number) => Math.exp(lerp(Math.log(a), Math.log(b), k));

/** Corazones que suben (live). */
const HeartsUp: React.FC<{seed: string; n: number; x: number; y0: number; y1: number; t: number; spread?: number; s?: number}> = ({seed, n, x, y0, y1, t, spread = 60, s = 1}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const ph = (t * (0.45 + random(`${seed}v${i}`) * 0.4) + random(`${seed}p${i}`)) % 1;
      const xx = x + Math.sin(ph * 7 + i) * spread * (0.4 + ph);
      const yy = lerp(y0, y1, ph);
      const cols = ['#ff6b8a', '#f6a6c1', '#ffb98a', '#b8a6e3'];
      return <Heart key={i} x={xx} y={yy} s={s * (0.9 + 0.7 * ph)} o={Math.sin(ph * Math.PI)} fill={cols[i % 4]} r={Math.sin(ph * 5 + i) * 15} />;
    })}
  </g>
);

/** Pantalla de chat genérica (sin texto). w x h locales. */
const ChatHeader: React.FC<{w: number; h?: number}> = ({w, h = 110}) => (
  <g>
    <rect width={w} height={h} fill="#ebe7fb" />
    <path d={`M30 ${h / 2 - 14} L18 ${h / 2} L30 ${h / 2 + 14}`} stroke={C.ui} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Avatar x={82} y={h / 2} r={30} who="her" bg="#f6c6a8" />
    <rect x={128} y={h / 2 - 16} width={120} height={14} rx={7} fill="#5a5f99" />
    <rect x={128} y={h / 2 + 8} width={70} height={10} rx={5} fill="#a7abd6" />
  </g>
);
const Msg: React.FC<{x: number; y: number; w: number; mine?: boolean; lines?: number; o?: number}> = ({x, y, w, mine, lines = 1, o = 1}) => {
  const h = 30 + lines * 20;
  return (
    <g transform={`translate(${x} ${y})`} opacity={o}>
      <rect width={w} height={h} rx={22} fill={mine ? '#c9bdf2' : '#ffffff'} />
      {Array.from({length: lines}).map((_, i) => (
        <rect key={i} x={20} y={18 + i * 20} width={(w - 40) * (i === lines - 1 ? 0.7 : 1)} height={10} rx={5} fill={mine ? '#7e6fc0' : '#b9b6d6'} />
      ))}
    </g>
  );
};

// ───────────────────────────── 1. GANCHO: ventana al amanecer ─────────────────────────────
export const Hook: React.FC<SceneProps> = ({t, d, at}) => {
  const e = easeInOut(t / d);
  const dr = drift(t, 5);
  const tPeq = at('pequeños.', 4.2);
  const glow = 0.6 + 0.4 * Math.sin(t * 3);
  const sky = ['#7f98d8', '#b6aee6', '#f2b9cf', '#ffd3a8'];
  return (
    <Svg bg={C.wall}>
      <Cam px={lerp(600, 560, e) + dr.x} py={lerp(820, 700, e) + dr.y} s={lerp(1.16, 1.4, e)} r={lerp(-1.6, 0.8, e)}>
        <SkyGrad id="hk-wall" stops={['#2f3568', '#3a4078', '#2b3060']} />
        <WindowFrame id="hk-win" x={150} y={250} w={780} h={860} frame="#252a55" sill="#454b8a">
          <SkyGrad id="hk-sky" stops={sky} x={150} y={250} w={780} h={860} />
          <Glow id="hk-sun" cx={720} cy={1060} r={520} color="#fff0c8" o={0.75} />
          <DriftCloud seed="hk-a" t={t} y={380} s={0.55} speed={14} o={0.7} />
          <DriftCloud seed="hk-b" t={t} y={860} s={0.45} speed={22} o={0.65} />
          <MorphCloud x={560 - t * 8} y={560} s={1.3} t={t} keys={[[0, 'puff'], [1.5, 'rabbit'], [3.7, 'whale']]} morph={1.0} />
          {/* ciudad lejana en tonos pastel */}
          {Array.from({length: 11}).map((_, i) => {
            const hh = 90 + random(`hk-c${i}`) * 170;
            return <rect key={i} x={150 + i * 74} y={1110 - hh} width={70} height={hh} fill={i % 2 ? '#a99bd6' : '#b9a9df'} />;
          })}
          {/* mariposa que cruza (adelanta los detalles pequeños) */}
          {t > tPeq - 1.4 && (
            <Butterfly x={lerp(980, 430, ramp(t, tPeq - 1.4, d))} y={760 + Math.sin(t * 4) * 40} s={0.5} t={t} r={-10} />
          )}
          {/* reflejo del teléfono en el cristal */}
          <g opacity={0.2 + 0.08 * glow} transform="translate(612 720) rotate(6)">
            <rect x={-80} y={-150} width={160} height={300} rx={22} fill="#e8ecff" />
            <Avatar x={-40} y={-112} r={18} who="her" bg="#f6c6a8" />
            <rect x={-14} y={-118} width={70} height={10} rx={5} fill="#7b82c9" />
            <rect x={-60} y={-60} width={90} height={30} rx={14} fill="#ffffff" />
            <rect x={-20} y={-12} width={84} height={30} rx={14} fill="#c9bdf2" />
            <rect x={-60} y={36} width={70} height={30} rx={14} fill="#ffffff" />
          </g>
        </WindowFrame>
        {/* rayos de luz de ventana */}
        <path d="M150 250 L930 250 L1300 1900 L-200 1900 Z" fill="#ffe2c4" opacity={0.07 + 0.02 * Math.sin(t)} />
        {/* taza con vapor en el alféizar */}
        <g transform="translate(830 1110)">
          <path d="M-34 -64 L34 -64 L28 0 L-28 0 Z" fill="#f6a6c1" />
          <path d="M34 -50 Q56 -46 50 -26 Q46 -16 30 -18" stroke="#f6a6c1" strokeWidth={9} fill="none" />
          {[0, 1].map((i) => (
            <path key={i} d={`M${-10 + i * 18} -74 q${10 + Math.sin(t * 2 + i) * 6} -26 0 -50 q-10 -24 0 -48`} stroke="#fff7f2" strokeWidth={6} fill="none" opacity={0.45} strokeLinecap="round" />
          ))}
        </g>
        <g transform="translate(250 1110)">
          <path d="M-30 -50 L30 -50 L24 0 L-24 0 Z" fill="#e98f6c" />
          {[-30, 0, 30].map((a) => <ellipse key={a} cx={0} cy={-80} rx={14} ry={36} fill="#7cc492" transform={`rotate(${a + Math.sin(t + a) * 3} 0 -50)`} />)}
        </g>
        {/* él, de espaldas, con el teléfono encendido */}
        <Glow id="hk-ph" cx={600} cy={1010} r={300} color="#cfe0ff" o={0.3 * glow} />
        <BackFigure x={360} y={1660} s={2.5} who="him" shade={0.22} tint="#1f2650" phone glow={glow} breath={t / 4} tilt={lerp(-4, -10, e)} sway={Math.sin(t * 0.8) * 0.6} />
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 2. ESCRIBE Y BORRA (vista cenital) ─────────────────────────────
export const Typing: React.FC<SceneProps> = ({t, d, at}) => {
  const tEsc = at('escribía…', 2.4);
  const tBor = at('borraba', 3.4);
  // ciclos de escribir/borrar
  const cyc = (a: number, b: number, c: number) => (t < a ? 0 : t < b ? easeOut((t - a) / (b - a)) : 1 - easeIn(clamp((t - b) / (c - b))));
  const L = t < 1.9 ? cyc(0.1, 1.2, 1.7) : cyc(tEsc - 0.5, tBor - 0.05, tBor + 0.45);
  const deleting = (t > 1.2 && t < 1.7) || (t > tBor - 0.05 && t < tBor + 0.45);
  const typing = !deleting && L > 0 && L < 1;
  const caret = Math.sin(t * 9) > 0 ? 1 : 0;
  // luz de ventana que cruza la cama: los días pasan
  const sweep = (t * 0.9) % 1;
  const day = Math.floor(t * 0.9) % 2 === 0;
  const e = easeInOut(t / d);
  const thumbY = typing ? Math.abs(Math.sin(t * 14)) * 10 : deleting ? Math.abs(Math.sin(t * 20)) * 8 : 0;
  return (
    <Svg bg="#4c5498">
      <Cam px={540} py={780} s={lerp(1.02, 1.16, e)} r={lerp(-6, 4, e)}>
        <rect x={-600} y={-600} width={2300} height={3200} fill="#4c5498" />
        {/* pliegues de la sábana */}
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M-500 ${200 + i * 380} Q300 ${120 + i * 380} 1600 ${260 + i * 380}`} stroke="#5d66ad" strokeWidth={60} fill="none" opacity={0.6} />
        ))}
        <polygon points={`${lerp(-900, 1500, sweep)},-400 ${lerp(-500, 1900, sweep)},-400 ${lerp(-100, 2300, sweep)},2400 ${lerp(-500, 1900, sweep)},2400`}
          fill={day ? '#ffe2a8' : '#a9c4f0'} opacity={0.22} />
        <Phone id="ty-ph" x={540} y={760} w={460} h={880} r={-4} body="#151a3a" screen="#f6f3ff">
          <ChatHeader w={460} />
          <Msg x={24} y={150} w={250} />
          <Msg x={186} y={234} w={250} mine lines={2} />
          <Msg x={24} y={344} w={200} />
          <Msg x={226} y={428} w={210} mine />
          <Msg x={24} y={512} w={280} lines={2} o={0.95} />
          {/* barra de escritura */}
          <rect x={18} y={640} width={350} height={58} rx={29} fill="#ffffff" stroke="#d9d4f2" strokeWidth={3} />
          {[0, 1, 2].map((i) => {
            const seg = clamp(L * 3 - i);
            return seg > 0 ? <rect key={i} x={40 + i * 104} y={662} width={92 * seg} height={14} rx={7} fill="#5a5f99" /> : null;
          })}
          <rect x={42 + L * 300} y={656} width={4} height={26} fill={C.ui} opacity={caret} />
          <circle cx={406} cy={669} r={28} fill={L > 0.05 ? C.lilac : '#cfcbe6'} />
          <path d="M394 669 L420 669 M410 659 L420 669 L410 679" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />
          {/* teclado */}
          <rect x={0} y={714} width={460} height={166} fill="#e3e0f2" />
          {Array.from({length: 27}).map((_, i) => {
            const r = Math.floor(i / 9);
            const c = i % 9;
            const hot = typing && Math.floor(t * 12) % 27 === (i * 7) % 27;
            return <rect key={i} x={14 + c * 49} y={728 + r * 48} width={42} height={40} rx={8} fill={hot ? '#c9bdf2' : '#ffffff'} />;
          })}
          <rect x={400} y={824} width={52} height={40} rx={8} fill={deleting ? '#e98fa6' : '#d2cde8'} />
          <path d="M416 844 L426 834 L444 834 L444 854 L426 854 Z" fill="none" stroke="#fff" strokeWidth={3} />
        </Phone>
        {/* pulgares */}
        <g transform={`translate(${250 + (typing ? Math.sin(t * 9) * 26 : 0)} ${1290 + thumbY}) rotate(28)`}>
          <rect x={-70} y={40} width={140} height={600} rx={60} fill={C.hisJacket} />
          <rect x={-34} y={-90} width={68} height={170} rx={34} fill={C.hisSkin} />
          <ellipse cx={0} cy={-80} rx={26} ry={20} fill="#c58e6a" />
        </g>
        <g transform={`translate(${840 + (deleting ? 40 : 0)} ${1290 + (deleting ? thumbY : 0)}) rotate(-28)`}>
          <rect x={-70} y={40} width={140} height={600} rx={60} fill={C.hisJacket} />
          <rect x={-34} y={-90} width={68} height={170} rx={34} fill={C.hisSkin} />
          <ellipse cx={0} cy={-80} rx={26} ry={20} fill="#c58e6a" />
        </g>
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 3. VISTO SIN RESPUESTA (zoom out de la pantalla al cuarto) ─────────────────────────────
const SeenScreen: React.FC<{t: number}> = ({t}) => {
  // ventanas de "escribiendo" que aparecen y desaparecen
  const dots = (t > 0.5 && t < 1.25) || (t > 1.75 && t < 2.15);
  return (
    <g>
      <rect width={240} height={420} fill="#f6f3ff" />
      <rect width={240} height={64} fill="#ebe7fb" />
      <Avatar x={44} y={32} r={20} who="her" bg="#f6c6a8" />
      <rect x={74} y={22} width={70} height={10} rx={5} fill="#5a5f99" />
      <rect x={74} y={38} width={40} height={7} rx={3.5} fill="#a7abd6" />
      <Msg x={12} y={90} w={130} />
      <g transform="translate(86 170) scale(0.62)">
        <rect width={230} height={70} rx={22} fill="#c9bdf2" />
        <rect x={20} y={18} width={170} height={10} rx={5} fill="#7e6fc0" />
        <rect x={20} y={38} width={110} height={10} rx={5} fill="#7e6fc0" />
      </g>
      <Checks x={190} y={222} s={0.7} color="#6f8de0" />
      <EyeIcon x={140} y={230} s={0.5} color="#8e7cc9" />
      <ClockIcon x={116} y={230} s={0.42} color="#8e7cc9" t={t} />
      {dots && <TypingDots x={12} y={262} t={t} s={0.62} />}
      <rect x={10} y={378} width={180} height={30} rx={15} fill="#ffffff" stroke="#d9d4f2" strokeWidth={2} />
    </g>
  );
};
export const Seen: React.FC<SceneProps> = ({t, d}) => {
  const k = easeInOut(ramp(t, 0.15, d - 0.2));
  // teléfono del personaje (coordenadas de mundo)
  const fx = 420;
  const fy = 1390;
  const fs = 1.1;
  const phX = fx + 70 * fs;
  const phY = fy - 218 * fs;
  const s = zlerp(13, 1.55, k);
  const px = lerp(phX, 540, k);
  const py = lerp(phY, 1060, k);
  const slump = 0.3 + 0.5 * k;
  return (
    <Svg bg={C.room}>
      <Cam px={px} py={py} s={s}>
        <rect x={-400} y={-400} width={1900} height={2800} fill="#262c5a" />
        {/* ventana nocturna */}
        <WindowFrame id="se-win" x={620} y={420} w={340} h={460} frame="#1e2350" sill="#2f3570">
          <SkyGrad id="se-sky" stops={['#1b2150', '#30357a', '#5a4f9a']} x={620} y={420} w={340} h={460} />
          <circle cx={850} cy={520} r={38} fill="#fff3d6" />
          <Stars seed="se" n={18} x0={630} x1={950} y0={440} y1={860} t={t} />
        </WindowFrame>
        {/* cama */}
        <rect x={40} y={1180} width={1020} height={90} rx={30} fill="#5d66ad" />
        <rect x={40} y={1250} width={1020} height={300} rx={20} fill="#3b4285" />
        <rect x={680} y={1140} width={260} height={70} rx={34} fill="#e8e4fa" opacity={0.85} />
        <Glow id="se-gl" cx={phX} cy={phY} r={420} color="#cfe0ff" o={0.35} />
        <Figure x={fx} y={fy} s={fs} who="him" pose="sitPhone" seated shade={0.25} tint="#1f2650" breath={t / 4} slump={slump} screenO={0} />
        {/* teléfono detallado en sus manos */}
        <g transform={`translate(${phX} ${phY}) rotate(-12)`}>
          <rect x={-17.6} y={-30.8} width={35.2} height={61.6} rx={7} fill="#141833" />
          <g transform="translate(-13.2 -26.4) scale(0.11)">
            <SeenScreen t={t} />
          </g>
        </g>
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 4. LAS NUBES Y SUS ANIMALES (lo que imagina de ella) ─────────────────────────────
export const Clouds: React.FC<SceneProps> = ({t, d, at}) => {
  const tN = at('nubes,', 2.6);
  const tA = at('animales', 4.2);
  const crane = easeInOut(ramp(t, 0.3, tN + 0.4));
  const e = easeInOut(t / d);
  return (
    <Svg bg={C.skyBlue}>
      <Cam px={lerp(470, 560, e)} py={lerp(1280, 640, crane) - e * 30} s={lerp(1.18, 1.0, crane)} r={lerp(2, -1, e)}>
        <SkyGrad id="cl-sky" stops={['#8ea9e6', '#a9c4f0', '#d8c6ef', '#ffd9c0']} y={-300} h={2100} />
        <Glow id="cl-sun" cx={900} cy={1100} r={600} color="#fff3d6" o={0.6} />
        <DriftCloud seed="cl-1" t={t} y={220} s={0.5} speed={12} o={0.6} />
        <DriftCloud seed="cl-2" t={t} y={960} s={0.6} speed={18} o={0.7} />
        <MorphCloud x={300 + t * 6} y={470} s={1.1} t={t} keys={[[0, 'puff'], [tN + 1.0, 'rabbit']]} />
        <MorphCloud x={790 - t * 5} y={330} s={0.95} t={t} keys={[[0, 'puff'], [tA + 0.3, 'whale']]} />
        <MorphCloud x={700 + t * 4} y={760} s={0.85} t={t} keys={[[0, 'puff'], [tA + 1.2, 'cat']]} />
        {/* colinas */}
        <path d="M-400 1330 Q200 1180 700 1300 T1600 1260 L1600 2400 L-400 2400 Z" fill={C.grass} />
        <path d="M-400 1460 Q300 1360 900 1470 T1700 1440 L1700 2400 L-400 2400 Z" fill={C.grassDark} />
        <Grass seed="cl-g" x0={-300} x1={1500} y={1470} h={60} t={t} color={C.grassDark} n={70} />
        {[[120, 1350], [820, 1330], [960, 1420]].map(([fx, fy], i) => (
          <g key={i} transform={`translate(${fx} ${fy})`}>
            <rect x={-2} y={0} width={4} height={30} fill="#3f8a63" />
            {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-8} rx={6} ry={11} fill={i % 2 ? '#fff7f2' : '#f6a6c1'} transform={`rotate(${a + t * 20} 0 0)`} />)}
            <circle r={5} fill="#ffd36b" />
          </g>
        ))}
        {/* ella, en el césped, señalando las nubes */}
        <Figure x={360} y={1440} s={1.15} who="her" pose="point" phase={t * 2} tilt={-16 + Math.sin(t * 1.2) * 3} breath={t / 3.5} />
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 5. LA CALLE: CARROS Y AUTOBUSES ─────────────────────────────
const MiniCar: React.FC<{x: number; y: number; bus?: boolean; s?: number}> = ({x, y, bus, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {bus ? (
      <>
        <rect x={-30} y={-22} width={60} height={34} rx={8} fill="#8fb8e8" />
        <rect x={-24} y={-16} width={14} height={12} rx={3} fill="#fff" />
        <rect x={-6} y={-16} width={14} height={12} rx={3} fill="#fff" />
        <rect x={12} y={-16} width={12} height={12} rx={3} fill="#fff" />
        <circle cx={-16} cy={14} r={7} fill="#2c2a40" />
        <circle cx={16} cy={14} r={7} fill="#2c2a40" />
      </>
    ) : (
      <>
        <path d="M-28 6 L-28 -6 Q-26 -12 -16 -12 L-8 -24 L12 -24 L20 -12 Q28 -12 28 -4 L28 6 Z" fill="#e98fa6" />
        <circle cx={-14} cy={8} r={7} fill="#2c2a40" />
        <circle cx={14} cy={8} r={7} fill="#2c2a40" />
      </>
    )}
  </g>
);
export const Street: React.FC<SceneProps> = ({t, d}) => {
  const e = easeInOut(t / d);
  const passes: {tc: number; bus: boolean; dir: 1 | -1; color: string; lane: number}[] = [
    {tc: 0.35, bus: false, dir: -1, color: '#e98fa6', lane: 0},
    {tc: 1.05, bus: true, dir: 1, color: '#8fb8e8', lane: 1},
    {tc: 1.75, bus: false, dir: -1, color: '#ffb98a', lane: 0},
    {tc: 2.45, bus: true, dir: 1, color: '#b8a6e3', lane: 1},
  ];
  const counted = passes.filter((p) => t > p.tc);
  const lastC = counted.length ? counted[counted.length - 1].tc : -9;
  const bob = Math.exp(-(t - lastC) * 6) * Math.sin((t - lastC) * 20) * 6;
  const look = passes.reduce((acc, p) => acc + Math.exp(-Math.pow((t - p.tc) * 2.4, 2)) * p.dir, 0);
  return (
    <Svg bg={C.peach}>
      <Cam px={lerp(460, 640, e)} py={820} s={lerp(1.08, 1.0, e)}>
        <SkyGrad id="st-sky" stops={['#a9c4f0', '#f2c6d6', '#ffe0c0']} x={-600} w={2400} />
        <DriftCloud seed="st-c" t={t} y={330} s={0.55} speed={30} x0={-500} x1={1700} />
        {/* fachadas pastel */}
        {Array.from({length: 9}).map((_, i) => {
          const hh = 380 + random(`st-h${i}`) * 260;
          const cols = ['#f4b8c8', '#bfe8d4', '#c9bdf2', '#ffd3a8', '#a9c4f0'];
          const x = -400 + i * 230;
          return (
            <g key={i}>
              <rect x={x} y={960 - hh} width={220} height={hh} fill={cols[i % 5]} />
              {Array.from({length: Math.floor(hh / 110)}).map((_, r) => (
                <g key={r}>
                  <rect x={x + 30} y={960 - hh + 40 + r * 110} width={60} height={70} rx={8} fill="#fff7f2" opacity={0.7} />
                  <rect x={x + 130} y={960 - hh + 40 + r * 110} width={60} height={70} rx={8} fill="#fff7f2" opacity={0.7} />
                </g>
              ))}
            </g>
          );
        })}
        <rect x={-600} y={950} width={2400} height={40} fill="#e7dcef" />
        <rect x={-600} y={990} width={2400} height={170} fill="#8a86b8" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={-560 + i * 300} y={1070} width={140} height={10} rx={5} fill="#f6f3ff" opacity={0.8} />)}
        {passes.filter((p) => p.lane === 1).map((p, i) => {
          const x = 560 + (t - p.tc) * 780 * p.dir;
          return <Bus key={`b${i}`} x={x} y={1060} s={0.62} color={p.color} t={t} dir={p.dir} />;
        })}
        {passes.filter((p) => p.lane === 0).map((p, i) => {
          const x = 560 + (t - p.tc) * 1000 * p.dir;
          return <Car key={`c${i}`} x={x} y={1150} s={0.72} color={p.color} t={t} dir={p.dir} />;
        })}
        <rect x={-600} y={1160} width={2400} height={400} fill="#efe6f4" />
        {/* parada */}
        <rect x={720} y={760} width={12} height={420} fill="#7b82c9" />
        <circle cx={726} cy={750} r={34} fill="#7b82c9" />
        <rect x={712} y={738} width={28} height={24} rx={4} fill="#fff7f2" />
        <Figure x={560} y={1290} s={0.95} who="her" pose="stand" facing={look >= 0 ? 1 : -1} tilt={-4 + bob * 0.4} breath={t / 3} lean={bob * 0.3} />
        {/* conteo sin números: cada vehículo que pasa aparece en su burbuja */}
        <g transform="translate(560 640)">
          <rect x={-170} y={-60} width={340} height={110} rx={40} fill="#fff7f2" opacity={clamp(t * 4)} />
          <path d="M-20 48 L0 80 L20 48 Z" fill="#fff7f2" opacity={clamp(t * 4)} />
          {counted.map((p, i) => {
            const k = back(clamp((t - p.tc) / 0.35));
            return <MiniCar key={i} x={-120 + i * 80} y={-6} bus={p.bus} s={1.2 * k} />;
          })}
        </g>
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 6. LA VE EN VIVO, DESDE LEJOS (enfoque que cambia) ─────────────────────────────
export const Live: React.FC<SceneProps> = ({t, d, at}) => {
  const tL = at('lejos.', d - 1.2);
  const k = easeInOut(ramp(t, tL - 1.2, tL + 0.2));
  const fx = 790;
  const fy = 1190;
  const fs = 0.55;
  const hx = fx + 70 * fs;
  const hy = fy - 218 * fs;
  const bgBlur = 16 * (1 - k);
  const phS = lerp(1, 0.06, k);
  const phX = lerp(540, hx, k);
  const phY = lerp(740, hy, k);
  const e = easeInOut(t / d);
  return (
    <>
      <Svg bg="#d9c6ef" style={{filter: `blur(${bgBlur}px)`}}>
        <Cam px={lerp(560, 640, e)} py={lerp(820, 860, e)} s={lerp(1.15, 1.05, e)}>
          <SkyGrad id="lv-sky" stops={['#9fa8e2', '#d4bfe8', '#ffc9b2', '#ffe2c0']} />
          <Glow id="lv-sun" cx={300} cy={1000} r={500} color="#fff0c8" o={0.7} />
          <DriftCloud seed="lv-c1" t={t} y={420} s={0.7} speed={10} />
          <DriftCloud seed="lv-c2" t={t} y={640} s={0.5} speed={16} />
          {Array.from({length: 14}).map((_, i) => {
            const hh = 160 + random(`lv-h${i}`) * 300;
            return <rect key={i} x={-300 + i * 130} y={1100 - hh} width={120} height={hh + 600} fill={i % 2 ? '#a597d4' : '#8e82c4'} />;
          })}
          <rect x={-400} y={1190} width={2000} height={700} fill="#6c64a8" />
          <rect x={560} y={1170} width={600} height={30} fill="#7d75ba" />
          <Figure x={fx} y={fy} s={fs} who="him" pose="sitPhone" seated breath={t / 4} slump={0.3} screen="#ffd9e4" />
          <Glow id="lv-ph" cx={hx} cy={hy} r={70} color="#ffd9e4" o={0.6} />
        </Cam>
      </Svg>
      <Svg bg="transparent" style={{opacity: 1 - ramp(k, 0.82, 1)}}>
        <g transform={`translate(${phX} ${phY}) scale(${phS}) rotate(${lerp(-3, -12, k)}) translate(-540 -740)`}>
          <Phone id="lv-phone" x={540} y={740} w={520} h={900} body="#151a3a" screen="#f4dff0">
            <SkyGrad id="lv-room" stops={['#f6d6e6', '#e9d4f4', '#d4c6f0']} x={0} y={0} w={520} h={900} />
            <rect x={300} y={140} width={160} height={200} rx={14} fill="#fff7f2" opacity={0.6} />
            <ellipse cx={120} cy={760} rx={170} ry={40} fill="#c7b2e6" />
            <g transform={`rotate(${Math.sin(t * 1.6) * 2} 260 1000)`}>
              <Figure x={260} y={1180} s={1.75} who="her" pose={Math.sin(t * 2) > 0.2 ? 'point' : 'stand'} phase={t * 6} tilt={Math.sin(t * 1.4) * 5} breath={t / 3} />
            </g>
            {/* píldora "en vivo" sin texto + espectadores */}
            <rect x={24} y={60} width={96} height={42} rx={21} fill="#ff3b5c" />
            <circle cx={50} cy={81} r={9} fill="#fff" opacity={0.6 + 0.4 * Math.sin(t * 6)} />
            <rect x={66} y={75} width={40} height={12} rx={6} fill="#fff" opacity={0.85} />
            <rect x={130} y={60} width={92} height={42} rx={21} fill="#000" opacity={0.25} />
            <EyeIcon x={156} y={81} s={0.7} color="#fff" />
            <rect x={176} y={75} width={32} height={12} rx={6} fill="#fff" opacity={0.85} />
            <LiveDot x={480} y={82} t={t} s={0.8} />
            <HeartsUp seed="lv-h" n={14} x={440} y0={780} y1={260} t={t} spread={40} s={1.4} />
            {/* comentarios que suben (burbujas sin texto) */}
            {Array.from({length: 7}).map((_, i) => {
              const ph = (t * 0.5 + i / 7) % 1;
              const y = lerp(820, 540, ph);
              return (
                <g key={i} opacity={Math.sin(ph * Math.PI)}>
                  <circle cx={44} cy={y + 18} r={16} fill={['#f6c6a8', '#a9c4f0', '#bfe8d4'][i % 3]} />
                  <rect x={68} y={y} width={150 + (i % 3) * 40} height={36} rx={18} fill="#000" opacity={0.22} />
                  <rect x={84} y={y + 13} width={100 + (i % 3) * 30} height={10} rx={5} fill="#fff" opacity={0.85} />
                </g>
              );
            })}
            <rect x={20} y={836} width={380} height={46} rx={23} fill="#fff" opacity={0.6} />
            <Heart x={460} y={862} s={1.2} fill="#ff3b5c" />
          </Phone>
        </g>
      </Svg>
    </>
  );
};

// ───────────────────────────── 7. UNA MARIPOSA EN SU VENTANA (cámara que la sigue) ─────────────────────────────
export const ButterflyScene: React.FC<SceneProps> = ({t, d, at}) => {
  const tV = at('ventana.', d - 0.9);
  const u = easeInOut(ramp(t, 0, tV));
  // curva de vuelo (Bézier cúbica)
  const P = [[-120, 1500], [260, 640], [980, 1080], [600, 892]];
  const bz = (i: number) => Math.pow(1 - u, 3) * P[0][i] + 3 * Math.pow(1 - u, 2) * u * P[1][i] + 3 * (1 - u) * u * u * P[2][i] + Math.pow(u, 3) * P[3][i];
  const bx = bz(0) + (u < 1 ? Math.sin(t * 5) * 18 : 0);
  const by = bz(1) + (u < 1 ? Math.cos(t * 6) * 22 : 0);
  const landed = clamp((t - tV) / 0.4);
  const follow = 1 - easeInOut(ramp(t, tV - 0.6, d));
  const camX = lerp(540, bx, follow * 0.6);
  const camY = lerp(800, by, follow * 0.6);
  return (
    <Svg bg="#f4c6d4">
      <Cam px={camX} py={camY} s={lerp(1.12, 1.4, follow)} r={lerp(0, -3, follow)}>
        <rect x={-600} y={-600} width={2300} height={3000} fill="#f2bfcf" />
        {Array.from({length: 24}).map((_, i) => <rect key={i} x={-600} y={-600 + i * 120} width={2300} height={4} fill="#e8a9bd" opacity={0.5} />)}
        <WindowFrame id="bf-win" x={330} y={400} w={420} h={480} frame="#fff7f2" bar={18} sill="#fff0e6">
          <rect x={330} y={400} width={420} height={480} fill="#ffe8b8" />
          <Glow id="bf-in" cx={540} cy={640} r={300} color="#fff6d8" o={0.9} />
          <g opacity={0.6}>
            <Figure x={560 + landed * 30} y={1120} s={1.25} who="her" pose="stand" shade={0.5} tint="#d08aa0" lean={-landed * 5} tilt={landed * 10} breath={t / 3} />
          </g>
          {/* cortina translúcida */}
          <path d={`M330 400 L470 400 Q${450 + Math.sin(t * 1.5) * 12} 640 ${480 + Math.sin(t * 1.5) * 16} 880 L330 880 Z`} fill="#fff7f2" opacity={0.55} />
          <path d={`M750 400 L640 400 Q${660 + Math.sin(t * 1.3) * 12} 640 ${630 + Math.sin(t * 1.3) * 16} 880 L750 880 Z`} fill="#fff7f2" opacity={0.55} />
        </WindowFrame>
        {/* jardinera */}
        <rect x={340} y={930} width={400} height={80} rx={14} fill="#b7795c" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i} transform={`translate(${380 + i * 64} 930) rotate(${Math.sin(t * 2 + i) * 4})`}>
            <rect x={-3} y={-60} width={6} height={60} fill="#4f9a72" />
            {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-72} rx={9} ry={16} fill={['#ffffff', '#ffd36b', '#b8a6e3'][i % 3]} transform={`rotate(${a} 0 -60)`} />)}
            <circle cx={0} cy={-60} r={7} fill="#ffb98a" />
          </g>
        ))}
        <Motes seed="bf-m" n={14} x0={200} x1={900} y0={300} y1={1100} t={t} color="#fff7f2" />
        <Butterfly x={bx} y={by - landed * 6} s={0.9} t={t} r={lerp(20, 0, u)} rest={landed} />
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 8. EL CAFÉ DE LA MAÑANA ─────────────────────────────
export const Coffee: React.FC<SceneProps> = ({t, d}) => {
  const slide = easeOut(ramp(t, 0.2, 0.9));
  const take = easeInOut(ramp(t, 1.0, 1.6));
  const cupX = lerp(1060, 560, slide) - take * 80;
  const cupY = 960 - take * 70;
  const e = easeInOut(t / d);
  const order = easeOut(ramp(t, 0, 0.35)) * (1 - ramp(t, 1.3, 1.6));
  return (
    <Svg bg="#ffe2c8">
      <Cam px={540} py={lerp(880, 720, e)} s={lerp(1.2, 1.05, e)} r={lerp(-2, 1, e)}>
        <rect x={-600} y={-600} width={2300} height={3000} fill="#ffd9bd" />
        {/* pizarra con dibujos */}
        <rect x={140} y={300} width={360} height={250} rx={18} fill="#4b4f7d" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <path d={`M${180} ${352 + i * 70} l20 0 l-3 26 l-14 0 Z`} fill="#fff7f2" />
            <rect x={220} y={358 + i * 70} width={170 - i * 30} height={10} rx={5} fill="#fff7f2" opacity={0.8} />
            <circle cx={450} cy={364 + i * 70} r={8} fill="#ffd36b" />
          </g>
        ))}
        {/* lámparas colgantes */}
        {[620, 860].map((lx, i) => (
          <g key={lx} transform={`rotate(${Math.sin(t * 1.2 + i) * 2} ${lx} 0)`}>
            <rect x={lx - 2} y={0} width={4} height={360} fill="#7b6f9a" />
            <path d={`M${lx - 60} 420 Q${lx} 330 ${lx + 60} 420 Z`} fill="#f6a6c1" />
            <Glow id={`cf-l${i}`} cx={lx} cy={440} r={160} color="#fff2c8" o={0.7} />
          </g>
        ))}
        {/* mostrador */}
        <rect x={-600} y={1000} width={2300} height={40} fill="#c98f6a" />
        <rect x={-600} y={1040} width={2300} height={700} fill="#a8735a" />
        {/* lo que pidió: burbuja con sus detalles (sin texto) */}
        <g transform="translate(330 760)" opacity={order}>
          <rect x={-150} y={-80} width={300} height={120} rx={40} fill="#fff7f2" />
          <path d="M-90 38 L-110 70 L-60 38 Z" fill="#fff7f2" />
          <path d="M-110 -50 L-70 -50 L-74 0 L-106 0 Z" fill="#c98f6a" />
          <path d="M-20 -48 q-14 22 0 34 q14 -12 0 -34 Z" fill="#fff" stroke="#a7abd6" strokeWidth={3} />
          <rect x={40} y={-46} width={30} height={30} rx={6} fill="#fff" stroke="#a7abd6" strokeWidth={3} />
          <Heart x={110} y={-26} s={0.8} fill="#f6a6c1" />
        </g>
        {/* mano de ella */}
        <g transform={`translate(${lerp(-80, 380, easeOut(ramp(t, 0.8, 1.3))) - take * 60} ${lerp(980, 930, take)}) rotate(-8)`}>
          <rect x={-420} y={-30} width={420} height={70} rx={34} fill={C.herTop} />
          <ellipse cx={20} cy={6} rx={40} ry={34} fill={C.herSkin} />
        </g>
        {/* taza */}
        <g transform={`translate(${cupX} ${cupY})`}>
          <ellipse cx={0} cy={44} rx={80} ry={14} fill="#000" opacity={0.12} />
          <path d="M-56 -50 L56 -50 L46 40 Q0 52 -46 40 Z" fill="#fff7f2" />
          <rect x={-58} y={-20} width={116} height={30} fill="#f6a6c1" />
          <path d="M54 -30 Q90 -26 82 6 Q76 22 48 18" stroke="#fff7f2" strokeWidth={12} fill="none" />
          <ellipse cx={0} cy={-50} rx={56} ry={12} fill="#c98f6a" />
          <path d="M-14 -52 q14 -10 28 0 q-14 8 -28 0" fill="#fff7f2" opacity={0.85} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${-24 + i * 24} -70 q${14 + Math.sin(t * 3 + i) * 8} -40 0 -80 q-14 -40 0 -80`} stroke="#fff7f2" strokeWidth={8} fill="none" opacity={0.55 * slide} strokeLinecap="round" />
          ))}
          <MorphCloud x={0} y={-260 - t * 30} s={0.32 * slide} t={t} keys={[[0, 'puff']]} o={0.85} />
        </g>
        {/* manga del barista */}
        <g transform={`translate(${lerp(1300, 760, slide) + ramp(t, 1.0, 1.6) * 260} 990) rotate(6)`}>
          <rect x={0} y={-36} width={520} height={72} rx={34} fill="#7b82c9" />
          <ellipse cx={0} cy={0} rx={38} ry={32} fill="#c58e6a" />
        </g>
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 9. VIBRA... Y NO ERA ELLA ─────────────────────────────
export const Notif: React.FC<SceneProps> = ({t, d, at}) => {
  const tNo = at('No', d - 1.3);
  const buzz = t > 0.1 && t < 0.9 ? Math.sin(t * 90) * 5 : 0;
  const lit = clamp((t - 0.1) / 0.15);
  const reach = easeOut(ramp(t, 0.35, 0.75)) * (1 - easeInOut(ramp(t, tNo, tNo + 0.9)));
  const slump = easeInOut(ramp(t, tNo, tNo + 1.0));
  const zIn = back(ramp(t, 0.55, 1.05));
  const zOut = easeInOut(ramp(t, tNo + 0.1, d));
  const s = lerp(lerp(1.0, 2.35, zIn), 1.15, zOut);
  const phX = 720;
  const phY = 900;
  const px = lerp(lerp(560, phX, clamp(zIn)), 560, zOut);
  const py = lerp(lerp(900, phY, clamp(zIn)), 920, zOut);
  const reveal = easeInOut(ramp(t, tNo - 0.55, tNo - 0.1));
  const banner = easeOut(ramp(t, 0.2, 0.55));
  return (
    <Svg bg="#c7d4f2">
      <Cam px={px} py={py} s={s}>
        <rect x={-600} y={-600} width={2300} height={3000} fill="#b9c6ee" />
        <WindowFrame id="nt-win" x={120} y={300} w={360} h={440} frame="#8e9ad6" sill="#a2acdf">
          <SkyGrad id="nt-sky" stops={['#a9c4f0', '#d8e4fb']} x={120} y={300} w={360} h={440} />
          <DriftCloud seed="nt-c" t={t} y={480} s={0.4} speed={30} x0={0} x1={600} />
        </WindowFrame>
        <rect x={60} y={1040} width={980} height={34} rx={12} fill="#7b6f9a" />
        <rect x={120} y={1074} width={30} height={500} fill="#6a5f88" />
        <rect x={950} y={1074} width={30} height={500} fill="#6a5f88" />
        {/* plantita y taza */}
        <path d="M900 1040 L940 1040 L934 990 L906 990 Z" fill="#e98f6c" />
        <ellipse cx={920} cy={960} rx={14} ry={34} fill="#7cc492" />
        {/* silla y él */}
        <rect x={170} y={1100} width={240} height={26} rx={12} fill="#5b5287" />
        <rect x={180} y={880} width={26} height={240} rx={12} fill="#5b5287" />
        <Figure x={290 + reach * 30} y={1238} s={1.05} who="him" seated pose={reach > 0.2 ? 'reach' : 'stand'} lean={reach * 14 - slump * 6} slump={slump * 0.9} breath={t / 4} />
        {/* soporte y teléfono */}
        <path d="M680 1040 L760 1040 L740 1000 L700 1000 Z" fill="#4b4f7d" />
        <g transform={`translate(${phX + buzz} ${phY}) rotate(${-6 + buzz * 0.6})`}>
          <rect x={-62} y={-112} width={124} height={224} rx={20} fill="#151a3a" />
          <rect x={-54} y={-104} width={108} height={208} rx={14} fill={mix('#2a2f5c', '#eef0ff', lit * (1 - slump * 0.5))} />
          {/* banner de notificación */}
          <g transform={`translate(0 ${lerp(-160, -70, banner)})`} opacity={banner}>
            <rect x={-48} y={-22} width={96} height={44} rx={12} fill="#ffffff" />
            {/* icono: primero un círculo que parece un avatar, luego el de una app genérica */}
            <g opacity={1 - reveal}>
              <circle cx={-26} cy={0} r={13} fill="#f6c6a8" />
              <circle cx={-26} cy={-3} r={6} fill="#8c3a22" opacity={0.5 + 0.5 * Math.sin(t * 10)} />
            </g>
            <g opacity={reveal}>
              <rect x={-39} y={-13} width={26} height={26} rx={7} fill="#9a9cb4" />
              <path d="M-32 4 Q-32 -8 -26 -8 Q-20 -8 -20 4 Z M-29 6 L-23 6" fill="#e8e8f0" stroke="#e8e8f0" strokeWidth={1.5} />
            </g>
            <rect x={-6} y={-10} width={44} height={7} rx={3.5} fill="#5a5f99" />
            <rect x={-6} y={3} width={30} height={6} rx={3} fill="#a7abd6" />
          </g>
        </g>
        {buzz !== 0 && [0, 1].map((i) => (
          <g key={i} stroke="#7b82c9" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7}>
            <path d={`M${phX - 84 - i * 18} ${phY - 30} q-12 30 0 60`} />
            <path d={`M${phX + 84 + i * 18} ${phY - 30} q12 30 0 60`} />
          </g>
        ))}
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 10. QUÉ SOÑÓ: UN CAMPO VERDE ─────────────────────────────
export const Dream: React.FC<SceneProps> = ({t, d, at}) => {
  const tLuz = at('luz.', d - 0.8);
  const light = easeInOut(ramp(t, tLuz - 1.4, tLuz + 0.3));
  const p = easeInOut(t / d);
  const sky = [mix('#1f2650', '#9fb4ea', light), mix('#3d3a78', '#f6c6d8', light), mix('#6a5aa8', '#ffe2b0', light)];
  const layer = (depth: number, children: React.ReactNode) => (
    <g transform={`translate(540 1100) scale(${1 + p * 0.18 * depth}) translate(-540 ${-1100 + p * 40 * depth})`}>{children}</g>
  );
  return (
    <Svg bg="#1f2650">
      <SkyGrad id="dr-sky" stops={sky} />
      <Stars seed="dr" n={40} x0={0} x1={1080} y0={250} y1={850} t={t} o={1 - light} />
      <circle cx={780} cy={460} r={60} fill="#fff3d6" opacity={1 - light * 0.7} />
      <Glow id="dr-sun" cx={540} cy={1000} r={lerp(200, 900, light)} color="#fff0c0" o={0.85 * light} />
      {layer(0.3, <path d="M-200 1010 Q300 880 700 980 T1300 960 L1300 2000 L-200 2000 Z" fill={mix('#2f5a5a', '#9bd6a8', light)} />)}
      {layer(0.6, <path d="M-200 1090 Q400 990 800 1080 T1400 1060 L1400 2000 L-200 2000 Z" fill={mix('#2d6a55', '#7cc492', light)} />)}
      {layer(1.0, (
        <g>
          <path d="M-200 1180 Q300 1110 700 1170 T1400 1150 L1400 2000 L-200 2000 Z" fill={mix('#235a48', '#5fae7e', light)} />
          <g transform={`translate(${lerp(260, 620, p)} 1230)`}>
            <Figure x={0} y={0} s={0.78} who="her" pose="walk" phase={t * 5} breath={t / 3} tilt={-6} shade={0.35 * (1 - light)} tint="#1f2650" />
          </g>
          <Grass seed="dr-g" x0={-200} x1={1300} y={1250} h={90} t={t} color={mix('#1d4c3c', '#4f9a72', light)} n={80} wind={1.4} />
        </g>
      ))}
      <Motes seed="dr-m" n={26} x0={0} x1={1080} y0={700} y1={1250} t={t} color="#fff3a8" rise={0.25} />
      <rect width={1080} height={1920} fill="url(#dr-vig)" />
      <defs>
        <radialGradient id="dr-vig" cx="0.5" cy="0.42" r="0.75">
          <stop offset="0.6" stopColor="#b8a6e3" stopOpacity={0} />
          <stop offset="1" stopColor="#b8a6e3" stopOpacity={0.45} />
        </radialGradient>
      </defs>
    </Svg>
  );
};

// ───────────────────────────── 11. ¿PENSÓ EN ÉL? (grúa que se aleja del edificio) ─────────────────────────────
export const Question: React.FC<SceneProps> = ({t, d, at}) => {
  const tP = at('pensó', d - 1.4);
  const k = easeInOut(ramp(t, 0.1, d - 0.3));
  const cols = 4;
  const rows = 7;
  const wx = (c: number) => 200 + c * 180;
  const wy = (r: number) => 520 + r * 210;
  const hisC = 1;
  const hisR = 2;
  const hx = wx(hisC) + 65;
  const hy = wy(hisR) + 80;
  const s = zlerp(3.4, 0.95, k);
  const ring = (t - tP) % 1.6;
  return (
    <Svg bg="#3d3a78">
      <Cam px={lerp(hx, 540, k)} py={lerp(hy, 860, k)} s={s} r={lerp(0, -2, k)}>
        <SkyGrad id="qs-sky" stops={['#2a2d66', '#55488e', '#b98bb8', '#ffc0a0']} x={-1200} y={-1400} w={3500} h={3000} />
        <Stars seed="qs" n={50} x0={-900} x1={2000} y0={-1300} y1={300} t={t} />
        <MorphCloud x={820} y={240} s={1.2} t={t} keys={[[0, 'puff']]} fill="#f3c9d8" shade="#c99ac0" />
        {/* edificios vecinos */}
        <rect x={-700} y={700} width={720} height={2000} fill="#2b2a5e" />
        <rect x={1060} y={620} width={800} height={2000} fill="#2b2a5e" />
        {/* su edificio */}
        <rect x={150} y={420} width={780} height={2200} fill="#4a4486" />
        <rect x={130} y={400} width={820} height={40} rx={8} fill="#3a3572" />
        {Array.from({length: cols * rows}).map((_, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          const mine = c === hisC && r === hisR;
          const on = mine || random(`qs-w${i}`) > 0.55;
          const x = wx(c);
          const y = wy(r);
          return (
            <g key={i}>
              <rect x={x} y={y} width={130} height={160} rx={10} fill={on ? (mine ? '#ffe2a8' : '#f6cf9a') : '#2f2c60'} opacity={on && !mine ? 0.75 : 1} />
              {mine && (
                <g>
                  <Glow id="qs-mine" cx={x + 65} cy={y + 80} r={160 + 20 * Math.sin(t * 2)} color="#ffe2a8" o={0.55} />
                  <rect x={x} y={y} width={130} height={160} rx={10} fill="#ffe2a8" />
                  <g transform={`translate(${x + 65} ${y + 164})`}>
                    <Figure x={0} y={0} s={0.36} who="him" pose="phoneLow" breath={t / 4} tilt={-6} shade={0.15} tint="#c98f6a" screen="#dfe6ff" />
                  </g>
                  {/* reflejo del cielo en el cristal */}
                  <path d={`M${x} ${y + 30} L${x + 50} ${y} L${x + 80} ${y} L${x} ${y + 70} Z`} fill="#fff" opacity={0.25} />
                  <rect x={x + 61} y={y} width={8} height={160} fill="#4a4486" />
                </g>
              )}
            </g>
          );
        })}
        {/* su pregunta viaja hacia la ciudad: ondas suaves desde su ventana */}
        {t > tP - 0.2 && [0, 0.8].map((off) => {
          const rr = ((t - tP + off) % 1.6) / 1.6;
          return <circle key={off} cx={hx} cy={hy} r={60 + rr * 900} fill="none" stroke="#ffe2a8" strokeWidth={6 * (1 - rr)} opacity={(1 - rr) * 0.6} />;
        })}
        {ring > 99 && null}
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 12. GALERÍA DE FOTOS QUE SE DESLIZA ─────────────────────────────
const Photo: React.FC<{i: number; t: number}> = ({i, t}) => {
  const w = 380;
  const h = 500;
  const id = `ga-p${i}`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={0} y={0} width={w} height={h} rx={26} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {i === 0 && (
          <g>
            <rect width={w} height={h} fill="#bfe8d4" />
            <circle cx={280} cy={120} r={110} fill="#7cc492" />
            <rect x={270} y={200} width={20} height={200} fill="#8a6a5a" />
            <rect x={0} y={400} width={w} height={100} fill="#7cc492" />
            <rect x={60} y={340} width={220} height={16} rx={8} fill="#b7795c" />
            <Figure x={120} y={470} s={0.36} who="him" seated />
            <Figure x={210} y={470} s={0.36} who="her" seated />
          </g>
        )}
        {i === 1 && (
          <g>
            <rect width={w} height={h} fill="#ffd9bd" />
            <rect x={0} y={330} width={w} height={170} fill="#c98f6a" />
            {[120, 260].map((cx, j) => (
              <g key={cx} transform={`translate(${cx} 330)`}>
                <path d="M-40 -70 L40 -70 L32 0 L-32 0 Z" fill={j ? '#f6a6c1' : '#b8a6e3'} />
                {[0, 1].map((k2) => <path key={k2} d={`M${-10 + k2 * 20} -84 q10 -24 0 -48`} stroke="#fff7f2" strokeWidth={6} fill="none" opacity={0.7} />)}
              </g>
            ))}
            <Heart x={190} y={180} s={1.6} fill="#e98fa6" />
          </g>
        )}
        {i === 2 && (
          <g>
            <rect width={w} height={h} fill="#a9c4f0" />
            <MorphCloud x={200} y={150} s={0.6} t={t} keys={[[0, 'whale']]} />
            <rect x={0} y={420} width={w} height={80} fill="#7cc492" />
            <Figure x={130} y={460} s={0.38} who="her" pose="point" tilt={-14} />
            <Figure x={240} y={460} s={0.38} who="him" tilt={-10} facing={-1} />
          </g>
        )}
        {i === 3 && (
          <g>
            <SkyGrad id="ga-sun" stops={['#b8a6e3', '#f4b8c8', '#ffb98a']} x={0} y={0} w={w} h={h} />
            <circle cx={190} cy={320} r={70} fill="#ffe2a8" />
            <rect x={0} y={380} width={w} height={120} fill="#5b4f8f" />
            <BackFigure x={150} y={470} s={0.32} who="him" shade={0.6} tint="#3d3a78" />
            <BackFigure x={235} y={470} s={0.32} who="her" shade={0.6} tint="#3d3a78" />
          </g>
        )}
      </g>
      <rect x={0} y={0} width={w} height={h} rx={26} fill="none" stroke="#fff7f2" strokeWidth={10} />
    </g>
  );
};
export const Gallery: React.FC<SceneProps> = ({t, d}) => {
  const swipes = [0.35, 1.15, 1.95, 2.7];
  const pos = swipes.reduce((a, s) => a + easeInOut(ramp(t, s, s + 0.45)), 0) * 0 + swipes.slice(0, 3).reduce((a, s) => a + easeInOut(ramp(t, s, s + 0.45)), 0);
  const swiping = swipes.slice(0, 3).find((s) => t >= s - 0.1 && t < s + 0.5);
  const thumbX = swiping !== undefined ? lerp(780, 360, easeInOut(ramp(t, swiping - 0.05, swiping + 0.45))) : 760;
  const e = easeInOut(t / d);
  return (
    <Svg bg="#3a3f78">
      <Cam px={540} py={lerp(800, 760, e)} s={lerp(1.0, 1.12, e)} r={lerp(3, -3, e)}>
        <rect x={-600} y={-600} width={2300} height={3000} fill="#3a3f78" />
        {Array.from({length: 12}).map((_, i) => (
          <circle key={i} cx={lerp(-100, 1200, random(`ga-b${i}`))} cy={lerp(200, 1500, random(`ga-y${i}`))} r={40 + random(`ga-r${i}`) * 60} fill={['#ffe2a8', '#f6a6c1', '#b8a6e3'][i % 3]} opacity={0.15} />
        ))}
        <Phone id="ga-ph" x={540} y={780} w={480} h={900} body="#151a3a" screen="#201f45">
          <rect width={480} height={900} fill="#201f45" />
          {[0, 1, 2, 3].map((i) => {
            const rel = i - pos;
            const x = 240 + rel * 420;
            const sc = 1 - Math.min(1, Math.abs(rel)) * 0.12;
            const rot = rel * -6;
            return (
              <g key={i} transform={`translate(${x} 430) rotate(${rot}) scale(${sc}) translate(-190 -250)`} opacity={1 - Math.min(1, Math.abs(rel)) * 0.35}>
                <Photo i={i} t={t} />
              </g>
            );
          })}
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={198 + i * 28} cy={760} r={8} fill="#fff7f2" opacity={Math.abs(i - pos) < 0.5 ? 1 : 0.35} />
          ))}
        </Phone>
        {/* mano que desliza */}
        <g transform={`translate(${thumbX} ${1080 + (swiping !== undefined ? 0 : 20)}) rotate(-24)`}>
          <rect x={-70} y={60} width={140} height={700} rx={60} fill={C.hisJacket} />
          <rect x={-34} y={-80} width={68} height={190} rx={34} fill={C.hisSkin} />
          <ellipse cx={0} cy={-70} rx={26} ry={20} fill="#c58e6a" />
        </g>
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 13. ATARDECER: LA NUBE MARIPOSA ─────────────────────────────
export const Sunset: React.FC<SceneProps> = ({t, d, at}) => {
  const tM = at('mariposa…', 2.0);
  const tS = at('sonrió,', 3.0);
  const tQ = at('quizás', 4.2);
  const lift = easeInOut(ramp(t, tM - 0.3, tM + 0.6));
  const smile = easeInOut(ramp(t, tS - 0.2, tS + 0.5));
  const pan = easeInOut(ramp(t, tQ - 0.4, d));
  const e1 = easeInOut(ramp(t, 0, tM + 0.4));
  const far = easeInOut(ramp(t, tQ, tQ + 1.2));
  const px = lerp(lerp(470, 720, e1), 1160, pan);
  const py = lerp(lerp(880, 720, e1), 820, pan);
  const s = lerp(lerp(1.3, 1.05, e1), 1.2, pan);
  return (
    <Svg bg="#3d3a78">
      <Cam px={px} py={py} s={s} r={lerp(1.5, -1, e1)}>
        <rect x={-600} y={-600} width={2800} height={3200} fill="#3b3770" />
        <WindowFrame id="ss-win" x={240} y={260} w={1460} h={720} frame="#2d2a5e" bar={20} sill="#4a4486" cross={false}>
          <SkyGrad id="ss-sky" stops={['#7d6fc0', '#c98fbe', '#ff9f8a', '#ffd08a']} x={240} y={260} w={1460} h={800} />
          <Glow id="ss-sun" cx={1250} cy={1000} r={lerp(420, 520, smile)} color="#fff0b8" o={0.85} />
          <circle cx={1250} cy={1010} r={80} fill="#fff0c0" />
          <DriftCloud seed="ss-a" t={t} y={380} s={0.6} speed={12} x0={100} x1={1900} fill="#ffd6d6" shade="#e3a6b8" />
          <DriftCloud seed="ss-b" t={t} y={820} s={0.45} speed={18} x0={100} x1={1900} fill="#ffd6d6" shade="#e3a6b8" />
          <MorphCloud x={880} y={560} s={1.45} t={t} keys={[[0, 'puff'], [tM + 0.15, 'butterfly']]} morph={1.2} fill="#ffe4e4" shade="#e8a9bd" />
          {Array.from({length: 18}).map((_, i) => {
            const hh = 60 + random(`ss-c${i}`) * 130;
            return <rect key={i} x={240 + i * 82} y={1062 - hh} width={78} height={hh} fill="#6a4f8f" />;
          })}
          {/* una ventana lejana que se enciende: quizás ella también mira */}
          <rect x={1400} y={980} width={16} height={22} rx={3} fill="#ffe2a8" opacity={0.3 + 0.7 * far} />
          <Glow id="ss-far" cx={1408} cy={990} r={60} color="#ffe2a8" o={0.8 * far} />
          <Motes seed="ss-m" n={12} x0={300} x1={1600} y0={300} y1={900} t={t} color="#fff7d0" size={0.8} />
        </WindowFrame>
        {/* él, sentado en el alféizar */}
        <Figure x={440} y={992 + 166} s={1.2} who="him" pose="sit" facing={1} tilt={lerp(14, -16, lift) + Math.sin(t * 1.1) * 1.5} breath={t / 4}
          slump={lerp(0.5, 0, smile)} shade={lerp(0.25, 0.05, smile)} tint="#3d3a78" />
        <Glow id="ss-rim" cx={480} cy={760} r={220} color="#ffc9a0" o={0.25 + 0.2 * smile} />
        {/* el teléfono, boca abajo a su lado */}
        <rect x={250} y={980} width={80} height={13} rx={5} fill="#151a3a" />
        <rect x={256} y={976} width={68} height={4} rx={2} fill="#ffe2a8" opacity={0.3} />
        <path d="M240 260 L1700 260 L2400 2600 L-400 2600 Z" fill="#ffb98a" opacity={0.06 + 0.06 * smile} />
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 14. CIERRE: EL LIVE ─────────────────────────────
export const Cta: React.FC<SceneProps> = ({t, d}) => {
  const e = easeInOut(t / d);
  const glow = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg bg="#262a5e">
      <Cam px={540} py={lerp(860, 760, e)} s={lerp(1.08, 1.0, e)} r={lerp(-1, 1, e)}>
        <SkyGrad id="ct-sky" stops={['#1f2650', '#3d3a78', '#8e6fb0', '#e9a3b8']} y={-200} h={1700} />
        <Stars seed="ct" n={60} x0={-100} x1={1180} y0={-100} y1={800} t={t} />
        <circle cx={820} cy={360} r={56} fill="#fff3d6" />
        <Glow id="ct-moon" cx={820} cy={360} r={220} color="#fff3d6" o={0.35} />
        <MorphCloud x={300} y={520} s={0.9} t={t} keys={[[0, 'butterfly']]} fill="#d9c6ef" shade="#a995d0" o={0.85} />
        <DriftCloud seed="ct-c" t={t} y={760} s={0.5} speed={10} fill="#c9b6e6" shade="#9c88c8" o={0.6} />
        {/* azotea */}
        {Array.from({length: 10}).map((_, i) => {
          const hh = 120 + random(`ct-h${i}`) * 200;
          return <rect key={i} x={-100 + i * 140} y={1150 - hh} width={130} height={hh + 600} fill="#2d2a62" />;
        })}
        <rect x={-200} y={1150} width={1500} height={800} fill="#22204f" />
        <BackFigure x={620} y={1150} s={1.0} who="him" phone glow={glow} breath={t / 4} tilt={-10} />
        {/* el teléfono en alto con el punto rojo de "en vivo" y corazones que suben */}
        <g transform="translate(700 760)">
          <rect x={-46} y={-80} width={92} height={160} rx={16} fill="#151a3a" />
          <rect x={-38} y={-72} width={76} height={144} rx={11} fill="#f4dff0" />
          <rect x={-30} y={-62} width={40} height={18} rx={9} fill="#ff3b5c" />
          <circle cx={-20} cy={-53} r={4} fill="#fff" />
          <Avatar x={0} y={4} r={26} who="her" bg="#f6c6a8" />
          <rect x={-26} y={44} width={52} height={10} rx={5} fill="#fff" opacity={0.8} />
        </g>
        <rect x={712} y={830} width={22} height={150} rx={11} fill={C.hisJacketDark} transform="rotate(-8 712 830)" />
        <HeartsUp seed="ct-h" n={16} x={720} y0={680} y1={180} t={t} spread={90} s={1.5} />
        <LiveDot x={760} y={610} t={t} s={1.1} />
      </Cam>
    </Svg>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  hook: Hook,
  typing: Typing,
  seen: Seen,
  clouds: Clouds,
  street: Street,
  live: Live,
  butterfly: ButterflyScene,
  coffee: Coffee,
  notif: Notif,
  dream: Dream,
  question: Question,
  gallery: Gallery,
  sunset: Sunset,
  cta: Cta,
};
