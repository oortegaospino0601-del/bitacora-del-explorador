import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/vt323/latin-400.css';
import {Props, SentenceTiming} from '../../types';

const FONT = "'VT323', 'Courier New', monospace";
const G = '#4dff88'; // fósforo verde
const GD = '#1f8f4a';
const AMBER = '#ffb000';
const RED = '#ff4d4d';
const BG = '#031008';

type CrtScene = {term?: string[]; plot?: 'none' | 'points' | 'hyper' | 'diverge' | 'peak'; stamp?: string; big?: string};

// ---- datos (miles de millones, aproximados, solo ilustrativos) ----
const REAL: [number, number][] = [
  [1950, 2.5], [1960, 3.0], [1970, 3.7], [1980, 4.4], [1990, 5.3], [2000, 6.1],
  [2010, 6.9], [2020, 7.8], [2026, 8.2], [2050, 9.7], [2080, 10.3], [2100, 10.2],
];
const realAt = (t: number) => {
  for (let i = 0; i < REAL.length - 1; i++) {
    const [x0, y0] = REAL[i];
    const [x1, y1] = REAL[i + 1];
    if (t >= x0 && t <= x1) return y0 + ((y1 - y0) * (t - x0)) / (x1 - x0);
  }
  return REAL[REAL.length - 1][1];
};
const hyper = (t: number) => 179 / Math.pow(2026.87 - t, 0.99);

// ---- gráfica ----
const PW = 900;
const PH = 470;
const Chart: React.FC<{kind: CrtScene['plot']; t: number}> = ({kind, t}) => {
  // t: progreso 0..1 de la escena
  const prog = Math.min(1, t * 1.6);
  if (kind === 'points') {
    const pts: [number, number][] = [];
    const base: [number, number][] = [[0, 0.2], [1000, 0.3], [1500, 0.45], [1650, 0.55], [1800, 1.0], [1900, 1.6], [1960, 3.0]];
    for (let i = 0; i < 24; i++) {
      const yr = (1960 * i) / 23;
      let v = 3;
      for (let k = 0; k < base.length - 1; k++) {
        if (yr >= base[k][0] && yr <= base[k + 1][0]) v = base[k][1] + ((base[k + 1][1] - base[k][1]) * (yr - base[k][0])) / (base[k + 1][0] - base[k][0]);
      }
      pts.push([yr, v]);
    }
    const n = Math.floor(prog * 24 + 0.01);
    return (
      <svg width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`}>
        <Axes xl="AÑO 1" xr="1960" yl="" />
        {pts.slice(0, n).map(([yr, v], i) => (
          <rect key={i} x={30 + (yr / 1960) * (PW - 60) - 8} y={PH - 50 - (v / 3.3) * (PH - 100) - 8} width={16} height={16} fill={G} />
        ))}
        <text x={PW / 2} y={34} fill={AMBER} fontFamily={FONT} fontSize={44} textAnchor="middle">{n} / 24 estimaciones · 2.000 años</text>
      </svg>
    );
  }
  const x0 = 1950;
  const x1 = 2100;
  const X = (yr: number) => 30 + ((yr - x0) / (x1 - x0)) * (PW - 60);
  const ymax = 12;
  const Y = (v: number) => PH - 50 - (Math.min(v, ymax) / ymax) * (PH - 100);
  const path = (f: (y: number) => number, from: number, to: number) => {
    const steps = 150;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const yr = from + ((to - from) * i) / steps;
      d += `${i === 0 ? 'M' : 'L'}${X(yr).toFixed(1)} ${Y(f(yr)).toFixed(1)} `;
    }
    return d;
  };
  const hyperEnd = 1960 + (2026.8 - 1960) * (kind === 'hyper' ? prog : 1);
  const realEnd = kind === 'hyper' ? 1960 : kind === 'diverge' ? 1960 + (2100 - 1960) * 0.62 * prog + (1993 - 1960) * 0 : 1950 + 150 * prog;
  return (
    <svg width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`}>
      <Axes xl="1950" xr="2100" yl="" />
      {/* línea de 2026 */}
      <line x1={X(2026.8)} x2={X(2026.8)} y1={20} y2={PH - 50} stroke={RED} strokeWidth={3} strokeDasharray="10 8" />
      <text x={X(2026.8) - 14} y={64} fill={RED} fontFamily={FONT} fontSize={40} textAnchor="end">13 NOV 2026 → ∞</text>
      {(kind === 'hyper' || kind === 'diverge') && <path d={path(hyper, 1960, hyperEnd)} fill="none" stroke={RED} strokeWidth={6} strokeDasharray={kind === 'diverge' ? '14 10' : undefined} />}
      {kind !== 'hyper' && <path d={path(realAt, 1950, Math.min(realEnd, 2100))} fill="none" stroke={G} strokeWidth={7} />}
      {kind === 'diverge' && prog > 0.5 && (
        <>
          <line x1={X(1993)} x2={X(1993)} y1={Y(5.5) - 90} y2={PH - 50} stroke={AMBER} strokeWidth={3} />
          <text x={X(1993) + 12} y={Y(5.5) - 94} fill={AMBER} fontFamily={FONT} fontSize={40}>~1993: se separan</text>
        </>
      )}
      {kind === 'peak' && prog > 0.8 && (
        <text x={X(2080)} y={Y(10.3) - 22} fill={G} fontFamily={FONT} fontSize={42} textAnchor="middle">pico ≈ 10.300 M</text>
      )}
    </svg>
  );
};
const Axes: React.FC<{xl: string; xr: string; yl: string}> = ({xl, xr}) => (
  <g>
    <line x1={30} x2={PW - 30} y1={PH - 50} y2={PH - 50} stroke={GD} strokeWidth={3} />
    <line x1={30} x2={30} y1={20} y2={PH - 50} stroke={GD} strokeWidth={3} />
    {[0.25, 0.5, 0.75].map((f) => (
      <line key={f} x1={30} x2={PW - 30} y1={20 + f * (PH - 70)} y2={20 + f * (PH - 70)} stroke={GD} strokeWidth={1} opacity={0.35} strokeDasharray="4 8" />
    ))}
    <text x={30} y={PH - 12} fill={GD} fontFamily={FONT} fontSize={36}>{xl}</text>
    <text x={PW - 30} y={PH - 12} fill={GD} fontFamily={FONT} fontSize={36} textAnchor="end">{xr}</text>
  </g>
);

// ---- terminal ----
const TermLines: React.FC<{lines: string[]; t0: number}> = ({lines, t0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = Math.max(0, frame / fps - t0);
  const cps = 38; // caracteres por segundo
  let budget = local * cps;
  return (
    <div style={{fontFamily: FONT, fontSize: 64, lineHeight: '70px', color: G}}>
      {lines.map((ln, i) => {
        const shown = Math.max(0, Math.min(ln.length, Math.floor(budget)));
        budget -= ln.length + 4;
        const active = shown > 0 && shown < ln.length;
        const warn = ln.startsWith('!');
        return (
          <div key={i} style={{color: warn ? RED : ln.startsWith('>') ? G : AMBER, minHeight: 70, whiteSpace: 'pre-wrap', textShadow: `0 0 12px ${warn ? RED : G}66`}}>
            {ln.slice(0, shown)}
            {active && <span style={{background: G, color: BG}}>{' '}</span>}
          </div>
        );
      })}
    </div>
  );
};

const Stdout: React.FC<{timings: SentenceTiming[]; sentences: Props['spec']['sentences']}> = ({timings, sentences}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const now = frame / fps;
  let idx = -1;
  timings.forEach((t, i) => {
    if (now >= t.start - 0.05) idx = i;
  });
  if (idx < 0) idx = 0;
  const t = timings[idx];
  if (now > t.sceneEnd + 0.3) return null;
  return (
    <div style={{fontFamily: FONT, fontSize: 66, lineHeight: '70px', color: '#e8ffe9'}}>
      <span style={{color: GD}}>stdout&gt; </span>
      {t.words.map((w, i) => {
        const vis = now >= w.start - 0.02;
        const act = now >= w.start && now < w.end + 0.04;
        return (
          <span key={i} style={{opacity: vis ? 1 : 0, background: act ? AMBER : 'transparent', color: act ? BG : '#e8ffe9', padding: '0 4px', margin: '0 -1px'}}>
            {w.w}{' '}
          </span>
        );
      })}
    </div>
  );
};

export const ShortCrt: React.FC<Props> = ({spec, timings, outroStart, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const now = frame / fps;
  let idx = 0;
  timings.forEach((t, i) => {
    if (now >= t.sceneStart) idx = i;
  });
  const t = timings[idx];
  const sc = (spec.sentences[idx].scene as unknown as CrtScene) ?? {};
  const sceneT = Math.max(0, Math.min(1, (now - t.sceneStart) / Math.max(0.5, t.sceneEnd - t.sceneStart)));
  const inOutro = now >= outroStart;
  const flick = 0.94 + 0.06 * Math.sin(frame * 1.7) * Math.sin(frame * 0.37);
  const rollY = ((frame * 6) % 2200) - 200;
  const spec2 = spec as unknown as {loopLine?: string};

  return (
    <AbsoluteFill style={{background: '#000', fontFamily: FONT}}>
      <Audio src={staticFile(audioFile)} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #07210f 0%, ${BG} 70%, #010604 100%)`, opacity: flick}} />
      {/* marco de ventana */}
      <div style={{position: 'absolute', left: 40, right: 40, top: 70, height: 84, border: `3px solid ${G}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', color: G, fontSize: 48, textShadow: `0 0 10px ${G}88`}}>
        <span>■ doomsday.exe</span>
        <span style={{color: AMBER}}>v1960 · {Math.floor(now * 10) % 2 ? '●' : '○'} EJECUTANDO</span>
      </div>

      {!inOutro && (
        <>
          <div style={{position: 'absolute', left: 60, right: 60, top: 190, height: 420, overflow: 'hidden'}}>
            <TermLines key={idx} lines={sc.term ?? []} t0={t.sceneStart + (idx === 0 ? 0.1 : 0.2)} />
          </div>
          {sc.plot && sc.plot !== 'none' && (
            <div style={{position: 'absolute', left: 90, top: 640, width: PW, height: PH, border: `2px solid ${GD}`, background: '#020c06'}}>
              <Chart kind={sc.plot} t={sceneT} />
            </div>
          )}
          {sc.big && (
            <div style={{position: 'absolute', left: 60, right: 60, top: 700, textAlign: 'center', color: sc.big === 'DESMENTIDO' ? G : RED, fontSize: 190, lineHeight: '190px', textShadow: `0 0 30px currentColor`, border: '8px solid currentColor', padding: '30px 0', transform: `rotate(-4deg) scale(${interpolate(sceneT, [0, 0.12], [1.8, 1], {extrapolateRight: 'clamp'})})`, opacity: interpolate(sceneT, [0, 0.1], [0, 1], {extrapolateRight: 'clamp'})}}>
              {sc.big}
            </div>
          )}
          <div style={{position: 'absolute', left: 60, right: 60, top: 1170, height: 470, borderTop: `3px dashed ${GD}`, paddingTop: 26}}>
            <Stdout timings={timings} sentences={spec.sentences} />
          </div>
        </>
      )}

      {inOutro && (
        <div style={{position: 'absolute', left: 70, right: 70, top: 520, color: G, textShadow: `0 0 14px ${G}88`}}>
          <TermLines
            key="outro"
            t0={outroStart + 0.1}
            lines={[spec2.loopLine ?? '> doomsday.exe', '', '> parece_mentira.exe', '  --es-real', '', ...(spec.outro?.line2 ? ['> ' + spec.outro.line2.toLowerCase().replace(/ /g, '_')] : [])]}
          />
        </div>
      )}

      {/* scanlines, viñeta y barrido */}
      <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 2px, transparent 3px, transparent 6px)', pointerEvents: 'none'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: rollY, height: 180, background: 'linear-gradient(180deg, transparent, rgba(77,255,136,0.07), transparent)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%)'}} />
    </AbsoluteFill>
  );
};
