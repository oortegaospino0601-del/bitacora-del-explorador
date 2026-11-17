// Estéticas para las historias: filtro de imagen, texturas y tipografía.
import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/special-elite/latin-400.css';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/playfair-display/latin-900.css';
import '@fontsource/vt323/latin-400.css';
import '@fontsource/bangers/latin-400.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/nunito/latin-900.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/barlow-condensed/latin-800.css';
import {FPS, rng} from './kit';

export type Estilo = {
  filter?: string; // filtro CSS sobre las escenas (puede incluir url(#svg))
  grain?: number;
  paper?: number;
  scan?: number;
  leak?: string; // color de destellos de luz
  halftone?: number;
  letterbox?: number;
  stamp?: 'pelicula' | 'vhs';
  font: string;
  hookWeight: number;
  capWeight: number;
  capSize: number;
  upper?: boolean;
  text: string; // color de texto principal
  accent: string; // palabra activa y última línea del gancho
  shadow: string;
  stroke?: string; // contorno del texto (cómic)
  pillBg: string;
  pillBorder: string;
};

const SH = '0 4px 18px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.9)';
const M = "'Montserrat', Arial, sans-serif";

export const ESTILOS: Record<string, Estilo> = {
  plano: {font: M, hookWeight: 900, capWeight: 900, capSize: 74, text: '#fff', accent: '#ffcf7a', shadow: SH, pillBg: 'rgba(8,10,24,0.55)', pillBorder: 'rgba(255,207,122,0.55)'},
  pelicula: {
    filter: 'sepia(0.38) saturate(0.82) contrast(1.06) brightness(1.04)',
    grain: 0.32,
    leak: '#ff9a4a',
    stamp: 'pelicula',
    font: "'Special Elite', 'Courier New', monospace",
    hookWeight: 400,
    capWeight: 400,
    capSize: 70,
    text: '#fff8ea',
    accent: '#ffb35c',
    shadow: '0 3px 14px rgba(40,20,0,0.9)',
    pillBg: 'rgba(40,24,10,0.6)',
    pillBorder: 'rgba(255,179,92,0.6)',
  },
  neon: {
    filter: 'saturate(1.7) contrast(1.15) hue-rotate(-25deg)',
    scan: 0.12,
    leak: '#ff3df2',
    font: "'Barlow Condensed', Arial Narrow, sans-serif",
    hookWeight: 800,
    capWeight: 800,
    capSize: 88,
    upper: true,
    text: '#ffffff',
    accent: '#3df2ff',
    shadow: '0 0 12px #ff3df2, 0 0 28px #ff3df2, 0 3px 6px rgba(0,0,0,0.9)',
    pillBg: 'rgba(30,0,40,0.6)',
    pillBorder: '#ff3df2',
  },
  boceto: {
    filter: 'url(#hx-sketch)',
    paper: 0.95,
    font: "'Special Elite', 'Courier New', monospace",
    hookWeight: 400,
    capWeight: 400,
    capSize: 72,
    text: '#1d2a6a',
    accent: '#c0392b',
    shadow: 'none',
    pillBg: 'rgba(241,233,216,0.9)',
    pillBorder: '#1d2a6a',
  },
  // Igual que boceto pero sin el filtro SVG (lento): el trazo a lápiz y el papel se aplican
  // después con ffmpeg (tools/boceto_post.sh).
  'boceto-base': {
    filter: 'grayscale(1) contrast(1.05) brightness(1.05)',
    font: "'Special Elite', 'Courier New', monospace",
    hookWeight: 400,
    capWeight: 400,
    capSize: 72,
    text: '#1d2a6a',
    accent: '#c0392b',
    shadow: 'none',
    pillBg: 'rgba(241,233,216,0.9)',
    pillBorder: '#1d2a6a',
  },
  noir: {
    filter: 'grayscale(1) contrast(1.4) brightness(0.95)',
    grain: 0.3,
    letterbox: 150,
    font: "'Playfair Display', Georgia, serif",
    hookWeight: 900,
    capWeight: 700,
    capSize: 72,
    text: '#ffffff',
    accent: '#ff3b3b',
    shadow: '0 3px 14px rgba(0,0,0,0.95)',
    pillBg: 'rgba(0,0,0,0.6)',
    pillBorder: '#ff3b3b',
  },
  acuarela: {
    filter: 'blur(1.4px) saturate(0.8) brightness(1.1) contrast(0.92)',
    paper: 0.55,
    font: "'Nunito', Arial, sans-serif",
    hookWeight: 900,
    capWeight: 800,
    capSize: 74,
    text: '#ffffff',
    accent: '#ffd1e0',
    shadow: '0 3px 16px rgba(60,30,60,0.75)',
    pillBg: 'rgba(90,60,90,0.45)',
    pillBorder: 'rgba(255,209,224,0.8)',
  },
  comic: {
    filter: 'url(#hx-poster) saturate(1.5) contrast(1.1)',
    halftone: 0.22,
    font: "'Bangers', Impact, sans-serif",
    hookWeight: 400,
    capWeight: 400,
    capSize: 92,
    upper: true,
    text: '#ffffff',
    accent: '#ffe23b',
    shadow: '6px 6px 0 #14111f',
    stroke: '6px #14111f',
    pillBg: '#ff2e88',
    pillBorder: '#14111f',
  },
  tropical: {
    filter: 'saturate(1.4) brightness(1.06) contrast(1.04) hue-rotate(-6deg)',
    leak: '#ffd23f',
    font: M,
    hookWeight: 900,
    capWeight: 900,
    capSize: 76,
    text: '#ffffff',
    accent: '#ffe066',
    shadow: '0 4px 16px rgba(120,40,0,0.7)',
    pillBg: 'rgba(255,90,60,0.55)',
    pillBorder: '#ffe066',
  },
  vhs: {
    filter: 'saturate(0.9) contrast(1.12) blur(0.6px)',
    scan: 0.22,
    grain: 0.18,
    stamp: 'vhs',
    font: "'VT323', 'Courier New', monospace",
    hookWeight: 400,
    capWeight: 400,
    capSize: 92,
    upper: true,
    text: '#ffffff',
    accent: '#8dff6a',
    shadow: '3px 0 0 rgba(255,0,80,0.6), -3px 0 0 rgba(0,200,255,0.6), 0 3px 10px rgba(0,0,0,0.9)',
    pillBg: 'rgba(0,0,0,0.55)',
    pillBorder: '#8dff6a',
  },
};

// Filtros SVG que usan algunas estéticas.
export const FiltrosSvg: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="hx-sketch" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0" result="g" />
        <feConvolveMatrix in="g" order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true" result="e" />
        <feColorMatrix in="e" type="matrix" values="-4 0 0 0 1  -4 0 0 0 1  -4 0 0 0 1  0 0 0 1 0" result="lines" />
        <feComponentTransfer in="g" result="soft">
          <feFuncR type="linear" slope="0.4" intercept="0.62" />
          <feFuncG type="linear" slope="0.4" intercept="0.62" />
          <feFuncB type="linear" slope="0.4" intercept="0.66" />
        </feComponentTransfer>
        <feBlend in="lines" in2="soft" mode="multiply" />
      </filter>
      <filter id="hx-acuarela" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={4} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={14} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feGaussianBlur in="d" stdDeviation={1.6} result="b" />
        <feComponentTransfer in="b">
          <feFuncR type="discrete" tableValues="0.1 0.3 0.45 0.6 0.72 0.84 0.94 1" />
          <feFuncG type="discrete" tableValues="0.1 0.3 0.45 0.6 0.72 0.84 0.94 1" />
          <feFuncB type="discrete" tableValues="0.12 0.32 0.47 0.62 0.74 0.86 0.95 1" />
        </feComponentTransfer>
      </filter>
      <filter id="hx-poster" colorInterpolationFilters="sRGB">
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0 0.25 0.5 0.75 1" />
          <feFuncG type="discrete" tableValues="0 0.25 0.5 0.75 1" />
          <feFuncB type="discrete" tableValues="0 0.25 0.5 0.75 1" />
        </feComponentTransfer>
      </filter>
    </defs>
  </svg>
);

// Texturas y sellos por encima de las escenas.
export const Capas: React.FC<{e: Estilo; fecha?: string}> = ({e, fecha}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const r = rng(1000 + f);
  return (
    <>
      {e.paper ? <AbsoluteFill style={{backgroundImage: `url(${staticFile('historia/tex/papel.jpg')})`, backgroundSize: 'cover', mixBlendMode: 'multiply', opacity: e.paper}} /> : null}
      {e.halftone ? (
        <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(20,17,31,0.9) 28%, transparent 30%)', backgroundSize: '14px 14px', mixBlendMode: 'multiply', opacity: e.halftone}} />
      ) : null}
      {e.leak ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at ${50 + Math.sin(t * 0.7) * 45}% ${20 + Math.cos(t * 0.5) * 15}%, ${e.leak}88 0%, transparent 45%)`,
            mixBlendMode: 'screen',
            opacity: 0.45 + 0.25 * Math.sin(t * 1.3),
          }}
        />
      ) : null}
      {e.scan ? <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0 2px, transparent 2px 6px)', opacity: e.scan}} /> : null}
      {e.grain ? (
        <AbsoluteFill
          style={{
            backgroundImage: `url(${staticFile('historia/tex/grano.png')})`,
            backgroundSize: '540px 960px',
            backgroundPosition: `${Math.floor(r() * 540)}px ${Math.floor(r() * 960)}px`,
            mixBlendMode: 'overlay',
            opacity: e.grain,
          }}
        />
      ) : null}
      {e.stamp === 'vhs' && (
        <>
          <AbsoluteFill
            style={{
              top: ((t * 260) % 2400) - 200,
              height: 60,
              backgroundImage: `url(${staticFile('historia/tex/grano.png')})`,
              backgroundPosition: `${Math.floor(r() * 500)}px 0`,
              opacity: 0.35,
              mixBlendMode: 'screen',
            }}
          />
          <div style={{position: 'absolute', left: 70, top: 300, fontFamily: "'VT323', monospace", fontSize: 64, color: '#fff', textShadow: '2px 0 #f05, -2px 0 #0cf'}}>▶ PLAY</div>
          <div style={{position: 'absolute', right: 70, top: 300, fontFamily: "'VT323', monospace", fontSize: 64, color: '#fff', textShadow: '2px 0 #f05, -2px 0 #0cf'}}>
            <span style={{color: '#ff3b3b', opacity: Math.floor(t * 2) % 2 ? 1 : 0.2}}>●</span> REC
          </div>
          <div style={{position: 'absolute', left: 70, bottom: 360, fontFamily: "'VT323', monospace", fontSize: 58, color: '#fff', textShadow: '2px 0 #f05, -2px 0 #0cf'}}>
            {fecha ?? 'JUN. 14 2006'} {`${String(9 + Math.floor(t / 60)).padStart(2, '0')}:${String(41 + Math.floor(t) % 19).padStart(2, '0')} PM`}
          </div>
        </>
      )}
      {e.stamp === 'pelicula' && (
        <div style={{position: 'absolute', right: 80, bottom: 330, fontFamily: "'VT323', monospace", fontSize: 62, color: '#ff8a2a', textShadow: '0 0 8px rgba(255,120,30,0.8)', letterSpacing: 3}}>
          {fecha ?? "'25 11 16"}
        </div>
      )}
      {e.letterbox ? (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: e.letterbox, background: '#000'}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: e.letterbox, background: '#000'}} />
        </>
      ) : null}
    </>
  );
};
