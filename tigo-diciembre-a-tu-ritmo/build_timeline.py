# Single source of truth: voice placement, word times, subtitle chunks, story events, SFX cues.
# Writes timeline.json (read by mix.py) and timeline.js (read by score.js / film.js in the browser).
import json
W = json.load(open('vo/words.json'))
L = {l['key']: l for l in W}
START = dict(hook=0.15, abuela=4.35, hermano=8.75, mama=12.05, papa=16.65, prima=20.1,
             ritmo=23.9, claim=25.6, ookla=29.55, remate=33.35)
OFF = 0.06  # edge-tts word offsets run ~60 ms ahead of the audible onset
CHUNKS = dict(hook=[[0,1],[2,4],[5,9],[10,12]], abuela=[[0,4],[5,6],[7,11],[12,17]],
              hermano=[[0,4],[5,10]], mama=[[0,3],[4,8],[9,13]], papa=[[0,4],[5,9]],
              prima=[[0,6],[7,12]], ritmo=[[0,4]], claim=[[0,14]], ookla=[[0,7]], remate=[[0,5]])
lines = []
for k, s in START.items():
    l = L[k]; toks = l['text'].split()
    assert len(toks) == len(l['words']), (k, toks, [w['w'] for w in l['words']])
    words = []
    for tok, w in zip(toks, l['words']):
        words.append(dict(w=w['w'], disp=tok, t0=round(s + w['t'] + OFF, 3), t1=round(s + w['t'] + w['d'] + OFF, 3)))
    lines.append(dict(key=k, start=s, file=f'vo/{k}.mp3', text=l['text'], words=words,
                      end=words[-1]['t1'], chunks=CHUNKS[k]))
LN = {l['key']: l for l in lines}
def wt(k, word, which='t0', n=0):
    c = [w for w in LN[k]['words'] if w['w'].lower().startswith(word.lower())]
    return c[n][which]
BPM = 96; BEAT = 60 / BPM; BAR = 4 * BEAT
DUR = 38.0
GRID0 = None  # set below: a bar line lands exactly on the hook hit
EV = dict(
    hookLights=[wt('hook','diciembre'), wt('hook','casa'), wt('hook','mundo'), wt('hook','internet')],
    hookHit=wt('hook','al'),                     # "¡al mismo tiempo!" -> network flashes
    camAbuela=4.05, abuelaScold=wt('abuela','regaña'), abuelaEnd=LN['abuela']['end'],
    camHermano=8.45, hermanoGoal=wt('hermano','final'),
    camMama=11.98, mamaSneak=wt('mama','que',n=0), mamaTap=wt('mama','probar'),
    camPapa=16.35, papaSnore=wt('papa','roncando'),
    camPrima=19.8, primaSend=wt('prima','grupo'),
    camWide=23.4, wideDone=25.2,
    claim=LN['claim']['words'][0]['t0'], ookla=LN['ookla']['words'][0]['t0'], remate=LN['remate']['words'][0]['t0'],
    finalHit=0,
)
GRID0 = round(EV['hookHit'] - 2 * BAR, 4)   # bar b starts at GRID0 + b*BAR; bar 2 = hook hit
EV['finalHit'] = round(GRID0 + 15 * BAR, 3)
EV['camWide'] = round(GRID0 + 10 * BAR, 3)
SFX = []
def sfx(kind, t, g=1.0): SFX.append(dict(kind=kind, t=round(t, 3), g=g))
sfx('riser', 0.0, 0.5)
for i, t in enumerate(EV['hookLights']): sfx('switch', t - 0.02, 0.8)
sfx('impact', EV['hookHit'] - 0.03, 0.9); sfx('shimmer', EV['hookHit'], 0.7)
for k in ['camAbuela','camHermano','camMama','camPapa','camPrima']: sfx('whoosh', EV[k], 0.75)
sfx('callring', EV['camAbuela'] + 0.75, 0.55)
sfx('scold', EV['abuelaScold'] + 0.05, 0.55)
for i in range(7): sfx('click', EV['camHermano'] + 0.9 + i * 0.23 + (0.07 if i % 2 else 0), 0.45)
sfx('goal', EV['hermanoGoal'] + 0.05, 0.6)
sfx('sizzle', EV['camMama'] + 0.5, 0.35)
sfx('tap', EV['mamaTap'] + 0.1, 0.8)
sfx('snore', EV['papaSnore'] + 0.25, 0.7)
for i in range(9): sfx('step', EV['camPrima'] + 1.0 + i * 0.42, 0.35)
sfx('send', EV['primaSend'] - 0.15, 0.7); sfx('ding', EV['primaSend'] + 0.35, 0.5)
sfx('whooshBig', EV['camWide'], 0.8); sfx('shimmer', EV['wideDone'] - 0.2, 0.5)
sfx('reveal', EV['claim'] - 0.05, 0.45); sfx('ding', EV['ookla'], 0.3)
sfx('sparkle', EV['remate'] - 0.05, 0.6)
for i, (t, g) in enumerate([(EV['finalHit'] - 0.02, 0.5), (EV['finalHit'] + 0.55, 0.35), (EV['finalHit'] + 1.05, 0.3)]): sfx('firework', t, g)
TL = dict(DURATION=DUR, GRID0=GRID0, BPM=BPM, BEAT=BEAT, BAR=BAR, lines=lines, ev=EV, sfx=SFX)
json.dump(TL, open('timeline.json', 'w'), ensure_ascii=False, indent=1)
open('timeline.js', 'w').write('(function(){var TL=' + json.dumps(TL, ensure_ascii=False) +
    ';if(typeof module!=="undefined")module.exports=TL;else globalThis.TL=TL;})();\n')
for l in lines: print(f"{l['key']:8s} {l['start']:6.2f} -> {l['end']:6.2f}  {l['text']}")
print(json.dumps(EV))
