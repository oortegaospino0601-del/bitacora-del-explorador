import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Props} from '../../types';
import {Player, Subs, LiveArrow} from '../cancion/HistoriaCancion';
import {Defs, ease, lerp} from '../cancion/kit';
import {LDefs, SCENES} from './escenas';

// «Seguro Te Pierdo»: misma marca que la serie del reproductor (reproductor, subtítulos,
// grano, personajes y flecha al LIVE idénticos), pero con otra puesta en escena:
// paleta azul de noche lluviosa, cámaras que se mueven dentro de cada escena y una
// transición distinta en cada corte (iris, barrido, deslizamiento, zoom a la pantalla,
// cortina de lluvia, paneo vertical, parpadeo, destello).

const TR = 0.75; // duración de las transiciones (s)

type In = 'iris' | 'whip' | 'slide' | 'zoom' | 'screen' | 'rain' | 'tilt' | 'blink' | 'flash' | 'dissolve' | undefined;

// cómo entra la escena nueva (p: 0→1)
const enter = (kind: In, p: number): React.CSSProperties => {
  const e = ease(p);
  switch (kind) {
    case 'iris':
      return {clipPath: `circle(${lerp(0, 1250, e)}px at 540px 720px)`};
    case 'whip':
      return {transform: `translateX(${(1 - e) * 1080}px)`, filter: p < 1 ? `blur(${(1 - e) * 14}px)` : undefined};
    case 'slide':
      return {clipPath: `polygon(${lerp(110, 0, e)}% 0, 100% 0, 100% 100%, ${lerp(130, 0, e)}% 100%)`};
    case 'zoom':
      return {opacity: e, transform: `scale(${lerp(1.35, 1, e)})`, transformOrigin: '50% 40%'};
    case 'screen': {
      const w = lerp(230, 1080, e) / 2;
      const h = lerp(420, 1920, e) / 2;
      return {clipPath: `inset(${Math.max(0, 720 - h)}px ${Math.max(0, 540 - w)}px ${Math.max(0, 1200 - h)}px ${Math.max(0, 540 - w)}px round ${lerp(36, 0, e)}px)`};
    }
    case 'rain':
      return {clipPath: `polygon(0 0, ${lerp(-40, 140, e)}% 0, ${lerp(-80, 100, e)}% 100%, 0 100%)`};
    case 'tilt':
      return {transform: `translateY(${(1 - e) * 1400}px)`};
    case 'blink':
    case 'flash':
      return {};
    default:
      return {opacity: e};
  }
};

// cómo se va la escena anterior mientras entra la siguiente (q: 0→1)
const leave = (next: In, q: number): React.CSSProperties => {
  const e = ease(q);
  switch (next) {
    case 'whip':
      return {transform: `translateX(${-e * 1080}px)`, filter: `blur(${e * 14}px)`};
    case 'zoom':
      return {transform: `scale(${1 + e * 0.9})`, transformOrigin: '50% 40%'};
    case 'screen':
      return {transform: `scale(${1 + e * 1.6})`, transformOrigin: '50% 37.5%'};
    case 'tilt':
      return {transform: `translateY(${-e * 1400}px)`};
    case 'slide':
      return {transform: `translateX(${-e * 220}px)`};
    default:
      return {};
  }
};

export const HistoriaLluvia: React.FC<Props> = ({spec, timings, totalSeconds, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const s = spec as unknown as {song?: string; artist?: string; sentences: {scene: {type: string; in?: In}}[]};
  const last = timings.length - 1;
  const kindOf = (i: number) => s.sentences[i]?.scene?.in;

  // parpadeo (párpados que se cierran y abren) y destello alrededor de su corte
  let lids = 0;
  let flash = 0;
  timings.forEach((tm, i) => {
    if (i === 0) return;
    const d = Math.abs(t - tm.sceneStart);
    if (kindOf(i) === 'blink' && d < 0.4) lids = Math.max(lids, 1 - d / 0.4);
    if (kindOf(i) === 'flash' && d < 0.45) flash = Math.max(flash, Math.pow(1 - d / 0.45, 1.5));
  });

  return (
    <AbsoluteFill style={{background: '#0d1220'}}>
      <Audio src={staticFile(audioFile)} />
      {timings.map((tm, i) => {
        const start = tm.sceneStart;
        const nextStart = i === last ? Infinity : timings[i + 1].sceneStart;
        const end = i === last ? totalSeconds + 1 : nextStart + TR;
        if (t < start - 0.01 || t > end) return null;
        const local = t - start;
        const kind = kindOf(i);
        const instant = kind === 'blink' || kind === 'flash';
        const inStyle = i === 0 || instant ? {} : enter(kind, Math.min(1, local / TR));
        const outStyle = t > nextStart ? leave(kindOf(i + 1), Math.min(1, (t - nextStart) / TR)) : {};
        // en cortes instantáneos la escena anterior desaparece en el centro del efecto
        if (i < last && (kindOf(i + 1) === 'blink' || kindOf(i + 1) === 'flash') && t >= nextStart) return null;
        const Comp = SCENES[s.sentences[i]?.scene?.type ?? 'glow'];
        const dur = (i === last ? totalSeconds : nextStart) - start;
        return (
          <AbsoluteFill key={i} style={{...outStyle}}>
            <AbsoluteFill style={{...inStyle}}>
              <svg width={1080} height={1920} viewBox="0 0 1080 1920">
                <Defs />
                <LDefs />
                <Comp t={local} d={dur} />
              </svg>
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })}
      {/* suelo hacia la zona baja (subtítulos y botones de TikTok) */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(9,12,22,0) 58%, rgba(9,12,22,0.35) 72%, rgba(9,12,22,0.6) 100%)'}} />
      {/* viñeta y grano de película (igual que la serie) */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.3) 100%)'}} />
      <AbsoluteFill style={{overflow: 'hidden', opacity: 0.09, mixBlendMode: 'overlay'}}>
        <div style={{position: 'absolute', left: -((frame * 137) % 512), top: -((frame * 211) % 512), width: 1080 + 1024, height: 1920 + 1024, backgroundImage: `url(${staticFile('cancion/grano.png')})`, backgroundRepeat: 'repeat'}} />
      </AbsoluteFill>
      {/* parpadeo */}
      {lids > 0 && (
        <AbsoluteFill>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 960 * ease(lids) + 2, background: '#05070d', borderBottomLeftRadius: '50% 60px', borderBottomRightRadius: '50% 60px'}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 960 * ease(lids) + 2, background: '#05070d', borderTopLeftRadius: '50% 60px', borderTopRightRadius: '50% 60px'}} />
        </AbsoluteFill>
      )}
      {/* destello de la pantalla */}
      {flash > 0 && <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #f4fbff 0%, #bfe3ff 45%, #6f9fd6 100%)', opacity: flash * 0.92}} />}
      <Player t={t} total={totalSeconds} song={s.song ?? spec.title} artist={s.artist ?? ''} />
      <Subs timings={timings} />
      {t >= timings[last].start && <LiveArrow t={t - timings[last].start} />}
    </AbsoluteFill>
  );
};
