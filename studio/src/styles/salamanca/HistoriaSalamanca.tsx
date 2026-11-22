// Composición "Historia-salamanca": historia ilustrada con narración, reproductor de música
// (marca del canal), subtítulos palabra por palabra y flecha al LIVE en el cierre.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/800.css';
import '@fontsource/fraunces/900.css';
import {Props, SentenceTiming, Word} from '../../types';
import {SCENES} from './scenes';
import {rnd} from './kit';

const FONT = "'Fraunces', Georgia, serif";
const GOLD = '#f0b43c';
const PAD = 0.32; // media duración de cada transición (s)

type SceneMeta = {id: string; transition?: string};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

/** Estilo de la escena según la transición de entrada/salida. */
const sceneStyle = (T: number, start: number, end: number, inType?: string, outType?: string, first = false, last = false) => {
  const style: React.CSSProperties = {};
  const tf: string[] = [];
  const filters: string[] = [];
  let opacity = 1;
  let clip: string | undefined;
  if (!first && inType && T < start + PAD) {
    const p = smooth((T - (start - PAD)) / (2 * PAD));
    if (inType === 'whip') {
      tf.push(`translateX(${(1 - p) * 1080}px)`);
      filters.push(`blur(${(1 - p) * 22}px)`);
    } else if (inType === 'smoke') {
      opacity = p;
      filters.push(`blur(${(1 - p) * 16}px)`);
      tf.push(`scale(${1.05 - 0.05 * p})`);
    } else if (inType === 'tilt') {
      const x = 1680 - p * 1680;
      clip = `polygon(${x}px 0px, 1080px 0px, 1080px 1920px, ${x - 600}px 1920px)`;
    } else if (inType === 'zoom') {
      opacity = p;
      tf.push(`scale(${0.72 + 0.28 * p})`);
    } else if (inType === 'flash') {
      opacity = clamp01((p - 0.35) / 0.3);
    } else if (inType === 'iris') {
      clip = `circle(${p * 1250}px at 540px 820px)`;
    }
  }
  if (!last && outType && T > end - PAD) {
    const p = smooth((T - (end - PAD)) / (2 * PAD));
    if (outType === 'whip') {
      tf.push(`translateX(${-p * 1080}px)`);
      filters.push(`blur(${p * 22}px)`);
    } else if (outType === 'smoke') {
      filters.push(`blur(${p * 8}px)`);
    } else if (outType === 'tilt') {
      tf.push(`rotate(${-p * 3}deg) scale(${1 + p * 0.06})`);
    } else if (outType === 'zoom') {
      tf.push(`scale(${1 + p * 2.2})`);
      opacity = Math.min(opacity, 1 - p * 0.6);
    } else if (outType === 'iris') {
      filters.push(`brightness(${1 - p * 0.6})`);
    }
  }
  if (tf.length) style.transform = tf.join(' ');
  if (filters.length) style.filter = filters.join(' ');
  if (clip) style.clipPath = clip;
  style.opacity = opacity;
  return style;
};

/* ------------------------------ reproductor de música (igual que en videos anteriores) */
const Player: React.FC<{T: number; total: number; song: string; artist: string}> = ({T, total, song, artist}) => {
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const prog = clamp01(T / total);
  const label = `${song} · ${artist}`;
  const fs = label.length > 24 ? Math.round(34 * 24 / label.length) : 34;
  return (
    <div style={{position: 'absolute', left: 220, top: 207, width: 640, height: 120, borderRadius: 30,
      background: 'rgba(28,14,12,0.86)', border: '2px solid rgba(240,180,60,0.45)', boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
      fontFamily: FONT}}>
      {/* ecualizador */}
      <div style={{position: 'absolute', left: 28, top: 42, height: 30, display: 'flex', alignItems: 'flex-end', gap: 5}}>
        {Array.from({length: 12}).map((_, i) => {
          const h = 8 + Math.abs(Math.sin(T * (5 + rnd(i) * 4) + i * 1.3)) * 18 * (1 - i / 22);
          return <div key={i} style={{width: 6, height: h, borderRadius: 3, background: i < 8 ? GOLD : '#f5e9d8', opacity: i < 8 ? 1 : 0.8}} />;
        })}
      </div>
      <div style={{position: 'absolute', left: 170, right: 22, top: 22, height: 50, display: 'flex', alignItems: 'center',
        justifyContent: 'flex-end', whiteSpace: 'nowrap', fontSize: fs, fontWeight: 600, color: '#f8efe4'}}>
        {song}
        <span style={{color: GOLD, marginLeft: 8}}>· {artist}</span>
      </div>
      <div style={{position: 'absolute', left: 28, top: 78, fontSize: 21, color: '#d8cbbb', fontWeight: 600}}>{fmt(T)}</div>
      <div style={{position: 'absolute', right: 28, top: 78, fontSize: 21, color: '#d8cbbb', fontWeight: 600}}>{fmt(total)}</div>
      <div style={{position: 'absolute', left: 90, width: 460, top: 89, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.18)'}}>
        <div style={{width: `${prog * 100}%`, height: '100%', borderRadius: 3, background: GOLD}} />
        <div style={{position: 'absolute', left: `calc(${prog * 100}% - 8px)`, top: -6, width: 16, height: 16, borderRadius: 8, background: '#fff'}} />
      </div>
    </div>
  );
};

/* ------------------------------ subtítulos por grupos con palabra activa en dorado */
type Group = {words: Word[]; start: number; end: number};
const groupWords = (timings: SentenceTiming[]): Group[] => {
  const groups: Group[] = [];
  timings.forEach((t) => {
    let cur: Word[] = [];
    const flush = () => {
      if (cur.length) groups.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
      cur = [];
    };
    t.words.forEach((w) => {
      const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length;
      if (cur.length >= 3 || len > 19) flush();
      cur.push(w);
      if (/[.,;:?!…]$/.test(w.w)) flush();
    });
    flush();
  });
  for (let i = 0; i < groups.length; i++) {
    const next = groups[i + 1];
    groups[i].end = next ? Math.min(next.start, groups[i].end + 0.6) : groups[i].end + 0.6;
  }
  return groups;
};

const Captions: React.FC<{T: number; groups: Group[]}> = ({T, groups}) => {
  const g = groups.find((x) => T >= x.start - 0.02 && T < x.end);
  if (!g) return null;
  const pop = clamp01((T - g.start) / 0.12);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1130, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: 'rgba(22,8,11,0.74)', borderRadius: 30, padding: '16px 34px 22px', fontFamily: FONT, fontWeight: 800,
        fontSize: 74, lineHeight: 1.12, color: '#fbf1e6', textAlign: 'center', maxWidth: 940,
        transform: `scale(${0.94 + 0.06 * pop})`, textShadow: '0 3px 12px rgba(0,0,0,0.5)'}}>
        {g.words.map((w, i) => {
          const active = T >= w.start - 0.03 && T < w.end + 0.02;
          return (
            <span key={i} style={{color: active ? GOLD : '#fbf1e6'}}>
              {w.w}
              {i < g.words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------ flecha hacia el botón LIVE (abajo a la izquierda) */
const LiveArrow: React.FC<{T: number; from: number}> = ({T, from}) => {
  const {fps} = useVideoConfig();
  if (T < from) return null;
  const sc = spring({frame: Math.round((T - from) * fps), fps, config: {damping: 11, stiffness: 140}});
  const bob = Math.sin((T - from) * 6) * 22;
  const glow = 0.7 + 0.3 * Math.sin((T - from) * 6);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="arrow-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g transform={`translate(${340 - bob * 0.7} ${1540 + bob * 0.7}) rotate(135) scale(${sc})`} filter="url(#arrow-glow)">
        <path d="M0 -30 L150 -30 L150 -82 L262 0 L150 82 L150 30 L0 30 Z" fill="#f7eee6" stroke={GOLD} strokeWidth={12}
          strokeLinejoin="round" opacity={glow * 0.3 + 0.7} />
      </g>
    </svg>
  );
};

const Grain: React.FC<{frame: number}> = ({frame}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.22}}>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={Math.floor(frame / 2) % 50} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={1080} height={1920} filter="url(#grain)" />
  </svg>
);

export const HistoriaSalamanca: React.FC<Props> = ({spec, timings, totalSeconds, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const T = frame / fps;
  const metas = spec.sentences.map((s) => s.scene as unknown as SceneMeta);
  const n = timings.length;
  const starts = timings.map((t, i) => (i === 0 ? 0 : t.sceneStart));
  const ends = timings.map((_, i) => (i < n - 1 ? starts[i + 1] : totalSeconds + 1));
  const groups = React.useMemo(() => groupWords(timings), [timings]);
  const extra = spec as unknown as {song?: string; artist?: string};

  // flash entre escenas
  let flash = 0;
  for (let i = 0; i < n - 1; i++) {
    if (metas[i].transition === 'flash') {
      const b = starts[i + 1];
      flash = Math.max(flash, 1 - Math.abs(T - b) / PAD);
    }
  }

  return (
    <AbsoluteFill style={{background: '#0b0406', overflow: 'hidden'}}>
      <Audio src={staticFile(audioFile)} />
      {metas.map((m, i) => {
        const st = starts[i];
        const en = ends[i];
        if (T < st - PAD || T > en + PAD) return null;
        const Comp = SCENES[m.id];
        if (!Comp) return null;
        const style = sceneStyle(T, st, en, i > 0 ? metas[i - 1].transition : undefined, m.transition, i === 0, i === n - 1);
        return (
          <AbsoluteFill key={i} style={style}>
            <Comp t={T - st} d={en - st} />
          </AbsoluteFill>
        );
      })}
      {flash > 0 && <AbsoluteFill style={{background: '#ffd9d2', opacity: Math.max(0, flash) * 0.85}} />}
      {/* viñeta */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)'}} />
      <Grain frame={frame} />
      <Player T={T} total={totalSeconds} song={extra.song ?? spec.title} artist={extra.artist ?? ''} />
      <Captions T={T} groups={groups} />
      <LiveArrow T={T} from={starts[n - 1]} />
    </AbsoluteFill>
  );
};
