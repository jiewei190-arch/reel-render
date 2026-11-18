import subprocess,sys,numpy as np
v=sys.argv[1]
p=subprocess.run(["ffmpeg","-v","error","-i",v,"-vf","scale=270:480","-f","rawvideo","-pix_fmt","rgb24","-"],capture_output=True,check=True)
c=np.frombuffer(p.stdout,np.uint8).reshape(-1,480,270,3)
band=c[:,int(0.55*480):int(0.8*480)]
w=band.min(axis=3)>246
out=[]
for i in range(len(w)):
    cols=w[i].any(axis=0)
    if cols.any():
        l=np.argmax(cols); r=269-(len(cols)-1-np.argmax(cols[::-1]))
        if min(l,r)/270<0.06: out.append((i,round(min(l,r)/270*100,1)))
print(out[:60], len(out))
