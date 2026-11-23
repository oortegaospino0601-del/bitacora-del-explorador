import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/fraunces/latin-700.css';
import '@fontsource/fraunces/latin-800.css';
import {SCENES} from './scenes';
import {C, clamp, eio, eo, lerp, p} from './kit';

type Word = {w: string; start: number; end: number};
type Sent = {scene: string; start: number; end: number; words: Word[]};
export type Props666 = {song: string; artists: string; total: number; sentences: Sent[]; audioFile: string};

const SERIF = "'Fraunces', Georgia, serif";
const AMBER = '#f2b33d';
const CREAM = '#f6ead6';
const TD = 0.42; // duración de transición (s)

// ---------- Reproductor (mismo diseño y posición que los videos anteriores) ----------
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const Player: React.FC<{t: number; total: number; song: string; artists: string; f: number}> = ({t, total, song, artists, f}) => {
  const prog = clamp(t / total);
  const label = `${song}`;
  const textW = 560;
  const boxW = 413;
  // ida y vuelta lento con pausas, para que se lean canción y artistas
  const over = 175;
  const cyc = f % 300;
  const off = -over * (cyc < 75 ? 0 : cyc < 150 ? eio((cyc - 75) / 75) : cyc < 225 ? 1 : 1 - eio((cyc - 225) / 75));
  const Line = (
    <span>
      <span style={{color: CREAM}}>{label}</span>
      <span style={{color: AMBER}}> · {artists}</span>
    </span>
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: 220,
        top: 207,
        width: 640,
        height: 120,
        borderRadius: 30,
        background: 'rgba(30,20,16,0.82)',
        border: '2px solid rgba(201,150,60,0.75)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
        fontFamily: SERIF,
      }}
    >
      <div style={{position: 'absolute', left: 28, top: 24, height: 44, width: 166, display: 'flex', alignItems: 'flex-end', gap: 5}}>
        {Array.from({length: 14}).map((_, i) => {
          const h = 10 + 34 * Math.abs(Math.sin(f / (3.2 + (i % 4) * 0.7) + i * 1.7)) * (0.55 + 0.45 * Math.abs(Math.sin(f / 11 + i)));
          return <div key={i} style={{width: 7, height: h, borderRadius: 4, background: i % 3 === 1 ? CREAM : AMBER}} />;
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 214,
          top: 20,
          width: boxW,
          height: 50,
          overflow: 'hidden',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 14px, #000 calc(100% - 22px), transparent 100%)',
        }}
      >
        <div style={{position: 'absolute', left: 0, top: 4, whiteSpace: 'nowrap', fontSize: 34, fontWeight: 800, transform: `translateX(${off}px)`, display: 'flex', gap: 80}}>
          {Line}
        </div>
      </div>
      <div style={{position: 'absolute', left: 28, top: 78, fontSize: 20, color: 'rgba(246,234,214,0.8)', fontWeight: 700}}>{fmt(t)}</div>
      <div style={{position: 'absolute', right: 30, top: 78, fontSize: 20, color: 'rgba(246,234,214,0.8)', fontWeight: 700}}>{fmt(total)}</div>
      <div style={{position: 'absolute', left: 90, top: 89, width: 460, height: 4, borderRadius: 2, background: 'rgba(120,104,96,0.7)'}}>
        <div style={{width: `${prog * 100}%`, height: 4, borderRadius: 2, background: AMBER}} />
        <div style={{position: 'absolute', left: `calc(${prog * 100}% - 8px)`, top: -6, width: 16, height: 16, borderRadius: 8, background: '#fff'}} />
      </div>
    </div>
  );
};

// ---------- Subtítulos palabra por palabra ----------
type Chunk = {words: Word[]; start: number; end: number};
const chunkify = (sents: Sent[]): Chunk[] => {
  const out: Chunk[] = [];
  sents.forEach((s) => {
    let cur: Word[] = [];
    let chars = 0;
    s.words.forEach((w, i) => {
      cur.push(w);
      chars += w.w.length + 1;
      const punct = /[.,:?!…»]$/.test(w.w);
      if (chars >= 17 || punct || cur.length >= 4 || i === s.words.length - 1) {
        out.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
        cur = [];
        chars = 0;
      }
    });
  });
  return out;
};

const Subs: React.FC<{t: number; chunks: Chunk[]}> = ({t, chunks}) => {
  let idx = -1;
  for (let i = 0; i < chunks.length; i++) if (t >= chunks[i].start - 0.05) idx = i;
  if (idx < 0) return null;
  const c = chunks[idx];
  const next = chunks[idx + 1];
  if (t > c.end + 0.6 && (!next || t < next.start - 0.05)) return null;
  const pop = idx === 0 ? 1 : eo(clamp((t - c.start + 0.05) / 0.14));
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        right: 90,
        top: 1250,
        textAlign: 'center',
        fontFamily: SERIF,
        fontWeight: 800,
        fontSize: 70,
        lineHeight: 1.12,
        color: CREAM,
        textShadow: '0 4px 18px rgba(0,0,0,0.85), 0 2px 4px rgba(0,0,0,0.9)',
        transform: `translateY(${(1 - pop) * 12}px) scale(${0.95 + 0.05 * pop})`,
      }}
    >
      {c.words.map((w, i) => {
        const active = t >= w.start - 0.03 && (t < w.end + 0.08 || i === c.words.length - 1);
        return (
          <span key={i} style={{color: active ? AMBER : CREAM}}>
            {w.w}
            {i < c.words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </div>
  );
};

// ---------- Flecha al LIVE (abajo a la izquierda) ----------
const Arrow: React.FC<{f: number; o: number}> = ({f, o}) => {
  const bob = Math.sin(f / 5) * 18;
  const glow = 0.6 + 0.4 * Math.sin(f / 4);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, opacity: o}}>
      <defs>
        <filter id="arrowGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={14} />
        </filter>
      </defs>
      <g transform={`translate(${245 - bob * 0.7} ${1645 + bob * 0.7}) rotate(45) scale(${0.95 + 0.05 * glow})`}>
        <path d="M -36 -150 L 36 -150 L 36 20 L 92 20 L 0 140 L -92 20 L -36 20 Z" fill={AMBER} filter="url(#arrowGlow)" opacity={glow} />
        <path d="M -36 -150 L 36 -150 L 36 20 L 92 20 L 0 140 L -92 20 L -36 20 Z" fill="#f1ece6" stroke={AMBER} strokeWidth={12} strokeLinejoin="round" />
      </g>
    </svg>
  );
};

// ---------- Transiciones (cada escena entra distinto) ----------
const ENTER: Record<string, string> = {
  celulares: 'flash',
  vip: 'wipeRed',
  barra: 'zoomGold',
  live: 'iris',
  mirada: 'spin',
  falla: 'slideDown',
  mensajes: 'glowBlue',
  fama: 'whip',
  espejo: 'fadeBlack',
  atrapado: 'slideUp',
  cierre: 'fadeRed',
};

const enterStyle = (type: string, k: number): React.CSSProperties => {
  const e = eio(k);
  switch (type) {
    case 'wipeRed':
      return {clipPath: `inset(0 ${(1 - e) * 100}% 0 0)`};
    case 'zoomGold':
      return {transform: `scale(${lerp(1.35, 1, e)})`, opacity: e};
    case 'iris':
      return {clipPath: `circle(${e * 80}% at 50% 46%)`};
    case 'spin':
      return {transform: `rotate(${lerp(-14, 0, e)}deg) scale(${lerp(1.3, 1, e)})`, opacity: e};
    case 'slideDown':
      return {transform: `translateY(${lerp(-1920, 0, e)}px)`};
    case 'whip':
      return {transform: `translateX(${lerp(1080, 0, e)}px)`, filter: `blur(${(1 - e) * 18}px)`};
    case 'slideUp':
      return {transform: `translateY(${lerp(1920, 0, e)}px)`};
    case 'fadeBlack':
    case 'fadeRed':
    case 'glowBlue':
    case 'flash':
      return {opacity: clamp(k * 2.2)};
    default:
      return {};
  }
};

const overlayFor = (type: string, k: number): React.ReactNode => {
  const bell = Math.sin(clamp(k) * Math.PI);
  if (type === 'flash') return <AbsoluteFill style={{background: '#fff', opacity: bell * 0.95}} />;
  if (type === 'glowBlue') return <AbsoluteFill style={{background: '#a9c4ff', opacity: bell * 0.6}} />;
  if (type === 'fadeBlack') return <AbsoluteFill style={{background: '#000', opacity: bell * 0.9}} />;
  if (type === 'fadeRed') return <AbsoluteFill style={{background: C.redD, opacity: bell * 0.85}} />;
  if (type === 'zoomGold') return <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(255,215,122,0.9), rgba(255,215,122,0) 60%)', opacity: bell}} />;
  if (type === 'wipeRed')
    return (
      <div style={{position: 'absolute', top: 0, bottom: 0, left: `${eio(k) * 100}%`, width: 40, marginLeft: -20, background: C.neon, boxShadow: `0 0 60px 30px ${C.neon}`, opacity: k < 1 ? 1 : 0}} />
    );
  return null;
};

export const Historia666: React.FC<Props666> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const sents = props.sentences;
  const starts = sents.map((s, i) => (i === 0 ? 0 : Math.max(0, s.start - 0.16)));
  const chunks = React.useMemo(() => chunkify(sents), [sents]);
  const closeStart = starts[starts.length - 1];

  const layers: React.ReactNode[] = [];
  sents.forEach((s, i) => {
    const a = starts[i];
    const b = i < sents.length - 1 ? starts[i + 1] + TD : props.total + 1;
    if (t < a || t >= b) return;
    const Scene = SCENES[s.scene];
    const f = (t - a) * fps;
    const dur = (b - a) * fps;
    const wt = (word: string) => {
      const w = s.words.find((x) => x.w === word);
      return w ? (w.start - a) * fps : dur / 2;
    };
    const type = ENTER[s.scene];
    const k = i === 0 ? 1 : clamp((t - a) / TD);
    layers.push(
      <AbsoluteFill key={s.scene} style={k < 1 ? enterStyle(type, k) : undefined}>
        <Scene f={f} dur={dur} wt={wt} />
      </AbsoluteFill>,
    );
    if (k < 1) layers.push(<React.Fragment key={s.scene + '-ov'}>{overlayFor(type, k)}</React.Fragment>);
  });

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile(props.audioFile)} />
      {layers}
      {/* textura de grano y viñeta del estilo */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)'}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.16}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(frame / 2) % 12} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={1080} height={1920} filter="url(#grain)" />
      </svg>
      {/* banda oscura suave detrás de los subtítulos */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 61%, rgba(0,0,0,0.5) 66%, rgba(0,0,0,0.5) 74%, rgba(0,0,0,0) 80%)'}} />
      <Player t={t} total={props.total} song={props.song} artists={props.artists} f={frame} />
      <Subs t={t} chunks={chunks} />
      {t >= closeStart && <Arrow f={frame} o={eo(clamp((t - closeStart) / 0.3))} />}
    </AbsoluteFill>
  );
};
