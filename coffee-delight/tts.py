import sys, json, soundfile as sf, numpy as np
from kokoro_onnx import Kokoro
k=Kokoro('models/kokoro-v1.0.int8.onnx','models/voices-v1.0.bin')
voice=sys.argv[1] if len(sys.argv)>1 else 'ef_dora'
# (texto para la voz, texto del subtítulo)
L=[
("Mi natilla de este año sabe a café.","Mi natilla de este año sabe a café."),
("Y el truco lo compré en la tienda de la esquina: Cofi Dilait Clásico.","Y el truco lo compré en la tienda de la esquina: Coffee Delight Clásico."),
("En la olla van tres cuartos de litro de leche, ciento cincuenta gramos de panela, dos astillas de canela... y veinte caramelos.","En la olla van tres cuartos de litro de leche, 150 gramos de panela, dos astillas de canela… y veinte caramelos."),
("A fuego medio, revolviendo, hasta que se disuelvan. ¡Miren ese color!","A fuego medio, revolviendo, hasta que se disuelvan. ¡Miren ese color!"),
("Aparte, el resto de la leche fría con ciento veinte gramos de fécula.","Aparte, el resto de la leche fría con 120 gramos de fécula."),
("Lo echo, y a revolver sin parar, unos diez minutos.","Lo echo, y a revolver sin parar, unos diez minutos."),
("Cuando se despega de la olla, está lista: mantequilla, al molde y a la nevera.","Cuando se despega de la olla, está lista: mantequilla, al molde y a la nevera."),
("Y el toque final: trituro seis caramelos y se los riego por encima. ¡Eso cruje delicioso!","Y el toque final: trituro seis caramelos y se los riego por encima. ¡Eso cruje delicioso!"),
("¿Y los que sobran? Al bolsillo. Café de bolsillo para mi pausa en la novena, o en el camino.","¿Y los que sobran? Al bolsillo. Café de bolsillo para mi pausa en la novena… o en el camino."),
("Guárdenla para el dieciséis.","Guárdenla para el 16."),
]
out=[]
for i,(say,sub) in enumerate(L):
    a,sr=k.create(say,voice=voice,speed=1.2,lang='es')
    a=np.asarray(a,dtype=np.float32)
    # trim silence
    idx=np.where(np.abs(a)>0.01)[0]; a=a[max(0,idx[0]-200):idx[-1]+800]
    sf.write(f'anim/vo_{i:02d}.wav',a,sr); out.append({'i':i,'dur':len(a)/sr,'sub':sub,'sr':sr})
json.dump(out,open('anim/vo.json','w'),ensure_ascii=False,indent=1)
print([round(o['dur'],2) for o in out], 'total', round(sum(o['dur'] for o in out),2))
