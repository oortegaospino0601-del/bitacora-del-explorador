// Historia animada de "Luciérnagas" (Milo J y Silvio Rodríguez). Solo voz; la canción se añade en TikTok.
import '@fontsource/fraunces/latin-700.css';
import '@fontsource/fraunces/latin-800.css';
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, Defs, clamp, ease, easeOut, ff, rnd} from './Lib';
import {SCENES} from './Scenes';

type Word = {w: string; start: number; end: number};
type Timing = {start: number; end: number; sceneStart: number; sceneEnd: number; words: Word[]};
export type HistoriaProps = {
  spec: {slug: string; title: string; song: string; artists: string; sentences: {text: string}[]};
  timings: Timing[];
  totalSeconds: number;
  audioFile: string;
};

const SERIF = 'Fraunces, Georgia, serif';
const TR = 0.55; // duración de transición

// transición de entrada de cada escena (todas distintas de los videos anteriores)
type Tr = {kind: 'iris' | 'dissolve' | 'wipeUp' | 'flash'; x?: number; y?: number};
const TRANS: Tr[] = [
  {kind: 'dissolve'},
  {kind: 'iris', x: 560, y: 760},
  {kind: 'iris', x: 540, y: 1000},
  {kind: 'dissolve'},
  {kind: 'wipeUp'},
  {kind: 'flash'},
  {kind: 'dissolve'},
  {kind: 'iris', x: 540, y: 760},
  {kind: 'dissolve'},
  {kind: 'wipeUp'},
];

const sceneStyle = (tr: Tr, p: number): React.CSSProperties => {
  if (p >= 1) return {};
  const e = ease(p);
  switch (tr.kind) {
    case 'iris':
      return {clipPath: `circle(${Math.max(0.1, e * 1500)}px at ${tr.x}px ${tr.y}px)`};
    case 'wipeUp': {
      const edge = 100 - e * 125;
      const m = `linear-gradient(to bottom, transparent ${edge}%, black ${edge + 25}%)`;
      return {WebkitMaskImage: m, maskImage: m};
    }
    case 'flash':
      return {opacity: clamp(p * 2.2)};
    default:
      return {opacity: e};
  }
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// Reproductor (mismo diseño y posición que los videos anteriores)
const Player: React.FC<{t: number; total: number; song: string; artists: string}> = ({t, total, song, artists}) => {
  const p = clamp(t / total);
  return (
    <div
      style={{
        position: 'absolute', left: 200, top: 206, width: 680, height: 120, boxSizing: 'border-box',
        borderRadius: 24, background: 'rgba(28,18,14,0.80)', border: '2px solid rgba(222,170,80,0.55)',
        padding: '16px 24px 0 24px', fontFamily: SERIF, color: C.cream, boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{display: 'flex', alignItems: 'flex-end', height: 46, gap: 14}}>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 4, height: 40, width: 100, flexShrink: 0}}>
          {Array.from({length: 11}).map((_, i) => {
            const h = 7 + 31 * Math.abs(Math.sin(t * (3.1 + (i % 4) * 0.9) + i * 1.3) * Math.cos(t * 1.7 + i * 0.6));
            return <div key={i} style={{width: 5, height: h, borderRadius: 3, background: i % 2 ? C.cream : C.gold}} />;
          })}
        </div>
        <div style={{flex: 1, textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 800, fontSize: 24, lineHeight: '40px', overflow: 'hidden'}}>
          {song} <span style={{color: C.gold}}>· {artists}</span>
        </div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 10, fontSize: 21, fontWeight: 700, color: 'rgba(255,246,230,0.85)'}}>
        <span style={{width: 50}}>{fmt(t)}</span>
        <div style={{flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.18)', position: 'relative'}}>
          <div style={{width: `${p * 100}%`, height: 6, borderRadius: 3, background: C.gold}} />
          <div style={{position: 'absolute', left: `calc(${p * 100}% - 9px)`, top: -6, width: 18, height: 18, borderRadius: 9, background: '#fff'}} />
        </div>
        <span style={{width: 50, textAlign: 'right'}}>{fmt(total)}</span>
      </div>
    </div>
  );
};

// Subtítulos por grupos cortos, palabra activa en dorado (como los videos anteriores)
const chunksOf = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w) => {
    cur.push(w);
    if (cur.length >= 3 || /[,.:;?!…]$/.test(w.w)) {
      out.push(cur);
      cur = [];
    }
  });
  if (cur.length) out.push(cur);
  return out;
};

const Captions: React.FC<{t: number; timings: Timing[]}> = ({t, timings}) => {
  for (let si = 0; si < timings.length; si++) {
    const tm = timings[si];
    const nextStart = si < timings.length - 1 ? timings[si + 1].start : tm.end + 0.6;
    if (t < tm.start - 0.02 || t >= nextStart) continue;
    const ch = chunksOf(tm.words);
    let idx = ch.findIndex((c, k) => t >= c[0].start - 0.02 && (k === ch.length - 1 || t < ch[k + 1][0].start));
    if (idx < 0) idx = 0;
    const c = ch[idx];
    const pop = si === 0 && idx === 0 ? 1 : easeOut((t - c[0].start) / 0.14);
    return (
      <div style={{position: 'absolute', left: 60, right: 60, top: 1150, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            fontFamily: SERIF, fontWeight: 800, fontSize: 64, lineHeight: 1.15, color: C.cream, textAlign: 'center',
            background: 'rgba(24,16,12,0.55)', borderRadius: 18, padding: '8px 26px 12px',
            transform: `scale(${0.9 + 0.1 * pop})`, opacity: 0.4 + 0.6 * pop, textShadow: '0 3px 10px rgba(0,0,0,0.5)',
          }}
        >
          {c.map((w, k) => (
            <span key={k} style={{color: t >= w.start && t < w.end + 0.05 ? C.gold : C.cream}}>
              {w.w}
              {k < c.length - 1 ? ' ' : ''}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Flecha brillante hacia el botón LIVE (abajo a la izquierda). No se dibuja el botón.
const LiveArrow: React.FC<{t: number}> = ({t}) => {
  const inP = easeOut(t / 0.45);
  const bob = Math.sin(t * 5.5) * 16;
  const dx = -0.7071, dy = 0.7071;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 14}).map((_, i) => {
        const p = ((t * 0.55 + i / 14) % 1);
        const x = 620 + dx * p * 520 + Math.sin(i * 3 + t * 3) * 26;
        const y = 1330 + dy * p * 520 + Math.cos(i * 2 + t * 3) * 26;
        return ff(i, x, y, 4.5, Math.sin(p * Math.PI) * inP);
      })}
      <g transform={`translate(${300 + dx * bob} ${1610 + dy * bob}) rotate(135) scale(${1.3 * inP})`} style={{filter: 'drop-shadow(0 0 14px #F4B942) drop-shadow(0 0 30px rgba(244,185,66,0.7))'}}>
        <path d="M-150,-30 L40,-30 L40,-92 L170,0 L40,92 L40,30 L-150,30 Z" fill="#FFF8E6" stroke={C.gold} strokeWidth={10} strokeLinejoin="round" />
      </g>
    </svg>
  );
};

export const HistoriaLuciernagas: React.FC<HistoriaProps> = ({spec, timings, totalSeconds, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const starts = timings.map((x, i) => (i === 0 ? 0 : x.sceneStart));
  const ends = timings.map((_, i) => (i < timings.length - 1 ? starts[i + 1] + TR : totalSeconds + 1));
  const lastStart = starts[starts.length - 1];
  const fl = SCENES.map((_, i) => (TRANS[i].kind === 'flash' ? clamp(1 - Math.abs(t - starts[i] - TR * 0.45) / (TR * 0.6)) : 0)).reduce((a, b) => Math.max(a, b), 0);
  return (
    <AbsoluteFill style={{background: C.night0}}>
      <Defs />
      {SCENES.map((S, i) => {
        if (t < starts[i] || t >= ends[i]) return null;
        const lt = t - starts[i];
        const dur = (i < timings.length - 1 ? starts[i + 1] : totalSeconds) - starts[i];
        const p = i === 0 ? 1 : lt / TR;
        return (
          <AbsoluteFill key={i} style={sceneStyle(TRANS[i], p)}>
            <S t={lt} d={dur} />
          </AbsoluteFill>
        );
      })}
      {fl > 0 ? <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(255,236,170,0.95), rgba(255,214,120,0.5) 60%, rgba(255,200,110,0.2))', opacity: fl}} /> : null}
      <Player t={t} total={totalSeconds} song={spec.song} artists={spec.artists} />
      <Captions t={t} timings={timings} />
      {t >= lastStart ? <LiveArrow t={t - lastStart} /> : null}
      <Audio src={staticFile(audioFile)} />
    </AbsoluteFill>
  );
};
