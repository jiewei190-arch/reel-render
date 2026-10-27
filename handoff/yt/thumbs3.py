import json,subprocess,sys
from PIL import Image,ImageDraw,ImageFont,ImageFilter
meta=json.load(open('meta3.json'))
T=json.load(open('thumb_t.json')) if __import__('os').path.exists('thumb_t.json') else {}
F=ImageFont.truetype('/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf',118)
for m in meta:
    i=m['id']; t=T.get(i,3.0)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(t),'-i',f'../up/{i}.mp4','-frames:v','1','-vf','scale=1080:1920',f'fr/{i}.png'],check=True)
    im=Image.open(f'fr/{i}.png').convert('RGB')
    # dark gradient behind text zone (y 330-760)
    ov=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(ov)
    for y in range(0,640):
        a=255 if y<480 else int(255*max(0,1-(y-480)/170))
        d.line([(0,y),(1080,y)],fill=(12,12,22,a))
    im=Image.alpha_composite(im.convert('RGBA'),ov).convert('RGB')
    d=ImageDraw.Draw(im)
    F=ImageFont.truetype('/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf',128)
    lines=m['thumb_text'].split('\n')
    y=250-len(lines)*80
    for ln in lines:
        w=d.textlength(ln,font=F)
        while w>980:
            F2=ImageFont.truetype('/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf',int(F.size*980/w)); F=F2; w=d.textlength(ln,font=F)
        x=(1080-w)/2
        d.text((x,y),ln,font=F,fill=(255,236,64),stroke_width=10,stroke_fill=(15,15,15))
        y+=165
    im.save(f'th/{i}.jpg',quality=90)
print('done')
