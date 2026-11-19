// Escenas de "Ameri" (estética papel): papel recortado por capas con sombra suave, verde salvia,
// mostaza y crema. Él (carpintero que sueña con su propio taller) y ella (vende flores). Sin caras.
// Composición: la acción vive entre y=330 y y=1110; los subtítulos van encima de suelo o mesa lisos.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cam, Grad, H, HER, HIM, Hand, OTHER, Person, Svg, Vignette, W, ease, lin, mix, mixC, rng, useCast, useT} from './kit';

type P = {dur: number; a?: string; b?: string};

const CREAM = '#f4ead5';
const PAPER = '#fbf4e4';
const SAGE = '#a8c09a';
const SAGE2 = '#86a37a';
const OLIVE = '#5f7a52';
const FOREST = '#2f4a3a';
const MUST = '#e9b03e';
const SUN = '#ffd36b';
const ROSE = '#d98a7e';
const KRAFT = '#c9a77c';
const WOOD = '#9a7452';
const WOOD2 = '#7e5c40';
const INK = '#3a3a3a';
const RIVER = '#8fb3b8';

const FLOOR = 1110;

// Sombra de papel recortado.
const Defs: React.FC = () => (
  <defs>
    <filter id="amSh" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx={0} dy={7} stdDeviation={5} floodColor="#22352a" floodOpacity={0.33} />
    </filter>
    <filter id="amSh2" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx={0} dy={14} stdDeviation={10} floodColor="#22352a" floodOpacity={0.35} />
    </filter>
  </defs>
);

const Sh: React.FC<{children: React.ReactNode; big?: boolean; style?: React.CSSProperties}> = ({children, big, style}) => (
  <g filter={`url(#${big ? 'amSh2' : 'amSh'})`} style={style}>
    {children}
  </g>
);

// Cerro de papel: borde ondulado (suma de senos) desde baseY hasta abajo.
const hill = (seed: number, baseY: number, amp: number, waves: number, shift = 0) => {
  const r = rng(seed);
  const ph = [r() * 6, r() * 6, r() * 6];
  let d = `M -40 ${H + 40} L -40 ${baseY}`;
  for (let x = -40; x <= W + 40; x += 24) {
    const u = (x + shift) / W;
    const y = baseY - amp * (0.6 * Math.sin(u * Math.PI * waves + ph[0]) + 0.3 * Math.sin(u * Math.PI * waves * 2.3 + ph[1]) + 0.1 * Math.sin(u * Math.PI * 7 + ph[2]));
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  return d + ` L ${W + 40} ${H + 40} Z`;
};

const Sky: React.FC<{id: string; top?: string; bottom?: string}> = ({id, top = '#cfe6d6', bottom = '#f8e3b4'}) => (
  <>
    <Grad id={id} stops={[[0, top], [1, bottom]]} />
    <rect width={W} height={H} fill={`url(#${id})`} />
  </>
);

// Sol de papel con rayos que giran despacio.
const PaperSun: React.FC<{x: number; y: number; r?: number; rays?: boolean}> = ({x, y, r = 110, rays = true}) => {
  const t = useT();
  return (
    <g transform={`translate(${x} ${y})`}>
      {rays && (
        <g transform={`rotate(${t * 8})`} opacity={0.55}>
          {Array.from({length: 14}).map((_, i) => (
            <polygon key={i} points={`-14,${-r - 30} 14,${-r - 30} 0,${-r - 110}`} fill={SUN} transform={`rotate(${(i * 360) / 14})`} />
          ))}
        </g>
      )}
      <Sh>
        <circle r={r} fill={SUN} />
        <circle r={r * 0.72} fill="#ffe08f" />
      </Sh>
    </g>
  );
};

// Pájaros de papel (dos triángulos que aletean).
const PaperBirds: React.FC<{x: number; y: number; n?: number; speed?: number}> = ({x, y, n = 3, speed = 50}) => {
  const t = useT();
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const bx = x + i * 90 + t * speed;
        const by = y + (i % 2) * 50 + Math.sin(t * 2 + i) * 8;
        const f = Math.sin(t * 8 + i) * 14;
        return (
          <g key={i} transform={`translate(${bx} ${by})`}>
            <polygon points={`0,0 -34,${-14 - f} -8,4`} fill={PAPER} stroke={OLIVE} strokeWidth={2} />
            <polygon points={`0,0 34,${-14 - f} 8,4`} fill={CREAM} stroke={OLIVE} strokeWidth={2} />
          </g>
        );
      })}
    </g>
  );
};

// Papelitos/pétalos que flotan.
const Petals: React.FC<{seed?: number; n?: number; colors?: string[]; area?: [number, number, number, number]}> = ({seed = 5, n = 14, colors = [ROSE, MUST, PAPER], area = [0, 300, W, 900]}) => {
  const t = useT();
  const r = rng(seed);
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const x = area[0] + r() * area[2] + Math.sin(t * 0.8 + i) * 30;
        const y = area[1] + ((r() * area[3] + t * (30 + r() * 30)) % area[3]);
        const c = colors[i % colors.length];
        return <ellipse key={i} cx={x} cy={y} rx={12} ry={6} fill={c} transform={`rotate(${t * 60 + i * 40} ${x} ${y})`} opacity={0.85} />;
      })}
    </g>
  );
};

// Personaje sentado visto de espaldas (para el techo).
const SeatedBack: React.FC<{look: typeof HIM; x: number; ledge: number; s: number; tilt?: number; armL?: number; armR?: number}> = ({look, x, ledge, s, tilt = 0, armL = 8, armR = 8}) => {
  const c = useCast();
  const L = look === HIM ? c.him : look === HER ? c.her : look;
  const hem = L.long ? 150 : 205;
  return <Person look={look} x={x} y={ledge + hem * s} s={s} view="back" noLegs tilt={tilt} armL={armL} armR={armR} />;
};

// Dibujito del taller soñado (se repite en servilleta, burbuja y letrero).
const Sueno: React.FC<{x: number; y: number; s?: number; c?: string; w?: number}> = ({x, y, s = 1, c = INK, w = 6}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={c} strokeWidth={w / s} strokeLinecap="round" strokeLinejoin="round">
    <path d="M -110 60 Q -40 -10 0 -10 Q 50 -10 110 60" />
    <path d="M -35 -10 L -35 -70 L 35 -70 L 35 -10" />
    <path d="M -48 -64 L 0 -108 L 48 -64" />
    <path d="M -10 -10 L -10 -40 L 10 -40 L 10 -10" />
    <circle cx={74} cy={-100} r={18} />
  </g>
);

// ---------------------------------------------------------------- mapa (gancho y giro)
const bez = (a: number[], b: number[], c: number[], d: number[], u: number) => {
  const v = 1 - u;
  return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]];
};
const ROUTE: number[][][] = [
  [[170, 1640], [380, 1600], [200, 1420], [380, 1330]],
  [[380, 1330], [560, 1240], [300, 1120], [520, 1060]],
  [[520, 1060], [700, 1010], [690, 1180], [800, 1130]],
];
const routePts = (n: number) => {
  const out: number[][] = [];
  ROUTE.forEach((seg) => {
    for (let i = 0; i < n; i++) out.push(bez(seg[0], seg[1], seg[2], seg[3], i / n));
  });
  out.push(ROUTE[2][3]);
  return out;
};

export const ammapa: React.FC<P> = ({dur, a}) => {
  const t = useT();
  const giro = a === 'giro';
  const pts = routePts(16);
  const p = giro ? 1 : lin(t, 0.3, 2.6);
  const shown = Math.floor(p * (pts.length - 1));
  const end = ROUTE[2][3];
  const q = lin(t, 2.3, 2.9);
  const people = giro ? ease(t, 0.5, 1.4) : 0;
  const glow = giro ? lin(t, 1.0, 2.2) : 0;
  const word = giro ? ease(t, 2.0, 2.6) : 0;
  return (
    <Cam dur={dur} z={giro ? [1.0, 1.5] : [1.08, 1.0]} x={giro ? [0, -400] : [0, 0]} y={giro ? [0, -400] : [0, 0]}>
      <Svg style={{overflow: 'visible'}}>
        <Defs />
        <rect x={-600} y={-600} width={W + 1200} height={H + 1200} fill={WOOD} />
        {Array.from({length: 16}).map((_, i) => (
          <rect key={i} x={i * 140 - 580} y={-600} width={4} height={H + 1200} fill={WOOD2} opacity={0.45} />
        ))}
        <g transform="rotate(-3 540 1000)">
          <Sh big>
            <rect x={80} y={330} width={920} height={1420} rx={8} fill={PAPER} />
          </Sh>
          {/* tierra, bosques, río y montañas */}
          <path d="M 120 1700 Q 200 1300 140 1000 Q 120 700 300 520 L 520 420 Q 700 380 760 560 Q 820 760 980 820 L 980 1700 Z" fill={SAGE} opacity={0.55} />
          <path d="M 80 760 Q 300 820 420 980 Q 560 1150 980 1240" fill="none" stroke={RIVER} strokeWidth={22} strokeLinecap="round" opacity={0.8} />
          {Array.from({length: 26}).map((_, i) => {
            const r = rng(40 + i);
            const x = 140 + r() * 760;
            const y = 420 + r() * 1250;
            if (Math.hypot(x - end[0], y - end[1]) < 150) return null;
            return <polygon key={i} points={`${x},${y - 34} ${x - 20},${y} ${x + 20},${y}`} fill={OLIVE} opacity={0.8} />;
          })}
          {[[300, 600], [380, 640], [250, 660]].map(([x, y], i) => (
            <polygon key={i} points={`${x},${y - 70} ${x - 60},${y} ${x + 60},${y}`} fill={SAGE2} stroke={FOREST} strokeWidth={3} />
          ))}
          {/* pliegues */}
          <line x1={387} y1={330} x2={387} y2={1750} stroke="#d9cbb0" strokeWidth={3} />
          <line x1={693} y1={330} x2={693} y2={1750} stroke="#d9cbb0" strokeWidth={3} />
          <line x1={80} y1={1040} x2={1000} y2={1040} stroke="#d9cbb0" strokeWidth={3} />
          {/* rosa de los vientos */}
          <g transform="translate(860 1560)" opacity={0.7}>
            <polygon points="0,-60 12,0 0,60 -12,0" fill={ROSE} />
            <polygon points="-60,0 0,-12 60,0 0,12" fill={OLIVE} />
          </g>
          {/* zona en blanco donde debería estar el destino */}
          {!giro && (
            <g>
              <path d="M 640 980 L 690 960 L 720 990 L 770 965 L 820 1000 L 870 975 L 920 1010 L 930 1060 L 905 1110 L 935 1170 L 900 1230 L 850 1250 L 800 1225 L 750 1255 L 700 1230 L 660 1190 L 675 1140 L 640 1100 Z" fill="#fffdf6" stroke="#e5d6b8" strokeWidth={4} />
              <text x={end[0] - 10} y={end[1] + 50} textAnchor="middle" fontFamily="'Baloo 2', sans-serif" fontWeight={800} fontSize={170} fill={MUST} opacity={q} transform={`rotate(${8 - 8 * q} ${end[0]} ${end[1]})`}>
                ?
              </text>
            </g>
          )}
          {/* ruta */}
          {pts.slice(0, shown + 1).map(([x, y], i) => (i % 2 === 0 ? <circle key={i} cx={x} cy={y} r={9} fill={ROSE} /> : null))}
          {!giro && p < 1 && <circle cx={pts[shown][0]} cy={pts[shown][1]} r={16} fill={ROSE} stroke={PAPER} strokeWidth={5} />}
          {giro && (
            <g>
              <circle cx={end[0]} cy={end[1]} r={60 + glow * 90} fill={SUN} opacity={0.55 * glow} />
              <circle cx={end[0]} cy={end[1]} r={40 + glow * 40} fill={SUN} opacity={0.5 * glow} />
              <g opacity={people} transform={`translate(0 ${(1 - people) * 30})`}>
                <Person look={HIM} x={end[0] - 30} y={end[1] + 40} s={0.25} armR={22} />
                <Person look={HER} x={end[0] + 30} y={end[1] + 40} s={0.24} armL={22} />
              </g>
              <text x={end[0]} y={end[1] - 120} textAnchor="middle" fontFamily="'Baloo 2', sans-serif" fontWeight={800} fontSize={58} letterSpacing={6} fill={FOREST} opacity={word}>
                AMERI
              </text>
            </g>
          )}
        </g>
      </Svg>
      <Vignette id="ammv" strength={0.35} color="#2a1d10" />
    </Cam>
  );
};

// ---------------------------------------------------------------- cerros al amanecer (tarjeta de la canción)
export const amcerros: React.FC<P> = ({dur}) => {
  const t = useT();
  const sunY = mix(900, 760, ease(t, 0, dur));
  const walk = t * 0.035;
  return (
    <Cam dur={dur} z={[1.0, 1.05]}>
      <Svg>
        <Defs />
        <Sky id="amcs" />
        <PaperSun x={700} y={sunY} r={120} />
        <PaperBirds x={120} y={430} n={3} speed={40} />
        <Sh>
          <path d={hill(3, 950, 90, 2.2, t * 6)} fill="#c9dcc0" />
        </Sh>
        <Sh>
          <path d={hill(8, 1060, 110, 1.6, t * 12)} fill={SAGE} />
        </Sh>
        {/* camino en zigzag con dos figuritas */}
        <path d="M 160 1330 Q 420 1270 360 1190 Q 300 1120 560 1080" fill="none" stroke={CREAM} strokeWidth={26} strokeLinecap="round" />
        <Person look={HIM} x={mix(230, 400, walk * 8)} y={mix(1305, 1215, walk * 8)} s={0.13} view="back" walk={t * 9} />
        <Person look={HER} x={mix(270, 440, walk * 8)} y={mix(1300, 1200, walk * 8)} s={0.12} view="back" walk={t * 9 + 1} />
        <Sh>
          <path d={hill(12, 1250, 120, 1.3, t * 20)} fill={SAGE2} />
        </Sh>
        <Sh big>
          <path d={hill(21, 1480, 80, 1.1, t * 30)} fill={OLIVE} />
        </Sh>
      </Svg>
    </Cam>
  );
};

// ---------------------------------------------------------------- taller ajeno: él barre, sueña con el suyo
export const amtaller: React.FC<P> = ({dur}) => {
  const t = useT();
  const sw = Math.sin(t * 4.2);
  const bub = ease(t, 1.3, 2.0);
  const r = rng(77);
  return (
    <Cam dur={dur} z={[1.04, 1.0]} y={[10, 0]}>
      <Svg>
        <Defs />
        <rect width={W} height={H} fill={KRAFT} />
        {Array.from({length: 9}).map((_, i) => (
          <rect key={i} x={i * 128} y={0} width={5} height={FLOOR} fill="#b08f66" />
        ))}
        {/* ventana con haz de luz */}
        <Sh>
          <rect x={90} y={360} width={260} height={300} rx={10} fill="#f8e7b8" stroke={WOOD2} strokeWidth={16} />
        </Sh>
        <line x1={220} y1={360} x2={220} y2={660} stroke={WOOD2} strokeWidth={10} />
        <polygon points={`90,660 350,660 640,${FLOOR} 180,${FLOOR}`} fill="#fff3c8" opacity={0.28} />
        {/* panel de herramientas */}
        <Sh>
          <rect x={430} y={380} width={300} height={260} rx={8} fill="#a8865e" />
        </Sh>
        {Array.from({length: 30}).map((_, i) => (
          <circle key={i} cx={455 + (i % 6) * 50} cy={405 + Math.floor(i / 6) * 50} r={5} fill="#6e5236" />
        ))}
        <g fill={FOREST}>
          <rect x={470} y={430} width={20} height={150} rx={6} />
          <rect x={445} y={420} width={70} height={30} rx={6} />
          <polygon points="560,430 640,430 640,570 560,520" />
          <rect x={665} y={430} width={18} height={160} rx={5} />
          <rect x={665} y={430} width={50} height={18} rx={5} />
        </g>
        {/* suelo */}
        <rect x={0} y={FLOOR} width={W} height={H - FLOOR} fill={WOOD} />
        <rect x={0} y={FLOOR} width={W} height={14} fill={WOOD2} />
        {/* mesa del dueño */}
        <Person look={OTHER} x={840} y={1150} s={0.95} noLegs armL={30} armR={40 + Math.sin(t * 5) * 8} />
        <Sh>
          <rect x={600} y={880} width={470} height={46} rx={6} fill={WOOD2} />
          <rect x={630} y={926} width={30} height={FLOOR - 926} fill="#5d4330" />
          <rect x={1010} y={926} width={30} height={FLOOR - 926} fill="#5d4330" />
          <rect x={680} y={850} width={240} height={30} rx={4} fill="#d8b98a" />
        </Sh>
        {/* él barre */}
        <g>
          <line x1={330 + 60} y1={720} x2={330 + 130 + sw * 40} y2={FLOOR - 6} stroke="#8a5a2a" strokeWidth={14} strokeLinecap="round" />
          <rect x={330 + 70 + sw * 40} y={FLOOR - 40} width={130} height={36} rx={8} fill={MUST} />
        </g>
        <Person look={HIM} x={320} y={FLOOR} s={0.9} armL={10} armR={30 + sw * 10} tilt={6} />
        {/* aserrín */}
        {Array.from({length: 26}).map((_, i) => {
          const x0 = r() * 620 + 120;
          const sp = 20 + r() * 30;
          const y = FLOOR - ((r() * 500 + t * sp) % 520);
          return <circle key={i} cx={x0 + Math.sin(t + i) * 20} cy={y} r={3 + r() * 4} fill="#f3dfae" opacity={0.75} />;
        })}
        {/* burbuja de sueño con el taller propio */}
        <g opacity={bub} transform={`translate(0 ${(1 - bub) * 20})`}>
          <circle cx={440} cy={760} r={14} fill={PAPER} />
          <circle cx={490} cy={700} r={22} fill={PAPER} />
          <Sh big>
            <ellipse cx={720} cy={520} rx={250} ry={170} fill={PAPER} />
          </Sh>
          <Sueno x={720} y={545} s={1.05} c={OLIVE} w={8} />
        </g>
      </Svg>
    </Cam>
  );
};

// ---------------------------------------------------------------- puesto de flores: ella mira sus dibujos
const Flor: React.FC<{x: number; y: number; c: string; s?: number}> = ({x, y, c, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-3} y={0} width={6} height={60} fill={OLIVE} />
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx={0} cy={-16} rx={11} ry={18} fill={c} transform={`rotate(${a})`} />
    ))}
    <circle r={9} fill={MUST} />
  </g>
);

export const amflores: React.FC<P> = ({dur}) => {
  const t = useT();
  const sheets = [0, 1, 2].map((i) => ease(t, 0.6 + i * 0.55, 1.8 + i * 0.55));
  return (
    <Cam dur={dur} z={[1.06, 1.0]}>
      <Svg>
        <Defs />
        <rect width={W} height={H} fill="#e7d9bb" />
        {Array.from({length: 14}).map((_, i) => (
          <rect key={i} x={0} y={i * 80} width={W} height={4} fill="#d8c69f" />
        ))}
        {/* toldo */}
        <Sh big>
          <rect x={470} y={430} width={560} height={40} fill={FOREST} />
          {Array.from({length: 7}).map((_, i) => (
            <path key={i} d={`M ${470 + i * 80} 470 L ${550 + i * 80} 470 L ${550 + i * 80} 540 Q ${510 + i * 80} 580 ${470 + i * 80} 540 Z`} fill={i % 2 ? CREAM : SAGE2} />
          ))}
        </Sh>
        <text x={750} y={462} textAnchor="middle" fontFamily="'Baloo 2', sans-serif" fontWeight={800} fontSize={34} letterSpacing={8} fill={CREAM}>
          FLORES
        </text>
        {/* ella detrás del mostrador */}
        <Person look={HER} x={760} y={1010} s={0.82} noLegs armL={20} armR={sheets[2] > 0.9 ? 120 : 24} />
        <Sh big>
          <rect x={500} y={840} width={520} height={FLOOR - 840} rx={6} fill={SAGE2} />
          <rect x={500} y={840} width={520} height={26} fill={OLIVE} />
        </Sh>
        {[560, 700, 840, 960].map((x, i) => (
          <g key={x}>
            {Array.from({length: 5}).map((_, k) => (
              <Flor key={k} x={x - 30 + k * 15} y={760 - (k % 2) * 30 + Math.sin(t * 2 + k + i) * 3} c={[ROSE, MUST, PAPER, '#c77d9a'][(i + k) % 4]} s={0.9} />
            ))}
            <rect x={x - 42} y={790} width={84} height={56} rx={6} fill={KRAFT} />
          </g>
        ))}
        <rect x={0} y={FLOOR} width={W} height={H - FLOOR} fill="#b9a07c" />
        <rect x={0} y={FLOOR} width={W} height={12} fill="#9e8562" />
        {/* él con su cuaderno */}
        <Person look={HIM} x={250} y={FLOOR} s={0.9} armL={8} armR={52} />
        <Sh>
          <rect x={300} y={720} width={110} height={140} rx={6} fill={PAPER} transform="rotate(-12 355 790)" />
        </Sh>
        {/* hojas con dibujos que vuelan hacia ella */}
        {sheets.map((p, i) => {
          const x = mix(360, 560 + i * 120, p);
          const y = mix(760, 560 - i * 40, p) - Math.sin(p * Math.PI) * 120;
          return (
            <g key={i} opacity={p > 0 ? 1 : 0} transform={`translate(${x} ${y}) rotate(${mix(-20, -8 + i * 9, p) + Math.sin(t * 2 + i) * 3})`}>
              <Sh>
                <rect x={-80} y={-100} width={160} height={200} rx={4} fill={PAPER} />
              </Sh>
              <Sueno x={0} y={20} s={0.55} c={OLIVE} w={6} />
            </g>
          );
        })}
        <Petals seed={9} n={8} area={[480, 600, 560, 500]} />
      </Svg>
    </Cam>
  );
};

// ---------------------------------------------------------------- servilleta: dibuja Ameri
type Pt = [number, number];
const pl = (pts: Pt[], p: number): {d: string; tip: Pt} => {
  if (p <= 0) return {d: '', tip: pts[0]};
  const segs = pts.length - 1;
  const f = Math.min(1, p) * segs;
  const k = Math.floor(f);
  const out = pts.slice(0, k + 1);
  let tip = pts[Math.min(k, segs)];
  if (k < segs) {
    const u = f - k;
    tip = [mix(pts[k][0], pts[k + 1][0], u), mix(pts[k][1], pts[k + 1][1], u)];
    out.push(tip);
  }
  return {d: 'M ' + out.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' L '), tip};
};
const circlePts = (cx: number, cy: number, r: number, n = 24): Pt[] => Array.from({length: n + 1}).map((_, i) => [cx + r * Math.cos((i / n) * Math.PI * 2 - Math.PI / 2), cy + r * Math.sin((i / n) * Math.PI * 2 - Math.PI / 2)]);
const STROKES: Pt[][] = [
  Array.from({length: 25}).map((_, i): Pt => {
    const x = 40 + i * 22;
    return [x, 400 - 150 * Math.sin((Math.PI * (x - 40)) / 528)];
  }),
  [[240, 260], [240, 170], [360, 170], [360, 260]],
  [[222, 178], [300, 108], [378, 178]],
  [[285, 255], [285, 210], [315, 210], [315, 255]],
  circlePts(470, 110, 44),
  [[300, 262], [250, 320], [150, 340], [110, 420], [60, 470]],
];

export const amservilleta: React.FC<P> = ({dur}) => {
  const t = useT();
  const draw = lin(t, 0.25, 2.55) * STROKES.length;
  const word = lin(t, 2.55, 3.1);
  const her = ease(t, 3.1, 3.9);
  let tip: Pt = STROKES[0][0];
  const paths = STROKES.map((s, i) => {
    const r = pl(s, draw - i);
    if (draw - i > 0 && draw - i < 1) tip = r.tip;
    return r.d;
  });
  if (draw >= STROKES.length) tip = [300 + 140 * word, 540];
  const NX = 240;
  const NY = 350;
  const tx = NX + tip[0];
  const ty = NY + tip[1];
  return (
    <Cam dur={dur} z={[1.12, 1.02]} y={[30, 0]}>
      <Svg>
        <Defs />
        <rect width={W} height={H} fill={WOOD} />
        {Array.from({length: 10}).map((_, i) => (
          <rect key={i} x={0} y={i * 200 + 40} width={W} height={5} fill={WOOD2} opacity={0.5} />
        ))}
        {/* taza */}
        <Sh big>
          <circle cx={860} cy={1560} r={120} fill={PAPER} />
          <circle cx={860} cy={1560} r={88} fill="#6b4630" />
          <rect x={970} y={1540} width={60} height={36} rx={18} fill={PAPER} />
        </Sh>
        <g transform={`rotate(-4 ${NX + 300} ${NY + 300})`}>
          <Sh big>
            <rect x={NX} y={NY} width={600} height={620} rx={6} fill="#fffdf8" />
          </Sh>
          <rect x={NX + 24} y={NY + 24} width={552} height={572} fill="none" stroke="#efe6d4" strokeWidth={4} strokeDasharray="10 10" />
          <g transform={`translate(${NX} ${NY})`} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
            {paths.map((d, i) => (d ? <path key={i} d={d} strokeDasharray={i === 5 ? '18 16' : undefined} /> : null))}
            {draw > 4.9 &&
              [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
                const a = (k / 8) * Math.PI * 2;
                const o = lin(draw, 4.9 + k * 0.02, 5.0 + k * 0.02);
                return <line key={k} x1={470 + Math.cos(a) * 58} y1={110 + Math.sin(a) * 58} x2={470 + Math.cos(a) * (58 + 26 * o)} y2={110 + Math.sin(a) * (58 + 26 * o)} />;
              })}
          </g>
          <text
            x={NX + 300}
            y={NY + 560}
            textAnchor="middle"
            fontFamily="'Baloo 2', sans-serif"
            fontWeight={800}
            fontSize={92}
            letterSpacing={10}
            fill={ROSE}
            opacity={word}
            style={{clipPath: `inset(0 ${(1 - word) * 100}% 0 0)`}}
          >
            AMERI
          </text>
        </g>
        {/* mano de él con lápiz */}
        <g transform={`translate(${tx} ${ty})`}>
          <g transform="rotate(32)">
            <rect x={-9} y={0} width={18} height={190} rx={4} fill={MUST} />
            <polygon points="-9,0 9,0 0,-26" fill="#f3d8b0" />
            <polygon points="-3,-17 3,-17 0,-26" fill={INK} />
            <rect x={-9} y={180} width={18} height={26} rx={4} fill={ROSE} />
          </g>
          <Hand x={100} y={230} rot={-28} s={0.7} skin="#b47a52" sleeve={OLIVE} curl={0.85} />
        </g>
        {/* mano de ella que se posa */}
        <g opacity={her > 0 ? 1 : 0}>
          <Hand x={mix(-260, 120, her)} y={1070} rot={62} s={0.72} skin="#e8b892" sleeve={ROSE} curl={0.1} />
        </g>
      </Svg>
    </Cam>
  );
};

// ---------------------------------------------------------------- doble turno (time-lapse)
export const amturno: React.FC<P> = ({dur}) => {
  const t = useT();
  const cyc = (t / dur) * 2.2; // días que pasan
  const night = 0.5 - 0.5 * Math.cos(cyc * Math.PI * 2);
  const sky = mixC('#bfe0f0', '#24324a', night);
  const arm = Math.sin(t * 9) * 16;
  const chairs = Math.min(5, Math.floor(lin(t, 0.3, dur - 0.5) * 6));
  const r = rng(31);
  return (
    <Cam dur={dur} z={[1.0, 1.06]}>
      <Svg>
        <Defs />
        <rect width={W} height={H} fill={mixC(KRAFT, '#6d5a48', night * 0.6)} />
        {/* ventana con el cielo que cambia */}
        <Sh>
          <rect x={360} y={340} width={360} height={300} rx={10} fill={sky} stroke={WOOD2} strokeWidth={16} />
        </Sh>
        <g>
          <clipPath id="amtw">
            <rect x={368} y={348} width={344} height={284} />
          </clipPath>
          <g clipPath="url(#amtw)">
            {(() => {
              const u = (cyc % 1) * 2; // 0..1 sol, 1..2 luna
              const isSun = u < 1;
              const k = isSun ? u : u - 1;
              const x = mix(330, 750, k);
              const y = 600 - Math.sin(k * Math.PI) * 220;
              return isSun ? <circle cx={x} cy={y} r={42} fill={SUN} /> : <circle cx={x} cy={y} r={34} fill="#f4ead5" />;
            })()}
            {night > 0.5 && Array.from({length: 10}).map((_, i) => <circle key={i} cx={380 + r() * 320} cy={360 + r() * 200} r={3} fill="#fff" opacity={night} />)}
          </g>
        </g>
        <line x1={540} y1={340} x2={540} y2={640} stroke={WOOD2} strokeWidth={10} />
        {/* reloj que vuela */}
        <g transform="translate(870 450)">
          <circle r={78} fill={PAPER} stroke={FOREST} strokeWidth={10} />
          <line x1={0} y1={0} x2={Math.sin(t * 3) * 38} y2={-Math.cos(t * 3) * 38} stroke={FOREST} strokeWidth={9} strokeLinecap="round" />
          <line x1={0} y1={0} x2={Math.sin(t * 22) * 58} y2={-Math.cos(t * 22) * 58} stroke={ROSE} strokeWidth={5} strokeLinecap="round" />
        </g>
        <rect x={0} y={FLOOR} width={W} height={H - FLOOR} fill={mixC(WOOD, '#4a3a2c', night * 0.5)} />
        {/* sillas terminadas que se apilan */}
        {Array.from({length: chairs}).map((_, i) => (
          <g key={i} transform={`translate(${90 + (i % 2) * 40} ${FLOOR - i * 70})`}>
            <rect x={0} y={-70} width={150} height={20} rx={4} fill={i % 2 ? '#d8b98a' : '#c49a68'} />
            <rect x={10} y={-50} width={14} height={50} fill="#8a6440" />
            <rect x={126} y={-50} width={14} height={50} fill="#8a6440" />
          </g>
        ))}
        {/* él lijando tras el banco */}
        <Person look={HIM} x={600} y={1100} s={0.95} noLegs armL={58 + arm} armR={58 - arm} />
        <Sh big>
          <rect x={330} y={900} width={560} height={46} rx={6} fill={WOOD2} />
          <rect x={360} y={946} width={30} height={FLOOR - 946} fill="#5d4330" />
          <rect x={830} y={946} width={30} height={FLOOR - 946} fill="#5d4330" />
          <rect x={430} y={866} width={360} height={34} rx={4} fill="#e0c393" />
        </Sh>
        {/* astillas */}
        {Array.from({length: 18}).map((_, i) => {
          const ph = (t * 1.6 + r()) % 1;
          const x = 600 + (r() - 0.5) * 300 + (r() - 0.5) * 200 * ph;
          const y = 860 - Math.sin(ph * Math.PI) * 120 - ph * 20;
          return <rect key={i} x={x} y={y} width={14} height={5} rx={2} fill="#f0d29a" transform={`rotate(${ph * 400 + i * 30} ${x} ${y})`} opacity={1 - ph} />;
        })}
      </Svg>
      <AbsoluteFill style={{background: '#0e1830', opacity: night * 0.28, mixBlendMode: 'multiply'}} />
    </Cam>
  );
};

// ---------------------------------------------------------------- dos veces negado
const Sello: React.FC<{t: number; at: number; x: number; y: number; rot: number}> = ({t, at, x, y, rot}) => {
  const down = lin(t, at - 0.25, at);
  const up = lin(t, at + 0.12, at + 0.45);
  const handleY = y - 420 + down * 300 - up * 360;
  const ink = t >= at ? 1 : 0;
  return (
    <g>
      <g opacity={ink} transform={`translate(${x} ${y}) rotate(${rot}) scale(${t >= at ? 1 + 0.15 * (1 - lin(t, at, at + 0.12)) : 1})`}>
        <rect x={-230} y={-70} width={460} height={140} rx={14} fill="none" stroke="#c8473b" strokeWidth={12} opacity={0.88} />
        <text x={0} y={34} textAnchor="middle" fontFamily="'Baloo 2', sans-serif" fontWeight={800} fontSize={100} letterSpacing={8} fill="#c8473b" opacity={0.88}>
          NEGADO
        </text>
      </g>
      {up < 1 && (
        <g transform={`translate(${x} ${handleY}) rotate(${rot})`}>
          <Sh big>
            <rect x={-150} y={-60} width={300} height={70} rx={10} fill="#7a4a3a" />
            <rect x={-30} y={-210} width={60} height={160} rx={12} fill={WOOD2} />
            <circle cx={0} cy={-230} r={58} fill={WOOD} />
          </Sh>
        </g>
      )}
    </g>
  );
};

export const amsellos: React.FC<P> = ({dur}) => {
  const t = useT();
  const hit = (at: number) => Math.max(0, 1 - Math.abs(t - at) / 0.12) * (t >= at ? 1 : 0);
  const shake = (hit(0.55) + hit(1.25)) * 10;
  const bubbles = [ease(t, 1.7, 2.1), ease(t, 2.1, 2.5), ease(t, 2.5, 2.9)];
  return (
    <Cam dur={dur} z={[1.02, 1.08]}>
      <AbsoluteFill style={{transform: `translate(${Math.sin(t * 90) * shake}px, ${Math.cos(t * 70) * shake}px)`}}>
        <Svg>
          <Defs />
          <rect width={W} height={H} fill={SAGE} />
          {Array.from({length: 12}).map((_, i) => (
            <circle key={i} cx={(i * 211) % W} cy={300 + ((i * 397) % 1500)} r={60 + (i % 3) * 30} fill={SAGE2} opacity={0.35} />
          ))}
          <g transform="rotate(-2 540 720)">
            <Sh big>
              <rect x={170} y={330} width={740} height={780} rx={8} fill={PAPER} />
            </Sh>
            <text x={540} y={430} textAnchor="middle" fontFamily="'Baloo 2', sans-serif" fontWeight={800} fontSize={50} letterSpacing={4} fill={FOREST}>
              SOLICITUD
            </text>
            <text x={540} y={480} textAnchor="middle" fontFamily="'Baloo 2', sans-serif" fontWeight={700} fontSize={30} letterSpacing={3} fill={OLIVE}>
              PRÉSTAMO · TALLER PROPIO
            </text>
            {Array.from({length: 7}).map((_, i) => (
              <rect key={i} x={230} y={540 + i * 62} width={i % 3 === 2 ? 380 : 560} height={12} rx={6} fill="#e2d6bd" />
            ))}
            <g transform="translate(760 960) rotate(6)">
              <rect x={-100} y={-90} width={200} height={170} fill="#fff" stroke="#e2d6bd" strokeWidth={4} />
              <Sueno x={0} y={20} s={0.62} c={OLIVE} w={6} />
            </g>
          </g>
          <Sello t={t} at={0.55} x={500} y={640} rot={-12} />
          <Sello t={t} at={1.25} x={560} y={880} rot={9} />
          {/* voces que dudan */}
          {[
            [250, 1000, -1],
            [830, 360, 1],
            [200, 400, -1],
          ].map(([x, y, s], i) => (
            <g key={i} opacity={bubbles[i]} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * bubbles[i]})`}>
              <Sh>
                <ellipse rx={110} ry={68} fill={CREAM} />
                <polygon points={`${s * 40},50 ${s * 90},110 ${s * 70},40`} fill={CREAM} />
              </Sh>
              {[-36, 0, 36].map((dx) => (
                <circle key={dx} cx={dx} cy={0} r={11} fill={OLIVE} />
              ))}
            </g>
          ))}
        </Svg>
      </AbsoluteFill>
    </Cam>
  );
};

// ---------------------------------------------------------------- frasco "AMERI"
export const amfrasco: React.FC<P> = ({dur}) => {
  const t = useT();
  const COINS = 9;
  const level = lin(t, 0.4, dur - 0.4);
  const r = rng(12);
  return (
    <Cam dur={dur} z={[1.06, 1.0]}>
      <Svg>
        <Defs />
        <rect width={W} height={H} fill="#f2dfa8" />
        {Array.from({length: 7}).map((_, i) => (
          <rect key={i} x={i * 170 + 30} y={0} width={70} height={FLOOR} fill="#ecd394" />
        ))}
        {/* repisa */}
        <rect x={0} y={FLOOR - 20} width={W} height={H - FLOOR + 20} fill={WOOD} />
        <rect x={0} y={FLOOR - 20} width={W} height={20} fill={WOOD2} />
        {/* plantita y servilleta enmarcada (el sueño a la vista) */}
        <g transform="translate(870 900)">
          <Sh>
            <rect x={-70} y={0} width={140} height={190} rx={10} fill={ROSE} />
          </Sh>
          {[-40, -10, 20, 45].map((dx, i) => (
            <ellipse key={i} cx={dx} cy={-50 - (i % 2) * 40} rx={26} ry={60} fill={i % 2 ? OLIVE : SAGE2} transform={`rotate(${dx / 2} ${dx} -20)`} />
          ))}
        </g>
        <g transform="translate(190 720) rotate(-5)">
          <Sh>
            <rect x={-120} y={-150} width={240} height={290} rx={6} fill={WOOD2} />
            <rect x={-100} y={-130} width={200} height={250} fill="#fffdf8" />
          </Sh>
          <Sueno x={0} y={10} s={0.7} c={INK} w={6} />
        </g>
        {/* frasco */}
        <g transform="translate(540 0)">
          <clipPath id="amjar">
            <rect x={-190} y={560} width={380} height={530} rx={60} />
          </clipPath>
          <g clipPath="url(#amjar)">
            <rect x={-200} y={mix(1090, 760, level)} width={400} height={600} fill={MUST} />
            {Array.from({length: 40}).map((_, i) => {
              const cx = -170 + (i % 8) * 48 + (Math.floor(i / 8) % 2) * 24;
              const cy = mix(1090, 760, level) + 26 + Math.floor(i / 8) * 40;
              return <ellipse key={i} cx={cx} cy={cy} rx={26} ry={12} fill={i % 3 ? '#f7c95a' : '#d6992c'} stroke="#b37b1f" strokeWidth={2} />;
            })}
          </g>
          <rect x={-190} y={560} width={380} height={530} rx={60} fill="#e6f2ec" opacity={0.28} stroke={FOREST} strokeWidth={8} />
          <rect x={-150} y={590} width={26} height={420} rx={13} fill="#fff" opacity={0.5} />
          <rect x={-130} y={510} width={260} height={60} rx={12} fill={OLIVE} />
          <rect x={-60} y={520} width={120} height={14} rx={7} fill={FOREST} />
          {/* etiqueta */}
          <g transform="rotate(-4)">
            <Sh>
              <rect x={-150} y={700} width={300} height={120} rx={10} fill={KRAFT} />
            </Sh>
            <text x={0} y={790} textAnchor="middle" fontFamily="'Baloo 2', sans-serif" fontWeight={800} fontSize={76} letterSpacing={8} fill={FOREST}>
              AMERI
            </text>
          </g>
          {/* monedas que caen */}
          {Array.from({length: COINS}).map((_, i) => {
            const at = 0.3 + i * ((dur - 0.9) / COINS);
            const k = lin(t, at, at + 0.45);
            if (k <= 0 || k >= 1) return null;
            const y = mix(330, mix(1060, 740, level), k * k);
            const x = (r() - 0.5) * 120;
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${k * 540})`}>
                <ellipse rx={32} ry={32 * Math.abs(Math.cos(k * 9))} fill="#f7c95a" stroke="#b37b1f" strokeWidth={4} />
              </g>
            );
          })}
        </g>
        {/* destellos */}
        {[0, 1, 2].map((i) => {
          const o = Math.max(0, Math.sin(t * 3 + i * 2));
          return <polygon key={i} points="0,-26 6,-6 26,0 6,6 0,26 -6,6 -26,0 -6,-6" fill={PAPER} opacity={o} transform={`translate(${380 + i * 170} ${620 + (i % 2) * 120}) scale(${0.6 + o * 0.6})`} />;
        })}
      </Svg>
    </Cam>
  );
};

// ---------------------------------------------------------------- las llaves: se abre su taller
export const amllaves: React.FC<P> = ({dur}) => {
  const t = useT();
  const shutter = ease(t, 0.5, 2.1);
  const arm = ease(t, 0.1, 0.6);
  const a = mix(10, 150, arm);
  const s = 0.86;
  const rad = (a * Math.PI) / 180;
  const hx = 540 + (74 + 194 * Math.sin(rad)) * s;
  const hy = FLOOR + 8 + (-402 + 194 * Math.cos(rad)) * s;
  const kSw = Math.sin(t * 7) * 18 * (1 - lin(t, 0.6, 2.5));
  return (
    <Cam dur={dur} z={[1.1, 1.0]} y={[40, 0]}>
      <Svg>
        <Defs />
        <Sky id="amls" top="#d4ead9" bottom="#fbe3b0" />
        <PaperSun x={860} y={300} r={80} rays={false} />
        {/* fachada */}
        <Sh big>
          <rect x={110} y={330} width={860} height={FLOOR - 330} fill={SAGE2} />
          <polygon points="80,340 1000,340 960,290 120,290" fill={FOREST} />
        </Sh>
        {/* letrero con el dibujito de la servilleta */}
        <Sh>
          <rect x={330} y={380} width={420} height={150} rx={14} fill={CREAM} />
        </Sh>
        <Sueno x={540} y={478} s={0.62} c={ROSE} w={6} />
        {/* interior cálido */}
        <rect x={250} y={590} width={580} height={FLOOR - 590} fill="#ffd98a" />
        <rect x={300} y={880} width={480} height={30} fill={WOOD2} />
        <rect x={320} y={910} width={20} height={200} fill="#5d4330" />
        <rect x={740} y={910} width={20} height={200} fill="#5d4330" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={300 + i * 120} y={650} width={20} height={140} rx={6} fill={OLIVE} opacity={0.7} />
        ))}
        {/* persiana que sube */}
        <g>
          <rect x={250} y={590} width={580} height={(FLOOR - 590) * (1 - shutter)} fill="#d9d2c0" />
          {Array.from({length: 16}).map((_, i) => {
            const y = 590 + i * 34;
            return y < 590 + (FLOOR - 590) * (1 - shutter) ? <rect key={i} x={250} y={y} width={580} height={6} fill="#b8b09c" /> : null;
          })}
          <rect x={240} y={570} width={600} height={30} rx={8} fill={FOREST} />
        </g>
        <rect x={0} y={FLOOR} width={W} height={H - FLOOR} fill="#cbb48c" />
        <rect x={0} y={FLOOR} width={W} height={10} fill="#ab9670" />
        {/* él, de espaldas, levanta las llaves; ella aplaude */}
        <Person look={HIM} x={540} y={FLOOR + 8} s={s} view="back" armR={a} armL={8} />
        <g transform={`translate(${hx} ${hy}) rotate(${kSw})`}>
          <circle cx={0} cy={18} r={22} fill="none" stroke={MUST} strokeWidth={7} />
          <g transform="translate(-8 40) rotate(12)">
            <rect x={-6} y={0} width={12} height={70} rx={4} fill={MUST} />
            <rect x={-6} y={50} width={26} height={10} fill={MUST} />
            <circle cx={0} cy={-4} r={14} fill={MUST} />
          </g>
          <g transform="translate(14 38) rotate(-18)">
            <rect x={-5} y={0} width={10} height={58} rx={4} fill="#cfd6c8" />
            <circle cx={0} cy={-4} r={12} fill="#cfd6c8" />
          </g>
          {[0, 1, 2, 3].map((i) => {
            const o = Math.max(0, Math.sin(t * 5 + i * 1.6));
            return <polygon key={i} points="0,-18 4,-4 18,0 4,4 0,18 -4,4 -18,0 -4,-4" fill={PAPER} opacity={o} transform={`translate(${-50 + i * 34} ${-30 + (i % 2) * 70}) scale(${0.5 + o * 0.7})`} />;
          })}
        </g>
        <Person look={HER} x={810} y={FLOOR + 8} s={0.8} view="back" armL={40 + Math.abs(Math.sin(t * 8)) * 30} armR={40 + Math.abs(Math.sin(t * 8)) * 30} />
        <Petals seed={4} n={12} area={[100, 320, 880, 760]} />
      </Svg>
    </Cam>
  );
};

// ---------------------------------------------------------------- el techo al amanecer
export const amtecho: React.FC<P> = ({dur}) => {
  const t = useT();
  const sunY = mix(980, 760, ease(t, 0, dur));
  const ask = ease(t, 2.1, 2.6);
  const r = rng(8);
  return (
    <Cam dur={dur} z={[1.0, 1.08]} y={[0, 20]}>
      <Svg>
        <Defs />
        <Sky id="amts" top="#9fbfb4" bottom="#ffd9a0" />
        <PaperSun x={540} y={sunY} r={130} />
        <PaperBirds x={140} y={470} n={4} speed={35} />
        <Sh>
          <path d={hill(30, 920, 70, 1.8)} fill="#bcd1b2" />
        </Sh>
        {/* azoteas de la ciudad */}
        <Sh>
          <g>
            {Array.from({length: 11}).map((_, i) => {
              const w = 70 + r() * 70;
              const h = 80 + r() * 140;
              const x = i * 100 - 20;
              return (
                <g key={i}>
                  <rect x={x} y={1000 - h} width={w} height={h + 200} fill={i % 2 ? SAGE2 : OLIVE} />
                  {r() < 0.5 && <rect x={x + 20} y={1000 - h - 40} width={30} height={40} fill={FOREST} />}
                  {Array.from({length: 3}).map((_, k) => (
                    <rect key={k} x={x + 12 + k * 22} y={1000 - h + 20} width={12} height={16} fill={SUN} opacity={0.4 + 0.4 * lin(t, 0, dur)} />
                  ))}
                </g>
              );
            })}
          </g>
        </Sh>
        {/* cornisa del techo */}
        <Sh big>
          <rect x={-20} y={FLOOR - 30} width={W + 40} height={H - FLOOR + 60} fill={ROSE} />
          <rect x={-20} y={FLOOR - 40} width={W + 40} height={26} fill="#c06f63" />
        </Sh>
        <SeatedBack look={HIM} x={430} ledge={FLOOR - 40} s={0.9} armR={14} tilt={mix(0, 6, ask)} />
        <SeatedBack look={HER} x={630} ledge={FLOOR - 40} s={0.84} armL={14} tilt={mix(0, -14, ask)} />
        {/* manos entrelazadas entre ambos */}
        <circle cx={530} cy={FLOOR - 70} r={15} fill="#c99470" />
        <Petals seed={14} n={10} colors={[PAPER, SUN]} area={[0, 300, W, 600]} />
      </Svg>
    </Cam>
  );
};

// ---------------------------------------------------------------- el camino sigue (cierre)
export const amcamino: React.FC<P> = ({dur}) => {
  const t = useT();
  const k = ease(t, 0, dur + 0.6);
  const y = mix(1040, 820, k);
  const s = mix(0.42, 0.22, k);
  const x = mix(560, 520, k);
  return (
    <Cam dur={dur} z={[1.0, 1.1]} y={[0, 40]}>
      <Svg>
        <Defs />
        <Sky id="amcm" top="#cfe6d6" bottom="#ffe0a3" />
        <PaperSun x={540} y={640} r={150} />
        <PaperBirds x={200} y={420} n={3} speed={30} />
        <Sh>
          <path d={hill(41, 760, 60, 2.1)} fill="#c9dcc0" />
        </Sh>
        <Sh>
          <path d={hill(44, 860, 80, 1.5)} fill={SAGE} />
        </Sh>
        {/* camino que sube hacia el sol */}
        <path d={`M 300 ${H} Q 640 1500 520 1200 Q 420 960 540 760 L 556 760 Q 460 960 600 1200 Q 760 1500 780 ${H} Z`} fill={CREAM} />
        <path d="M 540 1900 Q 700 1500 560 1200 Q 450 960 548 770" fill="none" stroke={MUST} strokeWidth={8} strokeDasharray="30 30" opacity={0.7} />
        {/* ellos, de la mano, caminando hacia el sol */}
        <Person look={HIM} x={x - 60 * s} y={y} s={s} view="back" walk={t * 7} armR={18} />
        <Person look={HER} x={x + 60 * s} y={y} s={s * 0.95} view="back" walk={t * 7 + Math.PI} armL={18} />
        <Petals seed={2} n={16} area={[0, 340, W, 900]} />
      </Svg>
      <Vignette id="amcv" strength={0.25} color="#3a2a10" />
    </Cam>
  );
};
