import sys, glob
from PIL import Image
files = sys.argv[2:]; out = sys.argv[1]
ims = [Image.open(f) for f in files]; s = 0.42
w, h = int(1080*s), int(1920*s); cols = 4; rows = (len(ims)+cols-1)//cols
o = Image.new('RGB', (cols*(w+8), rows*(h+8)), (255,255,255))
for i, im in enumerate(ims): o.paste(im.convert('RGB').resize((w, h)), ((i%cols)*(w+8), (i//cols)*(h+8)))
o.save(out)
