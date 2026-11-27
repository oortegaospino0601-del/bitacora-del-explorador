import numpy as np, json, soundfile as sf
tm=json.load(open('timing.json')); sr=44100; T=tm['SC'][-1]; N=int(T*sr)
mus=np.load('music.npy')[:N]; fx=np.load('fx.npy')[:N]
vo=np.zeros(N)
for i,st in enumerate(tm['VO']):
    a,r=sf.read(f'vo_{i:02d}.wav')
    if a.ndim>1:a=a.mean(1)
    # resample 24k->44.1k
    x=np.interp(np.arange(int(len(a)*sr/r))*r/sr,np.arange(len(a)),a)
    s=int(st*sr);e=min(N,s+len(x));vo[s:e]+=x[:e-s]
vo/=np.abs(vo).max()
# ducking envelope from voice energy
k=int(.05*sr);en=np.sqrt(np.convolve(vo**2,np.ones(k)/k,'same'));act=(en>.02).astype(float)
k2=int(.25*sr);act=np.clip(np.convolve(act,np.ones(k2)/k2,'same')*1.5,0,1)
duck=1-.6*act
out=.95*vo+.30*mus*duck+.45*fx*(1-.35*act)
out/=np.abs(out).max()/.95
sf.write('mix_final.wav',out.astype(np.float32),sr,subtype='PCM_16')
print('ok',T)
