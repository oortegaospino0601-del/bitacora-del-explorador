import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/fraunces/latin-600.css';
import '@fontsource/fraunces/latin-700.css';
import '@fontsource/fraunces/latin-800.css';
import {Props, SentenceTiming} from '../../types';
import {FxCtx, SCENES} from './escenas';
import {clamp, eio, eo, lerp, ramp} from '../historia309/kit';

const FONT = "'Fraunces', Georgia, serif";
const AMBER = '#f5b942';
const CREAM = '#fbf0dc';

type SpecBT = Props['spec'] & {song?: {title: string; artist: string}; sentences: {text: string; scene: string}[]};

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zñ]/g, '');

// Transiciones propias de esta historia (ninguna repite las de videos anteriores)
const ENTRY: Record<string, {kind: string; dur: number}> = {
  leal: {kind: 'drop', dur: 0.5},
  mentiras: {kind: 'glitch', dur: 0.45},
  pendientes: {kind: 'blinds', dur: 0.5},
  notif: {kind: 'flash', dur: 0.4},
  live: {kind: 'through', dur: 0.4},
  comentario: {kind: 'whip', dur: 0.32},
  subasta: {kind: 'swirl', dur: 0.55},
  tiempo: {kind: 'shutter', dur: 0.4},
  dedo: {kind: 'diamond', dur: 0.45},
  bloqueo: {kind: 'cut', dur: 0.05},
  mareo: {kind: 'chroma', dur: 0.5},
  calma: {kind: 'rack', dur: 0.55},
  amanecer: {kind: 'sunwipe', dur: 0.7},
  cierre: {kind: 'crton', dur: 0.5},
};

const bands = (n: number, fill: number) => {
  // persianas verticales: n franjas que se abren desde su centro
  const pts: string[] = ['0% 0%'];
  const pw = 100 / n;
  for (let i = 0; i < n; i++) {
    const c = pw * (i + 0.5);
    const h = (pw / 2) * fill;
    pts.push(`${c - h}% 0%`, `${c - h}% 100%`, `${c + h}% 100%`, `${c + h}% 0%`);
  }
  pts.push('100% 0%', '0% 0%');
  return `polygon(${pts.join(', ')})`;
};

const entryStyle = (kind: string, p: number, t: number): React.CSSProperties => {
  const e = eio(p);
  switch (kind) {
    case 'drop':
      return {transform: `translateY(${-(1 - eo(p)) * 1920}px)`};
    case 'glitch': {
      const step = Math.floor(t * 24);
      const jx = p < 1 ? (((step * 7919) % 13) - 6) * 14 * (1 - p) : 0;
      return {opacity: p < 0.15 ? 0 : p < 0.3 ? 0.6 : p < 0.45 ? 0.2 : e, transform: `translateX(${jx}px)`};
    }
    case 'blinds':
      return {clipPath: bands(7, e)};
    case 'through':
      return {opacity: e, transform: `scale(${lerp(2.6, 1, e)})`};
    case 'whip':
      return {transform: `translateX(${(1 - e) * -1080}px)`, filter: `blur(${(1 - e) * 22}px)`};
    case 'swirl':
      return {opacity: e, transform: `rotate(${(1 - e) * -160}deg) scale(${lerp(0.35, 1, e)})`, filter: `blur(${(1 - e) * 10}px)`};
    case 'shutter':
      return {clipPath: `inset(${(1 - e) * 50}% 0% ${(1 - e) * 50}% 0%)`};
    case 'diamond': {
      const r = e * 110;
      return {clipPath: `polygon(50% ${50 - r}%, ${50 + r}% 50%, 50% ${50 + r}%, ${50 - r}% 50%)`};
    }
    case 'chroma':
      return {opacity: e, filter: `hue-rotate(${(1 - e) * 140}deg) blur(${(1 - e) * 12}px)`};
    case 'rack':
      return {opacity: e, filter: `blur(${(1 - e) * 26}px)`};
    case 'sunwipe': {
      const y = lerp(-20, 135, e);
      return {WebkitMaskImage: `linear-gradient(to top, #000 ${y - 20}%, transparent ${y + 10}%)`, maskImage: `linear-gradient(to top, #000 ${y - 20}%, transparent ${y + 10}%)`} as React.CSSProperties;
    }
    case 'crton': {
      const a = clamp(p / 0.45);
      const b = clamp((p - 0.45) / 0.55);
      return {transform: `scale(${lerp(0.02, 1, eo(a))}, ${lerp(0.006, 1, eo(b))})`, filter: `brightness(${lerp(3, 1, b)})`};
    }
    case 'flash':
    case 'cut':
    default:
      return {opacity: e};
  }
};

// Mareo de cámara por escena: balanceo, separación de color y tono
type Fx = {rot: number; rgb: number; hue: number};
const FX: Record<string, (t: number, d: number, w: (x: string) => number) => Fx> = {
  hook: (t) => ({rot: Math.sin(t * 2.3) * 1.6 + Math.sin(t * 5.1) * 0.5, rgb: 5 + 3 * Math.sin(t * 6), hue: 0}),
  mentiras: (t) => ({rot: Math.sin(t * 1.3) * 0.6, rgb: 1.5, hue: 0}),
  pendientes: (t) => ({rot: Math.sin(t * 1.5) * 1.2, rgb: 1.5, hue: 0}),
  live: (t) => ({rot: 0, rgb: 2 + Math.sin(t * 4) * 1, hue: 0}),
  tiempo: (t, d) => ({rot: lerp(0, -5, eio(clamp(t / d))), rgb: lerp(2, 6, clamp(t / d)), hue: t * 18}),
  bloqueo: (t) => ({rot: 0, rgb: t < 0.6 ? 7 * (1 - t / 0.6) : 0, hue: 0}),
  mareo: (t, d, w) => {
    const k = ramp(t, w('mareo') - 0.2, w('mareo') + 1.2);
    return {rot: 0, rgb: lerp(0, 9, k) * (0.75 + 0.25 * Math.sin(t * 7)), hue: Math.sin(t * 1.3) * 55 * k};
  },
  calma: (t) => ({rot: Math.sin(t * 2) * lerp(1.4, 0, clamp(t / 1.6)), rgb: lerp(4, 0, clamp(t / 1.4)), hue: lerp(30, 0, clamp(t / 1.6))}),
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// Reproductor: mismo diseño y posición que los videos anteriores
const Player: React.FC<{t: number; total: number; title: string; artist: string}> = ({t, total, title, artist}) => {
  const p = clamp(t / total);
  return (
    <div
      style={{
        position: 'absolute',
        left: 222,
        top: 207,
        width: 636,
        height: 120,
        borderRadius: 30,
        background: 'rgba(26,19,14,0.9)',
        border: '2px solid rgba(200,152,60,0.55)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        boxSizing: 'border-box',
        fontFamily: FONT,
      }}
    >
      <div style={{position: 'absolute', left: 26, top: 40, height: 34, display: 'flex', alignItems: 'center', gap: 5}}>
        {Array.from({length: 14}).map((_, i) => {
          const h = 8 + Math.abs(Math.sin(t * (5 + (i % 4)) + i * 1.3) * Math.cos(t * 2.3 + i)) * 22;
          return <div key={i} style={{width: 7, height: h, borderRadius: 4, background: i % 3 === 2 ? CREAM : AMBER, opacity: 0.95}} />;
        })}
      </div>
      <div style={{position: 'absolute', left: 212, top: 30, fontSize: 34, fontWeight: 700, color: CREAM, whiteSpace: 'nowrap', letterSpacing: 0.2}}>
        {title} <span style={{color: AMBER}}>· {artist}</span>
      </div>
      <div style={{position: 'absolute', left: 28, top: 79, fontSize: 21, color: 'rgba(251,240,220,0.8)'}}>{fmt(t)}</div>
      <div style={{position: 'absolute', left: 88, top: 89, width: 460, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.18)'}}>
        <div style={{width: `${p * 100}%`, height: '100%', borderRadius: 3, background: AMBER}} />
        <div style={{position: 'absolute', left: `calc(${p * 100}% - 8px)`, top: -6, width: 16, height: 16, borderRadius: 8, background: CREAM}} />
      </div>
      <div style={{position: 'absolute', left: 568, top: 79, fontSize: 21, color: 'rgba(251,240,220,0.8)'}}>{fmt(total)}</div>
    </div>
  );
};

type Chunk = {words: {w: string; start: number; end: number}[]; start: number; end: number};
const chunksOf = (timings: SentenceTiming[]): Chunk[] => {
  const out: Chunk[] = [];
  timings.forEach((t) => {
    let cur: Chunk['words'] = [];
    t.words.forEach((w, i) => {
      cur.push(w);
      const brk = /[,.;:?!…]$/.test(w.w) || cur.length >= 4;
      if (brk || i === t.words.length - 1) {
        out.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
        cur = [];
      }
    });
  });
  for (let i = 0; i < out.length; i++) out[i].end = i < out.length - 1 ? Math.min(out[i + 1].start, out[i].end + 0.6) : out[i].end + 0.8;
  return out;
};

const Subtitles: React.FC<{t: number; chunks: Chunk[]}> = ({t, chunks}) => {
  const c = chunks.find((k) => t >= k.start - 0.05 && t < k.end);
  if (!c) return null;
  const pop = eo(ramp(t, c.start - 0.05, c.start + 0.12));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1126, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 62,
          lineHeight: 1.15,
          padding: '10px 28px 14px',
          borderRadius: 22,
          background: 'rgba(12,10,9,0.55)',
          color: CREAM,
          maxWidth: 940,
          textAlign: 'center',
          transform: `translateY(${(1 - pop) * 14}px)`,
          opacity: pop,
          textShadow: '0 3px 10px rgba(0,0,0,0.45)',
        }}
      >
        {c.words.map((w, i) => {
          const active = t >= w.start - 0.03 && t < w.end;
          return (
            <span key={i} style={{color: active ? AMBER : CREAM}}>
              {w.w}
              {i < c.words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Flecha grande hacia el botón LIVE (abajo a la izquierda). No se dibuja el botón.
const LiveArrow: React.FC<{t: number}> = ({t}) => {
  const a = eo(ramp(t, 0, 0.35));
  const bob = Math.sin(t * 6.5) * 16;
  const ring = (t * 0.9) % 1;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="arrowGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx={110} cy={1790} r={40 + ring * 90} fill="none" stroke={AMBER} strokeWidth={6} opacity={a * (1 - ring) * 0.7} />
      <g opacity={a} transform={`translate(${-bob} ${bob}) translate(250 1650) scale(${lerp(0.6, 1, a)}) translate(-250 -1650)`} filter="url(#arrowGlow)">
        <g transform="translate(250 1650) rotate(45)">
          <path d="M -34 -230 L 34 -230 L 34 40 L 96 40 L 0 150 L -96 40 L -34 40 Z" fill={CREAM} stroke={AMBER} strokeWidth={12} strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
};

export const HistoriaBadtrip: React.FC<Props> = ({spec, timings, totalSeconds, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const s = spec as SpecBT;
  const chunks = React.useMemo(() => chunksOf(timings), [timings]);

  const layers = s.sentences.map((sen, i) => {
    const T = timings[i];
    const entry = ENTRY[sen.scene] ?? {kind: 'fade', dur: 0.35};
    const from = i === 0 ? 0 : T.sceneStart - entry.dur * 0.6;
    const to = i < timings.length - 1 ? timings[i + 1].sceneStart + 0.6 : totalSeconds + 1;
    if (t < from || t > to) return null;
    const Scene = SCENES[sen.scene];
    const local = t - T.sceneStart;
    const d = (i < timings.length - 1 ? timings[i + 1].sceneStart : totalSeconds) - T.sceneStart;
    const w = (word: string) => {
      const target = norm(word);
      const hit = T.words.find((x) => norm(x.w) === target) ?? T.words.find((x) => norm(x.w).startsWith(target));
      return (hit ? hit.start : T.start) - T.sceneStart;
    };
    const p = i === 0 ? 1 : clamp((t - from) / entry.dur);
    const fx = FX[sen.scene]?.(local, d, w) ?? {rot: 0, rgb: 0, hue: 0};
    const fid = `rgb-${sen.scene}`;
    const es = entryStyle(entry.kind, p, t);
    const innerFilter = fx.hue ? `hue-rotate(${fx.hue}deg)` : '';
    return (
      <AbsoluteFill key={i} style={{...es, overflow: 'hidden'}}>
        <AbsoluteFill style={{transform: fx.rot ? `rotate(${fx.rot}deg) scale(${1 + Math.abs(fx.rot) * 0.035})` : undefined, filter: innerFilter || undefined}}>
          <FxCtx.Provider value={{rgb: fx.rgb, id: fid}}>
            <Scene t={local} d={d} w={w} />
          </FxCtx.Provider>
        </AbsoluteFill>
        {entry.kind === 'flash' && p < 1 && <AbsoluteFill style={{background: '#ffd6f6', opacity: (1 - p) * 0.9}} />}
        {entry.kind === 'glitch' && p < 1 && (
          <AbsoluteFill style={{background: `linear-gradient(0deg, transparent ${(t * 900) % 100}%, rgba(62,224,255,0.35) ${(t * 900) % 100}%, transparent ${((t * 900) % 100) + 6}%)`}} />
        )}
      </AbsoluteFill>
    );
  });

  const last = timings[timings.length - 1];
  return (
    <AbsoluteFill style={{background: '#07041a'}}>
      {layers}
      <Player t={t} total={totalSeconds} title={s.song?.title ?? s.title} artist={s.song?.artist ?? ''} />
      <Subtitles t={t} chunks={chunks} />
      {t >= last.sceneStart && <LiveArrow t={t - last.sceneStart} />}
      <Audio src={staticFile(audioFile)} />
    </AbsoluteFill>
  );
};
