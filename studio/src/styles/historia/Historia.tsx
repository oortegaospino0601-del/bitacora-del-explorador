// Historia animada para canción, narrada en tercera persona (voz Alex), con gancho inicial.
// La canción se añade después en la app de YouTube ("Sonido") por debajo de la voz.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FPS} from './kit';
import {Amanecer, Atardecer, Cafe, Caja, Cara, ConOtro, Foto, Lluvia, Movil, Ojo, SeAlejan, Ventana} from './escenas';
import timeline from './timeline.json';

const XF = 0.6; // fundido cruzado entre escenas (s)
const FONT = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

type Word = {w: string; start: number; end: number};
type Line = {start: number; end: number; text: string; words: Word[]};
const TL = timeline as {hook: string; durations: number[]; lines: Line[]; total: number; audio: string};

const COMPS: React.FC<{dur: number}>[] = [
  ({dur}) => <Ventana dur={dur} />,
  Movil,
  Ojo,
  Cafe,
  Atardecer,
  Foto,
  Lluvia,
  ConOtro,
  Cara,
  SeAlejan,
  Caja,
  ({dur}) => <Ventana dur={dur} dawn />,
  Amanecer,
];

export const TOTAL = TL.total;

const Fade: React.FC<{first: boolean; children: React.ReactNode}> = ({first, children}) => {
  const f = useCurrentFrame();
  const o = first ? 1 : interpolate(f, [0, XF * FPS], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const shadow = '0 4px 18px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.9)';

// Gancho: aparece con la primera frase de la voz.
const Hook: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const l0 = TL.lines[0];
  const second = l0.words.find((w, i) => i > 0 && /^[A-ZÁÉÍÓÚÑ¿¡]/.test(w.w))?.start ?? l0.start + 1.5;
  const rows = TL.hook.split('\n');
  const out = interpolate(t, [TL.durations[0] - 0.2, TL.durations[0] + 0.3], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 300, opacity: out}}>
      {rows.map((r, i) => {
        const at = i === 0 ? l0.start - 0.1 : second - 0.1 + (i - 1) * 0.22;
        const p = interpolate(t, [at, at + 0.35], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const last = i === rows.length - 1;
        return (
          <div
            key={i}
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: i === 0 ? 70 : 112,
              lineHeight: 1.05,
              letterSpacing: 1,
              color: last ? '#ffcf7a' : '#ffffff',
              textShadow: shadow,
              opacity: p,
              transform: `translateY(${(1 - p) * 30}px) scale(${0.92 + 0.08 * p})`,
              marginBottom: i === 0 ? 22 : 0,
              textAlign: 'center',
            }}
          >
            {r}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Subtítulos discretos: grupos cortos de palabras con la palabra activa en dorado.
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

const Captions: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const line = TL.lines.find((l, i) => i > 0 && t >= l.start - 0.05 && t <= l.end + 0.45);
  if (!line) return null;
  const groups = chunk(line.words);
  const g = groups.find((gr, i) => t < (groups[i + 1]?.[0].start ?? Infinity)) ?? groups[groups.length - 1];
  const gIn = interpolate(t, [g[0].start - 0.05, g[0].start + 0.12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const lOut = interpolate(t, [line.end + 0.2, line.end + 0.45], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 1250}}>
      <div style={{maxWidth: 900, textAlign: 'center', opacity: gIn * lOut, transform: `translateY(${(1 - gIn) * 12}px)`}}>
        {g.map((w, i) => {
          const on = t >= w.start && t < w.end + 0.05;
          return (
            <span
              key={i}
              style={{fontFamily: FONT, fontWeight: 800, fontSize: 66, color: on ? '#ffd58a' : '#ffffff', textShadow: shadow, marginRight: 16, display: 'inline-block'}}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Historia: React.FC<{ambiente?: string; subtitulos?: boolean}> = ({ambiente, subtitulos = true}) => {
  const f = useCurrentFrame();
  let start = 0;
  const total = TOTAL * FPS;
  const fin = interpolate(f, [total - 1.3 * FPS, total - 0.2 * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ini = interpolate(f, [0, 0.4 * FPS], [1, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {COMPS.map((C, i) => {
        const d = TL.durations[i];
        const from = Math.round(start * FPS);
        start += d;
        const len = Math.round((d + (i < COMPS.length - 1 ? XF : 0)) * FPS);
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Fade first={i === 0}>
              <C dur={d + XF} />
            </Fade>
          </Sequence>
        );
      })}
      <Hook />
      {subtitulos && <Captions />}
      <AbsoluteFill style={{background: '#000', opacity: Math.max(fin, ini)}} />
      <Audio src={staticFile(ambiente ?? TL.audio)} />
    </AbsoluteFill>
  );
};
