import json, subprocess, os
from PIL import Image
C={"leon":"#F2801F","elefante":"#1F4FD8","pulpo":"#C774A8","aguila":"#EE4444"}
os.makedirs("final",exist_ok=True)
jobs=[dict(w=1800,h=900,out="final/grupo.png",q=dict(az=192,el=14,dist=300,ty=18),
      items=[dict(f=f"stl/ficha-{n}.stl",color=c,x=x) for (n,c),x in zip(C.items(),[57,19,-19,-57])])]
for n,c in C.items():
    for az,tag in ((205,"frente"),(140,"lado"),(20,"atras")):
        jobs.append(dict(w=900,h=1000,out=f"final/{n}-{tag}.png",q=dict(az=az,el=14,dist=135,ty=19),items=[dict(f=f"stl/ficha-{n}.stl",color=c)]))
subprocess.run(["node","shot.js",json.dumps(jobs)],check=True,stdout=subprocess.DEVNULL)
ns=list(C); tags=["frente","lado","atras"]; W,H=900,1000; s=0.5
g=Image.new('RGB',(int(W*s)*4,int(H*s)*3),'#f4efe6')
for r,t in enumerate(tags):
  for c_,n in enumerate(ns):
    g.paste(Image.open(f"final/{n}-{t}.png").resize((int(W*s),int(H*s))),(int(W*s)*c_,int(H*s)*r))
g.save("final/vistas.png")
