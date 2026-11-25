// Entrada propia para la historia "YOKO" (no depende de las fuentes de los otros estilos).
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {HistoriaYoko} from './styles/yoko/HistoriaYoko';

const FPS = 30;
const Root: React.FC = () => (
  <Composition
    id="Historia-yoko"
    component={HistoriaYoko as any}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={150}
    defaultProps={{spec: {sentences: []}, timings: [], totalSeconds: 5, audioFile: 'audio.wav'} as any}
    calculateMetadata={({props}: any) => ({durationInFrames: Math.max(30, Math.ceil(props.totalSeconds * FPS))})}
  />
);
registerRoot(Root);
