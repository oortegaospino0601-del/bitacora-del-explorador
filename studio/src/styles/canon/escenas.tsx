import React from 'react';
import {AMBER, C, Person, Pose, Skyline, StreetLamp, clamp01, lerp, rnd} from '../cancion/kit';

// Escenas de «Canonizado» (Nsqk). Mismo trazo y personajes de la serie del reproductor,
// con atmósfera propia: noche de avenida en violeta profundo, luz de farol de sodio y
// dorado de "santo" (halo, rayos, vitral). Los celulares y los directos están presentes
// en todas las escenas (flashes, pantallas en vivo, corazones, notificaciones), siempre
// con pantallas genéricas sin texto ni logos.
// Cámaras propias de este video: retroceso de steadicam, grúa que sube sobre la procesión,
// entrada a la pantalla del directo, travelling bajo por la alfombra, golpe de zoom cómico,
// macro que recorre el brazo y se abre, cámara al hombro con sacudidas, inclinación 3D
// hacia la pantalla gigante, espiral hacia el halo y alejamiento que revela el vitral.

export type SP = {t: number; d: number};

export const K = {
  sky0: '#140e26',
  sky1: '#2b1a40',
  sky2: '#4d2a4a',
  street: '#211726',
  street2: '#160f1b',
  walk: '#34243a',
  bld: '#21183a',
  bld2: '#2c2048',
  gold: '#f2b53a',
  goldL: '#ffe3a1',
  goldD: '#b9802a',
  sodium: '#f39a3e',
  ruby: '#b8334a',
  cobalt: '#2f4f9e',
  emerald: '#2f8a6a',
  violet: '#6b3f8f',
  crowd: '#120b19',
  crowd2: '#1d1326',
  live: '#e8384f',
  screen: '#f6efe2',
  cream: '#fbf1de',
};

// ---------- utilidades ----------
export const ease3 = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
// cámara: centro (x,y) visto en (540,720) con escala y giro
export const view = (x: number, y: number, s: number, r = 0) => `translate(540 720) rotate(${r}) scale(${s}) translate(${-x} ${-y})`;

// paso de caminata seguro (pecho fuera)
export const walk = (t: number, sp = 1): Pose => {
  const w = Math.sin(t * 7.2 * sp);
  return {legL: w * 16, legR: -w * 16, armL: 10 - w * 16, armR: -10 + w * 16, elbowL: -12, elbowR: 12};
};
export const bob = (t: number, sp = 1) => Math.abs(Math.sin(t * 7.2 * sp)) * -7;

// ---------- definiciones ----------
export const KDefs: React.FC = () => (
  <defs>
    <linearGradient id="kSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={K.sky0} />
      <stop offset="0.55" stopColor={K.sky1} />
      <stop offset="1" stopColor={K.sky2} />
    </linearGradient>
    <linearGradient id="kStreet" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={K.walk} />
      <stop offset="1" stopColor={K.street2} />
    </linearGradient>
    <radialGradient id="kGold">
      <stop offset="0" stopColor="#fff3cf" stopOpacity={0.95} />
      <stop offset="0.3" stopColor="#ffd77a" stopOpacity={0.55} />
      <stop offset="1" stopColor="#f2b53a" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="kGoldSoft">
      <stop offset="0" stopColor="#ffd894" stopOpacity={0.6} />
      <stop offset="0.5" stopColor="#ffc670" stopOpacity={0.18} />
      <stop offset="1" stopColor="#ffb860" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="kScreenGlow">
      <stop offset="0" stopColor="#fff8ea" stopOpacity={0.8} />
      <stop offset="0.4" stopColor="#ffe9c4" stopOpacity={0.22} />
      <stop offset="1" stopColor="#ffe9c4" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="kFlash">
      <stop offset="0" stopColor="#ffffff" stopOpacity={1} />
      <stop offset="0.25" stopColor="#fff6e0" stopOpacity={0.7} />
      <stop offset="1" stopColor="#fff6e0" stopOpacity={0} />
    </radialGradient>
    <linearGradient id="kRay" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffe9b0" stopOpacity={0.55} />
      <stop offset="1" stopColor="#ffd27a" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="kDoor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fff2c8" />
      <stop offset="1" stopColor="#f2b53a" />
    </linearGradient>
    <linearGradient id="kCarpet" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#7a2232" />
      <stop offset="1" stopColor="#b8334a" />
    </linearGradient>
    <linearGradient id="kShadeUp" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#0e0a12" stopOpacity={0} />
      <stop offset="1" stopColor="#0e0a12" stopOpacity={0.75} />
    </linearGradient>
    <filter id="kBlur8" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" />
    </filter>
    <filter id="kBlur20" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="20" />
    </filter>
  </defs>
);

// ---------- piezas ----------
export const Halo: React.FC<{x: number; y: number; r?: number; t: number; o?: number; tilt?: number}> = ({x, y, r = 58, t, o = 1, tilt = 0}) => {
  if (o <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`} opacity={o}>
      <ellipse cx={0} cy={0} rx={r * 3.2} ry={r * 2.4} fill="url(#kGoldSoft)" opacity={0.75 + 0.15 * Math.sin(t * 3)} />
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.3} fill="none" stroke={K.goldL} strokeWidth={16} opacity={0.35} filter="url(#kBlur8)" />
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.3} fill="none" stroke={K.gold} strokeWidth={9} />
      <ellipse cx={0} cy={-1} rx={r} ry={r * 0.3} fill="none" stroke="#fff3cf" strokeWidth={3} opacity={0.9} />
      {[0, 1, 2].map((i) => {
        const a = t * 1.6 + i * 2.1;
        return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.3} r={5} fill="#fffaf0" opacity={0.5 + 0.5 * Math.sin(t * 4 + i)} />;
      })}
    </g>
  );
};

// rayos de luz dorada detrás de alguien
export const Rays: React.FC<{x: number; y: number; t: number; o?: number; n?: number; len?: number; spin?: number}> = ({x, y, t, o = 1, n = 16, len = 1300, spin = 4}) => (
  <g transform={`translate(${x} ${y}) rotate(${t * spin})`} opacity={o}>
    {Array.from({length: n}).map((_, i) => {
      const a = (i / n) * 360;
      const w = 60 + rnd(i) * 70;
      return <path key={i} d={`M0 0 L${-w / 2} ${-len} L${w / 2} ${-len} Z`} fill="url(#kRay)" transform={`rotate(${a})`} opacity={0.35 + 0.25 * Math.sin(t * 1.5 + i)} />;
    })}
  </g>
);

export const HeartShape: React.FC<{x: number; y: number; s?: number; c?: string; o?: number; rot?: number}> = ({x, y, s = 1, c = K.live, o = 1, rot = 0}) => (
  <path transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} d="M0 14 C-26 -6 -18 -28 0 -14 C18 -28 26 -6 0 14 Z" fill={c} opacity={o} />
);

const STAR = 'M0 -16 L4.5 -5 L16 -5 L7 2 L10 14 L0 7 L-10 14 L-7 2 L-16 -5 L-4.5 -5 Z';
const REACT_C = [K.live, '#ff8fa3', K.gold, '#ffd77a', '#ff6f61'];

// reacciones que suben (corazones y estrellas)
export const Reactions: React.FC<{x: number; y: number; t: number; n?: number; rise?: number; spread?: number; s?: number; seed?: number; o?: number}> = ({x, y, t, n = 10, rise = 420, spread = 90, s = 1, seed = 0, o = 1}) => (
  <g opacity={o}>
    {Array.from({length: n}).map((_, i) => {
      const k = i + seed * 19;
      const p = (t * (0.45 + rnd(k) * 0.3) + rnd(k + 3)) % 1;
      const hx = x + Math.sin(p * 7 + k) * spread * 0.45 + (rnd(k + 1) - 0.5) * spread;
      const hy = y - p * rise;
      const sc = s * (0.7 + rnd(k + 4) * 0.7) * (0.6 + 0.4 * Math.sin(Math.PI * Math.min(1, p * 1.4)));
      const op = Math.sin(Math.PI * p);
      return i % 4 === 3 ? (
        <path key={i} d={STAR} transform={`translate(${hx} ${hy}) scale(${sc})`} fill={K.gold} opacity={op} />
      ) : (
        <HeartShape key={i} x={hx} y={hy} s={sc} c={REACT_C[k % REACT_C.length]} o={op} rot={Math.sin(t * 3 + k) * 14} />
      );
    })}
  </g>
);

// burbujas de comentario sin texto (avatar + líneas)
export const Comments: React.FC<{x: number; y: number; w: number; h: number; t: number; speed?: number; seed?: number; dark?: boolean; note?: boolean}> = ({x, y, w, h, t, speed = 60, seed = 0, dark = true, note = false}) => {
  const step = 62;
  const rows = Math.ceil(h / step) + 2;
  const off = (t * speed) % step;
  const firstIdx = Math.floor((t * speed) / step);
  return (
    <g>
      {Array.from({length: rows}).map((_, j) => {
        const idx = firstIdx + j;
        const cy = y + h - j * step - off + step;
        if (cy < y + 10 || cy > y + h + 20) return null;
        const fade = clamp01((cy - y) / 90);
        const bw = w * (0.45 + rnd(idx + seed) * 0.45);
        return (
          <g key={j} opacity={fade}>
            <circle cx={x + 18} cy={cy - 16} r={15} fill={REACT_C[(idx + seed) % REACT_C.length]} opacity={0.9} />
            <rect x={x + 42} y={cy - 34} width={bw} height={38} rx={16} fill={dark ? 'rgba(20,12,24,0.55)' : 'rgba(255,255,255,0.75)'} />
            <rect x={x + 58} y={cy - 22} width={bw * 0.55} height={6} rx={3} fill={dark ? '#f6efe2' : '#7a6a80'} opacity={0.85} />
            <rect x={x + 58} y={cy - 11} width={bw * 0.32} height={6} rx={3} fill={dark ? '#f6efe2' : '#7a6a80'} opacity={0.5} />
            {note && idx % 2 === 0 && (
              <g transform={`translate(${x + 42 + bw - 24} ${cy - 15})`}>
                <ellipse cx={-4} cy={6} rx={7} ry={5} fill={K.gold} transform="rotate(-20 -4 6)" />
                <rect x={1} y={-14} width={3.5} height={20} fill={K.gold} />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

// insignia roja de "en vivo" (sin texto): píldora roja con punto blanco y barras
export const LiveBadge: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={0} y={0} width={86} height={34} rx={17} fill={K.live} />
    <circle cx={20} cy={17} r={7} fill="#fff" opacity={0.6 + 0.4 * Math.sin(t * 6)} />
    <rect x={36} y={11} width={36} height={5} rx={2.5} fill="#fff" opacity={0.9} />
    <rect x={36} y={20} width={24} height={4} rx={2} fill="#fff" opacity={0.6} />
  </g>
);

// pantalla de transmisión genérica (marco de celular)
export const LiveScreen: React.FC<{x: number; y: number; w: number; h: number; t: number; rot?: number; children?: React.ReactNode; comments?: boolean; hearts?: boolean; note?: boolean; id: string; bg?: string}> = ({x, y, w, h, t, rot = 0, children, comments = true, hearts = true, note = false, id, bg = '#2b1a40'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <ellipse cx={0} cy={0} rx={w * 1.1} ry={h * 0.75} fill="url(#kScreenGlow)" opacity={0.6} />
    <rect x={-w / 2 - 14} y={-h / 2 - 14} width={w + 28} height={h + 28} rx={46} fill="#0e0a12" />
    <clipPath id={id}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} />
    </clipPath>
    <g clipPath={`url(#${id})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={bg} />
      {children}
      <rect x={-w / 2} y={h / 2 - h * 0.42} width={w} height={h * 0.42} fill="url(#kShadeUp)" />
      {comments && <Comments x={-w / 2 + 18} y={h / 2 - h * 0.4} w={w * 0.62} h={h * 0.36} t={t} seed={3} note={note} />}
      {hearts && <Reactions x={w / 2 - 54} y={h / 2 - 50} t={t} n={9} rise={h * 0.6} spread={50} s={1.1} />}
    </g>
    <LiveBadge x={-w / 2 + 22} y={-h / 2 + 24} t={t} />
    <g transform={`translate(${w / 2 - 92} ${-h / 2 + 24})`}>
      <rect x={0} y={0} width={70} height={34} rx={17} fill="rgba(0,0,0,0.45)" />
      <ellipse cx={20} cy={17} rx={10} ry={6} fill="none" stroke="#fff" strokeWidth={3} />
      <circle cx={20} cy={17} r={3} fill="#fff" />
      <rect x={36} y={14} width={24} height={6} rx={3} fill="#fff" opacity={0.85} />
    </g>
    <rect x={-40} y={-h / 2 - 4} width={80} height={14} rx={7} fill="#0e0a12" />
  </g>
);

// mano + celular levantado (silueta de público), con destello ocasional
export const RaisedPhone: React.FC<{x: number; y: number; s?: number; t: number; rot?: number; seed?: number; flash?: boolean; live?: boolean; c?: string; phase?: number}> = ({x, y, s = 1, t, rot = 0, seed = 0, flash = true, live = false, c = K.crowd, phase}) => {
  const fl = flash ? (t * 0.55 + (phase ?? rnd(seed + 9))) % 1 : 1;
  const fo = fl < 0.07 ? Math.sin((fl / 0.07) * Math.PI) : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot + Math.sin(t * 1.3 + seed) * 3}) scale(${s})`}>
      <rect x={-16} y={-10} width={32} height={150} rx={16} fill={c} />
      <rect x={-34} y={-104} width={68} height={120} rx={12} fill="#0b0810" />
      <rect x={-28} y={-98} width={56} height={108} rx={8} fill={K.screen} />
      <rect x={-28} y={-98} width={56} height={108} rx={8} fill={K.gold} opacity={0.18 + 0.1 * Math.sin(t * 2 + seed)} />
      <circle cx={0} cy={-58} r={13} fill="#7a5a8a" opacity={0.55} />
      <rect x={-14} y={-44} width={28} height={38} rx={10} fill="#7a5a8a" opacity={0.55} />
      {live && <circle cx={-17} cy={-86} r={6} fill={K.live} opacity={0.6 + 0.4 * Math.sin(t * 6 + seed)} />}
      <path d="M-24 -8 Q-34 -40 -30 -70 L-18 -70 Q-20 -40 -10 -8 Z" fill={c} />
      {fo > 0 && <circle cx={0} cy={-110} r={120} fill="url(#kFlash)" opacity={fo} />}
      {fo > 0.3 && <path d="M0 -170 L6 -116 L60 -110 L6 -104 L0 -50 L-6 -104 L-60 -110 L-6 -116 Z" fill="#fff" opacity={fo} />}
    </g>
  );
};

// silueta de espaldas del público (cabeza y hombros)
export const Back: React.FC<{x: number; y: number; s?: number; c?: string; hair?: number}> = ({x, y, s = 1, c = K.crowd, hair = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-110 200 Q-110 40 -40 20 L40 20 Q110 40 110 200 Z" fill={c} />
    <rect x={-20} y={-10} width={40} height={40} fill={c} />
    {hair % 3 === 1 ? <path d="M-50 -40 Q-60 60 -46 90 L46 90 Q60 60 50 -40 Z" fill={c} /> : null}
    <ellipse cx={0} cy={-40} rx={46} ry={54} fill={c} />
    {hair % 3 === 2 && <circle cx={0} cy={-96} r={20} fill={c} />}
  </g>
);

// burbuja de notificación genérica (icono redondo + líneas)
export const Notif: React.FC<{x: number; y: number; w?: number; s?: number; o?: number; icon?: 'heart' | 'star' | 'eye' | 'bubble'; dark?: boolean}> = ({x, y, w = 330, s = 1, o = 1, icon = 'heart', dark = false}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={-w / 2 + 6} y={-34} width={w} height={76} rx={26} fill="#000" opacity={0.2} />
    <rect x={-w / 2} y={-40} width={w} height={76} rx={26} fill={dark ? 'rgba(30,19,36,0.92)' : 'rgba(255,248,236,0.95)'} />
    <circle cx={-w / 2 + 40} cy={-2} r={22} fill={icon === 'heart' ? K.live : icon === 'star' ? K.gold : icon === 'eye' ? K.violet : '#e07a5f'} />
    {icon === 'heart' && <HeartShape x={-w / 2 + 40} y={0} s={0.55} c="#fff" />}
    {icon === 'star' && <path d={STAR} transform={`translate(${-w / 2 + 40} -1) scale(0.75)`} fill="#fff" />}
    {icon === 'eye' && (
      <g>
        <ellipse cx={-w / 2 + 40} cy={-2} rx={12} ry={7} fill="none" stroke="#fff" strokeWidth={3} />
        <circle cx={-w / 2 + 40} cy={-2} r={3} fill="#fff" />
      </g>
    )}
    {icon === 'bubble' && <rect x={-w / 2 + 28} y={-12} width={24} height={18} rx={6} fill="#fff" />}
    <rect x={-w / 2 + 76} y={-20} width={w * 0.5} height={10} rx={5} fill={dark ? '#f6efe2' : '#4a3a52'} opacity={0.85} />
    <rect x={-w / 2 + 76} y={0} width={w * 0.34} height={9} rx={4.5} fill={dark ? '#f6efe2' : '#4a3a52'} opacity={0.45} />
  </g>
);

// mosca de caricatura (envidia/críticas) con su "zumbido"
export const Fly: React.FC<{x: number; y: number; s?: number; t: number; rot?: number; seed?: number; bubble?: boolean}> = ({x, y, s = 1, t, rot = 0, seed = 0, bubble = false}) => {
  const flap = Math.sin(t * 60 + seed) * 0.5 + 0.5;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={-6} cy={-16} rx={18} ry={9 + flap * 4} fill="#dfe7f2" opacity={0.55} transform={`rotate(${-30 - flap * 20} -6 -10)`} />
      <ellipse cx={10} cy={-16} rx={18} ry={9 + flap * 4} fill="#dfe7f2" opacity={0.55} transform={`rotate(${30 + flap * 20} 10 -10)`} />
      <ellipse cx={0} cy={0} rx={22} ry={15} fill="#2a2433" />
      <circle cx={20} cy={-4} r={11} fill="#2a2433" />
      <circle cx={25} cy={-8} r={6} fill="#b8334a" />
      <circle cx={17} cy={-10} r={5} fill="#b8334a" />
      {bubble && (
        <g transform="translate(-10 -62)">
          <rect x={-46} y={-26} width={92} height={42} rx={14} fill="#5a4e66" />
          <path d="M-8 16 L0 30 L8 16 Z" fill="#5a4e66" />
          <path d="M-30 -6 l8 -8 l8 8 l8 -8 l8 8 l8 -8 l8 8" stroke="#c9bfd3" strokeWidth={3.5} fill="none" strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
};

// noche de avenida (cielo, edificios, farolas, banqueta)
export const Avenue: React.FC<{t: number; y?: number; lamps?: boolean; children?: React.ReactNode; shift?: number}> = ({t, y = 1180, lamps = true, children, shift = 0}) => (
  <g>
    <rect x={-1200} y={-600} width={3500} height={y + 640} fill="url(#kSky)" />
    {Array.from({length: 26}).map((_, i) => (
      <circle key={i} cx={-300 + rnd(i + 2) * 1700} cy={-100 + rnd(i + 8) * 480} r={1.5 + rnd(i) * 2} fill="#f2e6ff" opacity={0.25 + 0.35 * Math.sin(t * 2 + i)} />
    ))}
    <g transform={`translate(${-shift * 0.3} 0)`}>
      <g transform="translate(-300 0)">
        <Skyline y={y - 40} t={t} color="#24193f" win={K.goldL} seed={4} lit={0.4} h={1.6} />
      </g>
      <g transform="translate(820 0)">
        <Skyline y={y - 40} t={t} color="#24193f" win={K.goldL} seed={7} lit={0.4} h={1.5} />
      </g>
    </g>
    <g transform={`translate(${-shift * 0.6} 0)`}>
      <g transform="translate(-160 0)">
        <Skyline y={y} t={t} color={K.bld2} win={K.gold} seed={1} lit={0.35} h={1.1} />
      </g>
      <g transform="translate(980 0)">
        <Skyline y={y} t={t} color={K.bld2} win={K.gold} seed={2} lit={0.35} h={1.1} />
      </g>
    </g>
    <rect x={-1200} y={y} width={3500} height={1400} fill="url(#kStreet)" />
    <rect x={-1200} y={y} width={3500} height={10} fill="#4a3550" />
    {lamps && (
      <g transform={`translate(${-shift} 0)`}>
        <StreetLamp x={-60} y={y + 20} t={t} h={600} />
        <StreetLamp x={1000} y={y + 20} t={t + 1} h={600} />
      </g>
    )}
    {children}
  </g>
);

// confeti dorado / polvo de luz
export const Dust: React.FC<{t: number; n?: number; x0?: number; x1?: number; y0?: number; y1?: number; seed?: number; o?: number}> = ({t, n = 24, x0 = 0, x1 = 1080, y0 = 300, y1 = 1300, seed = 0, o = 1}) => (
  <g opacity={o}>
    {Array.from({length: n}).map((_, i) => {
      const k = i + seed * 11;
      const x = x0 + rnd(k) * (x1 - x0) + Math.sin(t * 0.9 + k) * 18;
      const y = y0 + ((((rnd(k + 2) * (y1 - y0) - t * (20 + rnd(k + 5) * 30)) % (y1 - y0)) + (y1 - y0)) % (y1 - y0));
      const r = 2 + rnd(k + 7) * 4;
      return <circle key={i} cx={x} cy={y} r={r} fill={K.goldL} opacity={0.4 + 0.5 * Math.abs(Math.sin(t * 2.5 + k))} />;
    })}
  </g>
);

// ---------- 1. SALIDA (gancho): sale por la puerta dorada y los celulares lo apuntan ----------
export const Salida: React.FC<SP> = ({t, d}) => {
  // retroceso de steadicam: la cámara va hacia atrás mientras él avanza hacia ella
  const k = ease3(t / d);
  const sway = Math.sin(t * 1.7) * 8;
  const s = lerp(1.32, 1.0, k);
  const pz = lerp(0.82, 1.08, easeOut(t / d)); // él crece al acercarse
  const py = lerp(1050, 1110, k);
  return (
    <g transform={view(540 + sway, lerp(700, 760, k), s, Math.sin(t * 1.1) * 1.2)}>
      <Avenue t={t} y={1110} lamps={false} />
      {/* fachada y puerta con luz dorada */}
      <rect x={180} y={420} width={720} height={690} fill="#2a1d3c" />
      <rect x={180} y={420} width={720} height={26} fill="#3b2a52" />
      <Rays x={540} y={760} t={t} n={18} len={1100} o={0.9} />
      <rect x={370} y={560} width={340} height={550} rx={170} ry={170} fill="url(#kDoor)" />
      <rect x={370} y={760} width={340} height={350} fill="url(#kDoor)" />
      <ellipse cx={540} cy={800} rx={420} ry={420} fill="url(#kGold)" opacity={0.65 + 0.1 * Math.sin(t * 3)} />
      <path d="M370 1110 L710 1110 L900 1400 L180 1400 Z" fill="#ffd77a" opacity={0.22} />
      {/* él, caminando hacia la cámara, a contraluz */}
      <g transform={`translate(540 ${py + bob(t, 0.8)}) scale(${pz})`}>
        <Person x={0} y={0} s={1.02} who="him" t={t} pose={walk(t, 0.8)} />
        <Halo x={0} y={-440} r={60} t={t} o={0.55 + 0.45 * seg(t, 0.6, 2)} />
      </g>
      <Dust t={t} n={30} x0={200} x1={880} y0={400} y1={1200} />
      {/* celulares que le apuntan desde el primer fotograma y disparan flashes */}
      {[
        [175, 960, 22, 0, 0.99],
        [905, 930, -24, 1, 0.9],
        [250, 1240, 12, 2, 0.8],
        [830, 1260, -12, 3, 0.95],
        [60, 1180, 30, 4, 0.7],
        [1020, 1160, -30, 5, 0.6],
      ].map(([x, y, r, i, ph]) => (
        <RaisedPhone key={i} x={x} y={y - easeOut(t / 1.2) * 30} s={1.1} t={t * 1.6} rot={r} seed={i * 3 + 1} phase={ph} live={i === 1 || i === 2} />
      ))}
    </g>
  );
};

// ---------- 2. PROCESIÓN: grúa que sube sobre la multitud con los celulares en alto ----------
export const Procesion: React.FC<SP> = ({t, d}) => {
  const k = ease3(t / d);
  const walkX = lerp(380, 700, t / d);
  return (
    <g transform={view(lerp(520, 560, k), lerp(1000, 780, k), lerp(1.25, 0.95, k))}>
      <Avenue t={t} y={1050} shift={t * 30} />
      {/* fila del fondo */}
      {Array.from({length: 9}).map((_, i) => (
        <g key={`b${i}`}>
          <Back x={-60 + i * 150} y={1040} s={0.55} c={K.crowd2} hair={i} />
          {i % 2 === 0 && <RaisedPhone x={-30 + i * 150} y={960} s={0.55} t={t} rot={-8 + i * 2} seed={i + 20} c={K.crowd2} />}
        </g>
      ))}
      {/* él camina por el centro con su halo */}
      <g transform={`translate(${walkX} ${1150 + bob(t)})`}>
        <ellipse cx={0} cy={-200} rx={330} ry={360} fill="url(#kGoldSoft)" />
        <Person x={0} y={0} s={0.85} who="him" t={t} pose={walk(t)} />
        <Halo x={0} y={-372} r={50} t={t} />
      </g>
      {/* fila delantera: siluetas con celulares en alto, como una procesión */}
      {Array.from({length: 8}).map((_, i) => {
        const x = -120 + i * 190 + Math.sin(i) * 20;
        const rise = seg(t, 0.1 + i * 0.12, 0.7 + i * 0.12);
        return (
          <g key={`f${i}`}>
            <Back x={x} y={1330} s={0.95} hair={i + 1} />
            <RaisedPhone x={x + (i % 2 ? 50 : -50)} y={lerp(1420, 1240, easeOut(rise))} s={1.0} t={t} rot={(i % 2 ? -12 : 12)} seed={i * 5} live={i === 3} />
          </g>
        );
      })}
      <Dust t={t} n={20} y0={600} y1={1300} />
    </g>
  );
};

// ---------- 3. DIRECTO: la cámara entra en la pantalla de un celular que lo transmite ----------
export const Directo: React.FC<SP> = ({t, d}) => {
  const k = ease3(seg(t, 0, d * 0.9));
  const s = lerp(1.0, 1.55, k);
  return (
    <g transform={view(540, lerp(760, 700, k), s, lerp(-4, 0, k))}>
      <Avenue t={t} y={1240} />
      <rect x={-1200} y={-600} width={3500} height={2600} fill="#0d0814" opacity={0.45} />
      {/* mano que sostiene el celular */}
      <path d="M760 1160 Q840 1180 860 1300 L900 1700 L640 1700 L660 1240 Z" fill={C.skin} />
      <path d="M660 1240 Q600 1180 620 1120 Q650 1100 690 1140 L700 1200 Z" fill={C.skin} />
      <rect x={700} y={1330} width={260} height={400} rx={40} fill={C.jacket} />
      <LiveScreen x={540} y={760} w={480} h={820} t={t} id="dirClip" rot={lerp(-6, 0, k)} bg="#3a2350">
        {/* lo que transmite: él en la calle con la luz dorada */}
        <rect x={-240} y={-410} width={480} height={820} fill="url(#kSky)" />
        <Rays x={0} y={-80} t={t} n={12} len={600} o={0.7} />
        <rect x={-240} y={140} width={480} height={300} fill={K.street} />
        <g transform={`translate(${Math.sin(t * 0.8) * 30} ${200 + bob(t, 0.6)})`}>
          <Person x={0} y={0} s={0.8} who="him" t={t} pose={{armL: 20, armR: -150, elbowR: -30}} />
          <Halo x={0} y={-350} r={46} t={t} />
        </g>
      </LiveScreen>
      {/* destello de otros celulares alrededor */}
      <RaisedPhone x={120} y={1300} s={0.9} t={t} rot={14} seed={41} />
      <Notif x={330} y={520 - seg(t, 0.4, 1.2) * 40} w={300} s={0.9} o={seg(t, 0.4, 0.9) * (1 - seg(t, 2.6, 3.2))} icon="heart" />
      <Notif x={760} y={990 - seg(t, 1.2, 2) * 40} w={300} s={0.9} o={seg(t, 1.2, 1.7) * (1 - seg(t, 3.4, 4))} icon="eye" />
    </g>
  );
};

// ---------- 4. PODIO: alfombra roja, el pedestal del premio vacío, y él pasa de largo ----------
const TrophyOutline: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} fill="none" stroke={K.goldL} strokeWidth={5} strokeDasharray="14 12">
    <path d="M-60 -200 L60 -200 Q60 -90 0 -70 Q-60 -90 -60 -200 Z" />
    <path d="M-60 -180 Q-110 -170 -90 -120 Q-80 -100 -50 -110" />
    <path d="M60 -180 Q110 -170 90 -120 Q80 -100 50 -110" />
    <path d="M0 -70 L0 -30 M-40 -20 L40 -20 L40 0 L-40 0 Z" />
  </g>
);

export const Podio: React.FC<SP> = ({t, d}) => {
  // travelling bajo y lateral siguiendo la alfombra
  const k = ease3(t / d);
  const hx = lerp(80, 860, seg(t, 0.2, d - 0.1));
  return (
    <g transform={view(lerp(380, 700, k), lerp(820, 760, k), 1.12, 0)}>
      <rect x={-800} y={-600} width={2800} height={2800} fill="#1a1028" />
      {/* telón */}
      {Array.from({length: 22}).map((_, i) => (
        <rect key={i} x={-600 + i * 110} y={-200} width={110} height={1300} fill={i % 2 ? '#4a1626' : '#5a1c2e'} />
      ))}
      <rect x={-800} y={-200} width={2800} height={90} fill="#3a101c" />
      {/* foco sobre el pedestal vacío */}
      <path d="M240 -120 L60 1000 L560 1000 L380 -120 Z" fill="url(#kRay)" opacity={0.7} />
      <ellipse cx={310} cy={1000} rx={250} ry={40} fill="#ffe9b0" opacity={0.25} />
      <rect x={210} y={830} width={200} height={170} fill="#3a2a46" />
      <rect x={196} y={820} width={228} height={22} fill="#4b3a5a" />
      <TrophyOutline x={310} y={820} o={0.7 + 0.2 * Math.sin(t * 3)} />
      {/* telaraña cómica en la esquina del pedestal */}
      <path d="M210 1000 L210 940 M210 1000 L270 1000 M210 1000 L250 960 M210 970 Q228 972 230 1000 M210 950 Q245 955 250 1000" stroke="#cbbfd8" strokeWidth={2} fill="none" opacity={0.5} />
      {/* alfombra roja */}
      <path d="M-800 1000 L1900 1000 L1900 1240 L-800 1240 Z" fill="url(#kCarpet)" />
      <rect x={-800} y={1000} width={2700} height={8} fill="#e05a6c" opacity={0.6} />
      {/* postes con cordón */}
      {Array.from({length: 9}).map((_, i) => (
        <g key={i}>
          <rect x={-300 + i * 260} y={1050} width={12} height={190} fill={K.gold} />
          <circle cx={-294 + i * 260} cy={1048} r={14} fill={K.goldL} />
          {i < 8 && <path d={`M${-294 + i * 260} 1070 Q${-164 + i * 260} 1130 ${-34 + i * 260} 1070`} stroke="#7a1a2a" strokeWidth={10} fill="none" />}
        </g>
      ))}
      {/* él pasa de largo, seguro, sin mirar el pedestal */}
      <g transform={`translate(${hx} ${1110 + bob(t)})`}>
        <Person x={0} y={0} s={0.82} who="him" t={t} pose={walk(t)} />
        <Halo x={0} y={-358} r={46} t={t} o={0.8} />
      </g>
      {/* alguien lo graba con un aro de luz */}
      <g transform="translate(1150 1260)">
        <circle cx={0} cy={-330} r={120} fill="none" stroke="#fff6e0" strokeWidth={22} opacity={0.95} />
        <circle cx={0} cy={-330} r={200} fill="url(#kScreenGlow)" opacity={0.8} />
        <rect x={-4} y={-210} width={8} height={210} fill="#120b19" />
        <rect x={-34} y={-380} width={68} height={110} rx={10} fill="#0b0810" />
        <rect x={-28} y={-374} width={56} height={98} rx={7} fill={K.screen} />
        <circle cx={-14} cy={-362} r={6} fill={K.live} opacity={0.6 + 0.4 * Math.sin(t * 6)} />
      </g>
      <Back x={1020} y={1400} s={1.1} hair={2} />
      <RaisedPhone x={-120} y={1340} s={1.1} t={t} rot={16} seed={8} />
    </g>
  );
};

// ---------- 5. ESPEJO: él mismo se pone el halo (golpe de zoom cómico) ----------
export const Espejo: React.FC<SP> = ({t, d}) => {
  const place = easeOut(seg(t, 0.4, 1.8)); // baja el halo hasta su cabeza
  const flick = t > 1.8 && t < 2.5 ? (Math.sin(t * 50) > 0 ? 1 : 0.25) : 1; // parpadea como foco
  const tap = t > 2.1 && t < 2.5; // le da un golpecito
  const on = t > 2.5 ? 1 : flick;
  // golpe de zoom cuando se enciende
  const punch = t > 2.5 ? 1 + 0.12 * Math.exp(-(t - 2.5) * 5) * Math.cos((t - 2.5) * 18) : 1;
  const k = ease3(t / d);
  const haloY = lerp(-640, -372, place);
  return (
    <g transform={view(540, lerp(740, 700, k), lerp(1.05, 1.18, k) * punch)}>
      <rect x={-600} y={-600} width={2300} height={2800} fill="#2a1d36" />
      {/* azulejos */}
      {Array.from({length: 120}).map((_, i) => (
        <rect key={i} x={-300 + (i % 12) * 140} y={-100 + Math.floor(i / 12) * 140} width={134} height={134} fill={(i + Math.floor(i / 12)) % 2 ? '#33243f' : '#2e2039'} />
      ))}
      {/* espejo ovalado con marco dorado */}
      <ellipse cx={540} cy={720} rx={330} ry={450} fill={K.goldD} />
      <ellipse cx={540} cy={720} rx={308} ry={428} fill="#4a3a66" />
      <clipPath id="mirClip">
        <ellipse cx={540} cy={720} rx={308} ry={428} />
      </clipPath>
      <g clipPath="url(#mirClip)">
        <rect x={200} y={280} width={700} height={900} fill="#3b2d55" />
        <path d="M260 300 L420 300 L240 1150 L200 1150 Z" fill="#fff" opacity={0.07} />
        {/* reflejo: él de frente arreglándose el halo */}
        <g transform={`translate(540 ${1200})`}>
          <ellipse cx={0} cy={-460} rx={300} ry={260} fill="url(#kGoldSoft)" opacity={on} />
          <Person x={0} y={0} s={1.0} who="him" t={t} pose={{armL: 160 - place * 10, elbowL: -40, armR: tap ? -150 : -160 + place * 10, elbowR: tap ? 60 : 40}} />
          <Halo x={0} y={haloY - 70} r={56} t={t} o={on} />
          {on < 1 && <ellipse cx={0} cy={haloY - 70} rx={56} ry={17} fill="none" stroke="#8a7a6a" strokeWidth={8} />}
        </g>
      </g>
      {/* lavabo */}
      <rect x={300} y={1160} width={480} height={50} rx={18} fill="#e8dfd2" />
      <rect x={500} y={1110} width={16} height={56} fill="#c9bfae" />
      {/* notificaciones que se encienden alrededor del espejo cuando el halo prende */}
      {[
        [170, 430, 'heart', 2.55],
        [900, 560, 'star', 2.7],
        [150, 900, 'eye', 2.85],
        [920, 980, 'heart', 3.0],
      ].map(([x, y, ic, at], i) => (
        <Notif key={i} x={x as number} y={(y as number) - easeOut(seg(t, at as number, (at as number) + 0.4)) * 20} w={280} s={0.85 * easeOut(seg(t, at as number, (at as number) + 0.3))} o={seg(t, at as number, (at as number) + 0.25)} icon={ic as 'heart'} />
      ))}
      {/* celular apoyado grabándose (punto rojo) */}
      <g transform="translate(820 1150) rotate(-8)">
        <rect x={-38} y={-130} width={76} height={130} rx={12} fill="#0b0810" />
        <rect x={-31} y={-123} width={62} height={116} rx={8} fill={K.screen} />
        <circle cx={-14} cy={-108} r={6} fill={K.live} opacity={0.6 + 0.4 * Math.sin(t * 6)} />
      </g>
    </g>
  );
};

// ---------- 6. CICATRICES: macro del brazo con cicatrices doradas, luego se abre ----------
export const Cicatrices: React.FC<SP> = ({t, d}) => {
  const k1 = ease3(seg(t, 0, d * 0.45)); // recorre el brazo
  const k2 = ease3(seg(t, d * 0.45, d)); // se abre al plano entero
  const sx = lerp(lerp(712, 690, k1), 540, k2);
  const sy = lerp(lerp(860, 760, k1), 760, k2);
  const sc = lerp(2.4, 1.0, k2);
  const glow = 0.6 + 0.4 * Math.sin(t * 3);
  const draw = seg(t, 0.2, 1.6);
  return (
    <g transform={view(sx, sy, sc, lerp(-6, 0, k2))}>
      <rect x={-800} y={-600} width={2800} height={2800} fill="#1c1230" />
      {/* vitral de fondo */}
      <g opacity={0.9}>
        <path d="M240 1080 L240 520 Q540 170 840 520 L840 1080 Z" fill="#120b1e" />
        {Array.from({length: 18}).map((_, i) => {
          const col = [K.ruby, K.cobalt, K.emerald, K.violet, K.goldD][i % 5];
          const a = -90 + (i - 8.5) * 10;
          const r0 = 120;
          const r1 = 420;
          const x0 = 540 + Math.cos((a * Math.PI) / 180) * r0;
          const y0 = 700 + Math.sin((a * Math.PI) / 180) * r0;
          const x1 = 540 + Math.cos(((a + 9) * Math.PI) / 180) * r1;
          const y1 = 700 + Math.sin(((a + 9) * Math.PI) / 180) * r1;
          const x2 = 540 + Math.cos(((a - 0) * Math.PI) / 180) * r1;
          const y2 = 700 + Math.sin(((a - 0) * Math.PI) / 180) * r1;
          return <path key={i} d={`M${x0} ${y0} L${x2} ${y2} L${x1} ${y1} Z`} fill={col} opacity={0.55 + 0.15 * Math.sin(t * 1.5 + i)} stroke="#0d0815" strokeWidth={6} />;
        })}
        <circle cx={540} cy={700} r={110} fill={K.gold} opacity={0.5} stroke="#0d0815" strokeWidth={8} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={260 + i * 140} y={760} width={120} height={300} fill={[K.cobalt, K.ruby, K.emerald, K.violet][i]} opacity={0.45} stroke="#0d0815" strokeWidth={6} />
        ))}
      </g>
      <Rays x={540} y={600} t={t} n={14} len={900} o={0.5} />
      {/* él, de pie, sacando pecho y mostrando el antebrazo con la manga arremangada */}
      <g transform="translate(540 1240) scale(1.25)">
        <Person x={0} y={0} s={1} who="him" t={0} pose={{armL: 22, armR: -90, elbowR: -90, headTilt: -5}} />
        <Halo x={0} y={-448} r={50} t={t} />
        {/* antebrazo destapado con cicatrices de oro (como cerámica reparada) */}
        <rect x={126} y={-374} width={24} height={86} rx={12} fill={C.skin} />
        <rect x={124} y={-306} width={28} height={16} rx={7} fill={C.jacketShade} />
        <circle cx={138} cy={-372} r={14} fill={C.skin} />
        <path d="M128 -356 L140 -348 L132 -338 L146 -328" stroke={K.gold} strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="44" strokeDashoffset={44 * (1 - draw)} />
        <path d="M146 -322 L132 -312" stroke={K.gold} strokeWidth={2.6} fill="none" strokeLinecap="round" opacity={seg(t, 0.8, 1.3)} />
        <path d="M129 -366 L137 -362" stroke={K.gold} strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={seg(t, 1.2, 1.7)} />
        <circle cx={138} cy={-335} r={34} fill="url(#kGoldSoft)" opacity={0.9 * glow} />
      </g>
      <Dust t={t} n={20} y0={300} y1={1200} />
      {/* un celular en la esquina lo graba */}
      <RaisedPhone x={980} y={1340} s={1.0} t={t} rot={-16} seed={12} live />
      <RaisedPhone x={90} y={1380} s={0.95} t={t} rot={14} seed={14} />
    </g>
  );
};

// ---------- 7. MOSCAS: envidia y críticas zumban, chocan con su luz y rebotan ----------
export const Moscas: React.FC<SP> = ({t, d}) => {
  // cámara al hombro: sigue a su lado con pequeñas sacudidas
  const shakeX = Math.sin(t * 9) * 4 + Math.sin(t * 23) * 2;
  const shakeY = Math.cos(t * 11) * 3;
  const k = ease3(t / d);
  const auraPulse = 1 + 0.06 * Math.sin(t * 6);
  return (
    <g transform={view(540 + shakeX, 760 + shakeY, lerp(1.1, 1.0, k), Math.sin(t * 2) * 1.5)}>
      <Avenue t={t} y={1150} shift={t * 90} />
      <g transform={`translate(540 ${1180 + bob(t)})`}>
        <ellipse cx={0} cy={-210} rx={260 * auraPulse} ry={320 * auraPulse} fill="url(#kGold)" opacity={0.55} />
        <ellipse cx={0} cy={-210} rx={240 * auraPulse} ry={300 * auraPulse} fill="none" stroke={K.goldL} strokeWidth={3} opacity={0.35} strokeDasharray="6 14" />
        <Person x={0} y={0} s={0.95} who="him" t={t} pose={walk(t)} />
        <Halo x={0} y={-420} r={54} t={t} />
      </g>
      {/* moscas: orbitan y rebotan contra el borde del aura */}
      {Array.from({length: 7}).map((_, i) => {
        const a = t * (1.6 + rnd(i) * 1.2) * (i % 2 ? 1 : -1) + i * 0.9;
        const r = 290 + Math.abs(Math.sin(t * 3 + i * 1.7)) * 110;
        const x = 540 + Math.cos(a) * r * 0.9 + Math.sin(t * 13 + i) * 8;
        const y = 970 + Math.sin(a) * r * 1.05 + Math.cos(t * 17 + i) * 8;
        const hit = Math.abs(Math.sin(t * 3 + i * 1.7)) < 0.12;
        return (
          <g key={i}>
            <Fly x={x} y={y} s={1.3} t={t} rot={(a * 180) / Math.PI + 90} seed={i} bubble={i % 3 === 0} />
            {hit && <circle cx={540 + Math.cos(a) * 280} cy={970 + Math.sin(a) * 300} r={26} fill="none" stroke={K.goldL} strokeWidth={4} opacity={0.8} />}
          </g>
        );
      })}
      {/* y aun así: celulares en la orilla grabando */}
      <RaisedPhone x={60} y={1400} s={1.05} t={t} rot={16} seed={30} live />
      <RaisedPhone x={1030} y={1420} s={1.05} t={t} rot={-14} seed={31} />
    </g>
  );
};

// ---------- 8. PANTALLA: pantalla gigante en la avenida con su silueta (inclinación 3D en la composición) ----------
export const Pantalla: React.FC<SP> = ({t, d}) => {
  const k = ease3(t / d);
  const on = easeOut(seg(t, 0.3, 1.2));
  return (
    <g transform={view(540, lerp(820, 720, k), lerp(1.0, 1.06, k))}>
      <Avenue t={t} y={1240} lamps />
      {/* edificio con la pantalla */}
      <rect x={130} y={240} width={820} height={1000} fill="#1e1534" />
      <rect x={170} y={300} width={740} height={600} rx={12} fill="#0c0812" />
      <clipPath id="bigClip">
        <rect x={190} y={320} width={700} height={560} rx={8} />
      </clipPath>
      <g clipPath="url(#bigClip)">
        <rect x={190} y={320} width={700} height={560} fill="#3a2350" />
        <g opacity={on}>
          <rect x={190} y={320} width={700} height={560} fill="url(#kSky)" />
          <Rays x={540} y={560} t={t} n={14} len={500} o={0.9} />
          <ellipse cx={540} cy={560} rx={260} ry={240} fill="url(#kGold)" opacity={0.6} />
          {/* silueta gigante (sin cara) */}
          <path d="M330 890 Q340 760 470 730 L470 690 Q420 670 416 600 Q412 500 540 494 Q668 500 664 600 Q660 670 610 690 L610 730 Q740 760 750 890 Z" fill="#1a0f22" />
          <Halo x={540} y={470} r={110} t={t} />
          <Reactions x={820} y={860} t={t} n={10} rise={480} spread={60} s={1.6} seed={4} />
          <LiveBadge x={210} y={340} s={1.4} t={t} />
        </g>
        {/* líneas de escaneo */}
        {Array.from({length: 40}).map((_, i) => (
          <rect key={i} x={190} y={320 + i * 14} width={700} height={2} fill="#000" opacity={0.12} />
        ))}
      </g>
      <ellipse cx={540} cy={1100} rx={600} ry={300} fill="url(#kGoldSoft)" opacity={on * 0.7} />
      {/* multitud de espaldas mirando hacia arriba con celulares */}
      {Array.from({length: 7}).map((_, i) => {
        const x = -40 + i * 190;
        return (
          <g key={i}>
            <Back x={x} y={1390} s={1.0} hair={i} />
            {i % 2 === 1 && <RaisedPhone x={x + 30} y={1250} s={1.0} t={t} rot={-6 + i * 2} seed={i + 50} live={i === 3} />}
          </g>
        );
      })}
      <Dust t={t} n={18} y0={250} y1={1100} />
    </g>
  );
};

// ---------- 9. CANONIZA: las reacciones de los celulares suben y forman su halo ----------
export const Canoniza: React.FC<SP> = ({t, d}) => {
  // espiral hacia el halo
  const k = ease3(t / d);
  const form = easeOut(seg(t, 0.4, d * 0.75));
  const haloR = 120;
  const cx = 540;
  const cy = 700;
  const burst = seg(t, d * 0.72, d * 0.85);
  return (
    <g transform={view(540, lerp(900, 760, k), lerp(0.95, 1.2, k), lerp(0, 7, k))}>
      <rect x={-900} y={-900} width={2900} height={3000} fill="#1a1030" />
      <Rays x={cx} y={cy} t={t} n={22} len={1400} spin={10} o={0.35 + 0.65 * form} />
      <ellipse cx={cx} cy={cy + 150} rx={520} ry={600} fill="url(#kGold)" opacity={0.25 + 0.45 * form} />
      {/* multitud en círculo con los celulares hacia él */}
      {Array.from({length: 10}).map((_, i) => {
        const x = -260 + i * 175;
        return (
          <g key={i}>
            <Back x={x} y={1410 + (i % 2) * 30} s={0.95} hair={i} c={i % 2 ? K.crowd : K.crowd2} />
            <RaisedPhone x={x + (i % 2 ? 40 : -40)} y={1250 + (i % 2) * 30} s={0.95} t={t} rot={(cx - x) * 0.05} seed={i + 70} live={i === 4} />
          </g>
        );
      })}
      {/* él en el centro, brazos abiertos con calma */}
      <g transform={`translate(${cx} 1170)`}>
        <Person x={0} y={0} s={1.05} who="him" t={t} pose={{armL: 30 + form * 25, armR: -30 - form * 25, elbowL: -10, elbowR: 10, headTilt: -4}} />
      </g>
      {/* reacciones que vuelan desde los celulares y se quedan girando como halo */}
      {Array.from({length: 34}).map((_, i) => {
        const x0 = -260 + (i % 10) * 175 + (i % 2 ? 40 : -40);
        const y0 = 1150;
        const delay = rnd(i) * 0.55;
        const p = easeOut(seg(form, delay, Math.min(1, delay + 0.45)));
        const ang = (i / 34) * Math.PI * 2 + t * 1.4;
        const tx = cx + Math.cos(ang) * haloR * 2.1;
        const ty = cy + 60 + Math.sin(ang) * haloR * 0.55 - 60;
        const x = lerp(x0, tx, p) + Math.sin(p * Math.PI) * (rnd(i + 3) - 0.5) * 300;
        const y = lerp(y0, ty, p) - Math.sin(p * Math.PI) * 220;
        const front = Math.sin(ang) > 0;
        return i % 5 === 4 ? (
          <path key={i} d={STAR} transform={`translate(${x} ${y}) scale(${1.3 + (front ? 0.4 : 0)})`} fill={K.goldL} opacity={0.5 + 0.5 * p} />
        ) : (
          <HeartShape key={i} x={x} y={y} s={1.5 + (front ? 0.5 : 0)} c={REACT_C[i % REACT_C.length]} o={0.55 + 0.45 * p} rot={Math.sin(t * 3 + i) * 12} />
        );
      })}
      <Halo x={cx} y={cy - 20 + 60} r={140} t={t} o={form * 0.85} />
      {burst > 0 && burst < 1 && <circle cx={cx} cy={cy + 40} r={lerp(60, 900, burst)} fill="none" stroke={K.goldL} strokeWidth={30 * (1 - burst)} opacity={1 - burst} />}
      <Dust t={t} n={30} y0={200} y1={1300} o={form} />
    </g>
  );
};

// ---------- 10. VITRAL: alejamiento que revela un rosetón hecho de pantallas ----------
export const Vitral: React.FC<SP> = ({t, d}) => {
  const k = ease3(seg(t, 0, d * 0.95));
  const s = lerp(2.3, 0.92, k);
  const cy = 700;
  const rings = [
    {n: 1, r: 0},
    {n: 8, r: 170},
    {n: 14, r: 330},
  ];
  return (
    <g transform={view(540, lerp(980, 760, k), s)}>
      <rect x={-1400} y={-1400} width={3900} height={4200} fill="#120b1e" />
      <Avenue t={t} y={1240} lamps>
        {null}
      </Avenue>
      {/* rosetón: cada vidrio es una pantalla con reacciones */}
      <circle cx={540} cy={cy} r={470} fill="#0d0815" />
      <circle cx={540} cy={cy} r={470} fill="url(#kGold)" opacity={0.25} />
      {rings.map((rg, j) =>
        Array.from({length: rg.n}).map((_, i) => {
          const a = (i / rg.n) * Math.PI * 2 + (j % 2 ? t * 0.08 : -t * 0.05);
          const x = 540 + Math.cos(a) * rg.r;
          const y = cy + Math.sin(a) * rg.r;
          const col = [K.ruby, K.cobalt, K.emerald, K.violet, K.goldD][(i + j) % 5];
          const w = j === 0 ? 170 : j === 1 ? 96 : 92;
          const h = j === 0 ? 170 : j === 1 ? 140 : 132;
          return (
            <g key={`${j}-${i}`} transform={`translate(${x} ${y}) rotate(${j === 0 ? 0 : (a * 180) / Math.PI + 90})`}>
              <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill={col} stroke="#0d0815" strokeWidth={8} />
              <rect x={-w / 2 + 8} y={-h / 2 + 8} width={w - 16} height={h - 16} rx={10} fill="#fff" opacity={0.12 + 0.08 * Math.sin(t * 2 + i + j)} />
              {j > 0 && <HeartShape x={0} y={Math.sin(t * 2 + i) * 8} s={0.9} c="#fff" o={0.7} />}
              {j > 0 && (i + j) % 3 === 0 && <circle cx={-w / 2 + 16} cy={-h / 2 + 16} r={6} fill={K.live} />}
            </g>
          );
        }),
      )}
      {/* en el centro, él (silueta con halo) como en una estampa */}
      <circle cx={540} cy={cy} r={86} fill="#ffe3a1" />
      <path d={`M470 ${cy + 86} Q474 ${cy + 30} 520 ${cy + 22} L520 ${cy + 8} Q500 ${cy} 500 ${cy - 26} Q500 ${cy - 62} 540 ${cy - 64} Q580 ${cy - 62} 580 ${cy - 26} Q580 ${cy} 560 ${cy + 8} L560 ${cy + 22} Q606 ${cy + 30} 610 ${cy + 86} Z`} fill="#2a1a12" />
      <Halo x={540} y={cy - 74} r={34} t={t} />
      {/* él en la calle, a los pies del rosetón, mirando hacia arriba con calma */}
      <g transform="translate(540 1260)">
        <ellipse cx={0} cy={-180} rx={260} ry={300} fill="url(#kGoldSoft)" />
        <Person x={0} y={0} s={0.62} who="him" t={t} pose={{armL: 14, armR: -14, back: true}} />
      </g>
      {/* público alrededor con celulares */}
      {Array.from({length: 6}).map((_, i) => (
        <RaisedPhone key={i} x={-100 + i * 260} y={1430 + (i % 2) * 40} s={1.0} t={t} rot={i < 3 ? 12 : -12} seed={i + 90} live={i === 2} />
      ))}
      <Dust t={t} n={26} y0={150} y1={1300} />
    </g>
  );
};

// ---------- 11. OUTRO: la pantalla del LIVE, donde cada quien pide su canción ----------
export const Outro: React.FC<SP> = ({t, d}) => {
  const k = ease3(t / d);
  return (
    <g transform={view(540, lerp(720, 700, k), lerp(1.0, 1.05, k))}>
      <rect x={-900} y={-900} width={2900} height={3000} fill="#170e26" />
      <Rays x={540} y={700} t={t} n={18} len={1300} o={0.55} />
      <Dust t={t} n={26} y0={200} y1={1400} />
      <LiveScreen x={540} y={760} w={520} h={880} t={t} id="outClip" note bg="#3a2350">
        <rect x={-260} y={-440} width={520} height={880} fill="url(#kSky)" />
        <Rays x={0} y={-40} t={t} n={12} len={600} o={0.7} />
        <rect x={-260} y={190} width={520} height={260} fill={K.street} />
        <g transform={`translate(0 ${240})`}>
          <Person x={0} y={0} s={0.78} who="him" t={t} pose={{armL: 20, armR: -150 + Math.sin(t * 6) * 18, elbowR: -20}} />
          <Halo x={0} y={-340} r={44} t={t} />
        </g>
      </LiveScreen>
      {/* notas musicales que salen del directo (cada comentario es una canción pedida) */}
      {Array.from({length: 6}).map((_, i) => {
        const p = (t * 0.35 + i / 6) % 1;
        const x = 540 + (i % 2 ? 1 : -1) * (300 + rnd(i) * 80) + Math.sin(p * 6 + i) * 20;
        const y = 1080 - p * 640;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${0.9 + rnd(i + 2) * 0.5})`} opacity={Math.sin(Math.PI * p)}>
            <ellipse cx={0} cy={0} rx={14} ry={10} fill={AMBER} transform="rotate(-20)" />
            <rect x={10} y={-48} width={5} height={48} fill={AMBER} />
            <path d="M15 -48 Q34 -40 30 -20" stroke={AMBER} strokeWidth={5} fill="none" />
          </g>
        );
      })}
    </g>
  );
};

export const SCENES: Record<string, React.FC<SP>> = {
  salida: Salida,
  procesion: Procesion,
  directo: Directo,
  podio: Podio,
  espejo: Espejo,
  cicatrices: Cicatrices,
  moscas: Moscas,
  pantalla: Pantalla,
  canoniza: Canoniza,
  vitral: Vitral,
  outro: Outro,
};

// estilos 3D por escena (se aplican al contenedor HTML de la escena)
export const CAM3D: Record<string, (t: number, d: number) => React.CSSProperties> = {
  pantalla: (t, d) => {
    const e = ease3(t / d);
    return {transform: `perspective(1400px) rotateX(${lerp(16, 0, e)}deg) translateY(${lerp(120, 0, e)}px)`, transformOrigin: '50% 100%'};
  },
};
