import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/bangers/latin-400.css';
import '@fontsource/comic-neue/latin-700.css';
import {Props} from '../../types';

const SFX = "'Bangers', Impact, sans-serif";
const TXT = "'Comic Neue', 'Comic Sans MS', sans-serif";
const INK = '#14111f';
const YEL = '#ffd93b';
const PINK = '#ff2e88';
const CYAN = '#18c8ff';

const Pop: React.FC<{t: number; children: React.ReactNode; rot?: number}> = ({t, children, rot = 0}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame: Math.round(t * fps), fps, config: {damping: 9, stiffness: 160}});
  return <div style={{transform: `scale(${0.3 + 0.7 * s}) rotate(${rot}deg)`, opacity: Math.min(1, s * 2)}}>{children}</div>;
};

const Burst: React.FC<{color: string; size: number}> = ({color, size}) => {
  const pts: string[] = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const r = i % 2 ? size * 0.36 : size * 0.5;
    pts.push(`${size / 2 + Math.cos(a) * r},${size / 2 + Math.sin(a) * r}`);
  }
  return (
    <svg width={size} height={size} style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)'}}>
      <polygon points={pts.join(' ')} fill={color} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    </svg>
  );
};

const Big: React.FC<{t: number; text: string; sub?: string; color?: string; size?: number; rot?: number}> = ({t, text, sub, color = PINK, size = 250, rot = -4}) => (
  <div style={{position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <Burst color={color} size={860} />
    <Pop t={t} rot={rot}>
      <div style={{textAlign: 'center', fontFamily: SFX, color: '#fff', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', fontSize: size, lineHeight: 0.95, letterSpacing: 4}}>
        {text}
        {sub && <div style={{fontSize: size * 0.34, marginTop: 14, WebkitTextStroke: `7px ${INK}`}}>{sub}</div>}
      </div>
    </Pop>
  </div>
);

const MapScene: React.FC<{t: number; dur: number}> = ({t, dur}) => {
  const p = Math.min(1, t / Math.max(1, dur * 0.85));
  const d = 'M120 760 L260 640 L330 700 L470 520 L540 560 L650 400 L720 430 L860 250';
  const km = Math.round(2122 * p);
  return (
    <div style={{position: 'relative', width: '100%', height: '100%'}}>
      <svg width="100%" height="100%" viewBox="0 0 960 860">
        <rect x="40" y="40" width="880" height="780" fill="#fff6c9" />
        {Array.from({length: 7}).map((_, i) => <line key={i} x1={40} x2={920} y1={120 + i * 105} y2={120 + i * 105} stroke={INK} strokeWidth={2} opacity={0.18} />)}
        {Array.from({length: 8}).map((_, i) => <line key={i} y1={40} y2={820} x1={110 + i * 110} x2={110 + i * 110} stroke={INK} strokeWidth={2} opacity={0.18} />)}
        <path d={d} fill="none" stroke={INK} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        <path d={d} fill="none" stroke={PINK} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        <circle cx={120} cy={760} r={26} fill={CYAN} stroke={INK} strokeWidth={8} />
        <text x={120} y={830} fontFamily={SFX} fontSize={54} fill={INK} textAnchor="middle">AMAZONÍA</text>
        <text x={820} y={215} fontFamily={SFX} fontSize={54} fill={INK} textAnchor="middle">CERRADO</text>
      </svg>
      <div style={{position: 'absolute', left: 60, top: 60, background: YEL, border: `8px solid ${INK}`, padding: '6px 26px', fontFamily: SFX, fontSize: 110, color: INK, boxShadow: `10px 10px 0 ${INK}`}}>
        {km.toLocaleString('es-CO').replace(/,/g, '.')} KM
      </div>
    </div>
  );
};

const Duel: React.FC<{t: number}> = ({t}) => {
  const a = interpolate(t, [0.2, 0.9], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  const b = interpolate(t, [0.9, 2.6], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  const W = 800;
  return (
    <div style={{padding: '70px 60px', display: 'flex', flexDirection: 'column', gap: 70, fontFamily: SFX, color: INK}}>
      <div>
        <div style={{fontSize: 70}}>RÉCORD ANTERIOR: 60–100 KM</div>
        <div style={{height: 110, width: W * (100 / 2122) * a + 6, background: CYAN, border: `8px solid ${INK}`, boxShadow: `8px 8px 0 ${INK}`}} />
      </div>
      <div>
        <div style={{fontSize: 70}}>GASPAR: 2.122 KM</div>
        <div style={{height: 110, width: W * b + 6, background: PINK, border: `8px solid ${INK}`, boxShadow: `8px 8px 0 ${INK}`}} />
      </div>
    </div>
  );
};

type CScene = {kind: 'big' | 'map' | 'duel' | 'square'; big?: string; sub?: string; color?: string; size?: number};

const SceneView: React.FC<{sc: CScene; t: number; dur: number}> = ({sc, t, dur}) => {
  if (sc.kind === 'map') return <MapScene t={t} dur={dur} />;
  if (sc.kind === 'duel') return <Duel t={t} />;
  if (sc.kind === 'square')
    return (
      <div style={{position: 'relative', width: '100%', height: '100%'}}>
        <Burst color={CYAN} size={800} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Pop t={t}><div style={{width: 300, height: 300, background: '#fff', border: `10px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SFX, fontSize: 70, color: INK, textAlign: 'center', lineHeight: 1}}>700 KM²</div></Pop>
        </div>
      </div>
    );
  return <Big t={t} text={sc.big || ''} sub={sc.sub} color={sc.color} size={sc.size} />;
};

export const ShortComic: React.FC<Props> = ({spec, timings, totalSeconds, outroStart, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const now = frame / fps;
  let idx = 0;
  timings.forEach((tm, i) => { if (now >= tm.sceneStart) idx = i; });
  const inOutro = now >= outroStart;
  const sc = ((spec.sentences[idx] as any).scene || {kind: 'big'}) as CScene;
  const tm = timings[idx];
  const local = now - tm.sceneStart;
  const sceneDur = tm.sceneEnd - tm.sceneStart;
  const outroScene: CScene = {kind: 'big', big: '¿POR QUÉ?', sub: '2.122 KM', color: PINK, size: 230};
  const kick = inOutro ? 'COMENTA TU TEORÍA' : `PÁGINA ${idx + 1}`;
  return (
    <AbsoluteFill style={{background: YEL, backgroundImage: `radial-gradient(${INK}22 22%, transparent 24%)`, backgroundSize: '34px 34px'}}>
      <Audio src={staticFile(audioFile)} />
      <div style={{position: 'absolute', left: 60, top: 70, right: 60, display: 'flex', justifyContent: 'space-between', fontFamily: SFX, fontSize: 56, color: INK}}>
        <span style={{background: PINK, color: '#fff', padding: '0 24px', border: `6px solid ${INK}`, transform: 'rotate(-2deg)'}}>PARECE MENTIRA</span>
        <span style={{background: '#fff', padding: '0 24px', border: `6px solid ${INK}`, transform: 'rotate(2deg)'}}>{kick}</span>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 190, height: 960, background: '#fff', border: `12px solid ${INK}`, boxShadow: `18px 18px 0 ${INK}`, overflow: 'hidden', backgroundImage: `radial-gradient(${CYAN}55 22%, transparent 24%)`, backgroundSize: '28px 28px'}}>
        <SceneView key={inOutro ? 'o' : idx} sc={inOutro ? outroScene : sc} t={inOutro ? now - outroStart : local} dur={sceneDur} />
      </div>
      {!inOutro && (
        <div style={{position: 'absolute', left: 90, right: 90, top: 1260, minHeight: 330, background: '#fff', border: `10px solid ${INK}`, boxShadow: `12px 12px 0 ${INK}`, padding: '28px 36px', fontFamily: TXT, fontWeight: 700, fontSize: 64, lineHeight: 1.18, color: INK}}>
          {tm.words.map((w, i) => {
            const act = now >= w.start && now < w.end + 0.05;
            const vis = now >= w.start - 0.02;
            return <span key={i} style={{opacity: vis ? 1 : 0.0, background: act ? PINK : 'transparent', color: act ? '#fff' : INK, padding: '0 6px', borderRadius: 8}}>{w.w}{' '}</span>;
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};
