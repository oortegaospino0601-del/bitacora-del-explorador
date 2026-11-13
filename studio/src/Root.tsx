import React from 'react';
import {Composition} from 'remotion';
import {Short} from './Short';
import {ShortDiario} from './styles/diario/ShortDiario';
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
  </>
);
