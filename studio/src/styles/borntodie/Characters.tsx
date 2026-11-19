import React from 'react';

// Personajes ilustrados (originales, estilizados) para el Short "Born to Die".

export const heart = (cx: number, cy: number, s: number) =>
  `M ${cx} ${cy + s * 0.45} C ${cx - s * 0.95} ${cy - s * 0.1}, ${cx - s * 0.55} ${cy - s * 0.78}, ${cx} ${cy - s * 0.3} ` +
  `C ${cx + s * 0.55} ${cy - s * 0.78}, ${cx + s * 0.95} ${cy - s * 0.1}, ${cx} ${cy + s * 0.45} Z`;

const SKIN = '#f2cfbf';
const SKIN_SH = '#d9a690';
const LIPS = '#c8102e';

export type LanaProps = {
  id: string;
  glassesOff?: number; // 0 puestas, 1 quitadas
  warn?: number; // reflejo de advertencia en las gafas (0..1)
  smile?: number; // 0 neutra, 1 sonrisa resignada
  can?: boolean;
  canGlow?: number; // 0..1
  canRed?: number; // 0..1 (la lata "se vuelve peligro")
  sway?: number; // balanceo del pelo, en grados
  light?: string; // color de la luz ambiental de borde
  lensTint?: string;
};

export const Lana: React.FC<LanaProps> = ({
  id,
  glassesOff = 0,
  warn = 0,
  smile = 0,
  can = false,
  canGlow = 0.7,
  canRed = 0,
  sway = 0,
  light = '#39ff6a',
  lensTint = '#2a0612',
}) => {
  const g = (n: string) => `${id}-${n}`;
  const lc = 262 - smile * 6; // comisura izquierda
  const rc = 338 + smile * 6;
  const cy = 360 - smile * 7;
  const canC = canRed > 0.5 ? '#ff2340' : '#39ff6a';
  return (
    <svg viewBox="0 0 600 900" width="100%" height="100%" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={g('hair')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a2516" />
          <stop offset="0.6" stopColor="#3b160d" />
          <stop offset="1" stopColor="#24100a" />
        </linearGradient>
        <radialGradient id={g('face')} cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#fbe1d3" />
          <stop offset="0.7" stopColor={SKIN} />
          <stop offset="1" stopColor={SKIN_SH} />
        </radialGradient>
        <linearGradient id={g('lens')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={lensTint} stopOpacity="0.95" />
          <stop offset="1" stopColor="#08020a" stopOpacity="0.97" />
        </linearGradient>
        <linearGradient id={g('can')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={canRed > 0.5 ? '#5a0610' : '#0a4f20'} />
          <stop offset="0.3" stopColor={canC} />
          <stop offset="0.45" stopColor="#eafff0" />
          <stop offset="0.6" stopColor={canC} />
          <stop offset="1" stopColor={canRed > 0.5 ? '#4a040c' : '#063a17'} />
        </linearGradient>
        <filter id={g('glow')} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="14" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={g('soft')} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* pelo trasero, voluminoso, estilo años 60 */}
      <g transform={`rotate(${sway} 300 120)`}>
        <path
          d="M300 62 C 140 62, 82 190, 100 330 C 112 450, 62 560, 112 690 C 150 775, 232 735, 244 640 L 356 640 C 368 735, 450 775, 488 690 C 538 560, 488 450, 500 330 C 518 190, 460 62, 300 62 Z"
          fill={`url(#${g('hair')})`}
        />
        <path d="M300 62 C 140 62, 82 190, 100 330 C 112 450, 62 560, 112 690" stroke={light} strokeOpacity="0.45" strokeWidth="5" fill="none" />
        <path d="M160 140 C 200 100, 260 86, 320 90 M140 220 C 170 160, 230 130, 290 128 M430 150 C 400 110, 350 92, 300 92 M470 260 C 450 190, 400 150, 340 140" stroke="#8a4127" strokeWidth="6" fill="none" opacity="0.55" strokeLinecap="round" />
        <path d="M112 690 C 90 720, 70 700, 80 670 M488 690 C 510 720, 530 700, 520 670" stroke="#3b160d" strokeWidth="18" fill="none" strokeLinecap="round" />
      </g>

      {/* cuello, hombros y blusa blanca de hombros caídos */}
      <path d="M270 390 L330 390 L334 470 L266 470 Z" fill={SKIN_SH} />
      <path d="M78 900 C 78 650, 118 548, 226 506 C 250 496, 262 478, 268 458 L332 458 C 338 478, 350 496, 374 506 C 482 548, 522 650, 522 900 Z" fill={SKIN} />
      <path d="M268 458 C 286 478, 314 478, 332 458" stroke={SKIN_SH} strokeWidth="5" fill="none" />
      <path d="M200 528 C 240 520, 268 532, 290 548 M400 528 C 360 520, 332 532, 310 548" stroke={SKIN_SH} strokeWidth="4" fill="none" opacity="0.7" />
      <path d="M62 900 C 66 700, 104 610, 176 586 C 236 626, 364 626, 424 586 C 496 610, 534 700, 538 900 Z" fill="#f3eee8" />
      <path d="M176 586 C 236 626, 364 626, 424 586" stroke="#cfc6bd" strokeWidth="7" fill="none" />
      <path d="M150 690 C 170 760, 170 830, 160 900 M450 690 C 430 760, 430 830, 440 900 M300 650 L300 900" stroke="#d8d0c7" strokeWidth="5" fill="none" />
      {/* cara */}
      <path d="M205 270 C 205 178, 250 160, 300 160 C 350 160, 395 178, 395 270 C 395 352, 350 410, 300 412 C 250 410, 205 352, 205 270 Z" fill={`url(#${g('face')})`} />
      <ellipse cx="248" cy="322" rx="26" ry="14" fill="#f08a8a" opacity="0.28" />
      <ellipse cx="352" cy="322" rx="26" ry="14" fill="#f08a8a" opacity="0.28" />
      {/* cejas */}
      <path d="M232 238 Q258 222 286 236" stroke="#3a1a10" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M314 236 Q342 222 368 238" stroke="#3a1a10" strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* ojos con delineado de gato (se ven al quitarse las gafas) */}
      {[262, 338].map((ex, k) => {
        const m = k === 0 ? -1 : 1;
        return (
          <g key={ex}>
            <path d={`M${ex - 23} 274 Q${ex} 262 ${ex + 23} 274 Q${ex} 283 ${ex - 23} 274 Z`} fill="#fff7f2" />
            <circle cx={ex} cy={273} r={8} fill="#5b7a3d" />
            <circle cx={ex} cy={273} r={4} fill="#120806" />
            <circle cx={ex + 3} cy={270} r={2} fill="#fff" />
            <path d={`M${ex - 25 * m} 275 Q${ex} 258 ${ex + 25 * m} 272 L${ex + 38 * m} 262`} stroke="#120806" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d={`M${ex - 22} 268 Q${ex} 256 ${ex + 22} 268`} stroke="#b88f88" strokeWidth="4" fill="none" opacity={0.6} />
          </g>
        );
      })}
      {/* nariz */}
      <path d="M302 285 Q298 316 288 327 Q300 336 313 327" stroke={SKIN_SH} strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* labios rojos */}
      <path d={`M${lc} ${cy} Q280 345 300 353 Q320 345 ${rc} ${cy} Q300 366 ${lc} ${cy} Z`} fill={LIPS} />
      <path d={`M${lc} ${cy} Q300 ${394 - smile * 4} ${rc} ${cy} Q300 ${370 + smile * 3} ${lc} ${cy} Z`} fill="#a50c25" />
      <ellipse cx="300" cy={376 - smile * 3} rx="16" ry="4" fill="#fff" opacity="0.35" />
      {/* pelo delantero */}
      <g transform={`rotate(${sway * 0.6} 300 160)`}>
        <path d="M300 158 C 238 146, 186 196, 198 306 C 206 246, 244 210, 302 198 C 336 192, 372 180, 404 236 C 398 178, 360 152, 300 158 Z" fill={`url(#${g('hair')})`} />
        <path d="M206 250 C 178 330, 192 430, 150 540 C 206 476, 222 380, 218 300 Z" fill={`url(#${g('hair')})`} />
        <path d="M394 250 C 422 330, 408 430, 450 540 C 394 476, 378 380, 382 300 Z" fill={`url(#${g('hair')})`} />
        <path d="M230 180 C 260 168, 300 170, 340 176" stroke="#7a3b22" strokeWidth="4" fill="none" opacity="0.7" />
      </g>

      {/* gafas de corazón */}
      <g
        transform={`translate(${glassesOff * 40} ${-glassesOff * 300}) rotate(${-glassesOff * 28} 300 272)`}
        opacity={1 - Math.min(1, glassesOff * 1.15)}
      >
        {[258, 342].map((hx) => (
          <g key={hx}>
            <path d={heart(hx, 284, 72)} fill={`url(#${g('lens')})`} />
            <path d={`M${hx - 30} 262 L${hx - 6} 248`} stroke={light} strokeWidth="6" strokeLinecap="round" opacity="0.75" />
            <path d={`M${hx - 30} 280 L${hx + 10} 254`} stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
            {warn > 0 && (
              <g opacity={warn} filter={`url(#${g('glow')})`}>
                <path d={`M${hx} 255 L${hx + 20} 292 L${hx - 20} 292 Z`} fill="none" stroke="#ff2340" strokeWidth="5" strokeLinejoin="round" />
                <path d={`M${hx} 266 L${hx} 280`} stroke="#ff2340" strokeWidth="5" strokeLinecap="round" />
                <circle cx={hx} cy={286} r={2.8} fill="#ff2340" />
              </g>
            )}
            <path d={heart(hx, 284, 72)} fill="none" stroke="#ff1f4b" strokeWidth="9" strokeLinejoin="round" />
          </g>
        ))}
        <path d="M290 268 Q300 260 310 268" stroke="#ff1f4b" strokeWidth="7" fill="none" />
        <path d="M200 262 L214 266 M400 262 L386 266" stroke="#ff1f4b" strokeWidth="7" strokeLinecap="round" />
      </g>

      {/* brazo, mano y lata verde neón */}
      {can && (
        <g>
          <path d="M488 900 C 512 760, 520 620, 486 520 L 420 528 C 446 620, 436 760, 410 900 Z" fill={SKIN} />
          <path d="M486 520 C 520 620, 512 760, 488 900" stroke={SKIN_SH} strokeWidth="6" fill="none" />
          <g filter={`url(#${g('glow')})`} opacity={0.25 + canGlow * 0.75}>
            <rect x="398" y="344" width="96" height="172" rx="20" fill={canC} opacity="0.55" />
          </g>
          <rect x="398" y="344" width="96" height="172" rx="20" fill={`url(#${g('can')})`} />
          <ellipse cx="446" cy="350" rx="44" ry="9" fill="#d9e6dc" />
          <ellipse cx="446" cy="350" rx="30" ry="5" fill="#9fb3a5" />
          <path d={heart(446, 410, 30)} fill="#ffffff" opacity="0.92" />
          <text x="446" y="470" textAnchor="middle" fontFamily="'Playfair Display', serif" fontStyle="italic" fontWeight={700} fontSize="30" fill="#ffffff">
            diet
          </text>
          <ellipse cx="448" cy="478" rx="56" ry="40" fill={SKIN} />
          <path d="M404 470 Q446 456 494 470 M404 486 Q446 474 494 488 M406 502 Q446 492 492 504" stroke={SKIN_SH} strokeWidth="4" fill="none" />
          <path d="M398 470 l10 -4 M398 486 l10 -3" stroke={LIPS} strokeWidth="6" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

export const Guy: React.FC<{rim?: string}> = ({rim = '#ff2e63'}) => (
  <svg viewBox="0 0 400 800" width="100%" height="100%" style={{overflow: 'visible'}}>
    {/* piernas cruzadas, vaqueros oscuros */}
    <path d="M150 470 L132 755 L176 758 L198 482 Z" fill="#1d2a44" />
    <path d="M206 470 L254 752 L214 760 L182 500 Z" fill="#24324f" />
    <path d="M124 752 L182 752 L186 780 L112 780 Z M208 752 L262 750 L272 780 L204 780 Z" fill="#0b0b0d" />
    {/* chaqueta de cuero */}
    <path d="M108 252 C 118 228, 160 214, 200 214 C 240 214, 282 228, 292 252 L 304 484 L 96 484 Z" fill="#111115" />
    <path d="M180 220 L200 300 L220 220 Z" fill="#e7e2dc" />
    <path d="M168 218 L196 330 L150 262 Z M232 218 L204 330 L250 262 Z" fill="#26262e" />
    <path d="M96 484 L108 252" stroke={rim} strokeWidth="5" opacity="0.8" />
    <path d="M292 252 L304 484" stroke="#7af7ff" strokeWidth="3" opacity="0.35" />
    {/* brazos cruzados */}
    <rect x="98" y="330" width="206" height="62" rx="30" fill="#1b1b21" />
    <path d="M110 340 Q200 320 292 352" stroke="#3a3a46" strokeWidth="4" fill="none" />
    <ellipse cx="116" cy="362" rx="20" ry="18" fill="#9b6f5d" />
    {/* cuello y cabeza */}
    <path d="M182 190 L218 190 L222 224 L178 224 Z" fill="#8f6453" />
    <ellipse cx="200" cy="160" rx="44" ry="54" fill="#b98a74" />
    <path d="M200 106 C 230 108, 246 140, 244 168 C 242 200, 226 214, 200 214 Z" fill="#6c4436" opacity="0.75" />
    <path d="M156 158 C 158 132, 168 112, 190 106" stroke={rim} strokeWidth="5" fill="none" opacity="0.85" />
    {/* tupé engominado */}
    <path d="M150 152 C 142 90, 190 66, 242 86 C 266 98, 260 128, 250 142 C 230 112, 190 112, 160 150 Z" fill="#0d0b0b" />
    <path d="M170 102 C 196 86, 226 88, 246 100" stroke="#3b3535" strokeWidth="4" fill="none" />
    <path d="M178 186 Q196 194 214 186" stroke="#5a382c" strokeWidth="4" fill="none" />
  </svg>
);

export const ClassicCar: React.FC<{lamp?: number}> = ({lamp = 1}) => (
  <svg viewBox="0 0 900 360" width="100%" height="100%" style={{overflow: 'visible'}}>
    <defs>
      <linearGradient id="carbody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff4b5f" />
        <stop offset="0.35" stopColor="#b3122e" />
        <stop offset="1" stopColor="#4a0611" />
      </linearGradient>
      <linearGradient id="carglass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#1b2b4a" />
        <stop offset="0.5" stopColor="#2f4f7a" />
        <stop offset="1" stopColor="#0b1222" />
      </linearGradient>
    </defs>
    <ellipse cx="460" cy="330" rx="440" ry="22" fill="#000" opacity="0.55" />
    <path
      d="M40 250 C 40 210, 80 195, 160 190 L 300 185 C 340 130, 380 115, 470 112 L 560 112 C 620 115, 660 150, 690 185 L 820 178 C 850 172, 872 150, 888 122 L 892 200 C 894 240, 880 262, 860 268 L 60 272 C 48 270, 40 262, 40 250 Z"
      fill="url(#carbody)"
    />
    <path d="M330 182 C 360 140, 392 128, 460 126 L 545 126 C 596 128, 630 155, 656 182 Z" fill="url(#carglass)" />
    <path d="M488 126 L 484 182" stroke="#b3122e" strokeWidth="10" />
    <path d="M380 170 L 430 134" stroke="#fff" strokeWidth="5" opacity="0.25" />
    <path d="M60 222 L 880 214" stroke="#e8e8f0" strokeWidth="6" opacity="0.85" />
    <path d="M36 252 L 120 252 M 800 252 L 896 248" stroke="#dfe3ea" strokeWidth="14" strokeLinecap="round" />
    <path d="M820 178 C 850 172, 872 150, 888 122" stroke="#ff8a95" strokeWidth="4" fill="none" />
    <circle cx="880" cy="200" r="11" fill="#ff1f3d" opacity={0.6 + 0.4 * lamp} />
    <circle cx="880" cy="200" r="26" fill="#ff1f3d" opacity={0.25 * lamp} />
    <circle cx="52" cy="232" r="12" fill="#ffd27a" />
    {[210, 720].map((wx) => (
      <g key={wx}>
        <path d={`M${wx - 72} 262 A 72 72 0 0 1 ${wx + 72} 262 Z`} fill="#2a030a" />
        <circle cx={wx} cy={272} r={54} fill="#0b0b0d" />
        <circle cx={wx} cy={272} r={34} fill="#f2efe9" />
        <circle cx={wx} cy={272} r={22} fill="#c9ced6" />
        <circle cx={wx} cy={272} r={8} fill="#7a808a" />
      </g>
    ))}
  </svg>
);
