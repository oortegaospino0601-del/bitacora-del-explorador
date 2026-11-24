import React from 'react';
import {Composition} from 'remotion';
import {Short} from './Short';
import {ShortDiario} from './styles/diario/ShortDiario';
import {ShortPlano} from './styles/plano/ShortPlano';
import {ShortChat} from './styles/chat/ShortChat';
import {ShortCrt} from './styles/crt/ShortCrt';
import {ShortComic} from './styles/comic/ShortComic';
import {HistoriaMundo} from './styles/mundo/HistoriaMundo';
import {Props} from './types';

const FPS = 30;

const defaultProps: Props = {
  spec: {
    slug: 'demo',
    title: 'Demo',
    palette: 'space',
    sentences: [{text: 'Demo', scene: {type: 'title', big: 'DEMO'}}],
  },
  timings: [{start: 0.3, end: 2, sceneStart: 0, sceneEnd: 2.5, words: [{w: 'Demo', start: 0.3, end: 2}]}],
  totalSeconds: 5,
  outroStart: 2.5,
  audioFile: 'audio.wav',
};

export const Root: React.FC = () => (
  <>
  <Composition
    id="Short"
    component={Short}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={150}
    defaultProps={defaultProps}
    calculateMetadata={({props}) => ({
      durationInFrames: Math.max(30, Math.ceil(props.totalSeconds * FPS)),
    })}
  />
  <Composition
    id="Short-diario"
    component={ShortDiario}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={150}
    defaultProps={defaultProps}
    calculateMetadata={({props}) => ({
      durationInFrames: Math.max(30, Math.ceil(props.totalSeconds * FPS)),
    })}
  />
  <Composition
    id="Short-plano"
    component={ShortPlano}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={150}
    defaultProps={defaultProps}
    calculateMetadata={({props}) => ({
      durationInFrames: Math.max(30, Math.ceil(props.totalSeconds * FPS)),
    })}
  />
  <Composition
    id="Short-chat"
    component={ShortChat}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={150}
    defaultProps={defaultProps}
    calculateMetadata={({props}) => ({
      durationInFrames: Math.max(30, Math.ceil(props.totalSeconds * FPS)),
    })}
  />
  <Composition
    id="Short-crt"
    component={ShortCrt}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={150}
    defaultProps={defaultProps}
    calculateMetadata={({props}) => ({
      durationInFrames: Math.max(30, Math.ceil(props.totalSeconds * FPS)),
    })}
  />
  <Composition
    id="Short-comic"
    component={ShortComic}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={150}
    defaultProps={defaultProps}
    calculateMetadata={({props}) => ({
      durationInFrames: Math.max(30, Math.ceil(props.totalSeconds * FPS)),
    })}
  />
  <Composition
    id="Historia-mundo"
    component={HistoriaMundo as unknown as React.FC<Record<string, unknown>>}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={150}
    defaultProps={{spec: {slug: 'demo', title: 'Demo', player: {song: 'Demo', artist: 'Demo'}}, timings: [], scenes: [{id: 'hook', start: 0, end: 5}], totalSeconds: 5, audioFile: 'audio.wav'}}
    calculateMetadata={({props}) => ({
      durationInFrames: Math.max(30, Math.ceil((props.totalSeconds as number) * FPS)),
    })}
  />
  </>
);
