# Vista previa de QA: superpone un marcador en cada beat detectado (y número de tiempo 1-8) y agrega el audio de referencia.
import subprocess, sys
src, audio, out = sys.argv[1:4]
BEAT, T0 = 0.59985, -0.0265
f = []
for n in range(0, 56):
    t = T0 + n * BEAT
    if t < 0: t = 0
    cnt = n % 8 + 1
    col = 'yellow' if cnt == 1 else 'white'
    f.append(f"drawbox=x=20:y=1700:w=140:h=140:color={col}@0.85:t=fill:enable='between(t,{t:.3f},{t+0.1:.3f})'")
    f.append(f"drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='{cnt}':x=60:y=1725:fontsize=90:fontcolor=black:enable='between(t,{t:.3f},{t+0.1:.3f})'")
f.append("drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='%{pts\\:flt}':x=200:y=1760:fontsize=40:fontcolor=white:box=1:boxcolor=black@0.6")
vf = ','.join(f)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-i', audio, '-filter_complex', f'[0:v]{vf}[v]', '-map', '[v]', '-map', '1:a', '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '160k', '-shortest', out], check=True)
