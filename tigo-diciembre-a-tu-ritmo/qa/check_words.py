# Forbidden words in the voice script, the subtitles, every on-screen string and the description; exact claim check.
import json, re, sys, glob
TL = json.load(open('timeline.json'))
texts = {'voz/subtitulos': ' '.join(l['text'] for l in TL['lines'])}
for f in ['type.js', 'world.js', 'film.js']:
    src = open(f, encoding='utf8').read()
    texts[f'pantalla:{f}'] = ' '.join(re.findall(r"'([^'\n]*[A-Za-zÁÉÍÓÚáéíóúñ¡!][^'\n]*)'", src))
for f in sys.argv[1:]: texts[f] = open(f, encoding='utf8').read()
bad = re.compile(r'\b(claro|claros|clara|claras|claramente|aclarar|aclara|somos)\b', re.I)
ok = True
for k, v in texts.items():
    hits = bad.findall(v)
    print(f'{k:28s} -> {"OK" if not hits else "PROHIBIDAS: " + str(hits)}'); ok &= not hits
claim = next(l for l in TL['lines'] if l['key'] == 'claim')
want = 'la red fija y la red móvil 5G más rápidas de Colombia'
spoken = ' '.join(w['disp'] for w in claim['words']).rstrip('.')
print('frase en voz/pantalla:', repr(spoken)); print('contiene la frase EXACTA:', want in spoken)
ookla = next(l for l in TL['lines'] if l['key'] == 'ookla')['text']
print('reconocimiento:', ookla, '| en pantalla:', 'Reconocidas en los Speedtest Awards de Ookla 2026' in open('type.js', encoding='utf8').read())
sys.exit(0 if ok and want in spoken else 1)
