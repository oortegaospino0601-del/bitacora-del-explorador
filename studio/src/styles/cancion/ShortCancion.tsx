import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/fraunces/latin-600.css';
import '@fontsource/fraunces/latin-800.css';
import {Props, SentenceTiming, Word} from '../../types';
import {buildChunks} from '../../Captions';

// Estilo "historia de canción": ilustración plana cálida, subtítulos serif por
// palabras, mini reproductor arriba y flecha al botón LIVE en el cierre.

const SERIF = "'Fraunces', Georgia, serif";
const AMBER = '#f2b33d';
const CREAM = '#fbf1de';
const INK = '#1c120e';
const SKIN = '#c98f68';
const HAIR = '#1f1612';
const HOODIE = '#b5452f';
const PANTS = '#2a2430';
const HER_TOP = '#4f8f86';
const HER_HAIR = '#8a3b22';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t));
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- personajes ----------
type PersonProps = {x: number; y: number; s?: number; who: 'him' | 'her'; t: number; pose?: 'stand' | 'sit' | 'down' | 'phone' | 'reach' | 'up'; flip?: boolean; dim?: number; color?: string};
const Person: React.FC<PersonProps> = ({x, y, s = 1, who, t, pose = 'stand', flip = false, dim = 0, color}) => {
  const breathe = Math.sin(t * 2.2) * 3;
  const top = color ?? (who === 'him' ? HOODIE : HER_TOP);
  const headTilt = pose === 'down' ? 16 : pose === 'up' ? -12 : Math.sin(t * 0.9) * 2;
  const sit = pose === 'sit' || pose === 'down';
  const armL = pose === 'phone' ? 'M-38 -150 Q-10 -110 6 -168' : pose === 'reach' ? 'M38 -150 Q90 -150 130 -170' : 'M-38 -150 Q-52 -95 -46 -50';
  const armR = pose === 'reach' ? 'M-38 -150 Q-52 -95 -46 -50' : 'M38 -150 Q52 -95 46 -50';
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={1 - dim}>
      <ellipse cx={0} cy={4} rx={70} ry={12} fill="#000" opacity={0.25} />
      {/* piernas */}
      {sit ? (
        <>
          <path d="M-22 -60 L-22 -40 L40 -40 L40 0" stroke={PANTS} strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 -60 L14 -46 L64 -46 L64 0" stroke={PANTS} strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
        </>
      ) : who === 'him' ? (
        <>
          <rect x={-30} y={-62} width={24} height={62} rx={10} fill={PANTS} />
          <rect x={6} y={-62} width={24} height={62} rx={10} fill={PANTS} />
          <ellipse cx={-20} cy={0} rx={18} ry={7} fill="#e9e1d4" />
          <ellipse cx={20} cy={0} rx={18} ry={7} fill="#e9e1d4" />
        </>
      ) : (
        <>
          <rect x={-24} y={-52} width={18} height={52} rx={8} fill="#6b2f22" />
          <rect x={6} y={-52} width={18} height={52} rx={8} fill="#6b2f22" />
        </>
      )}
      {/* torso */}
      <g transform={`translate(0 ${sit ? 20 : 0}) translate(0 ${breathe * 0.4})`}>
        {who === 'him' ? (
          <path d="M-44 -175 Q-48 -110 -40 -55 L40 -55 Q48 -110 44 -175 Q0 -192 -44 -175 Z" fill={top} />
        ) : (
          <path d="M-36 -172 Q-40 -120 -54 -50 L54 -50 Q40 -120 36 -172 Q0 -186 -36 -172 Z" fill={top} />
        )}
        {who === 'him' && <path d="M-12 -178 L0 -140 L12 -178" fill="none" stroke={AMBER} strokeWidth={4} opacity={0.9} />}
        <path d={armL} stroke={top} strokeWidth={22} fill="none" strokeLinecap="round" />
        <path d={armR} stroke={top} strokeWidth={22} fill="none" strokeLinecap="round" />
        {pose === 'phone' && (
          <g transform="translate(6 -176) rotate(-12)">
            <rect x={-10} y={-26} width={22} height={40} rx={5} fill="#141018" />
            <rect x={-7} y={-22} width={16} height={30} rx={3} fill="#bfe3ff" opacity={0.85 + 0.15 * Math.sin(t * 6)} />
          </g>
        )}
        {/* cabeza */}
        <g transform={`translate(0 -196) rotate(${headTilt})`}>
          <rect x={-9} y={-6} width={18} height={18} fill={SKIN} />
          {who === 'her' && <path d="M-40 -40 Q-48 30 -30 64 L30 64 Q48 30 40 -40 Z" fill={HER_HAIR} />}
          <ellipse cx={0} cy={-36} rx={30} ry={34} fill={SKIN} />
          {who === 'him' ? (
            <path d="M-32 -40 Q-34 -76 0 -76 Q34 -76 32 -40 Q20 -56 0 -54 Q-18 -56 -32 -40 Z" fill={HAIR} />
          ) : (
            <path d="M-34 -30 Q-36 -78 0 -76 Q36 -78 34 -30 Q22 -58 0 -60 Q-22 -58 -34 -30 Z" fill={HER_HAIR} />
          )}
        </g>
      </g>
    </g>
  );
};

// ---------- utilidades de escena ----------
const Stars: React.FC<{t: number; n?: number; h?: number; color?: string}> = ({t, n = 40, h = 700, color = CREAM}) => (
  <g>
    {Array.from({length: n}).map((_, i) => (
      <circle key={i} cx={rnd(i) * 1080} cy={300 + rnd(i + 50) * h} r={1.5 + rnd(i + 9) * 2.5} fill={color} opacity={0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2 + i))} />
    ))}
  </g>
);

const Motes: React.FC<{t: number; n?: number; color?: string}> = ({t, n = 26, color = '#ffd99a'}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const y = 1150 - ((t * (18 + rnd(i) * 30) + rnd(i + 3) * 800) % 800);
      const x = rnd(i + 7) * 1080 + Math.sin(t + i) * 20;
      return <circle key={i} cx={x} cy={y} r={3 + rnd(i + 2) * 6} fill={color} opacity={0.35 * (0.5 + 0.5 * Math.sin(t * 3 + i))} />;
    })}
  </g>
);

const Window: React.FC<{x: number; y: number; w: number; h: number; t: number; night?: boolean; moon?: boolean}> = ({x, y, w, h, t, night = true, moon = true}) => (
  <g>
    <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} rx={8} fill="#241712" />
    <rect x={x} y={y} width={w} height={h} fill={night ? '#1d2747' : '#f0c27a'} />
    {moon && <circle cx={x + w * 0.72} cy={y + h * 0.25} r={Math.min(w, h) * 0.1} fill="#fff4cf" />}
    {moon && <circle cx={x + w * 0.72} cy={y + h * 0.25} r={Math.min(w, h) * 0.2} fill="#fff4cf" opacity={0.12} />}
    {Array.from({length: 7}).map((_, i) => {
      const bw = w / 7;
      const bh = h * (0.25 + rnd(i + 20) * 0.35);
      return (
        <g key={i}>
          <rect x={x + i * bw} y={y + h - bh} width={bw - 4} height={bh} fill={night ? '#121a33' : '#d9a35c'} />
          {Array.from({length: 4}).map((__, j) => (
            <rect key={j} x={x + i * bw + 8 + (j % 2) * 18} y={y + h - bh + 14 + Math.floor(j / 2) * 26} width={8} height={10} fill={AMBER} opacity={rnd(i * 5 + j) > 0.45 ? 0.5 + 0.4 * Math.sin(t + i * j) : 0} />
          ))}
        </g>
      );
    })}
    <rect x={x + w / 2 - 5} y={y} width={10} height={h} fill="#241712" />
  </g>
);

const Floor: React.FC<{y?: number; color?: string}> = ({y = 1040, color = '#2b1d17'}) => <rect x={0} y={y} width={1080} height={1920 - y} fill={color} />;

// ---------- escenas ----------
type SP = {t: number; d: number};

const Room: React.FC<SP> = ({t, d}) => {
  const party = 1 - ease(t / 1.8);
  return (
    <g>
      <Window x={560} y={380} w={380} h={420} t={t} />
      <Floor />
      {/* confeti de la fiesta que se apaga */}
      {Array.from({length: 30}).map((_, i) => (
        <rect key={i} x={rnd(i) * 1080} y={340 + ((t * 120 + rnd(i + 1) * 600) % 700)} width={12} height={20} fill={[AMBER, HOODIE, HER_TOP, CREAM][i % 4]} opacity={party * 0.8} transform={`rotate(${t * 90 + i * 30} ${rnd(i) * 1080} ${400})`} />
      ))}
      {/* cama */}
      <rect x={120} y={900} width={560} height={110} rx={18} fill="#4a3329" />
      <rect x={120} y={870} width={560} height={50} rx={18} fill="#e9dcc6" opacity={0.85} />
      <rect x={130} y={820} width={150} height={70} rx={26} fill="#f4ead8" />
      {/* lámpara */}
      <rect x={760} y={880} width={150} height={130} fill="#3a2820" />
      <path d="M800 790 L870 790 L890 850 L780 850 Z" fill="#e58a4e" />
      <rect x={830} y={850} width={10} height={30} fill="#2a1d17" />
      <ellipse cx={835} cy={880} rx={300} ry={260} fill="url(#glowA)" opacity={0.55 + 0.15 * Math.sin(t * 3)} />
      <Person x={420} y={1000} who="him" t={t} pose="down" />
      {/* el silencio "habla": ondas alrededor de la cabeza */}
      {[0, 1, 2].map((i) => {
        const p = ((t * 0.6 + i / 3) % 1);
        return <circle key={i} cx={430} cy={760} r={40 + p * 180} fill="none" stroke={CREAM} strokeWidth={3} opacity={(1 - p) * 0.5 * ease((t - 1.5) / 1)} />;
      })}
    </g>
  );
};

const Luxury: React.FC<SP> = ({t}) => {
  const a = ease(t / 0.6), b = ease((t - 0.9) / 0.6), c = ease((t - 1.8) / 0.6);
  return (
    <g>
      {/* luces de fiesta */}
      {Array.from({length: 6}).map((_, i) => (
        <path key={i} d={`M${180 * i + 90} 330 L${180 * i + 90 + Math.sin(t * 1.5 + i) * 160} 1040 L${180 * i + 190 + Math.sin(t * 1.5 + i) * 160} 1040 Z`} fill={[AMBER, '#e0603f', '#7fc7b8'][i % 3]} opacity={0.08 + 0.05 * Math.sin(t * 4 + i)} />
      ))}
      <Floor y={1040} color="#24170f" />
      {/* reloj que brilla */}
      <g transform={`translate(230 520) scale(${0.4 + 0.6 * a})`} opacity={a}>
        <rect x={-30} y={-120} width={60} height={240} rx={14} fill="#c9a04a" />
        <circle r={78} fill="#e7c46a" />
        <circle r={62} fill="#20180f" />
        <line x1={0} y1={0} x2={Math.sin(t * 3) * 40} y2={-Math.cos(t * 3) * 40} stroke={CREAM} strokeWidth={6} strokeLinecap="round" />
        <line x1={0} y1={0} x2={0} y2={-28} stroke={AMBER} strokeWidth={8} strokeLinecap="round" />
        <path d={`M ${60} -70 l 10 -26 l 10 26 l 26 10 l -26 10 l -10 26 l -10 -26 l -26 -10 Z`} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 6)} />
      </g>
      {/* moto */}
      <g transform={`translate(${interpolate(b, [0, 1], [1300, 760])} 960)`}>
        <circle cx={-110} cy={30} r={52} fill="none" stroke="#151015" strokeWidth={20} />
        <circle cx={110} cy={30} r={52} fill="none" stroke="#151015" strokeWidth={20} />
        <path d="M-110 30 L-40 -40 L60 -40 L110 30 M-40 -40 L-70 -80 L-30 -80 M60 -40 L90 -90" stroke="#151015" strokeWidth={14} fill="none" strokeLinejoin="round" />
        <path d="M-50 -40 Q10 -90 70 -40 Z" fill={HOODIE} />
        {[0, 1, 2].map((i) => <line key={i} x1={150 + i * 10} y1={-10 + i * 20} x2={220 + i * 30 + Math.sin(t * 20 + i) * 10} y2={-10 + i * 20} stroke={CREAM} strokeWidth={5} opacity={0.5 * b} strokeLinecap="round" />)}
      </g>
      {/* amigos que gritan su nombre */}
      <g opacity={c}>
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${120 + i * 110} 1040) translate(0 ${Math.abs(Math.sin(t * 5 + i)) * -14})`}>
            <rect x={-28} y={-170} width={56} height={170} rx={24} fill="#1a110d" />
            <circle cx={0} cy={-200} r={30} fill="#1a110d" />
            <path d={`M-22 -160 L${-50} ${-250 - (i % 2) * 20}`} stroke="#1a110d" strokeWidth={18} strokeLinecap="round" />
          </g>
        ))}
        <g transform={`translate(330 680) scale(${0.6 + 0.4 * c})`}>
          <path d="M-120 -50 Q-120 -90 -80 -90 L80 -90 Q120 -90 120 -50 L120 10 Q120 50 80 50 L-20 50 L-60 90 L-50 50 L-80 50 Q-120 50 -120 10 Z" fill={CREAM} />
          {[0, 1, 2].map((i) => <path key={i} d={`M${-70 + i * 50} -20 l 18 -30 l 18 30`} stroke={HOODIE} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(t * 8 + i)} />)}
        </g>
      </g>
      <Person x={560} y={1040} s={1.2} who="him" t={t} pose="stand" />
    </g>
  );
};

const Cold: React.FC<SP> = ({t}) => {
  const f = ease(t / 2.4);
  return (
    <g>
      <Floor y={1040} color="#1a2131" />
      {/* escarcha que entra desde los bordes */}
      {Array.from({length: 22}).map((_, i) => {
        const side = i % 2;
        const y = 340 + rnd(i) * 720;
        const len = (80 + rnd(i + 4) * 160) * f;
        const x0 = side ? 1080 : 0;
        const dir = side ? -1 : 1;
        return (
          <g key={i} stroke="#cfe6ff" strokeWidth={4} opacity={0.6} strokeLinecap="round">
            <line x1={x0} y1={y} x2={x0 + dir * len} y2={y + 10} />
            <line x1={x0 + dir * len * 0.5} y1={y + 5} x2={x0 + dir * len * 0.7} y2={y - 30} />
            <line x1={x0 + dir * len * 0.6} y1={y + 6} x2={x0 + dir * len * 0.8} y2={y + 40} />
          </g>
        );
      })}
      {/* nieve */}
      {Array.from({length: 40}).map((_, i) => (
        <circle key={i} cx={rnd(i + 30) * 1080 + Math.sin(t + i) * 30} cy={330 + ((t * (40 + rnd(i) * 40) + rnd(i + 1) * 720) % 720)} r={3 + rnd(i + 2) * 5} fill="#e8f2ff" opacity={0.7} />
      ))}
      <Person x={420} y={1040} s={1.25} who="him" t={t} pose="stand" color="#8a3a2e" />
      {/* vaho */}
      {[0, 1].map((i) => {
        const p = (t * 0.5 + i * 0.5) % 1;
        return <circle key={i} cx={470 + p * 70} cy={730 - p * 40} r={14 + p * 26} fill="#e8f2ff" opacity={(1 - p) * 0.5} />;
      })}
      {/* el hueco donde debería estar ella */}
      <g opacity={0.55 + 0.2 * Math.sin(t * 2)}>
        <ellipse cx={690} cy={745} rx={40} ry={44} fill="none" stroke="#cfe6ff" strokeWidth={4} strokeDasharray="12 12" />
        <path d="M645 805 Q630 920 615 1030 L765 1030 Q750 920 735 805 Z" fill="none" stroke="#cfe6ff" strokeWidth={4} strokeDasharray="12 12" />
      </g>
    </g>
  );
};

const Distance: React.FC<SP> = ({t}) => {
  const road = 'M260 1000 C 380 820, 700 900, 640 720 S 860 560, 820 470';
  return (
    <g>
      <Stars t={t} n={30} h={300} />
      <path d={road} fill="none" stroke="#3b2c33" strokeWidth={70} strokeLinecap="round" />
      <path d={road} fill="none" stroke={AMBER} strokeWidth={5} strokeDasharray="24 26" strokeDashoffset={-t * 60} opacity={0.7} />
      {/* casa de él */}
      <g transform="translate(60 820)">
        <rect width={300} height={240} fill="#3a2820" />
        <rect x={40} y={40} width={220} height={150} fill="#f0b766" />
        <Person x={150} y={190} s={0.62} who="him" t={t} pose="phone" />
      </g>
      {/* ciudad de ella, lejos */}
      <g transform="translate(680 330)">
        {[0, 1, 2, 3].map((i) => <rect key={i} x={i * 70} y={60 - rnd(i + 70) * 80} width={60} height={160 + rnd(i + 70) * 80} fill="#2c2440" />)}
        <rect x={60} y={90} width={160} height={110} fill="#f0b766" />
        <Person x={140} y={200} s={0.4} who="her" t={t} pose="phone" />
      </g>
      {/* mensajes que viajan despacio */}
      {[0, 1, 2].map((i) => {
        const p = ((t * 0.22 + i * 0.33) % 1);
        const x = interpolate(p, [0, 0.33, 0.66, 1], [300, 560, 700, 820]);
        const y = interpolate(p, [0, 0.33, 0.66, 1], [900, 860, 650, 470]);
        return (
          <g key={i} transform={`translate(${x} ${y - 50})`} opacity={Math.sin(p * Math.PI)}>
            <rect x={-56} y={-34} width={112} height={60} rx={20} fill={CREAM} />
            <path d="M-20 26 L-34 46 L-4 26 Z" fill={CREAM} />
            {[0, 1, 2].map((j) => <circle key={j} cx={-24 + j * 24} cy={-4} r={8} fill="#7a6a5c" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 4 + j))} />)}
          </g>
        );
      })}
    </g>
  );
};

const Fire: React.FC<SP> = ({t}) => {
  const sep = 70 + 150 * (0.5 + 0.5 * Math.sin(t * 2.1 - 1.6));
  return (
    <g>
      <Floor y={1040} color="#2a130c" />
      {Array.from({length: 9}).map((_, i) => {
        const x = 120 + i * 105;
        const h = 260 + 120 * Math.sin(t * 5 + i * 1.7) + rnd(i) * 120;
        return (
          <g key={i} opacity={0.85}>
            <path d={`M${x - 70} 1040 Q${x - 40} ${1040 - h * 0.6} ${x + Math.sin(t * 4 + i) * 30} ${1040 - h} Q${x + 40} ${1040 - h * 0.6} ${x + 70} 1040 Z`} fill="#e0603f" />
            <path d={`M${x - 40} 1040 Q${x - 20} ${1040 - h * 0.4} ${x + Math.sin(t * 5 + i) * 18} ${1040 - h * 0.65} Q${x + 24} ${1040 - h * 0.4} ${x + 40} 1040 Z`} fill={AMBER} />
          </g>
        );
      })}
      {Array.from({length: 24}).map((_, i) => (
        <circle key={i} cx={rnd(i) * 1080 + Math.sin(t * 2 + i) * 20} cy={1040 - ((t * (90 + rnd(i + 5) * 80) + rnd(i + 2) * 700) % 700)} r={3 + rnd(i + 1) * 4} fill="#ffd27a" />
      ))}
      <Person x={540 - sep} y={1040} s={1.2} who="him" t={t} pose="reach" />
      <Person x={540 + sep} y={1040} s={1.2} who="her" t={t} pose="reach" flip />
    </g>
  );
};

const Refuge: React.FC<SP> = ({t}) => {
  const calm = ease((t - 0.6) / 2.4);
  return (
    <g>
      <Floor y={1040} color="#22160f" />
      <ellipse cx={540} cy={800} rx={480} ry={420} fill="url(#glowA)" opacity={0.8} />
      {/* farol */}
      <rect x={530} y={340} width={20} height={180} fill="#3b2a22" />
      <path d="M490 520 L590 520 L570 590 L510 590 Z" fill="#ffd27a" />
      <Person x={450} y={1040} s={1.2} who="him" t={t} pose="stand" />
      <Person x={630} y={1040} s={1.2} who="her" t={t} pose="stand" flip />
      {/* pensamientos que dan vueltas y se calman */}
      {Array.from({length: 3}).map((_, i) => {
        const r = (60 + i * 26) * (1 - calm) + 6;
        const pts = Array.from({length: 40}).map((__, k) => {
          const a = (k / 40) * Math.PI * 2 * 1.5 + t * (3 - i);
          const rr = r * (0.7 + 0.3 * Math.sin(k * 0.8 + t * 4));
          return `${450 + Math.cos(a) * rr},${640 + Math.sin(a) * rr * 0.5}`;
        });
        return <polyline key={i} points={pts.join(' ')} fill="none" stroke={CREAM} strokeWidth={4} opacity={0.6 * (1 - calm)} />;
      })}
      <g opacity={calm}>
        <path d="M540 640 c -20 -30 -60 -10 -40 20 l 40 34 l 40 -34 c 20 -30 -20 -50 -40 -20 Z" fill="#e0603f" transform={`translate(0 ${Math.sin(t * 2) * 6})`} />
      </g>
    </g>
  );
};

const Mirror: React.FC<SP> = ({t}) => (
  <g>
    <rect x={0} y={300} width={1080} height={800} fill="#150e0b" opacity={0.5} />
    <Floor y={1060} color="#1d130f" />
    {/* espejo */}
    <path d="M560 1000 L560 520 Q560 380 720 380 Q880 380 880 520 L880 1000 Z" fill="#26324a" stroke="#c9a04a" strokeWidth={16} />
    <g opacity={0.95}>
      <Person x={720} y={990} s={0.92} who="him" t={t + 0.4} pose="down" color="#1a1520" />
      {/* pensamientos garabateados dentro del espejo */}
      {Array.from({length: 6}).map((_, i) => {
        const y = 470 + i * 70 + Math.sin(t * 2 + i) * 8;
        return <path key={i} d={`M${600 + rnd(i) * 40} ${y} q 30 -24 60 0 t 60 0 t 60 0`} fill="none" stroke="#9fb5d6" strokeWidth={4} opacity={0.35 + 0.3 * Math.sin(t * 3 + i)} />;
      })}
    </g>
    <path d="M590 430 L640 400 L600 520 Z" fill="#fff" opacity={0.08} />
    <Person x={330} y={1060} s={1.3} who="him" t={t} pose="stand" />
  </g>
);

const Call: React.FC<SP> = ({t}) => {
  const off = ease((t - 0.3) / 1.4);
  return (
    <g>
      {/* luces de fiesta que se apagan */}
      {Array.from({length: 14}).map((_, i) => (
        <circle key={i} cx={80 + i * 72} cy={360 + Math.sin(i) * 14} r={14} fill={[AMBER, '#e0603f', '#7fc7b8'][i % 3]} opacity={(1 - off) * 0.9 + 0.08} />
      ))}
      <path d={`M40 350 ${Array.from({length: 14}).map((_, i) => `L${80 + i * 72} ${360 + Math.sin(i) * 14}`).join(' ')} L1040 350`} stroke="#3b2c33" strokeWidth={3} fill="none" />
      <Window x={90} y={430} w={300} h={360} t={t} />
      {/* mano y teléfono */}
      <g transform={`translate(600 ${interpolate(ease(t / 0.8), [0, 1], [1300, 700])}) rotate(-6)`}>
        <rect x={-180} y={-300} width={360} height={680} rx={52} fill="#141018" />
        <rect x={-160} y={-270} width={320} height={620} rx={36} fill="#22314f" />
        <circle cx={0} cy={-120} r={70} fill="#e9dcc6" opacity={0.9} />
        <path d="M-45 -150 Q-48 -190 0 -190 Q48 -190 45 -150 Q30 -168 0 -166 Q-30 -168 -45 -150 Z" fill={HER_HAIR} />
        {[0, 1, 2].map((i) => {
          const p = (t * 0.7 + i / 3) % 1;
          return <circle key={i} cx={0} cy={-120} r={70 + p * 110} fill="none" stroke={AMBER} strokeWidth={4} opacity={(1 - p) * 0.8} />;
        })}
        <rect x={-110} y={30} width={220} height={18} rx={9} fill={CREAM} opacity={0.5} />
        <rect x={-70} y={64} width={140} height={14} rx={7} fill={CREAM} opacity={0.3} />
        <circle cx={0} cy={230} r={50} fill="#4caf72" />
        <path d="M-20 222 q 20 26 40 0" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" transform={`rotate(${Math.sin(t * 10) * 8} 0 230)`} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={-206} y={40 + i * 62} width={64} height={52} rx={26} fill={SKIN} />)}
        <rect x={150} y={150} width={56} height={130} rx={28} fill={SKIN} transform="rotate(-18 178 215)" />
        <path d="M-200 300 Q-120 420 120 330 L160 420 Q-60 560 -230 430 Z" fill={SKIN} />
        <path d="M-260 420 L-60 520 L-120 760 L-330 700 Z" fill={HOODIE} />
      </g>
    </g>
  );
};

const Bridge: React.FC<SP> = ({t}) => {
  const p = ease(t / 2.6);
  const arc = 'M180 820 Q540 520 900 820';
  return (
    <g>
      <Stars t={t} n={50} h={420} />
      <circle cx={540} cy={470} r={60} fill="#fff4cf" />
      <circle cx={540} cy={470} r={120} fill="#fff4cf" opacity={0.08} />
      {/* dos ciudades */}
      {[0, 1].map((side) => (
        <g key={side}>
          {Array.from({length: 4}).map((_, i) => {
            const x = side ? 760 + i * 80 : 20 + i * 80;
            const h = 200 + rnd(i + side * 10) * 160;
            return (
              <g key={i}>
                <rect x={x} y={1040 - h} width={70} height={h} fill="#231a2c" />
                {Array.from({length: 6}).map((__, j) => <rect key={j} x={x + 12 + (j % 2) * 28} y={1040 - h + 20 + Math.floor(j / 2) * 40} width={14} height={16} fill={AMBER} opacity={rnd(i * 7 + j + side) > 0.4 ? 0.7 : 0.1} />)}
              </g>
            );
          })}
        </g>
      ))}
      <Floor y={1040} color="#1a1320" />
      <path d={arc} fill="none" stroke={AMBER} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <path d={arc} fill="none" stroke="#ffe3a0" strokeWidth={40} strokeLinecap="round" opacity={0.15} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <Person x={interpolate(p, [0, 1], [210, 410])} y={interpolate(p, [0, 1], [820, 700])} s={0.42} who="him" t={t} pose="stand" />
      <Person x={interpolate(p, [0, 1], [870, 670])} y={interpolate(p, [0, 1], [820, 700])} s={0.42} who="her" t={t} pose="stand" flip />
      {p > 0.95 && <path d="M540 610 c -14 -22 -44 -8 -30 14 l 30 26 l 30 -26 c 14 -22 -16 -36 -30 -14 Z" fill="#e0603f" opacity={ease((t - 2.6) / 0.5)} />}
    </g>
  );
};

const Clock: React.FC<SP> = ({t}) => {
  const align = ease(t / 2.2);
  const hand = (base: number, target: number) => base + (target - base) * align;
  const glow = ease((t - 2.0) / 0.8);
  return (
    <g>
      <Stars t={t} n={40} h={700} color="#ffe7b0" />
      <circle cx={540} cy={620} r={420} fill="url(#glowA)" opacity={0.8 * glow} />
      <circle cx={540} cy={620} r={250} fill="#2a1d16" stroke="#c9a04a" strokeWidth={14} />
      {Array.from({length: 12}).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={540 + Math.sin(a) * 210} y1={620 - Math.cos(a) * 210} x2={540 + Math.sin(a) * 232} y2={620 - Math.cos(a) * 232} stroke={CREAM} strokeWidth={i % 3 ? 4 : 9} opacity={0.7} />;
      })}
      {[{b: -60, len: 130, w: 14}, {b: 200, len: 190, w: 9}, {b: 20, len: 210, w: 4}].map((h, i) => {
        const a = (hand(h.b + t * 40 * (i === 2 ? 3 : 0), 133) * Math.PI) / 180;
        return <line key={i} x1={540} y1={620} x2={540 + Math.sin(a) * h.len} y2={620 - Math.cos(a) * h.len} stroke={i === 2 ? AMBER : CREAM} strokeWidth={h.w} strokeLinecap="round" />;
      })}
      <circle cx={540} cy={620} r={14} fill={AMBER} />
      {/* señales: plumas de luz que caen */}
      {Array.from({length: 10}).map((_, i) => {
        const y = 320 + ((t * 50 + rnd(i) * 700) % 700);
        const x = 100 + rnd(i + 3) * 880 + Math.sin(t * 1.5 + i) * 40;
        return <ellipse key={i} cx={x} cy={y} rx={8} ry={22} fill="#fff1c9" opacity={0.6 * glow} transform={`rotate(${Math.sin(t * 2 + i) * 40} ${x} ${y})`} />;
      })}
      <Floor y={1050} color="#1f1510" />
      <Person x={540} y={1050} s={0.85} who="him" t={t} pose="up" />
    </g>
  );
};

const Together: React.FC<SP> = ({t}) => {
  const close = ease(t / 2.5);
  return (
    <g>
      <rect x={0} y={300} width={1080} height={800} fill="url(#warm)" />
      <ellipse cx={540} cy={720} rx={460} ry={380} fill="url(#glowA)" opacity={0.9 + 0.1 * Math.sin(t * 2)} />
      {/* siluetas de perfil, frente a frente */}
      <g transform={`translate(${interpolate(close, [0, 1], [80, 190])} 1100)`}>
        <path d="M0 0 L0 -150 Q-10 -230 40 -280 Q20 -300 30 -340 Q40 -420 120 -430 Q200 -432 220 -370 Q226 -340 222 -320 L250 -280 L228 -270 Q236 -255 226 -248 Q232 -236 222 -228 Q228 -205 200 -200 Q180 -198 176 -170 Q178 -140 220 -120 Q330 -80 340 0 Z" fill="#2a1a12" />
      </g>
      <g transform={`translate(${interpolate(close, [0, 1], [1000, 890])} 1100) scale(-1 1)`}>
        <path d="M0 0 L0 -150 Q-10 -230 40 -280 Q20 -300 30 -340 Q40 -420 120 -430 Q200 -432 220 -370 Q226 -340 222 -320 L250 -280 L228 -270 Q236 -255 226 -248 Q232 -236 222 -228 Q228 -205 200 -200 Q180 -198 176 -170 Q178 -140 220 -120 Q330 -80 340 0 Z" fill="#2a1a12" />
        <path d="M30 -340 Q20 -250 -20 -170 Q20 -150 60 -160 Q90 -260 70 -330 Z" fill="#2a1a12" />
      </g>
      <Motes t={t} n={34} />
    </g>
  );
};

const Outro: React.FC<SP> = ({t}) => (
  <g>
    <rect x={0} y={0} width={1080} height={1120} fill="url(#dusk)" />
    <Stars t={t} n={30} h={200} />
    <rect x={80} y={380} width={920} height={720} fill="#2a1a12" />
    <rect x={80} y={380} width={920} height={40} fill="#b5452f" />
    {Array.from({length: 13}).map((_, i) => <circle key={i} cx={110 + i * 72} cy={455 + Math.sin(i * 0.7) * 8} r={9} fill="#fff1c9" opacity={0.5 + 0.5 * Math.sin(t * 3 + i)} />)}
    <rect x={160} y={500} width={760} height={500} fill="#e9b768" />
    <rect x={535} y={500} width={10} height={500} fill="#2a1a12" />
    <Person x={360} y={990} s={0.8} who="him" t={t} pose="phone" />
    <Person x={720} y={990} s={0.8} who="her" t={t} pose="phone" flip />
    <Motes t={t} n={20} color="#fff1c9" />
  </g>
);

const SCENES: Record<string, React.FC<SP>> = {room: Room, luxury: Luxury, cold: Cold, distance: Distance, fire: Fire, refuge: Refuge, mirror: Mirror, call: Call, bridge: Bridge, clock: Clock, together: Together, outro: Outro};

const BG: Record<string, [string, string]> = {
  room: ['#2b2236', '#1f1712'],
  luxury: ['#3a2418', '#1a100c'],
  cold: ['#22324c', '#121a29'],
  distance: ['#262036', '#191321'],
  fire: ['#4a2014', '#1c0d08'],
  refuge: ['#4a3122', '#1d130e'],
  mirror: ['#1f1a24', '#120d0b'],
  call: ['#2e2230', '#181012'],
  bridge: ['#1f1b38', '#120f1e'],
  clock: ['#2a2036', '#16101c'],
  together: ['#5a3a22', '#2a1a12'],
  outro: ['#2a1d2e', '#1a110d'],
};

// ---------- reproductor ----------
const Player: React.FC<{t: number; total: number; song: string; artist: string}> = ({t, total, song, artist}) => {
  const p = Math.min(1, t / total);
  const beat = (t * 140) / 60; // pulso de trap lento
  const bars = Array.from({length: 14}).map((_, i) => {
    const kick = Math.pow(Math.max(0, Math.cos((beat % 1) * Math.PI)), 6);
    const v = 0.25 + 0.35 * Math.abs(Math.sin(t * (3 + i * 0.7) + i * 1.3)) + 0.4 * kick * (1 - Math.abs(i - 6.5) / 8);
    return Math.min(1, v);
  });
  return (
    <div style={{position: 'absolute', left: 250, top: 196, width: 580, height: 96, borderRadius: 26, background: 'rgba(24,15,11,0.72)', border: `2px solid rgba(242,179,61,0.55)`, boxShadow: '0 10px 30px rgba(0,0,0,0.35)', padding: '14px 26px', boxSizing: 'border-box', fontFamily: SERIF}}>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 16, height: 40}}>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 4, height: 34, width: 150}}>
          {bars.map((v, i) => <div key={i} style={{width: 6, height: 6 + v * 28, borderRadius: 3, background: i % 3 === 0 ? CREAM : AMBER}} />)}
        </div>
        <div style={{fontSize: 33, fontWeight: 800, color: CREAM, whiteSpace: 'nowrap', lineHeight: 1}}>
          {song} <span style={{color: AMBER}}>· {artist}</span>
        </div>
      </div>
      <div style={{position: 'relative', marginTop: 14, height: 6, borderRadius: 3, background: 'rgba(251,241,222,0.18)'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p * 100}%`, borderRadius: 3, background: AMBER}} />
        <div style={{position: 'absolute', left: `calc(${p * 100}% - 9px)`, top: -6, width: 18, height: 18, borderRadius: 9, background: CREAM}} />
      </div>
    </div>
  );
};

// ---------- subtítulos ----------
const Subs: React.FC<{timings: SentenceTiming[]}> = ({timings}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunks = React.useMemo(() => buildChunks(timings).map((c) => c), [timings]);
  const cur = chunks.find((c) => t >= c.start - 0.03 && t < c.end);
  if (!cur) return null;
  const pop = spring({frame: frame - Math.round(cur.start * fps), fps, config: {damping: 16, stiffness: 170, mass: 0.6}});
  const words: Word[] = cur.words;
  const len = words.map((w) => w.w).join(' ').length;
  const fontSize = len > 22 ? 64 : len > 16 ? 74 : 86;
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 1135, display: 'flex', justifyContent: 'center', opacity: Math.min(1, pop * 1.6), transform: `translateY(${(1 - pop) * 16}px)`}}>
      <div style={{background: 'rgba(28,18,14,0.82)', borderRadius: 26, padding: '14px 32px', textAlign: 'center', maxWidth: 900}}>
        {words.map((w, i) => {
          const active = t >= w.start && t < w.end + 0.02;
          return (
            <span key={i} style={{fontFamily: SERIF, fontWeight: 800, fontSize, lineHeight: 1.15, color: active ? AMBER : CREAM, marginRight: i < words.length - 1 ? '0.28em' : 0}}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- flecha al LIVE ----------
const LiveArrow: React.FC<{t: number}> = ({t}) => {
  const a = ease(t / 0.5);
  const bob = Math.sin(t * 6) * 16;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g opacity={a} transform={`translate(${bob} ${-bob})`} filter="url(#glow)">
        <path d="M380 1500 L215 1665 L270 1720 L150 1750 L180 1630 L235 1685 L400 1520 Z" fill="#f4ecdf" stroke={AMBER} strokeWidth={12} strokeLinejoin="round" />
      </g>
    </svg>
  );
};

// ---------- composición ----------
export const ShortCancion: React.FC<Props> = ({spec, timings, totalSeconds, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const anySpec = spec as unknown as {song?: string; artist?: string; sentences: {scene: {type: string}}[]};
  const FADE = 0.35;

  return (
    <AbsoluteFill style={{background: '#1a110d'}}>
      <Audio src={staticFile(audioFile)} />
      {timings.map((tm, i) => {
        const type = anySpec.sentences[i]?.scene?.type ?? 'room';
        const start = tm.sceneStart;
        const end = i === timings.length - 1 ? totalSeconds + 1 : timings[i + 1].sceneStart + FADE;
        if (t < start - 0.01 || t > end) return null;
        const local = t - start;
        const op = i === 0 ? 1 : interpolate(local, [0, FADE], [0, 1], clamp);
        const Comp = SCENES[type] ?? Room;
        const [c1, c2] = BG[type] ?? BG.room;
        const zoom = 1 + 0.03 * Math.min(1, local / Math.max(1, end - start));
        return (
          <AbsoluteFill key={i} style={{opacity: op}}>
            <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 38%, ${c1} 0%, ${c2} 75%)`}} />
            <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{transform: `scale(${zoom})`, transformOrigin: '50% 40%'}}>
              <defs>
                <linearGradient id="warm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#8a5a33" />
                  <stop offset="1" stopColor="#e8a85a" />
                </linearGradient>
                <radialGradient id="glowA">
                  <stop offset="0" stopColor="#ffd28a" stopOpacity={0.45} />
                  <stop offset="0.55" stopColor="#ffc06a" stopOpacity={0.14} />
                  <stop offset="1" stopColor="#ffb867" stopOpacity={0} />
                </radialGradient>
                <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2a1f3a" />
                  <stop offset="1" stopColor="#7a3f3a" />
                </linearGradient>
              </defs>
              <Comp t={local} d={end - start} />
            </svg>
            {/* fundido a oscuro hacia la zona baja (subtítulos y UI de TikTok) */}
            <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(26,17,13,0.9) 62%, #1a110d 70%)'}} />
          </AbsoluteFill>
        );
      })}
      <Player t={t} total={totalSeconds} song={anySpec.song ?? spec.title} artist={anySpec.artist ?? ''} />
      <Subs timings={timings} />
      {timings.length > 0 && t >= timings[timings.length - 1].sceneStart && <LiveArrow t={t - timings[timings.length - 1].sceneStart} />}
    </AbsoluteFill>
  );
};
