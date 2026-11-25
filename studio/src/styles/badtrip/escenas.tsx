// Escenas de la historia "badtrip :(" (Mora). Cada escena recibe t (segundos desde su inicio),
// d (duración) y w(palabra) = segundo local en que la voz dice esa palabra.
// Estilo: ilustración plana sin caras, noche morada, luces de pantalla y neón.
// El "bad trip" es solo emocional: se dibuja con giros, reflejos deformados y pantallas que se multiplican.
import React from 'react';
import {Avatar, Bokeh, Heart, Person, Phone, Skyline, cam, clamp, ei, eio, eo, lerp, mix, ramp} from '../historia309/kit';

export type SP = {t: number; d: number; w: (word: string) => number};

export const P = {
  void: '#07041a',
  deep: '#110a2c',
  ink: '#1a0f3d',
  wall: '#1c1145',
  wall2: '#2a1760',
  violet: '#5b2bb5',
  purple: '#8a4dff',
  neon: '#3ee0ff',
  blue: '#4f7dff',
  mag: '#ff4fd8',
  pink: '#ff8ad8',
  red: '#ff2e63',
  cream: '#fbf0dc',
  amber: '#f5b942',
  skin: '#c49680',
};

const hash = (i: number, s = 1) => (((i * 9301 + s * 49297) % 233280) / 233280);

// Separación de color del mareo (la cantidad la pone la composición por escena)
export const FxCtx = React.createContext<{rgb: number; id: string}>({rgb: 0, id: 'rgbx'});

const RgbSplit: React.FC<{id: string; dx: number}> = ({id, dx}) => (
  <filter id={id} filterUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920} colorInterpolationFilters="sRGB">
    <feOffset in="SourceGraphic" dx={-dx} dy={0} result="a" />
    <feColorMatrix in="a" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
    <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
    <feOffset in="SourceGraphic" dx={dx} dy={0} result="c" />
    <feColorMatrix in="c" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
    <feBlend in="r" in2="g" mode="screen" result="rg" />
    <feBlend in="rg" in2="b" mode="screen" />
  </filter>
);

const Frame: React.FC<{children: React.ReactNode; bg?: string; vig?: number}> = ({children, bg = P.deep, vig = 1}) => {
  const fx = React.useContext(FxCtx);
  const on = fx.rgb > 0.4;
  return (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, background: bg}}>
    <defs>
      <radialGradient id="phoneGlow">
        <stop offset="0" stopColor={P.mag} stopOpacity={0.6} />
        <stop offset="0.4" stopColor={P.purple} stopOpacity={0.25} />
        <stop offset="1" stopColor={P.blue} stopOpacity={0} />
      </radialGradient>
      <radialGradient id="btVig" cx="50%" cy="42%" r="75%">
        <stop offset="0.5" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.75} />
      </radialGradient>
      <linearGradient id="btFloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.55} />
      </linearGradient>
      <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
      <filter id="soft2" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
      <filter id="btGlow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="9" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {on && <RgbSplit id={fx.id} dx={fx.rgb} />}
    </defs>
    <g filter={on ? `url(#${fx.id})` : undefined}>
      <rect x={0} y={0} width={1080} height={1920} fill={bg} />
      {children}
    </g>
    <rect x={0} y={1180} width={1080} height={740} fill="url(#btFloor)" />
    <rect x={-20} y={-20} width={1120} height={1960} fill="url(#btVig)" opacity={vig} />
  </svg>
  );
};

// ---------- Piezas ----------

// Pantalla de un en vivo genérico (sin marcas ni texto): ella sin cara, círculo rojo, corazones y burbujas
export const LiveScreen: React.FC<{t: number; w: number; h: number; uid: string; crowd?: number; hearts?: number; input?: boolean; dot?: number}> = ({
  t,
  w,
  h,
  uid,
  crowd = 0.3,
  hearts = 0.4,
  input = true,
  dot = 1,
}) => {
  const s = (h / 820) * 1.2;
  const nHeads = 2 + Math.round(crowd * 6);
  const nHearts = 3 + Math.round(hearts * 12);
  const hs = Array.from({length: nHearts}).map((_, i) => {
    const ph = (t * (0.45 + hash(i, 3) * 0.3) + hash(i, 7)) % 1;
    return {x: w - 60 + Math.sin(ph * 7 + i) * 26 * (w / 460), y: h - 150 * (h / 820) - ph * h * 0.55, op: Math.sin(ph * Math.PI), sc: (0.8 + hash(i, 5) * 0.6) * (w / 460), c: [P.mag, P.red, P.pink, '#ffb3e6'][i % 4]};
  });
  const cm = [0, 1, 2, 3, 4].map((i) => {
    const ph = (t * 0.5 + i * 0.2) % 1;
    return {y: h - 120 * (h / 820) - ph * h * 0.3, op: Math.sin(ph * Math.PI) * 0.95, bw: [0.42, 0.3, 0.5, 0.36, 0.46][i] * w, c: [P.neon, P.amber, P.purple, '#8be0c4', P.pink][i]};
  });
  const k = w / 460;
  return (
    <g>
      <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2a1050" />
        <stop offset="0.6" stopColor="#5d1f6e" />
        <stop offset="1" stopColor="#30123f" />
      </linearGradient>
      <rect width={w} height={h} fill={`url(#${uid}-bg)`} />
      <g filter="url(#soft)">
        <Bokeh t={t} n={12} x={0} y={0} w={w} h={h * 0.55} colors={[P.mag, P.neon, P.amber, P.purple]} op={0.5} rMin={14 * k} rMax={34 * k} seed={31} />
      </g>
      {/* tira de luz neón en la pared de ella */}
      <rect x={0} y={h * 0.3} width={w} height={8 * k} fill={P.neon} opacity={0.75} filter="url(#btGlow)" />
      <rect x={0} y={h * 0.74} width={w} height={h * 0.26} fill="#25103a" />
      <g transform={`translate(0 ${Math.sin(t * 2.4) * 4 * k})`}>
        <Person who="her" x={w * 0.5} y={h * 0.98} s={s} tilt={Math.sin(t * 2.1) * 4} armR={[50 + Math.sin(t * 5) * 18, -300 + Math.cos(t * 5) * 12]} />
      </g>
      {/* barra superior: avatar con círculo rojo, punto de en vivo y espectadores */}
      <g transform={`scale(${k})`}>
        <Avatar x={44} y={58} r={24} kind="her" ring={P.red} />
        <circle cx={44} cy={58} r={33 + ((t * 1.4) % 1) * 12} fill="none" stroke={P.red} strokeWidth={3} opacity={(1 - ((t * 1.4) % 1)) * 0.8 * dot} />
        <rect x={80} y={42} width={64} height={30} rx={8} fill={P.red} opacity={dot} />
        <circle cx={98} cy={57} r={6 + Math.sin(t * 7) * 1.5} fill="#fff" opacity={dot} />
        <rect x={110} y={52} width={24} height={10} rx={5} fill="#fff" opacity={0.85 * dot} />
        <rect x={152} y={42} width={60 + nHeads * 15} height={30} rx={15} fill="#000" opacity={0.35} />
        <ellipse cx={172} cy={57} rx={12} ry={7} fill="none" stroke="#fff" strokeWidth={2.5} opacity={0.85} />
        <circle cx={172} cy={57} r={3.5} fill="#fff" />
        {Array.from({length: nHeads}).map((_, i) => (
          <g key={i}>
            <circle cx={196 + i * 15} cy={57} r={10} fill={[P.neon, P.amber, P.pink, '#8be0c4', P.purple][i % 5]} stroke="#2a1050" strokeWidth={2} />
            <circle cx={196 + i * 15} cy={54} r={3.5} fill="#2a1050" opacity={0.5} />
          </g>
        ))}
      </g>
      {cm.map((c, i) => (
        <g key={i} opacity={c.op}>
          <circle cx={30 * k} cy={c.y + 18 * k} r={13 * k} fill={c.c} />
          <rect x={52 * k} y={c.y} width={c.bw} height={34 * k} rx={17 * k} fill="#000" opacity={0.35} />
          <rect x={66 * k} y={c.y + 12 * k} width={c.bw - 30 * k} height={10 * k} rx={5 * k} fill="#fff" opacity={0.55} />
        </g>
      ))}
      {hs.map((hh, i) => (
        <Heart key={i} x={hh.x} y={hh.y} s={hh.sc} color={hh.c} op={hh.op} />
      ))}
      {input && (
        <g transform={`scale(${k})`}>
          <rect x={18} y={820 * (h / w) * (460 / 820) - 66} width={330} height={44} rx={22} fill="#000" opacity={0.35} stroke="#fff" strokeOpacity={0.25} strokeWidth={2} />
          <rect x={40} y={820 * (h / w) * (460 / 820) - 50} width={120} height={12} rx={6} fill="#fff" opacity={0.3} />
          <Heart x={398} y={820 * (h / w) * (460 / 820) - 60} s={1.1} color={P.mag} op={0.9} />
        </g>
      )}
    </g>
  );
};

// Ciudad de neón vista por una ventana (sin letreros legibles)
const NeonCity: React.FC<{t: number; x: number; y: number; w: number; h: number; uid: string; sky?: [string, string]; ghosts?: number}> = ({t, x, y, w, h, uid, sky = ['#1a0b3d', '#4a1663'], ghosts = 0}) => (
  <g>
    <clipPath id={`${uid}-clip`}>
      <rect x={x} y={y} width={w} height={h} />
    </clipPath>
    <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={sky[0]} />
      <stop offset="1" stopColor={sky[1]} />
    </linearGradient>
    <g clipPath={`url(#${uid}-clip)`}>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${uid}-sky)`} />
      <g filter="url(#soft2)">
        <Skyline x={x - 30} y={y + h} w={w + 60} base={h * 0.6} color="#160a33" seed={6} lit={P.pink} litOp={0.45} />
      </g>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={x + w * (0.12 + i * 0.22)}
          y={y + h * (0.45 + hash(i, 4) * 0.25)}
          width={w * 0.1}
          height={h * 0.05}
          rx={6}
          fill={i % 2 ? P.neon : P.mag}
          opacity={0.6 + 0.4 * Math.sin(t * (3 + i) + i)}
          filter="url(#btGlow)"
        />
      ))}
      <g filter="url(#soft)">
        <Bokeh t={t} n={9} x={x} y={y + h * 0.3} w={w} h={h * 0.7} colors={[P.mag, P.neon, P.purple, P.amber]} op={0.45} rMin={12} rMax={30} seed={9} />
      </g>
      {/* reflejos de pantallas de en vivo en el vidrio */}
      {ghosts > 0 &&
        [0, 1, 2].map((i) => (
          <g key={i} opacity={ghosts * 0.35} transform={`translate(${x + w * (0.18 + i * 0.3)} ${y + h * 0.3 + Math.sin(t * 2 + i) * 20}) rotate(${-8 + i * 8})`}>
            <rect x={-40} y={-70} width={80} height={140} rx={12} fill={P.pink} />
            <circle cx={-22} cy={-52} r={7} fill={P.red} />
            <circle cx={0} cy={0} r={16} fill="#3a1450" />
            <rect x={-20} y={14} width={40} height={50} rx={16} fill="#3a1450" />
          </g>
        ))}
      <rect x={x} y={y} width={w} height={h} fill="#fff" opacity={0.03} />
    </g>
    <rect x={x} y={y} width={w} height={h} fill="none" stroke="#0a0618" strokeWidth={20} />
    <rect x={x + w / 2 - 6} y={y} width={12} height={h} fill="#0a0618" />
  </g>
);

const MiniLive: React.FC<{x: number; y: number; s: number; t: number; rot?: number; op?: number; lit?: number}> = ({x, y, s, t, rot = 0, op = 1, lit = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
    <rect x={-46} y={-80} width={92} height={160} rx={14} fill="#07050f" stroke={mix('#2b2346', P.mag, lit)} strokeWidth={4} />
    <rect x={-38} y={-72} width={76} height={144} rx={9} fill={mix('#1b1230', '#7a2a7e', lit)} />
    <circle cx={0} cy={-8} r={14} fill="#2a1040" />
    <rect x={-18} y={6} width={36} height={56} rx={14} fill="#2a1040" />
    <circle cx={-24} cy={-58} r={6} fill={P.red} opacity={lit * (0.7 + 0.3 * Math.sin(t * 8))} />
    <Heart x={22} y={30 - ((t * 60) % 60)} s={0.45} color={P.pink} op={lit * 0.9} />
  </g>
);

const Bubble2: React.FC<{x: number; y: number; w: number; h: number; color: string; tail?: 'l' | 'r'; rows?: number}> = ({x, y, w, h, color, tail = 'l', rows = 2}) => (
  <g>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h * 0.32} fill={color} />
    <path d={tail === 'l' ? `M ${x - w / 2 + 24} ${y + h / 2 - 6} L ${x - w / 2 + 6} ${y + h / 2 + 24} L ${x - w / 2 + 54} ${y + h / 2 - 4} Z` : `M ${x + w / 2 - 24} ${y + h / 2 - 6} L ${x + w / 2 - 6} ${y + h / 2 + 24} L ${x + w / 2 - 54} ${y + h / 2 - 4} Z`} fill={color} />
    {Array.from({length: rows}).map((_, i) => (
      <rect key={i} x={x - w / 2 + 26} y={y - h / 2 + 24 + i * 28} width={(w - 52) * (i === rows - 1 ? 0.6 : 0.92)} height={13} rx={6.5} fill="#fff" opacity={0.75} />
    ))}
  </g>
);

const BlockIcon: React.FC<{x: number; y: number; r: number; color?: string; slash?: number; sw?: number}> = ({x, y, r, color = '#fff', slash = 1, sw}) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={sw ?? r * 0.22} />
    <line x1={x - r * 0.7 * slash} y1={y - r * 0.7 * slash} x2={x + r * 0.7 * slash} y2={y + r * 0.7 * slash} stroke={color} strokeWidth={sw ?? r * 0.22} strokeLinecap="round" />
  </g>
);

// ---------- 1. Gancho: en la cama a oscuras, el en vivo de ella en el celular ----------
export const Hook: React.FC<SP> = ({t}) => {
  const k = eio(ramp(t, 0.9, 3.35));
  const shake = [Math.sin(t * 13.1) * 3 + Math.sin(t * 7.7) * 2, Math.cos(t * 11.3) * 3];
  const PH = {x: 540, y: 668};
  const cx = lerp(PH.x, 540, k) + shake[0] / lerp(3.7, 1, k);
  const cy = lerp(PH.y + 6, 840, k) + shake[1] / lerp(3.7, 1, k);
  const sc = lerp(3.7, 1.08, k);
  const LW = 92;
  const LH = 164;
  return (
    <Frame bg={P.void}>
      <g transform={cam(cx, cy, sc, lerp(-7, -2, k), 540, lerp(770, 760, k))}>
        <rect x={-600} y={-400} width={2300} height={2600} fill="#120a2c" />
        <NeonCity t={t} x={220} y={260} w={640} h={560} uid="hookCity" />
        {/* luz del celular sobre la pared y la cama */}
        <circle cx={PH.x} cy={PH.y} r={420} fill="url(#phoneGlow)" opacity={0.9} />
        {/* cama */}
        <rect x={60} y={1030} width={960} height={200} rx={30} fill="#24164f" />
        <rect x={-200} y={1200} width={1500} height={900} fill="#0b0620" />
        <Person who="him" view="back" sit x={540} y={1180} s={1.4} armL={-168} armR={168} />
        {/* manta */}
        <path d="M 120 1060 Q 300 1010 540 1050 Q 800 1010 980 1070 L 1000 1240 L 100 1240 Z" fill="#33206a" />
        <path d="M 200 1100 Q 420 1070 560 1100" stroke="#4a3290" strokeWidth={10} fill="none" opacity={0.7} />
        {/* el celular, sostenido sobre la cara */}
        <g transform={`translate(${PH.x} ${PH.y}) rotate(-4)`}>
          <Phone x={0} y={0} w={LW} h={LH} id="hookPhone" bg="#2a1050">
            <LiveScreen t={t} w={LW} h={LH} uid="hookLive" crowd={clamp(t / 3)} hearts={0.6} />
          </Phone>
        </g>
        <circle cx={PH.x - 50} cy={PH.y + 62} r={17} fill={P.skin} />
        <circle cx={PH.x + 50} cy={PH.y + 58} r={17} fill={P.skin} />
        {/* brillo en el borde de su cabeza */}
        <path d="M 498 756 A 56 56 0 0 1 582 756" stroke={P.mag} strokeWidth={6} fill="none" opacity={0.55} filter="url(#soft2)" />
      </g>
    </Frame>
  );
};

// ---------- 2. Leal: en la azotea, él le ofrece una luz; ella mira su celular ----------
export const Leal: React.FC<SP> = ({t, w}) => {
  const k = eio(ramp(t, 0, 2.3));
  const tm = w('motivo');
  const glow = 0.7 + 0.3 * Math.sin(t * 4) + 0.6 * eo(ramp(t, tm - 0.1, tm + 0.4));
  const hand = {x: 420 + 112 * 1.15, y: 1000 - 232 * 1.15};
  return (
    <Frame bg="#1b0d40">
      <linearGradient id="lealSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#140a35" />
        <stop offset="0.5" stopColor="#3b1a72" />
        <stop offset="0.85" stopColor="#a2477f" />
        <stop offset="1" stopColor="#d9708a" />
      </linearGradient>
      <g transform={cam(540, lerp(330, 800, k), lerp(0.95, 1.12, k), 0, 540, 760)}>
        <rect x={-500} y={-600} width={2100} height={1700} fill="url(#lealSky)" />
        <circle cx={790} cy={180} r={60} fill="#f6e8ff" opacity={0.9} />
        <circle cx={790} cy={180} r={160} fill={P.pink} opacity={0.15} filter="url(#soft)" />
        {Array.from({length: 26}).map((_, i) => (
          <circle key={i} cx={hash(i, 2) * 1080} cy={-300 + hash(i, 8) * 700} r={2 + hash(i, 5) * 2.5} fill="#fff" opacity={0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i))} />
        ))}
        <g filter="url(#soft2)">
          <Skyline x={-300} y={1000} w={1700} base={420} color="#2a1250" seed={13} lit={P.neon} litOp={0.5} />
        </g>
        <Skyline x={-300} y={1000} w={1700} base={240} color="#1a0b38" seed={21} lit={P.pink} litOp={0.5} />
        {/* azotea */}
        <rect x={-500} y={1000} width={2100} height={60} fill="#120827" />
        <rect x={-500} y={1060} width={2100} height={1000} fill="#0e0620" />
        <rect x={880} y={720} width={110} height={280} fill="#120827" />
        <rect x={860} y={700} width={150} height={30} rx={8} fill="#1a0d36" />
        <Person who="him" view="side" sit x={420} y={1000} s={1.15} armR={[112, -232]} hunch={0.1} />
        <Person who="her" view="side" flip sit x={700} y={1000} s={1.12} phone={0.95} hunch={0.65} />
        {/* la luz que él le ofrece */}
        <line x1={hand.x + 20} y1={hand.y} x2={lerp(hand.x + 20, 640, eo(ramp(t, tm, tm + 0.8)))} y2={hand.y + 20} stroke={P.neon} strokeWidth={3} strokeDasharray="4 10" opacity={0.7} />
        <circle cx={hand.x + 6} cy={hand.y - 14} r={60} fill={P.neon} opacity={0.25 * glow} filter="url(#soft)" />
        <circle cx={hand.x + 6} cy={hand.y - 14} r={15} fill="#dffbff" opacity={0.95} filter="url(#btGlow)" />
      </g>
    </Frame>
  );
};

// ---------- 3. Mentiras: burbujas de ella que se agrietan; la luz de él se apaga ----------
export const Mentiras: React.FC<SP> = ({t, w}) => {
  const t0 = w('mentir') - 0.35;
  const spots = [
    {x: 300, y: 470, tail: 'r' as const},
    {x: 790, y: 560, tail: 'l' as const},
    {x: 270, y: 790, tail: 'r' as const},
    {x: 810, y: 880, tail: 'l' as const},
  ];
  const lies = spots.map((sp, i) => {
    const a = t0 + i * 0.62;
    const appear = eo(ramp(t, a, a + 0.22));
    const glitch = t > a + 0.3 && t < a + 0.6;
    const cracked = ramp(t, a + 0.55, a + 0.7);
    const fall = ei(ramp(t, a + 0.9, a + 2.2));
    return {...sp, a, appear, glitch, cracked, fall};
  });
  const nCracked = lies.filter((l) => l.cracked > 0.5).length;
  const tg = w('ganas');
  const orb = Math.max(0.08, 1 - nCracked * 0.21 - 0.2 * ramp(t, tg, tg + 0.5)) * (t > tg ? 0.75 + 0.25 * Math.sin(t * 31) : 1);
  const step = Math.floor(t * 30);
  const orbPos = {x: 540, y: 1240 - 205 * 1.45};
  return (
    <Frame bg="#0c0624">
      <g transform={cam(540, lerp(760, 820, clamp(t / 4)), lerp(1.0, 1.1, eio(clamp(t / 4))), Math.sin(t * 0.8) * 1.5, 540, 760)}>
        <rect x={-400} y={-300} width={1900} height={2600} fill="#0c0624" />
        {Array.from({length: 18}).map((_, i) => (
          <rect key={i} x={-200 + i * 80} y={-200} width={2} height={2400} fill={P.purple} opacity={0.06} />
        ))}
        <ellipse cx={540} cy={1250} rx={420} ry={60} fill={P.neon} opacity={0.08 * orb} />
        <Person who="him" x={540} y={1240} s={1.45} armL={[-16, -196]} armR={[16, -196]} hunch={nCracked * 0.22} />
        <circle cx={orbPos.x} cy={orbPos.y} r={90 * orb + 20} fill={P.neon} opacity={0.3 * orb} filter="url(#soft)" />
        <circle cx={orbPos.x} cy={orbPos.y} r={8 + 12 * orb} fill="#dffbff" opacity={0.4 + 0.6 * orb} filter="url(#btGlow)" />
        {lies.map((l, i) => {
          if (l.appear <= 0) return null;
          const jx = l.glitch ? (((step * 31 + i * 7) % 9) - 4) * 6 : 0;
          const col = mix(P.mag, '#3a2f52', l.cracked);
          return (
            <g key={i} opacity={1 - l.fall} transform={`translate(${l.x + jx} ${l.y + l.fall * 380}) rotate(${l.fall * (i % 2 ? 30 : -30)}) scale(${l.appear}) translate(${-l.x} ${-l.y})`}>
              {l.glitch && (
                <>
                  <g opacity={0.6} transform="translate(-14 0)">
                    <Bubble2 x={l.x} y={l.y} w={300} h={104} color={P.neon} tail={l.tail} />
                  </g>
                  <g opacity={0.6} transform="translate(14 4)">
                    <Bubble2 x={l.x} y={l.y} w={300} h={104} color={P.red} tail={l.tail} />
                  </g>
                </>
              )}
              <Bubble2 x={l.x} y={l.y} w={300} h={104} color={col} tail={l.tail} />
              {l.cracked > 0 && (
                <path
                  d={`M ${l.x - 120} ${l.y - 40} L ${l.x - 60} ${l.y - 6} L ${l.x - 20} ${l.y - 30} L ${l.x + 30} ${l.y + 18} L ${l.x + 80} ${l.y - 10} L ${l.x + 140} ${l.y + 40}`}
                  stroke="#0c0624"
                  strokeWidth={7}
                  fill="none"
                  strokeDasharray={420}
                  strokeDashoffset={420 * (1 - l.cracked)}
                />
              )}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// ---------- 4. Cosas pendientes: colgando del techo como péndulos; él, pendiente ----------
export const Pendientes: React.FC<SP> = ({t, w}) => {
  const tp = w('pendiente');
  const k = eio(ramp(t, 0.1, tp + 0.3));
  const drop = eo(ramp(t, tp - 0.2, tp + 0.7));
  const items = [
    {x: 160, len: 420, kind: 0},
    {x: 330, len: 640, kind: 1},
    {x: 500, len: 360, kind: 2},
    {x: 690, len: 560, kind: 0},
    {x: 880, len: 430, kind: 1},
    {x: 250, len: 900, kind: 2},
    {x: 830, len: 820, kind: 0},
  ];
  return (
    <Frame bg="#0e0726">
      <g transform={cam(540, lerp(560, 1120, k), lerp(1.0, 1.05, k), 0, 540, 760)}>
        <rect x={-400} y={-300} width={1900} height={2600} fill="#130a33" />
        <rect x={-400} y={-300} width={1900} height={330} fill="#0b0520" />
        {items.map((it, i) => {
          const sw = Math.sin(t * 1.7 + i * 0.9) * (9 + (i % 3) * 3);
          return (
            <g key={i} transform={`rotate(${sw} ${it.x} 30)`}>
              <line x1={it.x} y1={30} x2={it.x} y2={30 + it.len} stroke="#b9a7ff" strokeWidth={2.5} opacity={0.5} />
              <g transform={`translate(${it.x} ${30 + it.len})`}>
                {it.kind === 0 && <Bubble2 x={0} y={56} w={210} h={84} color={i % 2 ? P.violet : '#3b2a78'} rows={2} />}
                {it.kind === 1 && (
                  <g>
                    <rect x={-120} y={0} width={240} height={86} rx={22} fill="#241650" stroke={P.purple} strokeWidth={3} />
                    <Avatar x={-78} y={43} r={24} kind="her" ring={P.red} />
                    <rect x={-40} y={26} width={130} height={12} rx={6} fill="#fff" opacity={0.6} />
                    <rect x={-40} y={50} width={90} height={12} rx={6} fill="#fff" opacity={0.35} />
                  </g>
                )}
                {it.kind === 2 && <MiniLive x={0} y={90} s={0.9} t={t} />}
                <circle cx={it.kind === 2 ? 40 : 100} cy={it.kind === 2 ? 8 : 6} r={12 + Math.sin(t * 6 + i) * 2} fill={P.red} />
              </g>
            </g>
          );
        })}
        {/* la tarjeta de ella que baja justo frente a él */}
        <g transform={`translate(540 ${lerp(200, 930, drop)}) rotate(${Math.sin(t * 2.2) * 6 * drop} 0 -700)`}>
          <line x1={0} y1={-900} x2={0} y2={-6} stroke="#e6dcff" strokeWidth={3} opacity={0.7} />
          <rect x={-170} y={0} width={340} height={120} rx={28} fill="#2c1860" stroke={P.mag} strokeWidth={4} filter="url(#btGlow)" />
          <Avatar x={-108} y={60} r={36} kind="her" ring={P.red} />
          <rect x={-52} y={36} width={170} height={16} rx={8} fill="#fff" opacity={0.7} />
          <rect x={-52} y={68} width={110} height={16} rx={8} fill="#fff" opacity={0.4} />
          <circle cx={150} cy={8} r={16} fill={P.red} />
        </g>
        {/* él en la cama, mirando hacia arriba */}
        <rect x={140} y={1420} width={800} height={110} rx={30} fill="#2a1a5c" />
        <rect x={-400} y={1530} width={1900} height={900} fill="#0a0519" />
        <Person who="him" sit x={540} y={1510} s={1.2} phone={0.9} tilt={-3} />
      </g>
    </Frame>
  );
};

// ---------- 5. El aviso de que ella está en vivo ilumina el cuarto ----------
export const Notif: React.FC<SP> = ({t, w}) => {
  const tn = w('aviso') - 0.15;
  const ts = w('iluminaba') - 0.1;
  const on = eo(ramp(t, tn, tn + 0.35));
  const flick = on * (0.85 + 0.15 * Math.sin(t * 9));
  const k = eio(ramp(t, tn, tn + 1.8));
  const sit = eo(ramp(t, ts, ts + 0.8));
  const card = eo(ramp(t, tn + 0.15, tn + 0.55));
  return (
    <Frame bg="#08041a">
      {/* fondo con efecto de vértigo: el fondo se acerca mientras la cámara se aleja */}
      <g transform={`translate(540 760) scale(${lerp(1, 1.22, k)}) translate(-540 -760)`}>
        <rect x={-200} y={-200} width={1500} height={2400} fill={mix('#0a0520', '#3a1660', flick * 0.8)} />
        <NeonCity t={t} x={640} y={330} w={340} h={460} uid="notifCity" sky={['#120830', '#2c1050']} />
        <rect x={60} y={360} width={220} height={300} rx={10} fill="#140a30" stroke="#21134a" strokeWidth={8} />
        <circle cx={170} cy={480} r={50} fill={P.purple} opacity={0.2 * flick} />
      </g>
      <g transform={cam(540, 900, lerp(1.12, 0.98, k), 0, 540, 800)}>
        {/* luz que inunda el cuarto */}
        <circle cx={930} cy={980} r={lerp(60, 1300, on)} fill="url(#phoneGlow)" opacity={flick} />
        {/* cama de lado */}
        <rect x={80} y={1010} width={760} height={110} rx={24} fill="#2a1a5c" />
        <rect x={90} y={1120} width={30} height={80} fill="#160c33" />
        <rect x={800} y={1120} width={30} height={80} fill="#160c33" />
        <rect x={60} y={880} width={36} height={300} rx={10} fill="#1d1145" />
        <ellipse cx={210} cy={1000} rx={110} ry={34} fill="#cfc4ff" opacity={0.85} />
        <Person who="him" view="side" sit x={330} y={1016} s={1.15} tilt={lerp(-80, -6, sit)} phone={sit > 0.6 ? 0.8 : 0} />
        <path d={`M ${lerp(250, 340, sit)} 1010 Q 520 ${lerp(930, 960, sit)} 820 990 L 830 1030 L 230 1030 Z`} fill="#3c2780" />
        {/* mesa de noche con el celular */}
        <rect x={870} y={1010} width={160} height={190} rx={8} fill="#1b1040" />
        <rect x={895} y={992} width={74} height={18} rx={6} fill="#07050f" />
        <rect x={899} y={994} width={66} height={12} rx={4} fill={mix('#1b1230', '#ffd6f6', flick)} />
        <rect x={-300} y={1200} width={1700} height={900} fill="#090518" />
      </g>
      {/* tarjeta flotante: ella está en vivo (sin texto) */}
      <g opacity={card} transform={`translate(${lerp(760, 700, card)} ${lerp(820, 640, card) + Math.sin(t * 2.5) * 8}) scale(${lerp(0.4, 1, card)})`}>
        <rect x={-230} y={-70} width={460} height={140} rx={34} fill="#22124d" stroke={P.mag} strokeWidth={4} filter="url(#btGlow)" />
        <Avatar x={-160} y={0} r={42} kind="her" ring={P.red} />
        <circle cx={-160} cy={0} r={54 + ((t * 1.5) % 1) * 16} fill="none" stroke={P.red} strokeWidth={4} opacity={1 - ((t * 1.5) % 1)} />
        <rect x={-96} y={-30} width={84} height={34} rx={9} fill={P.red} />
        <circle cx={-76} cy={-13} r={7} fill="#fff" />
        <rect x={-62} y={-18} width={38} height={10} rx={5} fill="#fff" opacity={0.85} />
        <rect x={0} y={-24} width={180} height={18} rx={9} fill="#fff" opacity={0.7} />
        <rect x={-96} y={20} width={250} height={16} rx={8} fill="#fff" opacity={0.35} />
      </g>
    </Frame>
  );
};

// ---------- 6. El en vivo a pantalla completa: más gente, más corazones, su reflejo en el vidrio ----------
export const Live: React.FC<SP> = ({t, w}) => {
  const tg = w('gente');
  const tc = w('corazones');
  const crowd = lerp(0.25, 1, ramp(t, tg - 0.5, tg + 0.7));
  const hearts = lerp(0.2, 1, ramp(t, tc - 0.5, tc + 0.5));
  const LW = 600;
  const LH = 1066;
  return (
    <Frame bg="#0a0520">
      <g filter="url(#soft)">
        <Bokeh t={t} n={18} colors={[P.purple, P.blue, P.mag]} op={0.3} rMin={20} rMax={60} seed={41} />
      </g>
      <g transform={`translate(540 ${770}) rotate(${lerp(-2.5, 1.5, eio(clamp(t / 4)))}) scale(${lerp(1.0, 1.07, eio(clamp(t / 4)))})`}>
        <Phone x={0} y={0} w={LW} h={LH} id="liveBig" bg="#2a1050">
          <LiveScreen t={t + 3} w={LW} h={LH} uid="liveBigS" crowd={crowd} hearts={hearts} />
          {/* su reflejo y brillo en el vidrio */}
          <g opacity={0.2} filter="url(#soft2)">
            <circle cx={LW * 0.5} cy={LH * 0.48} r={110} fill="#000" />
            <rect x={LW * 0.18} y={LH * 0.58} width={LW * 0.64} height={LH * 0.5} rx={120} fill="#000" />
          </g>
          <path d={`M ${LW * 0.6} 0 L ${LW * 0.85} 0 L ${LW * 0.25} ${LH} L 0 ${LH} Z`} fill="#fff" opacity={0.05} />
        </Phone>
      </g>
    </Frame>
  );
};

// ---------- 7. Escribe un comentario… y lo borra ----------
export const Comentario: React.FC<SP> = ({t, w}) => {
  const tb = w('borraba') - 0.15;
  const blocks = [70, 110, 54, 96, 80, 62];
  const typed = Math.min(blocks.length, Math.max(0, Math.floor((t - 0.1) / 0.13) + 1));
  const deleted = t > tb ? Math.min(blocks.length, Math.floor((t - tb) / 0.075) + 1) : 0;
  const shown = Math.max(0, typed - deleted);
  const keys: [number, number][] = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 10; c++) keys.push([c, r]);
  const tapIdx = t < tb ? Math.floor((t - 0.1) / 0.13) : -1;
  const target = t < tb ? keys[(Math.max(0, tapIdx) * 17 + 5) % 30] : ([9, 3] as [number, number]);
  const kx = (c: number) => 120 + c * 88;
  const ky = (r: number) => 1000 + r * 104;
  const press = t < tb ? Math.abs(Math.sin(((t - 0.1) / 0.13) * Math.PI)) : Math.abs(Math.sin(((t - tb) / 0.075) * Math.PI));
  const thumb = {x: kx(target[0]) + 30, y: ky(target[1]) + 40 + press * 10};
  return (
    <Frame bg="#0a0520" vig={0.7}>
      <g transform={`translate(540 800) rotate(-6) scale(${lerp(1.04, 1.12, clamp(t / 2.4))}) translate(-540 -800)`}>
        <g filter="url(#soft2)">
          <svg x={-60} y={-200} width={1200} height={2130} viewBox="0 0 460 816">
            <LiveScreen t={t + 6} w={460} h={816} uid="comBg" crowd={1} hearts={1} input={false} />
          </svg>
        </g>
        <rect x={-100} y={-200} width={1300} height={2200} fill="#0a0520" opacity={0.35} />
        {/* campo de comentario */}
        <rect x={40} y={800} width={860} height={110} rx={55} fill="#1d1240" stroke={shown > 0 ? P.mag : '#5a4a8a'} strokeWidth={4} />
        {blocks.slice(0, shown).map((bw, i) => {
          const x0 = 90 + blocks.slice(0, i).reduce((a, b) => a + b + 18, 0);
          return <rect key={i} x={x0} y={840} width={bw} height={30} rx={15} fill="#fff" opacity={0.85} />;
        })}
        <rect x={90 + blocks.slice(0, shown).reduce((a, b) => a + b + 18, 0)} y={830} width={6} height={50} fill={P.neon} opacity={Math.sin(t * 12) > 0 ? 1 : 0} />
        <circle cx={960} cy={855} r={52} fill={shown > 0 ? P.mag : '#3a2f52'} />
        <path d="M 940 830 L 990 855 L 940 880 L 950 855 Z" fill="#fff" opacity={shown > 0 ? 1 : 0.4} />
        {/* teclado sin letras */}
        <rect x={-100} y={960} width={1300} height={1100} fill="#140c2e" />
        {keys.map(([c, r], i) => {
          const isT = target[0] === c && target[1] === r && press > 0.5;
          const isDel = c === 9 && r === 3;
          return <rect key={i} x={kx(c) - 36} y={ky(r) - 2} width={76} height={86} rx={14} fill={isT ? P.mag : isDel ? '#3b2a78' : '#2a1e52'} opacity={0.95} />;
        })}
        <path d={`M ${kx(9) - 14} ${ky(3) + 40} L ${kx(9) + 18} ${ky(3) + 22} L ${kx(9) + 18} ${ky(3) + 58} Z`} fill="#fff" opacity={0.7} />
        {/* pulgar */}
        <g transform={`translate(${thumb.x} ${thumb.y}) rotate(-28)`}>
          <rect x={-58} y={0} width={116} height={700} rx={58} fill={P.skin} />
          <rect x={-40} y={14} width={80} height={90} rx={36} fill="#e0b9a5" opacity={0.7} />
          <rect x={-58} y={260} width={116} height={600} rx={50} fill="#9e4b3a" />
        </g>
      </g>
    </Frame>
  );
};

// ---------- 8. Lo que él daba, repartido entre todos ----------
export const Subasta: React.FC<SP> = ({t, w}) => {
  const k = eio(ramp(t, 0, 2.7));
  const tr = w('repartia') - 0.3;
  const chest = {x: 540, y: 1420 - 198 * 1.05};
  const phone = {x: 540, y: 600};
  const nH = 7;
  const screens = Array.from({length: 12}).map((_, i) => {
    const a = (i / 12) * Math.PI * 2 + 0.3;
    return {x: 540 + Math.cos(a) * (380 + (i % 2) * 40), y: 600 + Math.sin(a) * (330 + (i % 3) * 30), rot: Math.sin(a) * 12, at: tr + 0.25 + (i % 6) * 0.12};
  });
  const left = clamp(1 - nH * 0.12 * ramp(t, 0.2, 2.2));
  return (
    <Frame bg="#08041a">
      <g transform={cam(540, lerp(1060, 760, k), lerp(1.28, 0.9, k), 0, 540, 760)}>
        <rect x={-500} y={-400} width={2100} height={2600} fill="#0b0622" />
        {screens.map((s, i) => {
          const lit = eo(ramp(t, s.at + 0.3, s.at + 0.6));
          return <MiniLive key={i} x={s.x} y={s.y} s={0.75} t={t + i} rot={s.rot} op={0.35 + 0.65 * eo(ramp(t, tr - 0.6, tr))} lit={lit} />;
        })}
        {/* el en vivo de ella, arriba */}
        <g transform={`translate(${phone.x} ${phone.y}) rotate(${Math.sin(t * 1.4) * 3})`}>
          <Phone x={0} y={0} w={200} h={356} id="subPhone" bg="#2a1050">
            <LiveScreen t={t} w={200} h={356} uid="subLive" crowd={1} hearts={0.5} input={false} />
          </Phone>
        </g>
        {/* corazones que salen de su pecho y suben al en vivo */}
        {Array.from({length: nH}).map((_, i) => {
          const a = 0.2 + i * 0.28;
          const p = ramp(t, a, a + 0.85);
          if (p <= 0 || p >= 1) return null;
          const e = eio(p);
          const x = lerp(chest.x, phone.x, e) + Math.sin(e * Math.PI * 2 + i) * 60 * (1 - e);
          const y = lerp(chest.y, phone.y + 200, e);
          return <Heart key={i} x={x} y={y} s={1.6 - e * 0.6} color={P.pink} op={Math.sin(p * Math.PI) * 0.95 + 0.05} />;
        })}
        {/* y del en vivo se reparten hacia todas las pantallas */}
        {screens.map((s, i) => {
          const p = ramp(t, s.at - 0.25, s.at + 0.35);
          if (p <= 0 || p >= 1) return null;
          const e = eo(p);
          return <Heart key={`o${i}`} x={lerp(phone.x, s.x, e)} y={lerp(phone.y, s.y, e)} s={1.1 - e * 0.4} color={[P.mag, P.pink, P.red][i % 3]} op={1 - e * 0.3} />;
        })}
        <circle cx={chest.x} cy={chest.y} r={80} fill={P.pink} opacity={0.35 * left} filter="url(#soft)" />
        <Person who="him" sit x={540} y={1420} s={1.05} dim={0.35} tint="#120830" hunch={0.6} />
        <circle cx={chest.x} cy={chest.y + 6} r={16 * left + 4} fill={P.pink} opacity={0.4 + 0.6 * left} filter="url(#btGlow)" />
        <rect x={-500} y={1420} width={2100} height={900} fill="#07041a" />
      </g>
    </Frame>
  );
};

// ---------- 9. El tiempo no cura: reloj que corre, noches que se repiten, mensajes que se apilan ----------
export const Tiempo: React.FC<SP> = ({t, w, d}) => {
  const te = w('empeoraba');
  const worse = ramp(t, te - 0.2, te + 0.6);
  const night = 0.5 + 0.5 * Math.sin(t * 9);
  const pile = Math.floor(clamp(t / d) * 9) + 3;
  const jit = worse * Math.sin(t * 40) * 6;
  return (
    <Frame bg="#0b0622">
      <g transform={cam(540 + jit, 800, lerp(1.02, 1.12, eio(clamp(t / d))), 0, 540, 760)}>
        <rect x={-400} y={-300} width={1900} height={2600} fill={mix('#120a2e', '#2a1550', night * 0.5)} />
        {/* ventana: el cielo pasa de noche a noche, la luna cruza una y otra vez */}
        <clipPath id="tiempoWin">
          <rect x={600} y={380} width={380} height={480} />
        </clipPath>
        <g clipPath="url(#tiempoWin)">
          <rect x={600} y={380} width={380} height={480} fill={mix('#0d0628', '#5b3a8a', night * 0.6)} />
          <circle cx={600 + ((t * 1.7) % 1) * 380} cy={560 - Math.sin(((t * 1.7) % 1) * Math.PI) * 120} r={36} fill="#f3e6ff" />
          <Skyline x={580} y={860} w={420} base={200} color="#140a30" seed={3} lit={P.pink} litOp={0.4} />
        </g>
        <rect x={600} y={380} width={380} height={480} fill="none" stroke="#0a0618" strokeWidth={18} />
        {/* sombra de la ventana que barre el cuarto */}
        <path d={`M 600 860 L 980 860 L ${980 + Math.sin(t * 9) * 400} 1400 L ${600 + Math.sin(t * 9) * 400} 1400 Z`} fill={P.purple} opacity={0.08} />
        {/* reloj de pared */}
        <circle cx={300} cy={500} r={120} fill="#22164c" stroke="#3b2a78" strokeWidth={12} />
        {Array.from({length: 12}).map((_, i) => (
          <rect key={i} x={297} y={392} width={6} height={18} fill="#b9a7ff" transform={`rotate(${i * 30} 300 500)`} />
        ))}
        <line x1={300} y1={500} x2={300} y2={420} stroke={P.cream} strokeWidth={8} strokeLinecap="round" transform={`rotate(${t * 1400} 300 500)`} />
        <line x1={300} y1={500} x2={300} y2={448} stroke={P.amber} strokeWidth={10} strokeLinecap="round" transform={`rotate(${t * 120} 300 500)`} />
        <circle cx={300} cy={500} r={10} fill={P.cream} />
        {/* mensajes sin responder que se apilan en la pared */}
        {Array.from({length: pile}).map((_, i) => (
          <g key={i} transform={`translate(${130 + (i % 3) * 140} ${1000 - Math.floor(i / 3) * 70}) rotate(${(hash(i, 6) - 0.5) * 14 + worse * Math.sin(t * 20 + i) * 6})`}>
            <rect x={-60} y={-26} width={120} height={52} rx={18} fill={i % 2 ? P.violet : '#3b2a78'} />
            <rect x={-42} y={-6} width={70} height={10} rx={5} fill="#fff" opacity={0.6} />
            <circle cx={52} cy={-22} r={9} fill={P.red} />
          </g>
        ))}
        <rect x={500} y={1080} width={560} height={120} rx={28} fill="#2a1a5c" />
        <rect x={-400} y={1200} width={1900} height={900} fill="#090518" />
        <Person who="him" sit x={770} y={1190} s={1.15} phone={0.85} hunch={0.8 + worse * 0.3} />
      </g>
    </Frame>
  );
};

// Pantalla de perfil con el menú para bloquear (escenas 10 y 11)
const BlockPhone: React.FC<{t: number; sheet: number; crt: number; dark: number; pressed: number; dot: number; reflect: number}> = ({t, sheet, crt, dark, pressed, dot, reflect}) => {
  const LW = 640;
  const LH = 1140;
  const sy = LH - 440 * sheet;
  const a = clamp(crt / 0.6);
  const b = clamp((crt - 0.6) / 0.4);
  return (
    <Phone x={0} y={0} w={LW} h={LH} id="blockPhone" bg="#030208">
      <rect width={LW} height={LH} fill="#030208" />
      {crt < 1 && (
        <g transform={`translate(${LW / 2} ${LH / 2}) scale(${lerp(1, 0.004, ei(b))}, ${lerp(1, 0.004, ei(a))}) translate(${-LW / 2} ${-LH / 2})`} filter={sheet > 0.05 ? 'url(#soft2)' : undefined}>
          <LiveScreen t={t + 9} w={LW} h={LH} uid="blkLive" crowd={1} hearts={0.8} dot={dot} />
          {crt > 0 && <rect width={LW} height={LH} fill="#fff" opacity={clamp(crt * 1.4)} />}
        </g>
      )}
      {crt >= 1 && <circle cx={LW / 2} cy={LH / 2} r={6} fill="#fff" opacity={clamp(1 - (crt - 1) * 3)} />}
      <rect width={LW} height={LH} fill="#000" opacity={0.45 * sheet} />
      {sheet > 0 && (
        <g transform={`translate(0 ${sy})`}>
          <rect x={0} y={0} width={LW} height={480} rx={40} fill="#1b1233" />
          <rect x={LW / 2 - 50} y={18} width={100} height={10} rx={5} fill="#fff" opacity={0.3} />
          {[0, 1].map((i) => (
            <g key={i}>
              <circle cx={70} cy={92 + i * 96} r={22} fill="none" stroke="#fff" strokeWidth={4} opacity={0.5} />
              <rect x={112} y={84 + i * 96} width={[260, 200][i]} height={16} rx={8} fill="#fff" opacity={0.45} />
            </g>
          ))}
          <g transform={`translate(${LW / 2} ${330 + pressed * 6}) scale(${1 - pressed * 0.04})`}>
            <rect x={-270} y={-56} width={540} height={112} rx={56} fill={P.red} filter="url(#btGlow)" />
            <BlockIcon x={-180} y={0} r={26} color="#fff" sw={7} />
            <rect x={-130} y={-9} width={260} height={18} rx={9} fill="#fff" opacity={0.9} />
          </g>
        </g>
      )}
      {/* oscuro total + su reflejo en el vidrio negro */}
      <rect width={LW} height={LH} fill="#030208" opacity={dark} />
      <g opacity={reflect * 0.5} filter="url(#soft2)">
        <circle cx={LW * 0.5} cy={LH * 0.42} r={120} fill="#3a2a6a" />
        <rect x={LW * 0.14} y={LH * 0.55} width={LW * 0.72} height={LH * 0.6} rx={140} fill="#3a2a6a" />
      </g>
      <path d={`M ${LW * 0.62} 0 L ${LW * 0.86} 0 L ${LW * 0.26} ${LH} L 0 ${LH} Z`} fill="#fff" opacity={0.04} />
    </Phone>
  );
};

const Finger: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = -10}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-56} y={0} width={112} height={760} rx={56} fill={P.skin} />
    <rect x={-36} y={12} width={72} height={84} rx={30} fill="#e7c3b0" opacity={0.75} />
    <path d="M -40 220 Q 0 232 40 220" stroke="#a87a66" strokeWidth={5} fill="none" opacity={0.6} />
    <path d="M -40 380 Q 0 392 40 380" stroke="#a87a66" strokeWidth={5} fill="none" opacity={0.6} />
  </g>
);

// ---------- 10. El dedo sobre el botón de bloquear ----------
export const Dedo: React.FC<SP> = ({t, w}) => {
  const td = w('dedo');
  const sheet = eo(ramp(t, 0.05, 0.5));
  const app = eio(ramp(t, td - 0.4, td + 0.6));
  const tremble = app * (Math.sin(t * 37) * 4 + Math.sin(t * 23) * 3);
  const beat = Math.exp(-((t * 1.25) % 1) * 7);
  return (
    <Frame bg="#07041a">
      <rect x={0} y={0} width={1080} height={1920} fill={P.red} opacity={0.06 + beat * 0.08} />
      <g transform={`translate(540 760) scale(${1.02 + beat * 0.025}) rotate(3)`}>
        <BlockPhone t={t} sheet={sheet} crt={0} dark={0} pressed={0} dot={1} reflect={0} />
        <Finger x={lerp(120, -60, app) + tremble} y={lerp(1000, 150, app) + tremble * 0.6} rot={-12} />
      </g>
    </Frame>
  );
};

// ---------- 11. Bloqueada: la pantalla se apaga y el en vivo desaparece ----------
export const Bloqueo: React.FC<SP> = ({t, w}) => {
  const press = eo(ramp(t, 0, 0.12)) * (1 - ramp(t, 0.3, 0.5));
  const sheet = 1 - eio(ramp(t, 0.2, 0.5));
  const crt = clamp((t - 0.55) / 0.7) + (t > 1.25 ? clamp((t - 1.25) / 0.5) : 0);
  const tdes = w('desaparecio');
  const dot = 1 - ramp(t, tdes - 0.2, tdes + 0.3);
  const reflect = ramp(t, 1.8, 2.6);
  const ripple = (i: number) => ramp(t, 0.05 + i * 0.12, 0.65 + i * 0.12);
  const away = eio(ramp(t, 0.35, 0.8));
  return (
    <Frame bg="#030208">
      <g transform={`translate(540 760) scale(${lerp(1.02, 0.96, ramp(t, 1.2, 3))}) rotate(${lerp(3, 0, ramp(t, 0.5, 2))})`}>
        <BlockPhone t={t} sheet={sheet} crt={crt} dark={ramp(t, 1.4, 2.0) * 0.6} pressed={press} dot={dot} reflect={reflect} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={-200} cy={460 + 330 - 440 + 120} r={20 + ripple(i) * 300} fill="none" stroke={P.red} strokeWidth={8} opacity={(1 - ripple(i)) * (ripple(i) > 0 ? 0.9 : 0)} />
        ))}
        <Finger x={-60 + away * 120} y={150 + press * 12 + away * 900} rot={-12} />
      </g>
    </Frame>
  );
};

// ---------- 12. El mareo: el cuarto gira, luces, pantallas que se multiplican, reflejo deformado ----------
export const Mareo: React.FC<SP> = ({t, w}) => {
  const tm = w('mareo');
  const tl = w('luces');
  const tp = w('pantallas');
  const tr = w('reflejo');
  const dz = Math.max(0, t - tm);
  const spin = Math.pow(dz, 1.35) * 9 + ei(ramp(t, tm - 0.2, tm + 1)) * 6 * Math.sin(t * 2.4);
  const push = eio(ramp(t, tr - 0.5, tr + 0.9));
  const warp = lerp(0, 36, ramp(t, tm, tp)) + lerp(0, 90, push);
  const lights = eo(ramp(t, tl - 0.2, tl + 0.5));
  const MIR = {x: 540, y: 700, w: 440, h: 760};
  const screens = Array.from({length: 16}).map((_, i) => {
    const a = i * 0.72 + t * 0.7;
    const r = 210 + i * 26;
    return {x: MIR.x + Math.cos(a) * r, y: MIR.y + Math.sin(a) * r * 0.9, rot: (a * 180) / Math.PI / 6, app: eo(ramp(t, tp - 0.2 + i * 0.06, tp + 0.1 + i * 0.06))};
  });
  const ring = (n: number, rx: number, ry: number, dir: number, sp: number, cols: string[]) =>
    Array.from({length: n}).map((_, i) => {
      const a = (i / n) * Math.PI * 2 + dir * t * sp;
      return <circle key={`${rx}-${i}`} cx={MIR.x + Math.cos(a) * rx} cy={MIR.y + Math.sin(a) * ry} r={10 + (i % 3) * 4} fill={cols[i % cols.length]} opacity={lights * 0.9} filter="url(#btGlow)" />;
    });
  const freq = 0.012 + Math.sin(t * 0.9) * 0.003;
  return (
    <Frame bg="#07041a">
      <defs>
        <filter id="mareoWarp" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency={`${freq} ${freq * 2.2}`} numOctaves={2} seed={4} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={warp} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <clipPath id="mareoMirror">
          <rect x={MIR.x - MIR.w / 2} y={MIR.y - MIR.h / 2} width={MIR.w} height={MIR.h} rx={MIR.w / 2} />
        </clipPath>
        <radialGradient id="mareoTunnel" cx="50%" cy="38%" r="60%">
          <stop offset="0" stopColor="#3a1470" />
          <stop offset="0.6" stopColor="#1a0b3d" />
          <stop offset="1" stopColor="#07041a" />
        </radialGradient>
      </defs>
      <g transform={cam(lerp(540, MIR.x, push), lerp(880, MIR.y, push), lerp(0.86, 1.55, push), -spin, 540, 760)}>
        <rect x={-900} y={-900} width={2900} height={3700} fill="url(#mareoTunnel)" />
        {/* espirales de luz */}
        {Array.from({length: 6}).map((_, i) => (
          <ellipse key={i} cx={MIR.x} cy={MIR.y} rx={300 + i * 140} ry={260 + i * 120} fill="none" stroke={[P.mag, P.neon, P.purple][i % 3]} strokeWidth={3} opacity={0.12 + 0.1 * Math.sin(t * 3 + i)} strokeDasharray="30 40" strokeDashoffset={t * 120 * (i % 2 ? 1 : -1)} />
        ))}
        {/* ventana con reflejos de en vivo */}
        <NeonCity t={t} x={-260} y={300} w={300} h={600} uid="mareoWin" ghosts={1} />
        <NeonCity t={t + 2} x={1040} y={380} w={300} h={560} uid="mareoWin2" ghosts={1} />
        {/* espejo: su reflejo deformado */}
        <rect x={MIR.x - MIR.w / 2 - 22} y={MIR.y - MIR.h / 2 - 22} width={MIR.w + 44} height={MIR.h + 44} rx={MIR.w / 2 + 22} fill="#2c1a5e" stroke={P.purple} strokeWidth={6} />
        <g clipPath="url(#mareoMirror)">
          <g filter="url(#mareoWarp)">
            <rect x={MIR.x - MIR.w} y={MIR.y - MIR.h} width={MIR.w * 2} height={MIR.h * 2} fill="#2a1250" />
            <rect x={MIR.x - MIR.w} y={MIR.y + 210} width={MIR.w * 2} height={400} fill="#160a33" />
            {[0, 1, 2, 3].map((i) => (
              <MiniLive key={i} x={MIR.x - 150 + i * 100} y={MIR.y - 220 + (i % 2) * 90} s={0.6} t={t + i} rot={-10 + i * 7} op={0.25 + 0.6 * ramp(t, tp, tp + 0.6)} />
            ))}
            <Person who="him" x={MIR.x} y={MIR.y + 330} s={1.0} armL={8} armR={-8} hunch={0.4} />
          </g>
          <rect x={MIR.x - MIR.w / 2} y={MIR.y - MIR.h / 2} width={MIR.w} height={MIR.h} fill={P.neon} opacity={0.06} />
          <path d={`M ${MIR.x + 60} ${MIR.y - MIR.h / 2} L ${MIR.x + 160} ${MIR.y - MIR.h / 2} L ${MIR.x - 40} ${MIR.y + MIR.h / 2} L ${MIR.x - 140} ${MIR.y + MIR.h / 2} Z`} fill="#fff" opacity={0.07} />
        </g>
        {ring(14, 330, 430, 1, 1.4, [P.mag, P.neon, P.amber])}
        {ring(10, 470, 560, -1, 0.9, [P.purple, P.pink, P.neon])}
        {/* pantallas que se multiplican */}
        {screens.map((s, i) => (s.app > 0 ? <MiniLive key={i} x={s.x} y={s.y} s={0.9 * s.app} t={t + i * 0.3} rot={s.rot} op={0.9} /> : null))}
        {/* él, de espaldas frente al espejo */}
        <Person who="him" view="back" x={MIR.x} y={1470} s={1.3} hunch={0.5} tilt={Math.sin(t * 2.2) * 3 * ei(ramp(t, tm, tm + 1))} />
      </g>
    </Frame>
  );
};

// ---------- 13. Calma: el celular boca abajo y la luz que se apaga (vista desde arriba) ----------
export const Calma: React.FC<SP> = ({t, w}) => {
  const tb = w('boca');
  const ta = w('apago');
  const flip = eio(ramp(t, tb - 0.45, tb + 0.3));
  const fx = Math.cos(flip * Math.PI);
  const land = eo(ramp(t, tb + 0.1, tb + 0.4));
  const handAway = eio(ramp(t, tb + 0.4, tb + 1.2));
  const leak = flip > 0.5 ? 1 - ramp(t, tb + 0.3, ta + 0.4) : 1;
  const breath = Math.sin(t * 1.7) * 0.025;
  const settle = 1 - eio(clamp(t / 2.6));
  const PHX = 560;
  const PHY = 760;
  return (
    <Frame bg="#080520">
      <g transform={`translate(540 760) rotate(${settle * 10}) scale(${1.04 + breath}) translate(-540 -760)`}>
        <rect x={-300} y={-300} width={1700} height={2500} fill={mix('#120a2e', '#0b1230', 1 - settle)} />
        {/* mesa de noche vista desde arriba */}
        <rect x={150} y={360} width={780} height={760} rx={26} fill="#24183f" />
        {Array.from({length: 7}).map((_, i) => (
          <path key={i} d={`M 170 ${420 + i * 100} Q 540 ${400 + i * 100 + (i % 2 ? 20 : -20)} 910 ${420 + i * 100}`} stroke="#2e2150" strokeWidth={6} fill="none" />
        ))}
        <circle cx={290} cy={500} r={92} fill="#1a1230" />
        <circle cx={290} cy={500} r={56} fill="#2a1e48" />
        <rect x={720} y={900} width={170} height={210} rx={10} fill="#3b2a6a" transform="rotate(8 805 1005)" />
        <rect x={738} y={918} width={134} height={174} rx={6} fill="#4a3780" transform="rotate(8 805 1005)" />
        {/* halo del celular */}
        <rect x={PHX - 130} y={PHY - 220} width={260} height={440} rx={40} fill={P.mag} opacity={0.5 * leak} filter="url(#soft)" />
        <g transform={`translate(${PHX} ${PHY}) scale(${fx * lerp(1.12, 1, land)} ${lerp(1.12, 1, land)})`}>
          <rect x={-115} y={-205} width={230} height={410} rx={34} fill={fx > 0 ? '#07050f' : '#1d1530'} stroke={fx > 0 ? '#2b2346' : '#2d2448'} strokeWidth={5} />
          {fx > 0 ? (
            <g>
              <rect x={-103} y={-193} width={206} height={386} rx={26} fill="#5d1f6e" />
              <g filter="url(#soft2)">
                <circle cx={0} cy={-20} r={44} fill="#2a1040" />
                <rect x={-50} y={30} width={100} height={150} rx={40} fill="#2a1040" />
                <circle cx={-74} cy={-160} r={10} fill={P.red} />
              </g>
            </g>
          ) : (
            <g>
              <rect x={-90} y={-185} width={70} height={90} rx={20} fill="#140f22" />
              <circle cx={-68} cy={-160} r={16} fill="#07050f" />
              <circle cx={-42} cy={-120} r={16} fill="#07050f" />
            </g>
          )}
        </g>
        {/* su mano que lo deja y se retira */}
        <g transform={`translate(${lerp(PHX + 130, 1200, handAway)} ${lerp(PHY + 90, 1500, handAway)}) rotate(-35)`}>
          <rect x={-60} y={-40} width={120} height={900} rx={50} fill="#9e4b3a" />
          <ellipse cx={0} cy={-50} rx={78} ry={92} fill={P.skin} />
          <rect x={-90} y={-120} width={40} height={110} rx={20} fill={P.skin} />
        </g>
      </g>
      <rect x={0} y={0} width={1080} height={1920} fill="#1b0f45" opacity={0.25 * settle} />
    </Frame>
  );
};

// ---------- 14. Amanecer ----------
export const Amanecer: React.FC<SP> = ({t, d}) => {
  const k = ramp(t, 0, Math.max(2.2, d - 0.3));
  const e = eio(k);
  const top = mix('#1b0f45', '#7b6fc8', k);
  const mid = mix('#3a1a66', '#f39ab0', k);
  const bot = mix('#2a1450', '#ffd29a', k);
  return (
    <Frame bg="#1a0f3a">
      <linearGradient id="amaSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="0.6" stopColor={mid} />
        <stop offset="1" stopColor={bot} />
      </linearGradient>
      <g transform={cam(540, lerp(960, 800, e), lerp(1.12, 1.0, e), 0, 540, 760)}>
        <rect x={-400} y={-300} width={1900} height={2600} fill={mix('#150b35', '#4a2a5a', k)} />
        <clipPath id="amaWin">
          <rect x={200} y={330} width={680} height={720} />
        </clipPath>
        <g clipPath="url(#amaWin)">
          <rect x={200} y={330} width={680} height={720} fill="url(#amaSky)" />
          <circle cx={600} cy={lerp(1130, 900, e)} r={90} fill="#fff1cf" opacity={k} />
          <circle cx={600} cy={lerp(1130, 900, e)} r={260} fill="#ffd28a" opacity={0.4 * k} filter="url(#soft)" />
          {Array.from({length: 18}).map((_, i) => (
            <circle key={i} cx={220 + hash(i, 2) * 640} cy={350 + hash(i, 8) * 300} r={2.5} fill="#fff" opacity={(1 - k) * 0.8} />
          ))}
          <Skyline x={180} y={1050} w={720} base={300} color={mix('#160a33', '#7a4a6a', k)} seed={8} lit="#ffe2a8" litOp={0.3 * (1 - k)} />
        </g>
        <rect x={200} y={330} width={680} height={720} fill="none" stroke="#1a0f2e" strokeWidth={24} />
        <rect x={534} y={330} width={12} height={720} fill="#1a0f2e" />
        <rect x={170} y={1050} width={740} height={30} rx={8} fill="#2a1a40" />
        {/* luz que entra */}
        <path d="M 200 1080 L 880 1080 L 1250 1900 L -150 1900 Z" fill="#ffd28a" opacity={0.18 * k} />
        <path d="M 330 330 L 470 330 L 360 1050 L 200 1050 Z" fill="#fff" opacity={0.06 * k} />
        {/* él en el borde de la cama, de espaldas, hombros que se relajan */}
        <rect x={120} y={1360} width={840} height={130} rx={30} fill={mix('#2a1a5c', '#6a4a7a', k)} />
        <Person who="him" view="back" sit x={540} y={1460} s={1.15} hunch={lerp(0.9, 0.05, e)} />
        {/* mesa de noche con el celular boca abajo */}
        <rect x={900} y={1250} width={180} height={250} rx={8} fill="#1d1236" />
        <rect x={930} y={1232} width={90} height={20} rx={6} fill="#141022" />
        <rect x={-400} y={1500} width={1900} height={700} fill={mix('#0b0620', '#3a2238', k)} />
      </g>
    </Frame>
  );
};

// ---------- 15. Cierre: mi en vivo, donde no se bloquea a nadie ----------
export const Cierre: React.FC<SP> = ({t}) => {
  const morph = eio(ramp(t, 0.15, 1.1));
  const k = eio(clamp(t / 6));
  const SC = {x: 600, y: 600};
  const crowd = [
    {x: 430, s: 0.62},
    {x: 560, s: 0.7},
    {x: 690, s: 0.64},
    {x: 820, s: 0.7},
    {x: 950, s: 0.6},
  ];
  return (
    <Frame bg="#1a0b34">
      <linearGradient id="cieBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#24104a" />
        <stop offset="0.7" stopColor="#5a2a5e" />
        <stop offset="1" stopColor="#3a1a3a" />
      </linearGradient>
      <g transform={cam(lerp(560, 600, k), lerp(820, 780, k), lerp(1.0, 1.06, k), 0, 540, 760)}>
        <rect x={-400} y={-300} width={1900} height={2600} fill="url(#cieBg)" />
        <g filter="url(#soft)">
          <Bokeh t={t} n={20} colors={[P.amber, P.mag, P.neon, '#ffd28a']} op={0.35} rMin={16} rMax={46} seed={77} />
        </g>
        {/* mi pantalla en vivo */}
        <rect x={SC.x - 250} y={SC.y - 250} width={500} height={500} rx={60} fill="#120827" stroke={P.amber} strokeWidth={6} filter="url(#btGlow)" />
        <g transform={`translate(${SC.x} ${SC.y}) rotate(${t * 90})`}>
          <circle r={150} fill="#0b0618" />
          {[120, 95, 70].map((r) => (
            <circle key={r} r={r} fill="none" stroke="#2a1d40" strokeWidth={4} />
          ))}
          <circle r={44} fill={P.amber} />
          <circle r={8} fill="#0b0618" />
          <rect x={-3} y={-150} width={6} height={40} fill="#fff" opacity={0.25} />
        </g>
        {/* el ícono de bloqueo se convierte en un anillo abierto */}
        <BlockIcon x={SC.x} y={SC.y} r={lerp(190, 176, morph)} color={mix(P.red, P.amber, morph)} slash={1 - morph} sw={14} />
        <rect x={SC.x - 225} y={SC.y - 225} width={78} height={34} rx={9} fill={P.red} />
        <circle cx={SC.x - 203} cy={SC.y - 208} r={7 + Math.sin(t * 7) * 1.5} fill="#fff" />
        <rect x={SC.x - 190} y={SC.y - 213} width={30} height={10} rx={5} fill="#fff" opacity={0.85} />
        {/* nota musical */}
        <g transform={`translate(${SC.x + 170} ${SC.y - 170 + Math.sin(t * 3) * 10})`} fill={P.cream}>
          <ellipse cx={0} cy={40} rx={22} ry={16} />
          <rect x={16} y={-40} width={8} height={80} />
          <path d="M 24 -40 Q 60 -30 52 0 Q 46 -20 24 -18 Z" />
        </g>
        {/* comentarios y corazones que suben de todos hacia el en vivo */}
        {crowd.map((c, i) =>
          [0, 1].map((j) => {
            const ph = (t * 0.42 + i * 0.19 + j * 0.5) % 1;
            const x = lerp(c.x, SC.x + (i - 2) * 60, ph);
            const y = lerp(960, SC.y + 300, ph);
            return (
              <g key={`${i}-${j}`} opacity={Math.sin(ph * Math.PI)}>
                {j === 0 ? (
                  <g>
                    <circle cx={x - 62} cy={y} r={16} fill={[P.neon, P.amber, P.pink, '#8be0c4', P.purple][i]} />
                    <rect x={x - 38} y={y - 18} width={120} height={36} rx={18} fill="#fff" opacity={0.2} />
                    <rect x={x - 24} y={y - 5} width={80} height={10} rx={5} fill="#fff" opacity={0.75} />
                  </g>
                ) : (
                  <Heart x={x} y={y} s={1.2} color={[P.mag, P.pink, P.red][i % 3]} />
                )}
              </g>
            );
          }),
        )}
        {/* gente con su celular, todos dentro */}
        <rect x={-400} y={1080} width={1900} height={1000} fill="#1a0c2c" />
        {crowd.map((c, i) => (
          <g key={i}>
            <Person who={i % 2 ? 'her' : i === 2 ? 'him' : 'other'} view="back" x={c.x} y={1080 + 150 * c.s} s={c.s * 1.25} hunch={0.2} armR={[30, -300]} />
            <rect x={c.x + 20 * c.s} y={1080 + 150 * c.s - 330 * c.s * 1.25 - 30} width={30} height={52} rx={6} fill={P.amber} opacity={0.9} />
          </g>
        ))}
      </g>
    </Frame>
  );
};

export const SCENES: Record<string, React.FC<SP>> = {
  hook: Hook,
  leal: Leal,
  mentiras: Mentiras,
  pendientes: Pendientes,
  notif: Notif,
  live: Live,
  comentario: Comentario,
  subasta: Subasta,
  tiempo: Tiempo,
  dedo: Dedo,
  bloqueo: Bloqueo,
  mareo: Mareo,
  calma: Calma,
  amanecer: Amanecer,
  cierre: Cierre,
};
