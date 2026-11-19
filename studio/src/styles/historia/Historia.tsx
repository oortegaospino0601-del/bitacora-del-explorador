// Historias animadas de canciones: narrador en tercera persona, gancho inicial, la canción
// siempre visible (píldora arriba + tarjeta grande cuando se presenta) y subtítulos.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ABUELA, CastCtx, FPS, HER, HIM, Look, OTHER} from './kit';
import {Amanecer, Atardecer, Cafe, Caja, Cara, ConOtro, Foto, Lluvia, Movil, Ojo, Parada, SeAlejan, Ventana} from './escenas';
import {Barrio, Familia, Galeria} from './escenas2';
import * as E3 from './escenas3';
import * as E4 from './escenas4';
import * as E5 from './escenas5';
import * as E6 from './escenas6';
import * as E7 from './escenas7';
import * as E8 from './escenas8';
import * as E9 from './escenas9';
import {Capas, ESTILOS, FiltrosSvg} from './estilos';
import {ALL} from './timelines';

const XF = 0.45; // fundido cruzado entre escenas (s)

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
  estilo?: string;
  fecha?: string;
  safe?: boolean; // zona segura de TikTok: nada en el lateral derecho ni en la franja baja
  cast?: {him?: Partial<Look>; her?: Partial<Look>; other?: Partial<Look>; abuela?: Partial<Look>};
};

export const TIMELINES = ALL as unknown as Record<string, Timeline>;

// Escena con parámetros: "nombre:arg1:arg2" (p. ej. "barrio:casa", "movil:llamadas:Abuela").
const scene = (spec: string, dur: number): React.ReactNode => {
  const [n, a = '', b = ''] = spec.split(':');
  switch (n) {
    case 'ventana-noche':
      return <Ventana dur={dur} />;
    case 'ventana-hook':
      return <Ventana dur={dur} hook />;
    case 'ventana-amanecer':
      return <Ventana dur={dur} dawn />;
    case 'movil':
      return <Movil dur={dur} mode={(a || 'foto') as 'foto'} name={b || undefined} />;
    case 'movil-ella':
      return <Movil dur={dur} mode="ella" />;
    case 'movil-espera':
      return <Movil dur={dur} mode="espera" />;
    case 'parada':
      return <Parada dur={dur} />;
    case 'parada-ella':
      return <Parada dur={dur} ella />;
    case 'ojo':
      return <Ojo dur={dur} />;
    case 'cafe':
      return <Cafe dur={dur} />;
    case 'atardecer':
      return <Atardecer dur={dur} />;
    case 'foto':
      return <Foto dur={dur} kind={(a || 'sunset') as 'sunset'} blur={b ? Number(b) : 0} />;
    case 'lluvia':
      return <Lluvia dur={dur} />;
    case 'con-otro':
      return <ConOtro dur={dur} />;
    case 'cara':
      return <Cara dur={dur} />;
    case 'se-alejan':
      return <SeAlejan dur={dur} />;
    case 'caja':
      return <Caja dur={dur} />;
    case 'amanecer':
      return <Amanecer dur={dur} />;
    case 'galeria':
      return <Galeria dur={dur} mode={(a || 'scroll') as 'scroll'} query={b || undefined} />;
    case 'barrio':
      return <Barrio dur={dur} mode={(a || 'pasa') as 'pasa'} hora={(b || 'dia') as 'dia'} />;
    case 'familia':
      return <Familia dur={dur} mode={(a || 'cocina') as 'cocina'} />;
    default: {
      const C = ({...E3, ...E4, ...E5, ...E6, ...E7, ...E8, ...E9} as unknown as Record<string, React.FC<{dur: number; a?: string; b?: string}>>)[n];
      if (!C) throw new Error(`Escena desconocida: ${spec}`);
      return <C dur={dur} a={a} b={b} />;
    }
  }
};

type Est = (typeof ESTILOS)[string];
const EstCtx = React.createContext<Est>(ESTILOS.plano);
const useEst = () => React.useContext(EstCtx);
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

const txt = (e: Est, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: e.font,
  textShadow: e.shadow === 'none' ? undefined : e.shadow,
  WebkitTextStroke: e.stroke,
  paintOrder: e.stroke ? 'stroke fill' : undefined,
  ...extra,
});

// Gancho: la primera fila entra con la voz y el resto con la segunda parte de la frase.
const Hook: React.FC<{tl: Timeline}> = ({tl}) => {
  const e = useEst();
  const t = useCurrentFrame() / FPS;
  const l0 = tl.lines[0];
  const brk = l0.words.findIndex((w, i) => i > 0 && /[….]$/.test(l0.words[i - 1].w));
  const second = brk > 0 ? l0.words[brk].start : l0.start + 1.2;
  const rows = tl.hook.split('\n');
  const out = interpolate(t, [tl.durations[0] - 0.25, tl.durations[0] + 0.2], [1, 0], clamp);
  const k = e.font.includes('Montserrat') || e.font.includes('Nunito') ? 0.72 : e.font.includes('Special') || e.font.includes('VT323') ? 0.62 : e.font.includes('Barlow') || e.font.includes('Bangers') ? 0.5 : 0.66;
  const back = interpolate(t, [0, 0.3], [0, 1], clamp);
  const light = e.text === '#1d2a6a';
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: tl.safe ? 400 : 330, opacity: out}}>
      <AbsoluteFill
        style={{
          background: light
            ? 'linear-gradient(180deg, rgba(241,233,216,0) 8%, rgba(241,233,216,0.92) 16%, rgba(241,233,216,0.92) 36%, rgba(241,233,216,0) 46%)'
            : 'linear-gradient(180deg, rgba(0,0,0,0) 8%, rgba(0,0,0,0.72) 16%, rgba(0,0,0,0.72) 36%, rgba(0,0,0,0) 46%)',
          opacity: back,
        }}
      />
      {rows.map((r, i) => {
        const at = i === 0 ? Math.max(0.05, l0.start - 0.15) : second - 0.1 + (i - 1) * 0.18;
        const p = interpolate(t, [at, at + 0.22], [0, 1], clamp);
        const last = i === rows.length - 1;
        const size = i === 0 ? Math.min(66, (tl.safe ? 900 : 940) / (r.length * k)) : Math.min(124, (tl.safe ? 900 : 980) / (r.length * k));
        return (
          <div
            key={i}
            style={txt(e, {
              fontWeight: e.hookWeight,
              fontSize: size,
              lineHeight: 1.06,
              color: last ? e.accent : e.text,
              opacity: p,
              transform: `scale(${1.25 - 0.25 * p})`,
              marginBottom: i === 0 ? 18 : 0,
              textAlign: 'center',
              whiteSpace: 'nowrap',
            })}
          >
            {r}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Eq: React.FC<{t: number; h?: number; c: string}> = ({t, h = 30, c}) => (
  <div style={{display: 'flex', alignItems: 'flex-end', gap: 4, height: h, marginRight: 14}}>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{width: 6, borderRadius: 3, background: c, height: h * (0.3 + 0.7 * Math.abs(Math.sin(t * (5 + i * 1.7) + i)))}} />
    ))}
  </div>
);

// La canción, siempre visible arriba.
const SongPill: React.FC<{tl: Timeline}> = ({tl}) => {
  const e = useEst();
  const t = useCurrentFrame() / FPS;
  if (!tl.song) return null;
  const p = interpolate(t, [0.15, 0.5], [0, 1], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: tl.safe ? 240 : 165}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '14px 30px',
          borderRadius: 50,
          background: e.pillBg,
          border: `2px solid ${e.pillBorder}`,
          opacity: p,
          transform: `translateY(${(1 - p) * -20}px)`,
        }}
      >
        <Eq t={t} c={e.accent} />
        <span style={{fontFamily: e.font, fontWeight: e.capWeight, fontSize: 38, color: e.text === '#1d2a6a' ? e.text : '#fff'}}>{tl.song.title}</span>
        <span style={{fontFamily: e.font, fontWeight: e.capWeight, fontSize: 34, color: e.accent, marginLeft: 14}}>· {tl.song.artists}</span>
      </div>
    </AbsoluteFill>
  );
};

// Tarjeta grande cuando el narrador nombra la canción.
const SongCard: React.FC<{tl: Timeline}> = ({tl}) => {
  const e = useEst();
  const t = useCurrentFrame() / FPS;
  if (!tl.song || tl.song.cardLine === undefined) return null;
  const l = tl.lines[tl.song.cardLine];
  const p = interpolate(t, [l.start - 0.15, l.start + 0.2], [0, 1], clamp) * interpolate(t, [l.end + 0.15, l.end + 0.5], [1, 0], clamp);
  if (p <= 0) return null;
  const title = tl.song.title.toUpperCase();
  const light = e.text === '#1d2a6a';
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 260, paddingRight: tl.safe ? 130 : 0}}>
      <div
        style={{
          width: tl.safe ? 760 : 800,
          padding: '46px 40px',
          borderRadius: e.font.includes('Bangers') ? 8 : 40,
          background: light ? 'rgba(241,233,216,0.95)' : 'linear-gradient(160deg, rgba(20,14,36,0.9), rgba(10,12,30,0.9))',
          border: `4px solid ${e.pillBorder}`,
          boxShadow: e.font.includes('Bangers') ? '14px 14px 0 #14111f' : '0 30px 80px rgba(0,0,0,0.6)',
          textAlign: 'center',
          opacity: p,
          transform: `scale(${0.85 + 0.15 * p}) rotate(${e.font.includes('Bangers') ? -3 : 0}deg)`,
        }}
      >
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: 18}}>
          <Eq t={t} h={56} c={e.accent} />
        </div>
        <div style={{fontFamily: e.font, fontWeight: e.capWeight, fontSize: 36, letterSpacing: 6, color: e.accent}}>LA CANCIÓN</div>
        <div style={txt(e, {fontWeight: e.hookWeight, fontSize: Math.min(124, 1300 / Math.max(6, title.length)), color: light ? e.text : '#fff', lineHeight: 1.05, margin: '10px 0', textShadow: 'none'})}>{title}</div>
        <div style={{fontFamily: e.font, fontWeight: e.capWeight, fontSize: tl.song.artists.length > 24 ? 42 : 54, color: light ? e.text : '#fff', opacity: 0.9}}>{tl.song.artists}</div>
      </div>
    </AbsoluteFill>
  );
};

// Subtítulos: grupos cortos con la palabra activa resaltada.
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
  const e = useEst();
  const t = useCurrentFrame() / FPS;
  const card = tl.song?.cardLine;
  const line = tl.lines.find((l, i) => i > 0 && i !== card && t >= l.start - 0.05 && t <= l.end + 0.4);
  if (!line) return null;
  const groups = chunk(line.words);
  const g = groups.find((gr, i) => t < (groups[i + 1]?.[0].start ?? Infinity)) ?? groups[groups.length - 1];
  const gIn = interpolate(t, [g[0].start - 0.05, g[0].start + 0.1], [0, 1], clamp);
  const lOut = interpolate(t, [line.end + 0.15, line.end + 0.4], [1, 0], clamp);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: tl.safe ? 1130 : 1240, paddingRight: tl.safe ? 140 : 0}}>
      <div style={{maxWidth: tl.safe ? 820 : 940, textAlign: 'center', opacity: gIn * lOut, transform: `scale(${0.9 + 0.1 * gIn})`, ...(e.capBox ? {background: e.capBox, borderRadius: 28, padding: '14px 10px 14px 28px'} : {})}}>
        {g.map((w, i) => {
          const on = t >= w.start && t < w.end + 0.05;
          return (
            <span
              key={i}
              style={txt(e, {fontWeight: e.capWeight, fontSize: e.capSize, color: on ? e.accent : e.text, marginRight: 18, display: 'inline-block', textTransform: e.upper ? 'uppercase' : undefined})}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const merge = (base: Look, p?: Partial<Look>) => (p ? {...base, ...p} : base);

export const Historia: React.FC<{slug: string; subtitulos?: boolean}> = ({slug, subtitulos = true}) => {
  const tl = TIMELINES[slug];
  const e = ESTILOS[tl.estilo ?? 'plano'];
  const c = tl.cast ?? {};
  const cast = {him: merge(HIM, c.him), her: merge(HER, c.her), other: merge(OTHER, c.other), abuela: merge(ABUELA, c.abuela)};
  const f = useCurrentFrame();
  let start = 0;
  const total = tl.total * FPS;
  const fin = interpolate(f, [total - 1.2 * FPS, total - 0.15 * FPS], [0, 1], clamp);
  return (
    <EstCtx.Provider value={e}>
      <CastCtx.Provider value={cast}>
        <AbsoluteFill style={{background: '#000'}}>
          <FiltrosSvg />
          <AbsoluteFill style={{filter: e.filter}}>
            {tl.lines.map((ln, i) => {
              const d = tl.durations[i];
              const from = Math.round(start * FPS);
              start += d;
              const len = Math.round((d + (i < tl.lines.length - 1 ? XF : 0)) * FPS);
              return (
                <Sequence key={i} from={from} durationInFrames={len}>
                  <Fade first={i === 0} flash={(tl.flash ?? []).includes(ln.scene)}>
                    {scene(ln.scene, d + XF)}
                  </Fade>
                </Sequence>
              );
            })}
          </AbsoluteFill>
          <Capas e={e} fecha={tl.fecha} />
          <Hook tl={tl} />
          <SongCard tl={tl} />
          {subtitulos && <Captions tl={tl} />}
          <SongPill tl={tl} />
          <AbsoluteFill style={{background: '#000', opacity: fin}} />
          <Audio src={staticFile(tl.audio)} />
        </AbsoluteFill>
      </CastCtx.Provider>
    </EstCtx.Provider>
  );
};
