// Escenas de la historia "Ya me enteré" (Reik). Ilustración plana, sin texto.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ABUELA, Birds, Bokeh, Cam, Glow, Grad, H, HER, HIM, Hand, Memory, OTHER, Person, Rain, Skyline, Svg, Vignette, W, ease, lin, mix, mixC, rng, useCast, useT} from './kit';

type S = {dur: number};

const Umbrella: React.FC<{x: number; y: number; rx: number; color: string; opacity?: number}> = ({x, y, rx, color, opacity = 1}) => {
  const ry = rx * 0.48;
  const n = 5;
  let scallop = '';
  for (let i = n; i > 0; i--) {
    const x1 = x - rx + ((i - 1) * 2 * rx) / n;
    scallop += ` Q ${x1 + rx / n} ${y - ry * 0.18} ${x1} ${y}`;
  }
  return (
    <g opacity={opacity}>
      <line x1={x} y1={y - ry} x2={x} y2={y + ry * 1.9} stroke={mixC(color, '#000000', 0.4)} strokeWidth={rx * 0.04} strokeLinecap="round" />
      <path d={`M ${x - rx} ${y} Q ${x - rx} ${y - ry * 1.4} ${x} ${y - ry * 1.3} Q ${x + rx} ${y - ry * 1.4} ${x + rx} ${y}${scallop} Z`} fill={color} />
    </g>
  );
};

// ---------- 1 y 12: ventana (noche / amanecer) ----------
export const Ventana: React.FC<S & {dawn?: boolean; hook?: boolean}> = ({dur, dawn = false, hook = false}) => {
  const t = useT();
  const p = dawn ? ease(t, 0.2, dur - 0.4) : 0;
  const id = dawn ? 'v12' : 'v1';
  const breath = Math.sin(t * 1.6) * 5 - (dawn ? ease(t, 2.2, dur) * 16 : 0);
  const wall = mixC('#0d1126', '#3b2c44', p);
  return (
    <Cam dur={dur} z={dawn ? [1.08, 1.0] : hook ? [1.22, 1.02] : [1, 1.07]} y={dawn ? [20, 0] : hook ? [80, 0] : [0, 25]}>
      <Svg>
        <defs>
          <Grad id={`${id}sky`} stops={[[0, mixC('#0e1330', '#3d4a88', p)], [0.55, mixC('#1d2550', '#e0897e', p)], [1, mixC('#2c3666', '#f8c98f', p)]]} />
          <clipPath id={`${id}clip`}>
            <rect x={90} y={240} width={900} height={1240} />
          </clipPath>
          <Glow id={`${id}sun`} color="#ffe2a6" inner={0.9} />
          <Glow id={`${id}room`} color="#ffb98a" inner={0.5} />
        </defs>
        <rect width={W} height={H} fill={wall} />
        <circle cx={540} cy={1300} r={900} fill={`url(#${id}room)`} opacity={p * 0.6} />
        <g clipPath={`url(#${id}clip)`}>
          <rect x={90} y={240} width={900} height={1240} fill={`url(#${id}sky)`} />
          {dawn && <circle cx={700} cy={1250} r={420} fill={`url(#${id}sun)`} opacity={p} />}
          <Skyline seed={21} base={1480} minH={380} maxH={860} color={mixC('#222a56', '#6c5478', p)} win="#f6d08a" lit={0.3} off={p} />
          <Skyline seed={22} base={1480} minH={140} maxH={460} color={mixC('#151b3c', '#4a3a5c', p)} win="#f6d08a" lit={0.36} off={p} />
          <Bokeh seed={4} n={14} colors={['#f6d08a', '#8ea4ff', '#ffffff']} rMin={20} rMax={70} opacity={0.22 * (1 - p * 0.7)} area={[90, 240, 900, 1240]} />
          <Rain seed={5} n={70} speed={260} len={34} w={3} slant={0} opacity={0.32 * (1 - p)} area={[90, 240, 900, 1240]} color="#bcc8ff" />
        </g>
        <g fill={mixC('#0a0d1e', '#2a1f33', p)}>
          <rect x={80} y={230} width={920} height={22} />
          <rect x={80} y={1468} width={920} height={22} />
          <rect x={80} y={230} width={22} height={1260} />
          <rect x={978} y={230} width={22} height={1260} />
          <rect x={531} y={240} width={18} height={1240} />
          <rect x={90} y={820} width={900} height={16} />
        </g>
        <rect x={40} y={1488} width={1000} height={40} fill={mixC('#141832', '#4a3a4e', p)} />
        <g transform={`translate(0 ${breath})`}>
          <path d="M 120 1960 Q 130 1730 380 1690 L 700 1690 Q 950 1730 960 1960 Z" fill={mixC('#141b33', '#2a2438', p)} />
          <rect x={480} y={1620} width={120} height={100} fill={mixC('#3a2c2a', '#7a5248', p)} />
          <ellipse cx={392} cy={1530} rx={22} ry={40} fill={mixC('#4a3530', '#9a6a5a', p)} />
          <ellipse cx={688} cy={1530} rx={22} ry={40} fill={mixC('#4a3530', '#9a6a5a', p)} />
          <ellipse cx={540} cy={1500} rx={150} ry={175} fill="#121318" stroke={dawn ? '#ffb98a' : '#6d83c9'} strokeWidth={5} strokeOpacity={dawn ? 0.5 * p : 0.4} />
        </g>
      </Svg>
      <Vignette id={`${id}vig`} strength={0.5} />
    </Cam>
  );
};

// ---------- 2: el mensaje ----------
const Bubble: React.FC<{t: number; t0: number; x: number; y: number; w: number; h: number; me?: boolean; children?: React.ReactNode}> = ({t, t0, x, y, w, h, me, children}) => {
  const p = ease(t, t0, t0 + 0.28);
  if (p <= 0) return null;
  return (
    <g opacity={p} transform={`translate(${x + (me ? w : 0)} ${y + h}) scale(${0.6 + 0.4 * p}) translate(${-(x + (me ? w : 0))} ${-(y + h)})`}>
      <rect x={x} y={y} width={w} height={h} rx={34} fill={me ? '#4d68d8' : '#353e6c'} />
      {children ?? (
        <g fill="#aab4e6" opacity={0.75}>
          <rect x={x + 26} y={y + h / 2 - 9} width={w * 0.62} height={18} rx={9} />
        </g>
      )}
    </g>
  );
};

const MiniPhoto: React.FC<{id: string}> = ({id}) => (
  <>
    <defs>
      <Grad id={`${id}g`} stops={[[0, '#5a2c22'], [1, '#e7975a']]} />
      <Glow id={`${id}l`} color="#ffd690" inner={0.8} />
    </defs>
    <rect width={1080} height={1300} fill={`url(#${id}g)`} />
    <circle cx={540} cy={300} r={520} fill={`url(#${id}l)`} />
    <Bokeh seed={9} n={10} colors={['#ffd690', '#ffb070']} rMin={30} rMax={90} opacity={0.35} area={[0, 0, 1080, 700]} />
    <Person look={OTHER} x={430} y={1500} s={1.6} armR={22} smile={1} />
    <Person look={HER} x={690} y={1500} s={1.6} armL={22} tilt={-9} smile={1} eyes="closed" />
  </>
);

const Chip: React.FC<{t: number; t0: number; y: number; label: string}> = ({t, t0, y, label}) => {
  const p = ease(t, t0, t0 + 0.2);
  if (p <= 0) return null;
  return (
    <g opacity={p}>
      <rect x={-70} y={y} width={140} height={34} rx={17} fill="#2a3160" />
      <text x={0} y={y + 24} textAnchor="middle" fontFamily="Montserrat, Arial" fontWeight={700} fontSize={18} fill="#aab4e6">{label}</text>
    </g>
  );
};

const Heart: React.FC<{x: number; y: number; s: number; c?: string}> = ({x, y, s, c = '#ff6b8a'}) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M 0 8 C -14 -6 -10 -18 0 -10 C 10 -18 14 -6 0 8 Z" fill={c} />
);

export const Movil: React.FC<S & {mode?: 'foto' | 'ella' | 'espera' | 'llamadas' | 'llamada'; name?: string}> = ({dur, mode = 'foto', name = 'Mamá'}) => {
  const t = useT();
  const float = Math.sin(t * 1.4) * 8;
  const typing = mode === 'foto' ? t > 3.0 && t < 3.9 : mode === 'ella' ? t > 0.15 && t < 0.6 : t > 2.6 && t < 3.3;
  return (
    <Cam dur={dur} z={[1.02, 1.1]} y={[0, -40]}>
      <Svg>
        <defs>
          <Glow id="m2glow" color="#5a72ff" inner={0.45} />
          <clipPath id="m2photo">
            <rect x={-214} y={-186} width={298} height={372} rx={22} />
          </clipPath>
        </defs>
        <rect width={W} height={H} fill="#0b0f24" />
        <Bokeh seed={12} n={16} colors={['#3a4aa8', '#6a5ac8', '#2c3a80']} rMin={40} rMax={140} opacity={0.3} />
        <circle cx={540} cy={900} r={760} fill="url(#m2glow)" />
        <Hand x={560} y={1700 + float} s={1.7} part="back" sleeve="#1a2440" />
        <g transform={`translate(540 ${880 + float}) rotate(${-3 + Math.sin(t * 0.9) * 1.2})`}>
          <rect x={-290} y={-560} width={580} height={1120} rx={72} fill="#0d1020" stroke="#2c3256" strokeWidth={10} />
          <rect x={-262} y={-524} width={524} height={1048} rx={48} fill="#191f40" />
          <circle cx={-196} cy={-458} r={30} fill={mode === 'foto' ? '#e9a67c' : '#c96a5a'} />
          <rect x={-150} y={-472} width={180} height={24} rx={12} fill="#4a5488" />
          <path d="M -236 -470 L -250 -458 L -236 -446" stroke="#8a95cc" strokeWidth={6} fill="none" strokeLinecap="round" />
          <rect x={-262} y={-410} width={524} height={2} fill="#2c3462" />
          {mode === 'ella' && (
            <g>
              <Bubble t={t} t0={0.55} x={-232} y={-380} w={260} h={72} />
              <Bubble t={t} t0={1.05} x={-232} y={-292} w={150} h={72}>
                <Heart x={-157} y={-252} s={2.1} />
              </Bubble>
              <Bubble t={t} t0={1.6} x={-30} y={-196} w={262} h={72} me />
              <Bubble t={t} t0={2.1} x={70} y={-108} w={162} h={72} me>
                <Heart x={151} y={-68} s={2.1} c="#ffd0dc" />
              </Bubble>
              <Bubble t={t} t0={2.7} x={-232} y={-20} w={300} h={72} />
              <Bubble t={t} t0={3.2} x={-232} y={68} w={120} h={72}>
                <Heart x={-188} y={108} s={1.6} />
                <Heart x={-140} y={108} s={1.6} />
              </Bubble>
            </g>
          )}
          {mode === 'espera' && (
            <g>
              {['LUNES', 'JUEVES', 'DOMINGO', 'HACE 3 SEMANAS'].map((d, i) => (
                <g key={i}>
                  <Chip t={t} t0={0.25 + i * 0.6} y={-392 + i * 190} label={d} />
                  <Bubble t={t} t0={0.35 + i * 0.6} x={232 - [250, 200, 290, 160][i]} y={-340 + i * 190} w={[250, 200, 290, 160][i]} h={72} me />
                  {t > 0.6 + i * 0.6 && <path d={`M ${190} ${-254 + i * 190} l 8 8 l 14 -16 M ${206} ${-254 + i * 190} l 8 8 l 14 -16`} stroke="#8a95cc" strokeWidth={4} fill="none" />}
                </g>
              ))}
            </g>
          )}
          {mode === 'llamadas' && (
            <g fontFamily="Montserrat, Arial">
              {[0, 1, 2].map((i) => {
                const p = ease(t, 0.3 + i * 0.7, 0.55 + i * 0.7);
                return (
                  <g key={i} opacity={p} transform={`translate(${(1 - p) * 60} 0)`}>
                    <rect x={-236} y={-370 + i * 150} width={472} height={124} rx={24} fill="#252c55" />
                    <circle cx={-170} cy={-308 + i * 150} r={38} fill="#3a2a40" />
                    <path d={`M -186 ${-322 + i * 150} q 6 30 32 32 l 6 -10 l -12 -8 l -6 6 q -10 -6 -14 -14 l 6 -6 l -8 -12 Z`} fill="#ff5a6a" />
                    <text x={-110} y={-318 + i * 150} fontWeight={800} fontSize={34} fill="#ff6b7a">{name}</text>
                    <text x={-110} y={-280 + i * 150} fontWeight={600} fontSize={24} fill="#8a95cc">{['Llamada perdida · 18:02', 'Llamada perdida · 18:09', 'Llamada perdida · 18:31'][i]}</text>
                  </g>
                );
              })}
            </g>
          )}
          {mode === 'llamada' && (
            <g fontFamily="Montserrat, Arial">
              {[0, 1, 2].map((i) => {
                const k = ((t * 0.9 + i / 3) % 1);
                return <circle key={i} cx={0} cy={-200} r={110 + k * 170} fill="none" stroke="#7fe3a0" strokeWidth={6} opacity={(1 - k) * 0.5} />;
              })}
              <circle cx={0} cy={-200} r={110} fill="#3a4372" />
              <circle cx={0} cy={-232} r={40} fill="#aab4e6" />
              <path d="M -66 -130 Q 0 -200 66 -130 Z" fill="#aab4e6" />
              <text x={0} y={-10} textAnchor="middle" fontWeight={800} fontSize={56} fill="#ffffff">{name}</text>
              <text x={0} y={36} textAnchor="middle" fontWeight={600} fontSize={26} fill="#8a95cc">llamando…</text>
              <circle cx={-130} cy={300} r={58} fill="#ff4a5a" />
              <circle cx={130} cy={300 + Math.sin(t * 10) * 6} r={58} fill="#2fc46a" />
            </g>
          )}
          {mode === 'foto' && <Bubble t={t} t0={0.3} x={-232} y={-380} w={300} h={72} />}
          {mode === 'foto' && <Bubble t={t} t0={0.9} x={-232} y={-292} w={220} h={72} />}
          {mode === 'foto' && <Bubble t={t} t0={1.6} x={-232} y={-200} w={330} h={406}>
            <g transform="translate(-50 3)">
              <g clipPath="url(#m2photo)">
                <svg x={-214} y={-186} width={298} height={372} viewBox="0 0 1080 1300" preserveAspectRatio="xMidYMid slice">
                  <MiniPhoto id="m2p" />
                </svg>
              </g>
            </g>
          </Bubble>}
          {mode === 'foto' && <Bubble t={t} t0={2.5} x={-232} y={226} w={250} h={72} />}
          {typing && mode !== 'foto' && (
            <g>
              <rect x={mode === 'ella' ? -232 : -232} y={mode === 'ella' ? -380 : 380 - 40} width={150} height={64} rx={32} fill="#353e6c" />
              {[0, 1, 2].map((i) => (
                <circle key={i} cx={-192 + i * 36} cy={mode === 'ella' ? -348 : 372} r={9} fill="#dfe5ff" opacity={0.35 + 0.65 * Math.max(0, Math.sin(t * 8 - i))} />
              ))}
            </g>
          )}
          {typing && mode === 'foto' && (
            <g>
              <rect x={90} y={318} width={150} height={64} rx={32} fill="#4d68d8" />
              {[0, 1, 2].map((i) => (
                <circle key={i} cx={130 + i * 36} cy={350} r={9} fill="#dfe5ff" opacity={0.35 + 0.65 * Math.max(0, Math.sin(t * 8 - i))} />
              ))}
            </g>
          )}
          <g fill="#262d55" opacity={mode === 'llamada' || mode === 'llamadas' ? 0 : 1}>
            {Array.from({length: 3}).map((_, r) =>
              Array.from({length: 9}).map((__, c) => <rect key={`${r}-${c}`} x={-236 + c * 53 + (r === 2 ? 26 : 0)} y={410 + r * 40} width={42} height={30} rx={7} />),
            )}
          </g>
        </g>
        <Hand x={560} y={1700 + float} s={1.7} part="thumb" />
      </Svg>
      <Vignette id="m2vig" strength={0.6} />
    </Cam>
  );
};

// ---------- 3: el ojo ----------
export const Ojo: React.FC<S> = ({dur}) => {
  const t = useT();
  const blink = t > 1.35 && t < 1.75 ? Math.sin(((t - 1.35) / 0.4) * Math.PI) : 0;
  const dil = 70 + ease(t, 0.3, 2.2) * 18;
  const dx = Math.sin(t * 1.1) * 10;
  const wet = ease(t, 1.9, 3.0);
  const tear = lin(t, 2.7, dur + 0.4);
  const skin = '#e3b590';
  return (
    <Cam dur={dur} z={[1.0, 1.12]}>
      <Svg>
        <defs>
          <Grad id="o3skin" stops={[[0, '#d9a684'], [1, '#c48a6a']]} />
          <clipPath id="o3eye">
            <path d="M 190 990 Q 540 700 890 990 Q 540 1190 190 990 Z" />
          </clipPath>
        </defs>
        <rect width={W} height={H} fill="url(#o3skin)" />
        <g fill="#16171d">
          <polygon points="0,0 1080,0 1080,330 960,470 880,300 790,520 690,290 600,500 500,280 400,480 300,270 200,450 120,280 0,420" />
        </g>
        <path d="M 230 690 Q 520 560 860 680" stroke="#1b1a1f" strokeWidth={42} fill="none" strokeLinecap="round" />
        <path d="M 170 1000 Q 540 1260 910 1000" stroke="#b07656" strokeWidth={5} fill="none" opacity={0.6} />
        <g clipPath="url(#o3eye)">
          <rect x={150} y={650} width={780} height={600} fill="#f4f0ec" />
          <circle cx={540 + dx} cy={975} r={172} fill="#4b2f21" />
          <circle cx={540 + dx} cy={975} r={172} fill="none" stroke="#2a190f" strokeWidth={12} />
          {Array.from({length: 18}).map((_, i) => {
            const a = (i / 18) * Math.PI * 2;
            return <line key={i} x1={540 + dx + Math.cos(a) * 95} y1={975 + Math.sin(a) * 95} x2={540 + dx + Math.cos(a) * 160} y2={975 + Math.sin(a) * 160} stroke="#6d4630" strokeWidth={6} opacity={0.6} />;
          })}
          <circle cx={540 + dx} cy={975} r={dil} fill="#0b0b10" />
          <rect x={560 + dx} y={915} width={44} height={54} rx={6} fill="#f2a663" opacity={0.85} />
          <circle cx={612 + dx} cy={890} r={20} fill="#ffffff" opacity={0.9} />
          <circle cx={485 + dx} cy={1035} r={8} fill="#ffffff" opacity={0.7} />
          <rect x={150} y={640} width={780} height={(1200 - 640) * blink} fill={skin} />
          <path d="M 200 1060 Q 540 1150 880 1010" stroke="#ffffff" strokeWidth={14} fill="none" opacity={0.5 * wet} />
        </g>
        <path d="M 190 990 Q 540 700 890 990" stroke="#17110f" strokeWidth={16} fill="none" strokeLinecap="round" />
        {[0.15, 0.3, 0.45, 0.6, 0.75, 0.88].map((q, i) => {
          const x = mix(250, 850, q);
          const y = 990 - Math.sin(q * Math.PI) * 140 - 5;
          return <line key={i} x1={x} y1={y} x2={x + 18 + q * 20} y2={y - 46} stroke="#17110f" strokeWidth={8} strokeLinecap="round" />;
        })}
        {tear > 0 && (
          <g opacity={1 - lin(t, dur - 0.1, dur + 0.5)}>
            <path d={`M 780 1065 Q 790 ${1065 + tear * 200} 800 ${1065 + tear * 420}`} stroke="#ffffff" strokeWidth={10} fill="none" opacity={0.35} strokeLinecap="round" />
            <ellipse cx={800} cy={1080 + tear * 420} rx={18} ry={24} fill="#dfe8ff" opacity={0.85} />
          </g>
        )}
      </Svg>
      <AbsoluteFill style={{background: 'rgba(80,110,255,0.16)', mixBlendMode: 'multiply'}} />
      <Vignette id="o3vig" strength={0.55} />
    </Cam>
  );
};

// ---------- 4: recuerdo del café ----------
export const Cafe: React.FC<S> = ({dur}) => {
  const t = useT();
  const cast = useCast();
  const reach = ease(t, 0.9, 2.6) * 50;
  const laugh = Math.sin(t * 3.2) * 4;
  return (
    <Cam dur={dur} z={[1.0, 1.08]} y={[0, 30]}>
      <Svg>
        <defs>
          <Grad id="c4wall" stops={[[0, '#7c4232'], [1, '#43221a']]} />
          <Grad id="c4cone" stops={[[0, '#ffd690', 0.42], [1, '#ffd690', 0]]} />
          <Glow id="c4bulb" color="#fff0c0" inner={1} />
        </defs>
        <rect width={W} height={H} fill="url(#c4wall)" />
        <rect x={110} y={290} width={860} height={820} fill="#2f1712" />
        <Bokeh seed={41} n={26} colors={['#ffcf7a', '#ff9f5a', '#ffe2a8']} rMin={18} rMax={70} opacity={0.45} area={[110, 290, 860, 820]} drift={14} />
        <g fill="#26120d">
          <rect x={100} y={280} width={880} height={18} />
          <rect x={100} y={1100} width={880} height={22} />
          <rect x={100} y={280} width={18} height={840} />
          <rect x={962} y={280} width={18} height={840} />
          <rect x={531} y={290} width={18} height={820} />
        </g>
        <polygon points="450,400 630,400 960,1420 120,1420" fill="url(#c4cone)" />
        <line x1={540} y1={0} x2={540} y2={340} stroke="#1a0c08" strokeWidth={6} />
        <path d="M 488 340 L 592 340 L 640 405 L 440 405 Z" fill="#24110b" />
        <circle cx={540} cy={410} r={70} fill="url(#c4bulb)" />
        <rect x={150} y={1010} width={190} height={330} rx={30} fill="#2a150e" />
        <rect x={740} y={1010} width={190} height={330} rx={30} fill="#2a150e" />
        <Person look={HIM} x={300} y={1600} s={1.15} armR={8 + reach} armL={2} smile={0.8} noLegs />
        <Person look={HER} x={780} y={1600} s={1.15} armL={8 + reach} armR={2} smile={1} eyes="closed" tilt={-5 + laugh} noLegs />
        <ellipse cx={540} cy={1372} rx={330} ry={46} fill="#3a2016" />
        <ellipse cx={540} cy={1362} rx={330} ry={42} fill="#4b2a1c" />
        <rect x={525} y={1400} width={30} height={330} fill="#24120c" />
        <ellipse cx={540} cy={1730} rx={110} ry={20} fill="#24120c" />
        {[268, 322, 758, 812].map((x, i) => (
          <g key={i}>
            <rect x={x - 15} y={1410} width={30} height={300} rx={12} fill={i < 2 ? cast.him.pants : cast.her.pants} />
            <ellipse cx={x} cy={1712} rx={26} ry={12} fill={i < 2 ? cast.him.shoes : cast.her.shoes} />
          </g>
        ))}
        {[420, 660].map((x, i) => (
          <g key={i}>
            <rect x={x - 26} y={1304} width={52} height={46} rx={8} fill="#f1e6d6" />
            <path d={`M ${x + 26} 1314 q 18 0 18 14 q 0 14 -18 14`} stroke="#f1e6d6" strokeWidth={7} fill="none" />
            {[0, 1].map((k) => (
              <path
                key={k}
                d={`M ${x - 8 + k * 16} 1290 q ${Math.sin(t * 2 + k) * 10} -20 0 -40 q ${-Math.sin(t * 2 + k) * 10} -20 0 -40`}
                stroke="#fff4e0"
                strokeWidth={5}
                fill="none"
                opacity={0.4}
                strokeLinecap="round"
              />
            ))}
          </g>
        ))}
      </Svg>
      <Memory id="c4mem" />
    </Cam>
  );
};

// ---------- 5: recuerdo del atardecer ----------
export const Atardecer: React.FC<S> = ({dur}) => {
  const t = useT();
  const ph = t * 6.5;
  return (
    <Cam dur={dur} z={[1.04, 1.0]}>
      <Svg>
        <defs>
          <Grad id="a5sky" stops={[[0, '#d8746c'], [0.5, '#f4a46e'], [1, '#ffd89c']]} />
          <Glow id="a5sun" color="#fff3cf" inner={1} />
        </defs>
        <rect width={W} height={H} fill="url(#a5sky)" />
        <circle cx={540} cy={1180} r={420} fill="url(#a5sun)" />
        <circle cx={540} cy={1180} r={150} fill="#fff1c8" opacity={0.9} />
        <Birds x={120} y={420} n={6} color="#6a3440" />
        <g transform={`translate(${-t * 14} 0)`}>
          <Skyline seed={51} base={1460} minH={260} maxH={620} color="#d4846e" win="#ffe6b5" lit={0.07} x1={1300} />
        </g>
        <g transform={`translate(${-t * 34} 0)`}>
          <Skyline seed={52} base={1460} minH={120} maxH={380} color="#ad5f58" win="#ffe0a8" lit={0.09} x1={1400} />
        </g>
        <rect x={0} y={1456} width={W} height={464} fill="#6b3740" />
        <rect x={0} y={1456} width={W} height={12} fill="#8d4a4c" />
        <Person look={HIM} x={360} y={1800} s={1.25} walk={ph} armR={22} armL={4} smile={0.9} />
        <Person look={HER} x={720} y={1800} s={1.25} walk={ph + Math.PI} armL={22} armR={4} smile={1} eyes="closed" tilt={-4} />
        <Bokeh seed={53} n={10} colors={['#fff0c8', '#ffc98a']} rMin={50} rMax={150} opacity={0.18} />
      </Svg>
      <Memory id="a5mem" />
    </Cam>
  );
};

// Foto "Polaroid" con un recuerdo dentro.
export const Polaroid: React.FC<{x: number; y: number; rot: number; s?: number; kind: 'sunset' | 'cafe' | 'abuela' | 'playa'; id: string; blur?: number}> = ({x, y, rot, s = 1, kind, id, blur = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {blur > 0 && (
      <defs>
        <filter id={`${id}bl`}>
          <feGaussianBlur stdDeviation={blur} />
        </filter>
      </defs>
    )}
    <rect x={-262} y={-312} width={540} height={650} rx={6} fill="#000000" opacity={0.3} />
    <rect x={-270} y={-320} width={540} height={650} rx={6} fill="#f3efe7" />
    <svg x={-240} y={-290} width={480} height={480} viewBox="0 0 1080 1080" preserveAspectRatio="xMidYMid slice">
      <g filter={blur > 0 ? `url(#${id}bl)` : undefined}>
      {kind === 'abuela' ? (
        <>
          <rect width={1080} height={1080} fill="#c98f5a" />
          <rect x={0} y={700} width={1080} height={380} fill="#8a5a3a" />
          <rect x={620} y={160} width={300} height={360} fill="#e8c890" />
          <Person look={ABUELA} x={420} y={1250} s={1.25} armR={40} smile={1} eyes="closed" />
          <Person look={{...HIM, hair: 'curly'}} x={720} y={1180} s={0.75} armL={40} smile={1} />
        </>
      ) : kind === 'playa' ? (
        <>
          <rect width={1080} height={1080} fill="#ffcf9a" />
          <rect y={600} width={1080} height={200} fill="#3fa7b5" />
          <rect y={800} width={1080} height={300} fill="#f1d3a0" />
          <circle cx={540} cy={560} r={120} fill="#fff1c8" />
          <Person look={HIM} x={400} y={1080} s={1.05} armR={22} smile={0.9} />
          <Person look={HER} x={700} y={1080} s={1.05} armL={22} smile={1} eyes="closed" tilt={-4} />
        </>
      ) : kind === 'sunset' ? (
        <>
          <defs>
            <Grad id={`${id}s`} stops={[[0, '#d8746c'], [0.5, '#f4a46e'], [1, '#ffd89c']]} />
          </defs>
          <rect width={1080} height={1080} fill={`url(#${id}s)`} />
          <circle cx={540} cy={760} r={130} fill="#fff1c8" />
          <Skyline seed={51} base={860} minH={160} maxH={420} color="#c4766a" win="#ffe6b5" lit={0.05} />
          <rect y={856} width={1080} height={230} fill="#6b3740" />
          <Person look={HIM} x={400} y={1080} s={1.05} armR={22} smile={0.9} />
          <Person look={HER} x={700} y={1080} s={1.05} armL={22} smile={1} eyes="closed" tilt={-4} />
        </>
      ) : (
        <>
          <rect width={1080} height={1080} fill="#5e2f22" />
          <Bokeh seed={41} n={12} colors={['#ffcf7a', '#ff9f5a']} rMin={20} rMax={60} opacity={0.5} area={[0, 0, 1080, 600]} />
          <Person look={HIM} x={330} y={1250} s={1.2} armR={40} smile={0.8} />
          <Person look={HER} x={750} y={1250} s={1.2} armL={40} smile={1} eyes="closed" />
        </>
      )}
      </g>
    </svg>
  </g>
);

// ---------- 6: la foto ----------
const Desk: React.FC<{id: string; warm?: number}> = ({id, warm = 0}) => (
  <>
    <defs>
      <Glow id={`${id}lamp`} color={mixC('#9fb3ff', '#ffcf8a', warm)} inner={0.32} />
    </defs>
    <rect width={W} height={H} fill="#222741" />
    {Array.from({length: 13}).map((_, i) => (
      <rect key={i} x={0} y={i * 160} width={W} height={4} fill="#1a1e34" />
    ))}
    <circle cx={760} cy={520} r={1000} fill={`url(#${id}lamp)`} />
  </>
);

export const Foto: React.FC<S & {kind?: 'sunset' | 'abuela' | 'playa'; blur?: number}> = ({dur, kind = 'sunset', blur = 0}) => {
  const t = useT();
  const p = ease(t, 0, dur);
  const y = mix(1180, 960, p);
  const r = mix(-9, -3, p);
  const dust = rng(66);
  return (
    <Cam dur={dur} z={[1.0, 1.06]}>
      <Svg>
        <Desk id="f6" />
        <Polaroid x={250} y={1420} rot={14} s={0.7} kind="cafe" id="f6b" />
        <g transform={`translate(540 ${y}) rotate(${r})`}>
          <Hand x={60} y={430} s={1.5} part="back" sleeve="#1c2742" />
          <Polaroid x={0} y={0} rot={0} kind={kind} id={`f6a${kind}`} blur={blur} />
          <Hand x={60} y={430} s={1.5} part="thumb" />
        </g>
        {Array.from({length: 26}).map((_, i) => (
          <circle key={i} cx={dust() * W + Math.sin(t + i) * 20} cy={(dust() * H - t * 30 * (0.5 + dust())) % H} r={2 + dust() * 3} fill="#dfe6ff" opacity={0.35} />
        ))}
      </Svg>
      <Vignette id="f6vig" strength={0.65} />
    </Cam>
  );
};

// ---------- 7: caminando solo bajo la lluvia ----------
export const Lluvia: React.FC<S> = ({dur}) => {
  const t = useT();
  return (
    <Cam dur={dur} z={[1.0, 1.05]}>
      <Svg>
        <defs>
          <Grad id="l7sky" stops={[[0, '#0e1330'], [1, '#273063']]} />
          <Grad id="l7gr" stops={[[0, '#1d2347'], [1, '#0b0e20']]} />
          <Glow id="l7lamp" color="#ffd99a" inner={0.45} />
          <Grad id="l7ref" stops={[[0, '#ffd99a', 0.35], [1, '#ffd99a', 0]]} />
          <filter id="l7blur">
            <feGaussianBlur stdDeviation={10} />
          </filter>
        </defs>
        <rect width={W} height={H} fill="url(#l7sky)" />
        <g transform={`translate(${-t * 20} 0)`}>
          <Skyline seed={71} base={1380} minH={420} maxH={900} color="#1f2752" win="#e9c98a" lit={0.3} x1={1300} />
        </g>
        <g transform={`translate(${-t * 55} 0)`}>
          <Skyline seed={72} base={1380} minH={160} maxH={520} color="#151b3b" win="#e9c98a" lit={0.3} x1={1500} />
        </g>
        <rect x={0} y={1376} width={W} height={544} fill="url(#l7gr)" />
        {[0, 1, 2, 3].map((k) => {
          const x = ((k * 480 - t * 150) % 1920 + 1920) % 1920 - 300;
          return (
            <g key={k}>
              <rect x={x - 6} y={860} width={12} height={520} fill="#0a0d1d" />
              <rect x={x - 30} y={850} width={60} height={18} rx={8} fill="#0a0d1d" />
              <circle cx={x} cy={880} r={200} fill="url(#l7lamp)" />
              <rect x={x - 22} y={1380} width={44} height={540} fill="url(#l7ref)" />
            </g>
          );
        })}
        <Bokeh seed={73} n={12} colors={['#ffd99a', '#8ea4ff']} rMin={20} rMax={60} opacity={0.2} area={[0, 300, 1080, 1000]} />
        {[0, 1].map((k) => {
          const x = 1250 - ((t * 260 + k * 700) % 1700);
          return (
            <g key={k} opacity={0.8}>
              <Person look={{...OTHER, coat: '#272d4a', pants: '#151827', hairC: '#0b0b10'}} x={x} y={1560} s={0.62} walk={t * 7 + k} shade={0.55} />
              <Umbrella x={x} y={1560 - 600 * 0.62} rx={110} color="#14182c" />
            </g>
          );
        })}
        <Rain seed={74} n={110} speed={1800} len={44} w={2} opacity={0.3} />
        <Person look={HIM} x={540} y={1760} s={1.35} walk={t * 5.2} eyes="down" smile={-0.4} armL={2} armR={2} shade={0.18} />
        <g filter="url(#l7blur)">
          {[0].map((k) => {
            const x = 1500 - ((t * 620 + 300) % 2600);
            return (
              <g key={k} opacity={0.92}>
                <Person look={{...HER, coat: '#202640', hairC: '#0b0b10', pants: '#10121e'}} x={x} y={2350} s={2.3} walk={t * 6} shade={0.75} view="back" />
                <Umbrella x={x} y={2350 - 590 * 2.3} rx={330} color="#0f1224" />
              </g>
            );
          })}
        </g>
        <Rain seed={75} n={90} speed={3000} len={90} w={3.5} opacity={0.35} />
      </Svg>
      <Vignette id="l7vig" strength={0.6} />
    </Cam>
  );
};

// ---------- 8: la ve con otro ----------
export const ConOtro: React.FC<S> = ({dur}) => {
  const t = useT();
  const lean = ease(t, 1.3, 3.0);
  return (
    <Cam dur={dur} z={[1.0, 1.1]} x={[0, -60]} y={[0, 30]}>
      <Svg>
        <defs>
          <Grad id="o8sky" stops={[[0, '#0e1330'], [1, '#262e5e']]} />
          <Grad id="o8shop" stops={[[0, '#ffd894'], [1, '#f1a056']]} />
          <Grad id="o8ref" stops={[[0, '#ffc77a', 0.45], [1, '#ffc77a', 0]]} />
          <Glow id="o8glow" color="#ffc77a" inner={0.4} />
        </defs>
        <rect width={W} height={H} fill="url(#o8sky)" />
        <Skyline seed={81} base={1520} minH={500} maxH={1000} color="#1b224a" win="#e9c98a" lit={0.28} x1={560} />
        <rect x={520} y={560} width={600} height={960} fill="#2a2032" />
        <rect x={560} y={850} width={480} height={640} fill="url(#o8shop)" />
        <g fill="#d78a48" opacity={0.6}>
          <rect x={580} y={1010} width={440} height={10} />
          <rect x={580} y={1180} width={440} height={10} />
          {[600, 660, 720, 840, 900, 960].map((x, i) => (
            <rect key={i} x={x} y={1010 - 40 - (i % 3) * 14} width={34} height={40 + (i % 3) * 14} />
          ))}
        </g>
        {Array.from({length: 8}).map((_, i) => (
          <path key={i} d={`M ${520 + i * 75} 700 L ${595 + i * 75} 700 L ${595 + i * 75} 790 Q ${557 + i * 75} 820 ${520 + i * 75} 790 Z`} fill={i % 2 ? '#efe2cc' : '#b8463f'} />
        ))}
        <rect x={510} y={690} width={620} height={14} fill="#7a2e2a" />
        <circle cx={800} cy={1250} r={520} fill="url(#o8glow)" />
        <rect x={0} y={1516} width={W} height={404} fill="#121630" />
        <rect x={560} y={1520} width={480} height={400} fill="url(#o8ref)" />
        <Person look={OTHER} x={720} y={1600} s={1.0} armR={24} smile={1} />
        <Person look={HER} x={880} y={1600} s={1.0} armL={24} smile={1} eyes="closed" tilt={-12 * lean + Math.sin(t * 3) * 2} />
        <Rain seed={82} n={120} speed={2000} len={50} w={2.2} opacity={0.32} />
        <g transform={`translate(0 ${Math.sin(t * 1.5) * 4})`}>
          <Person look={HIM} x={210} y={2080} s={2.05} view="back" shade={0.42} />
        </g>
        <Rain seed={83} n={70} speed={3200} len={100} w={3.5} opacity={0.3} />
      </Svg>
      <Vignette id="o8vig" strength={0.55} />
    </Cam>
  );
};

// ---------- 9: sonrisa forzada ----------
export const Cara: React.FC<S> = ({dur}) => {
  const t = useT();
  const sm = ease(t, 1.0, 2.4);
  const tear = lin(t, 2.2, dur + 0.3);
  const him = useCast().him;
  const skin = mixC(him.skin, '#9fb0e0', 0.22);
  const lid = t > 0.8 && t < 1.1 ? Math.sin(((t - 0.8) / 0.3) * Math.PI) : 0;
  return (
    <Cam dur={dur} z={[1.0, 1.12]} y={[0, 40]}>
      <Svg>
        <defs>
          <Grad id="k9bg" stops={[[0, '#121837'], [1, '#283266']]} />
        </defs>
        <rect width={W} height={H} fill="url(#k9bg)" />
        <Bokeh seed={91} n={18} colors={['#ffd58a', '#7f95ff', '#c8b7ff']} rMin={40} rMax={130} opacity={0.25} />
        <path d="M 0 1920 L 0 1640 Q 120 1470 400 1440 L 680 1440 Q 960 1470 1080 1640 L 1080 1920 Z" fill={mixC(him.coat, '#0c0f22', 0.25)} />
        <path d="M 440 1440 L 540 1620 L 640 1440 Z" fill="#dcd8d0" />
        <rect x={430} y={1180} width={220} height={280} fill={mixC(skin, '#000000', 0.12)} />
        <ellipse cx={212} cy={930} rx={42} ry={74} fill={skin} />
        <ellipse cx={868} cy={930} rx={42} ry={74} fill={skin} />
        <ellipse cx={540} cy={900} rx={330} ry={392} fill={skin} stroke="#8ea4ff" strokeWidth={6} strokeOpacity={0.35} />
        <g fill={him.hairC}>
          <ellipse cx={540} cy={530} rx={372} ry={225} />
          <polygon points="160,540 172,700 232,630 282,715 350,620 420,705 482,615 545,700 610,615 672,708 738,622 800,712 860,632 910,700 920,540" />
          <rect x={172} y={540} width={58} height={330} rx={24} />
          <rect x={850} y={540} width={58} height={330} rx={24} />
        </g>
        <path d="M 330 795 Q 400 770 470 752" stroke="#16171d" strokeWidth={15} fill="none" strokeLinecap="round" />
        <path d="M 610 752 Q 680 770 750 795" stroke="#16171d" strokeWidth={15} fill="none" strokeLinecap="round" />
        {[400, 680].map((x, i) => (
          <g key={i}>
            <ellipse cx={x} cy={872} rx={30} ry={36 * (1 - lid * 0.9)} fill="#16171d" />
            {lid < 0.5 && <circle cx={x + 10} cy={860} r={9} fill="#ffffff" opacity={0.9} />}
            <path d={`M ${x - 42} 852 Q ${x} 832 ${x + 42} 856`} stroke="#16171d" strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d={`M ${x - 32} 918 Q ${x} 928 ${x + 32} 916`} stroke="#d8e4ff" strokeWidth={5} fill="none" opacity={0.55 * ease(t, 0.4, 1.8)} strokeLinecap="round" />
          </g>
        ))}
        <path d="M 545 900 L 528 975 L 552 982" stroke="#b9886e" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={360} cy={1000} r={36} fill="#ef8a86" opacity={0.18} />
        <circle cx={720} cy={1000} r={36} fill="#ef8a86" opacity={0.18} />
        <path d={`M 478 ${1070 + sm * 4} Q 540 ${1060 + sm * 26} 602 ${1070 - sm * 6}`} stroke="#7b3b33" strokeWidth={8} fill="none" strokeLinecap="round" />
        {tear > 0 && (
          <g>
            <path d={`M 690 912 Q 700 ${912 + tear * 160} 712 ${912 + tear * 330}`} stroke="#d8e4ff" strokeWidth={8} fill="none" opacity={0.4} strokeLinecap="round" />
            <ellipse cx={712} cy={918 + tear * 330} rx={13} ry={18} fill="#e6eeff" opacity={0.9} />
          </g>
        )}
        <Rain seed={92} n={90} speed={2400} len={60} w={2.6} opacity={0.3} />
      </Svg>
      <AbsoluteFill style={{background: 'rgba(70,90,200,0.12)', mixBlendMode: 'multiply'}} />
      <Vignette id="k9vig" strength={0.6} />
    </Cam>
  );
};

// ---------- 10 y 13: calle en perspectiva ----------
type Pal = {sky: [string, string, string]; facL: string; facR: string; ground: string; road: string; win: string; lit: number; lamp: string; lampOn: number};
const NIGHT: Pal = {sky: ['#0d1230', '#1d2552', '#2a3262'], facL: '#1a2046', facR: '#1f264f', ground: '#232a4a', road: '#151a36', win: '#e9c98a', lit: 0.32, lamp: '#ffd99a', lampOn: 1};
const DAWN: Pal = {sky: ['#7f6a9c', '#f09a80', '#ffe2a8'], facL: '#6a5270', facR: '#5e4866', ground: '#9a7480', road: '#7d5e6e', win: '#ffe2b0', lit: 0.06, lamp: '#ffe2b0', lampOn: 0.15};

type P2 = [number, number];
const lp = (a: P2, b: P2, p: number): P2 => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p];
const VPY = 880;

const Calle: React.FC<{pal: Pal; id: string}> = ({pal, id}) => {
  const r = rng(101);
  const LQ = {front: [[0, 100], [0, 1430]] as [P2, P2], deep: [[445, 800], [445, 915]] as [P2, P2]};
  const RQ = {front: [[1080, 100], [1080, 1430]] as [P2, P2], deep: [[635, 800], [635, 915]] as [P2, P2]};
  const pt = (Q: typeof LQ, u: number, v: number) => lp(lp(Q.front[0], Q.deep[0], u), lp(Q.front[1], Q.deep[1], u), v);
  const us = Array.from({length: 18}).map((_, i) => 1 - Math.pow(0.84, i));
  const wins: React.ReactNode[] = [];
  [LQ, RQ].forEach((Q, qi) => {
    for (let i = 0; i < us.length - 1; i++) {
      const u0 = us[i] + (us[i + 1] - us[i]) * 0.25;
      const u1 = us[i] + (us[i + 1] - us[i]) * 0.7;
      for (let v = 0.06; v < 0.86; v += 0.085) {
        if (r() < pal.lit) {
          const a = pt(Q, u0, v);
          const b = pt(Q, u1, v);
          const c = pt(Q, u1, v + 0.045);
          const d = pt(Q, u0, v + 0.045);
          wins.push(<polygon key={`${qi}-${i}-${v}`} points={`${a} ${b} ${c} ${d}`} fill={pal.win} opacity={0.6 + r() * 0.4} />);
        } else r();
      }
    }
  });
  const lamps = [0.08, 0.3, 0.5, 0.65, 0.76].flatMap((u, k) => {
    const base = lp([110, 1600], [478, 912], u);
    const sc = (base[1] - VPY) / (1600 - VPY);
    return [-1, 1].map((side) => {
      const x = side === -1 ? base[0] : W - base[0];
      return (
        <g key={`${k}${side}`}>
          <rect x={x - 7 * sc} y={base[1] - 620 * sc} width={14 * sc} height={620 * sc} fill={mixC(pal.facL, '#000000', 0.4)} />
          <circle cx={x} cy={base[1] - 620 * sc} r={170 * sc} fill={`url(#${id}lamp)`} opacity={pal.lampOn} />
          <rect x={x - 18 * sc} y={base[1]} width={36 * sc} height={260 * sc} fill={`url(#${id}ref)`} opacity={pal.lampOn} />
        </g>
      );
    });
  });
  const dashes = Array.from({length: 12}).map((_, i) => {
    const a = 1 - Math.pow(0.8, i);
    const b = 1 - Math.pow(0.8, i + 0.5);
    const y0 = mix(1920, VPY + 25, a);
    const y1 = mix(1920, VPY + 25, b);
    const w0 = mix(14, 1, a);
    const w1 = mix(14, 1, b);
    return <polygon key={i} points={`${540 - w0},${y0} ${540 + w0},${y0} ${540 + w1},${y1} ${540 - w1},${y1}`} fill={mixC(pal.road, '#ffffff', 0.35)} />;
  });
  return (
    <>
      <defs>
        <Grad id={`${id}sky`} stops={[[0, pal.sky[0]], [0.5, pal.sky[1]], [1, pal.sky[2]]]} />
        <Glow id={`${id}lamp`} color={pal.lamp} inner={0.5} />
        <Grad id={`${id}ref`} stops={[[0, pal.lamp, 0.35], [1, pal.lamp, 0]]} />
      </defs>
      <rect width={W} height={H} fill={`url(#${id}sky)`} />
      <polygon points="0,1430 445,915 635,915 1080,1430 1080,1920 0,1920" fill={pal.ground} />
      <polygon points="120,1920 505,915 575,915 960,1920" fill={pal.road} />
      {dashes}
      <polygon points="0,100 445,800 445,915 0,1430" fill={pal.facL} />
      <polygon points="1080,100 635,800 635,915 1080,1430" fill={pal.facR} />
      <polygon points="445,800 445,915 470,915 470,812" fill={mixC(pal.facL, '#000000', 0.3)} />
      {wins}
      {lamps}
    </>
  );
};

export const SeAlejan: React.FC<S> = ({dur}) => {
  const t = useT();
  const p = ease(t, 0, dur + 0.5);
  const y = mix(1560, 1040, p);
  const s = mix(0.72, 0.24, p);
  const cx = mix(600, 552, p);
  return (
    <Cam dur={dur} z={[1.0, 1.06]}>
      <Svg>
        <Calle pal={NIGHT} id="s10" />
        <Person look={OTHER} x={cx - 72 * s} y={y} s={s} view="back" walk={t * 5} armR={18} />
        <Person look={HER} x={cx + 72 * s} y={y} s={s} view="back" walk={t * 5 + Math.PI} armL={18} />
        <Umbrella x={cx} y={y - 610 * s} rx={190 * s} color="#3a2d40" />
        <Rain seed={102} n={150} speed={2200} len={55} w={2.2} opacity={0.32} />
        <Person look={HIM} x={850} y={2020} s={1.9} view="back" shade={0.35} />
        <Rain seed={103} n={60} speed={3200} len={100} w={3.5} opacity={0.3} />
      </Svg>
      <Vignette id="s10vig" strength={0.6} />
    </Cam>
  );
};

// ---------- 11: guarda la foto ----------
export const Caja: React.FC<S> = ({dur}) => {
  const t = useT();
  const down = ease(t, 0, 1.7);
  const away = ease(t, 1.8, 2.5);
  const lid = ease(t, 2.4, 3.5);
  const py = mix(1560, 1170, down);
  const ps = mix(1.0, 0.82, down);
  return (
    <Cam dur={dur} z={[1.0, 1.05]}>
      <Svg>
        <Desk id="b11" warm={0.4} />
        <rect x={186} y={806} width={708} height={728} rx={10} fill="#000000" opacity={0.3} />
        <rect x={180} y={800} width={720} height={720} rx={10} fill="#b7865a" />
        <rect x={214} y={834} width={652} height={652} rx={6} fill="#6c4a30" />
        <rect x={300} y={1230} width={240} height={110} rx={6} fill="#e8d6ae" transform="rotate(-8 420 1285)" />
        <circle cx={740} cy={1370} r={44} fill="#c8604a" />
        <circle cx={740} cy={1370} r={16} fill="#6c4a30" />
        <g transform={`translate(540 ${py}) rotate(${mix(-7, -2, down)}) scale(${ps})`}>
          <g transform={`translate(0 ${away * 900})`}>
            <Hand x={60} y={430} s={1.5} part="back" sleeve="#1c2742" curl={away} />
          </g>
          <Polaroid x={0} y={0} rot={0} kind="sunset" id="b11a" />
          <g transform={`translate(0 ${away * 900})`}>
            <Hand x={60} y={430} s={1.5} part="thumb" />
          </g>
        </g>
        <g transform={`translate(0 ${mix(-1500, 0, lid)})`}>
          <rect x={186} y={806} width={708} height={728} rx={10} fill="#000000" opacity={0.25} />
          <rect x={170} y={790} width={740} height={740} rx={12} fill="#c99a6a" />
          <rect x={200} y={820} width={680} height={680} rx={8} fill="none" stroke="#a87a4e" strokeWidth={6} />
        </g>
      </Svg>
      <Vignette id="b11vig" strength={0.65} />
    </Cam>
  );
};

// ---------- 13: se va hacia el amanecer ----------
export const Amanecer: React.FC<S> = ({dur}) => {
  const t = useT();
  const p = ease(t, 0, dur + 0.6);
  const y = mix(1980, 1060, p);
  const s = mix(1.55, 0.3, p);
  return (
    <Cam dur={dur} z={[1.0, 1.05]}>
      <Svg>
        <defs>
          <Glow id="d13sun" color="#fff3d0" inner={1} />
        </defs>
        <Calle pal={DAWN} id="d13" />
        <circle cx={540} cy={860} r={560} fill="url(#d13sun)" />
        {[-1, 1].map((sd) =>
          [0.1, 0.24, 0.4].map((q, i) => (
            <polygon key={`${sd}${i}`} points={`540,860 ${540 + sd * 1400 * q},0 ${540 + sd * 1400 * (q + 0.06)},0`} fill="#fff3d0" opacity={0.08 + 0.03 * Math.sin(t * 1.5 + i)} />
          )),
        )}
        <Birds x={250} y={360} n={6} color="#5a3d55" speed={30} />
        <Person look={HIM} x={mix(560, 545, p)} y={y} s={s} view="back" walk={t * 5.4} shade={0.2} />
      </Svg>
      <AbsoluteFill style={{background: 'rgba(255,190,140,0.08)', mixBlendMode: 'screen'}} />
      <Vignette id="d13vig" strength={0.45} color="#2a1430" />
    </Cam>
  );
};

// ---------- parada de bus bajo la lluvia (se conocen) ----------
export const Parada: React.FC<S & {ella?: boolean}> = ({dur, ella = false}) => {
  const t = useT();
  const arrive = ease(t, 0.1, 1.9);
  const hx = mix(1250, 680, arrive);
  const look = ease(t, 1.9, 2.5);
  return (
    <Cam dur={dur} z={ella ? [1.0, 1.1] : [1.12, 1.0]} x={ella ? [0, -40] : [0, 0]}>
      <Svg>
        <defs>
          <Grad id={`p${ella ? 2 : 1}sky`} stops={[[0, '#0e1330'], [1, '#283163']]} />
          <Grad id={`p${ella ? 2 : 1}ad`} stops={[[0, '#ffe2a6'], [1, '#f2a25e']]} />
          <Glow id={`p${ella ? 2 : 1}glow`} color="#ffd59a" inner={0.45} />
          <Grad id={`p${ella ? 2 : 1}ref`} stops={[[0, '#ffd59a', 0.4], [1, '#ffd59a', 0]]} />
        </defs>
        <rect width={W} height={H} fill={`url(#p${ella ? 2 : 1}sky)`} />
        <Skyline seed={ella ? 131 : 131} base={1560} minH={400} maxH={950} color="#1d2550" win="#e9c98a" lit={0.3} />
        <Skyline seed={132} base={1560} minH={150} maxH={480} color="#141a39" win="#e9c98a" lit={0.3} />
        <Bokeh seed={133} n={12} colors={['#ffd59a', '#8ea4ff']} rMin={20} rMax={60} opacity={0.2} area={[0, 300, 1080, 1000]} />
        <rect x={0} y={1556} width={W} height={364} fill="#11152c" />
        <circle cx={830} cy={1300} r={460} fill={`url(#p${ella ? 2 : 1}glow)`} />
        <rect x={120} y={1060} width={840} height={500} fill="#8fa6ff" opacity={0.08} />
        <rect x={760} y={1080} width={170} height={440} rx={8} fill={`url(#p${ella ? 2 : 1}ad)`} />
        <rect x={775} y={1100} width={140} height={150} rx={6} fill="#ffffff" opacity={0.25} />
        <rect x={760} y={1560} width={170} height={300} fill={`url(#p${ella ? 2 : 1}ref)`} />
        <rect x={100} y={1020} width={880} height={44} rx={6} fill="#0b0e20" />
        <rect x={120} y={1060} width={12} height={500} fill="#0b0e20" />
        <rect x={948} y={1060} width={12} height={500} fill="#0b0e20" />
        <rect x={200} y={1420} width={480} height={22} rx={6} fill="#0b0e20" />
        <rect x={60} y={900} width={10} height={660} fill="#0b0e20" />
        <circle cx={65} cy={900} r={42} fill="#2f6bd8" />
        <rect x={45} y={890} width={40} height={20} rx={4} fill="#ffffff" opacity={0.85} />
        <Person look={HIM} x={400} y={1640} s={1.05} smile={ella ? 0.3 + look * 0.8 : 0} eyes={ella ? 'open' : 'down'} armR={ella ? 4 : 30} shade={0.1} />
        {!ella && <rect x={474} y={1222} width={28} height={46} rx={6} fill="#0d1020" stroke="#8ea4ff" strokeWidth={3} />}
        {ella && (
          <g>
            <Person look={HER} x={hx} y={1640} s={1.0} walk={arrive < 1 ? t * 7 : null} smile={look} eyes={look > 0.6 ? 'closed' : 'open'} tilt={-6 * look} armL={4} />
            <Umbrella x={hx + 20} y={1640 - 600} rx={150} color="#b8463f" opacity={1 - ease(t, 1.6, 2.1)} />
          </g>
        )}
        <Rain seed={134} n={140} speed={2200} len={55} w={2.4} opacity={0.32} />
      </Svg>
      <Vignette id={`p${ella ? 2 : 1}vig`} strength={0.55} />
    </Cam>
  );
};
