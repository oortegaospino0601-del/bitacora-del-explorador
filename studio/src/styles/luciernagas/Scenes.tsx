// Escenas de "Historia: Luciérnagas". Cada escena recibe t (segundos locales) y d (duración).
import React from 'react';
import {
  Boy, C, Chair, Grass, Heart, Hills, House, Mate, Moon, Stars, Termo, Tree, blink, clamp, ease, easeIn, easeOut, ff, lerp, profilePoints, rnd, seg,
} from './Lib';

type SP = {t: number; d: number};
const cam = (cx: number, cy: number, s: number, rot = 0) => `translate(540 960) rotate(${rot}) scale(${s}) translate(${-cx} ${-cy})`;
const Svg: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg = C.night0}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, background: bg}}>
    {children}
  </svg>
);
const Vignette = ({o = 1}: {o?: number}) => <rect x={0} y={0} width={1080} height={1920} fill="url(#vignette)" opacity={o} />;

// 1 · GANCHO: cielo nocturno que estalla en luciérnagas que vuelan hacia la cámara
export const S1Hook: React.FC<SP> = ({t, d}) => {
  const u = easeOut(t / 4.8);
  const cy = lerp(1250, 1020, u);
  const s = lerp(1.32, 1.0, u);
  const rot = lerp(-6, 0, u);
  const N = 190;
  const parts = Array.from({length: N}).map((_, i) => {
    const X = (rnd(i, 1) - 0.5) * 2600;
    const Y = (rnd(i, 2) - 0.62) * 3000;
    const span = 5.6;
    const z = 6 - ((Math.sqrt(rnd(i, 3)) * span + t * 1.35) % span);
    const vx = 540, vy = 720;
    const x = vx + (X * 0.42) / z;
    const y = vy + (Y * 0.42) / z;
    const ign = rnd(i, 4) * 0.5 - 0.3; // más de la mitad ya encendidas en el fotograma 0
    const lit = clamp((t - ign) / 0.12);
    const flash = t > ign && t < ign + 0.35 ? 1 + 1.0 * (1 - (t - ign) / 0.35) : 1;
    const near = clamp((z - 0.18) / 0.4);
    const far = clamp((6 - z) / 2.2);
    const r = Math.min(36, 5.6 / Math.pow(z, 1.1));
    return {x, y, r, a: lit * near * far * flash * blink(i, t), z, i};
  });
  parts.sort((a, b) => b.z - a.z);
  return (
    <Svg>
      <g transform={cam(540, cy, s, rot)}>
        <rect x={-800} y={-900} width={2700} height={3600} fill="url(#nightSky)" />
        <Stars t={t} n={140} y0={-700} y1={1350} />
        <Moon x={830} y={330} r={58} />
        <Hills y={1440} />
        <Tree x={130} y={1560} s={0.9} />
        <House x={880} y={1540} s={0.62} lit={1} />
        <rect x={-800} y={1560} width={2700} height={900} fill={C.grass} />
        <Grass t={t} n={70} x0={-200} x1={1280} y={1600} h={70} color={C.grass2} />
        <Boy x={540} y={1690} s={0.8} view="back" armL={[22, 6]} armR={[22, 6]} lookUp={1} />
        {Array.from({length: 26}).map((_, i) => {
          const bx = 540 + (rnd(i, 7) - 0.5) * 1100 + Math.sin(t * 0.9 + i) * 30;
          const by = 1640 - rnd(i, 8) * 520 - t * 22 * (0.5 + rnd(i, 9));
          return ff('g' + i, bx, by, 4.5, clamp((t - rnd(i, 6) * 0.4) / 0.15) * blink(i, t));
        })}
        <Grass t={t} n={40} x0={-250} x1={1330} y={1960} h={150} color="#071419" seed={9} />
      </g>
      <g>{parts.map((p) => ff('p' + p.i, p.x, p.y, p.r, p.a))}</g>
      <Vignette />
    </Svg>
  );
};

// 2 · La casa en silencio: ventana abierta, termo y mate, la silla vacía. Travelling lateral.
export const S2Casa: React.FC<SP> = ({t, d}) => {
  const u = ease(t / d);
  const cx = lerp(470, 1330, u);
  const curtain = (k: number) => Math.sin(t * 1.6 + k) * 26;
  return (
    <Svg>
      <g transform={cam(cx, 1200, 1.22, lerp(-1, 1, u))}>
        <rect x={-400} y={0} width={2600} height={1400} fill="#16223F" />
        {Array.from({length: 30}).map((_, i) => (
          <rect key={i} x={-400 + i * 90} y={0} width={30} height={1400} fill="#1A2747" />
        ))}
        {/* ventana */}
        <rect x={250} y={440} width={400} height={500} fill="url(#nightSky)" />
        <Stars t={t} n={26} x0={260} x1={640} y0={450} y1={900} seed={21} />
        <Moon x={520} y={560} r={42} />
        <rect x={236} y={426} width={428} height={528} fill="none" stroke="#3B2A2A" strokeWidth={26} />
        <rect x={443} y={440} width={14} height={500} fill="#3B2A2A" />
        <rect x={210} y={950} width={480} height={30} rx={6} fill="#4B3330" />
        <path d={`M232,410 C${300 + curtain(0)},600 ${250 + curtain(1)},800 ${300 + curtain(2)},990 L215,990 L215,410 Z`} fill="#C9B79C" opacity={0.55} />
        <path d={`M668,410 C${620 + curtain(3)},600 ${660 + curtain(4)},800 ${610 + curtain(5)},990 L690,990 L690,410 Z`} fill="#C9B79C" opacity={0.55} />
        <path d="M250,940 L650,940 L980,1420 L120,1420 Z" fill="#9DB7E8" opacity={0.08} />
        {/* piso */}
        <rect x={-400} y={1400} width={2600} height={900} fill="#121A30" />
        {Array.from({length: 10}).map((_, i) => (
          <line key={i} x1={-400} y1={1440 + i * 60} x2={2200} y2={1440 + i * 60} stroke="#0E1528" strokeWidth={4} />
        ))}
        {/* mesa */}
        <rect x={760} y={1110} width={560} height={30} rx={8} fill={C.wood} />
        <path d="M760,1120 L1320,1120 L1300,1210 L780,1210 Z" fill="#E7D9C4" opacity={0.9} />
        <path d="M780,1210 l20,26 l20,-26 l20,26 l20,-26 l20,26 l20,-26 l20,26 l20,-26 l20,26 l20,-26 l20,26 l20,-26 l20,26 l20,-26 l20,26 l20,-26 l20,26 l20,-26 l20,26 l20,-26 l20,26 l20,-26 l20,26 l20,-26 l20,26 l20,-26" fill="none" stroke="#E7D9C4" strokeWidth={5} opacity={0.8} />
        <rect x={800} y={1140} width={22} height={260} fill={C.woodD} />
        <rect x={1258} y={1140} width={22} height={260} fill={C.woodD} />
        <Termo x={1140} y={1112} s={0.95} />
        <Mate x={1000} y={1084} s={0.95} />
        {/* él, sentado, cabizbajo */}
        <Boy x={640} y={1400} s={1.0} view="side" sit armR={[62, -20]} armL={[50, -10]} headDown={1} />
        {/* la silla vacía */}
        <Chair x={1560} y={1400} s={1.0} />
        <circle cx={1560} cy={1150} r={260} fill="url(#moonGlow)" opacity={0.25} />
        {Array.from({length: 7}).map((_, i) => {
          const p = clamp((t - i * 0.45) / 4.2);
          const x = lerp(420 + i * 30, 1480 + (i % 3) * 50, easeOut(p)) + Math.sin(t * 2 + i) * 18;
          const y = lerp(620 + i * 40, 980 + (i % 4) * 40, p) + Math.cos(t * 1.7 + i) * 22 - Math.sin(p * Math.PI) * 120;
          return ff(i, x, y, 4.5, clamp((t - i * 0.45) / 0.3) * blink(i, t));
        })}
      </g>
      <Vignette />
    </Svg>
  );
};

// 3 · El celular sobre la mesa, visto desde arriba: foto vieja que se ilumina, último mensaje y audio
export const S3Celular: React.FC<SP> = ({t, d}) => {
  const u = ease(t / d);
  const light = easeOut(t / 1.1);
  const play = clamp((t - 1.2) / (d - 1.6));
  const bars = 26;
  return (
    <Svg bg="#2E1E19">
      <g transform={cam(lerp(540, 560, u), lerp(900, 1080, u), lerp(1.02, 1.28, u), lerp(-9, 3, u))}>
        <rect x={-600} y={-600} width={2300} height={3200} fill="url(#woodTop)" />
        {Array.from({length: 16}).map((_, i) => (
          <line key={i} x1={-600 + i * 170} y1={-600} x2={-600 + i * 170} y2={2600} stroke="#2C1C17" strokeWidth={6} />
        ))}
        {Array.from({length: 22}).map((_, i) => (
          <path key={'w' + i} d={`M${-560 + (i % 11) * 170 + 40},${100 + Math.floor(i / 11) * 900 + (i % 5) * 120} q30,60 0,140`} fill="none" stroke="#3E2A22" strokeWidth={4} />
        ))}
        {/* mate visto desde arriba */}
        <g transform="translate(910 1560)">
          <circle r={88} fill="#8A5A3C" />
          <circle r={64} fill="#4E6B32" />
          <line x1={10} y1={0} x2={150} y2={-110} stroke="#CFD3DA" strokeWidth={14} strokeLinecap="round" />
        </g>
        <circle cx={540} cy={900} r={900} fill="url(#screenGlow)" opacity={0.5 * light} />
        {/* teléfono genérico */}
        <g transform="translate(270 340)">
          <rect x={-8} y={-8} width={556} height={1136} rx={74} fill="#0C0C12" />
          <rect x={14} y={14} width={512} height={1092} rx={60} fill="#0E1631" />
          <rect x={200} y={34} width={140} height={30} rx={15} fill="#06060A" />
          {[46, 70, 94].map((x) => (
            <circle key={x} cx={x} cy={50} r={6} fill="#5A6A99" />
          ))}
          {/* foto antigua */}
          <g>
            <rect x={50} y={110} width={440} height={450} rx={28} fill="url(#photoWarm)" />
            <circle cx={380} cy={230} r={46} fill="#FFE7B0" opacity={0.9} />
            <path d="M50,470 C150,430 300,450 490,420 L490,532 Q490,560 462,560 L78,560 Q50,560 50,532 Z" fill="#D88A55" />
            {/* abuela sentada (sin rostro) */}
            <g transform="translate(200 520)">
              <path d="M-90,0 C-90,-120 -60,-200 0,-205 C60,-200 90,-120 90,0 Z" fill={C.shawl} />
              <path d="M-70,-150 C-30,-120 30,-120 70,-150" fill="none" stroke="#94505A" strokeWidth={6} />
              <circle cx={0} cy={-245} r={44} fill={C.skin} />
              <path d="M-46,-238 C-50,-290 -10,-304 14,-296 C40,-290 52,-262 46,-236 C30,-262 -20,-268 -46,-238 Z" fill="#D9D4CF" />
              <circle cx={-34} cy={-290} r={22} fill="#D9D4CF" />
              <g transform="translate(64 -70) scale(0.55)">
                <Mate x={0} y={0} />
              </g>
            </g>
            {/* niño a su lado */}
            <g transform="translate(345 540) scale(0.55)">
              <Boy x={0} y={0} view="front" armL={[10, 0]} armR={[30, 20]} />
            </g>
            <rect x={50} y={110} width={440} height={450} rx={28} fill="#0B1020" opacity={0.65 * (1 - light)} />
          </g>
          {/* último mensaje que nunca se borró */}
          <g opacity={clamp((t - 0.5) / 0.4)}>
            <circle cx={78} cy={650} r={24} fill="#C98B66" />
            <rect x={112} y={608} width={300} height={92} rx={26} fill="#2B3760" />
            <rect x={136} y={632} width={220} height={14} rx={7} fill="#8C9AC6" />
            <rect x={136} y={660} width={150} height={14} rx={7} fill="#8C9AC6" />
            <Heart x={384} y={672} s={0.6} c="#FF7A8A" />
          </g>
          {/* audio guardado */}
          <g opacity={clamp((t - 0.9) / 0.4)}>
            <rect x={112} y={730} width={380} height={110} rx={30} fill="#2B3760" />
            <circle cx={160} cy={785} r={30} fill={C.gold} />
            <path d="M150,768 L176,785 L150,802 Z" fill="#2B3760" />
            {Array.from({length: bars}).map((_, i) => {
              const bx = 210 + i * 10.6;
              const hBase = 12 + 34 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6));
              const playing = play * bars > i;
              const live = playing ? 1 + 0.35 * Math.sin(t * 14 + i) : 1;
              const lift = clamp((t - (1.5 + i * 0.11)) / 1.6);
              const by = 785 - easeIn(lift) * (420 + rnd(i, 2) * 300);
              const bxx = bx + Math.sin(t * 2.4 + i) * 30 * lift;
              const h = lerp(hBase * live, 8, easeOut(lift * 2));
              return (
                <g key={i}>
                  {lift < 0.5 ? (
                    <rect x={bxx - 3} y={by - h / 2} width={6} height={h} rx={3} fill={playing ? C.gold : '#8C9AC6'} opacity={1 - lift * 2} />
                  ) : null}
                  {ff('a' + i, bxx, by, 4 + lift * 2, clamp(lift * 2.4) * blink(i, t))}
                </g>
              );
            })}
            <rect x={200} y={826} width={270 * play} height={4} rx={2} fill={C.gold} opacity={0.7} />
          </g>
          <rect x={150} y={1060} width={240} height={10} rx={5} fill="#3B4878" />
        </g>
      </g>
      <Vignette o={0.9} />
    </Svg>
  );
};

// 4 · Esa noche escribe lo que siente; la luz del celular le ilumina la cara
export const S4Escribe: React.FC<SP> = ({t, d}) => {
  const u = ease(t / d);
  const write = Math.sin(t * 9) * 6;
  const fg = -u * 260;
  const lines = 7;
  return (
    <Svg>
      <g transform={cam(lerp(420, 600, u), lerp(1330, 1250, u), lerp(1.38, 1.12, u), lerp(3, -1, u))}>
        <rect x={-500} y={0} width={2200} height={1500} fill="#131E3A" />
        <rect x={560} y={420} width={420} height={480} fill="url(#nightSky)" />
        <Stars t={t} n={22} x0={570} x1={970} y0={430} y1={880} seed={31} />
        <Moon x={860} y={540} r={38} />
        <rect x={546} y={406} width={448} height={508} fill="none" stroke="#2E2433" strokeWidth={26} />
        <rect x={763} y={420} width={14} height={480} fill="#2E2433" />
        <path d="M560,900 L980,900 L1200,1300 L500,1300 Z" fill="#9DB7E8" opacity={0.06} />
        <rect x={-500} y={1500} width={2200} height={700} fill="#0E1528" />
        {/* escritorio */}
        <rect x={390} y={1230} width={700} height={30} rx={8} fill={C.wood} />
        <rect x={420} y={1260} width={24} height={240} fill={C.woodD} />
        <rect x={1040} y={1260} width={24} height={240} fill={C.woodD} />
        {/* cuaderno */}
        <path d="M520,1230 L690,1214 L690,1232 Z" fill="#E9DFC9" />
        <path d="M690,1214 L860,1230 L690,1232 Z" fill="#F4EBD8" />
        <rect x={520} y={1222} width={340} height={12} rx={4} fill="#EFE5D0" />
        {Array.from({length: lines}).map((_, i) => {
          const p = clamp((t - 0.3 - i * 0.55) / 0.5);
          const x0 = i % 2 ? 700 : 540;
          return p > 0 ? (
            <path key={i} d={`M${x0},${1218 - (i % 4) * 0.5} q10,-4 20,0 t20,0 t20,0 t20,0 t20,0 t20,0`} fill="none" stroke="#4A3A5A" strokeWidth={2.5} strokeDasharray={140} strokeDashoffset={140 * (1 - p)} />
          ) : null;
        })}
        {/* celular apoyado, luz fría que le ilumina la cara */}
        <g transform="translate(940 1228) rotate(-14)">
          <rect x={-34} y={-128} width={68} height={128} rx={12} fill="#0C0C12" />
          <rect x={-28} y={-120} width={56} height={112} rx={8} fill="#BFD4FF" />
          <rect x={-22} y={-110} width={44} height={40} rx={6} fill="url(#photoWarm)" />
        </g>
        <circle cx={900} cy={1130} r={330} fill="url(#screenGlow)" opacity={0.75} />
        <Chair x={380} y={1500} s={0.82} shawl={false} dark />
        <Boy x={420} y={1500} s={1.0} view="side" sit armR={[78 + write * 0.6, -40 + write]} armL={[70, -30]} headDown={0.8} glowFace={0.9} />
        {Array.from({length: 9}).map((_, i) => {
          const st = 0.8 + i * 0.5;
          const p = clamp((t - st) / 2.6);
          const x = lerp(600 + (i % 3) * 70, 640 + i * 40, p) + Math.sin(t * 2 + i) * 20;
          const y = lerp(1214, 640 + (i % 4) * 60, easeOut(p));
          return ff(i, x, y, 4, clamp((t - st) / 0.25) * blink(i, t));
        })}
      </g>
      <g transform={`translate(${fg} 0)`}>
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M${-60 + k * 130},2000 C${-20 + k * 130},${1700 - k * 40} ${80 + k * 130},${1560 - k * 30} ${200 + k * 120},${1520 - k * 50} C${120 + k * 130},${1660} ${60 + k * 130},${1820} ${40 + k * 130},2000 Z`} fill="#060B18" />
        ))}
      </g>
      <Vignette />
    </Svg>
  );
};

// 5 · En el patio levanta el mate hacia el cielo (contrapicado que sube con el gesto)
export const S5Ofrenda: React.FC<SP> = ({t, d}) => {
  const r = ease(seg(t, 0.35, 2.6));
  const u = ease(t / d);
  const sh = lerp(20, 160, r);
  const el = lerp(70, 55, r);
  const breathe = Math.sin(t * 2) * 2;
  return (
    <Svg>
      <g transform={cam(560, lerp(1420, 860, u), lerp(1.45, 0.98, u), lerp(2, -1, u))}>
        <rect x={-700} y={-1200} width={2500} height={3400} fill="url(#nightSky)" />
        <Stars t={t} n={150} y0={-900} y1={1300} seed={41} />
        <Moon x={250} y={120} r={60} />
        {/* pared de la casa con ventana cálida */}
        <rect x={-400} y={720} width={620} height={1200} fill="#0D1734" />
        <rect x={20} y={900} width={140} height={170} rx={6} fill={C.warm} opacity={0.9} />
        <circle cx={90} cy={985} r={200} fill="url(#warmGlow)" opacity={0.5} />
        <line x1={90} y1={900} x2={90} y2={1070} stroke="#0D1734" strokeWidth={8} />
        <rect x={-400} y={700} width={660} height={30} fill="#0A1229" />
        {/* piso de baldosas */}
        <rect x={-700} y={1700} width={2500} height={600} fill="#161E3A" />
        {Array.from({length: 18}).map((_, i) => (
          <line key={i} x1={-700 + i * 160} y1={1700} x2={-1200 + i * 220} y2={2300} stroke="#111832" strokeWidth={5} />
        ))}
        <line x1={-700} y1={1800} x2={1800} y2={1800} stroke="#111832" strokeWidth={5} />
        {/* macetas */}
        <g transform="translate(900 1700)">
          <path d="M-60,0 L-48,-90 L48,-90 L60,0 Z" fill="#7A3F2E" />
          <path d="M0,-90 C-60,-170 -90,-220 -70,-260 M0,-90 C10,-190 40,-240 70,-250 M0,-90 C-10,-170 0,-260 -10,-300" stroke="#1C3A35" strokeWidth={18} fill="none" strokeLinecap="round" />
        </g>
        <Boy x={560} y={1760} s={1.3} view="back" armL={[sh, el]} armR={[sh, el]} lookUp={r} holdAt="mid" hold={r > 0.3 ? <g transform={`translate(0 ${-14 + breathe}) scale(0.85)`} opacity={clamp((r - 0.3) / 0.2)}><Mate x={0} y={0} /></g> : null} />
        {r > 0.85 ? <circle cx={560} cy={1760 - 400 * 1.3} r={140} fill="url(#warmGlow)" opacity={0.5 * clamp((t - 2.6) / 0.8)} /> : null}
        {Array.from({length: 10}).map((_, i) => {
          const st = 2.4 + i * 0.22;
          const x = 560 + (rnd(i, 1) - 0.5) * 1100 + Math.sin(t + i) * 20;
          const y = 300 + rnd(i, 2) * 700 - (t - st) * 20;
          return ff(i, x, y, 3.5, clamp((t - st) / 0.5) * 0.7 * blink(i, t));
        })}
      </g>
      <Vignette />
    </Svg>
  );
};

// 6 · Las luciérnagas se encienden en ola desde él (dolly hacia atrás)
export const S6Encienden: React.FC<SP> = ({t, d}) => {
  const u = easeOut(t / (d + 0.4));
  const N = 150;
  const bx = 540, by = 1380;
  return (
    <Svg>
      <g transform={cam(540, lerp(1420, 1250, u), lerp(1.75, 1.0, u))}>
        <rect x={-700} y={-600} width={2500} height={3200} fill="url(#nightSky)" />
        <Stars t={t} n={120} y0={-500} y1={1100} seed={51} />
        <Hills y={1150} />
        <Tree x={-40} y={1260} s={1.1} />
        <Tree x={1150} y={1240} s={0.9} />
        <rect x={-700} y={1250} width={2500} height={1400} fill={C.grass} />
        <Grass t={t} n={90} x0={-500} x1={1580} y={1300} h={60} color={C.grass2} />
        <Boy x={bx} y={by} s={0.62} view="back" armL={[12, 20]} armR={[12, 20]} lookUp={0.6} />
        {Array.from({length: N}).map((_, i) => {
          const x = -300 + rnd(i, 61) * 1680;
          const y0 = 700 + rnd(i, 62) * 1200;
          const dist = Math.hypot(x - bx, y0 - by);
          const ign = 0.1 + dist / 950;
          const p = t - ign;
          const fl = p > 0 && p < 0.3 ? 1 + 1.2 * (1 - p / 0.3) : 1;
          const y = y0 - Math.max(0, p) * (18 + rnd(i, 63) * 30) + Math.sin(t * 1.4 + i) * 14;
          const xx = x + Math.sin(t * 0.9 + i * 2) * 22;
          return ff(i, xx, y, 3.6 + rnd(i, 64) * 3, clamp(p / 0.12) * fl * blink(i, t));
        })}
        <Grass t={t} n={50} x0={-600} x1={1680} y={1900} h={170} color="#06131A" seed={13} />
      </g>
      <Vignette />
    </Svg>
  );
};

// 7 · Se juntan y dibujan el rostro (perfil) de la abuela; él siente que vuelve a nacer
export const S7Rostro: React.FC<SP> = ({t, d}) => {
  const u = ease(t / d);
  const N = 120;
  const pts = profilePoints(N);
  const K = 1.45, ox = 540 - 205 * K, oy = 330;
  const glow = ease(seg(t, 2.6, 3.8));
  return (
    <Svg>
      <g transform={cam(540, lerp(1010, 960, u), lerp(1.0, 1.07, u))}>
        <rect x={-500} y={-500} width={2100} height={2900} fill="url(#nightSky)" />
        <Stars t={t} n={110} y0={-300} y1={1500} seed={71} o={1 - glow * 0.4} />
        <circle cx={540} cy={680} r={720} fill="url(#warmGlow)" opacity={0.75 * glow} />
        <Hills y={1640} />
        <rect x={-500} y={1700} width={2100} height={700} fill={C.grass} />
        <circle cx={540} cy={1600} r={260} fill="url(#warmGlow)" opacity={0.55 * glow} />
        <Boy x={540} y={1790} s={0.6} view="back" armL={[lerp(14, 48, glow), 10]} armR={[lerp(14, 48, glow), 10]} lookUp={1} />
        {pts.map(([px, py], i) => {
          const st = rnd(i, 72) * 0.9;
          const p = ease(clamp((t - st) / 1.9));
          const sx = -200 + rnd(i, 73) * 1480;
          const sy = 1250 + rnd(i, 74) * 700;
          const tx = ox + px * K + Math.sin(t * 2 + i) * 3;
          const ty = oy + py * K + Math.cos(t * 1.7 + i) * 3;
          const x = lerp(sx, tx, p) + Math.sin(p * Math.PI) * (rnd(i, 75) - 0.5) * 300;
          const y = lerp(sy, ty, p);
          return ff(i, x, y, 4.2 + glow * 1.2, (0.75 + 0.25 * blink(i, t)) * (1 + glow * 0.3));
        })}
      </g>
      <Vignette />
    </Svg>
  );
};

// 8 · Se iba pero se quedaba: una cinta de luces (como una melodía) lo acompaña de vuelta a casa
export const S8Camino: React.FC<SP> = ({t, d}) => {
  const u = t / d;
  const bx = 300 + u * 1350;
  const ccx = bx + 120;
  const step = t * 6.2;
  const legA = Math.sin(step) * 24;
  const armA = Math.sin(step) * 20;
  const bob = Math.abs(Math.cos(step)) * -6;
  return (
    <Svg>
      <rect x={0} y={0} width={1080} height={1920} fill="url(#nightSky)" />
      <g transform={`translate(${-ccx * 0.15} 0)`}>
        <Stars t={t} n={120} x0={0} x1={1600} y0={0} y1={1250} seed={81} />
        <Moon x={900} y={360} r={50} />
      </g>
      <g transform={`translate(${-ccx * 0.45} 0)`}>
        <Hills y={1300} x0={-400} x1={2600} />
      </g>
      <g transform={cam(ccx, 1080, 1.0)}>
        <House x={1950} y={1500} s={1.05} lit={1} />
        <Tree x={900} y={1500} s={0.8} color="#0A1630" />
        <rect x={-600} y={1500} width={3600} height={800} fill={C.grass} />
        <path d="M-600,1560 C200,1530 1000,1580 2400,1540 L2400,1600 C1000,1640 200,1590 -600,1620 Z" fill="#1D2B45" />
        <Grass t={t} n={110} x0={-600} x1={2600} y={1520} h={55} color={C.grass2} />
        <Boy x={bx} y={1590 + bob} s={1.0} view="side" legL={legA} legR={-legA} armL={[-armA, 20]} armR={[armA, 20]} lookUp={0.3} />
        {Array.from({length: 64}).map((_, i) => {
          const p = i / 64;
          const x = bx - 40 - p * 1100;
          const y = 1250 - p * 820 + Math.sin(p * 10 - t * 3.2) * 70;
          return ff(i, x + Math.sin(t * 2 + i) * 6, y, 4.6 - p * 1.4, (1 - p * 0.45) * blink(i, t));
        })}
      </g>
      <g transform={`translate(${-ccx * 1.5 + 600} 0)`}>
        {[0, 1, 2, 3].map((k) => (
          <g key={k} transform={`translate(${k * 900} 0)`}>
            <path d="M0,1920 C40,1700 120,1640 200,1620 C160,1700 150,1800 170,1920 Z" fill="#050B17" />
            <path d="M260,1920 C270,1760 330,1700 420,1690 C360,1760 340,1840 350,1920 Z" fill="#050B17" />
          </g>
        ))}
      </g>
      <Vignette />
    </Svg>
  );
};

// Pantalla genérica de un "en vivo" de un cielo de luciérnagas (sin textos ni logos)
const LiveScreen: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect x={0} y={0} width={540} height={960} rx={44} fill="url(#liveSky)" />
    <Stars t={t} n={40} x0={10} x1={530} y0={20} y1={700} seed={91} />
    <path d="M0,780 C120,740 260,770 540,730 L540,916 Q540,960 496,960 L44,960 Q0,960 0,916 Z" fill="#0B2027" />
    {Array.from({length: 34}).map((_, i) => ff(i, 30 + rnd(i, 92) * 480, 300 + rnd(i, 93) * 520 - ((t * 14 + i * 9) % 60), 3.2, blink(i, t)))}
    {/* indicador en vivo: círculo rojo, sin texto */}
    <rect x={26} y={34} width={104} height={40} rx={12} fill="#E5304F" />
    <circle cx={50} cy={54} r={8} fill="#fff" opacity={0.6 + 0.4 * Math.sin(t * 6)} />
    <rect x={66} y={48} width={48} height={12} rx={6} fill="#FFD3DA" />
    <rect x={140} y={34} width={84} height={40} rx={12} fill="#000" opacity={0.35} />
    <circle cx={162} cy={54} r={7} fill="none" stroke="#fff" strokeWidth={3} />
    <rect x={178} y={48} width={32} height={12} rx={6} fill="#fff" opacity={0.8} />
    {/* corazones flotando */}
    {Array.from({length: 10}).map((_, i) => {
      const p = ((t * 0.5 + i * 0.13) % 1);
      return <Heart key={i} x={470 + Math.sin(p * 9 + i) * 26} y={880 - p * 520} s={0.7 + rnd(i, 94) * 0.6} c={i % 3 ? '#FF4D6D' : '#FF9FB0'} o={1 - p} />;
    })}
    {/* comentarios: burbujas sin texto */}
    {[0, 1, 2].map((k) => {
      const y = 700 + k * 66 - ((t * 30) % 66);
      return (
        <g key={k} opacity={0.9}>
          <circle cx={46} cy={y} r={18} fill={['#F4B942', '#8FD0C0', '#D98A90'][k]} />
          <rect x={74} y={y - 22} width={[230, 170, 200][k]} height={44} rx={18} fill="#000" opacity={0.35} />
          <rect x={90} y={y - 6} width={[180, 120, 150][k]} height={12} rx={6} fill="#fff" opacity={0.75} />
        </g>
      );
    })}
    <rect x={26} y={896} width={380} height={44} rx={22} fill="none" stroke="#fff" strokeOpacity={0.4} strokeWidth={3} />
    <Heart x={470} y={922} s={0.8} c="#fff" o={0.8} />
  </g>
);

// 9 · La vida sigue: de la pantalla del live al porche al atardecer, junto a la silla vacía
export const S9Atardecer: React.FC<SP> = ({t, d}) => {
  const z = ease(seg(t, 1.1, 3.6));
  const PH = {x: 430, y: 1330, w: 54, h: 96};
  const sStart = 1920 / PH.h * 0.98;
  const s = Math.exp(lerp(Math.log(sStart), Math.log(1.0), z));
  // el celular queda fijo en pantalla mientras la cámara se aleja
  const psx = lerp(540, 540 + (PH.x - 560), z);
  const psy = lerp(960, 960 + (PH.y - 1150), z);
  const cx = PH.x - (psx - 540) / s;
  const cy = PH.y - (psy - 960) / s;
  const sun = lerp(1130, 1190, t / d);
  return (
    <Svg>
      <g transform={cam(cx, cy, s)}>
        <rect x={-600} y={-300} width={2300} height={1600} fill="url(#sunsetSky)" />
        <circle cx={790} cy={sun} r={120} fill="#FFD48A" />
        <circle cx={790} cy={sun} r={380} fill="url(#warmGlow)" opacity={0.8} />
        <Hills y={1170} c1="#4A2F55" c2="#33223F" />
        {/* porche */}
        <rect x={-600} y={1480} width={2300} height={700} fill="#3C2620" />
        {Array.from({length: 12}).map((_, i) => (
          <line key={i} x1={-600} y1={1500 + i * 40} x2={1700} y2={1500 + i * 40} stroke="#30201B" strokeWidth={4} />
        ))}
        <rect x={60} y={780} width={36} height={720} fill="#2A1A16" />
        <rect x={1000} y={780} width={36} height={720} fill="#2A1A16" />
        <rect x={-100} y={760} width={1300} height={40} fill="#2A1A16" />
        <rect x={-100} y={1330} width={1300} height={18} fill="#2A1A16" opacity={0.9} />
        {Array.from({length: 14}).map((_, i) => (
          <rect key={i} x={-80 + i * 92} y={1340} width={12} height={140} fill="#2A1A16" opacity={0.9} />
        ))}
        {/* banco y él con el celular */}
        <rect x={300} y={1390} width={260} height={22} rx={6} fill={C.wood} />
        <rect x={316} y={1410} width={16} height={70} fill={C.woodD} />
        <rect x={528} y={1410} width={16} height={70} fill={C.woodD} />
        <Boy x={430} y={1480} s={0.95} view="front" sit armL={[-10, -150]} armR={[-10, -150]} headDown={1} glowFace={0.8 * (1 - z * 0.4)} />
        <g transform={`translate(${PH.x - PH.w / 2} ${PH.y - PH.h / 2})`}>
          <rect x={-3} y={-3} width={PH.w + 6} height={PH.h + 6} rx={9} fill="#0C0C12" />
          <g transform={`scale(${PH.w / 540} ${PH.h / 960})`}>
            <LiveScreen t={t} />
          </g>
        </g>
        <Chair x={790} y={1480} s={0.78} dark />
        {Array.from({length: 18}).map((_, i) => {
          const st = 2.6 + i * 0.12;
          const a = (i / 18) * Math.PI * 2 + t * 0.5;
          const rr = 120 + rnd(i, 95) * 120;
          return ff(i, 790 + Math.cos(a) * rr, 1230 + Math.sin(a) * rr * 0.7 - (t - st) * 10, 3.6, clamp((t - st) / 0.4) * blink(i, t));
        })}
      </g>
      <Vignette o={z} />
    </Svg>
  );
};

// 10 · Cierre en paz: la noche se llena de luciérnagas
export const S10Cierre: React.FC<SP> = ({t, d}) => {
  const u = ease(t / d);
  const pts = profilePoints(70);
  return (
    <Svg>
      <g transform={cam(540, lerp(1000, 900, u), lerp(1.04, 1.0, u))}>
        <rect x={-500} y={-500} width={2100} height={2000} fill="url(#duskSky)" />
        <Stars t={t} n={120} y0={-400} y1={900} seed={101} />
        <g opacity={0.35}>
          {pts.map(([px, py], i) => (
            <circle key={i} cx={560 + px * 0.9} cy={300 + py * 0.9} r={2.4} fill="#F6FFB0" opacity={blink(i, t)} />
          ))}
        </g>
        <Hills y={1300} c1="#1E2350" c2="#141A3C" />
        <House x={250} y={1420} s={0.8} lit={1} color="#111938" />
        <Tree x={960} y={1440} s={0.85} color="#0C1330" />
        <rect x={-500} y={1420} width={2100} height={1000} fill={C.grass} />
        <Grass t={t} n={80} x0={-400} x1={1500} y={1440} h={50} color={C.grass2} />
        <Boy x={640} y={1440} s={0.75} view="side" sit armL={[30, -20]} armR={[30, -20]} lookUp={1} />
        {Array.from({length: 70}).map((_, i) => {
          const x = -200 + rnd(i, 102) * 1480 + Math.sin(t * 0.8 + i) * 30;
          const y = 1500 - ((rnd(i, 103) * 1100 + t * (25 + rnd(i, 104) * 35)) % 1200);
          return ff(i, x, y, 3.5 + rnd(i, 105) * 2.5, blink(i, t));
        })}
      </g>
      <Vignette />
    </Svg>
  );
};

export const SCENES = [S1Hook, S2Casa, S3Celular, S4Escribe, S5Ofrenda, S6Encienden, S7Rostro, S8Camino, S9Atardecer, S10Cierre];
