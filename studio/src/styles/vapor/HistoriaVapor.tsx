import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Props} from '../../types';
import {Player, Subs, LiveArrow} from '../cancion/HistoriaCancion';
import {Defs, ease, lerp} from '../cancion/kit';
import {SCENES, VDefs} from './escenas';

// «Cuando El Agua Hirviendo» (Milo J): misma marca de la serie del reproductor
// (reproductor, subtítulos, grano, personajes y flecha al LIVE idénticos) con una puesta
// en escena propia: paleta verde azulada de madrugada + recuerdos en sepia, cámaras de
// grúa, rotación, dolly zoom, cambio de foco y plano cenital, y transiciones nuevas
// (foto que crece, desenfoque, persianas, niebla de vapor, luz que se apaga, rebobinado,
// gota, giro y destello cálido).

const TR = 0.7;

type In = 'polaroid' | 'focus' | 'blinds' | 'steam' | 'lightoff' | 'rewind' | 'drip' | 'roll' | 'leak' | 'dissolve' | undefined;
const INSTANT: In[] = ['steam', 'lightoff'];

const enter = (kind: In, p: number): {outer: React.CSSProperties; frame?: number} => {
  const e = ease(p);
  switch (kind) {
    case 'polaroid':
      return {outer: {transform: `scale(${lerp(0.34, 1, e)}) rotate(${lerp(-8, 0, e)}deg)`, transformOrigin: '50% 40%', opacity: Math.min(1, p * 4)}, frame: 1 - e};
    case 'focus':
      return {outer: {opacity: e, filter: p < 1 ? `blur(${(1 - e) * 22}px)` : undefined}};
    case 'blinds': {
      const h = e * 160;
      const m = `repeating-linear-gradient(180deg, #000 0px, #000 ${h}px, transparent ${h}px, transparent 160px)`;
      return {outer: p < 1 ? {WebkitMaskImage: m, maskImage: m} : {}};
    }
    case 'rewind':
      return {outer: {opacity: Math.min(1, p * 2.2), transform: `translateX(${Math.sin(p * 40) * (1 - e) * 70}px)`, filter: p < 1 ? `saturate(${lerp(0.2, 1, e)}) brightness(${lerp(1.5, 1, e)})` : undefined}};
    case 'drip':
      return {outer: {clipPath: `circle(${lerp(0, 1350, Math.pow(e, 1.3))}px at 540px 720px)`}};
    case 'roll':
      return {outer: {opacity: e, transform: `rotate(${lerp(28, 0, e)}deg) scale(${lerp(1.45, 1, e)})`, transformOrigin: '50% 37.5%'}};
    case 'leak':
    case 'dissolve':
      return {outer: {opacity: e}};
    default:
      return {outer: {}};
  }
};

const leave = (next: In, q: number): React.CSSProperties => {
  const e = ease(q);
  switch (next) {
    case 'polaroid':
      return {filter: `brightness(${lerp(1, 0.55, e)})`};
    case 'focus':
      return {filter: `blur(${e * 22}px)`};
    case 'rewind':
      return {transform: `translateX(${-Math.sin(q * 46) * e * 60}px)`, filter: `blur(${e * 6}px)`};
    case 'roll':
      return {transform: `rotate(${-e * 24}deg) scale(${lerp(1, 0.7, e)})`, transformOrigin: '50% 37.5%', opacity: 1 - e};
    default:
      return {};
  }
};

// niebla de vapor que cubre la pantalla en el corte
const Fog: React.FC<{a: number; t: number}> = ({a, t}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    <defs>
      <filter id="fogBlur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="50" />
      </filter>
    </defs>
    <rect width={1080} height={1920} fill="#dfe8ea" opacity={a * 0.38} />
    <g filter="url(#fogBlur)" opacity={a * 0.85}>
      {Array.from({length: 14}).map((_, i) => {
        const x = ((i * 397) % 1080) + Math.sin(t * 0.8 + i) * 60;
        const y = 1920 - ((i * 233) % 1700) - t * 260 - (1 - a) * 300;
        return <ellipse key={i} cx={x} cy={((y % 2100) + 2100) % 2100 - 100} rx={300} ry={360} fill="#f2f6f7" opacity={0.85} />;
      })}
    </g>
  </svg>
);

export const HistoriaVapor: React.FC<Props> = ({spec, timings, totalSeconds, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const s = spec as unknown as {song?: string; artist?: string; sentences: {scene: {type: string; in?: In}}[]};
  const last = timings.length - 1;
  const kindOf = (i: number) => s.sentences[i]?.scene?.in;

  // efectos globales alrededor de cada corte
  let fog = 0;
  let dark = 0;
  let leak = 0;
  let streak = 0;
  let drop: number | null = null;
  let ring = -1;
  timings.forEach((tm, i) => {
    if (i === 0) return;
    const c = tm.sceneStart;
    const k = kindOf(i);
    if (k === 'steam' && t > c - 0.35 && t < c + 0.7) fog = Math.max(fog, t < c ? ease((t - (c - 0.35)) / 0.35) : 1 - ease((t - c) / 0.7));
    if (k === 'lightoff' && t > c - 0.2 && t < c + 0.7) dark = Math.max(dark, t < c ? ease((t - (c - 0.2)) / 0.2) : 1 - ease((t - c) / 0.7));
    if (k === 'leak' && Math.abs(t - c) < 0.8) leak = Math.max(leak, 1 - Math.abs(t - c) / 0.8);
    if (k === 'rewind' && Math.abs(t - c) < 0.5) streak = Math.max(streak, 1 - Math.abs(t - c) / 0.5);
    if (k === 'drip' && t > c - 0.45 && t < c) drop = (t - (c - 0.45)) / 0.45;
    if (k === 'drip' && t >= c && t < c + 0.9) ring = (t - c) / 0.9;
  });

  return (
    <AbsoluteFill style={{background: '#11181b'}}>
      <Audio src={staticFile(audioFile)} />
      {timings.map((tm, i) => {
        const start = tm.sceneStart;
        const nextStart = i === last ? Infinity : timings[i + 1].sceneStart;
        const end = i === last ? totalSeconds + 1 : nextStart + TR;
        if (t < start - 0.01 || t > end) return null;
        const nextKind = kindOf(i + 1);
        if (i < last && INSTANT.includes(nextKind) && t >= nextStart) return null;
        const local = t - start;
        const kind = kindOf(i);
        const inst = i === 0 || INSTANT.includes(kind);
        const {outer, frame: pf} = inst ? {outer: {}, frame: undefined} : enter(kind, Math.min(1, local / TR));
        const outStyle = t > nextStart ? leave(nextKind, Math.min(1, (t - nextStart) / TR)) : {};
        const Comp = SCENES[s.sentences[i]?.scene?.type ?? 'boil'];
        const dur = (i === last ? totalSeconds : nextStart) - start;
        return (
          <AbsoluteFill key={i} style={{...outStyle}}>
            <AbsoluteFill style={{...outer, overflow: 'hidden'}}>
              <svg width={1080} height={1920} viewBox="0 0 1080 1920">
                <Defs />
                <VDefs />
                <Comp t={local} d={dur} />
              </svg>
              {pf !== undefined && pf > 0.001 && <AbsoluteFill style={{boxShadow: `inset 0 0 0 ${pf * 44}px #f5ecdc, inset 0 -${pf * 150}px 0 0 #f5ecdc`}} />}
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })}
      {/* suelo hacia la zona baja (subtítulos y botones de TikTok) */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,15,17,0) 58%, rgba(10,15,17,0.35) 72%, rgba(10,15,17,0.6) 100%)'}} />
      {/* viñeta y grano (igual que la serie) */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.3) 100%)'}} />
      <AbsoluteFill style={{overflow: 'hidden', opacity: 0.09, mixBlendMode: 'overlay'}}>
        <div style={{position: 'absolute', left: -((frame * 137) % 512), top: -((frame * 211) % 512), width: 1080 + 1024, height: 1920 + 1024, backgroundImage: `url(${staticFile('cancion/grano.png')})`, backgroundRepeat: 'repeat'}} />
      </AbsoluteFill>
      {/* transiciones globales */}
      {fog > 0 && <Fog a={fog} t={t} />}
      {dark > 0 && <AbsoluteFill style={{background: '#04070a', opacity: Math.min(1, dark * 1.05)}} />}
      {dark > 0.6 && <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 45%, rgba(140,196,245,0.25), rgba(0,0,0,0) 40%)', opacity: (dark - 0.6) * 2.5 * (0.5 + 0.5 * Math.sin(t * 60))}} />}
      {leak > 0 && <AbsoluteFill style={{background: 'radial-gradient(ellipse at 85% 30%, rgba(255,214,150,0.95), rgba(232,150,130,0.6) 35%, rgba(232,150,130,0) 75%)', opacity: leak * 0.9, mixBlendMode: 'screen'}} />}
      {streak > 0 && (
        <AbsoluteFill>
          {Array.from({length: 7}).map((_, i) => (
            <div key={i} style={{position: 'absolute', left: 0, right: 0, top: ((i * 293 + frame * 97) % 1920), height: 6 + (i % 3) * 8, background: 'rgba(235,245,247,0.55)', opacity: streak}} />
          ))}
        </AbsoluteFill>
      )}
      {drop !== null && (
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          <path d={`M540 ${lerp(300, 700, drop * drop) - 40} Q558 ${lerp(300, 700, drop * drop) - 4} 540 ${lerp(300, 700, drop * drop) + 14} Q522 ${lerp(300, 700, drop * drop) - 4} 540 ${lerp(300, 700, drop * drop) - 40} Z`} fill="#e8f4f6" opacity={0.95} />
        </svg>
      )}
      {ring >= 0 && (
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          {[0, 0.18, 0.36].map((o) => {
            const r = Math.max(0, ring - o);
            return r > 0 ? <ellipse key={o} cx={540} cy={720} rx={r * 1100} ry={r * 1100} fill="none" stroke="#e8f4f6" strokeWidth={10 * (1 - r)} opacity={(1 - r) * 0.8} /> : null;
          })}
        </svg>
      )}
      <Player t={t} total={totalSeconds} song={s.song ?? spec.title} artist={s.artist ?? ''} />
      <Subs timings={timings} />
      {t >= timings[last].start && <LiveArrow t={t - timings[last].start} />}
    </AbsoluteFill>
  );
};
