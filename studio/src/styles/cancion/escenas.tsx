import React from 'react';
import {AMBER, Bokeh, C, CREAM, Car, Crate, Door, House, Lamp, Mattress, NightWindow, Notes, Person, Phone, Profile, Radio, Skyline, StreetLamp, clamp01, ease, lerp, rnd} from './kit';

// Escenas de «Cuando No Era Cantante (Remix)». Cada escena recibe el tiempo local t
// (s desde que aparece) y su duración d. El área ilustrada va de y≈330 a y≈1130;
// debajo sigue el suelo, donde van los subtítulos.

export type SP = {t: number; d: number};

const FLOOR = 1080;

const Wall: React.FC<{top?: string; bottom?: string; floor?: string; floorY?: number}> = ({top = '#5a3622', bottom = '#43281a', floor = '#3a2418', floorY = FLOOR}) => (
  <g>
    <defs>
      <linearGradient id={`w-${top}-${bottom}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
      <linearGradient id={`f-${floor}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={floor} />
        <stop offset="1" stopColor="#1f130c" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1080} height={floorY} fill={`url(#w-${top}-${bottom})`} />
    <rect x={0} y={floorY} width={1080} height={1920 - floorY} fill={`url(#f-${floor})`} />
    <rect x={0} y={floorY - 4} width={1080} height={10} fill="#000" opacity={0.18} />
  </g>
);

// el cuarto de antes: pared cálida, ventana de noche, lámpara, colchón y la radio
const OldRoom: React.FC<{t: number; lamp?: number; radio?: number; mattress?: boolean}> = ({t, lamp = 1, radio = 1, mattress = true}) => (
  <g>
    <Wall />
    <NightWindow x={640} y={400} w={330} h={420} t={t} lights={0.45} />
    <Lamp x={170} y={FLOOR} t={t} on={lamp} h={330} />
    {/* póster y cuaderno de canciones en la pared */}
    <rect x={330} y={430} width={170} height={220} fill="#7a4a30" opacity={0.6} />
    <circle cx={415} cy={520} r={46} fill="#2e1c13" opacity={0.6} />
    <circle cx={415} cy={520} r={12} fill={AMBER} opacity={0.5} />
    {mattress && <Mattress x={260} y={FLOOR} w={430} />}
    <Crate x={840} y={FLOOR} />
    <Radio x={840} y={FLOOR - 110} s={0.8} t={t} on={radio} />
  </g>
);

// 1. el estadio grita su nombre y él solo piensa en ella
export const Stage: React.FC<SP> = ({t}) => {
  const dim = ease((t - 1.9) / 0.9);
  return (
    <g>
      <Wall top="#2a1a2e" bottom="#3a1f1c" floor="#2a1712" floorY={1010} />
      {/* luces del escenario que barren */}
      {[0, 1, 2, 3, 4].map((i) => {
        const sw = Math.sin(t * 0.9 + i * 1.4) * 140;
        return <path key={i} d={`M${140 + i * 200} 330 L${40 + i * 200 + sw} 1010 L${260 + i * 200 + sw} 1010 Z`} fill="url(#spot)" opacity={(0.35 - 0.2 * dim) * (i % 2 ? 0.8 : 1)} />;
      })}
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={140 + i * 200} cy={334} r={16} fill="#fff1cf" opacity={0.9 - 0.5 * dim} />
      ))}
      {/* tarima */}
      <rect x={120} y={960} width={840} height={50} fill="#1d1216" />
      <rect x={120} y={960} width={840} height={8} fill={AMBER} opacity={0.35} />
      <Person x={540} y={965} s={0.86} who="him" t={t} fame pose={{armR: lerp(-150, -20, dim), elbowR: lerp(-10, 0, dim), armL: 10, headTilt: lerp(-6, 14, dim)}} />
      {/* ella aparece como un recuerdo de luz junto a él */}
      <g opacity={dim * 0.9}>
        <circle cx={760} cy={720} r={230} fill="url(#glow)" />
        <Person x={760} y={960} s={0.74} who="her" t={t} shadow={false} opacity={0.55} pose={{armL: 10, armR: -10}} />
      </g>
      {/* público en primer plano, desenfocado */}
      <g filter="url(#dof)">
        {Array.from({length: 13}).map((_, i) => {
          const jump = Math.abs(Math.sin(t * 4 + i * 1.7)) * 18 * (1 - dim);
          const x = -20 + i * 92;
          return (
            <g key={i} transform={`translate(${x} ${1100 - jump})`}>
              <ellipse cx={0} cy={-120} rx={40} ry={46} fill="#120b0c" />
              <rect x={-58} y={-80} width={116} height={200} rx={50} fill="#120b0c" />
              {i % 2 === 0 && <rect x={i % 4 === 0 ? 30 : -50} y={-260} width={22} height={170} rx={11} fill="#120b0c" transform={`rotate(${i % 4 === 0 ? 12 : -12})`} />}
            </g>
          );
        })}
      </g>
      {/* destellos de teléfonos del público */}
      {Array.from({length: 10}).map((_, i) => (
        <circle key={i} cx={60 + rnd(i) * 960} cy={990 + rnd(i + 3) * 60} r={5} fill="#fff6dc" opacity={(1 - dim) * (0.4 + 0.5 * Math.sin(t * 3 + i))} />
      ))}
    </g>
  );
};

// 2. antes de la fama: un cuarto y una radio vieja
export const Room: React.FC<SP> = ({t}) => (
  <g>
    <OldRoom t={t} />
    <Person x={380} y={FLOOR - 40} s={0.8} who="him" t={t} pose={{sit: true, armL: 30, armR: -40, elbowR: -50, headTilt: 6}} />
    <Person x={560} y={FLOOR - 40} s={0.76} who="her" t={t} flip pose={{sit: true, armL: 10, armR: -30, elbowR: -60, headTilt: -8}} />
    <Notes t={t} x={830} y={880} n={5} spread={150} />
  </g>
);

// 3. bailaban despacio canciones antiguas
export const Dance: React.FC<SP> = ({t}) => {
  const sway = Math.sin(t * 1.6) * 5;
  return (
    <g>
      <g transform="translate(-140 -170) scale(1.18)">
        <OldRoom t={t} mattress={false} />
      </g>
      <g transform={`rotate(${sway} 540 ${FLOOR})`}>
        <Person x={470} y={FLOOR} s={0.92} who="him" t={t} pose={{armR: -70, elbowR: -40, armL: 15, headTilt: 10}} />
        <Person x={600} y={FLOOR} s={0.86} who="her" t={t} flip pose={{armR: -150, elbowR: -20, armL: 25, elbowL: 10, headTilt: 12}} />
      </g>
      <Notes t={t} x={900} y={820} n={6} spread={220} rise={380} />
      <Bokeh t={t} n={10} y0={380} y1={900} seed={2} />
    </g>
  );
};

// 4. no había lujos, y aun así ella lo quería
export const Street: React.FC<SP> = ({t}) => {
  const lean = ease((t - 1.4) / 0.8);
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1080} fill="url(#dusk)" />
      <Skyline y={700} t={t} color="#2a2036" seed={4} lit={0.2} h={0.6} />
      <House x={-10} y={930} w={260} h={300} color="#8a4f3e" door="#3f5f6a" t={t} lit={1} />
      <House x={260} y={930} w={230} h={260} color="#5f6a52" door="#7a3b2a" t={t} />
      <House x={500} y={930} w={280} h={320} color="#7a5a8a" door="#3a2a20" t={t} lit={0.8} />
      <House x={790} y={930} w={300} h={280} color="#9a6a3a" door="#2f4a5a" t={t} />
      <rect x={0} y={930} width={1080} height={40} fill="#4a3a3a" />
      <rect x={0} y={970} width={1080} height={950} fill="#2a1d1c" />
      <StreetLamp x={860} y={1000} t={t} h={560} />
      {/* banqueta */}
      <rect x={0} y={1000} width={1080} height={22} fill="#5a4844" />
      {/* él muestra los bolsillos vacíos y ella se ríe y se apoya en él */}
      <g>
        <Person x={430} y={1050} s={0.82} who="him" t={t} pose={{sit: true, armL: 40, armR: -30, elbowR: -10}} />
        <path d="M372 935 q-14 18 2 30 q14 -6 8 -30 z" fill={CREAM} opacity={1 - lean * 0.6} />
        <path d="M486 935 q14 18 -2 30 q-14 -6 -8 -30 z" fill={CREAM} opacity={1 - lean * 0.6} />
        <g transform={`rotate(${-lean * 10} 600 1050)`}>
          <Person x={600} y={1050} s={0.78} who="her" t={t} flip pose={{sit: true, armR: -40 - lean * 30, elbowR: -40, armL: 10, headTilt: -lean * 10}} />
        </g>
      </g>
      {/* un refresco con dos popotes */}
      <g transform="translate(720 1046)">
        <rect x={-16} y={-70} width={32} height={70} rx={8} fill="#a8c6b0" opacity={0.85} />
        <line x1={-4} y1={-70} x2={-18} y2={-118} stroke={CREAM} strokeWidth={5} />
        <line x1={6} y1={-70} x2={20} y2={-118} stroke="#e0603f" strokeWidth={5} />
      </g>
      {/* corazones pequeños cuando ella se ríe */}
      {[0, 1, 2].map((i) => {
        const p = clamp01((t - 1.6 - i * 0.35) / 1.4);
        return (
          <path key={i} d="M0 8 C -14 -6 -8 -20 0 -10 C 8 -20 14 -6 0 8 Z" fill="#e8785a" transform={`translate(${520 + i * 34} ${720 - p * 140}) scale(${1.6 + i * 0.3})`} opacity={Math.sin(p * Math.PI) * 0.9} />
        );
      })}
    </g>
  );
};

// 5. ella era la primera en escuchar sus canciones
export const Notebook: React.FC<SP> = ({t}) => {
  const lines = Math.floor(clamp01(t / 2.6) * 6);
  return (
    <g>
      <g transform="translate(-240 -300) scale(1.3)">
        <OldRoom t={t} />
      </g>
      <Person x={430} y={1100} s={1.0} who="him" t={t} pose={{sit: true, armL: 50, elbowL: -40, armR: -40, elbowR: -70, headTilt: 14}} />
      {/* cuaderno en las piernas y lápiz */}
      <g transform="translate(520 860) rotate(-6)">
        <rect x={-80} y={-50} width={160} height={110} rx={6} fill={CREAM} />
        <line x1={0} y1={-50} x2={0} y2={60} stroke="#c9b28a" strokeWidth={3} />
        {Array.from({length: 6}).map((_, i) => (
          <rect key={i} x={i < 3 ? -68 : 10} y={-34 + (i % 3) * 28} width={i < lines ? 56 : 0} height={6} rx={3} fill="#8a6a4a" />
        ))}
        <g transform={`translate(${-40 + ((t * 60) % 110)} ${-20 + Math.sin(t * 9) * 4}) rotate(-35)`}>
          <rect x={-5} y={-50} width={10} height={50} fill={AMBER} />
          <path d="M-5 0 L5 0 L0 12 Z" fill="#3a2a20" />
        </g>
      </g>
      <Person x={720} y={1100} s={0.94} who="her" t={t} flip pose={{sit: true, armR: -60, elbowR: -100, armL: 15, headTilt: -14 + Math.sin(t * 2) * 3}} />
      <Notes t={t} x={560} y={800} n={5} spread={200} rise={360} />
      <path d="M0 10 C -18 -8 -10 -26 0 -13 C 10 -26 18 -8 0 10 Z" fill="#e8785a" transform={`translate(720 ${560 - Math.sin(t) * 10}) scale(${1.5 + 0.2 * Math.sin(t * 4)})`} opacity={ease((t - 1.2) / 0.6)} />
    </g>
  );
};

// 6. una de sus canciones empezó a sonar en todas partes
export const Viral: React.FC<SP> = ({t}) => {
  const wave = t * 380;
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1080} fill="#1c1a33" />
      {Array.from({length: 30}).map((_, i) => (
        <circle key={i} cx={rnd(i) * 1080} cy={340 + rnd(i + 9) * 300} r={1.5 + rnd(i + 2) * 2} fill="#e8eeff" opacity={0.4} />
      ))}
      {/* ondas de sonido que salen de su cuarto y recorren la ciudad */}
      {[0, 1, 2, 3].map((i) => {
        const r = ((t * 260 + i * 220) % 900);
        return <circle key={i} cx={540} cy={1000} r={r} fill="none" stroke={AMBER} strokeWidth={4} opacity={0.35 * (1 - r / 900)} />;
      })}
      {/* edificios: las ventanas se encienden en ola desde el centro */}
      {Array.from({length: 9}).map((_, i) => {
        const bx = i * 125 - 20;
        const bw = 108;
        const bh = 260 + rnd(i + 3) * 300;
        return (
          <g key={i}>
            <rect x={bx} y={1060 - bh} width={bw} height={bh} fill="#141225" />
            {Array.from({length: 15}).map((__, j) => {
              const wx = bx + 14 + (j % 3) * 32;
              const wy = 1060 - bh + 26 + Math.floor(j / 3) * 52;
              if (wy > 1040) return null;
              const dist = Math.hypot(wx - 540, wy - 1000);
              const on = wave > dist ? 1 : 0;
              return <rect key={j} x={wx} y={wy} width={14} height={20} fill={AMBER} opacity={0.15 + on * (0.6 + 0.2 * Math.sin(t * 6 + j))} />;
            })}
          </g>
        );
      })}
      <rect x={0} y={1060} width={1080} height={860} fill="#17121c" />
      {/* notas que salen de las ventanas encendidas */}
      {[180, 420, 660, 900].map((x, i) => (
        <g key={i} opacity={ease((t - 0.4 - i * 0.2) / 0.5)}>
          <Notes t={t + i} x={x} y={760} n={3} spread={80} rise={300} color={CREAM} />
        </g>
      ))}
      {/* el celular: avisos que no paran de llegar */}
      <g transform={`translate(300 ${980 - ease(t / 0.6) * 40})`}>
        <circle cx={0} cy={-40} r={200} fill="url(#glowWhite)" opacity={0.35} />
        <Phone x={0} y={-40} s={1.25}>
          <circle cx={0} cy={-40} r={30} fill={AMBER} />
          <path d="M-8 -54 L14 -40 L-8 -26 Z" fill={CREAM} />
          {Array.from({length: 12}).map((_, i) => (
            <rect key={i} x={-44 + i * 8} y={20 - (6 + Math.abs(Math.sin(t * 7 + i)) * 22) / 2} width={5} height={6 + Math.abs(Math.sin(t * 7 + i)) * 22} rx={2} fill="#c9a06a" />
          ))}
        </Phone>
        {Array.from({length: 5}).map((_, i) => {
          const p = ease((t - 0.5 - i * 0.35) / 0.35);
          return (
            <g key={i} transform={`translate(${110 + (i % 2) * 40} ${-200 + i * 62}) scale(${p})`} opacity={p}>
              <rect x={0} y={-24} width={230} height={48} rx={18} fill={CREAM} />
              <circle cx={24} cy={0} r={12} fill={i % 2 ? '#e0603f' : AMBER} />
              <rect x={48} y={-8} width={150 - (i % 3) * 30} height={8} rx={4} fill="#c9b28a" />
              <rect x={48} y={6} width={90} height={6} rx={3} fill="#e3d3b4" />
            </g>
          );
        })}
      </g>
    </g>
  );
};

// 7. llegaron las giras, el dinero y las cadenas
export const Fame: React.FC<SP> = ({t}) => {
  const carIn = ease(t / 0.9);
  return (
    <g>
      <Wall top="#2c1a26" bottom="#3a2018" floor="#24150f" floorY={1030} />
      <Skyline y={1030} t={t} color="#24182a" seed={7} lit={0.4} h={0.8} />
      {/* flashes de cámaras */}
      {Array.from({length: 9}).map((_, i) => {
        const ph = (t * 1.7 + rnd(i) * 3) % 1.4;
        const o = ph < 0.12 ? 1 - ph / 0.12 : 0;
        return <circle key={i} cx={60 + rnd(i + 2) * 960} cy={560 + rnd(i + 5) * 420} r={60} fill="url(#glowWhite)" opacity={o} />;
      })}
      <Car x={lerp(1400, 700, carIn)} y={1040} s={0.95} t={t} />
      <Person x={330} y={1040} s={0.98} who="him" t={t} fame pose={{armL: 18, armR: -16, elbowR: -30, headTilt: -4}} />
      {/* brillo de la cadena */}
      <path d={`M ${330 + 4} ${1040 - 290} l 6 -16 l 6 16 l 16 6 l -16 6 l -6 16 l -6 -16 l -16 -6 Z`} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 6)} />
      {/* billetes que caen */}
      {Array.from({length: 16}).map((_, i) => {
        const y = 330 + ((t * (120 + rnd(i) * 80) + rnd(i + 1) * 700) % 720);
        const x = rnd(i + 4) * 1080 + Math.sin(t * 2 + i) * 30;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(t * 2 + i) * 40})`} opacity={0.85 * ease((t - 0.6) / 0.5)}>
            <rect x={-30} y={-15} width={60} height={30} rx={3} fill="#7fae7a" />
            <circle cx={0} cy={0} r={8} fill="#5a8a58" />
          </g>
        );
      })}
      {/* pase de gira */}
      <g transform={`translate(840 ${470 + Math.sin(t * 1.5) * 10}) rotate(8)`} opacity={ease((t - 1.2) / 0.5)}>
        <line x1={0} y1={-120} x2={0} y2={-40} stroke={AMBER} strokeWidth={5} />
        <rect x={-70} y={-40} width={140} height={190} rx={12} fill={CREAM} />
        <rect x={-70} y={-40} width={140} height={46} rx={12} fill="#e0603f" />
        <rect x={-46} y={30} width={92} height={10} rx={5} fill="#c9b28a" />
        <rect x={-46} y={56} width={60} height={10} rx={5} fill="#c9b28a" />
        <rect x={-46} y={90} width={92} height={36} rx={4} fill="#2a2024" />
      </g>
    </g>
  );
};

// 8. ella lo llamaba, pero él siempre estaba lejos
export const Calls: React.FC<SP> = ({t}) => (
  <g>
    {/* izquierda: el cuarto de siempre */}
    <defs>
      <clipPath id="leftHalf">
        <path d="M0 0 L600 0 L480 1080 L0 1080 Z" />
      </clipPath>
      <clipPath id="rightHalf">
        <path d="M600 0 L1080 0 L1080 1080 L480 1080 Z" />
      </clipPath>
    </defs>
    <rect x={0} y={1080} width={1080} height={840} fill="#22150f" />
    <g clipPath="url(#leftHalf)">
      <g transform="translate(-90 -60) scale(1.06)">
        <OldRoom t={t} mattress />
      </g>
      <Person x={250} y={1060} s={0.9} who="her" t={t} phone pose={{sit: true, armR: 25, elbowR: 125, armL: 12, headTilt: 12}} />
      {[0, 1].map((i) => {
        const p = (t * 1.2 + i * 0.5) % 1;
        return <path key={i} d={`M${330 + p * 26} ${745 - p * 16} q12 16 0 32`} stroke="#bfe3ff" strokeWidth={4} fill="none" opacity={1 - p} />;
      })}
    </g>
    {/* derecha: un hotel en otra ciudad, el teléfono vibra boca abajo */}
    <g clipPath="url(#rightHalf)">
      <rect x={480} y={0} width={600} height={1080} fill="#1d1c33" />
      <Skyline y={860} t={t} color="#2a2850" win="#9fd0ff" seed={9} lit={0.4} h={0.7} />
      <rect x={480} y={860} width={600} height={220} fill="#2b2338" />
      <rect x={480} y={700} width={600} height={14} fill="#120f1c" />
      <Person x={860} y={1060} s={0.86} who="him" t={t} fame pose={{back: true, armL: 10, armR: -10}} />
      <g transform={`translate(${640 + Math.sin(t * 40) * 3} 1000)`}>
        <rect x={-70} y={-20} width={140} height={20} fill="#3a2f45" />
        <rect x={-30} y={-34} width={60} height={14} rx={4} fill="#151116" />
        {[0, 1].map((i) => {
          const p = (t * 1.2 + i * 0.5) % 1;
          return <path key={i} d={`M${-40 - p * 30} ${-40 - p * 20} q-10 -14 0 -28 M${40 + p * 30} ${-40 - p * 20} q10 -14 0 -28`} stroke="#9fd0ff" strokeWidth={4} fill="none" opacity={1 - p} />;
        })}
      </g>
    </g>
    <path d="M600 0 L480 1080" stroke="#1a100b" strokeWidth={14} />
    {/* las llamadas viajan y se apagan antes de llegar */}
    {[0, 1, 2].map((i) => {
      const p = ((t * 0.55 + i / 3) % 1);
      const x = lerp(300, 820, p);
      const y = lerp(700, 640, p) - Math.sin(p * Math.PI) * 120;
      return (
        <g key={i} transform={`translate(${x} ${y})`} opacity={Math.sin(p * Math.PI) * (1 - p * 0.6)}>
          <circle r={34} fill={CREAM} />
          <path d="M-12 -14 q-4 18 14 28 l8 -8 l-8 -8 l-5 4 q-6 -4 -8 -12 l5 -4 l-6 -10 z" fill="#3c8a5a" />
        </g>
      );
    })}
  </g>
);

// 9. una noche ella apagó la radio y se fue sin hacer ruido
export const Leave: React.FC<SP> = ({t}) => {
  const radio = 1 - ease((t - 0.4) / 0.6);
  const walk = ease((t - 0.9) / 1.6);
  const door = t < 1.6 ? ease((t - 1.0) / 0.5) : 1 - ease((t - 2.6) / 0.5);
  const gone = ease((t - 2.4) / 0.4);
  const step = Math.sin(t * 7) * 14 * (walk > 0 && walk < 1 ? 1 : 0);
  return (
    <g>
      <Wall top="#3a2618" bottom="#2c1c13" />
      <NightWindow x={90} y={420} w={300} h={380} t={t} lights={0.3} />
      <Mattress x={60} y={FLOOR} w={400} />
      <rect x={110} y={FLOOR - 74} width={90} height={14} rx={3} fill={CREAM} opacity={0.8} />
      <Crate x={540} y={FLOOR} w={140} />
      <Radio x={540} y={FLOOR - 110} s={0.74} t={t} on={radio} />
      <Door x={780} y={FLOOR} open={door} />
      <g opacity={1 - gone}>
        <Person x={lerp(600, 860, walk)} y={FLOOR} s={0.86} who="her" t={t} pose={{back: walk > 0.05, armR: walk < 0.05 ? -70 : -8, elbowR: walk < 0.05 ? -40 : 0, armL: 8, legL: step, legR: -step}} />
      </g>
    </g>
  );
};

// 10. ahora lo tiene todo, pero cuando acaba la fiesta está solo
export const Party: React.FC<SP> = ({t}) => {
  const end = ease((t - 1.6) / 1.0);
  return (
    <g>
      <Wall top="#24203a" bottom="#1c1a2c" floor="#1b1824" />
      {/* gran ventanal del departamento */}
      <rect x={40} y={360} width={1000} height={660} fill="#151a34" />
      <Skyline y={1020} t={t} color="#0f1226" win="#f2c66a" seed={11} lit={0.5} />
      {[290, 540, 790].map((x) => <rect key={x} x={x - 5} y={360} width={10} height={660} fill="#0e0c18" />)}
      <rect x={40} y={1020} width={1000} height={14} fill="#0e0c18" />
      {/* luces de fiesta que se apagan */}
      {Array.from({length: 6}).map((_, i) => (
        <path key={i} d={`M${540} 330 L${100 + i * 180 + Math.sin(t * 2 + i) * 90} 1080 L${170 + i * 180 + Math.sin(t * 2 + i) * 90} 1080 Z`} fill={['#e0603f', AMBER, '#7fb5c7', '#b06ab0'][i % 4]} opacity={(1 - end) * 0.18} />
      ))}
      {/* sofá grande */}
      <rect x={300} y={950} width={480} height={110} rx={30} fill="#e8e0d2" />
      <rect x={300} y={880} width={480} height={90} rx={30} fill="#f1ebe0" />
      {/* invitados sin cara que bailan y se van */}
      {Array.from({length: 7}).map((_, i) => {
        const x = 90 + i * 150;
        const jump = Math.abs(Math.sin(t * 5 + i)) * 20;
        const o = (1 - end) * (i === 3 ? 0 : 1);
        return (
          <g key={i} transform={`translate(${x} ${1080 - jump}) scale(${0.75 + rnd(i) * 0.15})`} opacity={o}>
            <ellipse cx={0} cy={-360} rx={38} ry={44} fill="#2a2036" />
            <rect x={-58} y={-310} width={116} height={190} rx={40} fill="#2a2036" />
            <rect x={-40} y={-130} width={80} height={130} rx={20} fill="#231b2e" />
            <rect x={36} y={-420} width={22} height={140} rx={11} fill="#2a2036" transform={`rotate(${20 + Math.sin(t * 5 + i) * 25} 46 -300)`} />
          </g>
        );
      })}
      <Person x={540} y={1060} s={0.8} who="him" t={t} fame pose={{sit: true, armL: 35, armR: -35, elbowR: -20, headTilt: lerp(0, 20, end)}} />
      <circle cx={540} cy={760} r={260} fill="url(#glowCool)" opacity={end * 0.4} />
      {/* confeti en el suelo cuando todo termina */}
      {Array.from({length: 18}).map((_, i) => (
        <rect key={i} x={rnd(i) * 1080} y={1070 + rnd(i + 1) * 40} width={14} height={6} fill={['#e0603f', AMBER, '#7fb5c7'][i % 3]} opacity={0.6 * end} transform={`rotate(${rnd(i + 2) * 180} ${rnd(i) * 1080} 1080)`} />
      ))}
    </g>
  );
};

// 11. extraña aquel cuarto y cómo ella lo miraba
export const Memory: React.FC<SP> = ({t}) => {
  const m = ease((t - 0.3) / 1.2);
  return (
    <g>
      <Wall top="#1e1c30" bottom="#18162a" floor="#151320" />
      <rect x={60} y={360} width={960} height={680} fill="#121733" />
      <Skyline y={1040} t={t} color="#0c1026" win="#f2c66a" seed={11} lit={0.3} />
      {/* el recuerdo aparece reflejado en el vidrio */}
      <g opacity={m * 0.85}>
        <rect x={60} y={360} width={960} height={680} fill="#5a3622" opacity={0.8} />
        <g transform="translate(60 360) scale(0.89 0.63)">
          <OldRoom t={t} mattress={false} />
          <Person x={420} y={1080} s={1.05} who="her" t={t} pose={{armL: 20, armR: -60, elbowR: -50, headTilt: 10 + Math.sin(t * 1.5) * 4}} />
        </g>
        <circle cx={430} cy={640} r={300} fill="url(#glow)" opacity={0.6} />
      </g>
      {[300, 540, 780].map((x) => <rect key={x} x={x - 5} y={360} width={10} height={680} fill="#0b0a14" />)}
      <rect x={60} y={1040} width={960} height={14} fill="#0b0a14" />
      <Person x={720} y={1110} s={1.0} who="him" t={t} fame pose={{back: true, armL: 6, armR: -6, headTilt: -4}} />
      <Bokeh t={t} n={10} y0={380} y1={1000} seed={5} />
    </g>
  );
};

// 12. vuelve al barrio, se quita las cadenas y toca su puerta
export const Return: React.FC<SP> = ({t}) => {
  const drop = ease((t - 0.5) / 0.9);
  const knock = t > 1.9 && t < 3.2 ? Math.max(0, Math.sin((t - 1.9) * 9)) : 0;
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1080} fill="url(#dusk)" />
      <Skyline y={760} t={t} color="#2a2036" seed={4} lit={0.2} h={0.5} />
      <rect x={380} y={480} width={700} height={560} fill="#8a4f3e" />
      <rect x={370} y={460} width={720} height={26} fill="#3a2420" />
      <rect x={830} y={560} width={180} height={150} fill="#f6cf7a" opacity={0.85} />
      <circle cx={920} cy={635} r={200} fill="url(#glow)" opacity={0.8} />
      <Door x={560} y={1040} w={180} h={380} color="#3f5f6a" open={t > 3.2 ? ease((t - 3.2) / 0.4) * 0.4 : 0} />
      <rect x={0} y={1040} width={1080} height={880} fill="#2a1d1c" />
      <Car x={130} y={1060} s={0.7} t={t} lights={0.4} />
      <Person x={520} y={1060} s={0.9} who="him" t={t} fame noChain pose={{armR: lerp(-40, -118, ease((t - 1.6) / 0.3)) + knock * 6, elbowR: lerp(-60, -45, ease((t - 1.6) / 0.3)), armL: 12, headTilt: 6}} />
      {/* la cadena cae al suelo */}
      <g transform={`translate(${lerp(470, 440, drop)} ${lerp(820, 1052, drop)}) rotate(${drop * 70})`}>
        <path d="M-30 0 Q0 40 30 0" fill="none" stroke={C.gold} strokeWidth={7} />
        <circle cx={0} cy={22} r={9} fill={C.gold} />
      </g>
      {/* golpes en la puerta */}
      {[0, 1].map((i) => (
        <path key={i} d={`M${700 + i * 18} ${676} q14 20 0 40`} stroke={CREAM} strokeWidth={5} fill="none" opacity={knock * (1 - i * 0.4)} />
      ))}
    </g>
  );
};

// 13. nada de lo que ganó vale lo que tenía antes
export const Message: React.FC<SP> = ({t}) => {
  const close = ease(t / 3.5);
  return (
    <g>
      <defs>
        <radialGradient id="msgBg" cx="50%" cy="40%" r="70%">
          <stop offset="0" stopColor="#e6a75a" />
          <stop offset="0.6" stopColor="#a8622f" />
          <stop offset="1" stopColor="#5a3018" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={1920} fill="url(#msgBg)" />
      <circle cx={540} cy={650} r={320} fill="url(#glowWhite)" opacity={0.45} />
      <Bokeh t={t} n={16} y0={250} y1={1300} seed={8} size={0.8} />
      <Profile x={lerp(250, 290, close)} y={840} s={1.0} who="him" />
      <Profile x={lerp(830, 790, close)} y={880} s={0.94} who="her" flip />
      {/* la radio vieja vuelve a sonar entre los dos */}
      <Radio x={540} y={1240} s={0.7} t={t} on={1} />
    </g>
  );
};

// 14. cierre: la casita iluminada, la radio suena otra vez (flecha al LIVE aparte)
export const Outro: React.FC<SP> = ({t}) => (
  <g>
    <rect x={0} y={0} width={1080} height={1120} fill="url(#dusk)" />
    <Skyline y={760} t={t} color="#3a2a44" seed={2} lit={0.25} h={0.6} />
    <rect x={0} y={760} width={1080} height={360} fill="#6a3c40" opacity={0.6} />
    <rect x={70} y={380} width={940} height={740} fill="#2e1c14" />
    <rect x={70} y={370} width={940} height={44} fill="#b8492f" />
    {/* foquitos */}
    <path d="M70 440 Q540 500 1010 440" stroke="#1a100b" strokeWidth={2} fill="none" />
    {Array.from({length: 13}).map((_, i) => {
      const x = 100 + i * 73;
      const y = 440 + Math.sin((i / 12) * Math.PI) * 30;
      return <circle key={i} cx={x} cy={y} r={9} fill="#ffe6b0" opacity={0.55 + 0.45 * Math.sin(t * 3 + i)} />;
    })}
    <rect x={150} y={500} width={780} height={500} fill="url(#warmWin)" />
    <g>
      <defs>
        <clipPath id="win">
          <rect x={150} y={500} width={780} height={500} />
        </clipPath>
      </defs>
      <g clipPath="url(#win)">
        <circle cx={540} cy={760} r={320} fill="url(#glowWhite)" opacity={0.4} />
        <g transform={`rotate(${Math.sin(t * 1.6) * 4} 540 1000)`}>
          <Person x={480} y={1000} s={0.62} who="him" t={t} pose={{armR: -70, elbowR: -40, armL: 15, headTilt: 10}} />
          <Person x={580} y={1000} s={0.58} who="her" t={t} flip pose={{armR: -150, elbowR: -20, armL: 25, headTilt: 12}} />
        </g>
        <Crate x={800} y={1000} w={110} h={80} />
        <Radio x={800} y={920} s={0.55} t={t} on={1} />
        <Notes t={t} x={780} y={860} n={4} spread={120} rise={260} />
      </g>
    </g>
    <rect x={534} y={500} width={12} height={500} fill="#2e1c14" />
    <rect x={0} y={1120} width={1080} height={800} fill="#1e130c" />
    <Bokeh t={t} n={10} y0={380} y1={1100} seed={12} size={0.7} />
  </g>
);

export const SCENES: Record<string, React.FC<SP>> = {
  stage: Stage,
  room: Room,
  dance: Dance,
  street: Street,
  notebook: Notebook,
  viral: Viral,
  fame: Fame,
  calls: Calls,
  leave: Leave,
  party: Party,
  memory: Memory,
  return: Return,
  message: Message,
  outro: Outro,
};
