// Escenas de "Tú con él" (estética malecón): pueblo costero al atardecer, terminal de buses
// frente al mar, muelle. Paleta terracota + crema + turquesa. Personajes sin cara.
import React from 'react';
import {Birds, Cam, Glow, Grad, H, HER, HIM, Hand, OTHER, Person, Rain, Svg, Vignette, W, ease, lin, mix, mixC, rng, useT} from './kit';

type P = {dur: number; a?: string; b?: string};

const SKY0 = '#ffcf8f';
const SKY1 = '#f2795a';
const SEA = '#1f8a8c';
const SEA2 = '#156a70';
const TERRA = '#c8553d';
const CREAM = '#fff1d6';
const DEEP = '#3b1f2b';
const TURQ = '#3fe3cf';
const SAND = '#f0d3a2';

const Atardecer: React.FC<{id: string; sunY?: number; dusk?: number}> = ({id, sunY = 980, dusk = 0}) => {
  const t = useT();
  return (
    <>
      <defs>
        <Grad id={`${id}s`} stops={[[0, mixC('#ffb07a', '#4a2a5a', dusk)], [0.6, mixC(SKY1, '#a04a5a', dusk)], [1, mixC(SKY0, '#e08a6a', dusk)]]} />
        <Grad id={`${id}m`} stops={[[0, SEA], [1, SEA2]]} />
        <Glow id={`${id}g`} color="#fff0c0" inner={0.7} />
      </defs>
      <rect width={W} height={H} fill={`url(#${id}s)`} />
      <circle cx={700} cy={sunY} r={300} fill={`url(#${id}g)`} />
      <circle cx={700} cy={sunY} r={95} fill="#fff3d0" />
      <rect x={0} y={1060} width={W} height={860} fill={`url(#${id}m)`} />
      {Array.from({length: 9}).map((_, i) => (
        <rect key={i} x={700 - 160 + Math.sin(t * 1.5 + i) * 20 + (i % 3) * 30} y={1080 + i * 26} width={260 - i * 20} height={6} rx={3} fill="#ffe8b8" opacity={0.6 - i * 0.05} />
      ))}
    </>
  );
};

// Bus de pueblo (vista lateral). x = borde izquierdo, y = suelo.
const Bus: React.FC<{x: number; y: number; door?: number; lights?: boolean}> = ({x, y, door = 0, lights = false}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={-470} width={860} height={400} rx={36} fill={CREAM} />
    <rect x={0} y={-200} width={860} height={60} fill={TERRA} />
    <rect x={0} y={-470} width={860} height={50} rx={30} fill="#2fa89a" />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={160 + i * 165} y={-400} width={140} height={150} rx={14} fill="#5aa9b0" opacity={0.85} />
    ))}
    <rect x={30} y={-410} width={100} height={330} rx={10} fill={DEEP} />
    <rect x={30 + door * 50} y={-410} width={50 - door * 25} height={330} fill="#8acbd0" opacity={0.9} />
    <rect x={80 + door * 25} y={-410} width={50 - door * 25} height={330} fill="#8acbd0" opacity={0.9} />
    {lights && <circle cx={850} cy={-120} r={22} fill="#fff3a0" />}
    <circle cx={190} cy={-70} r={62} fill="#2a1a1f" />
    <circle cx={190} cy={-70} r={24} fill="#9a8a80" />
    <circle cx={690} cy={-70} r={62} fill="#2a1a1f" />
    <circle cx={690} cy={-70} r={24} fill="#9a8a80" />
  </g>
);

// Mochila (se dibuja detrás o delante de "ella").
const Mochila: React.FC<{x: number; y: number; s: number; back?: boolean}> = ({x, y, s, back}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {back ? <rect x={-62} y={-420} width={124} height={170} rx={30} fill="#2f6b5a" /> : <rect x={-74} y={-418} width={14} height={140} rx={6} fill="#2f6b5a" />}
  </g>
);

// Terminal: techo de tejas, banca, poste con reloj.
const Terminal: React.FC<{id: string; clock?: number}> = ({id, clock = 0}) => (
  <g>
    <rect x={0} y={1380} width={W} height={540} fill={SAND} />
    <rect x={0} y={1370} width={W} height={18} fill="#d9b07a" />
    <polygon points="40,700 1040,700 1000,620 80,620" fill={TERRA} />
    {Array.from({length: 12}).map((_, i) => (
      <rect key={i} x={70 + i * 80} y={624} width={8} height={76} fill="#9a3a2a" opacity={0.6} />
    ))}
    <rect x={80} y={700} width={22} height={690} fill={DEEP} />
    <rect x={980} y={700} width={22} height={690} fill={DEEP} />
    <g transform="translate(860 820)">
      <circle r={70} fill={CREAM} stroke={DEEP} strokeWidth={10} />
      <line x1={0} y1={0} x2={Math.sin(clock / 12) * 34} y2={-Math.cos(clock / 12) * 34} stroke={DEEP} strokeWidth={8} strokeLinecap="round" />
      <line x1={0} y1={0} x2={Math.sin(clock) * 54} y2={-Math.cos(clock) * 54} stroke={TERRA} strokeWidth={5} strokeLinecap="round" />
    </g>
    <rect id={id} x={0} y={0} width={0} height={0} />
  </g>
);

const Banca: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-210} y={-150} width={420} height={26} rx={8} fill="#8a4a2a" />
    <rect x={-210} y={-60} width={420} height={30} rx={8} fill="#a85a32" />
    <rect x={-190} y={-30} width={18} height={70} fill={DEEP} />
    <rect x={172} y={-30} width={18} height={70} fill={DEEP} />
  </g>
);

// Personaje sentado (torso sin piernas + muslos hacia delante).
const Sentado: React.FC<{look: typeof HIM; x: number; y: number; s: number; armL?: number; armR?: number; tilt?: number}> = ({look, x, y, s, armL = 24, armR = 24, tilt = 0}) => (
  <g>
    <Person look={look} x={x} y={y + 175 * s} s={s} noLegs armL={armL} armR={armR} tilt={tilt} />
    <rect x={x - 50 * s} y={y - 30 * s} width={100 * s} height={70 * s} rx={20 * s} fill={look.pants} />
    <rect x={x - 46 * s} y={y + 20 * s} width={36 * s} height={150 * s} rx={14 * s} fill={look.pants} />
    <rect x={x + 10 * s} y={y + 20 * s} width={36 * s} height={150 * s} rx={14 * s} fill={look.pants} />
  </g>
);

// ---------- banca (hook): él espera, el reloj gira, el cielo pasa ----------
export const tcbanca: React.FC<P> = ({dur}) => {
  const t = useT();
  const dusk = lin(t, 0, dur);
  return (
    <Cam dur={dur} z={[1.12, 1.0]}>
      <Svg>
        <Atardecer id="tcb" sunY={mix(900, 1040, dusk)} dusk={dusk * 0.7} />
        <Terminal id="tcbx" clock={t * 6} />
        <Banca x={420} y={1520} />
        <Sentado look={HIM} x={420} y={1440} s={0.9} armL={20} armR={30} tilt={-5 + Math.sin(t) * 2} />
        <rect x={470} y={1360} width={26} height={36} rx={5} fill={CREAM} />
        <Birds x={150} y={420} n={4} color={DEEP} speed={30} />
      </Svg>
      <Vignette id="tcbv" strength={0.45} color="#2a0f10" />
    </Cam>
  );
};

// ---------- pueblo: casas de colores sobre la colina, mar y sol ----------
export const tcpueblo: React.FC<P> = ({dur}) => {
  const t = useT();
  const r = rng(201);
  const casas = ['#f2b04a', '#e2543a', '#2fa89a', '#fff1d6', '#c8553d', '#7ac0b8', '#f39a7a'];
  return (
    <Cam dur={dur} z={[1.0, 1.06]} x={[0, -20]}>
      <Svg>
        <Atardecer id="tcp" sunY={900} />
        <path d="M -40 1240 Q 260 980 560 1080 Q 820 1150 1120 1000 L 1120 1500 L -40 1500 Z" fill="#7a3a3a" />
        {Array.from({length: 18}).map((_, i) => {
          const x = -10 + i * 62 + r() * 20;
          const base = 1240 - Math.sin((i / 18) * Math.PI) * 120 + r() * 40;
          const h = 70 + r() * 60;
          const c = casas[Math.floor(r() * casas.length)];
          return (
            <g key={i}>
              <rect x={x} y={base - h} width={70} height={h + 300} fill={c} />
              <polygon points={`${x - 6},${base - h} ${x + 76},${base - h} ${x + 35},${base - h - 34}`} fill="#9a3a2a" />
              <rect x={x + 22} y={base - h + 22} width={22} height={26} fill={DEEP} opacity={0.75} />
            </g>
          );
        })}
        <rect x={0} y={1480} width={W} height={440} fill={SAND} />
        <rect x={0} y={1560} width={W} height={90} fill="#8a6a5a" />
        {Array.from({length: 7}).map((_, i) => (
          <rect key={i} x={i * 170 + 20} y={1600} width={90} height={10} fill={CREAM} />
        ))}
        <g transform={`translate(${mix(1100, 640, ease(t, 0, dur))} 1640) scale(0.42)`}>
          <Bus x={0} y={0} lights />
        </g>
        <Birds x={200} y={500} n={5} color={DEEP} speed={25} />
      </Svg>
    </Cam>
  );
};

// ---------- bus (llega | adios | otro) ----------
export const tcbus: React.FC<P> = ({dur, a = 'llega'}) => {
  const t = useT();
  const ground = 1640;
  if (a === 'adios') {
    const go = ease(t, dur * 0.35, dur);
    return (
      <Cam dur={dur} z={[1.0, 1.04]}>
        <Svg>
          <Atardecer id="tcba" sunY={950} dusk={0.2} />
          <rect x={0} y={1380} width={W} height={540} fill={SAND} />
          <Bus x={mix(120, 1200, go)} y={ground} door={1 - lin(t, dur * 0.2, dur * 0.35)} lights />
          <g opacity={1 - lin(t, dur * 0.15, dur * 0.3)}>
            <Person look={HER} x={230} y={ground - 20} s={0.62} armR={150 + Math.sin(t * 9) * 18} />
            <Mochila x={230} y={ground - 20} s={0.62} />
          </g>
          <Person look={HIM} x={160} y={1920} s={1.15} view="back" armR={mix(150, 10, lin(t, dur * 0.6, dur))} />
        </Svg>
      </Cam>
    );
  }
  const otro = a === 'otro';
  const step = ease(t, 0.4, 1.6);
  const walk = lin(t, 0.4, 1.6) < 1 ? t * 7 : null;
  return (
    <Cam dur={dur} z={otro ? [1.0, 1.12] : [1.0, 1.05]} x={otro ? [0, 30] : [0, 0]}>
      <Svg>
        <Atardecer id={`tcb${a}`} sunY={otro ? 1000 : 920} dusk={otro ? 0.35 : 0} />
        <rect x={0} y={1380} width={W} height={540} fill={SAND} />
        <Bus x={otro ? 160 : mix(1100, 160, ease(t, 0, 0.5))} y={ground} door={1} lights={otro} />
        {otro ? (
          <g>
            <Person look={OTHER} x={mix(260, 520, step)} y={ground + 10} s={0.72} walk={walk} armR={30} />
            <Person look={HER} x={mix(220, 430, step)} y={ground + 10} s={0.66} walk={walk} armL={-30} />
            <Mochila x={mix(220, 430, step)} y={ground + 10} s={0.66} />
            <Person look={HIM} x={880} y={1920} s={1.25} view="back" armL={mix(60, 4, lin(t, 1.4, 2.2))} armR={mix(60, 4, lin(t, 1.4, 2.2))} />
            <rect x={760} y={mix(1555, 1640, lin(t, 1.4, 2.2))} width={34} height={46} rx={6} fill={CREAM} />
          </g>
        ) : (
          <g>
            <Person look={HER} x={mix(220, 480, step)} y={ground + 10} s={0.7} walk={walk} armL={10} />
            <Mochila x={mix(220, 480, step)} y={ground + 10} s={0.7} />
          </g>
        )}
      </Svg>
      {otro && <Vignette id="tcbov" strength={0.55} color="#2a0f10" />}
    </Cam>
  );
};

// ---------- kiosko: él vende café frente al mar, ella se acerca ----------
export const tckiosko: React.FC<P> = ({dur}) => {
  const t = useT();
  const come = ease(t, 0.2, dur * 0.7);
  return (
    <Cam dur={dur} z={[1.0, 1.06]}>
      <Svg>
        <Atardecer id="tck" sunY={880} />
        <rect x={0} y={1380} width={W} height={540} fill={SAND} />
        {/* kiosko */}
        <rect x={110} y={880} width={560} height={620} fill={CREAM} />
        {Array.from({length: 7}).map((_, i) => (
          <path key={i} d={`M ${90 + i * 86} 800 L ${176 + i * 86} 800 L ${176 + i * 86} 900 Q ${133 + i * 86} 940 ${90 + i * 86} 900 Z`} fill={i % 2 ? CREAM : TERRA} />
        ))}
        <rect x={150} y={940} width={480} height={330} fill="#5a2a2a" />
        <Person look={HIM} x={390} y={1500} s={0.85} armL={40} armR={60 + Math.sin(t * 3) * 10} />
        <rect x={110} y={1270} width={560} height={40} fill={TERRA} />
        <rect x={130} y={1310} width={520} height={190} fill="#e8d6b4" />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x={460 + i * 70} y={1220} width={44} height={52} rx={6} fill="#fff" />
            {[0, 1, 2].map((k) => (
              <path key={k} d={`M ${474 + i * 70 + k * 8} ${1210 - ((t * 60 + k * 20) % 60)} q 8 -14 0 -28`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.6} />
            ))}
          </g>
        ))}
        <Person look={HER} x={mix(1180, 820, come)} y={1700} s={0.92} view="front" walk={come < 1 ? t * 7 : null} armL={10} />
        <Mochila x={mix(1180, 820, come)} y={1700} s={0.92} />
        <Birds x={600} y={460} n={4} color={DEEP} speed={-20} />
      </Svg>
    </Cam>
  );
};

// ---------- muelle (juntos | solo) ----------
export const tcmuelle: React.FC<P> = ({dur, a = 'juntos'}) => {
  const t = useT();
  const solo = a === 'solo';
  const p = ease(t, 0, dur);
  return (
    <Cam dur={dur} z={solo ? [1.1, 1.0] : [1.0, 1.08]}>
      <Svg>
        <Atardecer id={`tcm${a}`} sunY={solo ? mix(1000, 1080, p) : 960} dusk={solo ? 0.55 + p * 0.3 : 0.1} />
        {/* muelle en perspectiva */}
        <polygon points="470,1080 610,1080 1000,1920 80,1920" fill="#8a5a3a" />
        {Array.from({length: 16}).map((_, i) => {
          const k = i / 16;
          const y = 1080 + Math.pow(k, 1.6) * 840;
          const half = 70 + (y - 1080) * 0.55;
          return <rect key={i} x={540 - half} y={y} width={half * 2} height={4 + k * 8} fill="#5a3422" />;
        })}
        {[-1, 1].map((sd) =>
          Array.from({length: 7}).map((_, i) => {
            const k = i / 7;
            const y = 1080 + Math.pow(k, 1.6) * 840;
            const half = 70 + (y - 1080) * 0.55;
            return <rect key={`${sd}${i}`} x={540 + sd * half - 6 - k * 6} y={y - 40 - k * 120} width={12 + k * 12} height={40 + k * 120} fill="#4a2a1c" />;
          }),
        )}
        {solo ? (
          <g>
            <Sentado look={HIM} x={540} y={1180} s={0.32} armL={10} armR={10} tilt={6} />
            <circle cx={mix(980, 1120, p)} cy={1040} r={8} fill="#fff3a0" opacity={0.9 - p * 0.6} />
            <circle cx={mix(960, 1100, p)} cy={1040} r={8} fill="#fff3a0" opacity={0.9 - p * 0.6} />
          </g>
        ) : (
          <g>
            <Person look={HER} x={mix(560, 548, p)} y={mix(1500, 1260, p)} s={mix(0.5, 0.3, p)} view="back" walk={t * 6} armR={-10} shade={0.35} />
            <Person look={HIM} x={mix(470, 515, p)} y={mix(1500, 1260, p)} s={mix(0.54, 0.32, p)} view="back" walk={t * 6 + 1} armL={-10} shade={0.35} />
          </g>
        )}
        <Birds x={300} y={540} n={solo ? 2 : 6} color={DEEP} speed={22} />
      </Svg>
      <Vignette id={`tcm${a}v`} strength={solo ? 0.7 : 0.35} color="#2a0f10" />
    </Cam>
  );
};

// ---------- calendario: cada viernes tachado ----------
export const tccalendario: React.FC<P> = ({dur}) => {
  const t = useT();
  const flip = 0; // el calendario se queda visible toda la escena
  const n = Math.floor(lin(t, 0.2, dur * 0.55) * 30);
  const cell = (i: number) => ({x: 150 + (i % 7) * 104, y: 720 + Math.floor(i / 7) * 104});
  return (
    <Cam dur={dur} z={[1.0, 1.08]}>
      <Svg>
        <rect width={W} height={H} fill="#b8573f" />
        {Array.from({length: 16}).map((_, i) => (
          <rect key={i} x={0} y={i * 130} width={W} height={4} fill="#a04a35" />
        ))}
        <circle cx={540} cy={470} r={14} fill={DEEP} />
        <g transform={`translate(540 520) scale(1 ${1 - flip * 0.9}) translate(-540 -520)`} opacity={1 - flip * 0.6}>
          <rect x={120} y={520} width={760} height={780} rx={20} fill={CREAM} />
          <rect x={120} y={520} width={760} height={150} rx={20} fill="#2fa89a" />
          {Array.from({length: 30}).map((_, i) => {
            const c = cell(i);
            const fri = i % 7 === 4;
            return (
              <g key={i}>
                <rect x={c.x} y={c.y} width={90} height={90} rx={10} fill={fri ? '#ffe6c8' : '#f6e6c8'} />
                {fri && i < n && <circle cx={c.x + 45} cy={c.y + 45} r={40} fill="none" stroke={TERRA} strokeWidth={6} />}
                {i < n && (
                  <g stroke={DEEP} strokeWidth={6} strokeLinecap="round" opacity={0.8}>
                    <line x1={c.x + 22} y1={c.y + 22} x2={c.x + 68} y2={c.y + 68} />
                    <line x1={c.x + 68} y1={c.y + 22} x2={c.x + 22} y2={c.y + 68} />
                  </g>
                )}
              </g>
            );
          })}
        </g>
        <g opacity={flip}>
          <rect x={120} y={520} width={760} height={780} rx={20} fill={CREAM} opacity={0.0} />
        </g>
      </Svg>
    </Cam>
  );
};

// ---------- móvil: mensajes cada vez más cortos y luego "Visto" ----------
export const tcmovil: React.FC<P> = ({dur}) => {
  const t = useT();
  const msgs = [
    {me: false, w: 520, at: 0.1},
    {me: true, w: 420, at: 0.5},
    {me: false, w: 300, at: 0.9},
    {me: true, w: 460, at: 1.4},
    {me: false, w: 120, at: 1.9},
    {me: true, w: 480, at: dur * 0.65},
  ];
  const seen = lin(t, dur * 0.75, dur * 0.85);
  return (
    <Cam dur={dur} z={[1.02, 1.1]} y={[0, -30]}>
      <Svg>
        <rect width={W} height={H} fill="#6a2f35" />
        <circle cx={540} cy={900} r={600} fill="#e2543a" opacity={0.25} />
        <g transform="translate(110 380)">
          <rect x={0} y={0} width={680} height={1260} rx={70} fill="#1d1418" />
          <rect x={26} y={26} width={628} height={1208} rx={50} fill="#fff4e2" />
          <rect x={26} y={26} width={628} height={130} rx={50} fill="#2fa89a" />
          <circle cx={110} cy={92} r={34} fill={CREAM} />
          <rect x={164} y={76} width={200} height={26} rx={13} fill={CREAM} opacity={0.85} />
          {msgs.map((m, i) => {
            const p = ease(t, m.at, m.at + 0.25);
            const y = 200 + i * 150;
            const x = m.me ? 620 - m.w : 60;
            return (
              <g key={i} opacity={p} transform={`translate(0 ${(1 - p) * 30})`}>
                <rect x={x} y={y} width={m.w} height={110} rx={30} fill={m.me ? '#3fb8a8' : '#ead7bd'} />
                <rect x={x + 30} y={y + 36} width={Math.max(40, m.w - 80)} height={16} rx={8} fill={m.me ? '#e8fffb' : '#a08a70'} opacity={0.8} />
                {m.w > 250 && <rect x={x + 30} y={y + 64} width={(m.w - 80) * 0.6} height={16} rx={8} fill={m.me ? '#e8fffb' : '#a08a70'} opacity={0.6} />}
              </g>
            );
          })}
          <g opacity={seen}>
            <path d="M 470 1130 l 14 14 l 26 -30 M 492 1130 l 14 14 l 26 -30" stroke="#2f8ae0" strokeWidth={6} fill="none" strokeLinecap="round" />
            <rect x={545} y={1122} width={70} height={22} rx={11} fill="#2f8ae0" opacity={0.7} />
          </g>
        </g>
      </Svg>
    </Cam>
  );
};

// ---------- estaciones: la misma banca en invierno y en primavera ----------
export const tcestaciones: React.FC<P> = ({dur}) => {
  const t = useT();
  const spring = ease(t, dur * 0.45, dur * 0.65);
  const r = rng(301);
  return (
    <Cam dur={dur} z={[1.0, 1.05]}>
      <Svg>
        <defs>
          <Grad id="tces" stops={[[0, mixC('#5a6a8a', '#ffc2a8', spring)], [1, mixC('#9aa8b8', '#ffe2c0', spring)]]} />
        </defs>
        <rect width={W} height={H} fill="url(#tces)" />
        <rect x={0} y={1060} width={W} height={860} fill={mixC('#3a5a6a', SEA, spring)} />
        <Terminal id="tcesx" clock={t * 3} />
        <rect width={W} height={H} fill="#1a2a3a" opacity={0.25 * (1 - spring)} />
        <Banca x={420} y={1520} />
        <Sentado look={HIM} x={420} y={1440} s={0.9} armL={14} armR={14} tilt={-6} />
        {/* paraguas en invierno */}
        <g opacity={1 - spring}>
          <path d="M 260 1060 Q 420 920 580 1060 Z" fill="#2c3e5c" />
          <rect x={417} y={1060} width={6} height={150} fill={DEEP} />
          <Rain seed={303} n={90} color="#dfe8f5" opacity={0.6} speed={1800} />
        </g>
        {/* flores en primavera */}
        <g opacity={spring}>
          {Array.from({length: 26}).map((_, i) => {
            const x = r() * W;
            const y = ((r() * H + t * 90) % 1500) + 300;
            return <circle key={i} cx={x + Math.sin(t + i) * 30} cy={y} r={8 + r() * 6} fill={i % 2 ? '#ffb3c8' : '#fff1d6'} />;
          })}
          {Array.from({length: 7}).map((_, i) => (
            <g key={i} transform={`translate(${120 + i * 140} 1460)`}>
              <rect x={-3} y={0} width={6} height={60} fill="#3a7a4a" />
              <circle cx={0} cy={0} r={18} fill={i % 2 ? '#ff7a9a' : '#ffd23f'} />
            </g>
          ))}
        </g>
      </Svg>
    </Cam>
  );
};

// ---------- saludo: ella lo saluda amable, del brazo del otro ----------
export const tcsaludo: React.FC<P> = ({dur}) => {
  const t = useT();
  const wave = lin(t, 0.4, 0.8) * (1 - lin(t, dur * 0.6, dur * 0.8));
  const away = ease(t, dur * 0.6, dur);
  return (
    <Cam dur={dur} z={[1.0, 1.08]}>
      <Svg>
        <Atardecer id="tcsa" sunY={1010} dusk={0.45} />
        <rect x={0} y={1380} width={W} height={540} fill={SAND} />
        <g transform={`translate(${away * 260} 0)`}>
          <Person look={OTHER} x={720} y={1640} s={0.82} armL={-20} walk={away > 0 ? t * 6 : null} view={away > 0.05 ? 'back' : 'front'} />
          <Person look={HER} x={600} y={1640} s={0.76} armR={-20} armL={4 + wave * 150 + Math.sin(t * 10) * 14 * wave} tilt={4} walk={away > 0 ? t * 6 + 1 : null} view={away > 0.05 ? 'back' : 'front'} />
        </g>
        <Person look={HIM} x={250} y={1920} s={1.35} view="back" armR={30} />
        <rect x={290} y={1560} width={40} height={54} rx={6} fill={CREAM} />
      </Svg>
      <Vignette id="tcsav" strength={0.5} color="#2a0f10" />
    </Cam>
  );
};

// ---------- mapa: la ruta de ella pasa por su pueblo y sigue de largo ----------
export const tcmapa: React.FC<P> = ({dur}) => {
  const t = useT();
  const p = ease(t, 0.2, dur * 0.9);
  const pts: [number, number][] = [
    [120, 520], [300, 600], [260, 800], [480, 900], [640, 820], [780, 980], [600, 1140], [380, 1200], [300, 1380], [520, 1500], [800, 1460], [900, 1640],
  ];
  const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  const d = 'M ' + pts.map((q) => q.join(' ')).join(' L ');
  let acc = 0;
  let pos = pts[0];
  for (let i = 0; i < seg.length; i++) {
    if (acc + seg[i] >= p * total) {
      const k = (p * total - acc) / seg[i];
      pos = [mix(pts[i][0], pts[i + 1][0], k), mix(pts[i][1], pts[i + 1][1], k)];
      break;
    }
    acc += seg[i];
    pos = pts[i + 1];
  }
  const suyo = 5; // índice del pueblo de él
  const passed = pos[1] > pts[suyo][1] + 5 || p > 0.48;
  return (
    <Cam dur={dur} z={[1.0, 1.08]}>
      <Svg>
        <rect width={W} height={H} fill="#f3dfb8" />
        <path d="M 1080 300 Q 900 700 1000 1100 Q 1080 1500 1080 1920 L 1080 300 Z" fill="#7ac0b8" opacity={0.7} />
        {Array.from({length: 10}).map((_, i) => (
          <path key={i} d={`M ${-50 + i * 30} ${330 + i * 160} q 200 -40 400 10 t 400 -20`} stroke="#e2c493" strokeWidth={6} fill="none" />
        ))}
        <path d={d} stroke="#a08a70" strokeWidth={8} fill="none" strokeDasharray="18 16" />
        <path d={d} stroke={TERRA} strokeWidth={10} fill="none" strokeDasharray={`${p * total} ${total}`} strokeLinecap="round" />
        {pts.map((q, i) =>
          i === suyo ? null : <circle key={i} cx={q[0]} cy={q[1]} r={14} fill={CREAM} stroke={DEEP} strokeWidth={5} />,
        )}
        <circle cx={pts[suyo][0]} cy={pts[suyo][1]} r={30 + (passed ? 0 : Math.sin(t * 6) * 6)} fill={passed ? '#9a8a80' : TURQ} stroke={DEEP} strokeWidth={6} />
        <g transform={`translate(${pos[0]} ${pos[1]})`}>
          <path d="M 0 0 C -30 -40 -30 -80 0 -80 C 30 -80 30 -40 0 0 Z" fill="#e2543a" stroke={DEEP} strokeWidth={4} />
          <circle cx={0} cy={-55} r={11} fill={CREAM} />
        </g>
      </Svg>
    </Cam>
  );
};

