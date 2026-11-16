// Historia animada para canción (formato "la historia de la canción"): sin texto ni voz.
// El audio de la canción se añade después en la app de YouTube ("Añadir sonido").
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FPS} from './kit';
import {Amanecer, Atardecer, Cafe, Caja, Cara, ConOtro, Foto, Lluvia, Movil, Ojo, SeAlejan, Ventana} from './escenas';

const XF = 0.6; // fundido cruzado entre escenas (s)

type Item = {d: number; C: React.FC<{dur: number}>};

export const ESCENAS: Item[] = [
  {d: 4.6, C: ({dur}) => <Ventana dur={dur} />},
  {d: 4.4, C: Movil},
  {d: 3.8, C: Ojo},
  {d: 4.8, C: Cafe},
  {d: 4.8, C: Atardecer},
  {d: 4.0, C: Foto},
  {d: 4.8, C: Lluvia},
  {d: 5.0, C: ConOtro},
  {d: 4.0, C: Cara},
  {d: 4.6, C: SeAlejan},
  {d: 4.2, C: Caja},
  {d: 4.6, C: ({dur}) => <Ventana dur={dur} dawn />},
  {d: 4.4, C: Amanecer},
];

export const TOTAL = ESCENAS.reduce((a, e) => a + e.d, 0);

const Fade: React.FC<{first: boolean; children: React.ReactNode}> = ({first, children}) => {
  const f = useCurrentFrame();
  const o = first ? 1 : interpolate(f, [0, XF * FPS], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

export const Historia: React.FC<{ambiente?: string}> = ({ambiente}) => {
  const f = useCurrentFrame();
  let start = 0;
  const total = TOTAL * FPS;
  const fin = interpolate(f, [total - 1.3 * FPS, total - 0.2 * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ini = interpolate(f, [0, 0.5 * FPS], [1, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {ESCENAS.map((e, i) => {
        const from = Math.round(start * FPS);
        start += e.d;
        const len = Math.round((e.d + (i < ESCENAS.length - 1 ? XF : 0)) * FPS);
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Fade first={i === 0}>
              <e.C dur={e.d + XF} />
            </Fade>
          </Sequence>
        );
      })}
      <AbsoluteFill style={{background: '#000', opacity: Math.max(fin, ini)}} />
      {ambiente && <Audio src={staticFile(ambiente)} />}
    </AbsoluteFill>
  );
};
