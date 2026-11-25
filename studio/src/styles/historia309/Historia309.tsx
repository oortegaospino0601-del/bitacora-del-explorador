import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/fraunces/latin-600.css';
import '@fontsource/fraunces/latin-700.css';
import '@fontsource/fraunces/latin-800.css';
import {Props, SentenceTiming} from '../../types';
import {SCENES} from './scenes';
import {clamp, eio, eo, lerp, ramp} from './kit';

const FONT = "'Fraunces', Georgia, serif";
const AMBER = '#f5b942';
const CREAM = '#fbf0dc';

type Spec309 = Props['spec'] & {song?: {title: string; artist: string}; sentences: {text: string; scene: string}[]};

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zñ]/g, '');

// Entrada de cada escena: cada una distinta (no se repite la secuencia de otros videos)
const ENTRY: Record<string, {kind: string; dur: number}> = {
  antes: {kind: 'bloom', dur: 0.5},
  manos: {kind: 'zoomin', dur: 0.3},
  puerta: {kind: 'rainwipe', dur: 0.45},
  rutina: {kind: 'slideup', dur: 0.45},
  chat: {kind: 'phonepop', dur: 0.4},
  llamada: {kind: 'spin', dur: 0.4},
  galeria: {kind: 'swipe', dur: 0.4},
  perdido: {kind: 'iris', dur: 0.5},
  live: {kind: 'slidedown', dur: 0.45},
  vacio: {kind: 'dim', dur: 0.4},
  tiempo: {kind: 'blur', dur: 0.45},
  amanecer: {kind: 'fade', dur: 0.35},
  cierre: {kind: 'rise', dur: 0.6},
};

const entryStyle = (kind: string, p: number): React.CSSProperties => {
  const e = eio(p);
  switch (kind) {
    case 'zoomin':
      return {opacity: e, transform: `scale(${lerp(1.25, 1, e)})`};
    case 'rainwipe': {
      const x = lerp(-30, 130, e);
      return {clipPath: `polygon(0% 0%, ${x}% 0%, ${x - 30}% 100%, 0% 100%)`};
    }
    case 'slideup':
      return {transform: `translateY(${(1 - e) * 1920}px)`};
    case 'slidedown':
      return {transform: `translateY(${-(1 - e) * 1920}px)`};
    case 'phonepop':
      return {clipPath: `inset(${(1 - e) * 40}% ${(1 - e) * 30}% ${(1 - e) * 40}% ${(1 - e) * 30}% round ${(1 - e) * 80}px)`, transform: `scale(${lerp(0.7, 1, e)})`};
    case 'spin':
      return {opacity: e, transform: `rotate(${(1 - e) * 25}deg) scale(${lerp(1.4, 1, e)})`};
    case 'swipe':
      return {transform: `translateX(${(1 - e) * 1080}px)`};
    case 'iris':
      return {clipPath: `circle(${e * 120}% at 50% 40%)`};
    case 'blur':
      return {opacity: e, filter: `blur(${(1 - e) * 18}px)`};
    case 'rise':
      return {opacity: e, transform: `translateY(${(1 - e) * 500}px)`};
    case 'dim':
    case 'bloom':
    case 'fade':
    default:
      return {opacity: e};
  }
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
      <g opacity={a} transform={`translate(${-bob} ${bob}) translate(250 1650) scale(${lerp(0.6, 1, a)}) translate(-250 -1650)`} filter="url(#arrowGlow)">
        <g transform="translate(250 1650) rotate(45)">
          <path d="M -34 -230 L 34 -230 L 34 40 L 96 40 L 0 150 L -96 40 L -34 40 Z" fill={CREAM} stroke={AMBER} strokeWidth={12} strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
};

export const Historia309: React.FC<Props> = ({spec, timings, totalSeconds, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const s = spec as Spec309;
  const chunks = React.useMemo(() => chunksOf(timings), [timings]);

  const layers = s.sentences.map((sen, i) => {
    const T = timings[i];
    const entry = ENTRY[sen.scene] ?? {kind: 'fade', dur: 0.35};
    const from = i === 0 ? 0 : T.sceneStart - entry.dur * 0.6;
    const to = (i < timings.length - 1 ? timings[i + 1].sceneStart + 0.45 : totalSeconds + 1);
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
    return (
      <AbsoluteFill key={i} style={{...entryStyle(entry.kind, p), overflow: 'hidden'}}>
        <Scene t={local} d={d} w={w} />
        {entry.kind === 'bloom' && p < 1 && (
          <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(207,227,255,1) 0%, rgba(127,188,255,0.75) 40%, rgba(127,188,255,0) 80%)', opacity: 1 - p}} />
        )}
        {entry.kind === 'dim' && p < 1 && <AbsoluteFill style={{background: '#000', opacity: (1 - p) * 0.8}} />}
      </AbsoluteFill>
    );
  });

  const last = timings[timings.length - 1];
  return (
    <AbsoluteFill style={{background: '#070b16'}}>
      {layers}
      <Player t={t} total={totalSeconds} title={s.song?.title ?? s.title} artist={s.song?.artist ?? ''} />
      <Subtitles t={t} chunks={chunks} />
      {t >= last.sceneStart && <LiveArrow t={t - last.sceneStart} />}
      <Audio src={staticFile(audioFile)} />
    </AbsoluteFill>
  );
};
