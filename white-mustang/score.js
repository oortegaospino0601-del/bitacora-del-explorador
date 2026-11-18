// THE SCORE — single source of truth. Every cut and every visual beat is derived from the
// narration's real word times (vo-data.js, written by song.js), so picture and voice cannot drift.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const VO = node ? require('./vo-data') : globalThis.VO;

  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const WIDE = W / H > 1.2;
  const STYLE = 'flat';
  const DURATION = VO.DURATION;

  const seg = Object.fromEntries(VO.segs.map((s) => [s.id, s]));
  // first word in a segment whose text (stripped of punctuation) matches; nth for repeats
  const strip = (s) => s.toLowerCase().replace(/[^a-záéíóúñü]/g, '');
  const word = (segId, w, nth = 0) => {
    const hits = VO.words.filter((x) => x.seg === segId && strip(x.w) === strip(w));
    if (!hits[nth]) throw new Error(`score: word "${w}" not in ${segId}`);
    return hits[nth];
  };

  // ---------- cuts: each shot starts inside the silence before its narration ----------
  const cut = (id) => +(seg[id].t - seg[id].pre * 0.55).toFixed(3);
  const S = {
    hook: [0, cut('motel')],
    motel: [cut('motel'), cut('drive')],
    drive: [cut('drive'), cut('light')],
    light: [cut('light'), cut('road')],
    road: [cut('road'), +(seg.close.t - 0.9).toFixed(3)],
    close: [+(seg.close.t - 0.9).toFixed(3), DURATION],
  };

  // ---------- story beats (all from word times) ----------
  const ev = {
    neonOn: 0.18,
    glitch: word('hook', 'pregunta').t, // the sign flashes its hidden question
    title: word('motel', 'Mustang').t, // title card on the first "White Mustang"
    carArrive: word('motel', 'amante').t, // the engine is heard before it's seen
    carStop: word('motel', 'clásico').t + 0.25, // skids to a stop on "clásico"
    adj1: word('motel', 'hermoso').t,
    adj2: word('motel', 'peligroso').t,
    adj3: word('motel', 'ruidoso').t,
    estetica: word('drive', 'estética').t,
    rev: word('drive', 'acelera').t, // speed lines + shake
    hollow: word('drive', 'vacío').t, // the driver turns out to be empty
    nowhere: word('drive', 'ninguna').t, // the "NINGUNA PARTE" sign passes
    redLight: seg.light.t - 0.2,
    magic: word('light', 'magia').t,
    sing: word('light', 'escucha').t, // the sound waves rise from her thoughts
    wm: word('light', 'white').t, // "White Mustang…"
    morph0: word('light', 'convierte').t, // letters start to drift
    morph1: word('light', 'why').t - 0.05, // ...and lock into "WHY AM I STAYING?" on "Why"
    porque: word('light', 'por').t,
    leave: word('road', 'bajarte').t, // the car pulls away
    vanish: word('road', 'destruyendo').end, // taillights gone in the fog
    turn: word('road', 'destruyendo').end + 0.25,
    endTitle: seg.close.end + 0.15,
  };

  // ---------- captions: phrases of up to 6 words, broken at punctuation and at segment edges ----------
  // clauses end at punctuation; short clauses merge forward, long ones split into balanced chunks
  const clauses = [];
  let cl = null;
  for (const w of VO.words) {
    if (!cl || cl.seg !== w.seg) { cl = { seg: w.seg, words: [] }; clauses.push(cl); }
    cl.words.push(w);
    if (/[.?!:…,]["”]?\.?$/.test(w.w)) cl = null;
  }
  const merged = [];
  for (const c of clauses) {
    const last = merged[merged.length - 1];
    if (last && last.seg === c.seg && !c.words.some((x) => /"/.test(x.w)) && (last.words.length <= 2 || c.words.length <= 2) && last.words.length + c.words.length <= 7 && !/[.?!:…]["”]?\.?$/.test(last.words[last.words.length - 1].w)) last.words.push(...c.words);
    else merged.push({ seg: c.seg, words: [...c.words] });
  }
  const captions = [];
  for (const c of merged) {
    const n = Math.ceil(c.words.length / 7), per = Math.ceil(c.words.length / n);
    for (let i = 0; i < c.words.length; i += per) captions.push({ seg: c.seg, words: c.words.slice(i, i + per) });
  }
  for (const c of captions) { c.t = c.words[0].t - 0.08; c.end = c.words[c.words.length - 1].end + 0.25; }

  const markers = {
    glitch: { t: ev.glitch, sync: 'v' },
    motel: S.motel[0],
    carStop: ev.carStop,
    drive: S.drive[0],
    hollow: ev.hollow,
    light: S.light[0],
    morph: ev.morph1,
    road: S.road[0],
    vanish: ev.vanish,
    close: S.close[0],
    endTitle: ev.endTitle,
  };

  const SCORE = { FPS, FORMAT, W, H, SAFE, WIDE, STYLE, DURATION, S, seg, ev, markers, captions, VO };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
