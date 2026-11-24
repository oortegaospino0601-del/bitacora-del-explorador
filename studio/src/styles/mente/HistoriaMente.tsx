// Composición "Historia-mente": historia animada de "Si en tu mente estuve" (Nsqk).
// Reproductor, subtítulos y flecha al LIVE idénticos (mismos componentes) a los videos
// anteriores; escenas, cámara y transiciones propias de este video (nube, persianas,
// corazón, destello de luz, foco, parpadeo y "atravesar").
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions, LiveArrow, Player, Timing, chunkWords} from '../mundo/HistoriaMundo';
import {SCENES} from './escenas';
import {clamp, easeInOut, easeOut, lerp} from './kit';

type SceneSpan = {id: string; start: number; end: number};
export type MenteProps = {
  spec: {slug: string; title: string; player: {song: string; artist: string}};
  timings: Timing[];
  scenes: SceneSpan[];
  totalSeconds: number;
  audioFile: string;
};

const TR = 0.5;

type Tr = 'through' | 'focus' | 'cloud' | 'blinds' | 'heart' | 'leak' | 'blink';
const ENTER: Record<string, {type: Tr; ox?: number; oy?: number}> = {
  typing: {type: 'through', ox: 560, oy: 940},
  seen: {type: 'focus'},
  clouds: {type: 'cloud'},
  street: {type: 'blinds'},
  live: {type: 'heart'},
  butterfly: {type: 'leak'},
  coffee: {type: 'focus'},
  notif: {type: 'blink'},
  dream: {type: 'cloud'},
  question: {type: 'focus'},
  gallery: {type: 'through', ox: 560, oy: 900},
  sunset: {type: 'leak'},
  cta: {type: 'blinds'},
};

/** Borde superior ondulado (como una nube) a la altura y. */
const cloudEdgeY = (p: number) => lerp(2150, -260, easeInOut(p));
const cloudClip = (y: number) => {
  let d = `M0 2100 L0 ${y + 60}`;
  const n = 7;
  for (let i = 0; i < n; i++) {
    const x0 = (1080 / n) * i;
    const x1 = (1080 / n) * (i + 1);
    const bump = 70 + (i % 2) * 40;
    d += ` C${x0 + 10} ${y - bump} ${x1 - 10} ${y - bump} ${x1} ${y + 60}`;
  }
  d += ' L1080 2100 Z';
  return `path('${d}')`;
};
const blindsClip = (p: number) => {
  const n = 10;
  const bh = 1920 / n;
  const e = easeInOut(p);
  let d = '';
  for (let i = 0; i < n; i++) {
    const k = clamp(e * 1.6 - (i % 2 ? 0.15 : 0) - i * 0.03);
    const h = bh * k;
    const cy = bh * i + bh / 2;
    d += `M0 ${cy - h / 2 - 0.5} L1080 ${cy - h / 2 - 0.5} L1080 ${cy + h / 2 + 0.5} L0 ${cy + h / 2 + 0.5} Z `;
  }
  return `path('${d}')`;
};
const heartClip = (p: number, cx = 540, cy = 760) => {
  const s = easeInOut(p) * 34 + 0.01;
  const P = (x: number, y: number) => `${(cx + x * s).toFixed(1)} ${(cy + y * s).toFixed(1)}`;
  const d = `M${P(0, 30)} C${P(-10, 20)} ${P(-50, -5)} ${P(-50, -30)} C${P(-50, -50)} ${P(-32, -62)} ${P(-18, -62)} C${P(-8, -62)} ${P(0, -55)} ${P(0, -47)} C${P(0, -55)} ${P(8, -62)} ${P(18, -62)} C${P(32, -62)} ${P(50, -50)} ${P(50, -30)} C${P(50, -5)} ${P(10, 20)} ${P(0, 30)} Z`;
  return `path('${d}')`;
};

const enterStyle = (id: string, p: number): React.CSSProperties => {
  const tr = ENTER[id];
  if (!tr || p >= 1) return {};
  const e = easeInOut(p);
  switch (tr.type) {
    case 'through':
      return {opacity: clamp((p - 0.25) / 0.5), transform: `scale(${1.18 - 0.18 * e})`};
    case 'focus':
      return {opacity: e, filter: `blur(${(1 - e) * 24}px)`, transform: `scale(${1.07 - 0.07 * e})`};
    case 'cloud':
      return {clipPath: cloudClip(cloudEdgeY(p))};
    case 'blinds':
      return {clipPath: blindsClip(p)};
    case 'heart':
      return {clipPath: heartClip(p)};
    case 'leak':
      return {opacity: clamp((p - 0.3) / 0.35)};
    case 'blink':
      return {opacity: p >= 0.5 ? 1 : 0};
  }
  return {};
};

const exitStyle = (nextId: string | undefined, q: number): React.CSSProperties => {
  if (!nextId || q <= 0) return {};
  const tr = ENTER[nextId];
  const e = easeInOut(q);
  switch (tr?.type) {
    case 'through':
      return {transform: `scale(${1 + 2.2 * easeOut(q) * e})`, transformOrigin: `${tr.ox}px ${tr.oy}px`, filter: `blur(${e * 6}px)`};
    case 'focus':
      return {filter: `blur(${e * 24}px)`, transform: `scale(${1 + 0.04 * e})`};
    case 'cloud':
      return {transform: `translateY(${-e * 160}px)`};
    case 'heart':
      return {transform: `scale(${1 - 0.08 * e})`, filter: `brightness(${1 - 0.35 * e})`};
    case 'leak':
      return {filter: `brightness(${1 + 0.5 * e})`};
    default:
      return {};
  }
};

/** Efectos sobre la imagen durante algunas transiciones (borde de nube, destello, párpados). */
const TransitionFx: React.FC<{type: Tr; p: number}> = ({type, p}) => {
  if (p <= 0 || p >= 1) return null;
  if (type === 'cloud') {
    const y = cloudEdgeY(p);
    return (
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 9}).map((_, i) => (
          <circle key={i} cx={-40 + i * 145} cy={y + 30 + (i % 2) * 30} r={110 + (i % 3) * 30} fill="#fff7f2" opacity={0.85} />
        ))}
      </svg>
    );
  }
  if (type === 'leak') {
    const x = lerp(-900, 1500, easeInOut(p));
    return (
      <AbsoluteFill style={{
        background: `linear-gradient(115deg, transparent ${x - 500}px, rgba(255,214,170,0.0) ${x - 300}px, rgba(255,236,200,0.95) ${x}px, rgba(255,190,170,0.0) ${x + 300}px, transparent ${x + 500}px)`,
        mixBlendMode: 'screen',
      }} />
    );
  }
  if (type === 'blink') {
    const c = Math.sin(Math.PI * p);
    const hgt = 980 * easeInOut(c);
    return (
      <>
        <div style={{position: 'absolute', left: -100, width: 1280, top: -40, height: hgt + 40, background: '#141833', borderBottomLeftRadius: '50% 120px', borderBottomRightRadius: '50% 120px'}} />
        <div style={{position: 'absolute', left: -100, width: 1280, bottom: -40, height: hgt + 40, background: '#141833', borderTopLeftRadius: '50% 120px', borderTopRightRadius: '50% 120px'}} />
      </>
    );
  }
  return null;
};

export const HistoriaMente: React.FC<MenteProps> = ({spec, timings, scenes, totalSeconds, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunks = React.useMemo(() => chunkWords(timings, totalSeconds), [timings, totalSeconds]);
  const ctaStart = scenes.find((s) => s.id === 'cta')?.start ?? totalSeconds;
  const fx = scenes.map((sc, i) => (i === 0 ? null : {type: ENTER[sc.id]?.type, p: (t - sc.start) / TR})).find((x) => x && x.type && x.p > 0 && x.p < 1);
  return (
    <AbsoluteFill style={{background: '#141833', overflow: 'hidden'}}>
      {scenes.map((sc, i) => {
        const next = scenes[i + 1];
        const visEnd = next ? sc.end + TR : totalSeconds + 1;
        if (t < sc.start || t >= visEnd) return null;
        const Comp = SCENES[sc.id];
        const local = t - sc.start;
        const words = timings.filter((x) => x.scene === sc.id).flatMap((x) => x.words);
        const at = (w: string, fb = 0) => {
          const hit = words.find((x) => x.w === w) ?? words.find((x) => x.w.replace(/[^\wáéíóúñü]/gi, '') === w.replace(/[^\wáéíóúñü]/gi, ''));
          return hit ? hit.start - sc.start : fb;
        };
        const p = i === 0 ? 1 : clamp(local / TR);
        const q = next ? clamp((t - sc.end) / TR) : 0;
        const st = {...exitStyle(next?.id, q), ...(p < 1 ? enterStyle(sc.id, p) : {})};
        return (
          <AbsoluteFill key={sc.id} style={{...st, willChange: 'transform'}}>
            <Comp t={local} d={sc.end - sc.start} at={at} />
          </AbsoluteFill>
        );
      })}
      {fx && fx.type && <TransitionFx type={fx.type} p={fx.p} />}
      {/* atmósfera común: zona baja oscura para subtítulos y viñeta suave */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(20,24,51,0) 0%, rgba(20,24,51,0) 56%, rgba(20,24,51,0.5) 64%, rgba(20,24,51,0.92) 74%, #141833 100%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 58%, rgba(12,14,36,0.4) 100%)'}} />
      <Player t={t} total={totalSeconds} song={spec.player.song} artist={spec.player.artist} />
      <Captions t={t} chunks={chunks} />
      <LiveArrow t={t - ctaStart} />
      <Audio src={staticFile(audioFile)} />
    </AbsoluteFill>
  );
};
