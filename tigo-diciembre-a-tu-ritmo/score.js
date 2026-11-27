// score.js — the contract the renderer reads (FPS, FORMAT, DURATION, markers). All timing lives in
// timeline.json (built by build_timeline.py from the voice), which mix.py also reads: one source of truth.
(function () {
  const node = typeof require !== 'undefined';
  const TL = node ? require('./timeline.json') : globalThis.TL;
  const FPS = +((typeof process !== 'undefined' && process.env && process.env.FILM_FPS) || 60);
  const FORMAT = '9:16';
  const DURATION = TL.DURATION;
  const E = TL.ev;
  const markers = {
    hook: { t: E.hookHit, sync: 'av' },
    abuela: E.camAbuela + 1.0, scold: E.abuelaScold, hermano: E.camHermano + 1.0, goal: E.hermanoGoal,
    mama: E.camMama + 1.2, tap: E.mamaTap, papa: E.camPapa + 1.0, snore: E.papaSnore + 0.6,
    prima: E.camPrima + 1.6, send: E.primaSend + 0.2, wide: E.wideDone, claim: E.claim + 3.0, ookla: E.ookla + 2.5,
    remate: E.remate + 1.4, final: { t: E.finalHit, sync: 'av' },
  };
  const S = { hook: [0, E.camAbuela], rooms: [E.camAbuela, E.camPrima], street: [E.camPrima, E.camWide], close: [E.camWide, DURATION] };
  const SCORE = { FPS, FORMAT, DURATION, TL, E, markers, S, STYLE: 'flat' };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
