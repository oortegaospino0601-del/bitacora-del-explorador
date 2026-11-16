// Historias animadas de canciones: narrador en tercera persona, gancho inicial, la canción
// siempre visible (píldora arriba + tarjeta grande cuando se presenta) y subtítulos.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FPS} from './kit';
import {Amanecer, Atardecer, Cafe, Caja, Cara, ConOtro, Foto, Lluvia, Movil, Ojo, Parada, SeAlejan, Ventana} from './escenas';
import yaMeEntere from './timeline-historia-ya-me-entere.json';
import raraVez from './timeline-historia-rara-vez.json';

const XF = 0.45; // fundido cruzado entre escenas (s)
const FONT = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

type Word = {w: string; start: number; end: number};
type Line = {start: number; end: number; text: string; scene: string; words: Word[]};
export type Timeline = {
  slug: string;
  hook: string;
  durations: number[];
  lines: Line[];
  total: number;
  audio: string;
  song?: {title: string; artists: string; cardLine?: number};
  flash?: string[];
};

export const TIMELINES: Record<string, Timeline> = {
  'historia-ya-me-entere': yaMeEntere as Timeline,
  'historia-rara-vez': raraVez as Timeline,
};

type SC = React.FC<{dur: number}>;
const SCENES: Record<string, SC> = {
  'ventana-noche': ({dur}) => <Ventana dur={dur} />,
  'ventana-hook': ({dur}) => <Ventana dur={dur} hook />,
  'ventana-amanecer': ({dur}) => <Ventana dur={dur} dawn />,
  movil: ({dur}) => <Movil dur={dur} />,
  'movil-ella': ({dur}) => <Movil dur={dur} mode="ella" />,
  'movil-espera': ({dur}) => <Movil dur={dur} mode="espera" />,
  parada: ({dur}) => <Parada dur={dur} />,
  'parada-ella': ({dur}) => <Parada dur={dur} ella />,
  ojo: Ojo,
  cafe: Cafe,
  atardecer: Atardecer,
  foto: Foto,
  lluvia: Lluvia,
  'con-otro': ConOtro,
  cara: Cara,
  'se-alejan': SeAlejan,
  caja: Caja,
  amanecer: Amanecer,
};

const shadow = '0 4px 18px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.9)';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Fade: React.FC<{first: boolean; flash: boolean; children: React.ReactNode}> = ({first, flash, children}) => {
  const f = useCurrentFrame();
  const o = first ? 1 : interpolate(f, [0, XF * FPS], [0, 1], clamp);
  const fl = flash ? interpolate(f, [0, 2, 9], [0, 0.85, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{opacity: o}}>
      {children}
      {fl > 0 && <AbsoluteFill style={{background: '#ffffff', opacity: fl}} />}
    </AbsoluteFill>
  );
};

// Gancho: la primera fila entra con la voz y el resto con la segunda parte de la frase.
const Hook: React.FC<{tl: Timeline}> = ({tl}) => {
  const t = useCurrentFrame() / FPS;
  const l0 = tl.lines[0];
  const brk = l0.words.findIndex((w, i) => i > 0 && /[….]$/.test(l0.words[i - 1].w));
  const second = brk > 0 ? l0.words[brk].start : l0.start + 1.2;
  const rows = tl.hook.split('\n');
  const out = interpolate(t, [tl.durations[0] - 0.25, tl.durations[0] + 0.2], [1, 0], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 330, opacity: out}}>
      {rows.map((r, i) => {
        const at = i === 0 ? Math.max(0.05, l0.start - 0.15) : second - 0.1 + (i - 1) * 0.18;
        const p = interpolate(t, [at, at + 0.22], [0, 1], clamp);
        const last = i === rows.length - 1;
        const size = i === 0 ? Math.min(64, 940 / (r.length * 0.66)) : Math.min(118, 980 / (r.length * 0.7));
        return (
          <div
            key={i}
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: size,
              lineHeight: 1.06,
              color: last ? '#ffcf7a' : '#ffffff',
              textShadow: shadow,
              opacity: p,
              transform: `scale(${1.25 - 0.25 * p})`,
              marginBottom: i === 0 ? 18 : 0,
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {r}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Eq: React.FC<{t: number; h?: number}> = ({t, h = 30}) => (
  <div style={{display: 'flex', alignItems: 'flex-end', gap: 4, height: h, marginRight: 14}}>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{width: 6, borderRadius: 3, background: '#ffcf7a', height: h * (0.3 + 0.7 * Math.abs(Math.sin(t * (5 + i * 1.7) + i)))}} />
    ))}
  </div>
);

// La canción, siempre visible arriba.
const SongPill: React.FC<{tl: Timeline}> = ({tl}) => {
  const t = useCurrentFrame() / FPS;
  if (!tl.song) return null;
  const p = interpolate(t, [0.15, 0.5], [0, 1], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 165}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '14px 30px',
          borderRadius: 50,
          background: 'rgba(8,10,24,0.55)',
          border: '2px solid rgba(255,207,122,0.55)',
          opacity: p,
          transform: `translateY(${(1 - p) * -20}px)`,
        }}
      >
        <Eq t={t} />
        <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 38, color: '#fff'}}>{tl.song.title}</span>
        <span style={{fontFamily: FONT, fontWeight: 600, fontSize: 34, color: '#ffcf7a', marginLeft: 14}}>· {tl.song.artists}</span>
      </div>
    </AbsoluteFill>
  );
};

// Tarjeta grande cuando el narrador nombra la canción.
const SongCard: React.FC<{tl: Timeline}> = ({tl}) => {
  const t = useCurrentFrame() / FPS;
  if (!tl.song || tl.song.cardLine === undefined) return null;
  const l = tl.lines[tl.song.cardLine];
  const p = interpolate(t, [l.start - 0.15, l.start + 0.2], [0, 1], clamp) * interpolate(t, [l.end + 0.15, l.end + 0.5], [1, 0], clamp);
  if (p <= 0) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 260}}>
      <div
        style={{
          width: 760,
          padding: '46px 40px',
          borderRadius: 40,
          background: 'linear-gradient(160deg, rgba(40,26,70,0.92), rgba(14,18,48,0.92))',
          border: '3px solid rgba(255,207,122,0.7)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
          textAlign: 'center',
          opacity: p,
          transform: `scale(${0.85 + 0.15 * p})`,
        }}
      >
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: 18}}>
          <Eq t={t} h={56} />
        </div>
        <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 34, letterSpacing: 6, color: '#ffcf7a'}}>LA CANCIÓN</div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 124, color: '#fff', lineHeight: 1.05, margin: '10px 0'}}>{tl.song.title.toUpperCase()}</div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 54, color: '#ffffff', opacity: 0.85}}>{tl.song.artists}</div>
      </div>
    </AbsoluteFill>
  );
};

// Subtítulos: grupos cortos con la palabra activa en dorado.
const chunk = (ws: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  let len = 0;
  ws.forEach((w) => {
    if (cur.length && (cur.length >= 4 || len + w.w.length > 20)) {
      out.push(cur);
      cur = [];
      len = 0;
    }
    cur.push(w);
    len += w.w.length + 1;
    if (/[.,:?…]$/.test(w.w)) {
      out.push(cur);
      cur = [];
      len = 0;
    }
  });
  if (cur.length) out.push(cur);
  return out;
};

const Captions: React.FC<{tl: Timeline}> = ({tl}) => {
  const t = useCurrentFrame() / FPS;
  const card = tl.song?.cardLine;
  const line = tl.lines.find((l, i) => i > 0 && i !== card && t >= l.start - 0.05 && t <= l.end + 0.4);
  if (!line) return null;
  const groups = chunk(line.words);
  const g = groups.find((gr, i) => t < (groups[i + 1]?.[0].start ?? Infinity)) ?? groups[groups.length - 1];
  const gIn = interpolate(t, [g[0].start - 0.05, g[0].start + 0.1], [0, 1], clamp);
  const lOut = interpolate(t, [line.end + 0.15, line.end + 0.4], [1, 0], clamp);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 1240}}>
      <div style={{maxWidth: 920, textAlign: 'center', opacity: gIn * lOut, transform: `scale(${0.9 + 0.1 * gIn})`}}>
        {g.map((w, i) => {
          const on = t >= w.start && t < w.end + 0.05;
          return (
            <span key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: 74, color: on ? '#ffcf7a' : '#ffffff', textShadow: shadow, marginRight: 18, display: 'inline-block'}}>
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Historia: React.FC<{slug: string; subtitulos?: boolean}> = ({slug, subtitulos = true}) => {
  const tl = TIMELINES[slug];
  const f = useCurrentFrame();
  let start = 0;
  const total = tl.total * FPS;
  const fin = interpolate(f, [total - 1.2 * FPS, total - 0.15 * FPS], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {tl.lines.map((ln, i) => {
        const d = tl.durations[i];
        const C = SCENES[ln.scene];
        const from = Math.round(start * FPS);
        start += d;
        const len = Math.round((d + (i < tl.lines.length - 1 ? XF : 0)) * FPS);
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Fade first={i === 0} flash={(tl.flash ?? []).includes(ln.scene)}>
              <C dur={d + XF} />
            </Fade>
          </Sequence>
        );
      })}
      <Hook tl={tl} />
      <SongCard tl={tl} />
      {subtitulos && <Captions tl={tl} />}
      <SongPill tl={tl} />
      <AbsoluteFill style={{background: '#000', opacity: fin}} />
      <Audio src={staticFile(tl.audio)} />
    </AbsoluteFill>
  );
};
