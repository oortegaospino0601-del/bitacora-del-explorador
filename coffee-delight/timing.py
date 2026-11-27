import json,re
vo=json.load(open('vo.json'))
mins=[1.9,3.2,6.3,3.0,3.6,2.9,3.0,5.0,2.8,2.0]
lead=[.05,.12,.12,.12,.12,.12,.12,.12,.12,.12]
SC=[0];VO=[];SUBS=[]
for i,o in enumerate(vo):
    st=SC[-1]+lead[i]; VO.append(round(st,3))
    d=max(o['dur']+lead[i]+.18,mins[i]) if i<9 else max(o['dur']+lead[i]+.9,mins[i])
    SC.append(round(SC[-1]+d,3))
    # chunk subtitle: split at punctuation, then max 5 words
    parts=re.split(r'(?<=[,.:;!?…])\s+',o['sub']);chunks=[]
    for p in parts:
        w=p.split()
        while len(w)>6: chunks.append(' '.join(w[:5])); w=w[5:]
        if w: chunks.append(' '.join(w))
    tot=sum(len(c)+3 for c in chunks);t=st
    for c in chunks:
        dd=o['dur']*(len(c)+3)/tot; SUBS.append({'a':round(t,3),'b':round(t+dd,3),'text':c}); t+=dd
SUBS[-1]['b']=SC[-1]
for k in range(len(SUBS)-1):  # keep each sub until next starts if gap < .5
    if SUBS[k+1]['a']-SUBS[k]['b']<.5: SUBS[k]['b']=SUBS[k+1]['a']
json.dump({'SC':SC,'VO':VO,'SUBS':SUBS},open('timing.json','w'),ensure_ascii=False)
print('SC',SC);print('total',SC[-1]);print(len(SUBS),'subs')
for s in SUBS[:6]: print(s)
