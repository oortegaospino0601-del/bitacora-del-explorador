import numpy as np, wave, sys, json
sr=44100; T=39.5; N=int(sr*T); rng=np.random.default_rng(7)
SC=json.loads(sys.argv[1]) if len(sys.argv)>1 else [0,2,6,12,15,19,22,26,31,37,39.5]
out=sys.argv[2] if len(sys.argv)>2 else 'mix_noVO.wav'
def add(buf,start,sig,g=1.0):
    s=int(start*sr); 
    if s>=len(buf): return
    e=min(len(buf),s+len(sig)); buf[s:e]+=g*sig[:e-s]
def env(n,a=.005,d=.2):
    t=np.arange(n)/sr; return np.minimum(1,t/a)*np.exp(-t/d)
def noise(dur): return rng.standard_normal(int(dur*sr))
def lp(x,k): # simple moving-average lowpass
    return np.convolve(x,np.ones(k)/k,mode='same')
def tone(f,dur,d=.3): t=np.arange(int(dur*sr))/sr; return np.sin(2*np.pi*f*t)*env(len(t),.002,d)
# ---------- music (original): C–Am–F–G, bells + bass + pad, 96 bpm
mus=np.zeros(N); beat=60/96; bar=4*beat
mid=lambda m:440*2**((m-69)/12)
def note(f,st,dur,amp,kind):
    s=int(st*sr); n=int(dur*sr)
    if s>=N: return
    n=min(n,N-s); t=np.arange(n)/sr
    if kind=='bell': w=(np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*2*f*t)+.15*np.sin(2*np.pi*3.01*f*t))*np.exp(-t*3.2)
    elif kind=='bass': w=np.sin(2*np.pi*f*t)*np.exp(-t*1.5)
    elif kind=='pluck': w=(np.sin(2*np.pi*f*t)+.3*np.sin(2*np.pi*2*f*t))*np.exp(-t*6)
    else: w=(np.sin(2*np.pi*f*t)+.5*np.sin(2*np.pi*f*1.005*t))*np.minimum(1,t/.4)*np.minimum(1,(dur-t)/.4)
    mus[s:s+n]+=amp*w
chords=[[60,64,67],[57,60,64],[53,57,60],[55,59,62]]
mel=[[76,74,72,74,76,76,76,None],[72,74,72,71,69,None,69,71],[72,72,74,72,69,67,65,None],[67,69,71,74,72,None,None,None]]
t0=0;k=0
while t0<T:
    c=chords[k%4]
    for m in c: note(mid(m),t0,bar,.045,'pad')
    note(mid(c[0]-24),t0,beat*2,.17,'bass');note(mid(c[0]-24),t0+2*beat,beat*2,.13,'bass')
    for j in range(8): note(mid(c[j%3]+12),t0+j*beat/2,beat/2,.035,'pluck')
    if k>0:
        mm=mel[k%4] if k%8<4 else mel[(k+2)%4]
        for j,m in enumerate(mm):
            if m: note(mid(m),t0+j*beat/2,beat*1.5,.10,'bell')
    t0+=bar;k+=1
f=int(1.5*sr); mus[-f:]*=np.linspace(1,0,f); mus/=np.abs(mus).max()
# ---------- sfx
fx=np.zeros(N)
S=SC
def clink(t): 
    for h,g in [(2900,1),(4100,.5),(5300,.3)]: add(fx,t,tone(h,.4,.12),.10*g)
def thud(t,g=.5): add(fx,t,lp(noise(.25),40)*env(int(.25*sr),.002,.06)*3+tone(70,.25,.1),g)
def rustle(t,d=.4,g=.12): n=noise(d); add(fx,t,(n-lp(n,6))*np.minimum(1,np.arange(len(n))/(.05*sr))*np.exp(-np.arange(len(n))/(d*sr*.6))*np.abs(np.sin(np.arange(len(n))/sr*60)),g)
def plop(t,g=.25): tt=np.arange(int(.18*sr))/sr; add(fx,t,np.sin(2*np.pi*(300+900*tt*0+ 600*np.exp(-tt*30))*tt)*env(len(tt),.002,.05),g)
def plink(t,g=.12): add(fx,t,tone(1800+rng.random()*600,.2,.05),g)
def pour(t,d,g=.06): n=lp(noise(d),3); e=np.minimum(1,np.arange(len(n))/(.15*sr))*np.minimum(1,(len(n)-np.arange(len(n)))/(.2*sr)); add(fx,t,n*e,g)
def crunch(t,d=.5,g=.35):
    for i in range(int(d*60)): add(fx,t+i/60+rng.random()*.01,(noise(.03)-lp(noise(.03),4))*env(int(.03*sr),.001,.01),g*rng.uniform(.4,1))
def chime(t): 
    for i,f in enumerate([1568,1976,2349,3136]): add(fx,t+i*.07,tone(f,.8,.35),.06)
def bubbles(t,d):
    for i in range(int(d*7)): plop(t+i/7+rng.random()*.1,.06)
# scene-relative events
s=S
clink(s[0]+.85);clink(s[0]+.95);clink(s[0]+1.03); rustle(s[0]+1.25,.4,.1)
thud(s[1]+.25,.45); rustle(s[1]+1.6,.5,.2); 
for k in range(4): plink(s[1]+2.0+k*.15,.1)
rustle(s[2]+.35,.8,.14); pour(s[2]+1.5,1.1); 
for k in range(4): plop(s[2]+1.5+1.45+k*.08,.2)
plop(s[2]+1.5+1.95,.18); plop(s[2]+1.5+2.05,.18)
for k in range(20): plink(s[2]+1.5+2.6+k*.09,.09)
bubbles(s[3],s[4]-s[3]); chime(s[3]+2.2)
pour(s[4]+.45,1.0,.05); rustle(s[4]+1.6,1.8,.05)
pour(s[5],1.2,.06); bubbles(s[5]+.5,s[6]-s[5]-.5)
rustle(s[6],.8,.08); plop(s[6]+.95,.3); chime(s[6]+.7); pour(s[6]+1.7,1.0,.05); chime(s[6]+2.9)
crunch(s[7]+.4,.6); crunch(s[7]+1.4,.6)
for k in range(14): plink(s[7]+2.5+k*.07,.05)
crunch(s[7]+4.4,.35,.45)
rustle(s[8]+.75,.5,.1); rustle(s[8]+1.6,.8,.16); chime(s[8]+2.4)
chime(s[9]+.2)
fx/=max(1,np.abs(fx).max()/0.9)
np.save('music.npy',mus); np.save('fx.npy',fx)
mixd=.32*mus+.8*fx
mixd/=max(1,np.abs(mixd).max()/.95)
with wave.open(out,'w') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((mixd*32767).astype(np.int16).tobytes())
print('ok',out)
